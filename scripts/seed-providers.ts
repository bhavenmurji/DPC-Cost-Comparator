/**
 * Seed DPC Providers Database
 * Populates database with sample DPC providers for testing
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ProviderSeed {
  npi: string
  name: string
  practiceName: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number
  longitude: number
  phone: string
  email: string
  website: string
  monthlyFee: number
  familyFee: number
  servicesIncluded: string[]
  specialties: string[]
  boardCertifications: string[]
  languages: string[]
  acceptingPatients: boolean
}

const sampleProviders: ProviderSeed[] = [
  // Austin, TX area
  {
    npi: '1234567890',
    name: 'Dr. Sarah Johnson',
    practiceName: 'Austin Family DPC',
    address: '123 Congress Ave',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    latitude: 30.2672,
    longitude: -97.7431,
    phone: '512-555-0100',
    email: 'contact@austinfamilydpc.com',
    website: 'https://austinfamilydpc.com',
    monthlyFee: 75,
    familyFee: 150,
    servicesIncluded: [
      'Unlimited office visits',
      'Same-day appointments',
      'Telemedicine',
      'Basic lab work',
      'Chronic disease management',
    ],
    specialties: ['Family Medicine', 'Internal Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English', 'Spanish'],
    acceptingPatients: true,
  },
  {
    npi: '2345678901',
    name: 'Dr. Michael Chen',
    practiceName: 'Lakeway Direct Care',
    address: '456 Lakeway Blvd',
    city: 'Lakeway',
    state: 'TX',
    zipCode: '78734',
    latitude: 30.3627,
    longitude: -97.9789,
    phone: '512-555-0200',
    email: 'info@lakewaydirect.com',
    website: 'https://lakewaydirect.com',
    monthlyFee: 85,
    familyFee: 170,
    servicesIncluded: [
      'Unlimited visits',
      '24/7 text access',
      'Annual wellness exam',
      'Minor procedures',
      'Health coaching',
    ],
    specialties: ['Internal Medicine', 'Preventive Medicine'],
    boardCertifications: ['American Board of Internal Medicine'],
    languages: ['English', 'Mandarin'],
    acceptingPatients: true,
  },
  // Houston, TX area
  {
    npi: '3456789012',
    name: 'Dr. Emily Rodriguez',
    practiceName: 'Houston Direct Primary Care',
    address: '789 Main St',
    city: 'Houston',
    state: 'TX',
    zipCode: '77002',
    latitude: 29.7604,
    longitude: -95.3698,
    phone: '713-555-0300',
    email: 'care@houstondpc.com',
    website: 'https://houstondpc.com',
    monthlyFee: 65,
    familyFee: 130,
    servicesIncluded: [
      'Unlimited office visits',
      'Telemedicine',
      'Basic procedures',
      'Health coaching',
      'Care coordination',
    ],
    specialties: ['Family Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English', 'Spanish'],
    acceptingPatients: true,
  },
  // Dallas, TX area
  {
    npi: '4567890123',
    name: 'Dr. James Williams',
    practiceName: 'Dallas Premier DPC',
    address: '321 Elm Street',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    latitude: 32.7767,
    longitude: -96.7970,
    phone: '214-555-0400',
    email: 'hello@dallaspremier.com',
    website: 'https://dallaspremier.com',
    monthlyFee: 95,
    familyFee: 190,
    servicesIncluded: [
      'Unlimited visits',
      'Executive health exams',
      'Nutrition counseling',
      'Mental health support',
      'Telemedicine 24/7',
    ],
    specialties: ['Family Medicine', 'Sports Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English'],
    acceptingPatients: true,
  },
  // San Antonio, TX area
  {
    npi: '5678901234',
    name: 'Dr. Maria Garcia',
    practiceName: 'Alamo Direct Care',
    address: '555 Riverwalk Dr',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78205',
    latitude: 29.4241,
    longitude: -98.4936,
    phone: '210-555-0500',
    email: 'maria@alamodirect.com',
    website: 'https://alamodirect.com',
    monthlyFee: 70,
    familyFee: 140,
    servicesIncluded: [
      'Unlimited visits',
      'Bilingual care',
      'Chronic disease management',
      'Preventive care',
      'Telemedicine',
    ],
    specialties: ['Family Medicine', 'Internal Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English', 'Spanish'],
    acceptingPatients: true,
  },
  // California examples
  {
    npi: '6789012345',
    name: 'Dr. David Kim',
    practiceName: 'Silicon Valley Direct Care',
    address: '1000 El Camino Real',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94301',
    latitude: 37.4419,
    longitude: -122.1430,
    phone: '650-555-0600',
    email: 'care@svdirect.com',
    website: 'https://svdirect.com',
    monthlyFee: 125,
    familyFee: 250,
    servicesIncluded: [
      'Unlimited visits',
      'Executive health screening',
      'Mental health support',
      'Nutrition consulting',
      'Telemedicine',
    ],
    specialties: ['Internal Medicine', 'Preventive Medicine'],
    boardCertifications: ['American Board of Internal Medicine'],
    languages: ['English', 'Korean', 'Mandarin'],
    acceptingPatients: true,
  },
  {
    npi: '7890123456',
    name: 'Dr. Lisa Thompson',
    practiceName: 'LA Family Direct Primary Care',
    address: '2000 Wilshire Blvd',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90057',
    latitude: 34.0522,
    longitude: -118.2437,
    phone: '213-555-0700',
    email: 'lisa@lafamilydpc.com',
    website: 'https://lafamilydpc.com',
    monthlyFee: 89,
    familyFee: 178,
    servicesIncluded: [
      'Unlimited office visits',
      'Same-day appointments',
      'Telemedicine',
      'Basic lab work',
    ],
    specialties: ['Family Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English', 'Spanish'],
    acceptingPatients: true,
  },
  // New York examples
  {
    npi: '8901234567',
    name: 'Dr. Robert Brown',
    practiceName: 'Manhattan Direct Primary Care',
    address: '100 Broadway',
    city: 'New York',
    state: 'NY',
    zipCode: '10005',
    latitude: 40.7128,
    longitude: -74.0060,
    phone: '212-555-0800',
    email: 'robert@manhattandpc.com',
    website: 'https://manhattandpc.com',
    monthlyFee: 150,
    familyFee: 300,
    servicesIncluded: [
      'Unlimited visits',
      'Executive health services',
      'Concierge medicine',
      '24/7 access',
      'House calls available',
    ],
    specialties: ['Internal Medicine', 'Geriatrics'],
    boardCertifications: ['American Board of Internal Medicine'],
    languages: ['English', 'French'],
    acceptingPatients: true,
  },
  // Florida examples
  {
    npi: '9012345678',
    name: 'Dr. Jennifer Martinez',
    practiceName: 'Miami Beach Direct Care',
    address: '500 Ocean Drive',
    city: 'Miami Beach',
    state: 'FL',
    zipCode: '33139',
    latitude: 25.7617,
    longitude: -80.1918,
    phone: '305-555-0900',
    email: 'jennifer@miamibeachdirect.com',
    website: 'https://miamibeachdirect.com',
    monthlyFee: 95,
    familyFee: 190,
    servicesIncluded: [
      'Unlimited visits',
      'Bilingual care',
      'Travel medicine',
      'Wellness programs',
      'Telemedicine',
    ],
    specialties: ['Family Medicine', 'Travel Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English', 'Spanish', 'Portuguese'],
    acceptingPatients: true,
  },
  {
    npi: '0123456789',
    name: 'Dr. William Anderson',
    practiceName: 'Tampa Bay Direct Primary Care',
    address: '700 Harbor Blvd',
    city: 'Tampa',
    state: 'FL',
    zipCode: '33602',
    latitude: 27.9506,
    longitude: -82.4572,
    phone: '813-555-1000',
    email: 'bill@tampabaydpc.com',
    website: 'https://tampabaydpc.com',
    monthlyFee: 80,
    familyFee: 160,
    servicesIncluded: [
      'Unlimited visits',
      'Chronic disease management',
      'Preventive care',
      'Telemedicine',
      'Basic lab work',
    ],
    specialties: ['Family Medicine', 'Internal Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English'],
    acceptingPatients: true,
  },
]

async function seedProviders() {
  console.log('Starting DPC provider seeding...')

  for (const provider of sampleProviders) {
    try {
      // Check if provider already exists
      const existing = await prisma.dPCProvider.findUnique({
        where: { npi: provider.npi },
      })

      if (existing) {
        console.log(`Provider ${provider.name} already exists, skipping...`)
        continue
      }

      // Create provider
      await prisma.dPCProvider.create({
        data: provider,
      })

      console.log(`Created provider: ${provider.name} in ${provider.city}, ${provider.state}`)
    } catch (error) {
      console.error(`Error creating provider ${provider.name}:`, error)
    }
  }

  console.log('Provider seeding complete!')

  // Print summary
  const total = await prisma.dPCProvider.count()
  const withCoordinates = await prisma.dPCProvider.count({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
  })

  console.log(`\nSummary:`)
  console.log(`Total providers: ${total}`)
  console.log(`Providers with coordinates: ${withCoordinates}`)
  console.log(`Providers by state:`)

  const byState = await prisma.dPCProvider.groupBy({
    by: ['state'],
    _count: { id: true },
  })

  byState.forEach((state) => {
    console.log(`  ${state.state}: ${state._count.id}`)
  })
}

async function main() {
  try {
    await seedProviders()
  } catch (error) {
    console.error('Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
