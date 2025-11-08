# Week 2 Quick Start Guide
## Deploy Your DPC Cost Comparator in 7 Days

**Goal:** Get your app live on the internet with a shareable URL

---

## The 3-Step Strategy

### Step 1: Choose Your Platforms (Day 1)
**Recommended Stack:**
- **Frontend:** Vercel (free) - Best for Next.js
- **Backend:** Render (free) - Includes database
- **Database:** Render PostgreSQL (free 90 days, then $7/month)

**Alternative Stack:**
- **All-in-One:** Railway ($5/month) - Simplest, includes everything

### Step 2: Deploy Backend + Database (Days 2-3)
1. Sign up for Render
2. Create PostgreSQL database
3. Run migrations
4. Deploy backend API
5. Test API endpoints

### Step 3: Deploy Frontend (Day 4)
1. Sign up for Vercel
2. Connect GitHub repository
3. Configure API URL
4. Deploy
5. Test full application

---

## Minimum Required Environment Variables

### Backend (Render)
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=<auto-provided-by-render>
JWT_SECRET=<run: openssl rand -base64 32>
JWT_REFRESH_SECRET=<run: openssl rand -base64 32>
ENCRYPTION_KEY=<run: openssl rand -base64 32>
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## Daily Priorities

### Day 1: Setup
- [ ] Create accounts (Vercel, Render)
- [ ] Generate secrets: `openssl rand -base64 32` (3 times)
- [ ] Review security checklist

### Day 2: Backend Prep
- [ ] Test build: `cd src/backend && npm run build`
- [ ] Verify TypeScript compiles
- [ ] Check database schema ready

### Day 3: Database + Backend Deploy
- [ ] Create PostgreSQL on Render
- [ ] Run migrations: `psql $DATABASE_URL -f src/backend/database/schema.sql`
- [ ] Deploy backend on Render
- [ ] Test: `curl https://your-api.onrender.com/health`

### Day 4: Frontend Deploy
- [ ] Deploy on Vercel (connect GitHub)
- [ ] Add API URL to environment variables
- [ ] Update backend CORS with frontend URL
- [ ] Test full user flow

### Day 5: Monitoring
- [ ] Setup Sentry (free account)
- [ ] Add Sentry to backend and frontend
- [ ] Enable Vercel Analytics
- [ ] Test error tracking

### Day 6: Security & Performance
- [ ] Verify HTTPS working
- [ ] Test authentication
- [ ] Run Lighthouse audit (target >90)
- [ ] Test on mobile

### Day 7: Launch
- [ ] Backup database
- [ ] Final smoke test
- [ ] Share URL!
- [ ] Monitor first hour closely

---

## Quick Deploy Commands

### Backend Build Test
```bash
cd src/backend
npm install
npm run build
node dist/server.js  # Should start server
```

### Frontend Build Test
```bash
cd src/frontend
npm install
npm run build
npm run start  # Test production build
```

### Database Migration
```bash
# After creating database on Render, copy DATABASE_URL
export DATABASE_URL="postgres://user:pass@host/database"
psql $DATABASE_URL -f src/backend/database/schema.sql
```

---

## Critical Success Factors

1. **Generate Secure Secrets:** Never use example values in production
2. **Test Builds Locally:** Fix errors before deploying
3. **CORS Configuration:** Must match frontend URL exactly
4. **Database Migrations:** Run before backend deployment
5. **Environment Variables:** Double-check all are set

---

## Troubleshooting Quick Fixes

### "Cannot connect to database"
```bash
# Check connection
psql $DATABASE_URL -c "SELECT NOW();"
```

### "CORS error"
```bash
# Temporarily allow all (backend .env):
CORS_ALLOWED_ORIGINS=*
# Then narrow it down once working
```

### "Build fails"
```bash
# Test locally first:
npm run build
# Fix any TypeScript or dependency errors
```

### "Slow first load (cold start)"
- Expected on free tier (15 min idle = spin down)
- Setup UptimeRobot to ping every 13 minutes
- Consider paid tier ($7/month) for production

---

## Final Checklist Before Sharing URL

- [ ] Homepage loads without errors
- [ ] User can register
- [ ] Cost calculator works
- [ ] Data saves to database
- [ ] HTTPS enabled (automatic)
- [ ] Mobile responsive
- [ ] Error tracking active

---

## Your Production URLs

After deployment, you'll have:

**Frontend:** `https://dpc-comparator.vercel.app`
**Backend:** `https://dpc-comparator-api.onrender.com`

**Share the frontend URL** - that's your shareable link!

---

## Next Actions After Launch

1. **Collect Feedback:** Share with 5-10 test users
2. **Monitor Errors:** Check Sentry daily for first week
3. **Custom Domain:** Purchase domain and configure
4. **Email Setup:** SendGrid for password resets
5. **Marketing:** SEO, social sharing, Google Analytics

---

## Cost Summary

**Free Tier (First 90 days):**
- Vercel: Free forever for hobby projects
- Render: Free for backend
- Render PostgreSQL: Free for 90 days

**After 90 Days:**
- Render PostgreSQL: $7/month
- Everything else: Still free

**Recommended Paid Tier (for serious production):**
- Render: $7/month (always-on, no cold starts)
- Total: $7/month

---

## Support Resources

- **Detailed Roadmap:** `/docs/planning/WEEK-2-DEPLOYMENT-ROADMAP.md`
- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Sentry Setup:** https://docs.sentry.io/platforms/javascript/

---

**You've got this! One week to launch. 🚀**

*Remember: Done is better than perfect. Launch with core features, iterate based on feedback.*
