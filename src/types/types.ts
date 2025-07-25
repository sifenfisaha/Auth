import { Document } from "mongoose";

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
}
