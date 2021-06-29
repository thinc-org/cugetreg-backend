import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { GenEdSchema } from 'src/schemas/gened.schema'
import { GenedResolver } from './gened.resolver'
import { GenedService } from './gened.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'genedtype', schema: GenEdSchema }]),
  ],
  providers: [GenedResolver, GenedService],
})
export class GenedModule {}
