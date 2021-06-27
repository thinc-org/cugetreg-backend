import {
  Body,
  Controller,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AccessTokenPayload } from 'src/auth/auth.dto'
import { ClientLoggingService } from './clientlogging.service'
import { Request } from 'express'
import { IsOptional, IsString } from 'class-validator'

class ClientLogDto {
  @IsString()
  kind: string

  @IsString()
  message: string

  @IsOptional()
  @IsString()
  detail?: string

  @IsOptional()
  @IsString()
  accessToken?: string

  @IsString()
  deviceId: string
}

@Controller('clientlogging')
export class ClientLoggingController {
  constructor(
    readonly service: ClientLoggingService,
    readonly jwt: JwtService
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  postClientLog(@Body() dto: ClientLogDto, @Req() req: Request) {
    let accessToken: AccessTokenPayload | null = null

    if (dto.accessToken) {
      try {
        accessToken = this.jwt.verify<AccessTokenPayload>(dto.accessToken)
      } catch (e) {
        accessToken = null
      }
    }

    return this.service.sendLogEntry({
      version: '1.1',
      host: dto.deviceId,
      short_message: dto.message,
      full_message: dto.detail,
      _kind: dto.kind,
      _app: 'frontend-client',
      _source_ip: req.ip,
      _user_id: accessToken?._id,
    })
  }
}
