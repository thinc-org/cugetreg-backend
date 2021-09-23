import { HttpModule, Module } from '@nestjs/common'
import { ComputationResolver } from './computation.resolver'

@Module({
  providers: [ComputationResolver],
  imports: [HttpModule],
})
export class ComputationModule {}
