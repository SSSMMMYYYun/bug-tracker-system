require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const dingTalkRoutes = require('./routes/dingTalkRoutes');
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/issue-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// 路由
app.use('/api/dingtalk', dingTalkRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/projects', projectRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
