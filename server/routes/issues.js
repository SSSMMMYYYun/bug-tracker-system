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
    console.log('接收到的数据:', { projectId, moduleId, issues });

    if (!projectId || !issues) {
      return res.status(400).json({ 
        message: '缺少必要参数',
        details: 'projectId 和 issues 是必填字段'
      });
    }

    try {
      // 验证 projectId 是否为有效的 ObjectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          message: '无效的项目ID',
          details: 'projectId 必须是有效的 ObjectId'
        });
      }

      // 如果有 moduleId，验证它是否为有效的 ObjectId
      if (moduleId && moduleId !== 'all' && !mongoose.Types.ObjectId.isValid(moduleId)) {
        return res.status(400).json({
          message: '无效的模块ID',
          details: 'moduleId 必须是有效的 ObjectId'
        });
      }
    } catch (error) {
      console.error('ID validation error:', error);
      return res.status(400).json({
        message: 'ID验证失败',
        error: error.message
      });
    }

    // 为每个问题添加项目ID和模块ID
    const processedIssues = issues.map(issue => {
      // 只保留有值的字段
      const cleanedIssue = {};
      Object.entries(issue).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanedIssue[key] = value;
        }
      });

      return {
        ...cleanedIssue,
        projectId: new mongoose.Types.ObjectId(projectId),
        moduleId: moduleId === 'all' ? null : (moduleId ? new mongoose.Types.ObjectId(moduleId) : null),
        updatedAt: new Date()
      };
    });

    console.log('处理后的数据:', processedIssues);

    // 使用 bulkWrite 批量处理
    const operations = processedIssues.map(issue => {
      const { _id, ...issueData } = issue;
      if (_id && mongoose.Types.ObjectId.isValid(_id)) {
        return {
          updateOne: {
            filter: { _id: new mongoose.Types.ObjectId(_id) },
            update: { $set: issueData },
            upsert: true
          }
        };
      } else {
        return {
          insertOne: {
            document: {
              ...issueData,
              createdAt: new Date()
            }
          }
        };
      }
    });

    console.log('数据库操作:', operations);

    const result = await Issue.bulkWrite(operations);
    console.log('数据库操作结果:', result);
    
    // 获取更新后的问题列表
    const query = { projectId: new mongoose.Types.ObjectId(projectId) };
    if (moduleId && moduleId !== 'all') {
      query.moduleId = new mongoose.Types.ObjectId(moduleId);
    }
    const updatedIssues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .exec();

    res.json(updatedIssues);
  } catch (error) {
    console.error('Error batch updating issues:', error);
    res.status(500).json({ 
      message: '保存问题失败',
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : undefined,
      stack: error.stack
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
