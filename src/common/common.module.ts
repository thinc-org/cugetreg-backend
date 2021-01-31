import { Module } from '@nestjs/common'
import { DateScalar } from './common.scalar'

@Module({
  providers: [DateScalar],
})
export class CommonModule {}
