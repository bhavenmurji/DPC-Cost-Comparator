# ⚡ Week 2 Quick Commands - Copy & Paste

**Note**: Replace `your-app-name-backend` with your chosen name (must be unique on Heroku)

## 1️⃣ Install Tools (one-time setup)

```bash
# Install Heroku CLI (Mac)
brew tap heroku/brew && brew install heroku

# Install Vercel CLI
npm install -g vercel
```

## 2️⃣ Deploy Backend to Heroku

```bash
# Login to Heroku
heroku login

# Create Heroku app
cd /Users/bhavenmurji/Development/DPC-Cost-Comparator
heroku create your-app-name-backend

# Add database
heroku addons:create heroku-postgresql:essential-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set PORT=3001

# Build backend
cd src/backend
npm run build

# Commit and deploy
cd ../..
git add .
git commit -m "Week 2: Deploy to Heroku"
git push heroku main

# Check if it's running
heroku open
heroku logs --tail
```

## 3️⃣ Get Your Backend URL

```bash
heroku info
# Copy the "Web URL" - you'll need it for frontend
```

## 4️⃣ Deploy Frontend to Vercel

```bash
# Login to Vercel
vercel login

# Create production env file (replace URL with your Heroku URL)
cd /Users/bhavenmurji/Development/DPC-Cost-Comparator/src/frontend
echo "NEXT_PUBLIC_API_URL=https://your-app-name-backend.herokuapp.com" > .env.production

# Deploy to Vercel
vercel --prod

# When prompted:
# - Link to existing project? N
# - Project name? dpc-cost-comparator (or your choice)
# - Which directory? ./
```

## 5️⃣ Update Backend CORS (copy your Vercel URL first)

```bash
# Update CORS with your Vercel URL
heroku config:set CORS_ORIGIN=https://dpc-cost-comparator.vercel.app

# Restart
heroku restart
```

## 6️⃣ Test Everything

```bash
# Test backend health
curl https://your-app-name-backend.herokuapp.com/api/health

# Open your live app (copy the Vercel URL from step 4)
# Then visit it in your browser and test the cost comparison
```

---

## Common Issues & Fixes

### Backend won't start:
```bash
heroku logs --tail
heroku restart
```

### Frontend can't reach backend:
```bash
# Check CORS is set correctly
heroku config:get CORS_ORIGIN

# Update if needed
heroku config:set CORS_ORIGIN=https://your-vercel-url.vercel.app
```

### Database issues:
```bash
heroku pg:info
heroku pg:psql
```

---

## Your Live URLs

After deployment, save these:

- **Frontend**: https://dpc-cost-comparator.vercel.app (or your custom name)
- **Backend**: https://your-app-name-backend.herokuapp.com
- **Health Check**: https://your-app-name-backend.herokuapp.com/api/health

---

**Total Time**: ~30 minutes
**Cost**: $0 (both platforms have free tiers)
