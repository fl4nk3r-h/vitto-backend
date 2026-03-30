# Database Schema

## PostgreSQL: leads
| Column   | Type    | Description         |
|----------|---------|--------------------|
| id       | SERIAL  | Primary key        |
| name     | TEXT    | Lead name          |
| email    | TEXT    | Lead email         |
| phone    | TEXT    | Lead phone         |
| created_at | TIMESTAMP | Creation time   |

## MongoDB: OTPSession
| Field      | Type      | Description           |
|------------|-----------|----------------------|
| _id        | ObjectId  | Primary key          |
| phone      | String    | Phone number         |
| otp        | String    | OTP code             |
| expiresAt  | Date      | Expiry (TTL index)   |

## Indexes
- `OTPSession.expiresAt`: TTL index for automatic expiry
