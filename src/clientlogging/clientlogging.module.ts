import { HttpModule, Module } from '@nestjs/common'
import { ClientLoggingController } from './clientlogging.controller'
import { ClientLoggingService } from './clientlogging.service'
import { GoogleIdTokenService } from './googleidtoken.service'

@Module({
  providers: [ClientLoggingService, GoogleIdTokenService],
  controllers: [ClientLoggingController],
  imports: [HttpModule],
  exports: [ClientLoggingService],
})
export class ClientLoggingModule {}
