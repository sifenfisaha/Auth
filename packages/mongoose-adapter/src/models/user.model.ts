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
    role: { type: String, enum: ["user", "admin"], default: "user" },
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
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export function getUserModel(mongooseInstance: typeof mongoose) {
  return (
    mongooseInstance.models.User || mongooseInstance.model("User", userSchema)
  );
}
