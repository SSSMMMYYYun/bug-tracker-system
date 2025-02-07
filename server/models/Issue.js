const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true
  },
  moduleId: {
    type: String
  },
  type: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    default: ''
  },
  reporter: {
    type: String,
    default: ''
  },
  reportTime: {
    type: Date,
    default: null
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
