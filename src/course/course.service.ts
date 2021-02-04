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
  keys: [
    'courseNo',
    'semester',
    'academicYear',
    'studyProgram',
    'abbrName',
    'courseNameTh',
    'courseNameEn',
    'genEdType',
    'sections.classes.dayOfWeek',
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

  async search({
    keyword = '',
    genEdTypes = [],
    dayOfWeeks = [],
    noConflict = false,
    limit = 10,
    offset = 0,
  }: FilterInput) {
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
    if (expressions.length === 0) {
      return this.findAll().slice(offset, offset + limit)
    }
    const results = this.fuse
      .search({
        $and: expressions,
      })
      .map((result) => {
        const sortScore = result.item.abbrName.indexOf(keyword)
        return {
          item: result.item,
          sortScore: sortScore !== -1 ? sortScore : Number.MAX_SAFE_INTEGER,
        }
      })
      .sort((result1, result2) => result1.sortScore - result2.sortScore)
      .slice(offset, offset + limit)
      .map((result) => result.item)

    // TODO: Filter out courses that conflicts with selected courses if noConflict === true

    return results
  }
}
