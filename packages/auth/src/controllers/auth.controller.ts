import { Request, Response } from "express";
import { AuthService } from "../services/auth.services";
import { getAuthConfig } from "../configs/store";

export const register = async (req: Request, res: Response) => {
  const config = getAuthConfig();
  const { name, email, password } = req.data!;
  console.log(name, email, password);

  try {
    const { user, accessToken, refreshToken } = await AuthService.register({
      name,
      email,
      password,
    });

    res.cookie(config.session?.cookieName || "refreshToken", refreshToken, {
      httpOnly: true,
      secure:
        config.session?.cookieSecure ?? process.env.NODE_ENV === "production",
      sameSite: config.session?.cookieSameSite ?? "strict",
      maxAge:
        config.refreshToken.expiresIn === "7d"
          ? 7 * 24 * 60 * 60 * 1000
          : undefined,
    });

    config.onRegister?.(user, req);

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
  const config = getAuthConfig();
  const { email, password } = req.data!;

  try {
    const { user, accessToken, refreshToken } = await AuthService.login({
      email,
      password,
    });

    res.cookie(config.session?.cookieName || "refreshToken", refreshToken, {
      httpOnly: true,
      secure:
        config.session?.cookieSecure ?? process.env.NODE_ENV === "production",
      sameSite: config.session?.cookieSameSite ?? "strict",
      maxAge:
        config.refreshToken.expiresIn === "7d"
          ? 7 * 24 * 60 * 60 * 1000
          : undefined,
    });

    config.onLogin?.(user, req);

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
  const config = getAuthConfig();
  const token = req.cookies[config.session?.cookieName || "refreshToken"];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  try {
    const { accessToken, refreshToken: newRefreshToken } =
      await AuthService.refresh({ token });

    res.cookie(config.session?.cookieName || "refreshToken", newRefreshToken, {
      httpOnly: true,
      secure:
        config.session?.cookieSecure ?? process.env.NODE_ENV === "production",
      sameSite: config.session?.cookieSameSite ?? "strict",
      maxAge:
        config.refreshToken.expiresIn === "7d"
          ? 7 * 24 * 60 * 60 * 1000
          : undefined,
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
  const config = getAuthConfig();
  const token = req.cookies[config.session?.cookieName || "refreshToken"];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  try {
    const user = await AuthService.logout(token);

    res.clearCookie(config.session?.cookieName || "refreshToken", {
      httpOnly: true,
      secure:
        config.session?.cookieSecure ?? process.env.NODE_ENV === "production",
      sameSite: config.session?.cookieSameSite ?? "strict",
    });

    config.onLogout?.(user, req);

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const requestVerification = async (req: Request, res: Response) => {
  const { email } = req.data!;
  try {
    const { message } = await AuthService.requestVerification(email);
    return res.json({ success: true, message });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
export const confirmVerification = async (req: Request, res: Response) => {
  const { otp } = req.data!;
  try {
    const { message } = await AuthService.confirmVerification(otp);
    res.json({ success: true, message });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  //  todo: figure out the logic for this
};

export const resetPassword = async (req: Request, res: Response) => {
  //  todo: figure out the logic for this
};
