# Authentication

## Overview

Authentication is handled using JWT tokens. Users can register, login, and authenticate via OTP (One-Time Password) sent to their phone. All protected endpoints require a valid JWT in the `Authorization` header.

## JWT

- Issued on successful login or OTP verification
- Must be sent as `Authorization: Bearer <token>`
- Contains user ID and expiry

## OTP Flow

1. User requests OTP with phone number
2. OTP is generated, stored in MongoDB with TTL, and sent to user
3. User submits OTP for verification
4. On success, a JWT is issued

## Endpoints

- `POST /api/auth/register` — Register with email & password
- `POST /api/auth/login` — Login with email & password
- `POST /api/auth/otp` — Request OTP
- `POST /api/auth/otp/verify` — Verify OTP

## Security

- Passwords are hashed with bcrypt
- OTPs expire automatically (TTL index)
- JWT secret must be kept safe

## Assignment/Demo OTP Testing

For assignment/demo purposes, the `/api/auth/send-otp` endpoint always returns the OTP in the API response. This allows reviewers to copy the OTP and immediately verify it using `/api/auth/verify-otp` without needing a real email or SMS service.

**Example response:**

```
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"
}
```

**Note:** In production, the OTP would not be included in the response for security reasons.
