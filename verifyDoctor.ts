// verifyDoctor.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seededDoctorEmail = 'doctor@carexpatient.com';
  const doctor = await prisma.user.findUnique({ where: { email: seededDoctorEmail } });
  if (!doctor) {
    console.error('Seeded doctor not found');
    return;
  }
  console.log('Resolved doctorId from seed fallback:', doctor.id);

  const clinics = await prisma.doctorClinic.findMany({
    where: { userId: doctor.id },
    include: { clinic: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log('Clinic count:', clinics.length);
  console.log('Clinic names:', clinics.map(c => c.clinic.name).join(', '));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
