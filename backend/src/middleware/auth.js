import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import { error } from '../utils/response.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(error('No token provided', 401));
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json(error('Token expired', 401));
    }
    return res.status(401).json(error('Invalid token', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(error('Unauthorized', 401));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json(error('Forbidden', 403));
    }

    next();
  };
};
