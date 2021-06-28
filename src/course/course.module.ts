import { forwardRef, Module } from '@nestjs/common'
import { CourseService } from './course.service'
import { CourseResolver } from './course.resolver'
import { ReviewModule } from 'src/review/review.module'
import { MongooseModule } from '@nestjs/mongoose'
import { GenEdTypeSchema } from 'src/schemas/gened.schema'

@Module({
  imports: [
    forwardRef(() => ReviewModule),
    MongooseModule.forFeature([{ name: 'genedtype', schema: GenEdTypeSchema }]),
  ],
  providers: [CourseResolver, CourseService],
  exports: [CourseService],
})
export class CourseModule {}
