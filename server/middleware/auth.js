const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 暂时跳过认证
  next();
  
  // 完整的认证逻辑（之后实现）
  /*
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
  */
};

module.exports = auth;
