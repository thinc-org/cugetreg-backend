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
import { lowerBound } from 'src/util/functions'

type SearchProps = Pick<Course, 'courseNo'>

@Injectable()
export class CourseService implements OnApplicationBootstrap {
  private courses: Course[] = []

  async onApplicationBootstrap(): Promise<void> {
    await this.refresh()
  }

  async refresh(): Promise<void> {
    this.courses = await getMockCourses()
    this.courses.sort((course1, course2) =>
      course1.courseNo.localeCompare(course2.courseNo)
    )
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
    let index = lowerBound<SearchProps>(
      this.courses,
      { courseNo },
      (course1, course2) => course1.courseNo.localeCompare(course2.courseNo)
    )
    while (
      index !== null &&
      index < this.courses.length &&
      this.courses[index].courseNo === courseNo
    ) {
      const course = this.courses[index++]
      if (
        course.semester === semester &&
        course.academicYear === academicYear &&
        course.studyProgram === studyProgram
      ) {
        return course
      }
    }
    throw new NotFoundException({
      reason: 'COURSE_NOT_FOUND',
      message: 'Cannot find a course that match the given properties',
    })
  }
}
