const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const logger = require('../../shared/utils/logger');
const { errorHandler, AppError } = require('../../shared/utils/errorHandler');
const { authenticate } = require('../../shared/middleware/auth');
const { ORDER_STATUS } = require('../../shared/constants');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/ecommerce?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Order Service connected to MongoDB');
}).catch(err => {
  logger.error('MongoDB connection error:', err);
});

// Order Schema
const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
  paymentId: { type: String },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Validation schema
const createOrderSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().min(0).required(),
    quantity: Joi.number().integer().min(1).required()
  })).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required()
  }).required()
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'order-service' });
});

// Create order
app.post('/', authenticate, async (req, res, next) => {
  try {
    const { error } = createOrderSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { items, shippingAddress } = req.body;
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = new Order({
      orderId: uuidv4(),
      userId: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      status: ORDER_STATUS.PENDING
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    next(error);
  }
});

// Get user orders
app.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments({ userId: req.user.id });

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
});

// Get order by ID
app.get('/:id', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({ order });
  } catch (error) {
    next(error);
  }
});

// Update order status
app.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new AppError('Invalid order status', 400);
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({
      message: 'Order status updated',
      order
    });
  } catch (error) {
    next(error);
  }
});

// Update payment ID
app.patch('/:id/payment', authenticate, async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      throw new AppError('Payment ID is required', 400);
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { paymentId, status: ORDER_STATUS.PROCESSING, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({
      message: 'Payment recorded successfully',
      order
    });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Order Service running on port ${PORT}`);
});

module.exports = app;
