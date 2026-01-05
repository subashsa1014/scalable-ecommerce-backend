const Cart = require('../models/Cart');
const { AppError } = require('../../../shared/middleware/errorHandler');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.user.userId, items: [] });
    }

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, name, price, quantity } = req.body;
    
    let cart = await Cart.findOne({ userId: req.user.userId });
    
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [] });
    }

    // Check if product already in cart
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    
    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ productId, name, price, quantity });
    }

    await cart.save();

    res.status(201).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.userId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const item = cart.items.id(itemId);
    
    if (!item) {
      throw new AppError('Item not found in cart', 404);
    }

    item.quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.userId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    next(error);
  }
};
