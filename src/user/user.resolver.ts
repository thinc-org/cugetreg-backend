import { Resolver, Query } from '@nestjs/graphql'
import { UserService } from './user.service'

@Resolver('User')
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query('me')
	getCurrentUser() {
		return this.userService.getCurrentUser()
	}
}
