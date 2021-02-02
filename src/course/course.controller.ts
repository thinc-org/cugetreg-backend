import { Controller, Post } from '@nestjs/common'
import { CourseService } from './course.service'

@Controller('course')
export class CourseController {
  constructor(private courseService: CourseService) {}

  @Post('refresh')
  async refresh() {
    this.courseService.refresh()
  }
}
