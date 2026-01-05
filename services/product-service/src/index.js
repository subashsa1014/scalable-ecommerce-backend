const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const Joi = require('joi');
const logger = require('../../shared/utils/logger');
const { errorHandler, AppError } = require('../../shared/utils/errorHandler');
const { authenticate, authorize } = require('../../shared/middleware/auth');
const { USER_ROLES } = require('../../shared/constants');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@mongodb:27017/ecommerce?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Product Service connected to MongoDB');
}).catch(err => {
  logger.error('MongoDB connection error:', err);
});

// Redis Connection
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

redisClient.connect().then(() => {
  logger.info('Product Service connected to Redis');
}).catch(err => {
  logger.error('Redis connection error:', err);
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Validation schema
const productSchema_validation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(0).required(),
  category: Joi.string().required(),
  image: Joi.string().uri().optional()
});

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    const key = `products:${req.originalUrl}`;
    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
      
      res.originalJson = res.json;
      res.json = async (data) => {
        await redisClient.setEx(key, duration, JSON.stringify(data));
        res.originalJson(data);
      };
      next();
    } catch (error) {
      logger.error('Cache error:', error);
      next();
    }
  };
};

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'product-service' });
});

// Get all products
app.get('/', cacheMiddleware(300), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
});

// Get product by ID
app.get('/:id', cacheMiddleware(300), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

// Create product (Admin only)
app.post('/', authenticate, authorize(USER_ROLES.ADMIN), async (req, res, next) => {
  try {
    const { error } = productSchema_validation.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const product = new Product(req.body);
    await product.save();

    // Invalidate cache
    const keys = await redisClient.keys('products:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
});

// Update product (Admin only)
app.put('/:id', authenticate, authorize(USER_ROLES.ADMIN), async (req, res, next) => {
  try {
    const { error } = productSchema_validation.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Invalidate cache
    const keys = await redisClient.keys('products:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
});

// Delete product (Admin only)
app.delete('/:id', authenticate, authorize(USER_ROLES.ADMIN), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Invalidate cache
    const keys = await redisClient.keys('products:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Product Service running on port ${PORT}`);
});

module.exports = app;
