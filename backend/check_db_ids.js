const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctors = await prisma.doctor.findMany({ select: { id: true, email: true, name: true } });
  const patients = await prisma.patient.findMany({ select: { id: true, name: true } });

  console.log('--- DOCTORS ---');
  doctors.forEach(d => console.log(`${d.id} | ${d.email} | ${d.name}`));

  console.log('\n--- PATIENTS ---');
  patients.forEach(p => console.log(`${p.id} | ${p.name}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
