const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  id: String,
  type: {
    type: String,
    enum: ['bug', 'feature', 'optimization'],
    default: 'feature'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'done'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  title: String,
  description: String,
  assignee: String,
  reporter: String,
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'createTime',
    updatedAt: 'updateTime'
  }
});

module.exports = mongoose.model('Issue', issueSchema);
