const express = require('express');
const Joi = require('joi');
const { authenticate } = require('../../../shared/middleware/auth');
const { validate } = require('../../../shared/middleware/validation');
const userController = require('../controllers/userController');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string()
});

// Routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);

module.exports = router;
