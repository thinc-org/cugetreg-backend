import {
  forwardRef,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron } from '@nestjs/schedule'
import {
  GenEdType,
  Section,
  Semester,
  StudyProgram,
} from '@thinc-org/chula-courses'
import { FilterQuery, Model } from 'mongoose'
import { Course } from 'src/common/types/course.type'
import { CourseGroupInput, FilterInput } from 'src/graphql'
import { OverrideService } from 'src/override/override.service'
import { ReviewService } from 'src/review/review.service'
import { CourseDocument } from 'src/schemas/course.schema'
import { Override } from 'src/schemas/override.schema'

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
  private overrides: Record<string, Override> = {}
  private logger = new Logger(CourseService.name)

  constructor(
    @Inject(forwardRef(() => ReviewService))
    private reviewService: ReviewService,
    private overrideService: OverrideService,
    @InjectModel('course') private courseModel: Model<CourseDocument>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.refresh()
  }

  // Every 30 minutes
  @Cron('0 */30 * * * *')
  async refresh(): Promise<void> {
    const overridesList = await this.overrideService.getOverrides()
    this.overrides = {}
    for (const override of overridesList) {
      this.overrides[override.courseNo] = override
    }
    this.logger.log(`Course override refreshed`)
  }

  async findOne(
    courseNo: string,
    semester: Semester,
    academicYear: string,
    studyProgram: StudyProgram
  ): Promise<Course> {
    const course = await this.courseModel
      .findOne({ courseNo, semester, academicYear, studyProgram })
      .lean()
    return this.applyOverride(course)
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

    const courses = await this.courseModel
      .find(query)
      .limit(limit)
      .skip(offset)
      .lean()
    return this.applyOverrideList(courses)
  }

  // TODO: add apply reviews

  // warning: this method mutates the original course ohject with the override
  private applyOverride(course: Course): Course {
    const override = this.overrides[course.courseNo]
    if (override?.genEd) {
      const { genEdType, sections: genEdSections } = override.genEd
      course.genEdType = genEdType
      for (const section of course.sections) {
        section.genEdType = genEdSections.includes(section.sectionNo)
          ? override.genEd.genEdType
          : 'NO'
      }
    } else {
      for (const section of course.sections) {
        section.genEdType = getGenEdType(section)
      }
    }
    return course
  }

  private applyOverrideList(courses: Course[]): Course[] {
    return courses.map(this.applyOverride)
  }
}
