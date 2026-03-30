# API Reference

## Authentication

### POST /api/auth/register

- Register a new user
- Body: `{ email, password }`
- Response: `{ user, token }`

### POST /api/auth/login

- Login user
- Body: `{ email, password }`
- Response: `{ user, token }`

### POST /api/auth/otp

- Request OTP
- Body: `{ phone }`
- Response: `{ success }`

### POST /api/auth/otp/verify

- Verify OTP
- Body: `{ phone, otp }`
- Response: `{ token }`

## Leads

### GET /api/leads

- List all leads (auth required)
- Query: `?page=1&limit=10`
- Response: `{ leads: [], total }`

### POST /api/leads

- Create a new lead (auth required)
- Body: `{ name, email, phone }`
- Response: `{ lead }`

### GET /api/leads/:id

- Get lead by ID (auth required)
- Response: `{ lead }`

### PATCH /api/leads/:id

- Update lead (auth required)
- Body: `{ name?, email?, phone? }`
- Response: `{ lead }`

### DELETE /api/leads/:id

- Delete lead (auth required)
- Response: `{ success }`

## Health

### GET /health

- Health check
- Response: `{ status, timestamp }`
