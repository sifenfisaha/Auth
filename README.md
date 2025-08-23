# @sifen/auth 

A flexible authentication middleware for **Express**, designed to give you secure and production-ready authentication flows with minimal effort.  
It comes with JWT-based authentication, refresh tokens, email verification, password reset, and adapter-driven persistence layers that integrate seamlessly with your database.

---

## Installation

```bash
npm install @sifen/auth
````

Optional: install the official Mongoose adapter

```bash
npm install @sifen/auth-mongoose
```

---

## Quick Start

```ts
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { auth } from "@sifen/auth";
import { mongooseUserAdapter } from "@sifen/auth-mongoose";
import mongoose from "mongoose";

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
      transport: "console",
    },
  })
);

app.listen(8000, () => console.log("Server running on port 8000"));
```

---

## API Endpoints & Responses

### `POST /auth/register`

Register a new user.

**Request**

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "Password123!"
}
```

**Response**

```json
{
  "success": true,
  "message": "User registered successfully",
  "accessToken": "jwt-token-here",
  "user": {
    "id": "64fd9c...",
    "name": "Alice",
    "email": "alice@example.com",
    "isVerified": false
  }
}
```

---

### `POST /auth/login`

Login and receive tokens.

**Request**

```json
{
  "email": "alice@example.com",
  "password": "Password123!"
}
```

**Response**

```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "jwt-token-here",
  "user": {
    "id": "64fd9c...",
    "name": "Alice",
    "email": "alice@example.com",
    "isVerified": true
  }
}
```

*A refresh token is set in an HTTP-only cookie (default: `refreshToken`).*

---

### `POST /auth/refresh`

Obtain a new access token using the refresh token.

**Response**

```json
{
  "success": true,
  "message": "Access token refreshed successfully",
  "accessToken": "new-jwt-token-here"
}
```

---

### `POST /auth/logout`

Logs out the user by invalidating the refresh token.

**Response**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### `POST /auth/verify-email/request`

Request a verification code.

**Request**

```json
{ "email": "alice@example.com" }
```

**Response**

```json
{
  "success": true,
  "message": "Verification email sent"
}
```

---

### `POST /auth/verify-email/confirm`

Confirm email using OTP.

**Request**

```json
{ "otp": "123456" }
```

**Response**

```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### `POST /auth/request-password-reset`

Request a password reset.

**Request**

```json
{ "email": "alice@example.com" }
```

**Response**

```json
{
  "success": true,
  "message": "Password reset code sent"
}
```

---

### `POST /auth/reset-password`

Reset the password using OTP.

**Request**

```json
{
  "otp": "123456",
  "newPassword": "NewPass123!"
}
```

**Response**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## Authorization with `authGuard`

To protect routes, use the built-in `authGuard`.

```ts
import { authGuard } from "@sifen/auth";

app.get("/profile", authGuard(), (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});
```

* Requires a valid `Authorization: Bearer <accessToken>` header.
* Rejects requests without tokens or with invalid tokens.
* Supports role-based restrictions:

```ts
app.delete("/admin", authGuard({ roles: ["admin"] }), (req, res) => {
  res.json({ success: true, message: "Admin access granted" });
});
```

* Optional mode (authenticated if possible, but not required):

```ts
app.get("/optional", authGuard({ optional: true }), (req, res) => {
  res.json({ user: req.user ?? null });
});
```

---

## Refresh Tokens via Cookies

* Refresh tokens are stored as **HTTP-only cookies** (`refreshToken` by default).
* This prevents JavaScript access and reduces XSS risks.
* Configurable via `session` in `AuthConfig`.

---

## Error Handling

All endpoints return structured JSON errors:

```json
{
  "success": false,
  "message": "Unauthorized: Invalid token"
}
```

## Roadmap

* [ ] Adapters for PostgreSQL and MySQL
* [ ] Webhooks for authentication events
* [ ] Admin dashboard for user and token management
* [ ] Advanced email templating with Handlebars/MJML

---

## License

MIT © Sifen Fisaha

