import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserDocument } from 'src/schemas/user.schema'

@Injectable()
export class UserService {
	constructor(@InjectModel('user') private userModel: Model<UserDocument>) {}

	getCurrentUser() {
		return `This action returns current user.`
	}
}
