import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'
import { CourseModule } from './course/course.module'
import { CommonModule } from './common/common.module'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import configuration from './config/configuration'
import { GraphQLInitialContext } from './common/common.type'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [configuration],
		}),
		GraphQLModule.forRoot({
			typePaths: ['./**/*.graphql'],
			definitions: {
				path: join(process.cwd(), 'src/graphql.ts'),
				outputAs: 'class',
			},
			context: ({ req, res }: GraphQLInitialContext) => ({ req, res }),
		}),
		CourseModule,
		CommonModule,
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				uri: configService.get<string>('mongoURI'),
			}),
			inject: [ConfigService],
		}),
		UserModule,
		AuthModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
