import * as mongoose from 'mongoose'
import { User } from 'src/graphql'

export const UserSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true },
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
  },
  {
    timestamps: true,
  }
)

export type UserDocument = User & mongoose.Document
