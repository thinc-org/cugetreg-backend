import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewResolver } from './review.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { ReviewSchema } from 'src/schemas/review.schema'
import { ConfigService } from '@nestjs/config'
import { CourseModule } from 'src/course/course.module'
import { ReviewCron } from './review.cron'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'review', schema: ReviewSchema }]),
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: 'https://api.airtable.com/v0/appDUOJ3KIOgYiYZy/Reviews',
        headers: {
          Authorization: `Bearer ${configService.get<string>(
            'airtableApiKey'
          )}`,
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => CourseModule),
  ],
  providers: [ReviewResolver, ReviewService, ReviewCron],
  exports: [ReviewService],
})
export class ReviewModule {}
