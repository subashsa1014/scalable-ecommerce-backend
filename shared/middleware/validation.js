const { AppError } = require('./errorHandler');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return next(new AppError(errors.join(', '), 400));
    }
    
    req.body = value;
    next();
  };
};

module.exports = { validate };
