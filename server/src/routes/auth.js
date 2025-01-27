const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const { DINGTALK_CONFIG } = require('../config/dingtalk');

// 钉钉登录
router.post('/dingtalk', async (req, res) => {
  try {
    const { code } = req.body;
    
    // 获取钉钉访问令牌
    const tokenResponse = await axios.get(
      'https://oapi.dingtalk.com/gettoken',
      {
        params: {
          appkey: DINGTALK_CONFIG.appKey,
          appsecret: DINGTALK_CONFIG.appSecret
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // 使用授权码获取用户信息
    const userInfoResponse = await axios.get(
      'https://oapi.dingtalk.com/user/getuserinfo',
      {
        params: {
          access_token: accessToken,
          code
        }
      }
    );

    const { userid } = userInfoResponse.data;

    // 获取用户详细信息
    const userDetailResponse = await axios.get(
      'https://oapi.dingtalk.com/user/get',
      {
        params: {
          access_token: accessToken,
          userid
        }
      }
    );

    const dingUserInfo = userDetailResponse.data;

    // 在数据库中查找或创建用户
    let user = await User.findOne({ dingUserId: userid });
    
    if (!user) {
      user = new User({
        dingUserId: userid,
        name: dingUserInfo.name,
        avatar: dingUserInfo.avatar,
        email: dingUserInfo.email,
        mobile: dingUserInfo.mobile,
      });
      await user.save();
    } else {
      // 更新用户信息
      user.name = dingUserInfo.name;
      user.avatar = dingUserInfo.avatar;
      user.email = dingUserInfo.email;
      user.mobile = dingUserInfo.mobile;
      await user.save();
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-jwt-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('钉钉登录错误:', error);
    res.status(500).json({ message: '登录失败，请重试' });
  }
});

// 验证token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email
      }
    });
  } catch (error) {
    res.status(401).json({ message: '无效的认证令牌' });
  }
});

module.exports = router;
