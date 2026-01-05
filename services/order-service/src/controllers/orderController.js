const Order = require('../models/Order');
const { AppError } = require('../../../shared/middleware/errorHandler');
const { ORDER_STATUS } = require('../../../shared/constants');

exports.createOrder = async (req, res, next) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;

    const order = await Order.create({
      userId: req.user.userId,
      items,
      totalAmount,
      shippingAddress
    });

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user.userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.status === ORDER_STATUS.DELIVERED) {
      throw new AppError('Cannot cancel delivered order', 400);
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};
