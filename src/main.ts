import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { HttpExceptionFilter } from './common/filters/httpException.filter'
import { validateConfig } from './config/configuration'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)

  validateConfig(configService)

  const port = configService.get<number>('port')
  const origin = configService.get<string>('origin')

  app.enableCors({ origin: origin })

  app.set('trust proxy', 1)

  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}
bootstrap()
