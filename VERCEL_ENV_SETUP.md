# 🚀 Vercel Environment Variables Setup Guide

## 📋 Quick Setup

### 1. 在Vercel Dashboard配置环境变量

访问：https://vercel.com/dashboard → 选择项目 → Settings → Environment Variables

### 2. 必需的环境变量

复制粘贴以下配置到Vercel：

```
# 🔑 Supabase Configuration (必需)
NEXT_PUBLIC_SUPABASE_URL=https://yhnudmekuviaaydoxztn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobnVkbWVrdXZpYWF5ZG94enRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjg2MTMsImV4cCI6MjA3OTc0NDYxM30.huQeCZrkrn_U9i7057DjPHC3YfKxpgWlv9T2xl_8kNE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlobnVkbWVrdXZpYWF5ZG94enRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE2ODYxMywiZXhwIjoyMDc5NzQ0NjEzfQ.x-D-QLLsTxrp9STZejC5zDXth5b4M0XO2dEfx-asz1I

# 🌐 Site Configuration (必需)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production

# 💳 Creem Payment (需要时添加)
CREEM_API_KEY=your_creem_api_key
CREEM_SECRET_KEY=your_creem_secret_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
```

### 3. 可选的环境变量

```
# 📧 Email System (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=alerts@your-domain.com
RESEND_FROM_NAME=NDAVault

# 📊 Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🔧 获取密钥的具体步骤

### Supabase 密钥 (已提供)
1. 访问：https://supabase.com/dashboard/project/yhnudmekuviaaydoxztn/settings/api
2. 项目URL和密钥已包含在上方配置中

### Creem API 密钥
1. 访问：https://creem.io/dashboard/developers
2. 创建新的API应用
3. 复制以下内容：
   - API Key
   - Secret Key
   - Webhook Secret

### Resend API 密钥 (可选)
1. 访问：https://resend.com/api-keys
2. 创建新的API密钥
3. 验证你的发送域名

## 🎯 部署后验证

部署完成后，访问以下URL验证功能：

### 基础功能
- [ ] `https://your-domain.vercel.app` - 着陆页
- [ ] `https://your-domain.vercel.app/login` - 登录页面
- [ ] `https://your-domain.vercel.app/signup` - 注册页面

### API端点测试
- [ ] `https://your-domain.vercel.app/api/send-alerts` - 邮件系统
- [ ] `https://your-domain.vercel.app/admin/alerts` - 管理后台

## 🔒 安全提醒

- ✅ Supabase密钥已配置在上方
- ✅ 所有密钥都存储在Vercel环境变量中
- ✅ .env.local文件永远不会上传到GitHub
- ✅ 生产环境变量已正确隔离

## 🚀 一键部署命令

如果配置完成，可以直接部署：

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到生产环境
vercel --prod

# 或者访问 vercel.com 进行网页部署
```

## ⚠️ 故障排除

### 如果出现 "DATABASE_URL" 错误
- 这个错误可以忽略，Supabase会自动处理

### 如果出现 "Creem API" 错误
- 检查Creem API密钥是否正确
- 确认Webhook端点配置正确

### 如果Supabase连接失败
- 检查URL和密钥是否匹配
- 确认Supabase项目状态正常

---

**🎉 配置完成后，你的NDAVault就可以上线赚钱了！**