const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const BILIBILI_CLIENT_ID = process.env.BILIBILI_CLIENT_ID || '';
const BILIBILI_CLIENT_SECRET = process.env.BILIBILI_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3001/bilibili/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001/parallax-demo.html';

const USE_MOCK = !BILIBILI_CLIENT_ID || !BILIBILI_CLIENT_SECRET;

const MOCK_FOLLOWING = [
  { mid: '1', uname: '编程技术分享', sign: '前端开发 | React专家 | 每日分享前端干货', face: '', vip: { type: 1 } },
  { mid: '2', uname: '系统架构实验室', sign: '分布式系统 | 微服务架构 | 云原生', face: '', vip: { type: 0 } },
  { mid: '3', uname: '认知科学前沿', sign: '心理学 | 认知神经科学 | 行为经济学', face: '', vip: { type: 1 } },
  { mid: '4', uname: 'AI算法工程师', sign: '深度学习 | 大模型 | 计算机视觉', face: '', vip: { type: 0 } },
  { mid: '5', uname: '产品思维训练营', sign: '产品经理 | 用户体验 | 互联网思维', face: '', vip: { type: 0 } },
  { mid: '6', uname: '设计美学志', sign: '平面设计 | 品牌设计 | 设计思维', face: '', vip: { type: 1 } },
  { mid: '7', uname: '历史调研室', sign: '世界史 | 中国史 | 历史人物', face: '', vip: { type: 0 } },
  { mid: '8', uname: '经济学入门', sign: '宏观经济 | 微观经济 | 投资理财', face: '', vip: { type: 0 } }
];

app.get('/api/bilibili/login', (req, res) => {
  if (USE_MOCK) {
    const state = Math.random().toString(36).substring(2, 15);
    const mockAuthUrl = `/bilibili/mock-auth?state=${state}`;
    return res.json({ url: mockAuthUrl, isMock: true });
  }
  
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = `https://api.bilibili.com/x/account-oauth2/authorize?client_id=${BILIBILI_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${state}`;
  res.json({ url: authUrl, isMock: false });
});

