const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const logger = require('../../shared/utils/logger');
const { errorHandler, AppError } = require('../../shared/utils/errorHandler');
const { authenticate } = require('../../shared/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/ecommerce?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Cart Service connected to MongoDB');
}).catch(err => {
  logger.error('MongoDB connection error:', err);
});

// Cart Schema
const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
});

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  items: [cartItemSchema],
  totalAmount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

// Validation schema
const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(1).required(),
  image: Joi.string().optional()
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'cart-service' });
});

// Get cart
app.get('/', authenticate, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
    }

    res.json({ cart });
  } catch (error) {
    next(error);
  }
});

// Add to cart
app.post('/', authenticate, async (req, res, next) => {
  try {
    const { error } = addToCartSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { productId, name, price, quantity, image } = req.body;

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, quantity, image });
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(201).json({
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    next(error);
  }
});

// Update cart item
app.put('/:itemId', authenticate, async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      throw new AppError('Invalid quantity', 400);
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      throw new AppError('Item not found in cart', 404);
    }

    item.quantity = quantity;
    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
});

// Remove from cart
app.delete('/:itemId', authenticate, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    next(error);
  }
});

// Clear cart
app.delete('/', authenticate, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Cart Service running on port ${PORT}`);
});

module.exports = app;
