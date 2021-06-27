import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AccessTokenPayload } from 'src/auth/auth.dto'
import { ClientloggingService } from './clientlogging.service'
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
  accesstoken?: string

  @IsString()
  deviceid: string
}

@Controller('clientlogging')
export class ClientloggingController {
  constructor(
    readonly service: ClientloggingService,
    readonly jwt: JwtService
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  postClientLog(@Body() dto: ClientLogDto, @Req() req: Request) {
    let accessToken: AccessTokenPayload | null = null

    if (dto.accesstoken) {
      try {
        accessToken = this.jwt.verify<AccessTokenPayload>(dto.accesstoken)
      } catch (e) {
        accessToken = null
      }
    }

    return this.service.sendLogEntry({
      version: '1.1',
      host: dto.deviceid,
      short_message: dto.message,
      full_message: dto.detail,
      _kind: dto.kind,
      _app: 'frontend-cllient',
      _source_ip: req.ip,
      _user_id: accessToken?._id,
    })
  }
}
