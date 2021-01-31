import { Resolver, Query, Args } from '@nestjs/graphql'
import { CourseService } from './course.service'

@Resolver('Course')
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query('courses')
  findAll() {
    return this.courseService.findAll()
  }

  @Query('course')
  findOne(@Args('id') id: number) {
    return this.courseService.findOne(id)
  }
}
