import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { AccessTokenDTO } from 'src/graphql'
import { AuthService } from './auth.service'

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('verify')
  async verify(
    @Args('code') code: string,
    @Args('redirectURI') redirectURI: string
  ): Promise<AccessTokenDTO> {
    return this.authService.verify(code, redirectURI)
  }
}
