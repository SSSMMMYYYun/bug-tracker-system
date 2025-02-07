const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const mongoose = require('mongoose');

// 获取问题列表
router.get('/', async (req, res) => {
  try {
    const { projectId, moduleId } = req.query;
    const query = { projectId };
    
    // 如果指定了moduleId且不是'all'，则添加到查询条件
    if (moduleId && moduleId !== 'all') {
      query.moduleId = moduleId;
    }
    
    const issues = await Issue.find(query);
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: '获取问题列表失败', error: error.message });
  }
});

// 批量创建或更新问题
router.post('/batch', async (req, res) => {
  try {
    const { projectId, moduleId, issues } = req.body;
    if (!projectId || !issues) {
      return res.status(400).json({ message: '缺少必要参数' });
    }

    // 为每个问题添加项目ID和模块ID
    const processedIssues = issues.map(issue => ({
      ...issue,
      projectId,
      moduleId: moduleId === 'all' ? undefined : moduleId,
      // 添加或更新时间戳
      updatedAt: new Date()
    }));

    // 使用 bulkWrite 批量处理
    const operations = processedIssues.map(issue => {
      const { _id, ...issueData } = issue;
      return {
        updateOne: {
          filter: _id ? { _id } : { 
            // 如果没有ID，创建新记录
            projectId,
            moduleId: moduleId === 'all' ? undefined : moduleId,
            type: issue.type,
            description: issue.description,
            status: issue.status
          },
          update: { 
            $set: issueData,
            $setOnInsert: { createdAt: new Date() }
          },
          upsert: true
        }
      };
    });

    await Issue.bulkWrite(operations);
    
    // 获取更新后的问题列表
    const query = { projectId };
    if (moduleId && moduleId !== 'all') {
      query.moduleId = moduleId;
    }
    const updatedIssues = await Issue.find(query).sort({ createdAt: -1 });
    res.json(updatedIssues);
  } catch (error) {
    console.error('Error batch updating issues:', error);
    res.status(400).json({ 
      message: '批量更新问题失败', 
      error: error.message,
      details: error.stack 
    });
  }
});

// 创建新问题
router.post('/', async (req, res) => {
  try {
    const issue = new Issue(req.body);
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(400).json({ message: '创建问题失败', error: error.message });
  }
});

// 更新问题
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findByIdAndUpdate(id, req.body, { new: true });
    if (!issue) {
      return res.status(404).json({ message: '问题不存在' });
    }
    res.json(issue);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(400).json({ message: '更新问题失败', error: error.message });
  }
});

// 删除问题
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) {
      return res.status(404).json({ message: '问题不存在' });
    }
    res.json({ message: '问题已删除' });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(400).json({ message: '删除问题失败', error: error.message });
  }
});

module.exports = router;
