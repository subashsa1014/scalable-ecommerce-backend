const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 100;

const sanitizeOrigins = (origins) =>
  origins
    .map((origin) => origin.trim())
    .filter(Boolean)
    .filter((origin) => {
      if (origin === '*') return true;
      try {
        new URL(origin);
        return true;
      } catch {
        return false;
      }
    });

const corsOrigin = process.env.CORS_ORIGIN;
const parsedOrigins = corsOrigin ? sanitizeOrigins(corsOrigin.split(',')) : [];
const corsOriginOption = parsedOrigins.includes('*')
  ? '*'
  : parsedOrigins.length
  ? parsedOrigins
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: corsOriginOption,
  }),
);
app.use(helmet());
app.use(morgan('dev'));

const parsePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const limiter = rateLimit({
  windowMs: parsePositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW_MS),
  max: parsePositiveNumber(process.env.RATE_LIMIT_MAX_REQUESTS, DEFAULT_RATE_LIMIT_MAX_REQUESTS),
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
