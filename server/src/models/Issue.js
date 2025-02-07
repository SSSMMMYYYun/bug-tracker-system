const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  projectId: {
    type: String,
    default: 'default'
  },
  moduleId: {
    type: String,
    default: 'all'
  },
  sequenceNumber: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    required: true
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
  resolveTime: {
    type: Date
  },
  comment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  strict: false // 允许存储模式中未定义的字段
});

module.exports = mongoose.model('Issue', issueSchema);
