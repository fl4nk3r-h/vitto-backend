import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Runs a chain of express-validator rules and returns 400
 * with structured errors if any fail.
 */
export function validate(rules: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const rule of rules) {
      await rule.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map((e) => ({
          field: e.type === 'field' ? e.path : undefined,
          message: e.msg,
        })),
      });
      return;
    }

    next();
  };
}
