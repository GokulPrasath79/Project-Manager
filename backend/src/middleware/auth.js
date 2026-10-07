const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { jwtSecret } = require('../config/env');
const { AppError, asyncHandler } = require('../utils');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new AppError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (err) {
    const expired = err.name === 'TokenExpiredError';
    throw new AppError(401, expired ? 'Session expired. Please log in again.' : 'Invalid token', {
      code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
    });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.tokenVersion !== payload.tv) {
    throw new AppError(401, 'Session ended. Please log in again.', { code: 'TOKEN_INVALID' });
  }
  req.user = { id: user.id, fullName: user.fullName, email: user.email };
  next();
});
