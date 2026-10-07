const { z } = require('zod');

const id = z.coerce.number().int().positive();
const text = (max) => z.string().trim().min(1, 'Required').max(max);
const optText = (max) => z.string().trim().max(max).nullish().transform((v) => (v === undefined ? undefined : v || null));
const date = z
  .union([z.string(), z.null()])
  .refine((v) => v === null || !Number.isNaN(Date.parse(v)), 'Invalid date')
  .transform((v) => (v === null ? null : new Date(v)));
const optDate = date.optional();

const ProjectStatus = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);
const TaskStatus = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);
const Priority = z.enum(['LOW', 'MEDIUM', 'HIGH']);

const endAfterStart = (d) => !d.startDate || !d.endDate || d.endDate >= d.startDate;
const dateMsg = { message: 'End date must be on or after start date', path: ['endDate'] };

const paging = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  order: z.enum(['asc', 'desc']).default('desc'),
};

exports.idParam = z.object({ id });

exports.register = z.object({
  fullName: text(100),
  email: z.string().trim().toLowerCase().email('Invalid email').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});
exports.login = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Required'),
});

const projectBase = z.object({
  name: text(120),
  description: optText(2000),
  status: ProjectStatus.default('NOT_STARTED'),
  startDate: optDate,
  endDate: optDate,
});
exports.projectCreate = projectBase.refine(endAfterStart, dateMsg);
// partial(): no defaults should be applied on update, so rebuild without defaults
exports.projectUpdate = z
  .object({
    name: text(120).optional(),
    description: optText(2000),
    status: ProjectStatus.optional(),
    startDate: optDate,
    endDate: optDate,
  })
  .refine(endAfterStart, dateMsg);
exports.projectQuery = z.object({
  q: z.string().trim().max(120).optional(),
  status: ProjectStatus.optional(),
  sortBy: z.enum(['createdAt', 'name', 'endDate']).default('createdAt'),
  ...paging,
});

exports.taskCreate = z.object({
  projectId: id,
  name: text(160),
  description: optText(2000),
  priority: Priority.default('MEDIUM'),
  status: TaskStatus.default('PENDING'),
  dueDate: optDate,
});
exports.taskUpdate = z.object({
  name: text(160).optional(),
  description: z.string().trim().max(2000).nullish().transform((v) => (v === undefined ? undefined : v || null)),
  priority: Priority.optional(),
  status: TaskStatus.optional(),
  dueDate: optDate,
}); // projectId cannot be changed
exports.taskQuery = z.object({
  q: z.string().trim().max(160).optional(),
  status: TaskStatus.optional(),
  priority: Priority.optional(),
  projectId: id.optional(),
  sortBy: z.enum(['createdAt', 'name', 'dueDate', 'priority']).default('createdAt'),
  ...paging,
});
