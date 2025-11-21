# PostHog & SendGrid Configuration Guide

## PostHog Setup

### Account Details
- **Account**: bhavenmurji@gmail.com (GitHub)
- **Project**: Ignite Health Partnerships

### Get Your API Key

1. Log in to PostHog: https://app.posthog.com
2. Go to **Project Settings** (gear icon in left sidebar)
3. Copy your **Project API Key** (starts with `phc_`)
4. Add to `apps/web/.env`:

```bash
# Create .env file from .env.example if it doesn't exist
cd apps/web
cp .env.example .env

# Add your PostHog key
VITE_POSTHOG_KEY=phc_your_actual_key_here
VITE_POSTHOG_ENABLE_RECORDINGS=false
```

5. Restart your dev server:
```bash
npm run dev
```

### Verify Analytics are Working

1. Open browser to http://localhost:3000
2. Perform a cost comparison
3. Search for providers
4. Click a provider card
5. Go to PostHog → Live Events
6. You should see events arriving in real-time

### Create Your First Dashboard

**Dashboard: User Engagement**
1. Go to PostHog → Insights → New Dashboard
2. Name: "User Engagement"
3. Add these insights:

**Insight 1: Daily Comparisons**
- Metric: `comparison_calculated`
- Chart type: Line chart
- Time range: Last 30 days

**Insight 2: Provider Searches by State**
- Metric: `provider_search`
- Breakdown by: `state`
- Chart type: Bar chart

**Insight 3: Conversion Funnel**
- Steps:
  1. `provider_search`
  2. `provider_viewed`
  3. `provider_contact`
- Chart type: Funnel

**Insight 4: Claim Practice Clicks**
- Metric: `claim_practice_clicked`
- Chart type: Number
- Time range: Last 30 days

### Set Up Weekly Email Reports

1. Go to PostHog → Subscriptions
2. Click "New Subscription"
3. Select your "User Engagement" dashboard
4. Frequency: Weekly (Monday mornings)
5. Recipients: bhavenmurji@gmail.com
6. Save

---

## SendGrid Setup

### Account Details
- **Account**: admin@ignitehealthsystems.com
- **Purpose**: Provider outreach and transactional emails

### Initial Configuration

#### 1. Verify Your Sender Email

1. Log in to SendGrid: https://app.sendgrid.com
2. Go to **Settings** → **Sender Authentication**
3. Click **Verify a Single Sender**
4. Enter:
   - From Name: `Ignite Health Partnerships`
   - From Email Address: `admin@ignitehealthsystems.com`
   - Reply To: `admin@ignitehealthsystems.com`
   - Company: `Ignite Health Systems`
5. Check your email and click verification link

