import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common'
import {
  Course,
  getMockCourses,
  Semester,
  StudyProgram,
} from '@thinc-org/chula-courses'
import Fuse from 'fuse.js'
import { FilterInput } from 'src/graphql'

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
  private courses: Course[] = []
  private fuse = new Fuse([] as Course[], fuseOptions)

  async onApplicationBootstrap(): Promise<void> {
    await this.refresh()
  }

  async refresh(): Promise<void> {
    this.courses = await getMockCourses()
    const fuseIndex = Fuse.createIndex(fuseOptions.keys, this.courses)
    this.fuse.setCollection(this.courses, fuseIndex)
    console.log(`${new Date().toISOString()} -  Course data refreshed`)
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

  async search({ keyword, genEdTypes, dayOfWeeks, noConflict }: FilterInput) {
    const expressions = []
    if (keyword) {
      expressions.push({
        $or: [
          { courseNo: `'${keyword}` },
          { abbrName: `'${keyword}` },
          { courseNameTh: `'${keyword}` },
          { courseNameEn: `'${keyword}` },
        ],
      })
    }
    if (genEdTypes && genEdTypes.length > 0) {
      expressions.push({
        genEdType: genEdTypes.map((genEdType) => `=${genEdType}`).join(' | '),
      })
    }
    if (dayOfWeeks && dayOfWeeks.length > 0) {
      expressions.push({
        'sections.classes.dayOfWeek': dayOfWeeks
          .map((dayOfWeek) => `=${dayOfWeek}`)
          .join(' | '),
      })
    }
    if (expressions.length === 0) {
      return this.findAll()
    }
    const results = this.fuse.search({
      $and: expressions,
    })

    return results.map((result) => result.item)
  }
}
