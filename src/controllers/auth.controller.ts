import type { Request, Response } from "express";
import User from "../models/user.model";
import { comparePassword, hashpassword } from "../utils/bcrypt";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { matchedData, validationResult } from "express-validator";
import {
  sendResetOtp,
  sendVerificationOtp,
} from "../utils/sendVerificationEmail";
import {
  hadnleVerifyEmail,
  handleForgotPassword,
  handleRefreshToken,
  handleResetPassword,
  handleSendVerifyOtp,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/auth.services";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.data!;
  try {
    await registerUser(name, email, password);

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.data!;

  try {
    const { user, refreshToken, accessToken } = await loginUser(
      email,
      password
    );
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({
      accessToken,
      success: true,
      message: "Logged in successfully",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  try {
    const { newAccessToken } = await handleRefreshToken(token);

    res.json({
      accessToken: newAccessToken,
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error: any) {
    res
      .status(403)
      .json({ success: false, message: error.message || "Invalid token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  await logoutUser(token);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res.json({ success: true, message: "Logged out successfully" });
};

export const sendVerifyOtp = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  try {
    await handleSendVerifyOtp(token);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { otp } = req.data!;
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  try {
    await hadnleVerifyEmail(otp, token);
    res.json({ success: true, message: "User verified" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.data!;

  try {
    await handleForgotPassword(email);
    res.status(200).json({
      success: true,
      message: "Reset OTP sent to your email",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { otp, newPassword } = req.data!;

  try {
    await handleResetPassword(newPassword, otp);
    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
