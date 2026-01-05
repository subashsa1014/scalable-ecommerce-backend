const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../../../shared/middleware/errorHandler');
const { PAYMENT_STATUS } = require('../../../shared/constants');

// Mock payment storage (in real app, this would be a database)
const payments = new Map();

exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    // Simulate payment processing
    const paymentId = uuidv4();
    const success = Math.random() > 0.1; // 90% success rate

    const payment = {
      paymentId,
      orderId,
      amount,
      paymentMethod,
      status: success ? PAYMENT_STATUS.COMPLETED : PAYMENT_STATUS.FAILED,
      timestamp: new Date().toISOString()
    };

    payments.set(paymentId, payment);

    if (!success) {
      throw new AppError('Payment processing failed', 400);
    }

    res.status(201).json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = payments.get(id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = payments.get(id);

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      throw new AppError('Cannot refund non-completed payment', 400);
    }

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundedAt = new Date().toISOString();
    payments.set(id, payment);

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    next(error);
  }
};
