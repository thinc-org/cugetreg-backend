import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewResolver } from './review.resolver'

@Module({
  providers: [ReviewResolver, ReviewService],
})
export class ReviewModule {}
