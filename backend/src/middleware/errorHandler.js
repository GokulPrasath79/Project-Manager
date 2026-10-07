const { ZodError } = require('zod');
const { AppError } = require('../utils');
const { isProd } = require('../config/env');

exports.notFound = (req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  if (err.code === 'P2002') return res.status(409).json({ error: 'A record with that value already exists' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });

  console.error(err);
  res.status(500).json({ error: 'Internal server error', ...(isProd ? {} : { stack: err.message }) });
};
