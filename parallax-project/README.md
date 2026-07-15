# 视差 | Parallax

> AI 驱动的认知破茧工具 — 测绘你的认知茧房，从最薄的地方破开。

推荐算法让我们越来越"窄"——它只推我们已经喜欢的东西，于是我们看到的世界不断自我印证。**视差** 反其道而行：用 AI 测绘你认知边界的形状，再用「小切口」推荐帮你从熟悉处深潜、从相通处跨域。

像素风 + CMD 终端视觉，单文件纯前端 + Node 代理，点开即用。

---

## 目录

- [Demo 简介](#demo-简介)
- [整体架构](#整体架构)
- [9 个 Screen 页面体系](#9-个-screen-页面体系)
- [前端模块分层](#前端模块分层)
- [数据模型](#数据模型)
- [AI 调用链路](#ai-调用链路)
- [后端代理](#后端代理)
- [用户主流程](#用户主流程)
- [技术栈](#技术栈)
- [快速开始](#快速开始)

---

## Demo 简介

**是什么**：纯前端网站（单文件 HTML + Canvas 2D + Node.js 代理），像素风 + CMD 终端视觉，用 AI 帮用户看见认知边界之外的盲区。

**面向谁**：被信息茧房困住、想突破却不知从何下手的内容创作者、学生、终身学习者——尤其是已经"学得越多越觉得自己窄"的人。

**核心功能**：

1. **六维认知测绘** — 通过 AI 对话评测，把思维画像落到六个维度（逻辑分析、感性直觉、系统构建、表达叙事、实证探究、审美创造），绘制雷达图。个人特质页聚合所有历史评测，画出综合六维图。
2. **双推荐系统** —
   - **垂直深潜**：在用户已有领域内，给一个"小切口"入口。
   - **水平桥接**：跨领域推荐底层逻辑相似的方向。
   - 推荐结构为 `hook → preview → detail`：先抛一句话钩子，用户感兴趣点"展开看看"才显示 detail，且 detail 带**具体网址**（B 站某老师的课、豆瓣某本书等），可点击直达。
3. **像素风 + CMD 终端 UI** — 介绍页打字机逐字输出 7 句文案；对话框模拟 macOS 终端（红黄绿圆点标题栏 + Cubic 11 中文点阵像素字体）；按钮/卡片用 `clip-path polygon` 切出像素阶梯角。

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    浏览器（用户端）                              │
│                                                                 │
│   parallax-demo.html  （单文件纯前端，~4400行）                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  ① 视觉层  Canvas 2D 星空粒子动画背景                     │   │
│   │  ② UI 层    9 个 Screen 切换 + 像素风 CSS                │   │
│   │  ③ 逻辑层  状态机 + DeepSeek 调用 + 推荐渲染            │   │
│   │  ④ 存储层  localStorage 持久化                            │   │
│   └─────────────────────────────────────────────────────────┘   │
│             │                    │                               │
│   fetch DeepSeek API     fetch /api/bilibili/*                   │
└─────────────┼────────────────────┼──────────────────────────────┘
              │                    │
              ▼                    ▼
   ┌──────────────────┐   ┌──────────────────────┐
   │  DeepSeek API    │   │  server/index.js      │
   │  (外部 LLM)      │   │  Node + Express :3001 │
   │  deepseek-chat   │   │                        │
   │  temperature 0.7 │   │  · 静态托管 HTML        │
   │  max_tokens 2000 │   │  · /api/bilibili/login │
   └──────────────────┘   │  · /bilibili/callback  │
                          │  · /api/bilibili/      │
                          │     following          │
                          │  · /api/health         │
                          │  · Mock 模式（无Key时） │
                          └──────────────────────┘
```

### 项目结构

```
parallax-project/
├── parallax-demo.html      # 单文件前端（核心，~4400行）
├── README.md              # 本文档
├── .gitignore
├── assets/
│   └── xiaochai.jpg
└── server/
    ├── index.js           # Node + Express 代理（端口 3001）
    ├── package.json
    ├── .gitignore
    └── node_modules/      # 已 gitignore
```

---

## 9 个 Screen 页面体系

| Screen | id | 角色 | 关键内容 |
|---|---|---|---|
| 介绍页 | `screen-intro` | CMD 开场 | 打字机逐字输出 7 句文案，Enter 翻页 / 跳过 |
| 欢迎页 | `screen-0` | 入口 | 视差标题 + Slogan + 名字输入 + 6 平台图标 + 授权弹窗 + 三按钮 |
| 领域选择 | `screen-1` | 画像采集 | 单选 1/1，30+ 细分领域（番剧/三国杀/美妆/游戏/漫画/ACG…） |
| 深度评测 | `screen-2` | AI 对话 | 多轮提问 → 抽取六维 → 生成认知画像 |
| 结果推荐 | `screen-3` | 首次双推 | 雷达图 + 垂直深潜/水平桥接 双推荐（仅首次合并展示） |
| 主页 | `screen-4` | 中心枢纽 | CMD 风格对话框 + 深潜/桥接/特质入口 |
| 深潜页 | `screen-dive` | 独立深潜 | 只显示垂直深潜推荐 |
| 桥接页 | `screen-bridge` | 独立桥接 | 只显示水平桥接推荐 |
| 探索页 | `screen-explore` | 新领域 | 单选新领域后触发桥接推荐 |

切换由 `goToScreen(n)` 统一调度。

---

## 前端模块分层

```
┌──────────────────────────────────────────────────────────┐
│  视觉层 (Visual)                                          │
│   · initStarsBg / animateStarsBg   Canvas 星空粒子        │
│   · Cubic 11 像素字体 (@font-face CDN)                   │
│   · clip-path polygon 像素阶梯角（glass-card/btn/chip…）  │
│   · CMD 终端风 ::before 红黄绿圆点标题栏                  │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  UI / 交互层 (UI)                                         │
│   · startIntro/typeIntro/nextIntro/skipIntro  介绍页     │
│   · toggleField/refreshFields/addCustomField   领域选择  │
│   · handleChatKeydown/sendUserMessage/selectOption  对话 │
│   · toggleRecDetail / linkifyDetail  推荐展开+链接化     │
│   · showAbout/showAuthToast/showSpectrum  弹窗/光谱      │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  业务逻辑层 (Business)                                    │
│   · extractProfileFromAPI    AI 抽取六维画像             │
│   · generateProfile          生成认知标签/层级           │
│   · renderRadarChart         六维雷达图                  │
│   · fetchRecommendationsFromAPI  首次双推荐               │
│   · generateDiveRecs / generateHomeBridgeRecs  分页推荐  │
│   · createRecItem (hook→preview→detail 三层渲染)        │
│   · logAction                操作计入记录                │
└──────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────┐
│  数据 / 存储层 (Data)                                     │
│   · state 对象  (observerName/currentEvaluation/...)     │
│   · saveToLocalStorage / loadFromLocalStorage / loadData │
│     IntoState   key = parallax_data_{observerName}       │
└──────────────────────────────────────────────────────────┘
```

---

## 数据模型

### 1. `state`（内存态）

```javascript
state = {
  observerName,            // 用户名
  selectedFields: [],      // 当前所选领域
  currentEvaluation: {     // 当前评测
    date, selectedFields, dimensions(六维),
    level, deepRecs, bridgeRecs
  },
  historyEvaluations: [],  // 历史评测（综合雷达图数据源）
  exploreCount,            // 探索次数
  actionLog: [],           // 操作记录
  quickFeedbackHistory
}
```

### 2. localStorage 持久化结构

```
key:   parallax_data_{observerName}
value: { observerName, currentEvaluation, historyEvaluations,
         quickFeedbackHistory, exploreCount, lastExploreTime, actionLog }
```

### 3. 六维模型

```
逻辑分析 · 感性直觉 · 系统构建 · 表达叙事 · 实证探究 · 审美创造
（每维 0–100 分，雷达图渲染）
```

### 4. 推荐数据结构（hook → preview → detail 三层小切口）

```json
{
  "deep":   [{ "hook": "...", "preview": "...", "detail": "..." }],
  "bridge": [{ "hook": "...", "preview": "...", "detail": "..." }]
}
```

- `hook`：一句话钩子，默认显示
- `preview`：1–2 句说明，默认显示
- `detail`：用户点"感兴趣？展开看看"才显示；含具体网址（B 站/豆瓣等），由 `linkifyDetail()` 转为可点击链接

---

## AI 调用链路

```
            ┌─────────────────────────────────────┐
            │  callDeepSeekAPI(prompt, system)    │  统一入口
            │  model: deepseek-chat              │
            │  temperature: 0.7  max_tokens:2000 │
            └─────────────────────────────────────┘
                          │
       ┌──────────────────┼──────────────────┐
       ▼                  ▼                  ▼
 extractProfileFromAPI  fetchRecommendations   generateDiveRecs /
 (评测六维抽取)        FromAPI(首次双推)       generateHomeBridgeRecs
                                               (分页深潜/桥接)
```

四处 Prompt 注入点（均要求 JSON 输出 + 小切口 + detail 带网址）：

| 位置 | 用途 |
|---|---|
| `extractProfileFromAPI` | 从对话抽取六维画像 |
| `fetchRecommendationsFromAPI` | Screen 3 首次评测双推荐 |
| `generateHomeBridgeRecs` | 主页/桥接页水平桥接推荐 |
| `startHomeDive` | 主页/深潜页垂直深潜推荐 |

---

## 后端代理

`server/index.js` — Node.js + Express，端口 3001：

```
Express :3001
├─ express.static('..')              ← 托管 parallax-demo.html
├─ /api/health                       ← 健康检查（返回 mockMode）
├─ /api/bilibili/login               ← 返回授权 URL（真/Mock）
├─ /bilibili/mock-auth               ← Mock 授权页
├─ /bilibili/callback                ← 授权回调（换 token）
└─ /api/bilibili/following           ← 拉取关注列表

USE_MOCK = 未配置 BILIBILI_CLIENT_ID/SECRET 时自动启用 Mock 模式
```

---

## 用户主流程

```
加载 → localStorage 有数据? ─是→ 主页(screen-4)
              │否
              ▼
        介绍页(intro) ─Enter→ 欢迎页(0)
              │输入名+开始探索
              ▼
        领域选择(1) ─单选1/1→ 深度评测(2)
              │AI 多轮对话
              ▼
        结果推荐(3) ─雷达图+双推→ 主页(4)
              │
   ┌──────────┼──────────┐
   ▼          ▼          ▼
 深潜页    桥接页     个人特质页
(dive)   (bridge)   (综合六维雷达)
```

---

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | 原生 HTML/CSS/JS（单文件）、Canvas 2D |
| 字体 | Cubic 11（jsdelivr CDN woff2）|
| 像素角 | CSS `clip-path polygon` + `filter: drop-shadow()` |
| CMD 风 | `::before` 伪元素 + 径向渐变圆点 |
| AI | DeepSeek API（`deepseek-chat`）|
| 后端 | Node.js + Express |
| 第三方 | B 站 OAuth（含 Mock 模式）|
| 存储 | localStorage（按用户名隔离）|

---

## 快速开始

### 1. 配置环境变量

```bash
cd server
cp .env.example .env   # 如无则手动创建
```

`.env` 内容：

```
DEEPSEEK_API_KEY=你的_deepseek_key
BILIBILI_CLIENT_ID=可选
BILIBILI_CLIENT_SECRET=可选
```

> 未配置 B 站密钥时，后端自动启用 Mock 模式，不阻塞体验。

### 2. 安装依赖并启动后端

```bash
cd server
npm install
npm start
# → 视差 Parallax - B站代理服务启动，端口: 3001
```

### 3. 打开前端

浏览器访问 `http://localhost:3001/parallax-demo.html`

> 前端 `parallax-demo.html` 顶部的 `DEEPSEEK_API_KEY` 也需填写（或通过代理读取环境变量）。

---

## 设计理念

- **小切口推荐**：人不会被一本《费曼物理学讲义》打动，但会被"看看物理奥赛国家集训队队员的感想？"勾住。所以推荐分三层——钩子 → 预览 → 细节，用户感兴趣才展开。
- **双轴互补**：深潜让人在熟悉领域挖深，桥接让人跨出去，两者互补才完整。
- **像素 + CMD 视觉**：契合"破茧/解构/重构"的认知主题——像素代表拆解，终端代表"重新输入认知"。
- **零部署门槛**：单文件纯前端 + localStorage，点开即用。

---

## License

MIT
