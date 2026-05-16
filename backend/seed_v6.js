const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting Simplified High-Fidelity Hospital Ecosystem seed (v6)...');

  // 0. Clean slate
  await prisma.prescription.deleteMany();
  await prisma.report.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash('password123', salt);

  // 1. Create Doctors
  const docs = [
    { email: 'doctor@test.com', name: 'Dr. Sarah Ahmed', specialty: 'Cardiology' },
    { email: 'johnson@carex.com', name: 'Dr. Sarah Johnson', specialty: 'Interventional Cardiology' },
    { email: 'chen@carex.com', name: 'Dr. Michael Chen', specialty: 'Endocrinology' },
    { email: 'wilson@carex.com', name: 'Dr. Robert Wilson', specialty: 'Respiratory Medicine' },
    { email: 'markson@carex.com', name: 'Dr. Lisa Markson', specialty: 'General Physician' }
  ];

  const doctors = {};
  for (const d of docs) {
    doctors[d.email] = await prisma.doctor.create({
      data: {
        ...d,
        password: hashedPw,
        phone: `017${Math.floor(10000000 + Math.random() * 90000000)}`,
        experienceYears: 12,
        fee: 1000,
        about: `${d.name} is a specialist in ${d.specialty}.`
      }
    });
  }
  const ahmed = doctors['doctor@test.com'];
  const chen = doctors['chen@carex.com'];
  const johnson = doctors['johnson@carex.com'];

  // Image assets mapping (Local only)
  const IMAGES = {
    MRI: '/medical/mri/mri-1.jpg',
    XRAY: '/medical/xray/xray-1.jpg',
    BLOOD: '/medical/blood/blood-1.jpg'
  };

  console.log('✓ Doctors Ready.');

  // 2. Create Patients with High-Fidelity Histories
  
  // PATIENT: Emma Wilson
  await prisma.patient.create({
    data: {
      name: 'Emma Wilson',
      age: 42,
      gender: 'Female',
      phone: '01700112233',
      email: 'emma.w@example.com',
      doctorId: ahmed.id,
      reports: {
        create: [
          { name: 'Chest X-Ray', labName: 'MediScan', date: new Date('2024-04-10'), description: 'Clear lungs.', fileUrl: IMAGES.XRAY },
          { name: 'Complete Blood Count (CBC)', labName: 'CareX Lab', date: new Date('2024-05-01'), description: 'Normal WBC count.', fileUrl: IMAGES.BLOOD }
        ]
      },
      prescriptions: {
        create: [
          { date: new Date('2024-05-16'), doctorId: ahmed.id, notes: 'Hypertension monitoring.', medications: JSON.stringify([{ name: 'Amlodipine 5mg', dosage: '1+0+0', duration: '30 days' }]) }
        ]
      }
    }
  });

  // PATIENT: John Doe
  await prisma.patient.create({
    data: {
      name: 'John Doe',
      age: 55,
      gender: 'Male',
      phone: '01711223344',
      email: 'john.d@example.com',
      doctorId: ahmed.id,
      reports: {
        create: [
          { name: 'Routine Blood Test', labName: 'Diagnostics Plus', date: new Date('2024-05-05'), description: 'Slightly high cholesterol.', fileUrl: IMAGES.BLOOD }
        ]
      },
      prescriptions: {
        create: [
          { date: new Date('2024-05-12'), doctorId: ahmed.id, notes: 'Statins prescribed.', medications: JSON.stringify([{ name: 'Atorvastatin 20mg', dosage: '0+0+1', duration: '3 months' }]) },
          { date: new Date('2024-05-06'), doctorId: chen.id, notes: 'Diabetes management.', medications: JSON.stringify([{ name: 'Metformin 500mg', dosage: '1+0+1', duration: '6 months' }]) }
        ]
      }
    }
  });

  // PATIENT: Sarah Miller
  await prisma.patient.create({
    data: {
      name: 'Sarah Miller',
      age: 38,
      gender: 'Female',
      phone: '01733445566',
      email: 's.miller@example.com',
      doctorId: ahmed.id,
      reports: {
        create: [
          { name: 'MRI Brain Scan', labName: 'NeuroHealth', date: new Date('2024-04-20'), description: 'No acute findings.', fileUrl: IMAGES.MRI }
        ]
      },
      prescriptions: {
        create: [
          { date: new Date('2024-05-14'), doctorId: ahmed.id, notes: 'Follow-up for headaches.', medications: JSON.stringify([{ name: 'Propranolol 10mg', dosage: '1+0+1', duration: '15 days' }]) }
        ]
      }
    }
  });

  console.log('✓ Simplified High-Fidelity Seeding Complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
