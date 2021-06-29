import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { StudyProgram } from '@thinc-org/chula-courses'
import { JwtAuthGuard, JwtAuthGuardOptional } from 'src/auth/jwt.guard'
import { CurrentUser } from 'src/common/decorators/currentUser.decorator'
import { CreateReviewInput, Review } from 'src/graphql'
import { Interaction } from 'src/schemas/review.schema'
import { ReviewService } from './review.service'

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
    return this.reviewService.find(courseNo, studyProgram, userId, true)
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
  @Mutation('setInteraction')
  async like(
    @Args('reviewId') reviewId: string,
    @Args('interaction') interaction: Interaction,
    @CurrentUser() userId: string
  ): Promise<Review> {
    return this.reviewService.setInteraction(reviewId, interaction, userId)
  }
}
