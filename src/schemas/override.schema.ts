import { GenEdType, StudyProgram } from '@thinc-org/chula-courses'
import * as mongoose from 'mongoose'

export const GenEdSchema = new mongoose.Schema({
  genEdType: {
    type: String,
    required: true,
    enum: ['SC', 'SO', 'HU', 'IN', 'NO'],
  },
  sections: { type: [String], required: true },
})

export const OverrideSchema = new mongoose.Schema({
  courseNo: { type: String, required: true },
  studyProgram: { type: String, required: true, enum: ['S', 'T', 'I'] },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true },
  genEd: { type: GenEdSchema },
})

export interface Override {
  courseNo: string
  studyProgram: StudyProgram
  semester: string
  academicYear: string
  genEd?: {
    genEdType: GenEdType
    sections: string[]
  }
}

export type OverrideDocument = Override & mongoose.Document
