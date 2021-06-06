import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AuthService } from 'src/auth/auth.service'
import { UserDocument } from 'src/schemas/user.schema'

@Injectable()
export class UserService {
  constructor(
    private authService: AuthService,
    @InjectModel('user') private userModel: Model<UserDocument>
  ) {}

  async getUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId)
    if (!user) {
      throw new NotFoundException({
        reason: 'USER_NOT_FOUND',
        message: 'User with given userId does not exist.',
      })
    }
    if (new Date() > user.google.expiresIn) {
      const newAccessToken = await this.authService.refreshGoogleToken(
        user.google.refreshToken
      )

      const expiredDate = new Date()
      expiredDate.setSeconds(
        expiredDate.getSeconds() + newAccessToken.expires_in
      )
      user.google.accessToken = newAccessToken.access_token
      user.google.expiresIn = expiredDate
      await user.save()
    }
    return user
  }
}
