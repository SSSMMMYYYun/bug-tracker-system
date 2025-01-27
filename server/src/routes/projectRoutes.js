const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 获取项目列表
router.get('/', auth.required, (req, res) => {
  res.json({
    success: true,
    projects: []
  });
});

// 创建新项目
router.post('/', auth.required, (req, res) => {
  res.json({
    success: true,
    project: {}
  });
});

module.exports = router;
