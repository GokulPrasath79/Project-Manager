const prisma = require('../config/prisma');
const { AppError, asyncHandler } = require('../utils');

// Ownership of a task = ownership of its project.
const findOwned = async (id, userId) => {
  const task = await prisma.task.findFirst({ where: { id, project: { userId } } });
  if (!task) throw new AppError(404, 'Task not found');
  return task;
};

exports.list = asyncHandler(async (req, res) => {
  const { q, status, priority, projectId, sortBy, order, page, limit } = req.valid.query;
  const where = {
    project: { userId: req.user.id },
    ...(projectId && { projectId }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(q && { name: { contains: q, mode: 'insensitive' } }),
  };
  const [total, data] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
      include: { project: { select: { id: true, name: true } } },
    }),
  ]);
  res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.get = asyncHandler(async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.valid.params.id, project: { userId: req.user.id } },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!task) throw new AppError(404, 'Task not found');
  res.json({ task });
});

exports.create = asyncHandler(async (req, res) => {
  const project = await prisma.project.findFirst({ where: { id: req.valid.body.projectId, userId: req.user.id } });
  if (!project) throw new AppError(404, 'Project not found');
  const task = await prisma.task.create({ data: req.valid.body });
  res.status(201).json({ task });
});

exports.update = asyncHandler(async (req, res) => {
  const existing = await findOwned(req.valid.params.id, req.user.id);
  const task = await prisma.task.update({ where: { id: existing.id }, data: req.valid.body });
  res.json({ task });
});

exports.remove = asyncHandler(async (req, res) => {
  const existing = await findOwned(req.valid.params.id, req.user.id);
  await prisma.task.delete({ where: { id: existing.id } });
  res.status(204).end();
});
