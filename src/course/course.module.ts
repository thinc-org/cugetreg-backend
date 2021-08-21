import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { OverrideModule } from 'src/override/override.module'
import { ReviewModule } from 'src/review/review.module'
import { CourseSchema } from 'src/schemas/course.schema'
import { CourseResolver } from './course.resolver'
import { CourseService } from './course.service'

@Module({
  imports: [
    forwardRef(() => ReviewModule),
    OverrideModule,
    MongooseModule.forFeature([{ name: 'course', schema: CourseSchema }]),
  ],
  providers: [CourseResolver, CourseService],
  exports: [CourseService],
})
export class CourseModule {}
