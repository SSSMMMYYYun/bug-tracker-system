const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null
  },
  sequenceNumber: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    enum: ['体验问题', 'bug', '转需求', '其他'],
    default: '其他'
  },
  status: {
    type: String,
    enum: ['ongoing', '开发完成待验证', '已解决', '待开发解决', '测试复现', 'close', 'reopen'],
    default: 'ongoing'
  },
  description: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['P0', 'P1', 'P2'],
    default: 'P1'
  },
  title: {
    type: String,
    default: ''
  },
  assignee: {
    type: String,
    default: ''
  },
  reporter: {
    type: String,
    default: ''
  },
  reportTime: {
    type: Date,
    default: Date.now
  },
  resolver: {
    type: String,
    default: ''
  },
  resolveTime: {
    type: Date,
    default: null
  },
  comment: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // 自动管理 createdAt 和 updatedAt
});

// 创建索引以提高查询性能
issueSchema.index({ projectId: 1, moduleId: 1 });
issueSchema.index({ type: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Issue', issueSchema);
