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

interface AccessToken {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}

interface GoogleVerifyResponse extends AccessToken {
  refresh_token: string
  id_token: string
}

interface IDTokenPayload {
  iss: string // Always https://accounts.google.com or accounts.google.com
  azp: string // CU Get Reg's client id
  aud: string // CU Get Reg's client id
  sub: string // Unique Google account's identifier
  email: string // User's email address
  email_verified: boolean // True if the user's e-mail address has been verified; otherwise false
  at_hash: string // Access token hash
  name: string // The user's full name, in a displayable form
  picture: string // The URL of the user's profile picture
  given_name: string // The user's given name or first name
  family_name: string // The user's surname or last name
  locale: string // The user's locale
  iat: number // The time the ID token was issued
  exp: number // Expiration time on or after which the ID token must not be accepted
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
        .post<GoogleVerifyResponse>('https://oauth2.googleapis.com/token', {
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectURI,
        })
        .toPromise()

      const userInfo = this.jwtService.decode(
        googleResponse.id_token
      ) as IDTokenPayload

      const user = await this.updateOrCreateUser(userInfo, googleResponse)

      const accessToken = this.generateAccessToken(user)

      return { accessToken, _id: user._id, firstName: user.firstName }
    } catch (err) {
      throw new ServiceUnavailableException({
        reason: 'GOOGLE_OAUTH_ERROR',
        message: 'Unknown error during OAuth token verification',
        error: serializeError(err),
      })
    }
  }

  async refreshGoogleToken(refreshToken: string) {
    const clientId = this.configService.get<string>('googleOAuthId')
    const clientSecret = this.configService.get<string>('googleOAuthSecret')

    try {
      const { data: accessTokenInfo } = await this.httpService
        .post<AccessToken>('https://oauth2.googleapis.com/token', {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        })
        .toPromise()

      return accessTokenInfo
    } catch (err) {
      throw new ServiceUnavailableException({
        reason: 'GOOGLE_REFRESH_ERROR',
        message: `Unknown error while refreshing Google's accessToken`,
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
    userInfo: IDTokenPayload,
    googleResponse: GoogleVerifyResponse
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
          googleId: userInfo.sub,
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
