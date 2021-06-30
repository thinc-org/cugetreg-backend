import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { AdminAuthGuard } from 'src/auth/admin.guard'
import { GenEdInputDTO } from './dto/gened.dto'
import { GenedService } from './gened.service'

@Resolver('Gened')
export class GenedResolver {
  constructor(private readonly genedService: GenedService) {}

  @UseGuards(AdminAuthGuard)
  @Mutation('createOrUpdateGenEd')
  createOrUpdateGenEd(@Args('genEdInput') genEdInputDTO: GenEdInputDTO) {
    return this.genedService.createOrUpdate(genEdInputDTO)
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('removeGenEd')
  remove(@Args('courseNo') courseNo: string) {
    return this.genedService.remove(courseNo)
  }
}
