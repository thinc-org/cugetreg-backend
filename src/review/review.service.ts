import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { StudyProgram } from '@thinc-org/chula-courses'
import { Model, Types } from 'mongoose'
import {
  CreateReviewInput,
  EditReviewInput,
  Interaction as GraphQLInteraction,
  Review,
  Status,
  StudyProgram as GraphQLStudyProgram,
} from 'src/graphql'
import { Interaction, ReviewDocument } from 'src/schemas/review.schema'

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('review') private reviewModel: Model<ReviewDocument>
  ) {}

  async getReviews(): Promise<ReviewDocument[]> {
    const reviews = await this.reviewModel.find()
    return reviews
  }

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
      ownerId: new Types.ObjectId(userId),
      courseNo,
      semester,
      academicYear,
      studyProgram,
      rating,
      content,
      status: 'PENDING',
    })

    return this.transformReview(await newReview.save(), userId)
  }

  async find(
    courseNo: string,
    studyProgram: StudyProgram,
    userId: string,
    filterEmpty: boolean
  ): Promise<Review[]> {
    const reviews = await this.reviewModel.find({ courseNo, studyProgram })
    return reviews
      .filter(
        (review) =>
          review.status === 'APPROVED' && (!filterEmpty || review.content)
      )
      .map((rawReview) => this.transformReview(rawReview, userId))
  }

  async getPending(): Promise<Review[]> {
    const reviews = await this.reviewModel.find({ status: 'PENDING' })
    return reviews.map((rawReview) => this.transformReview(rawReview, null))
  }

  async getPendingForUser(
    courseNo: string,
    studyProgram: StudyProgram,
    userId: string
  ): Promise<Review[]> {
    const reviews = await this.reviewModel.find({
      ownerId: userId,
      courseNo,
      studyProgram,
      status: 'PENDING',
    })
    return reviews.map((rawReview) => this.transformReview(rawReview, null))
  }

  async editReview(
    reviewId: string,
    reviewInput: EditReviewInput,
    userId: string
  ): Promise<Review> {
    const review = await this.reviewModel.findById(reviewId)
    if (review.status !== 'PENDING') {
      throw new BadRequestException({
        reason: 'INVALID_STATUS',
        message: 'Only PENDING status is supported',
      })
    }
    if (!review.ownerId.equals(userId)) {
      throw new BadRequestException({
        reason: 'INVALID_USER',
        message: 'Only the owner of the review can edit it',
      })
    }
    const newReview = await this.reviewModel.findByIdAndUpdate(
      reviewId,
      {
        $set: reviewInput,
      },
      { new: true }
    )
    return this.transformReview(newReview, userId)
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

  async approve(reviewId: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findByIdAndUpdate(reviewId, {
      $set: {
        status: 'APPROVED',
      },
    })
    if (!review) {
      throw new NotFoundException({
        reason: 'REVIEW_NOT_FOUND',
        message: `Error approving review ${reviewId}: Review not found`,
      })
    }
    return review
  }

  async reject(reviewId: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findByIdAndDelete(reviewId)
    if (!review) {
      throw new NotFoundException({
        reason: 'REVIEW_NOT_FOUND',
        message: `Error approving review ${reviewId}: Review not found`,
      })
    }
    return review
  }

  // TODO: hide reviews?

  async setStatus(reviewId: string, status: Status): Promise<string> {
    if (status === 'APPROVED') {
      await this.approve(reviewId)
    } else if (status === 'REJECTED') {
      await this.reject(reviewId)
    } else {
      throw new BadRequestException({
        reason: 'INVALID_STATUS',
        message: 'Only APPROVED and REJECTED status is supported',
      })
    }

    return 'Review status updated successfully'
  }

  async setInteraction(
    reviewId: string,
    interaction: Interaction,
    userId: string
  ): Promise<Review> {
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
        userId: new Types.ObjectId(userId),
        type: interaction,
      })
    } else if (review.interactions[index].type === interaction) {
      review.interactions[index].remove()
    } else {
      review.interactions[index].set('type', interaction)
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
      myInteraction: interactionType as GraphQLInteraction,
    }
  }
}
