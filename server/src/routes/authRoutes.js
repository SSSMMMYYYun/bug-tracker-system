const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const auth = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 创建新用户
    const user = new User({
      username,
      password,
      email
    });

    await user.save();

    // 生成 token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '注册失败'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        dingTalk: user.dingTalk
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

// 获取当前用户信息
router.get('/me', auth.required, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
