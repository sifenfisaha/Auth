import { Request, Response } from "express";
import { AuthService } from "../services/auth.services";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.data!;
  try {
    const { user, accessToken, refreshToken } = await AuthService.register({
      name,
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      user,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.data!;
  try {
    const { user, accessToken, refreshToken } = await AuthService.login({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      accessToken,
      user,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await AuthService.refresh({
        token,
      });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (err: any) {
    return res.status(403).json({ success: false, message: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  try {
    await AuthService.logout(token);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const sendVerifyOtp = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  try {
    const payload: any = AuthService.getUserFromToken(token);
    await AuthService.sendVerificationOtp(payload.userId);

    return res.json({ success: true, message: "Verification OTP sent" });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
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
    const payload: any = AuthService.getUserFromToken(token);
    await AuthService.verifyEmail(payload.userId, otp);

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.data!;
  try {
    await AuthService.forgotPassword(email);
    return res.json({ success: true, message: "OTP sent to reset password" });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { otp, newPassword } = req.data!;
  try {
    await AuthService.resetPassword({ otp, newPassword });
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
