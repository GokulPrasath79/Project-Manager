const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { AppError, asyncHandler } = require('../utils');

const publicUser = (u) => ({ id: u.id, fullName: u.fullName, email: u.email, createdAt: u.createdAt });
const sign = (u) => jwt.sign({ sub: u.id, tv: u.tokenVersion }, jwtSecret, { expiresIn: jwtExpiresIn });

exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.valid.body;
  if (await prisma.user.findUnique({ where: { email } })) throw new AppError(409, 'Email already registered');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { fullName, email, passwordHash } });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.valid.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // Same message for unknown email and wrong password (no account enumeration)
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw new AppError(401, 'Invalid email or password');
  res.json({ token: sign(user), user: publicUser(user) });
});

// Bumping tokenVersion invalidates every token issued before logout.
exports.logout = asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { tokenVersion: { increment: 1 } } });
  res.json({ message: 'Logged out' });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ user: publicUser(user) });
});
