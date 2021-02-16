import {
  BadRequestException,
  HttpService,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { serializeError } from 'serialize-error'
import { UserDocument } from 'src/schemas/user.schema'
import { AccessTokenDTO } from 'src/graphql'

interface GoogleOAuthResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  refresh_token: string
  id_token: string
}

interface UserInfo {
  family_name: string
  name: string
  picture: string
  locale: string
  email: string
  given_name: string
  id: string
  verified_email: boolean
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private jwtService: JwtService,
    @InjectModel('user') private userModel: Model<UserDocument>
  ) {}

  async verify(code: string, redirectURI: string): Promise<AccessTokenDTO> {
    if (!code) {
      throw new BadRequestException({
        reason: 'CODE_UNDEFINED',
        message: 'Authorization code is undefined',
      })
    }
    if (!redirectURI) {
      throw new BadRequestException({
        reason: 'REDIRECT_URI_UNDEFINED',
        message: 'Redirect URI is undefined',
      })
    }

    const clientId = this.configService.get<string>('googleOAuthId')
    const clientSecret = this.configService.get<string>('googleOAuthSecret')

    try {
      const { data: googleResponse } = await this.httpService
        .post<GoogleOAuthResponse>('https://oauth2.googleapis.com/token', {
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectURI,
        })
        .toPromise()

      const { data: userInfo } = await this.httpService
        .get<UserInfo>('https://www.googleapis.com/userinfo/v2/me', {
          headers: {
            Authorization: `Bearer ${googleResponse.access_token}`,
          },
        })
        .toPromise()

      const user = await this.updateOrCreateUser(userInfo, googleResponse)

      const accessToken = this.generateAccessToken(user)

      return { accessToken, _id: user._id, firstName: user.firstName }
    } catch (err) {
      throw new ServiceUnavailableException({
        reason: 'OAUTH_ERROR',
        message: 'Unknown error during OAuth token verification',
        error: serializeError(err),
      })
    }
  }

  private generateAccessToken(user: UserDocument): string {
    const accessToken = this.jwtService.sign(
      {
        _id: user._id,
        firstName: user.firstName,
      },
      { expiresIn: '7d' }
    )

    return accessToken
  }

  private async updateOrCreateUser(
    userInfo: UserInfo,
    googleResponse: GoogleOAuthResponse
  ): Promise<UserDocument> {
    const expiredDate = new Date()
    expiredDate.setSeconds(expiredDate.getSeconds() + googleResponse.expires_in)

    let user = await this.userModel.findOne({ email: userInfo.email })
    if (!user) {
      user = new this.userModel({
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        google: {
          googleId: userInfo.id,
          accessToken: googleResponse.access_token,
          expiresIn: expiredDate,
          refreshToken: googleResponse.refresh_token,
        },
      })
    } else {
      user.google = {
        googleId: user.google.googleId,
        accessToken: googleResponse.access_token,
        expiresIn: expiredDate,
        refreshToken: googleResponse.refresh_token,
      }
    }

    await user.save()
    return user
  }
}
