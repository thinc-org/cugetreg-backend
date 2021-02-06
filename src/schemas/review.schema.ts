import { StudyProgram } from '@thinc-org/chula-courses'
import * as mongoose from 'mongoose'

export const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user' },
  courseNo: { type: String, required: true },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  studyProgram: { type: String, required: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
  ],
})

export type ReviewDocument = mongoose.Document & {
  userId: string
  rating: number
  courseNo: string
  semester: string
  academicYear: string
  studyProgram: StudyProgram
  content: string
  likes: mongoose.Types.ObjectId[]
  dislikes: mongoose.Types.ObjectId[]
}
