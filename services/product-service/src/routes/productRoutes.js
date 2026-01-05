const express = require('express');
const Joi = require('joi');
const { authenticate, authorize } = require('../../../shared/middleware/auth');
const { validate } = require('../../../shared/middleware/validation');
const { USER_ROLES } = require('../../../shared/constants');
const productController = require('../controllers/productController');

const router = express.Router();

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().min(0).required(),
  category: Joi.string().required(),
  image: Joi.string().uri()
});

const updateProductSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  price: Joi.number().min(0),
  quantity: Joi.number().min(0),
  category: Joi.string(),
  image: Joi.string().uri()
});

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', authenticate, authorize(USER_ROLES.ADMIN), validate(productSchema), productController.createProduct);
router.put('/:id', authenticate, authorize(USER_ROLES.ADMIN), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticate, authorize(USER_ROLES.ADMIN), productController.deleteProduct);

module.exports = router;
