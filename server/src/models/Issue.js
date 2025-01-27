const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'file'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  }
});

const issueSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  sequenceNumber: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['体验问题', 'bug', '转需求'],
    required: true
  },
  status: {
    type: String,
    enum: ['ongoing', '开发完成待验证', '已解决', '待开发解决', '测试复现', 'close', '已知问题', '后续版本优化'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['P0', 'P1', 'P2'],
    required: true
  },
  creator: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  createdAt: {
    type: Date,
    required: true
  },
  assignee: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String
  },
  resolvedAt: Date,
  attachments: [attachmentSchema],
  comments: [{
    user: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// 自动生成序号
issueSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const lastIssue = await this.constructor.findOne({
        projectId: this.projectId,
        moduleId: this.moduleId
      }).sort({ sequenceNumber: -1 });

      this.sequenceNumber = lastIssue ? lastIssue.sequenceNumber + 1 : 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Issue', issueSchema);
