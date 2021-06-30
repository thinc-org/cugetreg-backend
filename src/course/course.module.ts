import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ReviewModule } from 'src/review/review.module'
import { GenEdSchema } from 'src/schemas/gened.schema'
import { CourseResolver } from './course.resolver'
import { CourseService } from './course.service'

@Module({
  imports: [
    forwardRef(() => ReviewModule),
    MongooseModule.forFeature([{ name: 'gened', schema: GenEdSchema }]),
  ],
  providers: [CourseResolver, CourseService],
  exports: [CourseService],
})
export class CourseModule {}
