const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { corsOrigins } = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // correct client IP behind Render-style proxies
app.use(helmet());
app.use(
  cors({
    // Native mobile apps send no Origin header, so they pass; browsers must be in the allow-list.
    origin: (origin, cb) => (!origin || corsOrigins.includes(origin) ? cb(null, true) : cb(null, false)),
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(morgan('combined'));
app.use('/api', apiLimiter, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
