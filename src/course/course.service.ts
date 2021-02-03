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

const fuseOptions = {
  useExtendedSearch: true,
  keys: ['courseNo', 'semester', 'academicYear', 'studyProgram'],
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
    this.courses.sort((course1, course2) =>
      course1.courseNo.localeCompare(course2.courseNo)
    )
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
}
