import { Request, Response } from "express";
import User from "../models/user.model";
import { comparePassword, hashpassword } from "../utils/bcrypt";

export const getUserProfile = async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id).select(
    "-password -refreshTokens"
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  res.json({ success: true, user });
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const { name, email, password, newPassword } = req.body;
  const user = await User.findById((req as any).user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (name) user.name = name;
  if (email) user.email = email;
  if (password || newPassword) {
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Wrong current password" });
    user.password = await hashpassword(newPassword);
  }

  await user.save();
  return res.json({ success: true, message: "Profile updated" });
};
