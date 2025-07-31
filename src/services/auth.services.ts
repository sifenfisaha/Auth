import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../auth";
import User from "../models/user.model";
import { comparePassword, hashpassword } from "../utils/bcrypt";
import {
  sendResetOtp,
  sendVerificationOtp,
} from "../utils/sendVerificationEmail";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const user = new User({ email, name, password });
  await user.save();
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) throw new Error("Invlaid credentials");

  const accessToken = signAccessToken({
    id: user._id.toString(),
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    id: user._id.toString(),
    role: user.role,
  });

  return { accessToken, refreshToken, user };
};

export const handleRefreshToken = async (token: string) => {
  const payload = verifyRefreshToken(token);
  if (!payload) throw new Error("Invalid or expired token");

  const user = await User.findById(payload.id);
  if (!user || !user.refreshTokens.includes(token))
    throw new Error("Refresh token not recognized");

  const newAccessToken = signAccessToken({
    id: payload?.id,
    role: payload?.role,
  });

  return { newAccessToken };
};

export const logoutUser = async (token: string) => {
  const payload = verifyRefreshToken(token);
  if (!payload) throw new Error("Invalid or expired token");

  const user = await User.findById(payload.id);
  if (!user || user.refreshTokens.length === 0)
    throw new Error("Refresh token not recognized");

  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  await user.save();

  return true;
};

export const handleSendVerifyOtp = async (token: string) => {
  const payload = verifyRefreshToken(token);
  if (!payload) throw new Error("Invalid or expired token");

  const user = await User.findById(payload.id);
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");

  const otp = Math.floor(Math.random() * 900000 + 100000).toString();
  user.verificationToken = otp;
  user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();
  sendVerificationOtp(user.email, user.name, user.verificationToken);

  return true;
};

export const hadnleVerifyEmail = async (otp: string, token: string) => {
  const payload = verifyRefreshToken(token);
  if (!payload) throw new Error("Invalid or expired token");

  const user = await User.findById(payload.id);
  if (!user) throw new Error("User not found");
  if (user.isVerified) throw new Error("User already verified");

  if (user.verificationToken !== otp || user.verificationToken === "")
    throw new Error("Wrong otp code");
  if (user.verificationTokenExpires.getTime() < Date.now())
    throw new Error("OTP Expired");

  user.isVerified = true;
  user.verificationToken = "";
  user.verificationTokenExpires = new Date(0);
  await user.save();
};

export const handleForgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(Math.random() * 900000 + 100000).toString();
  user.resetPasswordToken = otp;
  user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  await sendResetOtp(user.email, user.name, otp);
};

export const handleResetPassword = async (newPassword: string, otp: string) => {
  const user = await User.findOne({ resetPasswordToken: otp });
  if (!user) throw new Error("Invalid OTP");

  if (user.resetPasswordExpires.getTime() < Date.now())
    throw new Error("OTP expired");

  user.password = newPassword;
  user.resetPasswordToken = "";
  user.resetPasswordExpires = new Date(0);
  await user.save();
};
