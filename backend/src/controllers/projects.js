const prisma = require('../config/prisma');
const { AppError, asyncHandler } = require('../utils');

// Every query is scoped by userId, so users can never touch others' data.
const findOwned = async (id, userId, include) => {
  const project = await prisma.project.findFirst({ where: { id, userId }, include });
  if (!project) throw new AppError(404, 'Project not found');
  return project;
};

exports.list = asyncHandler(async (req, res) => {
  const { q, status, sortBy, order, page, limit } = req.valid.query;
  const where = {
    userId: req.user.id,
    ...(status && { status }),
    ...(q && { name: { contains: q, mode: 'insensitive' } }),
  };
  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { tasks: true } } },
    }),
  ]);
  const done = await prisma.task.groupBy({
    by: ['projectId'],
    where: { projectId: { in: projects.map((p) => p.id) }, status: 'COMPLETED' },
    _count: { _all: true },
  });
  const doneMap = Object.fromEntries(done.map((d) => [d.projectId, d._count._all]));
  const data = projects.map(({ _count, ...p }) => ({
    ...p,
    taskCount: _count.tasks,
    completedTaskCount: doneMap[p.id] || 0,
  }));
  res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.get = asyncHandler(async (req, res) => {
  const project = await findOwned(req.valid.params.id, req.user.id, { tasks: { orderBy: { createdAt: 'desc' } } });
  res.json({ project });
});

exports.create = asyncHandler(async (req, res) => {
  const project = await prisma.project.create({ data: { ...req.valid.body, userId: req.user.id } });
  res.status(201).json({ project });
});

exports.update = asyncHandler(async (req, res) => {
  const existing = await findOwned(req.valid.params.id, req.user.id);
  const merged = { ...existing, ...req.valid.body };
  if (merged.startDate && merged.endDate && merged.endDate < merged.startDate) {
    throw new AppError(400, 'Validation failed', [{ field: 'endDate', message: 'End date must be on or after start date' }]);
  }
  const project = await prisma.project.update({ where: { id: existing.id }, data: req.valid.body });
  res.json({ project });
});

exports.remove = asyncHandler(async (req, res) => {
  const existing = await findOwned(req.valid.params.id, req.user.id);
  await prisma.project.delete({ where: { id: existing.id } }); // tasks cascade
  res.status(204).end();
});
