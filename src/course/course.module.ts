import { forwardRef, Module } from '@nestjs/common'
import { CourseService } from './course.service'
import { CourseResolver } from './course.resolver'
import { CourseController } from './course.controller'
import { ReviewModule } from 'src/review/review.module'

@Module({
  imports: [forwardRef(() => ReviewModule)],
  providers: [CourseResolver, CourseService],
  controllers: [CourseController],
  exports: [CourseService],
})
export class CourseModule {}
