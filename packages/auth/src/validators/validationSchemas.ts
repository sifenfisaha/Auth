import { checkSchema } from "express-validator";

export const loginSchema = checkSchema({
  email: {
    isEmail: {
      errorMessage: "Please provide a valid email",
    },
    normalizeEmail: true,
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters",
    },
  },
});

export const registerSchema = checkSchema({
  name: {
    notEmpty: {
      errorMessage: "Username is required",
    },
    isLength: {
      options: { min: 3 },
      errorMessage: "Username must be at least 3 characters",
    },
    trim: true,
    escape: true,
  },
  email: {
    isEmail: {
      errorMessage: "Please provide a valid email",
    },
    normalizeEmail: true,
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters",
    },
    notEmpty: {
      errorMessage: "Password is required",
    },
  },
});

export const verifyOtpSchema = checkSchema({
  newPassword: {
    notEmpty: {
      errorMessage: "New password is required",
    },
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters",
    },
  },
  otp: {
    notEmpty: {
      errorMessage: "OTP is required",
    },
    isLength: {
      options: { min: 4, max: 6 },
      errorMessage: "OTP must be between 4 and 6 digits",
    },
    isNumeric: {
      errorMessage: "OTP must contain only numbers",
    },
    trim: true,
  },
});

export const verifyEmailSchema = checkSchema({
  email: {
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Please provide a valid email",
    },
    normalizeEmail: true,
  },
});

export const otpSchema = checkSchema({
  otp: {
    notEmpty: {
      errorMessage: "OTP is required",
    },
    isLength: {
      options: { min: 6, max: 6 },
      errorMessage: "OTP must be 6 digits",
    },
    isNumeric: {
      errorMessage: "OTP must contain only numbers",
    },
    trim: true,
  },
});
