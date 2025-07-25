import mongoose, { Document } from "mongoose";
import { Request } from "express";

export interface Iuser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  refreshTokens: string[];
  verificationToken: string;
  verificationTokenExpires: Date;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  _id: mongoose.Types.ObjectId;
}

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}
