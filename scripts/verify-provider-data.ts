import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying DPC Provider Data...\n');

  // Get total count
  const total = await prisma.dPCProvider.count();
  console.log(`Total providers: ${total}`);

  // Count providers with complete address data
  const withCompleteAddress = await prisma.dPCProvider.count({
    where: {
      NOT: [
        { city: null },
        { city: '' },
        { state: null },
        { state: '' },
        { zipCode: null },
        { zipCode: '' },
        { address: null },
        { address: '' },
        { address: 'Unknown' },
      ],
    },
  });

  // Count providers with coordinates
  const withCoordinates = await prisma.dPCProvider.count({
    where: {
      NOT: [
        { latitude: null },
        { longitude: null },
      ],
    },
  });

  // Count providers with incomplete address data
  const withIncompleteAddress = await prisma.dPCProvider.count({
    where: {
      OR: [
        { city: null },
        { city: '' },
        { state: null },
        { state: '' },
        { zipCode: null },
        { zipCode: '' },
        { address: null },
        { address: '' },
        { address: 'Unknown' },
      ],
    },
  });

  console.log(`Providers with coordinates: ${withCoordinates}`);
  console.log(`Providers with complete address: ${withCompleteAddress}`);
  console.log(`Providers with incomplete address: ${withIncompleteAddress}`);
  console.log(`Completion rate: ${((withCompleteAddress / total) * 100).toFixed(2)}%`);
  console.log();

  // Get 10 sample providers with complete data
  console.log('Sample providers with complete data (first 10):');
  console.log('='.repeat(100));
  const completeSamples = await prisma.dPCProvider.findMany({
    where: {
      NOT: [
        { city: null },
        { city: '' },
        { state: null },
        { state: '' },
        { zipCode: null },
        { zipCode: '' },
        { address: null },
        { address: '' },
        { address: 'Unknown' },
        { latitude: null },
        { longitude: null },
      ],
    },
    take: 10,
    select: {
      id: true,
      name: true,
      practiceName: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      latitude: true,
      longitude: true,
    },
  });

  completeSamples.forEach((provider, i) => {
    console.log(`\n${i + 1}. ${provider.practiceName}`);
    console.log(`   Name: ${provider.name}`);
    console.log(`   Address: ${provider.address}`);
    console.log(`   City: ${provider.city}, ${provider.state} ${provider.zipCode}`);
    console.log(`   Coordinates: ${provider.latitude}, ${provider.longitude}`);
  });

  // Get 10 sample providers with incomplete data (if any)
  if (withIncompleteAddress > 0) {
    console.log('\n\nSample providers with INCOMPLETE data:');
    console.log('='.repeat(100));
    const incompleteSamples = await prisma.dPCProvider.findMany({
      where: {
        OR: [
          { city: null },
          { city: '' },
          { state: null },
          { state: '' },
          { zipCode: null },
          { zipCode: '' },
          { address: null },
          { address: '' },
          { address: 'Unknown' },
        ],
      },
      take: 10,
      select: {
        id: true,
        name: true,
        practiceName: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        latitude: true,
        longitude: true,
      },
    });

    incompleteSamples.forEach((provider, i) => {
      console.log(`\n${i + 1}. ${provider.practiceName}`);
      console.log(`   Name: ${provider.name}`);
      console.log(`   Address: ${provider.address || 'MISSING'}`);
      console.log(`   City: ${provider.city || 'MISSING'}, ${provider.state || 'MISSING'} ${provider.zipCode || 'MISSING'}`);
      console.log(`   Coordinates: ${provider.latitude || 'MISSING'}, ${provider.longitude || 'MISSING'}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
