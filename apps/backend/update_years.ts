
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Updating prescriptions to 2026...');
  
  const prescriptions = await prisma.prescription.findMany();
  for (const p of prescriptions) {
    const oldDate = new Date(p.issuedAt);
    const newDate = new Date(oldDate.setFullYear(2026));
    
    await prisma.prescription.update({
      where: { id: p.id },
      data: { issuedAt: newDate }
    });

    // Also update the associated appointment date for consistency
    const consultation = await prisma.consultation.findUnique({
      where: { id: p.consultationId },
      include: { appointment: true }
    });

    if (consultation?.appointment) {
      await prisma.appointment.update({
        where: { id: consultation.appointment.id },
        data: { date: newDate }
      });
    }
  }
  
  console.log('Successfully updated all records to 2026!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
