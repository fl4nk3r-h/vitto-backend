import { Router, Response } from 'express';
import { body } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/postgres';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const leadsRouter = Router();

const VALID_INSTITUTION_TYPES = ['Bank', 'NBFC', 'MFI', 'Credit Union', 'Fintech', 'Insurance', 'Other'];
const VALID_LOAN_BOOK_SIZES = ['< 100 Cr', '100-500 Cr', '500-1000 Cr', '1000-5000 Cr', '> 5000 Cr'];

// POST /api/leads
leadsRouter.post(
  '/',
  requireAuth,
  validate([
    body('institutionName')
      .trim().notEmpty().withMessage('Institution name is required')
      .isLength({ max: 255 }).withMessage('Institution name too long'),
    body('institutionType')
      .isIn(VALID_INSTITUTION_TYPES)
      .withMessage(`Institution type must be one of: ${VALID_INSTITUTION_TYPES.join(', ')}`),
    body('city')
      .trim().notEmpty().withMessage('City is required')
      .isLength({ max: 100 }).withMessage('City name too long'),
    body('phoneNumber')
      .trim().notEmpty().withMessage('Phone number is required')
      .matches(/^[+\d\s\-().]{7,20}$/).withMessage('Invalid phone number format'),
    body('loanBookSize')
      .isIn(VALID_LOAN_BOOK_SIZES)
      .withMessage(`Loan book size must be one of: ${VALID_LOAN_BOOK_SIZES.join(', ')}`),
  ]),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { institutionName, institutionType, city, phoneNumber, loanBookSize } = req.body;
    const email = req.userEmail!;

    try {
      const id = uuidv4();

      const result = await pool.query(
        `INSERT INTO leads
          (id, email, phone, institution_name, institution_type, city, loan_book_size, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW(), NOW())
         RETURNING *`,
        [id, email, phoneNumber, institutionName, institutionType, city, loanBookSize]
      );

      const row = result.rows[0];

      console.log(`[leads] Created lead ${id} for ${email}`);

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Our team will reach out within 24 hours.',
        lead: formatLead(row),
      });
    } catch (err) {
      console.error('[leads] POST error:', err);
      res.status(500).json({ error: 'Failed to create lead' });
    }
  }
);

// GET /api/leads/:id
leadsRouter.get(
  '/:id',
  requireAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const email = req.userEmail!;

    try {
      const result = await pool.query(
        'SELECT * FROM leads WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      const row = result.rows[0];

      // Only the owner can read their lead
      if (row.email !== email) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      res.json(formatLead(row));
    } catch (err) {
      console.error('[leads] GET error:', err);
      res.status(500).json({ error: 'Failed to fetch lead' });
    }
  }
);

// Map snake_case DB columns → camelCase response
function formatLead(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    phoneNumber: row.phone,
    institutionName: row.institution_name,
    institutionType: row.institution_type,
    city: row.city,
    loanBookSize: row.loan_book_size,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
