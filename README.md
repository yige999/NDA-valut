# 🚀 NDAVault

**Simple NDA Management Software for Agencies**

Stop managing NDAs in Excel. Upload, track, and never miss an expiration date.

## ✨ Features

- 🔐 **Secure Authentication** - Email/Password + Google OAuth
- 📄 **PDF Management** - Upload, edit, delete NDA files (10MB limit)
- 📊 **Smart Tracking** - Automatic status: Active/Expiring Soon/Expired
- 📧 **Email Alerts** - 30-day expiration warnings (Pro feature)
- 💳 **Payment System** - Creem integration for subscription management
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🎯 **SEO Optimized** - Built to rank for "NDA Management Software"

## 💰 Pricing

- **Free Plan** - Up to 10 NDAs, manual deadline tracking
- **Pro Plan** - $49/month, unlimited NDAs + automatic email alerts

## 🚀 Quick Start

### Local Development

1. **Clone and setup:**
   ```bash
   git clone https://github.com/yige999/NDA-valut.git
   cd NDA-valut

   # Windows users:
   npm run setup:win

   # Mac/Linux users:
   npm run setup:mac
   ```

2. **Configure environment:**
   ```bash
   # Edit .env.local with your actual values
   cp .env.example .env.local
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

### Production Deployment

1. **Deploy to Vercel:**
   - Visit https://vercel.com/new
   - Import repository: `yige999/NDA-valut`
   - Configure environment variables (see `VERCEL_ENV_SETUP.md`)

2. **Set up Supabase:**
   - Run `supabase/schema.sql` in your Supabase SQL editor
   - Enable Google OAuth in Authentication settings
   - Create Storage bucket named `nda-files`

## 🏗️ Tech Stack

- **Frontend:** Next.js 16 + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Creem API
- **Email:** Resend
- **Deployment:** Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── billing/           # Subscription management
│   ├── dashboard/         # Main app interface
│   ├── login/             # Authentication pages
│   ├── pricing/           # Pricing page
│   └── signup/
├── components/            # Reusable React components
│   ├── guards/           # Route protection
│   ├── payment/          # Payment forms
│   ├── subscription/     # Subscription components
│   └── ui/              # UI components
├── contexts/            # React contexts
├── lib/                 # Utility functions
└── scripts/             # Setup scripts
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Creem Payments
CREEM_API_KEY=your_creem_api_key
CREEM_SECRET_KEY=your_creem_secret_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
```

## 📚 Documentation

- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Database setup
- [`VERCEL_ENV_SETUP.md`](./VERCEL_ENV_SETUP.md) - Deployment configuration
- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) - Production deployment
- [`CREEM_SETUP.md`](./CREEM_SETUP.md) - Payment system setup

## 🧪 Testing

- **Manual Testing:** Visit `/admin/alerts` to test email alerts
- **API Testing:** Check `/api/send-alerts` endpoint
- **Payment Testing:** Use Creem test mode for payment flows

## 🎯 Business Model

This MVP is designed for rapid revenue generation:

1. **Free Tier** - Hook users with core functionality
2. **Pro Conversion** - Drive upgrades with automatic email alerts
3. **Low Churn** - Sticky business with recurring NDA management needs
4. **SEO Growth** - Target "NDA Management Software" (KD 6%)

## 🚀 Launch Strategy

1. **Reddit Launch** - r/agency, r/smallbusiness with authentic story
2. **Product Hunt** - Technical community launch
3. **SEO Optimization** - Content marketing for long-term growth
4. **Twitter/X** - Founder-led marketing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- 📧 Email: support@ndavault.app
- 🐛 Issues: [GitHub Issues](https://github.com/yige999/NDA-valut/issues)
- 💬 Discord: [Coming soon]

---

**Built with ❤️ for agencies tired of Excel-based NDA management**

🎯 *Your NDAs deserve better than spreadsheets.*