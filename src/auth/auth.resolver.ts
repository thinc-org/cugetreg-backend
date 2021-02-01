import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLExpressContext } from 'src/common/types/context.type'
import { Cookies } from 'src/common/decorators/cookies.decorator'
import { AccessTokenDTO } from 'src/graphql'
import { AuthService } from './auth.service'

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation('verify')
  async verify(
    @Args('code') code: string,
    @Args('redirectURI') redirectURI: string,
    @Context() context: GraphQLExpressContext
  ): Promise<AccessTokenDTO> {
    return this.authService.verify(code, redirectURI, context)
  }

  @Mutation('refresh')
  async refresh(
    @Cookies('refreshToken') refreshToken: string,
    @Context() context: GraphQLExpressContext
  ): Promise<AccessTokenDTO> {
    return this.authService.refresh(refreshToken, context)
  }
}
