# Authentication API Boilerplate – Technical Documentation

## Overview

This project is a modular and secure authentication boilerplate built with Node.js, Express, TypeScript, and MongoDB. It implements modern JWT-based authentication with features including:

- User registration and login
- Access and refresh token management
- Role-based authorization
- Secure logout
- Email verification
- Input validation
- Security hardening

This boilerplate is designed for reuse across multiple full-stack projects.

---

## Technologies Used

- **Node.js** with **Express**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **Nodemailer** for email delivery
- **express-validator** for input validation
- **Helmet, CORS, XSS-Clean, Mongo-Sanitize** for security

---

## Folder Structure

```
src/
│
├── controllers/          # Auth and user logic
├── models/               # Mongoose models
├── routes/               # Express route definitions
├── middlewares/          # Auth and error middlewares
├── utils/                # Helper functions (JWT, email)
├── configs/              # Configs (DB, nodemailer)
├── validators/           # express-validator middleware
└── index.ts              # Main app entry
```

---

## .env File

Ensure the following environment variables are present in a `.env` file at the root:

```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017/yourdb
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=development
```

---

## Features & Endpoints

### 1. **User Registration**

- **POST /api/auth/register**
- Validates input
- Hashes password
- Saves user
- Sends email verification

### 2. **Email Verification**

- **GET /api/auth/verify-email?token=**
- Verifies token
- Marks user as verified

### 3. **User Login**

- **POST /api/auth/login**
- Verifies credentials
- Issues access and refresh tokens
- Sets refresh token as HTTP-only cookie

### 4. **Token Refresh**

- **POST /api/auth/refresh**
- Validates refresh token from cookie
- Verifies it matches a stored token
- Issues a new access token

### 5. **Secure Logout**

- **POST /api/auth/logout**
- Deletes the refresh token from user model
- Clears the refresh token cookie

### 6. **Get User Profile**

- **GET /api/user/profile**
- Requires `isAuthenticated` middleware
- Returns current user's info

### 7. **Update User Profile**

- **PUT /api/user/profile**
- Requires `isAuthenticated` middleware
- Allows updating name/email

### 8. **Role-Based Access Control**

- Middleware: `isAuthorized(...roles)`
- Used on protected routes:

  ```ts
  router.get("/admin", isAuthenticated, isAuthorized("admin"), handler);
  ```

### 9. **Input Validation**

- Implemented with `express-validator` per route
- Example:

  ```ts
  (body("email").isEmail(), body("password").isLength({ min: 6 }));
  ```

---

## Authentication Tokens

### Access Token

- Lifetime: 15 minutes
- Stored in memory or local storage on client
- Sent in `Authorization: Bearer <token>` header

### Refresh Token

- Lifetime: 7 days
- Stored in user document (`refreshTokens: string[]`)
- Sent as `HttpOnly` cookie

---

## Security Measures

- **Helmet** for secure headers
- **CORS** configured for cross-origin safety
- **xss-clean** to sanitize input against XSS
- **express-mongo-sanitize** to prevent NoSQL injection
- **Cookie HttpOnly + SameSite** for refresh token protection

---

## Middleware

### `isAuthenticated`

- Verifies access token
- Injects `req.user = { id, role }`

### `isAuthorized(...roles)`

- Checks `req.user.role` against allowed roles
- Returns 403 if not matched

### `validateRequest`

- Applies express-validator checks
- Returns 422 on error

---

## Email Verification Setup

- Token: JWT with 1-day expiry
- Link format: `/api/auth/verify-email?token=...`
- Sent via Gmail SMTP (Nodemailer)
- Verifies user and updates `isVerified = true`

---

## Extending the Boilerplate

You can add:

- Forgot password + reset token
- Email template engine (like MJML, EJS)
- OAuth2 (Google, GitHub)
- Rate limiting (e.g., `express-rate-limit`)
- Refresh token rotation
- Email resend on login if unverified

---

## Example Commit Messages

- `feat: implement JWT-based user login`
- `feat: add email verification with token`
- `feat: add input validation with express-validator`
- `fix: update logout to remove used refresh token`
- `chore: setup helmet and xss-clean for security`

---

## Running the App

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` file in root.

3. Run development server:

   ```bash
   npm run dev
   ```

---
