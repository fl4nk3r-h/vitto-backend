# Architecture

## Overview
- **Node.js + Express**: REST API server
- **PostgreSQL**: Stores leads
- **MongoDB**: Stores OTP sessions (with TTL)
- **JWT**: Authentication
- **express-validator**: Input validation
- **Rate limiting & CORS**: Security and cross-origin support

## Folder Structure
- `src/` — Application source code
  - `db/` — Database connectors
  - `middleware/` — Express middleware
  - `models/` — Data models (Mongoose, etc.)
  - `routes/` — API route handlers
- `migrations/` — Database migration scripts
- `dist/` — Compiled output (ignored in VCS)

## Data Flow
1. Client sends HTTP request
2. Middleware (CORS, rate limit, auth, validation)
3. Route handler processes request
4. Database interaction (Postgres/Mongo)
5. Response sent to client
