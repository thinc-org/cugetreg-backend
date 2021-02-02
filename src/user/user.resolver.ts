import { UseGuards } from '@nestjs/common'
import { Resolver, Query } from '@nestjs/graphql'
import { AccessTokenPayload } from 'src/auth/auth.dto'
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { CurrentUser } from 'src/common/decorators/currentUser.decorator'
import { UserDocument } from 'src/schemas/user.schema'
import { UserService } from './user.service'

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(
    @CurrentUser() user: AccessTokenPayload
  ): Promise<UserDocument> {
    return this.userService.getUser(user._id)
  }

  // for dev only
  @Query('users')
  async getAllUsers(): Promise<UserDocument[]> {
    return this.userService.getAllUsers()
  }
}
