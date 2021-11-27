import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ReviewModule } from 'src/review/review.module'
import { CourseSchema } from 'src/schemas/course.schema'
import { CourseResolver } from './course.resolver'
import { CourseService } from './course.service'

@Module({
  imports: [
    ReviewModule,
    MongooseModule.forFeature([{ name: 'course', schema: CourseSchema }]),
  ],
  providers: [CourseResolver, CourseService],
  exports: [CourseService],
})
export class CourseModule {}
