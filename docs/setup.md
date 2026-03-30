# Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- MongoDB 6+
- pnpm

## Installation
```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials
pnpm install
```

## Database Migration
```bash
pnpm migrate
```

## Development
```bash
pnpm dev
```

## Production
```bash
pnpm build
pnpm start
```

## Environment Variables
- `PORT`: Server port (default: 4000)
- `POSTGRES_*`: PostgreSQL connection
- `MONGO_URI`: MongoDB connection
- `JWT_SECRET`: JWT signing key
- `CORS_ORIGIN`: Allowed CORS origin
- `RATE_LIMIT_*`: Rate limiting config