app.get('/bilibili/mock-auth', (req, res) => {
  const { state } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>B站授权 - 模拟</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f6f7f8;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .auth-card {
          background: white;
          border-radius: 16px;
          padding: 40px 32px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .bilibili-logo {
          font-size: 48px;
          margin-bottom: 12px;
        }
        .auth-title {
          font-size: 20px;
          font-weight: 600;
          color: #18191c;
          margin-bottom: 8px;
        }
        .auth-subtitle {
          font-size: 13px;
          color: #9499a0;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          color: #61666d;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e3e5e7;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus {
          border-color: #fb7299;
        }
        .auth-btn {
          width: 100%;
          padding: 12px;
          background: #fb7299;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s;
        }
        .auth-btn:hover {
          background: #fc8d9f;
        }
        .mock-notice {
          margin-top: 20px;
          padding: 12px;
          background: #fff4f7;
          border-radius: 8px;
          font-size: 12px;
          color: #fb7299;
          text-align: center;
        }
        .scope-list {
          margin: 20px 0;
          padding: 16px;
          background: #f6f7f8;
          border-radius: 8px;
        }
        .scope-title {
          font-size: 13px;
          font-weight: 500;
          color: #18191c;
          margin-bottom: 10px;
        }
        .scope-item {
          font-size: 12px;
          color: #61666d;
          padding: 4px 0;
          padding-left: 16px;
          position: relative;
        }
        .scope-item::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #fb7299;
        }
      </style>
    </head>
    <body>
      <div class="auth-card">
        <div class="auth-header">
          <div class="bilibili-logo">📺</div>
          <h1 class="auth-title">模拟B站授权登录</h1>
          <p class="auth-subtitle">视差 Parallax 请求访问你的账号信息</p>
        </div>
        
        <div class="scope-list">
          <div class="scope-title">授权后将获取以下权限：</div>
          <div class="scope-item">读取你的关注列表</div>
          <div class="scope-item">读取你的投稿视频信息</div>
          <div class="scope-item">读取你的个人资料</div>
        </div>
        
        <div class="form-group">
          <label class="form-label">B站账号（模拟）</label>
          <input type="text" class="form-input" id="username" placeholder="输入任意账号名" value="demo_user">
        </div>
        <div class="form-group">
          <label class="form-label">密码（模拟）</label>
          <input type="password" class="form-input" id="password" placeholder="输入任意密码" value="123456">
        </div>
        
        <button class="auth-btn" onclick="doAuth()">授权并登录</button>
        
        <div class="mock-notice">
          🔧 当前为模拟模式<br>配置 BILIBILI_CLIENT_ID 后将使用真实B站授权
        </div>
      </div>
      
      <script>
        function doAuth() {
          const state = new URLSearchParams(window.location.search).get('state');
          const mockCode = 'mock_code_' + Math.random().toString(36).substring(2, 15);
          window.location.href = '/bilibili/callback?code=' + mockCode + '&state=' + state;
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/bilibili/callback', async (req, res) => {
  const { code, state } = req.query;
  
  let accessToken = null;
  
  if (USE_MOCK) {
    accessToken = 'mock_access_token_' + Date.now();
  } else {
    try {
      const tokenResponse = await axios.post('https://api.bilibili.com/x/account-oauth2/token', {
        client_id: BILIBILI_CLIENT_ID,
        client_secret: BILIBILI_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI
      });
      accessToken = tokenResponse.data.access_token;
    } catch (error) {
      console.error('获取token失败:', error.message);
    }
  }
  
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>授权成功</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #0A0E17;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          color: white;
        }
        .success-card {
          text-align: center;
          padding: 40px;
        }
        .success-icon {
          font-size: 64px;
          margin-bottom: 24px;
          animation: bounce 0.6s ease;
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .success-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 12px;
          background: linear-gradient(135deg, #22D3EE, #A78BFA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .success-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 24px;
        }
        .btn {
          display: inline-block;
          padding: 12px 32px;
          background: linear-gradient(135deg, #FB7299, #FC8D9F);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .btn:hover { transform: translateY(-2px); }
      </style>
    </head>
    <body>
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h1 class="success-title">B站授权成功</h1>
        <p class="success-desc">正在返回视差，准备为你生成个性化推荐...</p>
        <a href="#" class="btn" onclick="goBack(); return false;">返回视差</a>
      </div>
      
      <script>
        var token = ${JSON.stringify(accessToken)};
        var isMock = ${USE_MOCK ? 'true' : 'false'};
        
        function goBack() {
          if (window.opener) {
            window.opener.postMessage({
              type: 'BILIBILI_AUTH_SUCCESS',
              accessToken: token,
              isMock: isMock
            }, '*');
            window.close();
          } else {
            localStorage.setItem('bilibili_temp_token', token);
            localStorage.setItem('bilibili_temp_mock', isMock);
            window.location.href = ${JSON.stringify(FRONTEND_URL)};
          }
        }
        
        setTimeout(goBack, 1000);
      </script>
    </body>
    </html>
  `);
});

app.get('/api/bilibili/following', async (req, res) => {
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(400).json({ error: '缺少 access_token' });
  }
  
  if (USE_MOCK) {
    return res.json({
      code: 0,
      message: 'success',
      data: {
        list: MOCK_FOLLOWING,
        total: MOCK_FOLLOWING.length
      }
    });
  }
  
  try {
    const response = await axios.get('https://api.bilibili.com/x/relation/followings', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'Parallax-App/1.0'
      },
      params: {
        ps: 50,
        pn: 1,
        order: 'desc'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('获取关注列表失败:', error.message);
    res.status(500).json({ error: '获取关注列表失败', details: error.message });
  }
});

app.get('/api/bilibili/user/info', async (req, res) => {
  const { access_token } = req.query;
  
  if (!access_token) {
    return res.status(400).json({ error: '缺少 access_token' });
  }
  
  if (USE_MOCK) {
    return res.json({
      code: 0,
      message: 'success',
      data: {
        mid: '12345678',
        uname: '视差用户',
        sign: '用视差，看见不同的世界',
        face: '',
        level: 5
      }
    });
  }
  
  try {
    const response = await axios.get('https://api.bilibili.com/x/account-oauth2/info', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'Parallax-App/1.0'
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('获取用户信息失败:', error.message);
    res.status(500).json({ error: '获取用户信息失败', details: error.message });
  }
});

app.get('/api/bilibili/videos', async (req, res) => {
  const { access_token, mid } = req.query;
  
  if (!access_token) {
    return res.status(400).json({ error: '缺少 access_token' });
  }
  
  if (USE_MOCK) {
    return res.json({
      code: 0,
      message: 'success',
      data: {
        list: [
          { aid: '1', title: '我的第一个React项目', desc: '记录学习历程', created: 1705296000, play: 1234 },
          { aid: '2', title: '前端性能优化实战', desc: '从入门到精通', created: 1710979200, play: 5678 }
        ],
        total: 2
      }
    });
  }
  
  try {
    const response = await axios.get('https://api.bilibili.com/x/space/wbi/arc/search', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'Parallax-App/1.0'
      },
      params: {
        mid,
        ps: 20,
        pn: 1
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('获取投稿列表失败:', error.message);
    res.status(500).json({ error: '获取投稿列表失败', details: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mockMode: USE_MOCK,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   视差 Parallax - B站代理服务                ║
╠══════════════════════════════════════════════╣
║   端口: ${PORT}
║   模式: ${USE_MOCK ? '🔧 模拟模式（未配置B站密钥）' : '✅ 真实模式'}
║   前端: ${FRONTEND_URL}
║   回调: ${REDIRECT_URI}
╠══════════════════════════════════════════════╣
║   健康检查: http://localhost:${PORT}/api/health
╚══════════════════════════════════════════════╝
  `);
});
