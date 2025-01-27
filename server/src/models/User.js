const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  dingUserId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: String,
  email: String,
  mobile: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
});

// 更新最后登录时间
userSchema.pre('save', function(next) {
  if (this.isModified('lastLoginAt')) {
    this.lastLoginAt = new Date();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
