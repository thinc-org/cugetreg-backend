import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { StudyProgram } from '@thinc-org/chula-courses'
import { Model, Types } from 'mongoose'
import { CreateReviewInput, Review } from 'src/graphql'
import { ReviewDocument } from 'src/schemas/review.schema'
import { StudyProgram as GraphQLStudyProgram } from 'src/graphql'

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('review') private reviewModel: Model<ReviewDocument>
  ) {}

  async create(
    {
      courseNo,
      semester,
      academicYear,
      studyProgram,
      rating,
      content,
    }: CreateReviewInput,
    userId: string
  ): Promise<Review> {
    const review = await this.reviewModel.findOne({
      ownerId: userId,
      courseNo,
      studyProgram,
    })
    if (review) {
      throw new ConflictException({
        reason: 'DUPLICATE_REVIEW',
        message: 'User already created a review for this course.',
      })
    }

    const newReview = new this.reviewModel({
      ownerId: Types.ObjectId(userId),
      courseNo,
      semester,
      academicYear,
      studyProgram,
      rating,
      content,
    })

    return this.transformReview(await newReview.save(), userId)
  }

  async find(
    courseNo: string,
    studyProgram: StudyProgram,
    userId: string
  ): Promise<Review[]> {
    const reviews = await this.reviewModel.find({ courseNo, studyProgram })
    return reviews.map((rawReview) => this.transformReview(rawReview, userId))
  }

  async remove(reviewId: string, userId: string): Promise<Review> {
    const review = await this.reviewModel.findOneAndDelete({
      _id: reviewId,
      ownerId: userId,
    })
    if (!review) {
      throw new NotFoundException({
        reason: 'REVIEW_NOT_FOUND',
        message: `Either the review does not exist or the user is not the owner of the review`,
      })
    }
    return this.transformReview(review, userId)
  }

  async like(reviewId: string, userId: string): Promise<Review> {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException({
        reason: 'REVIEW_NOT_FOUND',
        message: 'Review with the given id does not exist.',
      })
    }

    const index = review.interactions.findIndex((interaction) =>
      interaction.userId.equals(userId)
    )
    if (index === -1) {
      review.interactions.push({
        userId: Types.ObjectId(userId),
        type: 'L',
      })
    } else if (review.interactions[index].type === 'L') {
      review.interactions[index].remove()
    } else {
      review.interactions[index].set('type', 'L')
    }

    await review.save()
    return this.transformReview(review, userId)
  }

  async dislike(reviewId: string, userId: string) {
    const review = await this.reviewModel.findById(reviewId)
    if (!review) {
      throw new NotFoundException({
        reason: 'REVIEW_NOT_FOUND',
        message: 'Review with the given id does not exist.',
      })
    }

    const index = review.interactions.findIndex((interaction) =>
      interaction.userId.equals(userId)
    )
    if (index === -1) {
      review.interactions.push({
        userId: Types.ObjectId(userId),
        type: 'D',
      })
    } else if (review.interactions[index].type === 'D') {
      review.interactions[index].remove()
    } else {
      review.interactions[index].set('type', 'D')
    }

    await review.save()
    return this.transformReview(review, userId)
  }

  private transformReview(rawReview: ReviewDocument, userId: string): Review {
    const likeCount = rawReview.interactions.filter(
      (interaction) => interaction.type === 'L'
    ).length
    const dislikeCount = rawReview.interactions.length - likeCount
    const interactionType = rawReview.interactions.find((interaction) =>
      interaction.userId.equals(userId)
    )?.type
    return {
      _id: rawReview._id,
      rating: rawReview.rating,
      courseNo: rawReview.courseNo,
      semester: rawReview.semester,
      academicYear: rawReview.academicYear,
      studyProgram: rawReview.studyProgram as GraphQLStudyProgram,
      content: rawReview.content,
      likeCount: likeCount,
      dislikeCount: dislikeCount,
      hasLiked: interactionType ? interactionType === 'L' : false,
      hasDisliked: interactionType ? interactionType === 'D' : false,
    }
  }
}
