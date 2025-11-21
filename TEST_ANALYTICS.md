# Quick Test Guide

## ✅ PostHog Analytics - Already Configured!

Your PostHog is set up with key: `phc_t5xjhNQjDUWDGPmFFxoeN5Tlcx9AYysBB4c7sjX3eNH`

### Test PostHog Now:

```bash
# Start the web app
cd apps/web
npm run dev
```

**Then:**
1. Open http://localhost:5173 in your browser
2. Enter a comparison (Age: 35, ZIP: 90210, State: CA)
3. Click "Calculate Comparison"
4. Search for providers
5. Click on a provider card

**Verify in PostHog:**
1. Go to https://app.posthog.com
2. Click **"Activity"** → **"Live events"** in left sidebar
3. You should see events appearing in real-time:
   - `$pageview`
   - `comparison_calculated`
   - `provider_search`
   - `provider_viewed`
   - `provider_contact` (if you click phone/website)

**Events will look like:**
```json
{
  "event": "comparison_calculated",
  "properties": {
    "zipCode": "90210",
    "state": "CA",
    "age": 35,
    "traditionalCost": 7544,
    "dpcCost": 2820,
    "savings": 4724,
    "recommendedPlan": "DPC_CATASTROPHIC"
  }
}
```

---

## ⏳ SendGrid Email - Waiting for API Key

### Once You Get SendGrid API Key:

1. **Copy the API key** from SendGrid (starts with `SG.`)

2. **Add to .env file:**
   ```bash
   # Open this file: apps/api/.env
   # Find this line:
   SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE

   # Replace with your actual key:
   SENDGRID_API_KEY=SG.abc123xyz789...
   ```

3. **Test SendGrid:**
   ```bash
   cd apps/api
   npx tsx scripts/test-sendgrid.ts
   ```

4. **Check your email** at bhavenmurji@gmail.com
   - You should receive a test email
   - Subject: "SendGrid Test - Ignite Health Partnerships"
   - If you got it, SendGrid is working! ✅

---

## Expected Results

### PostHog (Should work now):
✅ Events tracked in real-time
✅ See user behavior
✅ Track conversions

### SendGrid (After adding API key):
✅ Test email received
✅ Ready to send provider emails
✅ Templates can be created

---

## Troubleshooting

### PostHog not tracking?
- Make sure dev server restarted after adding key to .env
- Check browser console for errors
- Verify VITE_POSTHOG_KEY in apps/web/.env

### SendGrid test fails?
- Verify sender email (check admin@ignitehealthsystems.com)
- Check API key is correct (no extra spaces)
- Make sure API key has Full Access permissions
