import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { CourseModule } from 'src/course/course.module'
import { ReviewSchema } from 'src/schemas/review.schema'
import { ReviewCron } from './review.cron'
import { ReviewResolver } from './review.resolver'
import { ReviewService } from './review.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'review', schema: ReviewSchema }]),
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('airtableReviewUrl'),
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
