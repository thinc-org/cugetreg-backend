import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtAuthGuard } from 'src/auth/jwt.guard'
import { CurrentUser } from 'src/common/decorators/currentUser.decorator'
import { CourseCartItem, CourseCartItemInput, User } from 'src/graphql'
import { UserDocument } from 'src/schemas/user.schema'

@Resolver('User')
export class UserResolver {
  constructor(@InjectModel('user') private userModel: Model<UserDocument>) {}

  @Query('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() userId: string): Promise<User> {
    const user = await this.userModel.findById(userId)
    return {
      name: user.name,
      _id: user._id,
    }
  }

  @Query('courseCart')
  @UseGuards(JwtAuthGuard)
  async getCurrentCartItems(
    @CurrentUser() userId: string
  ): Promise<CourseCartItem[]> {
    const user = await this.userModel.findById(userId)
    return user.courseCart?.cartContent || []
  }

  @Mutation('modifyCourseCart')
  @UseGuards(JwtAuthGuard)
  async setCurrentCartItems(
    @CurrentUser() userId: string,
    @Args('newContent') newContent: CourseCartItemInput[]
  ): Promise<CourseCartItem[]> {
    const user = await this.userModel.findById(userId)
    if (!user.courseCart) {
      user.courseCart = {
        cartContent: [],
      }
    }
    user.courseCart.cartContent = newContent
    await user.save()
    return user.courseCart.cartContent
  }
}
