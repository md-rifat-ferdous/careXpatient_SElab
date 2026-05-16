const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prescriptions = await prisma.prescription.findMany({
    include: {
      patient: { select: { name: true } },
      doctor: { select: { name: true } }
    }
  });

  console.log('--- PRESCRIPTIONS IN DB ---');
  prescriptions.forEach(p => {
    console.log(`[${p.id}] Patient: ${p.patient?.name} (ID: ${p.patientId}) | Doctor: ${p.doctor?.name} (ID: ${p.doctorId})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
