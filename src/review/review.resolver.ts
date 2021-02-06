import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ReviewService } from './review.service'
import { StudyProgram } from '@thinc-org/chula-courses'
import { CreateReviewInput } from 'src/graphql'

@Resolver('Review')
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Query('review')
  findOne(
    @Args('courseNo') courseNo: string,
    @Args('studyProgram') studyProgram: StudyProgram
  ) {
    return this.reviewService.find(courseNo, studyProgram)
  }

  @Mutation('createReview')
  create(@Args('createReviewInput') createReviewInput: CreateReviewInput) {
    return this.reviewService.create(createReviewInput)
  }

  @Mutation('removeReview')
  remove(@Args('id') id: string) {
    return this.reviewService.remove(id)
  }
}
