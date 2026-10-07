const test = require('node:test');
const assert = require('node:assert');
const v = require('../src/validators');

test('register rejects bad email and short password', () => {
  const r = v.register.safeParse({ fullName: 'A', email: 'bad', password: '123' });
  assert.equal(r.success, false);
  assert.equal(r.error.issues.length, 2);
});

test('project rejects end date before start date', () => {
  const r = v.projectCreate.safeParse({ name: 'P', startDate: '2026-02-01', endDate: '2026-01-01' });
  assert.equal(r.success, false);
});

test('project update does not apply defaults', () => {
  assert.deepEqual(v.projectUpdate.parse({ name: 'x' }), { name: 'x' });
});

test('task rejects invalid enum values', () => {
  assert.equal(v.taskCreate.safeParse({ projectId: 1, name: 'T', priority: 'URGENT' }).success, false);
});
