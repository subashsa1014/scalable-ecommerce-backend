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

/**
 * Validate and sanitize CORS origins from comma-separated input.
 * Accepts well-formed URLs or a wildcard entry ("*"); invalid entries are discarded.
 * @param {string[]} origins - Raw origin strings from the environment variable.
 * @returns {string[]} Sanitized list of origins or an empty array.
 */
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

/**
 * Convert a value to a finite positive number, or return the provided fallback.
 * @param {string | number | undefined} value - The input to parse.
 * @param {number} fallback - Value used when parsing fails or the number is not positive.
 * @returns {number} A positive number suitable for configuration values.
 */
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
