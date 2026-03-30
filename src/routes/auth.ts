import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate';
import { OTPSession } from '../models/OTPSession';

export const authRouter = Router();

// Strict rate limit for OTP requests — 5 per 15 min per IP
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX || '5'),
  message: { error: 'Too many OTP requests. Please wait 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/send-otp
authRouter.post(
  '/send-otp',
  otpRateLimit,
  validate([
    body('email')
      .isEmail().withMessage('A valid email address is required')
      .normalizeEmail(),
  ]),
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    try {
      const otp = generateOTP();

      // Upsert — replace any existing OTP for this email.
      // MongoDB TTL index handles expiry automatically after 10 minutes.
      await OTPSession.findOneAndUpdate(
        { email },
        { email, otp, createdAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // In production: send via SendGrid / AWS SES
      // await sendOTPEmail(email, otp);

      console.log(`[otp] Generated for ${email}: ${otp}`);

      res.json({
        success: true,
        message: 'OTP sent successfully',
        // Expose OTP only in development so the frontend can test without an email service
        ...(process.env.NODE_ENV === 'development' && { otp }),
      });
    } catch (err) {
      console.error('[otp] send-otp error:', err);
      res.status(500).json({ error: 'Failed to send OTP' });
    }
  }
);

// POST /api/auth/verify-otp
authRouter.post(
  '/verify-otp',
  validate([
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('otp')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
      .isNumeric().withMessage('OTP must be numeric'),
  ]),
  async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;

    try {
      const session = await OTPSession.findOne({ email });

      if (!session) {
        res.status(400).json({
          error: 'OTP expired or not found. Please request a new one.',
        });
        return;
      }

      if (session.otp !== otp) {
        res.status(400).json({ error: 'Invalid OTP' });
        return;
      }

      // OTP is valid — delete it so it can't be reused
      await OTPSession.deleteOne({ email });

      // Issue a JWT session token
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('JWT_SECRET not configured');

      const token = require('jsonwebtoken').sign(
        { email },
        secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      console.log(`[auth] Session issued for ${email}`);

      res.json({
        success: true,
        sessionToken: token,
        message: 'OTP verified successfully',
      });
    } catch (err) {
      console.error('[auth] verify-otp error:', err);
      res.status(500).json({ error: 'Failed to verify OTP' });
    }
  }
);
