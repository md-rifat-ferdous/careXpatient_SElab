import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
  const users = await p.user.findMany();
  console.log('USERS:', JSON.stringify(users, null, 2));
  const clinics = await p.doctorClinic.findMany({ include: { clinic: true, user: true } });
  console.log('DOCTOR_CLINICS:', JSON.stringify(clinics, null, 2));
} catch(e) {
  console.error('DB ERROR:', e.message);
} finally {
  await p.$disconnect();
}
