require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/database');
const logger = require('../../shared/utils/logger');
const { errorHandler } = require('../../shared/middleware/errorHandler');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'product-service' });
});

// Routes
app.use('/api/v1/products', productRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Product Service running on port ${PORT}`);
});

module.exports = app;
