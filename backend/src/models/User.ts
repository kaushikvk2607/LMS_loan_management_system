import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
import { roles, type Role } from "../types/index.js";

export type UserDocument = mongoose.Document & {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  comparePassword(password: string): Promise<boolean>;
};

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, default: "BORROWER", required: true }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<UserDocument>("User", userSchema);
