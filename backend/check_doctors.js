const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.doctor.count();
  console.log(`Doctor count: ${count}`);
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      specialties: { include: { specialty: true } }
    }
  });
  console.log(JSON.stringify(doctors, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
