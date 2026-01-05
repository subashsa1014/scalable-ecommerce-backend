const express = require('express');
const Joi = require('joi');
const { authenticate } = require('../../../shared/middleware/auth');
const { validate } = require('../../../shared/middleware/validation');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Validation schemas
const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(1).required()
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().min(1).required()
});

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.put('/:itemId', validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/:itemId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
