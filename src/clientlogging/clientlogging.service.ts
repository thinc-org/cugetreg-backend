import {
  HttpService,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as http from 'http'
import * as https from 'https'

export interface GelfLogEntry {
  version: '1.1'
  host: string
  short_message: string
  full_message?: string
  _kind: string
  _app: 'frontend-client'
  _source_ip: string
  _user_id?: string
}

@Injectable()
export class ClientLoggingService {
  httpAg: http.Agent
  httpsAg: https.Agent

  constructor(
    readonly configService: ConfigService,
    readonly httpService: HttpService
  ) {
    this.httpAg = new http.Agent({
      keepAlive: true,
    })
    this.httpsAg = new https.Agent({
      keepAlive: true,
    })
  }

  async sendLogEntry(entry: GelfLogEntry) {
    try {
      const res = await this.httpService
        .post(this.configService.get('clientLoggerUrl'), entry, {
          httpAgent: this.httpAg,
          httpsAgent: this.httpsAg,
        })
        .toPromise()
      return res.data
    } catch (e) {
      throw new InternalServerErrorException("Can't send log to log collector")
    }
  }
}
