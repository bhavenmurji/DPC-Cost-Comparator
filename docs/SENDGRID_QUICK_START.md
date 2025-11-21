# SendGrid Quick Start - Get Your API Key

## Current Step: You're on "Set Up Sending" Page

### Option 1: Single Sender Verification (Recommended - Fastest)

**This is the quickest way to get started. Do this:**

1. **Go back to the main menu**
   - Click "SendGrid" logo in top-left
   - Or go to: https://app.sendgrid.com/

2. **Navigate to Sender Authentication**
   - Settings (gear icon in left sidebar)
   - Click "Sender Authentication"
   - Click "Verify a Single Sender"

3. **Fill in the form:**
   ```
   From Name: Ignite Health Partnerships
   From Email Address: admin@ignitehealthsystems.com
   Reply To: admin@ignitehealthsystems.com
   Company Address: (Your business address)
   Company City: (Your city)
   Company State: (Your state)
   Company ZIP: (Your ZIP)
   Company Country: United States
   Nickname: Ignite Health Main
   ```

4. **Click "Create"**

5. **Check your email** (admin@ignitehealthsystems.com)
   - You'll receive verification email from SendGrid
   - Click "Verify Single Sender"
   - This activates your sender

6. **Status should show "Verified" ✅**

---

## Step 2: Create API Key

**Once sender is verified:**

1. **Go to API Keys**
   - Settings → API Keys
   - Or: https://app.sendgrid.com/settings/api_keys

2. **Click "Create API Key"**

3. **Configure the key:**
   ```
   API Key Name: Ignite Health Partnerships - Production
   API Key Permissions: Full Access
   ```

4. **Click "Create & View"**

5. **⚠️ IMPORTANT: Copy the API key NOW**
   - It starts with `SG.`
   - Example: `SG.abc123...xyz789`
   - **You will NOT see it again!**
   - Store it securely

---

## Step 3: Add API Key to Your App

**Open your `.env` file:**

```bash
# Path: apps/api/.env
# Find this line:
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE

# Replace with your actual key:
SENDGRID_API_KEY=SG.your_actual_key_here
```

**Save the file.**

---

## Step 4: Test Your Setup

**Run the test script:**

```bash
cd apps/api
npx tsx scripts/test-sendgrid.ts
```

**Expected output:**
```
📧 Sending test email to bhavenmurji@gmail.com...
From: Ignite Health Partnerships <admin@ignitehealthsystems.com>
API Key: SG.abc123...

✅ Email sent successfully!
Status Code: 202
Message ID: xyz789...

Check your inbox at bhavenmurji@gmail.com
```

**Check your email** at bhavenmurji@gmail.com - you should receive a test email!

---

## What to Do on the Current Page

**You're currently on the domain authentication page. Here's what to do:**

### If you want to skip domain authentication for now:
1. Click "SendGrid" logo (top-left) to go back
2. Follow "Option 1: Single Sender Verification" above

### If you want to set up domain authentication (optional, better for deliverability):
1. Enter: `ignitehealthsystems.com`
2. Click "Yes" for link branding
3. Click "Next"
4. You'll get DNS records to add to your domain
5. Add these records in your domain registrar (GoDaddy, Namecheap, etc.)
6. Come back and click "Verify"

**For now, I recommend skipping domain auth** and just doing Single Sender Verification - it's faster and works fine for initial testing.

---

## Troubleshooting

### "Sender not verified" error
- Check email at admin@ignitehealthsystems.com
- Click verification link
- Wait a few minutes and try again

### "Invalid API key" error
- Make sure you copied the full key (starts with `SG.`)
- Check for extra spaces in .env file
- Regenerate a new key if needed

### Can't find verification email
- Check spam folder
- Resend verification from SendGrid dashboard
- Contact SendGrid support if still not received

---

## Next Steps After Testing Works

1. **✅ Test email received** → Sender is verified and API key works!

2. **Create email templates** in SendGrid
   - See `docs/POSTHOG_SENDGRID_SETUP.md` for HTML templates
   - Create 3 templates: Email Verification, Provider Outreach, Monthly Report

3. **Add template IDs** to `.env`:
   ```bash
   SENDGRID_TEMPLATE_EMAIL_VERIFICATION=d-xxxxx
   SENDGRID_TEMPLATE_PROVIDER_OUTREACH=d-xxxxx
   SENDGRID_TEMPLATE_MONTHLY_REPORT=d-xxxxx
   ```

4. **Build provider contact database** and launch first campaign!

---

## Quick Reference

**SendGrid Dashboard**: https://app.sendgrid.com
**Account Email**: admin@ignitehealthsystems.com
**Backup Code**: T4UKPXUXKYHP2E1WV8Y4BLSR

**API Key Location**: `apps/api/.env` → `SENDGRID_API_KEY`
**Test Script**: `apps/api/scripts/test-sendgrid.ts`

**Free Tier Limits**:
- 100 emails/day
- Perfect for gradual provider outreach
- Upgrade to Essential ($19.95/mo) for 50K emails when needed
