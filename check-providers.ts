import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProviders() {
  const totalCount = await prisma.dPCProvider.count()
  const caCount = await prisma.dPCProvider.count({ where: { state: 'CA' } })

  console.log('Total DPC providers in database:', totalCount)
  console.log('California DPC providers:', caCount)

  if (caCount > 0) {
    const sample = await prisma.dPCProvider.findMany({
      where: { state: 'CA' },
      take: 3,
      select: {
        id: true,
        name: true,
        practiceName: true,
        city: true,
        zipCode: true,
        monthlyFee: true
      }
    })

    console.log('\nSample CA providers:')
    console.log(sample)
  }

  await prisma.$disconnect()
}

checkProviders().catch(console.error)