#### 2. Get Your API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `Ignite Health Partnerships - Production`
4. Permissions: **Full Access** (or restrict to Mail Send only for security)
5. Click **Create & View**
6. **IMPORTANT**: Copy the API key immediately (you won't see it again)
7. Add to `apps/api/.env`:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=admin@ignitehealthsystems.com
SENDGRID_FROM_NAME=Ignite Health Partnerships
```

#### 3. Create Email Templates

SendGrid offers two template types:
- **Dynamic Templates** (recommended) - Use handlebars syntax
- **Legacy Templates** - HTML only

**Let's create Dynamic Templates:**

1. Go to **Email API** → **Dynamic Templates**
2. Click **Create a Dynamic Template**

### Template 1: Email Verification

**Name**: `provider-email-verification`
**Subject**: `Verify your email - Ignite Health Partnerships`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Ignite Health Partnerships!</h1>
    </div>
    <div class="content">
      <h2>Hi {{providerName}},</h2>
      <p>Thank you for registering your DPC practice! Please verify your email address to access your provider dashboard.</p>

      <p style="text-align: center;">
        <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
      </p>

      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f3f4f6; padding: 10px; word-break: break-all; font-size: 12px;">{{verificationUrl}}</p>

      <p>This verification link expires in 24 hours.</p>

      <p>If you didn't create an account, you can safely ignore this email.</p>

      <p>Best regards,<br>The Ignite Health Partnerships Team</p>
    </div>
    <div class="footer">
      <p>Ignite Health Partnerships<br>
      Connecting patients with Direct Primary Care providers</p>
    </div>
  </div>
</body>
</html>
```

**Save and get Template ID** (looks like `d-abc123...`)

### Template 2: Provider Outreach

**Name**: `provider-initial-outreach`
**Subject**: `Help patients discover {{practiceName}} on Ignite Health Partnerships`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .highlight { background: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
    .checkmark { color: #10b981; font-weight: bold; }
    .button { display: inline-block; padding: 14px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Practice is Already Listed!</h1>
    </div>
    <div class="content">
      <h2>Hi {{providerName}},</h2>

      <p>I discovered your Direct Primary Care practice, <strong>{{practiceName}}</strong>, and wanted to reach out about a free opportunity to connect with patients actively searching for DPC providers.</p>

      <p>Ignite Health Partnerships is a cost comparison platform that helps Americans understand the financial benefits of DPC + catastrophic insurance versus traditional insurance.</p>

      <div class="highlight">
        <p><strong>When users in {{city}}, {{state}} search for DPC providers, your practice appears in their results with:</strong></p>
        <p><span class="checkmark">✓</span> Your monthly membership fee<br>
        <span class="checkmark">✓</span> Distance from their location<br>
        <span class="checkmark">✓</span> Contact information and website<br>
        <span class="checkmark">✓</span> Services offered</p>
      </div>

      <p><strong>The best part? It's completely free for providers.</strong></p>

      <p>Your practice is already listed based on publicly available information. You can:</p>
      <ul>
        <li>Claim your listing to ensure accuracy</li>
        <li>Update your practice details</li>
        <li>Track how many patients view your listing</li>
        <li>See patient search activity in your area</li>
      </ul>

      <p style="text-align: center;">
        <a href="{{claimUrl}}" class="button">Claim Your Practice</a>
      </p>

      <p>{{searchStats}}</p>

      <p>We're growing quickly and would love to help more patients discover your practice.</p>

      <p>Best regards,<br>
      Bhaven Murji<br>
      Founder, Ignite Health Partnerships<br>
      admin@ignitehealthsystems.com</p>

      <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
        P.S. If you know other DPC providers who might benefit from more patient visibility, feel free to forward this email!
      </p>
    </div>
    <div class="footer">
      <p>Ignite Health Partnerships<br>
      Connecting patients with Direct Primary Care providers</p>
    </div>
  </div>
</body>
</html>
```

**Save and get Template ID**

### Template 3: Monthly Analytics Report

**Name**: `provider-monthly-report`
**Subject**: `{{practiceName}} - Your monthly patient search report`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .stat-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; margin: 15px 0; }
    .stat-number { font-size: 32px; font-weight: bold; color: #2563eb; }
    .stat-label { color: #6b7280; font-size: 14px; }
    .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Your Monthly Report</h1>
      <p>{{month}} {{year}}</p>
    </div>
    <div class="content">
      <h2>Hi {{providerName}},</h2>

      <p>Here's your Ignite Health Partnerships activity report:</p>

      <h3>Your Practice Performance</h3>
      <div class="stat-box">
        <div class="stat-number">{{viewCount}}</div>
        <div class="stat-label">Patients viewed your listing</div>
      </div>

      <div class="stat-box">
        <div class="stat-number">{{contactClicks}}</div>
        <div class="stat-label">Clicked to call your practice</div>
      </div>

      <div class="stat-box">
        <div class="stat-number">{{websiteClicks}}</div>
        <div class="stat-label">Visited your website</div>
      </div>

      <div class="stat-box">
        <div class="stat-number">{{searchAppearances}}</div>
        <div class="stat-label">Search appearances</div>
      </div>

      <h3>Patient Search Activity in Your Area</h3>
      <p>• <strong>{{totalSearches}}</strong> total DPC searches in {{zipCode}}<br>
      • <strong>{{nearbySearches}}</strong> searches within {{radius}} miles of your practice<br>
      • Average patient age: <strong>{{avgAge}} years</strong></p>

      <p style="text-align: center;">
        <a href="{{dashboardUrl}}" class="button">View Full Dashboard</a>
      </p>

      <p><strong>Growing Together:</strong> Ignite Health Partnerships had {{platformSearches}} total searches last month, up {{growthPercent}}% from last month. Thank you for being part of the DPC movement!</p>

      <p>Questions? Just reply to this email.</p>

      <p>Best regards,<br>
      Bhaven Murji<br>
      Ignite Health Partnerships</p>
    </div>
    <div class="footer">
      <p>Ignite Health Partnerships</p>
    </div>
  </div>
</body>
</html>
```

**Save and get Template ID**

### Add Template IDs to .env

After creating templates, add their IDs to your `.env` file:

```bash
# SendGrid Template IDs
SENDGRID_TEMPLATE_EMAIL_VERIFICATION=d-xxxxxxxxxxxxx
SENDGRID_TEMPLATE_PROVIDER_OUTREACH=d-xxxxxxxxxxxxx
SENDGRID_TEMPLATE_MONTHLY_REPORT=d-xxxxxxxxxxxxx
```

---

## Test Sending Emails

### Quick Test Script

Create `apps/api/scripts/test-sendgrid.ts`:

```typescript
import sgMail from '@sendgrid/mail'
import * as dotenv from 'dotenv'

dotenv.config()

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'admin@ignitehealthsystems.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Ignite Health Partnerships'

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY not found in .env')
  process.exit(1)
}

sgMail.setApiKey(SENDGRID_API_KEY)

async function testEmail() {
  const msg = {
    to: 'bhavenmurji@gmail.com', // Your email
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: 'SendGrid Test - Ignite Health Partnerships',
    text: 'This is a test email from SendGrid integration.',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">SendGrid Test Successful!</h1>
        <p>Your SendGrid integration is working correctly.</p>
        <p><strong>From:</strong> ${FROM_NAME} (${FROM_EMAIL})</p>
        <p><strong>API Key:</strong> ${SENDGRID_API_KEY.substring(0, 10)}...</p>
        <p style="color: #10b981; font-weight: bold;">✅ Ready to send provider emails!</p>
      </div>
    `,
  }

  try {
    console.log('📧 Sending test email...')
    const response = await sgMail.send(msg)
    console.log('✅ Email sent successfully!')
    console.log('Response:', response[0].statusCode, response[0].headers)
  } catch (error: any) {
    console.error('❌ Error sending email:', error)
    if (error.response) {
      console.error('Error details:', error.response.body)
    }
  }
}

testEmail()
```

### Run the test:

```bash
cd apps/api
npm install @sendgrid/mail
npx tsx scripts/test-sendgrid.ts
```

You should receive a test email at bhavenmurji@gmail.com.

---

## Next Steps

### Immediate Actions:

1. **Get PostHog API Key**
   - Go to PostHog settings
   - Copy your project API key
   - Add to `apps/web/.env`
   - Restart dev server
   - Test by performing a comparison

2. **Verify SendGrid Sender**
   - Check email from SendGrid
   - Click verification link
   - Confirm sender is verified

3. **Create SendGrid API Key**
   - Generate Full Access API key
   - Add to `apps/api/.env`
   - Run test script to verify

4. **Create Email Templates**
   - Create the 3 templates above in SendGrid
   - Save template IDs
   - Add to `.env`

### This Week:

5. **Build Provider Outreach List**
   - Query database for unclaimed providers
   - Export to CSV with: name, practice, email, city, state, zipCode
   - Import to Airtable or Google Sheets
   - Segment by state/city for targeted campaigns

6. **Set Up First Email Campaign**
   - Start with California providers (98 providers)
   - Use SendGrid's Marketing Campaigns
   - Send "Provider Outreach" template
   - Track open rates and claim clicks

7. **Monitor Analytics**
   - Check PostHog daily for the first week
   - Look for `claim_practice_clicked` events
   - Track provider registration completions
   - Adjust email copy based on results

---

## Environment Variables Summary

### `apps/web/.env`
```bash
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# PostHog Analytics
VITE_POSTHOG_KEY=phc_your_actual_key_here
VITE_POSTHOG_ENABLE_RECORDINGS=false
```

### `apps/api/.env`
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dpc_comparator
PORT=4000
HEALTHCARE_GOV_API_KEY=your_healthcare_gov_api_key

# SendGrid
SENDGRID_API_KEY=SG.your_actual_api_key_here
SENDGRID_FROM_EMAIL=admin@ignitehealthsystems.com
SENDGRID_FROM_NAME=Ignite Health Partnerships

# SendGrid Template IDs (after creating templates)
SENDGRID_TEMPLATE_EMAIL_VERIFICATION=d-xxxxxxxxxxxxx
SENDGRID_TEMPLATE_PROVIDER_OUTREACH=d-xxxxxxxxxxxxx
SENDGRID_TEMPLATE_MONTHLY_REPORT=d-xxxxxxxxxxxxx

# JWT for authentication (generate random 32+ char string)
JWT_SECRET=your_random_32_character_secret_here
```

---

## Support & Resources

- **PostHog Docs**: https://posthog.com/docs
- **SendGrid Docs**: https://docs.sendgrid.com
- **PostHog Support**: support@posthog.com
- **SendGrid Support**: https://support.sendgrid.com

**Your Account Emails**:
- PostHog: bhavenmurji@gmail.com
- SendGrid: admin@ignitehealthsystems.com
