import { StudyProgram } from '@thinc-org/chula-courses'
import * as mongoose from 'mongoose'

export const InteractionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  type: { type: String, required: true, enum: ['L', 'D'] },
})

export const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  courseNo: { type: String, required: true },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  studyProgram: { type: String, required: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  interactions: [InteractionSchema],
})

interface InteractionDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  type: 'L' | 'D'
}

export interface ReviewDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId
  rating: number
  courseNo: string
  semester: string
  academicYear: string
  studyProgram: StudyProgram
  content: string
  interactions: mongoose.Types.DocumentArray<InteractionDocument>
}
