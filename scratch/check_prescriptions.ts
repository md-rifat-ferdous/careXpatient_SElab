import { PrismaClient } from '../packages/prisma/client';
const prisma = new PrismaClient();

async function main() {
  const prescriptions = await prisma.prescription.findMany({
    take: 1,
    include: {
      consultation: {
        include: {
          appointment: {
            include: {
              patient: { include: { user: true } },
              doctor: { include: { user: true } }
            }
          }
        }
      }
    }
  });
  
  console.log('Prescription structure:', JSON.stringify(prescriptions, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  , 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
