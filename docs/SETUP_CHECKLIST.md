# Setup Checklist - Ignite Health Partnerships

## ✅ Completed

- [x] PostHog account created (bhavenmurji@gmail.com via GitHub)
- [x] SendGrid account created (admin@ignitehealthsystems.com)
- [x] SendGrid backup code saved: `T4UKPXUXKYHP2E1WV8Y4BLSR`
- [x] Analytics tracking implemented (7 events)
- [x] Provider email templates created (8 templates)
- [x] Provider registration form built
- [x] "Claim Your Practice" button added
- [x] Database schema updated for provider claims
- [x] SendGrid package installed
- [x] Test script created

---

## ⏳ Todo Today (15-30 minutes)

### 1. Get PostHog API Key (2 minutes)

```bash
# Steps:
1. Go to https://app.posthog.com
2. Login with GitHub (bhavenmurji@gmail.com)
3. Click Settings (gear icon) → Project Settings
4. Copy "Project API Key" (starts with phc_)
5. Open apps/web/.env
6. Add: VITE_POSTHOG_KEY=phc_your_key_here
```

**Test it:**
```bash
cd apps/web
npm run dev
# Open http://localhost:3000
# Perform a comparison
# Go to PostHog → Live Events
# See events appear in real-time ✅
```

---

### 2. Verify SendGrid Sender (2 minutes)

```bash
# Steps:
1. Check email at admin@ignitehealthsystems.com
2. Find email from SendGrid
3. Click "Verify Single Sender"
4. Confirm verification
```

---

### 3. Create SendGrid API Key (2 minutes)

```bash
# Steps:
1. Go to https://app.sendgrid.com
2. Login with admin@ignitehealthsystems.com
3. Settings → API Keys → Create API Key
4. Name: "Ignite Health Partnerships - Production"
5. Permissions: Full Access
6. Copy the API key (starts with SG.)
7. Open apps/api/.env
8. Replace: SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE
   With: SENDGRID_API_KEY=SG.your_actual_key_here
```

**Test it:**
```bash
cd apps/api
npx tsx scripts/test-sendgrid.ts
# Check email at bhavenmurji@gmail.com ✅
```

---

### 4. Run Database Migration (2 minutes)

```bash
cd apps/api
npx prisma migrate dev --name add_provider_claim_and_analytics
npx prisma generate
```

**What this does:**
- Adds provider claim fields to database
- Adds analytics tracking (viewCount, contactClicks, etc.)
- Enables provider registration functionality

---

## ⏳ Todo This Week (2-3 hours)

### 5. Create SendGrid Email Templates (30 minutes)

Follow the HTML in `docs/POSTHOG_SENDGRID_SETUP.md` to create 3 templates:

**Template 1: Email Verification**
1. Go to SendGrid → Email API → Dynamic Templates
2. Create "provider-email-verification"
3. Copy HTML from docs
4. Save template ID to `.env`: `SENDGRID_TEMPLATE_EMAIL_VERIFICATION=d-xxx`

**Template 2: Provider Outreach**
1. Create "provider-initial-outreach"
2. Copy HTML from docs
3. Save template ID: `SENDGRID_TEMPLATE_PROVIDER_OUTREACH=d-xxx`

**Template 3: Monthly Report**
1. Create "provider-monthly-report"
2. Copy HTML from docs
3. Save template ID: `SENDGRID_TEMPLATE_MONTHLY_REPORT=d-xxx`

---

### 6. Create PostHog Dashboards (30 minutes)

**Dashboard 1: User Engagement**
1. Go to PostHog → Dashboards → New Dashboard
2. Name: "User Engagement"
3. Add insights:
   - Daily comparisons (line chart)
   - Provider searches by state (bar chart)
   - Conversion funnel (search → view → contact)
   - Claim practice clicks (number)

**Dashboard 2: Provider Network**
1. Create "Provider Network Growth"
2. Add insights:
   - Provider views by practice (leaderboard)
   - Contact attempts over time (line chart)
   - Claim practice clicks (trend)
   - Geographic coverage map

**Set up weekly email:**
1. PostHog → Subscriptions
2. Select "User Engagement" dashboard
3. Frequency: Weekly (Monday 9am)
4. Email: bhavenmurji@gmail.com

---

### 7. Build Provider Contact Database (1 hour)

**Query database for unclaimed providers:**
```bash
cd apps/api
npx prisma studio
# Or create a script to export CSV
```

**Export to CSV with columns:**
- provider_id
- name
- practice_name
- email (if available)
- phone
- city
- state
- zip_code
- monthly_fee
- claimed (false for all)

