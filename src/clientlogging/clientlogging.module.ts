import { HttpModule, Module } from '@nestjs/common'
import { ClientloggingService } from './clientlogging.service'
import { ClientloggingController } from './clientlogging.controller'
import { JwtModule } from '@nestjs/jwt'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  providers: [ClientloggingService],
  controllers: [ClientloggingController],
  imports: [AuthModule, HttpModule],
})
export class ClientLoggingModule {}
