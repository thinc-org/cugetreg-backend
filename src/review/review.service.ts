import { ConflictException, Injectable } from '@nestjs/common'
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
      userId,
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
      userId: Types.ObjectId(userId),
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

  remove(reviewId: string, userId: string) {
    return `This action removes a #${reviewId} review`
  }

  like(reviewId: string, userId: string) {
    return `like!`
  }

  dislike(reviewId: string, userId: string) {
    return `dislike!`
  }

  private transformReview(rawReview: ReviewDocument, userId: string): Review {
    return {
      rating: rawReview.rating,
      courseNo: rawReview.courseNo,
      semester: rawReview.semester,
      academicYear: rawReview.academicYear,
      studyProgram: rawReview.studyProgram as GraphQLStudyProgram,
      content: rawReview.content,
      likeCount: rawReview.likes.length,
      dislikeCount: rawReview.dislikes.length,
      hasLiked: userId
        ? rawReview.likes.includes(Types.ObjectId(userId))
        : false,
      hasDisliked: userId
        ? rawReview.dislikes.includes(Types.ObjectId(userId))
        : false,
    }
  }
}
