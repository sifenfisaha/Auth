import { checkSchema } from "express-validator";

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
  },
});
