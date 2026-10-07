const router = require('express').Router();
const v = require('../validators');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const A = require('../controllers/auth');
const P = require('../controllers/projects');
const T = require('../controllers/tasks');
const D = require('../controllers/dashboard');

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth
router.post('/auth/register', authLimiter, validate({ body: v.register }), A.register);
router.post('/auth/login', authLimiter, validate({ body: v.login }), A.login);
router.post('/auth/logout', auth, A.logout);
router.get('/auth/me', auth, A.me);

// Everything below requires a valid JWT
router.use(auth);

router.get('/dashboard', D.get);

router.get('/projects', validate({ query: v.projectQuery }), P.list);
router.get('/projects/:id', validate({ params: v.idParam }), P.get);
router.post('/projects', validate({ body: v.projectCreate }), P.create);
router.put('/projects/:id', validate({ params: v.idParam, body: v.projectUpdate }), P.update);
router.delete('/projects/:id', validate({ params: v.idParam }), P.remove);

router.get('/tasks', validate({ query: v.taskQuery }), T.list);
router.get('/tasks/:id', validate({ params: v.idParam }), T.get);
router.post('/tasks', validate({ body: v.taskCreate }), T.create);
router.put('/tasks/:id', validate({ params: v.idParam, body: v.taskUpdate }), T.update);
router.delete('/tasks/:id', validate({ params: v.idParam }), T.remove);

module.exports = router;