**Import to Airtable:**
1. Create base: "Provider Outreach"
2. Import CSV
3. Add columns:
   - Email Status (dropdown: Not Sent, Sent, Opened, Clicked, Claimed)
   - Last Contact Date
   - Response Notes
   - Campaign (CA Wave 1, CA Wave 2, etc.)

---

### 8. Launch First Email Campaign (30 minutes)

**Target: California providers (98 total)**

**Option A: SendGrid Marketing Campaigns**
1. Go to SendGrid → Marketing → Contacts
2. Upload California provider emails
3. Create segment: "CA Providers - Unclaimed"
4. Marketing → Campaigns → Create Campaign
5. Use "Provider Outreach" template
6. Schedule or send immediately

**Option B: Use custom API script** (for more control)
```typescript
// apps/api/scripts/send-provider-outreach.ts
// Iterate through providers
// Send personalized emails with template
// Track sends in database
```

**Recommended schedule:**
- Week 1: Send to 20 CA providers (test batch)
- Monitor open rates and responses
- Week 2: Send to remaining 78 CA providers
- Week 3: Expand to other states

---

## 📊 Success Metrics

### Week 1 Goals:
- [ ] 25%+ email open rate
- [ ] 10%+ click-through rate
- [ ] 1-3 providers claim their listing
- [ ] Analytics tracking all events

### Month 1 Goals:
- [ ] 500+ cost comparisons calculated
- [ ] 200+ provider searches
- [ ] 20+ claimed provider listings
- [ ] 5+ high-value provider partnerships

---

## 🔧 Technical Implementation Remaining

### High Priority (Next 2 weeks):

**Provider Registration Backend**
- [ ] `/api/providers/register` endpoint
- [ ] Password hashing (bcrypt)
- [ ] Email verification token generation
- [ ] SendGrid verification email integration
- [ ] Email verification endpoint

**Provider Portal**
- [ ] Login page (`/provider/login`)
- [ ] Dashboard with analytics
- [ ] Practice information editor
- [ ] Monthly report viewer

**Claim Flow**
- [ ] `/provider/claim/:providerId` page
- [ ] Verification process (email + NPI check)
- [ ] Link existing listing to account

### Medium Priority (Next 4 weeks):

**City Landing Pages** (5 pages)
- [ ] Los Angeles DPC (`/los-angeles-dpc`)
- [ ] San Francisco DPC (`/san-francisco-dpc`)
- [ ] San Diego DPC (`/san-diego-dpc`)
- [ ] New York DPC (`/new-york-dpc`)
- [ ] Chicago DPC (`/chicago-dpc`)

**SEO & Content**
- [ ] Schema.org LocalBusiness markup
- [ ] City-specific meta tags
- [ ] Featured providers section
- [ ] Local testimonials

---

## 📝 Notes

### PostHog Account
- **Email**: bhavenmurji@gmail.com
- **Login**: GitHub OAuth
- **Project**: Ignite Health Partnerships
- **Free tier**: 1M events/month (plenty for now)

### SendGrid Account
- **Email**: admin@ignitehealthsystems.com
- **Backup Code**: T4UKPXUXKYHP2E1WV8Y4BLSR (store securely!)
- **Free tier**: 100 emails/day (enough for gradual rollout)
- **Upgrade plan**: Essential ($19.95/mo) for 50K emails when needed

### Database
- **Current providers**: 2,759 total
  - California: 98 providers
  - All unclaimed (opportunity!)
- **Migration**: Pending (run `prisma migrate dev`)

---

## 🚀 Quick Start Commands

```bash
# Start development servers
npm run dev  # Runs both API and web

# Or separately:
cd apps/api && npm run dev    # API on :4000
cd apps/web && npm run dev    # Web on :5173

# Test SendGrid
cd apps/api
npx tsx scripts/test-sendgrid.ts

# Database migration
cd apps/api
npx prisma migrate dev --name add_provider_claim_and_analytics
npx prisma generate
npx prisma studio  # Browse database

# View analytics
# Open http://localhost:3000
# Perform actions
# Check PostHog Live Events
```

---

## 📚 Documentation

- **Main Guide**: `docs/POSTHOG_SENDGRID_SETUP.md`
- **Email Templates**: `docs/PROVIDER_EMAIL_TEMPLATES.md`
- **Progress Tracker**: `docs/PROVIDER_NETWORK_EXPANSION_PROGRESS.md`
- **Analytics Setup**: `docs/ANALYTICS_SETUP.md`

---

**Last Updated**: 2025-11-20
**Next Review**: After completing today's checklist
