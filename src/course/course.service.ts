import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { getCourses, Semester, StudyProgram } from '@thinc-org/chula-courses'
import Fuse from 'fuse.js'
import { Model } from 'mongoose'
import { Course } from 'src/common/types/course.type'
import { CourseGroupInput, FilterInput } from 'src/graphql'
import { ReviewService } from 'src/review/review.service'
import { GenEdDocument } from 'src/schemas/gened.schema'
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

@Injectable()
export class CourseService implements OnApplicationBootstrap {
  private isRefreshing = false
  private courses: Course[] = []
  private fuse = new Fuse([] as Course[], fuseOptions)
  private logger = new Logger(CourseService.name)

  constructor(
    @Inject(forwardRef(() => ReviewService))
    private reviewService: ReviewService,
    @InjectModel('gened') private genEdModel: Model<GenEdDocument>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.refresh()
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

    const documents = await this.genEdModel.find()
    const genEdTypeMap: Record<string, GenEdDocument> = {}
    for (const document of documents) {
      genEdTypeMap[document.courseNo] = document
    }

    this.courses = (await getCourses()) as Course[]

    for (const course of this.courses) {
      if (course.courseNo in genEdTypeMap) {
        course.genEdType = genEdTypeMap[course.courseNo].genEdType
        for (const section of course.sections) {
          section.genEdType = genEdTypeMap[course.courseNo]?.sections.includes(
            section.sectionNo
          )
            ? genEdTypeMap[course.courseNo].genEdType
            : 'NO'
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

  findAll(): Course[] {
    return this.courses
  }

  findOne(
    courseNo: string,
    semester: Semester,
    academicYear: string,
    studyProgram: StudyProgram
  ): Course {
    const results = this.fuse.search({
      $and: [
        { courseNo: `=${courseNo}` },
        { semester: `=${semester}` },
        { academicYear: `=${academicYear}` },
        { studyProgram: `=${studyProgram}` },
      ],
    })
    if (results.length === 0) {
      throw new NotFoundException({
        reason: 'COURSE_NOT_FOUND',
        message: 'Cannot find a course that match the given properties',
      })
    }

    return results[0].item
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
    const expressions = []
    if (keyword) {
      expressions.push({
        $or: [
          { courseNo: `^${keyword}` },
          { abbrName: `'${keyword}` },
          { courseNameTh: `'${keyword}` },
          { courseNameEn: `'${keyword}` },
        ],
      })
    }
    if (genEdTypes.length > 0) {
      expressions.push({
        genEdType: genEdTypes.map((genEdType) => `=${genEdType}`).join(' | '),
      })
    }
    if (dayOfWeeks.length > 0) {
      expressions.push({
        'sections.classes.dayOfWeek': dayOfWeeks
          .map((dayOfWeek) => `=${dayOfWeek}`)
          .join(' | '),
      })
    }
    expressions.push({
      semester: `=${semester}`,
      academicYear: `=${academicYear}`,
      studyProgram: `=${studyProgram}`,
    })
    const results = this.fuse
      .search(
        {
          $and: expressions,
        },
        { limit: offset + limit }
      )
      .splice(offset, limit)
      .map((result) => result.item)

    // TODO: Populate search results with average ratings

    return results
  }
}
