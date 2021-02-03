import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { Course, getMockCourses } from '@thinc-org/chula-courses'

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

  findOne(id: number) {
    return `This action returns a #${id} course`
  }
}
