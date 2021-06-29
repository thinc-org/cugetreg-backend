import { HttpModule, Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { ClientLoggingController } from './clientlogging.controller'
import { ClientLoggingService } from './clientlogging.service'

@Module({
  providers: [ClientLoggingService],
  controllers: [ClientLoggingController],
  imports: [AuthModule, HttpModule],
})
export class ClientLoggingModule {}
