import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLInitialContext } from 'src/common/common.type'
import { AuthService } from './auth.service'
import { VerifyDTO } from './dto/verify.dto'

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('verify')
  async verify(
    @Args('code') code: string,
    @Args('redirectURI') redirectURI: string,
    @Context() context: GraphQLInitialContext
  ): Promise<VerifyDTO> {
    return this.authService.verify(code, redirectURI, context)
  }
}
