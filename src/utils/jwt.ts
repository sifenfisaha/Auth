import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

interface Payload {
  id: string;
}

export const signAccessToken = (payload: Payload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

export const signRefreshToken = (payload: Payload): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): Payload | null => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as Payload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): Payload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as Payload;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string) => {
  return jwt.decode(token);
};
