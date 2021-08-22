import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { AdminAuthGuard } from 'src/auth/admin.guard'
import { OverrideInput } from 'src/graphql'
import { OverrideService } from './override.service'

@Resolver('Override')
export class OverrideResolver {
  constructor(private readonly overrideService: OverrideService) {}

  @UseGuards(AdminAuthGuard)
  @Mutation('createOrUpdateOverride')
  createOrUpdateOverride(@Args('override') override: OverrideInput) {
    return this.overrideService.createOrUpdateOverride(override)
  }

  @UseGuards(AdminAuthGuard)
  @Mutation('deleteOverride')
  deleteOverride(@Args('courseNo') courseNo: string) {
    return this.overrideService.deleteOverride(courseNo)
  }
}
