const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const multer = require('multer');

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 获取问题列表
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: '获取问题列表失败' });
  }
});

// 创建新问题
router.post('/', async (req, res) => {
  try {
    const issue = new Issue(req.body);
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ message: '创建问题失败' });
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
    res.status(400).json({ message: '更新问题失败' });
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
    res.status(500).json({ message: '删除问题失败' });
  }
});

// 添加评论
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const issue = await Issue.findById(id);
    
    if (!issue) {
      return res.status(404).json({ message: '问题不存在' });
    }

    issue.comments.push({ content });
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ message: '添加评论失败' });
  }
});

// 上传文件
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files.map(file => ({
      filename: file.originalname,
      path: file.path
    }));
    res.json(files);
  } catch (error) {
    res.status(400).json({ message: '文件上传失败' });
  }
});

module.exports = router;
