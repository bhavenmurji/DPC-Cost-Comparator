import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import comparisonRoutes from './routes/comparison.routes.js'
import providerRoutes from './routes/provider.routes.js'
import prescriptionRoutes from './routes/prescription.routes.js'
import pricingRoutes from './routes/pricing.routes.js'
import { configureHealthcareGovApi } from './config/healthcareGov.config.js'

const app = express()
const PORT = process.env.PORT || 4000

// Initialize Healthcare.gov API client
configureHealthcareGovApi()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HealthPartnershipX API - DPC Cost Comparator',
  })
})

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Ignite Health Partnerships API - DPC Cost Comparator',
    version: '0.2.0',
    endpoints: {
      health: '/health',
      comparison: '/api/comparison',
      providers: '/api/providers',
      prescriptions: '/api/prescriptions',
      pricing: '/api/pricing',
    },
  })
})

// API Routes
app.use('/api/comparison', comparisonRoutes)
app.use('/api/providers', providerRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/pricing', pricingRoutes)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app
