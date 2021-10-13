import { forwardRef, HttpModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { ClientLoggingModule } from 'src/clientlogging/clientlogging.module'
import { RefreshToken, RefreshTokenSchema } from 'src/schemas/auth.schema'
import { UserSchema } from 'src/schemas/user.schema'
import { AnonymousStrategy } from './anonymous.strategy'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwtSecret'),
      }),
      inject: [ConfigService],
    }),
    HttpModule,
    forwardRef(() => ClientLoggingModule),
  ],
  providers: [AuthService, JwtStrategy, AnonymousStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
