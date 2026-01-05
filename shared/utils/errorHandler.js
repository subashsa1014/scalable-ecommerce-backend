const logger = require('./logger');

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
    stack: err.stack,
    statusCode: err.statusCode
  });

  res.status(err.statusCode).json({
    error: err.message,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString()
  });
};

module.exports = { AppError, errorHandler };
