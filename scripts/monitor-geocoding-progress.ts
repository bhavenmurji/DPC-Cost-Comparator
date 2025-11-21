import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = 2759;

  // Count providers with placeholder addresses
  const placeholder: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM dpc_providers
    WHERE
      address = 'Address not available' OR
      city = 'Unknown' OR
      state = 'XX' OR
      "zipCode" = '00000'
  `;

  // Count providers with real addresses
  const real: any = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM dpc_providers
    WHERE
      address != 'Address not available' AND
      city != 'Unknown' AND
      state != 'XX' AND
      "zipCode" != '00000'
  `;

  const placeholderCount = Number(placeholder[0].count);
  const realCount = Number(real[0].count);
  const progress = (realCount / total) * 100;
  const remaining = placeholderCount;
  const estimatedMinutesRemaining = Math.ceil(remaining / 60);

  console.log('='.repeat(80));
  console.log('REVERSE GEOCODING PROGRESS');
  console.log('='.repeat(80));
  console.log(`Total Providers: ${total}`);
  console.log(`Geocoded: ${realCount}`);
  console.log(`Remaining: ${placeholderCount}`);
  console.log(`Progress: ${progress.toFixed(2)}%`);
  console.log(`Estimated Time Remaining: ${estimatedMinutesRemaining} minutes`);
  console.log('='.repeat(80));

  await prisma.$disconnect();
}

main().catch(console.error);
