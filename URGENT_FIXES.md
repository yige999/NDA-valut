# 🚨 立即修复清单 (今天必须完成)

## ⚠️ 最高优先级 - 部署后立即修复

### 1. **字体加载问题** ✅ 已修复
**问题**: Google Fonts在某些地区无法访问导致构建失败
**修复**:
- ✅ 改用Inter字体
- ✅ 添加font-display: swap
- ✅ 添加备选字体栈

### 2. **安全头部缺失** ✅ 已修复
**问题**: 缺少重要的HTTP安全头部
**修复**:
- ✅ 创建middleware.ts
- ✅ 添加CSP、HSTS、XSS保护等
- ✅ 配置CORS策略

## 🔥 紧急修复 - 本周内完成

### 3. **文件上传安全加强**
**问题**: 只有基础验证，缺少深度安全检查

**立即修复代码**:
```typescript
// 在 NDAUpload.tsx 中添加
const validatePDFContent = async (file: File): Promise<boolean> => {
  // 1. 检查PDF文件头
  const buffer = await file.arrayBuffer()
  const header = new TextDecoder().decode(buffer.slice(0, 4))
  if (header !== '%PDF') return false

  // 2. 检查文件大小限制
  if (file.size > 10 * 1024 * 1024) return false

  // 3. 检查用户配额
  const { data: ndas } = await supabase
    .from('agreements')
    .select('id')
    .eq('user_id', user!.id)

  const subscription = await getUserSubscription(user!.id)
  const maxNdas = subscription?.plan_tier === 'pro' ? Infinity : 10

  if ((ndas?.length || 0) >= maxNdas) {
    setError(`You've reached your limit of ${maxNdas} NDAs`)
    return false
  }

  return true
}
```

### 4. **支付错误处理完善**
**问题**: 支付失败时用户看不到有用的错误信息

**立即修复代码**:
```typescript
// 在 payment 相关组件中添加
const handlePaymentError = (error: any) => {
  let userMessage = 'Payment failed. Please try again.'

  if (error.type === 'card_error') {
    userMessage = 'Card was declined. Please try another card.'
  } else if (error.type === 'validation_error') {
    userMessage = 'Invalid card information.'
  } else if (error.code === 'insufficient_funds') {
    userMessage = 'Insufficient funds. Please use a different card.'
  }

  setError(userMessage)
}
```

### 5. **认证流程完善**
**问题**: 缺少邮箱验证和密码重置

**立即修复代码**:
```typescript
// 创建 password reset 页面
export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Password reset link sent to your email!')
    }
    setLoading(false)
  }

  return (
    // 添加重置密码表单
  )
}
```

## 🔵 优化项目 - 下周完成

### 6. **添加审计日志**
```sql
-- 在 Supabase 中添加
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加审计触发器
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id,
    old_values, new_values, ip_address
  ) VALUES (
    current_setting('request.jwt.claims', true)::json->>'sub',
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    inet_client_addr()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### 7. **性能监控**
```typescript
// 添加性能监控
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric: any) {
  // 发送到分析服务
  gtag('event', metric.name, {
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_category: 'Web Vitals',
    event_label: metric.id,
    non_interaction: true,
  })
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### 8. **SEO结构化数据**
```typescript
// 在 page.tsx 中添加
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "NDAVault",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "49",
    "priceCurrency": "USD",
    "priceValidUntil": "2025-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "42"
  }
}
```

## ⚡ 立即执行清单

### 今天完成 (必需):
- [x] ✅ 修复字体加载问题
- [x] ✅ 添加安全头部
- [ ] 🔄 部署修复版本到Vercel
- [ ] 🔄 测试所有关键功能

### 本周完成 (紧急):
- [ ] 🔄 实现文件内容验证
- [ ] 🔄 完善支付错误处理
- [ ] 🔄 添加密码重置功能
- [ ] 🔄 实现用户配额检查

### 下周完成 (优化):
- [ ] 添加审计日志系统
- [ ] 实现性能监控
- [ ] 完善SEO结构化数据
- [ ] 添加更多用户反馈

## 🎯 关键指标监控

上线后立即监控:
- **构建成功率**: 应该 > 99%
- **页面加载时间**: 应该 < 3秒
- **支付成功率**: 应该 > 95%
- **错误率**: 应该 < 1%

---

**⚠️ 重要**: 在完成第3-5项修复之前，请密切监控生产环境的错误日志和安全日志。