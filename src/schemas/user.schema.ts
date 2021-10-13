import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { IsString } from 'class-validator'
import * as mongoose from 'mongoose'

export class GoogleUserData {
  @Prop({ required: true })
  googleId: string

  @Prop()
  hasMigratedGDrive: boolean
}

export class CourseCartItem {
  @Prop()
  @IsString()
  studyProgram: string
  @Prop()
  @IsString()
  academicYear: string
  @Prop()
  @IsString()
  semester: string
  @Prop()
  @IsString()
  courseNo: string
  @Prop()
  @IsString()
  selectedSectionNo: string
}

export class CourseCart {
  @Prop({ type: () => [CourseCartItem] })
  cartContent: CourseCartItem[]
}

@Schema()
export class User {
  @Prop({ required: true })
  email: string
  @Prop()
  name: string
  @Prop()
  google: GoogleUserData
  @Prop()
  courseCart: CourseCart
}

export type UserDocument = User & mongoose.Document

export const UserSchema = SchemaFactory.createForClass(User)
