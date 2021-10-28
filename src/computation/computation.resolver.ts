import { HttpService } from '@nestjs/common'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { CourseEntry, CourseEntryInput } from 'src/graphql'

@Resolver('Computation')
export class ComputationResolver {
  constructor(readonly computationClient: HttpService) {}

  @Query('recommendCourses')
  async recommendCourses(
    @Args('selectedCourses') selectedCourses: CourseEntryInput[]
  ): Promise<CourseEntry[]> {
    const resp = await this.computationClient
      .post('/api/suggest/courses', { selectedCourses })
      .toPromise()
    return resp.data.suggestions
  }
}
