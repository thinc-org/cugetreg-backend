import * as mongoose from 'mongoose'

export const TimetableSchema = new mongoose.Schema({
	semester: { type: String, required: true },
	academicYear: { type: String, required: true },
	name: { type: String, required: true },
	courses: { type: [String], required: true },
})

export const UserSchema = new mongoose.Schema({
	googleId: { type: String, required: true },
	email: { type: String, required: true },
	firstName: { type: String, required: true },
	lastName: { type: String, required: true },
	timetables: {
		type: [TimetableSchema],
		required: true,
	},
})
