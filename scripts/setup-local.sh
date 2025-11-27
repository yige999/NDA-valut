#!/bin/bash

echo "🚀 NDAVault - Local Development Setup"
echo "=================================="

# 检查.env.local是否存在
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local

    echo "✅ .env.local created successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env.local with your actual values"
    echo "2. Update YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY"
    echo "3. Add your Creem API keys when ready"
    echo ""
    echo "🔑 Quick Supabase setup:"
    echo "   Visit: https://supabase.com/dashboard/project/yhnudmekuviaaydoxztn/settings/api"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎯 Ready to start development!"
echo ""
echo "Commands:"
echo "  npm run dev     - Start development server"
echo "  npm run build   - Build for production"
echo "  npm run lint     - Check code quality"
echo ""
echo "📚 Useful files:"
echo "  - .env.example     - Environment template"
echo "  - SUPABASE_SETUP.md - Database setup guide"
echo "  - DEPLOYMENT_GUIDE.md - Production deployment"
echo ""
echo "🚀 Run 'npm run dev' to start your NDAVault!"