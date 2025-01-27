const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Issue = require('../models/Issue');
const auth = require('../middleware/auth');

// 获取项目列表
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({});

    // 获取每个项目的统计信息
    const projectsWithStats = await Promise.all(projects.map(async (project) => {
      const stats = {
        totalIssues: 0,
        pendingIssues: 0,
        todayIssues: 0
      };

      // 获取今天的开始时间
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 查询该项目的所有问题
      const issues = await Issue.find({ projectId: project._id });
      
      stats.totalIssues = issues.length;
      stats.pendingIssues = issues.filter(issue => 
        ['ongoing', '开发完成待验证', '待开发解决', '测试复现'].includes(issue.status)
      ).length;
      stats.todayIssues = issues.filter(issue => 
        issue.resolvedAt && issue.resolvedAt >= today
      ).length;

      return {
        ...project.toObject(),
        stats
      };
    }));

    res.json(projectsWithStats);
  } catch (error) {
    res.status(500).json({ message: '获取项目列表失败' });
  }
});

// 创建新项目
router.post('/', async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      createdBy: '65b0d5e2e67f2df8e55c0001', // 临时使用一个固定的用户ID
      members: [{ user: '65b0d5e2e67f2df8e55c0001', role: 'owner' }]
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('创建项目失败:', error);
    res.status(400).json({ message: '创建项目失败' });
  }
});

// 更新项目
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    Object.assign(project, req.body);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: '更新项目失败' });
  }
});

// 删除项目
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    await project.remove();
    res.json({ message: '项目已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除项目失败' });
  }
});

// 添加项目成员
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role = 'member' } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    // 检查用户是否已经是成员
    if (project.members.some(member => member.user.equals(userId))) {
      return res.status(400).json({ message: '用户已经是项目成员' });
    }

    project.members.push({ user: userId, role });
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(400).json({ message: '添加成员失败' });
  }
});

// 创建模块
router.post('/:id/modules', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    project.modules.push({
      name,
      description,
      createdBy: '65b0d5e2e67f2df8e55c0001' // 临时使用一个固定的用户ID
    });

    await project.save();
    res.json(project.modules[project.modules.length - 1]);
  } catch (error) {
    res.status(400).json({ message: '创建模块失败' });
  }
});

// 获取项目统计信息
router.get('/:id/statistics', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取今天的开始时间
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查询该项目的所有问题
    const issues = await Issue.find({ projectId: id });
    
    // 按模块统计
    const moduleStats = {};
    issues.forEach(issue => {
      if (!moduleStats[issue.moduleId]) {
        moduleStats[issue.moduleId] = {
          pending: 0,
          today: 0
        };
      }

      if (['ongoing', '开发完成待验证', '待开发解决', '测试复现'].includes(issue.status)) {
        moduleStats[issue.moduleId].pending++;
      }

      if (issue.resolvedAt && issue.resolvedAt >= today) {
        moduleStats[issue.moduleId].today++;
      }
    });

    res.json({
      total: issues.length,
      moduleStats
    });
  } catch (error) {
    res.status(500).json({ message: '获取统计信息失败' });
  }
});

module.exports = router;
