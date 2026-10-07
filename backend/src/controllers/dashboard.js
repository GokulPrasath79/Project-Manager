const prisma = require('../config/prisma');
const { asyncHandler } = require('../utils');

exports.get = asyncHandler(async (req, res) => {
  const owned = { project: { userId: req.user.id } };
  const [totalProjects, projectsInProgress, totalTasks, completedTasks, pendingTasks, inProgressTasks] = await Promise.all([
    prisma.project.count({ where: { userId: req.user.id } }),
    prisma.project.count({ where: { userId: req.user.id, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: owned }),
    prisma.task.count({ where: { ...owned, status: 'COMPLETED' } }),
    prisma.task.count({ where: { ...owned, status: 'PENDING' } }),
    prisma.task.count({ where: { ...owned, status: 'IN_PROGRESS' } }),
  ]);
  res.json({ totalProjects, totalTasks, completedTasks, pendingTasks, inProgressTasks, projectsInProgress });
});
