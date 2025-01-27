const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.activeUsers = new Map(); // 存储在线用户
    this.userSockets = new Map(); // 存储用户的socket连接

    this.setupSocketHandlers();
  }

  // 验证用户token
  async authenticateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
      const user = await User.findById(decoded.userId);
      return user;
    } catch (error) {
      return null;
    }
  }

  // 设置Socket.IO事件处理
  setupSocketHandlers() {
    this.io.on('connection', async (socket) => {
      console.log('New client connected');

      // 用户认证
      socket.on('authenticate', async ({ token }) => {
        const user = await this.authenticateToken(token);
        if (user) {
          this.activeUsers.set(socket.id, user);
          this.userSockets.set(user._id.toString(), socket);
          
          // 加入用户的项目房间
          socket.join(`user:${user._id}`);
          
          // 广播用户在线状态
          this.broadcastUserStatus(user._id, true);
          
          // 发送当前在线用户列表
          this.emitActiveUsers();
        }
      });

      // 加入项目房间
      socket.on('joinProject', (projectId) => {
        const user = this.activeUsers.get(socket.id);
        if (user) {
          socket.join(`project:${projectId}`);
          console.log(`User ${user.name} joined project ${projectId}`);
        }
      });

      // 离开项目房间
      socket.on('leaveProject', (projectId) => {
        socket.leave(`project:${projectId}`);
      });

      // 问题更新
      socket.on('issueUpdate', (data) => {
        const user = this.activeUsers.get(socket.id);
        if (user) {
          socket.to(`project:${data.projectId}`).emit('issueUpdated', {
            ...data,
            updatedBy: {
              id: user._id,
              name: user.name
            }
          });
        }
      });

      // 实时编辑状态
      socket.on('startEditing', (data) => {
        const user = this.activeUsers.get(socket.id);
        if (user) {
          socket.to(`project:${data.projectId}`).emit('userStartedEditing', {
            issueId: data.issueId,
            user: {
              id: user._id,
              name: user.name
            }
          });
        }
      });

      socket.on('stopEditing', (data) => {
        const user = this.activeUsers.get(socket.id);
        if (user) {
          socket.to(`project:${data.projectId}`).emit('userStoppedEditing', {
            issueId: data.issueId,
            user: {
              id: user._id,
              name: user.name
            }
          });
        }
      });

      // 新评论通知
      socket.on('newComment', (data) => {
        const user = this.activeUsers.get(socket.id);
        if (user) {
          // 通知项目成员
          socket.to(`project:${data.projectId}`).emit('commentAdded', {
            ...data,
            user: {
              id: user._id,
              name: user.name
            }
          });

          // 如果评论@了某人，单独通知
          if (data.mentions && data.mentions.length > 0) {
            data.mentions.forEach(userId => {
              const userSocket = this.userSockets.get(userId);
              if (userSocket) {
                userSocket.emit('mentioned', {
                  issueId: data.issueId,
                  commentId: data.commentId,
                  mentionedBy: {
                    id: user._id,
                    name: user.name
                  }
                });
              }
            });
          }
        }
      });

      // 断开连接处理
      socket.on('disconnect', () => {
        const user = this.activeUsers.get(socket.id);
        if (user) {
          this.activeUsers.delete(socket.id);
          this.userSockets.delete(user._id.toString());
          this.broadcastUserStatus(user._id, false);
          this.emitActiveUsers();
        }
        console.log('Client disconnected');
      });
    });
  }

  // 广播用户状态变化
  broadcastUserStatus(userId, isOnline) {
    this.io.emit('userStatusChanged', {
      userId,
      isOnline
    });
  }

  // 发送在线用户列表
  emitActiveUsers() {
    const users = Array.from(this.activeUsers.values()).map(user => ({
      id: user._id,
      name: user.name
    }));
    this.io.emit('activeUsers', users);
  }

  // 发送通知给特定用户
  sendNotification(userId, notification) {
    const userSocket = this.userSockets.get(userId.toString());
    if (userSocket) {
      userSocket.emit('notification', notification);
    }
  }

  // 广播项目更新
  broadcastProjectUpdate(projectId, update) {
    this.io.to(`project:${projectId}`).emit('projectUpdated', update);
  }
}

module.exports = SocketService;
