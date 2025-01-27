const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const getTokenFromHeader = (req) => {
  const authHeader = req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }
  return null;
};

const verifyToken = async (token, required = true) => {
  try {
    if (!token && required) {
      throw new Error('No token provided');
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    const user = await User.findById(decoded.userId);

    if (!user && required) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    if (required) {
      throw error;
    }
    return null;
  }
};

// 必需的认证中间件
const required = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    const user = await verifyToken(token, true);
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: '请先登录' 
    });
  }
};

// 可选的认证中间件
const optional = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    const user = await verifyToken(token, false);
    
    if (user) {
      req.user = user;
      req.token = token;
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  required,
  optional,
  getTokenFromHeader,
  verifyToken
};
