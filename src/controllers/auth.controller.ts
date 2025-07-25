import type { Request, Response } from "express";
import User from "../models/user.model";
import { comparePassword } from "../utils/bcrypt";
import {
  decodeToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const user = new User({ name, email, password });
    await user.save();

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken({
    id: user._id.toString(),
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    id: user._id.toString(),
    role: user.role,
  });

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
};

// TODO: Rotate the refresh token for better security

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  try {
    const payload = verifyRefreshToken(token);
    if (!payload) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(payload?.id);
    if (!user || !user.refreshTokens.includes(token))
      return res.status(403).json({ message: "Refresh token not recognized" });

    const newAccessToken = signAccessToken({
      id: payload?.id,
      role: payload?.role,
    });

    res.json({
      accessToken: newAccessToken,
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
