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
  { mid: '1', uname: '编程技术分享', sign: '前端开发 | React专家', face: '', vip: { type: 1 } },
  { mid: '2', uname: '系统架构实验室', sign: '分布式系统 | 微服务', face: '', vip: { type: 0 } },
  { mid: '3', uname: '认知科学前沿', sign: '心理学 | 认知神经科学', face: '', vip: { type: 1 } },
  { mid: '4', uname: 'AI算法工程师', sign: '深度学习 | 大模型', face: '', vip: { type: 0 } }
];

app.get('/api/bilibili/login', (req, res) => {
  if (USE_MOCK) {
    const state = Math.random().toString(36).substring(2, 15);
    return res.json({ url: `/bilibili/mock-auth?state=${state}`, isMock: true });
  }
  const state = Math.random().toString(36).substring(2, 15);
  const authUrl = `https://api.bilibili.com/x/account-oauth2/authorize?client_id=${BILIBILI_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${state}`;
  res.json({ url: authUrl, isMock: false });
});

app.get('/bilibili/mock-auth', (req, res) => {
  const { state } = req.query;
  res.send(`
    <!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>B站授权 - 模拟</title>
    <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f6f7f8;display:flex;align-items:center;justify-content:center;min-height:100vh;}
    .auth-card{background:white;border-radius:16px;padding:40px 32px;width:90%;max-width:400px;box-shadow:0 8px 32px rgba(0,0,0,0.08);}
    .auth-header{text-align:center;margin-bottom:32px;}
    .auth-title{font-size:20px;font-weight:600;color:#18191c;margin-bottom:8px;}
    .auth-subtitle{font-size:13px;color:#9499a0;}
    .form-group{margin-bottom:16px;}
    .form-label{display:block;font-size:13px;color:#61666d;margin-bottom:8px;}
    .form-input{width:100%;padding:12px 14px;border:1px solid #e3e5e7;border-radius:8px;font-size:14px;outline:none;transition:border-color 0.2s;}
    .form-input:focus{border-color:#fb7299;}
    .auth-btn{width:100%;padding:12px;background:#fb7299;color:white;border:none;border-radius:8px;font-size:15px;font-weight:500;cursor:pointer;margin-top:8px;}
    .mock-notice{margin-top:20px;padding:12px;background:#fff4f7;border-radius:8px;font-size:12px;color:#fb7299;text-align:center;}
    </style></head>
    <body><div class="auth-card"><div class="auth-header"><div>📺</div><h1 class="auth-title">模拟B站授权登录</h1><p class="auth-subtitle">视差 Parallax 请求访问你的账号信息</p></div>
    <div class="form-group"><label class="form-label">B站账号（模拟）</label><input type="text" class="form-input" id="username" value="demo_user"></div>
    <div class="form-group"><label class="form-label">密码（模拟）</label><input type="password" class="form-input" id="password" value="123456"></div>
    <button class="auth-btn" onclick="doAuth()">授权并登录</button><div class="mock-notice">🔧 当前为模拟模式</div></div>
    <script>function doAuth(){const state=new URLSearchParams(window.location.search).get('state');const mockCode='mock_code_'+Math.random().toString(36).substring(2,15);window.location.href='/bilibili/callback?code='+mockCode+'&state='+state;}</script></body></html>
  `);
});

app.get('/bilibili/callback', async (req, res) => {
  const { code, state } = req.query;
  let accessToken = USE_MOCK ? 'mock_access_token_' + Date.now() : null;
  
  if (!USE_MOCK) {
    try {
      const response = await axios.post('https://api.bilibili.com/x/account-oauth2/token', {
        client_id: BILIBILI_CLIENT_ID, client_secret: BILIBILI_CLIENT_SECRET,
        code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI
      });
      accessToken = response.data.access_token;
    } catch (e) { console.error('获取token失败:', e.message); }
  }
  
  res.send(`
    <!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>授权成功</title>
    <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0A0E17;display:flex;align-items:center;justify-content:center;min-height:100vh;color:white;}
    .success-card{text-align:center;padding:40px;}
    .success-icon{font-size:64px;margin-bottom:24px;animation:bounce 0.6s ease;}
    @keyframes bounce{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
    .success-title{font-size:24px;font-weight:600;margin-bottom:12px;background:linear-gradient(135deg,#22D3EE,#A78BFA);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
    .success-desc{font-size:14px;color:rgba(255,255,255,0.6);margin-bottom:24px;}
    .btn{display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#FB7299,#FC8D9F);color:white;border:none;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;text-decoration:none;}
    </style></head>
    <body><div class="success-card"><div class="success-icon">✅</div><h1 class="success-title">B站授权成功</h1><p class="success-desc">正在返回视差...</p><a href="#" class="btn" onclick="goBack();return false;">返回视差</a></div>
    <script>var token=${JSON.stringify(accessToken)};function goBack(){if(window.opener){window.opener.postMessage({type:'BILIBILI_AUTH_SUCCESS',accessToken:token},'*');window.close();}else{localStorage.setItem('bilibili_temp_token',token);window.location.href=${JSON.stringify(FRONTEND_URL)};}}setTimeout(goBack,1000);</script></body></html>
  `);
});

app.get('/api/bilibili/following', async (req, res) => {
  const { access_token } = req.query;
  if (!access_token) return res.status(400).json({ error: '缺少 access_token' });
  
  if (USE_MOCK) {
    return res.json({ code: 0, message: 'success', data: { list: MOCK_FOLLOWING, total: MOCK_FOLLOWING.length } });
  }
  
  try {
    const response = await axios.get('https://api.bilibili.com/x/relation/followings', {
      headers: { 'Authorization': `Bearer ${access_token}`, 'User-Agent': 'Parallax-App/1.0' },
      params: { ps: 50, pn: 1, order: 'desc' }
    });
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: '获取关注列表失败', details: e.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mockMode: USE_MOCK, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`视差 Parallax - B站代理服务启动，端口: ${PORT}`);
});
