import { Resolver, Query, Args } from '@nestjs/graphql'
import { Course, Semester } from '@thinc-org/chula-courses'
import { CourseGroupInput, FilterInput } from 'src/graphql'
import { CourseService } from './course.service'

@Resolver('Course')
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query('courses')
  findAll(): Course[] {
    return this.courseService.findAll()
  }

  @Query('course')
  findOne(
    @Args('courseNo') courseNo: string,
    @Args('courseGroup')
    { semester, academicYear, studyProgram }: CourseGroupInput
  ): Course {
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
}
