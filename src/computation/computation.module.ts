import { HttpModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ComputationResolver } from './computation.resolver'

@Module({
  providers: [ComputationResolver],
  imports: [
    HttpModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get('computationBackendUrl'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class ComputationModule {}
