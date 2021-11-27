import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Cron } from '@nestjs/schedule'
import { Semester, StudyProgram } from '@thinc-org/chula-courses'
import { FilterQuery, Model } from 'mongoose'
import { Course } from 'src/common/types/course.type'
import { CourseGroupInput, FilterInput } from 'src/graphql'
import { ReviewService } from 'src/review/review.service'
import { CourseDocument } from 'src/schemas/course.schema'

@Injectable()
export class CourseService implements OnApplicationBootstrap {
  private ratings: Record<StudyProgram, Record<string, string>> = {
    S: {},
    T: {},
    I: {},
  }
  private logger = new Logger(CourseService.name)

  constructor(
    private reviewService: ReviewService,
    @InjectModel('course') private courseModel: Model<CourseDocument>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.refresh()
  }

  // Every 30 minutes
  @Cron('0 */30 * * * *')
  async refresh(): Promise<void> {
    // refresh review ratings
    const reviewsList = await this.reviewService.getReviews()
    const ratings: Record<StudyProgram, Record<string, number[]>> = {
      S: {},
      T: {},
      I: {},
    }
    for (const review of reviewsList) {
      if (!(review.courseNo in ratings[review.studyProgram])) {
        ratings[review.studyProgram][review.courseNo] = []
      }
      ratings[review.studyProgram][review.courseNo].push(review.rating)
    }
    for (const studyProgram in ratings) {
      for (const courseNo in ratings[studyProgram]) {
        this.ratings[studyProgram][courseNo] = findAvgRating(
          ratings[studyProgram][courseNo]
        )
      }
    }
    this.logger.log(`Ratings refreshed`)
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
    if (!course) {
      throw new NotFoundException({
        reason: 'COURSE_NOT_FOUND',
        message: "Can't find a course with the given properties",
      })
    }
    return this.populate(course)
  }

  async getAllCourseNos(): Promise<Record<StudyProgram, string[]>> {
    const courses = await this.courseModel.aggregate([
      {
        $group: {
          _id: { courseNo: '$courseNo', studyProgram: '$studyProgram' },
        },
      },
    ])
    const courseNos: Record<StudyProgram, string[]> = {
      S: [],
      T: [],
      I: [],
    }
    for (const course of courses) {
      courseNos[course._id.studyProgram].push(course._id.courseNo)
    }
    return courseNos
  }

  async search(
    {
      keyword = '',
      genEdTypes = [],
      dayOfWeeks = [],
      limit = 10,
      offset = 0,
      periodRange,
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

    if (periodRange) {
      const { start, end } = periodRange
      if (!isTime(start) || !isTime(end)) {
        throw new BadRequestException({
          reason: 'INVALID_PERIOD_RANGE',
          message: 'Start time or end time is invalid',
        })
      }
      if (start > end) {
        throw new BadRequestException({
          reason: 'INVALID_PERIOD_RANGE',
          message: 'Start time cannot be later than end time',
        })
      }
      query['sections.classes'] = {
        $elemMatch: {
          'period.start': { $gte: start },
          'period.end': { $lte: end },
        },
      }
    }

    const courses = await this.courseModel
      .find(query)
      .limit(limit)
      .skip(offset)
      .lean()
    return this.populateList(courses)
  }
  // warning: this method mutates the original course object with rating
  private populate(course: Course): Course {
    if (!course) {
      return null
    }

    // populate rating
    course.rating = this.ratings[course.studyProgram][course.courseNo]
    return course
  }

  private populateList(courses: Course[]): Course[] {
    for (const course of courses) {
      this.populate(course)
    }
    return courses
  }
}

function findAvgRating(ratings: number[]): string {
  let total = 0
  for (const rating of ratings) {
    total += rating
  }
  return (total / (2 * ratings.length)).toFixed(2)
}

function isTime(timeString: string): boolean {
  const timeRegex = /^\d{2}:\d{2}$/
  return timeRegex.test(timeString)
}
