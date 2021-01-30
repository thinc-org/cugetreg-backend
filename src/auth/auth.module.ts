import { HttpModule, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthResolver } from './auth.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { UserSchema } from 'src/schemas/user.schema'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('jwtSecret'),
			}),
			inject: [ConfigService],
		}),
		HttpModule,
	],
	providers: [AuthResolver, AuthService],
})
export class AuthModule {}
