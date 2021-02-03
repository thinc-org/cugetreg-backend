import { Resolver, Query, Args } from '@nestjs/graphql'
import { Course, Semester, StudyProgram } from '@thinc-org/chula-courses'
import { FilterInput } from 'src/graphql'
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
    @Args('semester') semester: Semester,
    @Args('academicYear') academicYear: string,
    @Args('studyProgram') studyProgram: StudyProgram
  ): Course {
    return this.courseService.findOne(
      courseNo,
      semester,
      academicYear,
      studyProgram
    )
  }

  @Query('search')
  async search(@Args('filter') filter: FilterInput): Promise<Course[]> {
    return this.courseService.search(filter)
  }
}
