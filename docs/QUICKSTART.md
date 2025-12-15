# Quick Start Guide

Get up and running with Vibe Trading in 10 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] AWS CLI installed and configured
- [ ] AWS account with Bedrock access
- [ ] Git installed

## 5-Minute Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/datamonsterr/vibe-trading.git
cd vibe-trading
```

### 2. Install Dependencies

```bash
# Install all dependencies at once
npm install
```

This will install dependencies for both backend and frontend.

### 3. Start Frontend (Mock Mode)

```bash
cd frontend
npm run dev
```

Open http://localhost:3000 - The frontend will work with mock data!

## 10-Minute AWS Deployment

### 1. Configure AWS

```bash
# Check your AWS configuration
aws sts get-caller-identity

# If not configured, run:
aws configure
```

### 2. Bootstrap CDK (First Time Only)

```bash
cd backend
npm install -g aws-cdk
cdk bootstrap
```

### 3. Deploy Backend

```bash
cd backend
npm run deploy
```

⏱️ This takes ~5-7 minutes. Grab a coffee! ☕

### 4. Get API URL

After deployment completes, look for:

```
Outputs:
VibeTradingStack.ApiUrl = https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/
```

### 5. Configure Frontend

```bash
cd ../frontend
cp .env.example .env
# Edit .env and add your API URL
```

### 6. Test It!

```bash
npm run dev
```

Visit http://localhost:3000 and start chatting!

## First Chat Commands

Try these commands in the chat interface:

1. **"Show me VCB stock price"**
   - Tests stock data fetching

2. **"Analyze FPT with technical indicators"**
   - Tests technical analysis

3. **"What's the news on Vietnam banking sector?"**
   - Tests news analysis

4. **"Create a buy order for 100 shares of HPG at 25,000 VND"**
   - Tests order management

## Common Issues & Quick Fixes

### Issue: CDK Bootstrap Fails

**Solution:**
```bash
# Make sure you have proper AWS permissions
aws iam get-user
```

### Issue: Bedrock Access Denied

**Solution:**
1. Go to AWS Console → Bedrock
2. Click "Model access"
3. Request access to Claude 3 Sonnet
4. Wait for approval (usually instant)
5. Redeploy: `cdk deploy --all`

### Issue: Frontend Can't Connect to API

**Solution:**
```bash
# Check your .env file
cat frontend/.env

# Should show:
# VITE_API_URL=https://your-api-url.amazonaws.com/prod
```

### Issue: CORS Errors

**Solution:**
- CORS is already configured in the CDK stack
- Make sure you're using the correct API URL
- Check browser console for exact error

## Development Workflow

### Making Changes

1. **Backend Changes**
```bash
cd backend
# Make your changes to Lambda functions
npm run build
npm run deploy
```

2. **Frontend Changes**
```bash
cd frontend
# Make your changes
# Hot reload is automatic!
```

### Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run lint
npm run build
```

## Project Structure Quick Reference

```
vibe-trading/
├── backend/              # AWS CDK + Lambda
│   ├── lib/             # CDK stacks
│   ├── lambda/          # Lambda handlers
│   │   ├── chat-handler/
│   │   ├── stock-data-handler/
│   │   ├── technical-analysis/
│   │   ├── news-analysis/
│   │   └── order-handler/
│   └── mcp-servers/     # MCP implementations
├── frontend/            # React app
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities
│   │   └── types/       # TypeScript types
│   └── public/
└── docs/               # Documentation
```

## Next Steps

1. ✅ **Deploy to production**
   - See [DEPLOYMENT.md](DEPLOYMENT.md)

2. ✅ **Integrate real APIs**
   - Replace mock data with real Vietnam stock APIs
   - See [EXAMPLES.md](EXAMPLES.md) for API configurations

3. ✅ **Customize UI**
   - Modify components in `frontend/src/components/`
   - shadcn/ui components are fully customizable

4. ✅ **Add features**
   - See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines
   - Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design

## Useful Commands

```bash
# Backend
cd backend
npm run build          # Build TypeScript
npm run watch          # Watch mode
npm run deploy         # Deploy to AWS
npx cdk synth         # Generate CloudFormation
npx cdk diff          # Show changes

# Frontend
cd frontend
npm run dev           # Development server
npm run build         # Production build
npm run preview       # Preview production build
npm run lint          # Run ESLint

# Root
npm test              # Run all tests (when configured)
```

## Resources

- 📖 [Full Documentation](README.md)
- 🏗️ [Architecture Guide](ARCHITECTURE.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 🔌 [API Documentation](API.md)
- 💡 [Examples](EXAMPLES.md)
- 🤝 [Contributing](CONTRIBUTING.md)

## Getting Help

- 🐛 [Report a Bug](https://github.com/datamonsterr/vibe-trading/issues)
- 💬 [Ask a Question](https://github.com/datamonsterr/vibe-trading/discussions)
- 📧 Contact: support@example.com

## Success Checklist

After completing this guide, you should have:

- [ ] Frontend running on http://localhost:3000
- [ ] Backend deployed to AWS
- [ ] API Gateway URL configured
- [ ] Chat interface working
- [ ] Stock data displaying
- [ ] Orders can be created
- [ ] Technical analysis working
- [ ] News analysis working

🎉 **Congratulations!** You're ready to start trading! 🚀

---

**Pro Tip:** Bookmark this guide and the [API Documentation](API.md) for quick reference.

**Security Reminder:** Never commit `.env` files or AWS credentials to version control!
