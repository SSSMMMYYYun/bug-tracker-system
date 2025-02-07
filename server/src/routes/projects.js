const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// 获取所有项目
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('modules');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个项目
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('modules');
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建新项目
router.post('/', async (req, res) => {
  const project = new Project({
    name: req.body.name,
    description: req.body.description
  });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新项目
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: '项目不存在' });
    }

    if (req.body.name) {
      project.name = req.body.name;
    }
    if (req.body.description) {
      project.description = req.body.description;
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除项目
router.delete('/:id', async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: '项目不存在' });
    }
    res.json({ message: '项目已删除' });
  } catch (error) {
    console.error('删除项目时出错:', error);
    res.status(500).json({ message: '删除项目失败' });
  }
});

module.exports = router;
