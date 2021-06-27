import { HttpModule, Module } from '@nestjs/common'
import { ClientLoggingService } from './clientlogging.service'
import { ClientLoggingController } from './clientlogging.controller'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  providers: [ClientLoggingService],
  controllers: [ClientLoggingController],
  imports: [AuthModule, HttpModule],
})
export class ClientLoggingModule {}
