const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 获取问题列表
router.get('/', auth.required, async (req, res) => {
  try {
    const { projectId, moduleId, status, priority, assignee } = req.query;
    
    const query = {};
    if (projectId) query.projectId = projectId;
    if (moduleId) query.moduleId = moduleId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;

    const issues = await Issue.find(query)
      .populate('creator', 'username')
      .populate('assignee', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      issues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取问题列表失败'
    });
  }
});

// 创建新问题
router.post('/', auth.required, async (req, res) => {
  try {
    const issue = new Issue({
      ...req.body,
      creator: req.user._id
    });

    await issue.save();

    res.status(201).json({
      success: true,
      issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '创建问题失败'
    });
  }
});

module.exports = router;
