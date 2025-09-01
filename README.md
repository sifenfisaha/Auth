# @sifen/auth

A flexible and production-ready authentication middleware for Express.js, designed to simplify authentication flows while providing advanced features and configuration options.

Supports JWT-based authentication, refresh tokens, email verification, password reset, and a development mode with a local JSON database.

> **Database-agnostic:** Works with any database through a `userAdapter`. Built-in `jsonUserAdapter` for devMode and `mongooseUserAdapter` for MongoDB. More adapters for other databases will be added soon.

## Features

- JWT authentication with configurable expiration and algorithms
- Refresh tokens with rotation and reuse detection
- Password policies (length, numbers, symbols, common password restrictions)
- Session strategies (`jwt` or `cookie`)
- Email verification and password reset with configurable templates and transport
- Built-in email templates if custom templates are not provided
- Rate limiting for authentication routes
- DevMode for quick local development without a database
- Event hooks for login, register, logout, and token refresh
- Database-agnostic: easily plug in any database using `userAdapter`

## Installation

```bash
npm install @sifen/auth
npm install @sifen/auth-mongoose   # optional adapter for MongoDB
```

## Usage

### Development Mode

```ts
import express from "express";
import { auth } from "@sifen/auth";

const app = express();

app.use(auth({ devMode: true }));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
```

- Uses a local `users.json` database in the project root
- Automatically creates the file on first run
- Useful for quick development/testing without a database

### Production with a database (MongoDB example)

```ts
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { auth } from "@sifen/auth";
import { mongooseUserAdapter } from "@sifen/auth-mongoose";
import mongoose from "mongoose";
import connectDb from "./config/mongoose.config";

const app = express();
const userAdapter = mongooseUserAdapter(mongoose);

app.use(express.json());

app.use(
  auth({
    userAdapter,
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: "15m",
    },
    refreshToken: {
      secret: process.env.REFRESH_SECRET!,
      expiresIn: "7d",
    },
    email: {
      enabled: true,
      from: "no-reply@example.com",
      transport: "console", // supports 'smtp' or 'console'
      smtp: {
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT!),
        secure: true,
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      },
      // Optional custom templates; will use built-in template if not provided
      templates: {
        verification: ({ user, otp }) => ({
          subject: "Verify your email",
          html: `<p>Hello ${user.name}, use OTP: ${otp}</p>`,
          text: `Hello ${user.name}, use OTP: ${otp}`,
        }),
        passwordReset: ({ user, otp }) => ({
          subject: "Reset your password",
          html: `<p>Hello ${user.name}, reset OTP: ${otp}</p>`,
          text: `Hello ${user.name}, reset OTP: ${otp}`,
        }),
      },
    },
  })
);

connectDb(() => {
  app.listen(8000, () => console.log("Server running on port 8000"));
});
```

## Supported Routes

All routes are prefixed with `/api/auth` by default.

| Method | Route                     | Description                    | Validation          |
| ------ | ------------------------- | ------------------------------ | ------------------- |
| POST   | `/register`               | Register a new user            | `registerSchema`    |
| POST   | `/login`                  | Login with email and password  | `loginSchema`       |
| POST   | `/refresh`                | Refresh JWT token              | None                |
| POST   | `/logout`                 | Logout user                    | None                |
| POST   | `/verify-email/request`   | Request email verification OTP | `verifyEmailSchema` |
| POST   | `/verify-email/confirm`   | Confirm email verification OTP | `otpSchema`         |
| POST   | `/request-password-reset` | Request password reset OTP     | `verifyEmailSchema` |
| POST   | `/reset-password`         | Reset user password            | `verifyOtpSchema`   |

## Email Configuration

Supports two transport types:

- `console`: logs emails to the console (useful for dev)
- `smtp`: send emails using SMTP credentials

Example:

```ts
email: {
  enabled: true,
  from: "no-reply@example.com",
  transport: "smtp",
  smtp: {
    host: "smtp.mailtrap.io",
    port: 587,
    secure: false,
    auth: { user: "xxx", pass: "xxx" },
  },
  templates: {
    verification: ({ user, otp }) => ({
      subject: "Verify your email",
      html: `<p>Hello ${user.name}, OTP: ${otp}</p>`,
      text: `OTP: ${otp}`,
    }),
  },
}
```

- If custom templates are not provided, the package uses **built-in templates** for verification and password reset emails.

---

## Events / Hooks

```ts
auth({
  onLogin: (user, req) => {
    console.log("User logged in:", user.email);
  },
  onRegister: (user) => {
    console.log("User registered:", user.email);
  },
  onLogout: (user) => {
    console.log("User logged out:", user.email);
  },
  onTokenRefresh: (user) => {
    console.log("Token refreshed for:", user.email);
  },
});
```

---

## License

MIT
