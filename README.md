# @sifen/jwt-auth-api

A robust and reusable JWT-based authentication API for Node.js and Express, 
built with TypeScript. It includes email verification via OTP, password reset, 
token rotation, user roles, and middleware for access control.

## Features

- JWT Access & Refresh Token authentication  
- Email verification using OTP  
- Forgot and Reset Password using OTP  
- Login, Register, Logout  
- Token refresh endpoint  
- Role-based access control (user, admin)  
- Secure cookie-based refresh token storage  
- Input validation using `express-validator`  
- Cleanly written in TypeScript  
- Easily pluggable into any Express app  

## Installation

```bash
npm install @sifen/jwt-auth-api
```

## Environment Configuration

Create a `.env` file in your host app with the following variables:

```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret
EMAIL_USER=your_email_address@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=development
```

## Basic Usage

In your Express application:

```ts
// index.ts or app.ts in your project
import express from "express";
import dotenv from "dotenv";
import { auth } from "@sifen/jwt-auth-api";
import { connectDb } from "./configs/mongodb.config"; // Your database connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Mounts all auth routes under /api/auth
app.use(auth());

connectDb(() =>
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
);
```

## Auth Endpoints

| Endpoint                    | Method | Description                          |
| -------------------------- | ------ | ------------------------------------ |
| `/api/auth/register`       | POST   | Register a new user                  |
| `/api/auth/login`          | POST   | Log in and receive tokens            |
| `/api/auth/refresh`        | POST   | Refresh the access token             |
| `/api/auth/logout`         | POST   | Logout and clear the refresh token   |
| `/api/auth/verify-email`   | GET    | Send verification OTP to email       |
| `/api/auth/verify-email`   | POST   | Submit OTP to verify email           |
| `/api/auth/forgot-password`| POST   | Send OTP to email for reset          |
| `/api/auth/reset-password` | POST   | Reset password using OTP             |

## Middleware for Protected Routes

You can import and use the built-in middleware:

```ts
import { isAuthenticated, isAuthorized } from "@sifen/jwt-auth-api";

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.send("Welcome, authenticated user.");
});

app.get("/admin", isAuthenticated, isAuthorized("admin"), (req, res) => {
  res.send("Welcome, admin user.");
});
```

## Response Format

**Success:**

```json
{
  "success": true,
  "message": "Action successful",
  "data": {}
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error occurred",
  "errors": []
}
```

## Input Validation

All requests are validated using `express-validator`. This ensures required fields, 
valid email formats, password length, and other constraints are enforced.

## Contribution

Contributions are welcome. If you'd like to improve this package, feel free to fork 
the repository and open a pull request.

