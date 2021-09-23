import { HttpService } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Args, Query, Resolver } from '@nestjs/graphql'
import { CourseEntry, CourseEntryInput } from 'src/graphql'

@Resolver('Computation')
export class ComputationResolver {
  computationHost: string

  constructor(
    readonly httpService: HttpService,
    readonly configService: ConfigService
  ) {
    this.computationHost = configService.get('computationBackendUrl')
  }

  @Query('recommendCourses')
  async recommendCourses(
    @Args('selectedCourse') selectedCourse: CourseEntryInput[]
  ): Promise<CourseEntry[]> {
    const resp = await this.httpService
      .post(`${this.computationHost}/api/suggest/courses`, { selectedCourse })
      .toPromise()
    return resp.data.suggestions
  }
}
