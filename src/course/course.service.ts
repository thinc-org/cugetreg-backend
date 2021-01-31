import { Injectable } from '@nestjs/common'

@Injectable()
export class CourseService {
  findAll() {
    return `This action returns all course`
  }

  findOne(id: number) {
    return `This action returns a #${id} course`
  }
}
