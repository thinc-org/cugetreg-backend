import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ReviewService } from './review.service'
import { StudyProgram } from '@thinc-org/chula-courses'
import { CreateReviewInput, Review } from 'src/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { CurrentUser } from 'src/common/decorators/currentUser.decorator'
import { AccessTokenPayload } from 'src/auth/auth.dto'
import { AllowUnauthorized } from 'src/common/decorators/allowUnauthorized.decorator'

@Resolver('Review')
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @AllowUnauthorized()
  @Query('reviews')
  async find(
    @Args('courseNo') courseNo: string,
    @Args('studyProgram') studyProgram: StudyProgram,
    @CurrentUser() user: AccessTokenPayload
  ): Promise<Review[]> {
    return this.reviewService.find(courseNo, studyProgram, user?._id)
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
    @Args('reviewId') reviewId: string,
    @CurrentUser() user: AccessTokenPayload
  ) {
    return this.reviewService.remove(reviewId, user._id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('likeReview')
  async like(
    @Args('reviewId') reviewId: string,
    @CurrentUser() user: AccessTokenPayload
  ): Promise<Review> {
    return this.reviewService.like(reviewId, user._id)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('dislikeReview')
  async dislike(
    @Args('reviewId') reviewId: string,
    @CurrentUser() user: AccessTokenPayload
  ): Promise<Review> {
    return this.reviewService.dislike(reviewId, user._id)
  }
}
