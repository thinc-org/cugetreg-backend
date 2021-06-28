import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AccessTokenPayload } from 'src/auth/auth.dto'
import { ClientLoggingService, GelfLogEntry } from './clientlogging.service'
import { Request } from 'express'
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { hostname } from 'os'
import { Type } from 'class-transformer'
import { validate, Validator } from 'jsonschema'

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
    readonly service: ClientLoggingService,
    readonly jwt: JwtService
  ) {}

  @Post()
  async postClientLog(@Body() dtos: ClientLogDto[], @Req() req: Request) {
    let accessToken: AccessTokenPayload | null = null

    const validationRes = validate(dtos, clientLogDtoArraySchema)
    if (!validationRes.valid) {
      throw new BadRequestException(validationRes.errors.toString())
    }

    for (const dto of dtos) {
      if (dto.accessToken) {
        try {
          accessToken = this.jwt.verify<AccessTokenPayload>(dto.accessToken)
        } catch (e) {
          accessToken = null
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
        _user_id: accessToken?._id,
        _session_id: dto.sessionId,
        _device_id: dto.deviceId,
      }

      if (dto.additionalData)
        Object.entries(dto.additionalData).forEach(
          ([k, v]) => (logEntry[`_a_${k}`] = v)
        )

      await this.service.sendLogEntry(logEntry)
    }
  }
}
