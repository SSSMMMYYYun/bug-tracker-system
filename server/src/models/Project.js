const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  modules: [moduleSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'member'],
      default: 'member'
    }
  }]
}, {
  timestamps: true
});

// 创建索引
projectSchema.index({ name: 1 });
moduleSchema.index({ name: 1 });

module.exports = mongoose.model('Project', projectSchema);
