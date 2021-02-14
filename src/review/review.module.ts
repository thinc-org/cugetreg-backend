import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewResolver } from './review.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { ReviewSchema } from 'src/schemas/review.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'review', schema: ReviewSchema }]),
  ],
  providers: [ReviewResolver, ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
