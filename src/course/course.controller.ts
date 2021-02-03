import { BadRequestException, Controller, Post, Query } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CourseService } from './course.service'

@Controller('course')
export class CourseController {
  constructor(
    private courseService: CourseService,
    private configService: ConfigService
  ) {}

  @Post('refresh')
  async refresh(@Query('secret') secret: string): Promise<void> {
    if (typeof secret === 'undefined') {
      throw new BadRequestException({
        reason: 'SECRET_UNDEFINED',
        message: 'Refresh secret is undefined.',
      })
    }
    if (secret !== this.configService.get<string>('refreshSecret')) {
      throw new BadRequestException({
        reason: 'SECRET_INVALID',
        message: 'Refresh secret is incorrect.',
      })
    }
    this.courseService.refresh()
  }
}
