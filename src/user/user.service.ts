import { Injectable } from '@nestjs/common'

@Injectable()
export class UserService {
	getCurrentUser() {
		return `This action returns current user.`
	}
}
