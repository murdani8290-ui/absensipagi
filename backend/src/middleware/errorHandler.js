import logger from '../utils/logger.js';
import { error } from '../utils/response.js';
import { ValidationError } from '../utils/validation.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Validation Error
  if (err instanceof ValidationError) {
    return res.status(400).json(error(err.message, 400));
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(error('Invalid token', 401));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(error('Token expired', 401));
  }

  // Custom API Error
  if (err.statusCode) {
    return res.status(err.statusCode).json(error(err.message, err.statusCode));
  }

  // Default error
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Internal server error';

  res.status(statusCode).json(error(message, statusCode));
};
