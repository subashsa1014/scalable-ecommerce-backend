const express = require('express');
const Joi = require('joi');
const { authenticate, authorize } = require('../../../shared/middleware/auth');
const { validate } = require('../../../shared/middleware/validation');
const { USER_ROLES } = require('../../../shared/constants');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Validation schemas
const processPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'stripe').required()
});

// All routes require authentication
router.use(authenticate);

router.post('/process', validate(processPaymentSchema), paymentController.processPayment);
router.get('/:id', paymentController.getPaymentStatus);
router.post('/:id/refund', authorize(USER_ROLES.ADMIN), paymentController.refundPayment);

module.exports = router;
