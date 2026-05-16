const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doctorEmail = 'doctor@test.com';

  const doctor = await prisma.doctor.findUnique({
    where: { email: doctorEmail }
  });

  if (!doctor) {
    console.error('Doctor not found. Please run create_dummy_user.js first.');
    return;
  }

  const patientsData = [
    {
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      phone: '01711112222',
      email: 'john@example.com',
      lastVisit: new Date('2024-05-10'),
      reports: [
        { name: 'Blood Test', labName: 'CareX Lab', date: new Date('2024-05-01'), description: 'Normal blood count' },
        { name: 'X-Ray Chest', labName: 'MediScan', date: new Date('2024-04-15'), description: 'Clear lungs' }
      ],
      prescriptions: [
        { 
          date: new Date('2024-05-10'), 
          notes: 'Take medicine after meals.',
          medications: JSON.stringify([
            { name: 'Napa Extend', dosage: '1+0+1', duration: '5 days' },
            { name: 'Seclo 20mg', dosage: '1+0+1', duration: '15 days' }
          ])
        }
      ]
    },
    {
      name: 'Jane Smith',
      age: 32,
      gender: 'Female',
      phone: '01711113333',
      email: 'jane@example.com',
      lastVisit: new Date('2024-05-12'),
      reports: [
        { name: 'MRI Brain', labName: 'NeuroHealth', date: new Date('2024-05-05'), description: 'No abnormalities found' }
      ],
      prescriptions: [
        { 
          date: new Date('2024-05-12'), 
          notes: 'Drink plenty of water.',
          medications: JSON.stringify([
            { name: 'Fexo 120mg', dosage: '0+0+1', duration: '7 days' }
          ])
        }
      ]
    },
    {
      name: 'Robert Brown',
      age: 60,
      gender: 'Male',
      phone: '01711114444',
      email: 'robert@example.com',
      lastVisit: new Date('2024-05-08'),
      reports: [
        { name: 'ECG', labName: 'HeartCenter', date: new Date('2024-05-08'), description: 'Slight arrhythmia' }
      ],
      prescriptions: [
        { 
          date: new Date('2024-05-08'), 
          notes: 'Avoid heavy exercise.',
          medications: JSON.stringify([
            { name: 'Atova 10mg', dosage: '0+0+1', duration: '1 month' },
            { name: 'Ecosprin 75mg', dosage: '0+1+0', duration: '1 month' }
          ])
        }
      ]
    }
  ];

  console.log('Seeding patients for Dr. Dummy Account...');

  for (const p of patientsData) {
    const patient = await prisma.patient.create({
      data: {
        doctorId: doctor.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        phone: p.phone,
        email: p.email,
        lastVisit: p.lastVisit,
        reports: {
          create: p.reports
        },
        prescriptions: {
          create: p.prescriptions
        }
      }
    });
    console.log(`  ✓ Created patient: ${p.name}`);
  }

  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
