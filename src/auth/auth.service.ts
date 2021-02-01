import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { serializeError } from 'serialize-error'
import { GraphQLExpressContext } from 'src/common/types/context.type'
import { UserDocument } from 'src/schemas/user.schema'
import { AccessTokenDTO } from 'src/graphql'
import { AccessTokenPayload } from './auth.dto'

interface OAuthToken {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
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

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private jwtService: JwtService,
    @InjectModel('user') private userModel: Model<UserDocument>
  ) {}

  async verify(
    code: string,
    redirectURI: string,
    context: GraphQLExpressContext
  ): Promise<AccessTokenDTO> {
    if (!code) {
      throw new HttpException(
        {
          reason: 'CODE_UNDEFINED',
          message: 'Authorization code is undefined',
        },
        HttpStatus.BAD_REQUEST
      )
    }
    if (!redirectURI) {
      throw new HttpException(
        {
          reason: 'REDIRECT_URI_UNDEFINED',
          message: 'Redirect URI is undefined',
        },
        HttpStatus.BAD_REQUEST
      )
    }

    const clientId = this.configService.get<string>('googleOAuthId')
    const clientSecret = this.configService.get<string>('googleOAuthSecret')

    try {
      const verifyResponse = await this.httpService
        .post<OAuthToken>('https://oauth2.googleapis.com/token', {
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
            Authorization: `Bearer ${verifyResponse.data?.access_token}`,
          },
        })
        .toPromise()

      const user = await this.findOrCreateUser(userInfo)

      const { accessToken, refreshToken } = this.generateAuthTokens(user)

      this.setRefreshToken(context, refreshToken)

      return { accessToken, _id: user._id, firstName: user.firstName }
    } catch (err) {
      throw new HttpException(
        {
          reason: 'OAUTH_ERROR',
          message: 'Unknown error during OAuth token verification request',
          error: serializeError(err),
        },
        HttpStatus.SERVICE_UNAVAILABLE
      )
    }
  }

  async refresh(
    refreshToken: string,
    context: GraphQLExpressContext
  ): Promise<AccessTokenDTO> {
    if (!refreshToken) {
      throw new HttpException(
        {
          reason: 'REFRESH_TOKEN_UNDEFINED',
          message: 'Refresh token is undefined',
        },
        HttpStatus.BAD_REQUEST
      )
    }

    const { _id: userId } = this.jwtService.verify(
      refreshToken
    ) as AccessTokenPayload

    const user = await this.userModel.findById(userId)
    if (!user) {
      throw new HttpException(
        {
          reason: 'USER_NOT_FOUND',
          message: `User does not exist`,
        },
        HttpStatus.NOT_FOUND
      )
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = this.generateAuthTokens(user)

    this.setRefreshToken(context, newRefreshToken)

    return { accessToken, _id: user._id, firstName: user.firstName }
  }

  private generateAuthTokens(user: UserDocument): AuthTokens {
    const accessToken = this.jwtService.sign(
      {
        _id: user._id,
        firstName: user.firstName,
      },
      { expiresIn: '1h' }
    )

    const refreshToken = this.jwtService.sign({
      _id: user._id,
    })

    return { accessToken, refreshToken }
  }

  private setRefreshToken(
    context: GraphQLExpressContext,
    refreshToken: string
  ): void {
    const secureCookies = this.configService.get<boolean>('secureCookies')
    context.res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: secureCookies,
    })
  }

  private async findOrCreateUser(userInfo: UserInfo): Promise<UserDocument> {
    let user = await this.userModel.findOne({ email: userInfo.email })
    if (!user) {
      user = new this.userModel({
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        googleId: userInfo.id,
        timetables: [],
      })
      await user.save()
    }

    return user
  }
}
