import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserResolver } from './user.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/schemas/user.schema'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
  ],
  providers: [UserResolver, UserService],
})
export class UserModule {}
