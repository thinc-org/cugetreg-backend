import { buildSchema, prop } from '@typegoose/typegoose'
import { IsString } from 'class-validator'
import * as mongoose from 'mongoose'

export class GoogleUserData {
  @prop({ required: true })
  googleId: string

  @prop()
  hasMigratedGDrive: boolean
}

export class CourseCartItem {
  @prop()
  @IsString()
  studyProgram: string
  @prop()
  @IsString()
  academicYear: string
  @prop()
  @IsString()
  semester: string
  @prop()
  @IsString()
  courseNo: string
  @prop()
  @IsString()
  selectedSectionNo: string
}

export class CourseCart {
  @prop({ type: () => [CourseCartItem] })
  cartContent: CourseCartItem[]
}

export class User {
  @prop({ required: true })
  email: string
  @prop()
  name: string
  @prop()
  google: GoogleUserData
  @prop()
  courseCart: CourseCart
}

export type UserDocument = User & mongoose.Document

export const UserSchema = buildSchema(User)
