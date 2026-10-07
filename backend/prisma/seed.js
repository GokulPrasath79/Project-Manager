// Creates a demo user with sample data. Run: npm run seed
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  const passwordHash = await bcrypt.hash('Password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { fullName: 'Demo User', email: 'demo@example.com', passwordHash },
  });
  if ((await prisma.project.count({ where: { userId: user.id } })) === 0) {
    await prisma.project.create({
      data: {
        name: 'Website Redesign', description: 'Refresh the marketing site', status: 'IN_PROGRESS', userId: user.id,
        tasks: { create: [
          { name: 'Wireframes', priority: 'HIGH', status: 'COMPLETED' },
          { name: 'Build homepage', priority: 'MEDIUM', status: 'IN_PROGRESS' },
          { name: 'Write copy', priority: 'LOW', status: 'PENDING' },
        ] },
      },
    });
    await prisma.project.create({ data: { name: 'Mobile Launch', status: 'NOT_STARTED', userId: user.id } });
  }
  console.log('Seeded: demo@example.com / Password123');
  await prisma.$disconnect();
})();
