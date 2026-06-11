
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const prescriptions = await prisma.prescription.findMany({
    take: 5,
    select: {
      id: true,
      issuedAt: true
    }
  });
  console.log(JSON.stringify(prescriptions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
