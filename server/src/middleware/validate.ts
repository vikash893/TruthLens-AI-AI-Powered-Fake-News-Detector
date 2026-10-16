import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.body = parsed.body || req.body;
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed for request input.',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: 'Invalid request format.'
      });
    }
  };
};
