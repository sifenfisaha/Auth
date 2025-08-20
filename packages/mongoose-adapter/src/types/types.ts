import mongoose, { Document } from "mongoose";

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

export interface UserAdapter<UserType = any> {
  getUserById: (id: string) => Promise<UserType | null>;
  getUserByEmail: (email: string) => Promise<UserType | null>;
  createUser: (data: Record<string, any>) => Promise<UserType>;
  updateUser?: (
    id: string,
    data: Record<string, any>
  ) => Promise<UserType | null>;
  deleteUser?: (id: string) => Promise<boolean>;
}
