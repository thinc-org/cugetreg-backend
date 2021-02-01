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
import { VerifyDTO } from 'src/graphql'

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
  ): Promise<VerifyDTO> {
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

      context.res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      })

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
