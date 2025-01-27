// 注意：实际开发时需要将这些值存储在环境变量中
const DINGTALK_CONFIG = {
  appKey: process.env.DINGTALK_APP_KEY || 'your_app_key',
  appSecret: process.env.DINGTALK_APP_SECRET || 'your_app_secret',
  corpId: process.env.DINGTALK_CORP_ID || 'your_corp_id',
  agentId: process.env.DINGTALK_AGENT_ID || 'your_agent_id'
};

module.exports = {
  DINGTALK_CONFIG
};
