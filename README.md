# Vitto — Backend API

Node.js + Express API server for the Vitto platform.

**Stack:** Express · PostgreSQL (leads) · MongoDB (OTP sessions, TTL) · JWT auth · express-validator

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- pnpm

---

## Setup

```bash
cd backend
cp .env.example .env
# Fill in your DB credentials in .env
pnpm install
```

**Run the database migration** (creates the `leads` table):

```bash
pnpm migrate
```

**Start in development:**

```bash
pnpm dev
```

Server runs at `http://localhost:4000`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 4000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry (default: 24h) |
| `CORS_ORIGIN` | Allowed frontend origin |
| `NODE_ENV` | `development` exposes OTP in response |

---

## API Reference

### Health check

```
GET /health
```

---

### POST /api/auth/send-otp

Generates a 6-digit OTP and stores it in MongoDB with a 10-minute TTL.

**Request:**

```json
{ "email": "user@company.com" }
```

**Response (200):**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "482910"   // development only
}
```

**Errors:** `400` invalid email · `429` rate limited (5 requests / 15 min)

---

### POST /api/auth/verify-otp

Verifies the OTP, deletes it from MongoDB, returns a JWT session token.

**Request:**

```json
{ "email": "user@company.com", "otp": "482910" }
```

**Response (200):**

```json
{
  "success": true,
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "OTP verified successfully"
}
```

**Errors:** `400` invalid/expired OTP · `401` bad credentials

---

### POST /api/leads

Creates a lead record in PostgreSQL. Requires JWT in `Authorization` header.

**Headers:**

```
Authorization: Bearer <sessionToken>
```

**Request:**

```json
{
  "institutionName": "ICICI Bank",
  "institutionType": "Bank",
  "city": "Mumbai",
  "phoneNumber": "+91 9876543210",
  "loanBookSize": "1000-5000 Cr"
}
```

Valid `institutionType` values: `Bank`, `NBFC`, `MFI`, `Credit Union`, `Fintech`, `Insurance`, `Other`

Valid `loanBookSize` values: `< 100 Cr`, `100-500 Cr`, `500-1000 Cr`, `1000-5000 Cr`, `> 5000 Cr`

**Response (201):**

```json
{
  "success": true,
  "message": "Account created successfully. Our team will reach out within 24 hours.",
  "lead": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "email": "user@company.com",
    "phoneNumber": "+91 9876543210",
    "institutionName": "ICICI Bank",
    "institutionType": "Bank",
    "city": "Mumbai",
    "loanBookSize": "1000-5000 Cr",
    "status": "pending",
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Errors:** `400` validation · `401` unauthorized

---

### GET /api/leads/:id

Retrieves a lead by ID. Only accessible by the email that created it.

**Headers:**

```
Authorization: Bearer <sessionToken>
```

**Response (200):** Same `lead` shape as POST response.

**Errors:** `401` unauthorized · `403` forbidden · `404` not found

---

## Database Schema

### PostgreSQL — `leads`

```sql
CREATE TABLE leads (
  id                VARCHAR(64)   PRIMARY KEY,
  email             VARCHAR(255)  NOT NULL,
  phone             VARCHAR(20),
  institution_name  VARCHAR(255)  NOT NULL,
  institution_type  VARCHAR(50)   NOT NULL,
  city              VARCHAR(100)  NOT NULL,
  loan_book_size    VARCHAR(50)   NOT NULL,
  status            VARCHAR(20)   NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### MongoDB — `otpsessions`

```js
{
  email:     String,   // unique index
  otp:       String,
  createdAt: Date      // TTL index: expires: 600 (10 minutes)
}
```

---

## Deployment

Backend is designed for Render or Railway. Set all `.env` variables in the dashboard.

```
Build command:  pnpm install && pnpm build
Start command:  pnpm start
```

## Documentation

Comprehensive API and architecture documentation is available in the [docs](docs/) folder.
