# 飞盘俱乐部 H5 应用

一个面向飞盘俱乐部的移动端管理工具，支持笔记记录、活动报名、数据统计和收费管理。

## 功能模块

- ✅ 用户注册 / 登录（需队长审批）
- ✅ 笔记记录（训练/比赛，评分、位置、体能状态）
- ✅ 活动报名（训练/比赛）
- ✅ 管理员审批后台
- ✅ 角色权限体系（队长、训练管理、比赛管理、试训管理、正式队员、试训队员）
- ⏳ 数据看板（图表展示）
- ⏳ 收费管理（待接入支付）

## 技术栈

- **前端框架**: Vue 3 + Vite
- **UI 组件**: Vant 4（轻量级移动端组件库）
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **后端数据库**: MongoDB Atlas（免费 512MB）

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 部署到 Vercel

### 第一步：配置 MongoDB Atlas

1. 访问 [MongoDB Atlas](https://www.mongodb.com/atlas) 注册账号
2. 创建免费集群（M0 Sandbox）
3. 在左侧菜单选择 **Data API**
4. 开启 Data API，记下 **URL** 和 **API Key**
5. 在 `src/api/db.js` 中替换配置：
   ```javascript
   const CONFIG = {
     API_URL: 'https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1',
     API_KEY: 'YOUR_API_KEY',
   }
   ```

### 第二步：部署到 Vercel

1. 注册 [Vercel](https://vercel.com) 账号（用 GitHub 登录）
2. 在 Vercel 控制台点击 **Add New Project**
3. 导入你的 GitHub 仓库
4. Framework Preset 选择 **Vite**
5. 点击 **Deploy**
6. 部署完成后，Vercel 会给你一个 URL，如 `https://your-project.vercel.app`

### 第三步：生成用户访问二维码

访问 `https://your-project.vercel.app`，用微信扫码打开即可。

## 视频资源

训练/比赛视频建议存放在 iCloud 共享盘，在笔记或活动页面中嵌入分享链接。

如需更流畅的播放体验，可考虑：
- 腾讯云点播（国内访问快）
- B站/小红书私密上传后嵌入播放链接

## 项目结构

```
flyingdisc-h5/
├── src/
│   ├── api/
│   │   └── db.js          # MongoDB Atlas Data API 调用
│   ├── assets/
│   │   └── styles/
│   │       └── main.scss  # 全局样式
│   ├── pages/             # 页面组件
│   │   ├── Login.vue      # 登录
│   │   ├── Register.vue   # 注册
│   │   ├── Pending.vue    # 审核中
│   │   ├── Home.vue       # 首页
│   │   ├── Notes.vue      # 笔记列表
│   │   ├── NoteForm.vue   # 写笔记
│   │   ├── Events.vue     # 活动列表
│   │   ├── EventDetail.vue# 活动详情
│   │   ├── Admin.vue      # 审批后台
│   │   └── Profile.vue    # 个人中心
│   ├── router/
│   │   └── index.js       # 路由配置
│   ├── stores/
│   │   └── user.js        # 用户状态管理
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## License

MIT
