import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying DPC Provider Data...\n');

  // Get total count
  const totalResult: any = await prisma.$queryRaw`SELECT COUNT(*) as count FROM dpc_providers`;
  const total = Number(totalResult[0].count);
  console.log(`Total providers: ${total}`);

  // Count providers with coordinates
  const withCoordsResult: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM dpc_providers
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
  `;
  const withCoordinates = Number(withCoordsResult[0].count);

  // Count providers with complete address data
  const withCompleteResult: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM dpc_providers
    WHERE
      city IS NOT NULL AND city != '' AND
      state IS NOT NULL AND state != '' AND
      "zipCode" IS NOT NULL AND "zipCode" != '' AND
      address IS NOT NULL AND address != '' AND address != 'Unknown'
  `;
  const withCompleteAddress = Number(withCompleteResult[0].count);

  // Count providers with incomplete address data
  const withIncompleteResult: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM dpc_providers
    WHERE
      city IS NULL OR city = '' OR
      state IS NULL OR state = '' OR
      "zipCode" IS NULL OR "zipCode" = '' OR
      address IS NULL OR address = '' OR address = 'Unknown'
  `;
  const withIncompleteAddress = Number(withIncompleteResult[0].count);

  console.log(`Providers with coordinates: ${withCoordinates}`);
  console.log(`Providers with complete address: ${withCompleteAddress}`);
  console.log(`Providers with incomplete address: ${withIncompleteAddress}`);
  console.log(`Completion rate: ${((withCompleteAddress / total) * 100).toFixed(2)}%`);
  console.log();

  // Get 10 sample providers with complete data
  console.log('Sample providers with complete data (first 10):');
  console.log('='.repeat(100));
  const completeSamples: any = await prisma.$queryRaw`
    SELECT id, name, "practiceName", address, city, state, "zipCode", latitude, longitude
    FROM dpc_providers
    WHERE
      city IS NOT NULL AND city != '' AND
      state IS NOT NULL AND state != '' AND
      "zipCode" IS NOT NULL AND "zipCode" != '' AND
      address IS NOT NULL AND address != '' AND address != 'Unknown' AND
      latitude IS NOT NULL AND longitude IS NOT NULL
    LIMIT 10
  `;

  completeSamples.forEach((provider: any, i: number) => {
    console.log(`\n${i + 1}. ${provider.practiceName}`);
    console.log(`   Name: ${provider.name}`);
    console.log(`   Address: ${provider.address}`);
    console.log(`   City: ${provider.city}, ${provider.state} ${provider.zipCode}`);
    console.log(`   Coordinates: ${provider.latitude}, ${provider.longitude}`);
  });

  // Get 10 sample providers with incomplete data (if any)
  if (withIncompleteAddress > 0) {
    console.log('\n\nSample providers with INCOMPLETE data (first 10):');
    console.log('='.repeat(100));
    const incompleteSamples: any = await prisma.$queryRaw`
      SELECT id, name, "practiceName", address, city, state, "zipCode", latitude, longitude
      FROM dpc_providers
      WHERE
        city IS NULL OR city = '' OR
        state IS NULL OR state = '' OR
        "zipCode" IS NULL OR "zipCode" = '' OR
        address IS NULL OR address = '' OR address = 'Unknown'
      LIMIT 10
    `;

    incompleteSamples.forEach((provider: any, i: number) => {
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
