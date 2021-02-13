import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger()
  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception.getStatus() >= 500) {
      this.logger.error(exception.getResponse())
    }
    return exception
  }
}
