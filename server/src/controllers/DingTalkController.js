const DingTalkService = require('../services/DingTalkService');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');

class DingTalkController {
  async auth(req, res) {
    try {
      const { authCode } = req.body;

      if (!authCode) {
        return res.status(400).json({
          success: false,
          message: '缺少授权码'
        });
      }

      // 获取钉钉用户信息
      const dingTalkUser = await DingTalkService.getUserInfo(authCode);

      // 查找或创建用户
      let user = await UserModel.findOne({ 'dingTalk.unionId': dingTalkUser.unionId });

      if (!user) {
        // 如果用户已登录，则关联钉钉账号
        if (req.user) {
          user = await UserModel.findByIdAndUpdate(
            req.user._id,
            {
              dingTalk: {
                unionId: dingTalkUser.unionId,
                userId: dingTalkUser.userId,
                name: dingTalkUser.name,
                avatar: dingTalkUser.avatar,
                mobile: dingTalkUser.mobile
              }
            },
            { new: true }
          );
        } else {
          // 创建新用户
          user = await UserModel.create({
            username: dingTalkUser.name,
            dingTalk: {
              unionId: dingTalkUser.unionId,
              userId: dingTalkUser.userId,
              name: dingTalkUser.name,
              avatar: dingTalkUser.avatar,
              mobile: dingTalkUser.mobile
            }
          });
        }
      }

      // 生成 JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          username: user.username,
          dingTalk: user.dingTalk
        }
      });
    } catch (error) {
      console.error('DingTalk auth error:', error);
      res.status(500).json({
        success: false,
        message: '钉钉授权失败'
      });
    }
  }

  async unbind(req, res) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        { $unset: { dingTalk: 1 } },
        { new: true }
      );

      res.json({
        success: true,
        user: {
          _id: user._id,
          username: user.username
        }
      });
    } catch (error) {
      console.error('DingTalk unbind error:', error);
      res.status(500).json({
        success: false,
        message: '解除钉钉账号关联失败'
      });
    }
  }

  async login(req, res) {
    try {
      const { authCode } = req.body;

      if (!authCode) {
        return res.status(400).json({
          success: false,
          message: '缺少授权码'
        });
      }

      // 获取钉钉用户信息
      const dingTalkUser = await DingTalkService.getUserInfo(authCode);

      // 查找用户
      const user = await UserModel.findOne({ 'dingTalk.unionId': dingTalkUser.unionId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '未找到关联的用户账号'
        });
      }

      // 生成 JWT token
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          username: user.username,
          dingTalk: user.dingTalk
        }
      });
    } catch (error) {
      console.error('DingTalk login error:', error);
      res.status(500).json({
        success: false,
        message: '钉钉登录失败'
      });
    }
  }
}

module.exports = new DingTalkController();
