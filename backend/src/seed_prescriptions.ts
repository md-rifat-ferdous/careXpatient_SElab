import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding prescriptions...');

  // 1. Get or create a patient
  const userPatient = await prisma.user.upsert({
    where: { phone: '01700000001' },
    update: {},
    create: {
      phone: '01700000001',
      email: 'rahim@example.com',
      fullName: 'Mr. Rahim Ali',
      role: 'Patient',
      isVerified: true,
    }
  });

  const patient = await prisma.patient.upsert({
    where: { userId: userPatient.id },
    update: {},
    create: {
      userId: userPatient.id,
      bloodGroup: 'O+',
      address: 'Dhaka, Bangladesh',
    }
  });

  // 2. Get or create a doctor
  const userDoctor = await prisma.user.upsert({
    where: { phone: '01800000001' },
    update: {},
    create: {
      phone: '01800000001',
      email: 'anisur@example.com',
      fullName: 'Dr. Anisur Rahman',
      role: 'Doctor',
      isVerified: true,
    }
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: userDoctor.id },
    update: {},
    create: {
      userId: userDoctor.id,
      bmdcNumber: 'A-12345',
      qualification: 'MBBS, FCPS (Medicine)',
    }
  });

  // 3. Create Appointments, Consultations, and Prescriptions
  for (let i = 1; i <= 5; i++) {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        type: 'In_person',
        status: 'Completed',
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        timeSlot: new Date(),
        reasonForVisit: 'General checkup',
      }
    });

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId: appointment.id,
        notes: `Consultation notes for day ${i}`,
      }
    });

    await prisma.prescription.create({
      data: {
        consultationId: consultation.id,
        diagnosis: i % 2 === 0 ? 'Viral Fever and Dehydration' : 'Common Cold and Seasonal Allergies',
        adviceText: 'Take plenty of rest. Drink at least 3 liters of water daily. Avoid cold drinks.',
        medicinesText: [
          'Napa Extend | 665mg | 1+1+1 | 5 Days',
          'Fexo 120 | 120mg | 0+0+1 | 7 Days',
          'Oral Rehydration Salt | 1 Packet | As needed | 3 Days'
        ].join('\n'),
        issuedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
