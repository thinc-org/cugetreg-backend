import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ReviewService } from './review.service'
import { StudyProgram } from '@thinc-org/chula-courses'
import { CreateReviewInput, Review } from 'src/graphql'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard, JwtAuthGuardOptional } from 'src/auth/jwt.guard'
import { CurrentUser } from 'src/common/decorators/currentUser.decorator'

@Resolver('Review')
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuardOptional)
  @Query('reviews')
  async find(
    @Args('courseNo') courseNo: string,
    @Args('studyProgram') studyProgram: StudyProgram,
    @CurrentUser() userId: string
  ): Promise<Review[]> {
    return this.reviewService.find(courseNo, studyProgram, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('createReview')
  async create(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
    @CurrentUser() userId: string
  ): Promise<Review> {
    return this.reviewService.create(createReviewInput, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('removeReview')
  async remove(
    @Args('reviewId') reviewId: string,
    @CurrentUser() userId: string
  ): Promise<Review> {
    return this.reviewService.remove(reviewId, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('likeReview')
  async like(
    @Args('reviewId') reviewId: string,
    @CurrentUser() userId: string
  ): Promise<Review> {
    return this.reviewService.like(reviewId, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Mutation('dislikeReview')
  async dislike(
    @Args('reviewId') reviewId: string,
    @CurrentUser() userId: string
  ): Promise<Review> {
    return this.reviewService.dislike(reviewId, userId)
  }
}
