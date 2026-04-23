import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcrypt'

// ── Types ─────────────────────────────────────────────
export interface IUser extends Document {
  username : string
  email    : string
  password : string
  comparePassword(candidate: string): Promise<boolean>
}

// ── Schema ────────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
    username: {
      type     : String,
      required : true,
      trim     : true,
      unique   : true,
    },
    email: {
      type      : String,
      required  : true,
      lowercase : true,
      trim      : true,
      unique    : true,
    },
    password: {
      type     : String,
      required : true,
    },
  },
  { timestamps: true }
)

// ── Hash password before saving ───────────────────────
userSchema.pre('save', async function (next) {
  // Only hash if the password field was modified
  if (!this.isModified('password')) return next()

  const SALT_ROUNDS = 10
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
  next()
})

// ── Instance method: verify a plain password ──────────
userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

export const User = mongoose.model<IUser>('User', userSchema)
