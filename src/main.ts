import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  app.use(cookieParser())

  const port = configService.get<number>('port')
  await app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}
bootstrap()
