import { Resolver, Query, Args } from '@nestjs/graphql'
import { Semester, StudyProgram } from '@thinc-org/chula-courses'
import { CourseService } from './course.service'

@Resolver('Course')
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query('courses')
  findAll() {
    return this.courseService.findAll()
  }

  @Query('course')
  findOne(
    @Args('courseNo') courseNo: string,
    @Args('semester') semester: Semester,
    @Args('academicYear') academicYear: string,
    @Args('studyProgram') studyProgram: StudyProgram
  ) {
    return this.courseService.findOne(
      courseNo,
      semester,
      academicYear,
      studyProgram
    )
  }
}
