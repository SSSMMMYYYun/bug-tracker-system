const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');

// 获取问题列表
router.get('/', async (req, res) => {
  try {
    const { projectId, moduleId } = req.query;
    const query = {};
    
    if (projectId) query.projectId = projectId;
    if (moduleId) query.moduleId = moduleId;
    
    const issues = await Issue.find(query).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    console.error('获取问题列表失败:', error);
    res.status(500).json({ message: '获取问题列表失败', error: error.message });
  }
});

// 批量保存问题
router.post('/batch', async (req, res) => {
  try {
    // 1. 检查请求体
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('请求体为空');
      return res.status(400).json({ message: '请求体不能为空' });
    }

    // 2. 检查 issues 数组
    const { issues } = req.body;
    console.log('收到的数据:', JSON.stringify(issues, null, 2));

    if (!Array.isArray(issues)) {
      console.error('issues 不是数组');
      return res.status(400).json({ message: 'issues 必须是数组' });
    }

    // 3. 处理每个问题
    const savedIssues = [];
    const errors = [];

    for (const [index, issue] of issues.entries()) {
      try {
        console.log(`处理第 ${index + 1} 个问题:`, issue);

        // 3.1 准备保存的数据
        const issueData = {
          type: issue.type || 'bug',
          status: issue.status || '待开发',
          priority: issue.priority || 'P2',
          title: issue.title || '',
          description: issue.description || '',
          assignee: issue.assignee || '',
          reporter: issue.reporter || '',
          projectId: 'default',
          moduleId: 'all'
        };

        console.log('处理后的数据:', issueData);

        // 3.2 保存或更新数据
        let savedIssue;
        if (issue._id) {
          savedIssue = await Issue.findByIdAndUpdate(
            issue._id,
            issueData,
            { 
              new: true,
              runValidators: false,
              upsert: true
            }
          );
          console.log('更新已有问题:', savedIssue);
        } else {
          const newIssue = new Issue(issueData);
          savedIssue = await newIssue.save({ validateBeforeSave: false });
          console.log('创建新问题:', savedIssue);
        }

        savedIssues.push(savedIssue);
      } catch (error) {
        console.error(`保存第 ${index + 1} 个问题失败:`, error);
        errors.push({
          index,
          issue,
          error: error.message
        });
      }
    }

    // 4. 返回结果
    if (errors.length > 0) {
      console.log('部分问题保存失败:', errors);
      return res.status(400).json({
        message: '部分问题保存失败',
        errors,
        savedIssues
      });
    }

    console.log('全部保存成功:', savedIssues);
    res.json(savedIssues);
  } catch (error) {
    console.error('保存问题失败:', error);
    res.status(500).json({
      message: '保存问题失败',
      error: error.message
    });
  }
});

module.exports = router;
