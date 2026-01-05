const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : ['http://localhost:3000'],
  }),
);
app.use(helmet());
app.use(morgan('dev'));

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? `${15 * 60 * 1000}`, 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10);

const limiter = rateLimit({
  windowMs: Number.isFinite(windowMs) ? windowMs : 15 * 60 * 1000,
  max: Number.isFinite(maxRequests) ? maxRequests : 100,
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
