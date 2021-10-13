import {
  BadRequestException,
  HttpService,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { validateOrReject } from 'class-validator'
import { randomBytes } from 'crypto'
import { Credentials } from 'google-auth-library'
import { OAuth2Client } from 'googleapis-common'
import { drive } from 'googleapis/build/src/apis/drive'
import { oauth2 } from 'googleapis/build/src/apis/oauth2'
import { Model } from 'mongoose'
import { serializeError } from 'serialize-error'
import { ClientLoggingService } from 'src/clientlogging/clientlogging.service'
import { RefreshToken, RefreshTokenDocument } from 'src/schemas/auth.schema'
import {
  CourseCart,
  CourseCartItem,
  UserDocument,
} from 'src/schemas/user.schema'
import { AccessTokenPayload } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private jwtService: JwtService,
    private clientLogging: ClientLoggingService,
    @InjectModel('user') private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>
  ) {}

  async logMessage(msg: string, additionalObject?: any) {
    console.info('GoogleAuth log', msg, JSON.stringify(additionalObject))
    this.clientLogging
      .sendLogEntry({
        short_message: msg,
        _kind: 'auth',
        _app: 'backend',
        _additional: JSON.stringify(additionalObject),
      })
      .catch((e) => console.error("Auth: Can't log message", e))
  }

  generateGoogleOauthClient(): OAuth2Client {
    return new OAuth2Client({
      clientId: this.configService.get('googleOAuthId'),
      clientSecret: this.configService.get('googleOAuthSecret'),
    })
  }

  getGoogleCallbackUrl(): string {
    return `${this.configService.get(
      'backendPublicUrl'
    )}/api/auth/google/callback`
  }

  async issueRefreshToken(user: UserDocument) {
    const token = new this.refreshTokenModel()
    token.refreshToken = randomBytes(64).toString('base64')
    token.userId = user._id
    await token.save()
    this.logMessage('Issued refresh token', { userId: token.userId })
    return token.refreshToken
  }

  async revokeRefreshTokenToken(token: string) {
    this.logMessage('Revoked refresh token', { token })
    await this.refreshTokenModel.findOneAndDelete({ refreshToken: token })
  }

  async issueAccessToken(refreshtoken: string) {
    const doc = await this.refreshTokenModel.findOne({
      refreshToken: refreshtoken,
    })
    if (!doc) {
      this.logMessage('Invalid refresh token', { refreshtoken })
      throw new BadRequestException('Not a valid refresh token')
    }
    const token: AccessTokenPayload = { _id: doc.userId.toHexString() }
    this.logMessage('Issued access token', { userId: doc.userId })
    return this.jwtService.sign(token)
  }

  async handleGoogleOauthCode(code: string) {
    // Authenticate code
    const client = this.generateGoogleOauthClient()
    let tokens: Credentials
    try {
      const res = await client.getToken({
        redirect_uri: this.getGoogleCallbackUrl(),
        code,
      })
      tokens = res.tokens
    } catch (err) {
      this.logMessage('Google Auth code exchange failed', { err, code })
      throw new BadRequestException('Fail to login. Please try again.')
    }
    client.setCredentials(tokens)

    // User lookup
    const userInfo = (await oauth2('v2').userinfo.get({ auth: client })).data
    if (!userInfo.email || !userInfo.id || !userInfo.name) {
      this.logMessage('UserInfo contains inssuficient data', { userInfo })
      throw new UnprocessableEntityException('Insufficient user data')
    }
    let user: UserDocument = await this.userModel.findOne({
      'google.googleId': userInfo.id,
    })
    if (!user) {
      user = new this.userModel()
      user.email = userInfo.email
      user.name = userInfo.name
      user.google = {
        googleId: userInfo.id,
        hasMigratedGDrive: false,
      }
      user.save()
      this.logMessage('Created new user with Google Auth', { user })
    }

    // Handle legacy google drive data
    if (!user.google.hasMigratedGDrive) {
      try {
        if (
          tokens.scope.indexOf(
            'https://www.googleapis.com/auth/drive.appdata'
          ) !== -1
        ) {
          const d = drive({ version: 'v3', auth: client })
          const files = (await d.files.list({ spaces: 'appDataFolder' })).data
            .files
          if (files.length !== 1)
            throw { reason: 'No or Multiple cart files', count: files.length }
          const file = (
            await d.files.get({ fileId: files[0].id, fields: 'id,size' })
          ).data
          if (parseInt(file.size) > 1000000)
            throw { reason: 'File size exceed limit', size: file.size }
          const data = (await d.files.get({ alt: 'media', fileId: file.id }))
            .data

          if (!Array.isArray(data))
            throw { reason: 'Object is not an array', data }

          const courseCart = new CourseCart()
          courseCart.cartContent = []
          for (const e of data) {
            if (typeof e !== 'object')
              throw { reason: 'Migrated cart item is not an object', e }
            const item = new CourseCartItem()
            item.academicYear = e.academicYear
            item.courseNo = e.courseNo
            item.semester = e.semester
            item.studyProgram = e.studyProgram
            item.selectedSectionNo = e.selectedSectionNo
            await validateOrReject(item, { forbidUnknownValues: true })
            courseCart.cartContent.push(item)
          }
          user.courseCart = courseCart
          this.logMessage('Migrated old course cart', {
            courseCart,
            userId: user._id,
          })
        }
      } catch (e) {
        this.logMessage('Error while migrating GDrive data', {
          err: serializeError(e),
          userId: user._id,
        })
      } finally {
        user.google.hasMigratedGDrive = true
        user.save()
      }
    }

    // Issue token
    return {
      refreshToken: await this.issueRefreshToken(user),
    }
  }
}
