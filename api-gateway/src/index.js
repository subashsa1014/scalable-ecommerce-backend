const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const logger = require('../../shared/utils/logger');
const { errorHandler } = require('../../shared/utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*'
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Service URLs
const SERVICES = {
  USER: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  PRODUCT: process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002',
  ORDER: process.env.ORDER_SERVICE_URL || 'http://order-service:3003',
  PAYMENT: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  CART: process.env.CART_SERVICE_URL || 'http://cart-service:3006'
};

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'E-Commerce API Gateway',
    version: '1.0.0',
    endpoints: {
      users: '/api/v1/users',
      products: '/api/v1/products',
      cart: '/api/v1/cart',
      orders: '/api/v1/orders',
      payments: '/api/v1/payments'
    }
  });
});

// Proxy middleware
const proxyRequest = async (req, res, next) => {
  try {
    const { method, url, body, headers } = req;
    const targetUrl = req.targetService + url.replace('/api/v1' + req.servicePrefix, '');
    
    const response = await axios({
      method,
      url: targetUrl,
      data: body,
      headers: {
        ...headers,
        host: undefined
      }
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      next(error);
    }
  }
};

// Route forwarding
app.use('/api/v1/users*', (req, res, next) => {
  req.targetService = SERVICES.USER;
  req.servicePrefix = '/users';
  next();
}, proxyRequest);

app.use('/api/v1/products*', (req, res, next) => {
  req.targetService = SERVICES.PRODUCT;
  req.servicePrefix = '/products';
  next();
}, proxyRequest);

app.use('/api/v1/cart*', (req, res, next) => {
  req.targetService = SERVICES.CART;
  req.servicePrefix = '/cart';
  next();
}, proxyRequest);

app.use('/api/v1/orders*', (req, res, next) => {
  req.targetService = SERVICES.ORDER;
  req.servicePrefix = '/orders';
  next();
}, proxyRequest);

app.use('/api/v1/payments*', (req, res, next) => {
  req.targetService = SERVICES.PAYMENT;
  req.servicePrefix = '/payments';
  next();
}, proxyRequest);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

module.exports = app;
