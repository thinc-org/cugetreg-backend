import * as mongoose from 'mongoose'
import { User } from 'src/graphql'

export const TimetableCourseSchema = new mongoose.Schema({
	courseNo: { type: String, required: true },
	sectionNo: { type: String, required: true },
	isVisible: { type: Boolean, required: true },
})

export const TimetableSchema = new mongoose.Schema({
	semester: { type: String, required: true },
	academicYear: { type: String, required: true },
	name: { type: String, required: true },
	courses: { type: [TimetableCourseSchema], required: true },
})

export const UserSchema = new mongoose.Schema({
	googleId: { type: String, required: true },
	email: { type: String, required: true },
	firstName: { type: String },
	lastName: { type: String },
	timetables: {
		type: [TimetableSchema],
		required: true,
	},
})

export type UserDocument = User & mongoose.Document
