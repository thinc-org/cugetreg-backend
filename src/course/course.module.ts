import { forwardRef, Module } from '@nestjs/common'
import { ReviewModule } from 'src/review/review.module'
import { CourseResolver } from './course.resolver'
import { CourseService } from './course.service'

@Module({
  imports: [forwardRef(() => ReviewModule)],
  providers: [CourseResolver, CourseService],
  exports: [CourseService],
})
export class CourseModule {}
