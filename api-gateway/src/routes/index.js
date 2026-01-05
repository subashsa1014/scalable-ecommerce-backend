const express = require('express');
const axios = require('axios');
const router = express.Router();

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://cart-service:3005';

// Proxy middleware
const proxyRequest = (serviceUrl) => {
  return async (req, res, next) => {
    try {
      const response = await axios({
        method: req.method,
        url: `${serviceUrl}${req.path}`,
        data: req.body,
        headers: {
          ...req.headers,
          host: new URL(serviceUrl).host
        },
        params: req.query
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
};

// Route all requests to respective services
router.use('/users', proxyRequest(USER_SERVICE_URL));
router.use('/products', proxyRequest(PRODUCT_SERVICE_URL));
router.use('/orders', proxyRequest(ORDER_SERVICE_URL));
router.use('/payments', proxyRequest(PAYMENT_SERVICE_URL));
router.use('/cart', proxyRequest(CART_SERVICE_URL));

module.exports = router;
