import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  Res,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import {} from 'googleapis'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(
    readonly authService: AuthService,
    readonly configService: ConfigService
  ) {}

  @Get('/google')
  @Redirect()
  authWithGoogle(@Query('returnURL') returnURL: string) {
    const url = this.authService.generateGoogleOauthClient().generateAuthUrl({
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'openid',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      state: returnURL,
      redirect_uri: this.authService.getGoogleCallbackUrl(),
      access_type: 'online',
      include_granted_scopes: true,
      hd: 'student.chula.ac.th',
    })

    return {
      url,
      statusCode: 302,
    }
  }

  @Get('/google/callback')
  @Redirect()
  async authWithGoogleCallback(
    @Query('code') code: string,
    @Query('state') returnURL = '',
    @Res({ passthrough: true }) res: Response
  ) {
    const { refreshToken } = await this.authService.handleGoogleOauthCode(code)
    res.cookie('refreshtoken', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30 * 6,
    })

    const backendPublicUrl = this.configService.get('backendPublicUrl')
    if (!returnURL) {
      returnURL = backendPublicUrl
    }
    // allow redirect to any origin for dev
    if (
      this.configService.get('env') !== 'development' &&
      !returnURL.startsWith(backendPublicUrl)
    ) {
      throw new BadRequestException(
        `returnURL must be the same origin as ${backendPublicUrl}`
      )
    }

    return {
      url: returnURL,
    }
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refreshtoken']
    if (token) await this.authService.revokeRefreshTokenToken(token)
    res.clearCookie('refreshtoken')
  }

  @Post('/refreshtoken')
  async getAccessToken(@Req() req: Request) {
    const token = req.cookies['refreshtoken']
    if (!token) throw new BadRequestException('Not logged in')
    return {
      accessToken: await this.authService.issueAccessToken(token),
    }
  }
}
