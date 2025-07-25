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
