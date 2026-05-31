# 跃动智体 — 远程体验指南

> 给父亲的远程分享方案

## 方式一：本地运行（你操作）

### 1. 启动
```bash
cd E:\projects\体育课设
npm install
npx prisma db push
npm run db:seed
npm run dev
```
浏览器打开 http://localhost:3000

### 2. 分享给父亲（临时公网链接）

使用 Cloudflare Tunnel（免费）：
```bash
# 安装 cloudflared（一次）
npm install -g cloudflared

# 启动 tunnel
cloudflared tunnel --url http://localhost:3000
```
输出类似 `https://xxx.trycloudflare.com` 的地址，发给父亲即可。

或使用 ngrok：
```bash
ngrok http 3000
```

### 3. 注意事项
- ⚠️ 分享期间电脑不能关机、不能休眠
- ⚠️ 演示数据为匿名模拟数据，不含真实学生信息
- ⚠️ 不要将 `.env.local` 发给任何人
- ⚠️ 用完及时关闭 tunnel（Ctrl+C）

## 方式二：父亲自己运行

将项目文件夹打包发给父亲：
```bash
# 在你电脑上
git clone https://github.com/brockno11/yuedong-zhiti.git
```

父亲电脑上：
```bash
cd yuedong-zhiti
npm install
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY（或留空使用 Mock 模式）
npx prisma db push
npm run db:seed
npm run dev
```
浏览器打开 http://localhost:3000

### 演示账号
| 角色 | 账号 | 密码 |
|------|------|------|
| 学生 | S001 ~ S020 | demo123 |
| 教师 | zhoulaoshi | demo123 |

## 后续正式部署建议

比赛后可考虑以下方案：

| 方案 | 适合场景 | 操作 |
|------|---------|------|
| SQLite → Supabase | 免费 PostgreSQL + 在线访问 | Prisma datasource 改为 postgresql |
| Vercel 部署 | 前端自动部署 | 连接 GitHub 仓库，一键部署 |
| 自建服务器 | 学校内网使用 | Docker + MySQL + Nginx |

当前 SQLite 仅适合本地演示，生产环境建议迁移到 MySQL/PostgreSQL。
