const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).json({
      error: err.isOperational ? err.message : 'Something went wrong',
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { errorHandler, AppError };
