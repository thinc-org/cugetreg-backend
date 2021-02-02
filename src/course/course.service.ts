import { Injectable, OnApplicationBootstrap } from '@nestjs/common'
import { Course, getMockCourses } from '@thinc-org/chula-courses'

@Injectable()
export class CourseService implements OnApplicationBootstrap {
  private courses: Course[] = []

  async onApplicationBootstrap(): Promise<void> {
    console.log('Started fetching course data...')
    this.courses = await getMockCourses()
    console.log('Finished fetching course data...')
  }

  findAll(): Course[] {
    return this.courses
  }

  findOne(id: number) {
    return `This action returns a #${id} course`
  }
}
