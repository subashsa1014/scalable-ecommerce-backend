const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const logger = require('../../shared/utils/logger');
const { errorHandler, AppError } = require('../../shared/utils/errorHandler');
const { authenticate } = require('../../shared/middleware/auth');
const { PAYMENT_STATUS } = require('../../shared/constants');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// In-memory payment storage (for mock purposes)
const payments = new Map();

// Validation schema
const processPaymentSchema = Joi.object({
  orderId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('card', 'paypal', 'bank_transfer').required(),
  cardDetails: Joi.object({
    cardNumber: Joi.string().required(),
    cardHolder: Joi.string().required(),
    expiryDate: Joi.string().required(),
    cvv: Joi.string().required()
  }).optional()
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'payment-service' });
});

// Process payment (Mock)
app.post('/process', authenticate, async (req, res, next) => {
  try {
    const { error } = processPaymentSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { orderId, amount, paymentMethod, cardDetails } = req.body;

    // Mock payment processing
    const paymentId = uuidv4();
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock validation: fail if amount is exactly 999 (for testing)
    const status = amount === 999 ? PAYMENT_STATUS.FAILED : PAYMENT_STATUS.SUCCESS;

    const payment = {
      paymentId,
      orderId,
      userId: req.user.id,
      amount,
      paymentMethod,
      status,
      transactionId: status === PAYMENT_STATUS.SUCCESS ? `TXN-${Date.now()}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    payments.set(paymentId, payment);

    logger.info(`Payment ${status}: ${paymentId} for order ${orderId}`);

    if (status === PAYMENT_STATUS.FAILED) {
      throw new AppError('Payment processing failed', 400);
    }

    res.status(201).json({
      message: 'Payment processed successfully',
      payment: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get payment status
app.get('/:id', authenticate, async (req, res, next) => {
  try {
    const payment = payments.get(req.params.id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.userId !== req.user.id) {
      throw new AppError('Unauthorized', 403);
    }

    res.json({
      payment: {
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Refund payment (Mock)
app.post('/:id/refund', authenticate, async (req, res, next) => {
  try {
    const payment = payments.get(req.params.id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.userId !== req.user.id) {
      throw new AppError('Unauthorized', 403);
    }

    if (payment.status !== PAYMENT_STATUS.SUCCESS) {
      throw new AppError('Cannot refund unsuccessful payment', 400);
    }

    // Mock refund processing
    await new Promise(resolve => setTimeout(resolve, 500));

    payment.status = 'refunded';
    payment.updatedAt = new Date().toISOString();
    payment.refundId = `REF-${Date.now()}`;

    payments.set(req.params.id, payment);

    logger.info(`Payment refunded: ${req.params.id}`);

    res.json({
      message: 'Payment refunded successfully',
      refundId: payment.refundId,
      paymentId: payment.paymentId
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Payment Service running on port ${PORT}`);
});

module.exports = app;
