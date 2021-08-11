import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common'
import { Request } from 'express'
import { TokenPayload } from 'google-auth-library'
import { validate } from 'jsonschema'
import { hostname } from 'os'
import { ClientLoggingService, GelfLogEntry } from './clientlogging.service'
import { GoogleIdTokenService } from './googleidtoken.service'

class ClientLogDto {
  kind: string
  message: string
  detail?: string
  accessToken?: string
  deviceId: string
  sessionId: string
  additionalData?: Record<string, string>
}

const clientLogDtoArraySchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      kind: {
        type: 'string',
      },
      message: {
        type: 'string',
      },
      detail: {
        type: 'string',
      },
      accessToken: {
        type: 'string',
      },
      deviceId: {
        type: 'string',
      },
      sessionId: {
        type: 'string',
      },
      additionalData: {
        type: 'object',
        patternProperties: {
          '^[\\w\\.\\-]*$': { type: 'string' },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
    required: ['kind', 'message', 'deviceId', 'sessionId'],
  },
}

@Controller('clientlogging')
export class ClientLoggingController {
  constructor(
    readonly loggingService: ClientLoggingService,
    readonly googleIdTokenService: GoogleIdTokenService
  ) {}

  @Post()
  async postClientLog(@Body() dtos: ClientLogDto[], @Req() req: Request) {
    const validationRes = validate(dtos, clientLogDtoArraySchema)
    if (!validationRes.valid) {
      throw new BadRequestException(validationRes.errors.toString())
    }

    for (const dto of dtos) {
      let accessToken: TokenPayload | null = null
      if (dto.accessToken) {
        try {
          accessToken = await this.googleIdTokenService.verify(dto.accessToken)
        } catch (e) {
          accessToken = null
          console.error('Failed to validate accesstoken for clientlogging', e)
        }
      }

      const logEntry: GelfLogEntry & Record<string, string> = {
        version: '1.1',
        host: hostname(),
        short_message: dto.message,
        full_message: dto.detail,
        _kind: dto.kind,
        _app: 'frontend-client',
        _source_ip: req.ip,
        _google_id: accessToken?.sub || undefined,
        _google_name: accessToken?.name || undefined,
        _google_email: accessToken?.email || undefined,
        _session_id: dto.sessionId,
        _device_id: dto.deviceId,
      }

      if (dto.additionalData)
        Object.entries(dto.additionalData).forEach(
          ([k, v]) => (logEntry[`_a_${k}`] = v)
        )

      await this.loggingService.sendLogEntry(logEntry)
    }
  }
}
