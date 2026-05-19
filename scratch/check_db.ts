import { PrismaClient } from '../packages/prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.labOrder.count();
  const reportedCount = await prisma.labOrder.count({ where: { status: 'Reported' } });
  const allOrders = await prisma.labOrder.findMany({ include: { tests: { include: { labTest: true } } } });
  
  console.log('Total Orders:', count);
  console.log('Reported Orders:', reportedCount);
  console.log('Orders Detail:', JSON.stringify(allOrders, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
