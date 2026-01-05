const express = require('express');
const Joi = require('joi');
const { authenticate, authorize } = require('../../../shared/middleware/auth');
const { validate } = require('../../../shared/middleware/validation');
const { USER_ROLES, ORDER_STATUS } = require('../../../shared/constants');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Validation schemas
const orderItemSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(1).required()
});

const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  totalAmount: Joi.number().min(0).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(ORDER_STATUS)).required()
});

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', authorize(USER_ROLES.ADMIN), validate(updateStatusSchema), orderController.updateOrderStatus);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
