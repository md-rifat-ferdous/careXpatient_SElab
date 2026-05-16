const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting full data seed (v2)...');

  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash('password123', salt);

  // 1. Create/Update Doctor
  const doctor = await prisma.doctor.upsert({
    where: { email: 'doctor@test.com' },
    update: {
      password: hashedPw
    },
    create: {
      email: 'doctor@test.com',
      password: hashedPw,
      name: 'Dr. Sarah Ahmed',
      phone: '01700000000',
      specialty: 'Cardiology',
      qualification: 'MBBS, MD',
      experienceYears: 12,
      fee: 1000,
      about: 'Experienced cardiologist dedicated to patient care.'
    }
  });

  console.log(`✓ Doctor prepared: ${doctor.name} (${doctor.id})`);

  // 2. Create Patients
  const patientsData = [
    {
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      phone: '01711112222',
      email: 'john@example.com',
      lastVisit: new Date('2024-05-10'),
      reports: [
        { 
          name: 'Blood Test', 
          labName: 'CareX Lab', 
          date: new Date('2024-05-01'), 
          description: 'Normal blood count',
          doctorNotes: 'Everything looks good.',
          followUpRecommendation: 'Regular diet'
        },
        { 
          name: 'Chest X-Ray', 
          labName: 'MediScan', 
          date: new Date('2024-04-15'), 
          description: 'Clear lungs',
          doctorNotes: 'No signs of infection.',
          followUpRecommendation: 'None'
        }
      ],
      prescriptions: [
        { 
          date: new Date('2024-05-10'), 
          notes: 'Take medicine after meals.',
          doctorId: doctor.id,
          status: 'active',
          medications: JSON.stringify([
            { name: 'Napa Extend', dosage: '1+0+1', duration: '5 days' },
            { name: 'Seclo 20mg', dosage: '1+0+1', duration: '15 days' }
          ])
        },
        { 
          date: new Date('2024-01-20'), 
          notes: 'Completed course.',
          doctorId: doctor.id,
          status: 'archived',
          medications: JSON.stringify([
            { name: 'Amoxicillin', dosage: '1+1+1', duration: '7 days' }
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
        { 
          name: 'MRI Brain', 
          labName: 'NeuroHealth', 
          date: new Date('2024-05-05'), 
          description: 'No abnormalities found' 
        }
      ],
      prescriptions: [
        { 
          date: new Date('2024-05-12'), 
          notes: 'Drink plenty of water.',
          doctorId: doctor.id,
          status: 'active',
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
        { 
          name: 'ECG', 
          labName: 'HeartCenter', 
          date: new Date('2024-05-08'), 
          description: 'Slight arrhythmia' 
        }
      ],
      prescriptions: [
        { 
          date: new Date('2024-05-08'), 
          notes: 'Avoid heavy exercise.',
          doctorId: doctor.id,
          status: 'active',
          medications: JSON.stringify([
            { name: 'Atova 10mg', dosage: '0+0+1', duration: '1 month' },
            { name: 'Ecosprin 75mg', dosage: '0+1+0', duration: '1 month' }
          ])
        }
      ]
    }
  ];

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

  // 3. Create a prescription from ANOTHER doctor for John Doe
  const otherDoctor = await prisma.doctor.upsert({
    where: { email: 'specialist@carex.com' },
    update: {
      password: hashedPw
    },
    create: {
      email: 'specialist@carex.com',
      password: hashedPw,
      name: 'Dr. Michael West',
      phone: '01799999999',
      specialty: 'Neurology'
    }
  });

  const john = await prisma.patient.findFirst({ where: { name: 'John Doe' } });
  if (john) {
    await prisma.prescription.create({
      data: {
        patientId: john.id,
        doctorId: otherDoctor.id,
        date: new Date('2024-05-15'),
        notes: 'Neurological evaluation. Keep monitoring.',
        status: 'active',
        medications: JSON.stringify([
          { name: 'Neurobion', dosage: '1+0+1', duration: '1 month' }
        ])
      }
    });
    console.log(`✓ Added cross-doctor prescription for ${john.name} by ${otherDoctor.name}`);
  }

  console.log('Seeding complete! Full medical history restored.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
