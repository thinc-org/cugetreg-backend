import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import {
  GenEdType,
  Section,
  Semester,
  StudyProgram,
} from '@thinc-org/chula-courses'
import Fuse from 'fuse.js'
import { FilterQuery, Model } from 'mongoose'
import { Course } from 'src/common/types/course.type'
import { CourseGroupInput, FilterInput } from 'src/graphql'
import { OverrideService } from 'src/override/override.service'
import { ReviewService } from 'src/review/review.service'
import { CourseDocument } from 'src/schemas/course.schema'
import { Override } from 'src/schemas/override.schema'
import { findAvgRating } from 'src/util/functions'

const fuseOptions = {
  useExtendedSearch: true,
  shouldSort: true,
  keys: [
    { name: 'courseNo', weight: 3 },
    { name: 'semester', weight: 1 },
    { name: 'academicYear', weight: 1 },
    { name: 'studyProgram', weight: 1 },
    { name: 'abbrName', weight: 2 },
    { name: 'courseNameTh', weight: 1 },
    { name: 'courseNameEn', weight: 1 },
    { name: 'genEdType', weight: 1 },
    { name: 'sections.classes.dayOfWeek', weight: 1 },
  ],
}

function getGenEdType(section: Section): GenEdType {
  if (section.note === undefined) return 'NO'
  if (section.note.includes('GENED')) {
    const result = section.note.match(/GENED-(\w+)/)
    if (result == null) {
      return 'NO'
    }
    if (['SO', 'SC', 'HU', 'IN'].includes(result[1])) {
      return <GenEdType>result[1]
    }
    // edge case
    if (['SCI', 'SCIENCE'].includes(result[1])) {
      return 'SC'
    }
    return 'NO'
  }
  return 'NO'
}

@Injectable()
export class CourseService implements OnApplicationBootstrap {
  private isRefreshing = false
  private courses: Course[] = []
  private fuse = new Fuse([] as Course[], fuseOptions)
  private logger = new Logger(CourseService.name)

  constructor(
    @Inject(forwardRef(() => ReviewService))
    private reviewService: ReviewService,
    private overrideService: OverrideService,
    @InjectModel('course') private courseModel: Model<CourseDocument>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // await this.refresh()
  }

  getIsRefreshing(): boolean {
    return this.isRefreshing
  }

  async refresh(): Promise<void> {
    if (this.isRefreshing) {
      throw new ConflictException('Course is already refreshing. Rejected.')
    }
    this.isRefreshing = true
    this.logger.log(`Fetching courses...`)

    const overrides = await this.overrideService.getOverrides()
    const overridesMap: Record<string, Override> = {}
    for (const override of overrides) {
      overridesMap[override.courseNo] = override
    }
    this.courses = await this.courseModel.find().lean()

    for (const course of this.courses) {
      const override = overridesMap[course.courseNo]
      if (override) {
        this.applyOverride(course, override)
      } else {
        for (const section of course.sections) {
          section.genEdType = getGenEdType(section)
        }
      }
      const reviews = await this.reviewService.find(
        course.courseNo,
        course.studyProgram,
        null,
        false
      )
      if (reviews.length > 0) {
        course.rating = findAvgRating(reviews)
      }
    }

    const fuseIndex = Fuse.createIndex(fuseOptions.keys, this.courses)
    this.fuse.setCollection(this.courses, fuseIndex)
    this.logger.log(`Course data refreshed - ${this.courses.length} courses`)
    this.isRefreshing = false
  }

  applyOverride(course: Course, override: Override) {
    if (override.genEd) {
      const { genEdType, sections: genEdSections } = override.genEd
      course.genEdType = genEdType
      for (const section of course.sections) {
        section.genEdType = genEdSections.includes(section.sectionNo)
          ? override.genEd.genEdType
          : 'NO'
      }
    }
  }

  async findOne(
    courseNo: string,
    semester: Semester,
    academicYear: string,
    studyProgram: StudyProgram
  ): Promise<Course> {
    const result = await this.courseModel
      .findOne({ courseNo, semester, academicYear, studyProgram })
      .lean()
    return result
  }

  async search(
    {
      keyword = '',
      genEdTypes = [],
      dayOfWeeks = [],
      limit = 10,
      offset = 0,
    }: FilterInput,
    { semester, academicYear, studyProgram }: CourseGroupInput
  ): Promise<Course[]> {
    const query = {
      semester,
      academicYear,
      studyProgram,
    } as FilterQuery<CourseDocument>
    keyword = keyword.trim()
    if (keyword) {
      query.$or = [
        { courseNo: new RegExp('^' + keyword, 'i') },
        { abbrName: new RegExp(keyword, 'i') },
        { courseNameTh: new RegExp(keyword, 'i') },
        { courseNameEn: new RegExp(keyword, 'i') },
      ]
    }
    if (genEdTypes.length > 0) {
      query.genEdType = { $in: genEdTypes }
    }
    if (dayOfWeeks.length > 0) {
      query['sections.classes.dayOfWeek'] = { $in: dayOfWeeks }
    }

    const result = await this.courseModel
      .find(query)
      .limit(limit)
      .skip(offset)
      .lean()
    return result
  }
}
