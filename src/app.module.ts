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
import { GraphQLExpressContext } from './common/types/context.type'
import { GraphQLError } from 'graphql'
import { ReviewModule } from './review/review.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    GraphQLModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        typePaths: ['./**/*.graphql'],
        definitions: {
          path: join(process.cwd(), 'src/graphql.ts'),
          outputAs: 'class',
        },
        playground: true,
        cors: {
          origin: configService.get<string>('origin'),
        },
        context: ({ req, res }: GraphQLExpressContext) => ({ req, res }),
        formatError: (error: GraphQLError) => {
          const graphQLFormattedError = {
            message:
              error?.extensions?.exception?.response?.message || error.message,
            path: error.path,
            locations: error.locations,
            reason: error?.extensions?.exception?.response?.reason,
            status: error?.extensions?.exception?.status,
            exception: error?.extensions?.exception,
          }
          return graphQLFormattedError
        },
      }),
      inject: [ConfigService],
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
    ReviewModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
