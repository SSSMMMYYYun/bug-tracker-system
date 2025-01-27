const { default: Client } = require('@alicloud/dingtalk');
const { DINGTALK_CONFIG } = require('../config/dingtalk');

class DingTalkService {
  constructor() {
    this.client = new Client({
      appKey: DINGTALK_CONFIG.appKey,
      appSecret: DINGTALK_CONFIG.appSecret
    });
  }

  async getAccessToken() {
    try {
      const response = await this.client.oauth.getAccessToken();
      return response.body.accessToken;
    } catch (error) {
      console.error('Failed to get DingTalk access token:', error);
      throw error;
    }
  }

  async getUserInfo(authCode) {
    try {
      // 获取用户的 unionId
      const tokenResponse = await this.client.oauth.getUserTokenByCode({
        clientId: DINGTALK_CONFIG.appKey,
        clientSecret: DINGTALK_CONFIG.appSecret,
        code: authCode,
        grantType: 'authorization_code'
      });

      const { accessToken, unionId } = tokenResponse.body;

      // 获取用户详细信息
      const userResponse = await this.client.contact.getUserInfo({
        unionId
      });

      return {
        unionId,
        ...userResponse.body
      };
    } catch (error) {
      console.error('Failed to get DingTalk user info:', error);
      throw error;
    }
  }

  async sendMessage(userId, message) {
    try {
      const accessToken = await this.getAccessToken();
      
      await this.client.message.sendWorkNotification({
        agentId: DINGTALK_CONFIG.agentId,
        userIds: [userId],
        message: {
          msgtype: 'text',
          text: {
            content: message
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to send DingTalk message:', error);
      throw error;
    }
  }
}

module.exports = new DingTalkService();
