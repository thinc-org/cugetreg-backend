import * as mongoose from 'mongoose'

export const GoogleCredentialSchema = new mongoose.Schema({
  googleId: { type: String, required: true },
  accessToken: { type: String },
  refreshToken: { type: String },
  expiresIn: { type: Date },
})

export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String },
    google: { type: GoogleCredentialSchema, required: true },
  },
  {
    timestamps: true,
  }
)

export interface UserDocument extends mongoose.Document {
  email: string
  firstName: string
  lastName: string
  google: {
    googleId: string
    accessToken: string
    refreshToken: string
    expiresIn: Date
  }
}
