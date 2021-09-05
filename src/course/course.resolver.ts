import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Course, Semester } from '@thinc-org/chula-courses'
import { AdminAuthGuard } from 'src/auth/admin.guard'
import { CourseGroupInput, FilterInput } from 'src/graphql'
import { CourseService } from './course.service'

@Resolver('Course')
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query('course')
  findOne(
    @Args('courseNo') courseNo: string,
    @Args('courseGroup')
    { semester, academicYear, studyProgram }: CourseGroupInput
  ): Promise<Course> {
    return this.courseService.findOne(
      courseNo,
      semester as Semester,
      academicYear,
      studyProgram
    )
  }

  @Query('search')
  async search(
    @Args('filter') filter: FilterInput,
    @Args('courseGroup') courseGroup: CourseGroupInput
  ): Promise<Course[]> {
    return this.courseService.search(filter, courseGroup)
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('refresh')
  async refresh(): Promise<string> {
    this.courseService.refresh()
    return 'Refreshed course overrides.'
  }
}
