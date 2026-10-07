const { PrismaClient } = require('@prisma/client');
// Prisma uses parameterized queries, which protects against SQL injection.
module.exports = new PrismaClient();
