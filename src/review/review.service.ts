import { Injectable } from '@nestjs/common'
import { StudyProgram } from '@thinc-org/chula-courses'
import { CreateReviewInput } from 'src/graphql'

@Injectable()
export class ReviewService {
  create(createReviewInput: CreateReviewInput) {
    return 'This action adds a new review'
  }

  find(courseNo: string, studyProgram: StudyProgram) {
    return `This action returns all review`
  }

  remove(id: string) {
    return `This action removes a #${id} review`
  }
}
