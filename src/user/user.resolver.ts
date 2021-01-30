import { Resolver, Query } from '@nestjs/graphql'
import { UserDocument } from 'src/schemas/user.schema'
import { UserService } from './user.service'

@Resolver('User')
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query('me')
	async getCurrentUser() {
		return this.userService.getCurrentUser()
	}

	// for dev only
	@Query('users')
	async getAllUsers(): Promise<UserDocument[]> {
		return this.userService.getAllUsers()
	}
}
