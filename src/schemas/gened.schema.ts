import { GenEdType } from '@thinc-org/chula-courses'
import * as mongoose from 'mongoose'

export const GenEdSchema = new mongoose.Schema({
  courseNo: { type: String, required: true },
  genEdType: { type: String, required: true, enum: ['SC', 'SO', 'HU', 'IN'] },
  sections: { type: [String], required: true },
})

export interface GenEdDocument extends mongoose.Document {
  courseNo: string
  genEdType: GenEdType
  sections: string[]
}
