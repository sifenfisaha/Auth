import mongoose, { Schema } from "mongoose";
import type { Iuser } from "../types/types";

const userSchema = new Schema<Iuser>(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verificationToken: {
      type: String,
      default: "",
    },
    verificationTokenExpires: {
      type: Date,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
    resetPasswordExpires: {
      type: Date,
      default: 0,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.model<Iuser>("User", userSchema);

export default User;
