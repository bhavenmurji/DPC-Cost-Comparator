import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for placeholder addresses...\n');

  // Count providers with placeholder addresses
  const placeholderAddresses: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM dpc_providers
    WHERE
      address = 'Address not available' OR
      city = 'Unknown' OR
      state = 'XX' OR
      "zipCode" = '00000'
  `;
  console.log(`Providers with placeholder data: ${placeholderAddresses[0].count}`);

  // Count providers with real addresses
  const realAddresses: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM dpc_providers
    WHERE
      address != 'Address not available' AND
      city != 'Unknown' AND
      state != 'XX' AND
      "zipCode" != '00000'
  `;
  console.log(`Providers with real addresses: ${realAddresses[0].count}`);

  // Get sample of providers with placeholder addresses
  console.log('\nSample providers with PLACEHOLDER addresses (first 10):');
  console.log('='.repeat(100));
  const samples: any = await prisma.$queryRaw`
    SELECT id, "practiceName", address, city, state, "zipCode", latitude, longitude
    FROM dpc_providers
    WHERE
      address = 'Address not available' OR
      city = 'Unknown' OR
      state = 'XX' OR
      "zipCode" = '00000'
    LIMIT 10
  `;

  samples.forEach((provider: any, i: number) => {
    console.log(`\n${i + 1}. ${provider.practiceName}`);
    console.log(`   Address: ${provider.address}`);
    console.log(`   City: ${provider.city}, ${provider.state} ${provider.zipCode}`);
    console.log(`   Coordinates: ${provider.latitude}, ${provider.longitude}`);
  });

  // Get sample of providers with REAL addresses
  console.log('\n\nSample providers with REAL addresses (first 10):');
  console.log('='.repeat(100));
  const realSamples: any = await prisma.$queryRaw`
    SELECT id, "practiceName", address, city, state, "zipCode", latitude, longitude
    FROM dpc_providers
    WHERE
      address != 'Address not available' AND
      city != 'Unknown' AND
      state != 'XX' AND
      "zipCode" != '00000'
    LIMIT 10
  `;

  realSamples.forEach((provider: any, i: number) => {
    console.log(`\n${i + 1}. ${provider.practiceName}`);
    console.log(`   Address: ${provider.address}`);
    console.log(`   City: ${provider.city}, ${provider.state} ${provider.zipCode}`);
    console.log(`   Coordinates: ${provider.latitude}, ${provider.longitude}`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
