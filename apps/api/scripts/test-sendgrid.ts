import sgMail from '@sendgrid/mail'
import * as dotenv from 'dotenv'

dotenv.config()

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'admin@ignitehealthsystems.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Ignite Health Partnerships'

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY not found in .env')
  console.error('Please add SENDGRID_API_KEY to apps/api/.env')
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">SendGrid Test Successful!</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Your SendGrid integration is working correctly.</p>

          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #10b981; font-weight: bold;">✅ Ready to send provider emails!</p>
          </div>

          <p><strong>Configuration Details:</strong></p>
          <ul style="color: #6b7280;">
            <li><strong>From:</strong> ${FROM_NAME} (${FROM_EMAIL})</li>
            <li><strong>API Key:</strong> ${SENDGRID_API_KEY.substring(0, 15)}...</li>
            <li><strong>Sender Verified:</strong> ${FROM_EMAIL === 'admin@ignitehealthsystems.com' ? '✅ Yes' : '⚠️ Verify sender in SendGrid'}</li>
          </ul>

          <h3>Next Steps:</h3>
          <ol>
            <li>Verify your sender email in SendGrid if not already done</li>
            <li>Create Dynamic Templates for:
              <ul>
                <li>Email Verification</li>
                <li>Provider Outreach</li>
                <li>Monthly Analytics Reports</li>
              </ul>
            </li>
            <li>Add template IDs to .env file</li>
            <li>Build provider contact database</li>
            <li>Launch first email campaign to California providers</li>
          </ol>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            This test email was sent from your DPC Cost Comparator application.
          </p>
        </div>
      </div>
    `,
  }

  try {
    console.log('📧 Sending test email to bhavenmurji@gmail.com...')
    console.log(`From: ${FROM_NAME} <${FROM_EMAIL}>`)
    console.log(`API Key: ${SENDGRID_API_KEY.substring(0, 15)}...`)
    console.log('')

    const response = await sgMail.send(msg)

    console.log('✅ Email sent successfully!')
    console.log(`Status Code: ${response[0].statusCode}`)
    console.log(`Message ID: ${response[0].headers['x-message-id']}`)
    console.log('')
    console.log('Check your inbox at bhavenmurji@gmail.com')
    console.log('')
    console.log('If you received the email, SendGrid is configured correctly!')
    console.log('')
    console.log('Next: Create Dynamic Templates in SendGrid dashboard')
    console.log('See docs/POSTHOG_SENDGRID_SETUP.md for template HTML')

  } catch (error: any) {
    console.error('❌ Error sending email')
    console.error('')

    if (error.response) {
      console.error('SendGrid Error Details:')
      console.error(JSON.stringify(error.response.body, null, 2))
      console.error('')

      if (error.response.body.errors) {
        error.response.body.errors.forEach((err: any) => {
          console.error(`• ${err.message}`)
        })
      }
    } else {
      console.error(error.message)
    }

    console.error('')
    console.error('Common issues:')
    console.error('1. SENDGRID_API_KEY not set in .env file')
    console.error('2. Sender email not verified in SendGrid')
    console.error('3. API key permissions not set to "Full Access"')
    console.error('')
    console.error('Check docs/POSTHOG_SENDGRID_SETUP.md for setup instructions')

    process.exit(1)
  }
}

testEmail()
