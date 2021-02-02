import { Module } from '@nestjs/common'
import { CourseService } from './course.service'
import { CourseResolver } from './course.resolver'
import { CourseController } from './course.controller'

@Module({
  providers: [CourseResolver, CourseService],
  controllers: [CourseController],
})
export class CourseModule {}
