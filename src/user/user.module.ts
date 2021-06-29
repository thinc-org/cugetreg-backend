import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from 'src/auth/auth.module'
import { UserSchema } from 'src/schemas/user.schema'
import { UserResolver } from './user.resolver'
import { UserService } from './user.service'

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
  ],
  providers: [UserResolver, UserService],
})
export class UserModule {}
