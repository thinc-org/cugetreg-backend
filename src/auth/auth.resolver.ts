import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { User } from 'src/graphql'
import { AuthService } from './auth.service'

@Resolver('Auth')
export class AuthResolver {
	constructor(private readonly authService: AuthService) {}

	@Mutation('verify')
	verify(@Args('code') code: string): User {
		return this.authService.verify(code)
	}
}
