# Supabase Setup Guide

## ✅ 已完成配置
- 项目URL和密钥已配置在 `.env.local`
- Supabase客户端已配置在 `src/lib/supabase.ts`
- SQL schema已创建在 `supabase/schema.sql`

## 📋 需要手动设置的步骤

### 1. 在Supabase控制台运行SQL
1. 访问：https://supabase.com/dashboard/project/yhnudmekuviaaydoxztn
2. 进入 SQL Editor → New query
3. 复制 `supabase/schema.sql` 文件内容并运行

### 2. 设置Auth providers
1. 进入 Authentication → Providers
2. 启用以下providers：
   - **Email**: 已默认启用
   - **Google**:
     - 启用Google provider
     - 设置Client ID和Client Secret
     - 添加授权重定向URI: `https://yhnudmekuviaaydoxztn.supabase.co/auth/v1/callback`

### 3. 配置Storage
1. 进入 Storage → Policies
2. 确保默认策略允许用户上传文件
3. 建议创建名为 `nda-files` 的bucket

### 4. 设置数据库函数（可选）
如果需要自动更新过期的NDA状态，可以创建cron job：
```sql
-- 自动更新过期NDA状态
CREATE OR REPLACE FUNCTION update_expired_agreements()
RETURNS void AS $$
BEGIN
    UPDATE agreements
    SET status = 'expired'
    WHERE expiration_date < CURRENT_DATE AND status != 'expired';
END;
$$ LANGUAGE plpgsql;
```

## 🔐 安全配置
- RLS (Row Level Security) 已启用
- 用户只能访问自己的数据
- 文件上传限制: PDF only, 10MB max

## 📊 数据库结构
- `agreements`: 存储NDA信息
- `user_subscriptions`: 存储付费状态

完成后可以继续开发认证和文件上传功能！