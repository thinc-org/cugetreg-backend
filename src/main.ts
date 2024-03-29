import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/httpException.filter'
import { validateConfig } from './config/configuration'
import { GelfLogger } from './logger'
import cookieParser = require('cookie-parser')

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new GelfLogger(),
  })
  const configService = app.get(ConfigService)

  validateConfig(configService)

  const port = configService.get<number>('port')
  const origin = configService.get<string>('origin')

  app.enableCors({ origin: origin })

  app.set('trust proxy', 1)

  app.useGlobalFilters(new HttpExceptionFilter())
  app.setGlobalPrefix('/_api')
  app.use(cookieParser())

  await app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}
bootstrap()
