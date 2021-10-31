import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
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

@Injectable()
export class CourseService implements OnApplicationBootstrap {
  private overrides: Record<string, Override> = {}
  private ratings: Record<StudyProgram, Record<string, string>> = {
    S: {},
    T: {},
    I: {},
  }
  private logger = new Logger(CourseService.name)

  constructor(
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
    // refresh override
    const overridesList = await this.overrideService.getOverrides()
    this.overrides = {}
    for (const override of overridesList) {
      this.overrides[override.courseNo] = override
    }

    // refresh review ratings
    const reviewsList = await this.reviewService.getReviews()
    const reviews: Record<StudyProgram, Record<string, number[]>> = {
      S: {},
      T: {},
      I: {},
    }
    for (const review of reviewsList) {
      if (!(review.courseNo in reviews[review.studyProgram])) {
        reviews[review.studyProgram][review.courseNo] = []
      }
      reviews[review.studyProgram][review.courseNo].push(review.rating)
    }
    for (const studyProgram in reviews) {
      for (const courseNo in reviews[studyProgram]) {
        this.ratings[studyProgram][courseNo] = findAvgRating(
          reviews[studyProgram][courseNo]
        )
      }
    }
    this.logger.log(`Course override and ratings refreshed`)
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
          'period.start': { $lt: end },
          'period.end': { $gt: start },
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
  // warning: this method mutates the original course object with the override and rating
  private populate(course: Course): Course {
    if (!course) {
      return null
    }
    // populate override
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
    if (override?.courseDesc) {
      course.courseDesc = override.courseDesc
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

function isTime(timeString: string): boolean {
  const timeRegex = /^\d{2}:\d{2}$/
  return timeRegex.test(timeString)
}
