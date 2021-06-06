import { HttpService, Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { AirtableRecord } from 'src/common/types/airtable.type'
import { ReviewDocument } from 'src/schemas/review.schema'
import { ReviewService } from './review.service'

interface AirtableResponse {
  records: AirtableRecord[]
}

@Injectable()
export class ReviewCron {
  private logger: Logger = new Logger('ReviewCron')

  constructor(
    private airtableClient: HttpService,
    private reviewService: ReviewService
  ) {}

  // Every hour
  @Cron('0 0 * * * *')
  async pullAirtable() {
    try {
      const { data } = await this.airtableClient
        .get<AirtableResponse>('/', {
          params: {
            fields: ['reviewId', 'status'],
            filterByFormula: `NOT({status} = 'Awaiting approval')`,
          },
        })
        .toPromise()
      if (data.records.length > 0) {
        const promises: Promise<ReviewDocument>[] = []
        for (const record of data.records) {
          if (record.fields.status === 'Approved') {
            promises.push(this.reviewService.approve(record.fields.reviewId))
          } else {
            promises.push(this.reviewService.reject(record.fields.reviewId))
          }
        }
        await Promise.allSettled(promises)

        await this.airtableClient
          .delete('/', {
            params: {
              records: data.records.map((record) => record.id),
            },
          })
          .toPromise()
      }
      this.logger.log(
        `Airtable cronjob finished: ${data.records.length} reviews changed.`
      )
    } catch (err) {
      this.logger.error({
        message: 'Error while sending request to Airtable',
        error: err,
      })
    }
  }
}
