import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'
import { CourseModule } from './course/course.module'
import { CommonModule } from './common/common.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		GraphQLModule.forRoot({
			typePaths: ['./**/*.graphql'],
			definitions: {
				path: join(process.cwd(), 'src/graphql.ts'),
				outputAs: 'class',
			},
		}),
		CourseModule,
		CommonModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
