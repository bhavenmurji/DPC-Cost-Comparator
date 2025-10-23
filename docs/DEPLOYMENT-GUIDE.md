# 🚀 Deployment Guide - Week 2

## Overview
This guide will walk you through deploying your DPC Cost Comparator to production using Heroku (backend) and Vercel (frontend).

---

## Part 1: Deploy Backend to Heroku (15 minutes)

### Step 1: Create Heroku Account
1. Go to https://signup.heroku.com/
2. Sign up with your email
3. Verify your email address
4. Complete profile setup

### Step 2: Install Heroku CLI
Open Terminal and run:
```bash
# Install Heroku CLI (Mac)
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 3: Login to Heroku
```bash
heroku login
# Press any key to open browser and login
```

### Step 4: Create Heroku App
```bash
cd /Users/bhavenmurji/Development/DPC-Cost-Comparator

# Create app (choose unique name)
heroku create your-app-name-backend

# Example: heroku create dpc-comparator-api
```

### Step 5: Add PostgreSQL Database
```bash
# Add free PostgreSQL database
heroku addons:create heroku-postgresql:essential-0

# Get database URL
heroku config:get DATABASE_URL
```

### Step 6: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this
heroku config:set CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Step 7: Deploy Backend
```bash
# Initialize git if not done
git init
git add .
git commit -m "Ready for Heroku deployment"

# Deploy to Heroku
git push heroku main
```

### Step 8: Run Database Migrations
```bash
heroku run bash
# Then inside Heroku:
cd src/backend && npm run db:migrate
exit
```

### Step 9: Test Backend
```bash
# Open your API
heroku open

# Or test with:
curl https://your-app-name-backend.herokuapp.com/api/health
```

**✅ Backend is now live!** Copy your Heroku URL (e.g., `https://dpc-comparator-api.herokuapp.com`)

---

## Part 2: Deploy Frontend to Vercel (10 minutes)

### Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repos

### Step 2: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 3: Login to Vercel
```bash
vercel login
# Follow the email verification link
```

### Step 4: Prepare Frontend for Deployment
```bash
cd /Users/bhavenmurji/Development/DPC-Cost-Comparator/src/frontend

# Create production environment file
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=https://your-app-name-backend.herokuapp.com
EOF
```

### Step 5: Deploy Frontend
```bash
# From frontend directory
vercel

# Answer the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? dpc-cost-comparator
# - Directory? ./
# - Override settings? N
```

### Step 6: Set Production Environment Variable
```bash
# Set the API URL
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-app-name-backend.herokuapp.com
```

### Step 7: Deploy to Production
```bash
vercel --prod
```

**✅ Frontend is now live!** Vercel will give you a URL like `https://dpc-cost-comparator.vercel.app`

---

## Part 3: Update CORS Settings (5 minutes)

Now that you have your frontend URL, update backend CORS:

```bash
# Update Heroku environment variable
heroku config:set CORS_ORIGIN=https://dpc-cost-comparator.vercel.app

# Restart the app
heroku restart
```

---

## Part 4: Test Production Deployment

### Test the Live App:
1. Open your Vercel URL in browser
2. Fill out the form
3. Click "Compare Costs"
4. Verify results display correctly

### Test the API Directly:
```bash
curl -X POST https://your-app-name-backend.herokuapp.com/api/compare \
  -H "Content-Type: application/json" \
  -d '{
    "currentPlan": {
      "monthlyPremium": 500,
      "deductible": 3000,
      "coinsurance": 20,
      "copay": 30,
      "outOfPocketMax": 8000
    },
    "usage": {
      "primaryCareVisits": 4,
      "specialistVisits": 2,
      "prescriptions": 3,
      "labTests": 2
    },
    "profile": {
      "age": 35,
      "familySize": 1,
      "zipCode": "90210"
    }
  }'
```

---

## Troubleshooting

### Backend Issues:
```bash
# View logs
heroku logs --tail

# Restart app
heroku restart

# Check config
heroku config
```

### Frontend Issues:
```bash
# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

### Database Issues:
```bash
# Connect to database
heroku pg:psql

# View database info
heroku pg:info
```

---

## Optional: Custom Domain

### For Frontend (Vercel):
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Domains
4. Add your custom domain
5. Follow DNS setup instructions

### For Backend (Heroku):
```bash
heroku domains:add api.yourdomain.com
# Follow DNS setup instructions
```

---

## Week 2 Checklist

- [ ] Create Heroku account
- [ ] Install Heroku CLI
- [ ] Create Heroku app
- [ ] Add PostgreSQL database
- [ ] Set environment variables
- [ ] Deploy backend to Heroku
- [ ] Run database migrations
- [ ] Test backend API
- [ ] Create Vercel account
- [ ] Install Vercel CLI
- [ ] Configure frontend environment
- [ ] Deploy frontend to Vercel
- [ ] Update CORS settings
- [ ] Test production deployment
- [ ] (Optional) Set up custom domain

---

## Need Help?

- Heroku Docs: https://devcenter.heroku.com/
- Vercel Docs: https://vercel.com/docs
- PostgreSQL on Heroku: https://devcenter.heroku.com/articles/heroku-postgresql

**Estimated Time: 30-45 minutes total**

Your app will be live at:
- Frontend: https://dpc-cost-comparator.vercel.app
- Backend: https://your-app-name-backend.herokuapp.com
