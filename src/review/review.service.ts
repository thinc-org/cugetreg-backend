import {
  ConflictException,
  forwardRef,
  HttpService,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Semester, StudyProgram } from '@thinc-org/chula-courses'
import { Model, Types } from 'mongoose'
import { CourseService } from 'src/course/course.service'
import {
  CreateReviewInput,
  Interaction as GraphQLInteraction,
  Review,
  StudyProgram as GraphQLStudyProgram,
} from 'src/graphql'
import { Interaction, ReviewDocument } from 'src/schemas/review.schema'

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('review') private reviewModel: Model<ReviewDocument>,
    private airtableClient: HttpService,
    @Inject(forwardRef(() => CourseService))
    private courseService: CourseService
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
      status: 'PENDING',
    })

    const abbrName = this.courseService.findOne(
      courseNo,
      semester as Semester,
      academicYear,
      studyProgram
    ).abbrName

    await this.airtableClient
      .post('/', {
        fields: {
          reviewId: newReview._id,
          status: 'Awaiting approval',
          rating: `${rating / 2}/5`,
          course: `${courseNo} ${abbrName}`,
          semester,
          studyProgram,
          academicYear,
          content,
        },
      })
      .toPromise()

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

  // TODO: hide reviews?

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
      const logger = new Logger('ReviewApproval')
      logger.error(`Error approving review ${reviewId}: Review not found`)
    }
    return review
  }

  async reject(reviewId: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findByIdAndDelete(reviewId)
    if (!review) {
      const logger = new Logger('ReviewApproval')
      logger.error(`Error rejecting review ${reviewId}: Review not found`)
    }
    return review
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
        userId: Types.ObjectId(userId),
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
