import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ReviewService } from './review.service'
import { StudyProgram } from '@thinc-org/chula-courses'
import { CreateReviewInput, Review } from 'src/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { CurrentUser } from 'src/common/decorators/currentUser.decorator'
import { AccessTokenPayload } from 'src/auth/auth.dto'

@Resolver('Review')
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Query('review')
  find(
    @Args('courseNo') courseNo: string,
    @Args('studyProgram') studyProgram: StudyProgram
  ) {
    return this.reviewService.find(courseNo, studyProgram)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('createReview')
  async create(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
    @CurrentUser() user: AccessTokenPayload
  ): Promise<Review> {
    return this.reviewService.create(createReviewInput, user._id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('removeReview')
  remove(
    @Args('id') reviewId: string,
    @CurrentUser() user: AccessTokenPayload
  ) {
    return this.reviewService.remove(reviewId, user._id)
  }
}
