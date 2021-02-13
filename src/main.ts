import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { HttpExceptionFilter } from './common/filters/httpException.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)

  const port = configService.get<number>('port')
  const isProduction = configService.get<boolean>('isProduction')

  if (!isProduction) {
    app.enableCors({
      origin: '*',
    })
  }

  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}
bootstrap()
