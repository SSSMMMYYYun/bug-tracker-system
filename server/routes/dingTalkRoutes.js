const express = require('express');
const router = express.Router();
const DingTalkController = require('../controllers/DingTalkController');
const authMiddleware = require('../middleware/auth');

// 钉钉授权
router.post('/auth', authMiddleware.optional, DingTalkController.auth);

// 解除钉钉账号关联
router.post('/unbind', authMiddleware.required, DingTalkController.unbind);

// 钉钉登录
router.post('/login', DingTalkController.login);

module.exports = router;
