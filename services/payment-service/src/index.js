require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const logger = require('../../shared/utils/logger');
const { errorHandler } = require('../../shared/middleware/errorHandler');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment-service' });
});

// Routes
app.use('/api/v1/payments', paymentRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Payment Service running on port ${PORT}`);
});

module.exports = app;
