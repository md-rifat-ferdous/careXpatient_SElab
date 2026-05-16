const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting realistic multi-doctor data seed...');

  // 0. Clean existing data to prevent duplicates during demo
  await prisma.prescription.deleteMany();
  await prisma.report.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash('password123', salt);

  // 1. Create Multiple Doctors
  const doctorsData = [
    {
      email: 'doctor@test.com',
      name: 'Dr. Sarah Ahmed',
      specialty: 'Cardiology',
      qualification: 'MBBS, MD (Cardiology)',
      fee: 1000
    },
    {
      email: 'sarah.johnson@carex.com',
      name: 'Dr. Sarah Johnson',
      specialty: 'Interventional Cardiology',
      qualification: 'MBBS, FRCP',
      fee: 1500
    },
    {
      email: 'michael.chen@carex.com',
      name: 'Dr. Michael Chen',
      specialty: 'Endocrinology',
      qualification: 'MBBS, MD (Diabetes)',
      fee: 1200
    },
    {
      email: 'robert.wilson@carex.com',
      name: 'Dr. Robert Wilson',
      specialty: 'Respiratory Medicine',
      qualification: 'MBBS, DTCD',
      fee: 800
    },
    {
      email: 'lisa.markson@carex.com',
      name: 'Dr. Lisa Markson',
      specialty: 'General Physician',
      qualification: 'MBBS, BCS',
      fee: 600
    }
  ];

  const doctors = {};
  for (const d of doctorsData) {
    const doc = await prisma.doctor.create({
      data: {
        ...d,
        password: hashedPw,
        phone: `017${Math.floor(10000000 + Math.random() * 90000000)}`,
        experienceYears: 10 + Math.floor(Math.random() * 15),
        about: `${d.name} is a highly skilled specialist in ${d.specialty} with years of clinical excellence.`
      }
    });
    doctors[d.email] = doc;
    console.log(`✓ Doctor created: ${doc.name}`);
  }

  // 2. Create Patients with realistic mixed history
  const mainDoctor = doctors['doctor@test.com'];

  // Patient 1: John Doe (Multiple doctors: Cardiology + Diabetes)
  const john = await prisma.patient.create({
    data: {
      name: 'John Doe',
      age: 52,
      gender: 'Male',
      phone: '01711223344',
      email: 'john@gmail.com',
      doctorId: mainDoctor.id, // Primary assigned doctor
      reports: {
        create: [
          { name: 'ECG Report', labName: 'HeartCenter', date: new Date('2024-05-01'), description: 'Normal sinus rhythm' },
          { name: 'HbA1c Test', labName: 'CareX Lab', date: new Date('2024-05-10'), description: '7.2% - Slightly high' }
        ]
      },
      prescriptions: {
        create: [
          {
            date: new Date('2024-05-01'),
            doctorId: doctors['doctor@test.com'].id,
            notes: 'Follow low sodium diet.',
            medications: JSON.stringify([
              { name: 'Bisoprolol 5mg', dosage: '1+0+0', duration: '3 months' },
              { name: 'Atorvastatin 20mg', dosage: '0+0+1', duration: '3 months' }
            ])
          },
          {
            date: new Date('2024-05-12'),
            doctorId: doctors['michael.chen@carex.com'].id,
            notes: 'Control sugar intake. Regular morning walks.',
            medications: JSON.stringify([
              { name: 'Metformin 500mg', dosage: '0+1+1', duration: '6 months' },
              { name: 'Sitagliptin 50mg', dosage: '1+0+0', duration: '6 months' }
            ])
          }
        ]
      }
    }
  });
  console.log('✓ Created patient: John Doe (Sarah Ahmed + Michael Chen)');

  // Patient 2: Jane Smith (Respiratory + General checkup)
  const jane = await prisma.patient.create({
    data: {
      name: 'Jane Smith',
      age: 28,
      gender: 'Female',
      phone: '01755667788',
      email: 'jane.smith@yahoo.com',
      doctorId: mainDoctor.id,
      reports: {
        create: [
          { name: 'PFT Report', labName: 'Chest Clinic', date: new Date('2024-04-20'), description: 'Mild obstructive pattern' }
        ]
      },
      prescriptions: {
        create: [
          {
            date: new Date('2024-04-22'),
            doctorId: doctors['robert.wilson@carex.com'].id,
            notes: 'Avoid dust and allergens.',
            medications: JSON.stringify([
              { name: 'Montelukast 10mg', dosage: '0+0+1', duration: '1 month' },
              { name: 'Seretide Inhaler', dosage: '2 puffs daily', duration: 'As needed' }
            ])
          },
          {
            date: new Date('2024-05-15'),
            doctorId: doctors['lisa.markson@carex.com'].id,
            notes: 'Take vitamins for fatigue.',
            medications: JSON.stringify([
              { name: 'Bextram Silver', dosage: '0+0+1', duration: '15 days' }
            ])
          }
        ]
      }
    }
  });
  console.log('✓ Created patient: Jane Smith (Robert Wilson + Lisa Markson)');

  // Patient 3: Robert Brown (Only Dr. Sarah Ahmed - Cardiology)
  const robert = await prisma.patient.create({
    data: {
      name: 'Robert Brown',
      age: 65,
      gender: 'Male',
      phone: '01799887766',
      email: 'robert.b@outlook.com',
      doctorId: mainDoctor.id,
      prescriptions: {
        create: [
          {
            date: new Date('2024-05-08'),
            doctorId: doctors['doctor@test.com'].id,
            notes: 'Strict bed rest for 1 week.',
            medications: JSON.stringify([
              { name: 'Aspirin 75mg', dosage: '0+1+0', duration: 'Lifetime' },
              { name: 'Clopidogrel 75mg', dosage: '1+0+0', duration: '6 months' }
            ])
          }
        ]
      }
    }
  });
  console.log('✓ Created patient: Robert Brown (Only Sarah Ahmed)');

  // Patient 4: Emily Davis (Sarah Johnson - Interventional Cardiology)
  const emily = await prisma.patient.create({
    data: {
      name: 'Emily Davis',
      age: 42,
      gender: 'Female',
      phone: '01822334455',
      email: 'emily.davis@gmail.com',
      doctorId: mainDoctor.id,
      prescriptions: {
        create: [
          {
            date: new Date('2024-05-14'),
            doctorId: doctors['sarah.johnson@carex.com'].id,
            notes: 'Post-stenting follow up.',
            medications: JSON.stringify([
              { name: 'Brilinta 90mg', dosage: '1+0+1', duration: '1 year' },
              { name: 'Rosuvastatin 10mg', dosage: '0+0+1', duration: '6 months' }
            ])
          }
        ]
      }
    }
  });
  console.log('✓ Created patient: Emily Davis (Sarah Johnson)');

  console.log('\nFinal Seed Result:');
  console.log('5 Doctors Created (Ahmed, Johnson, Chen, Wilson, Markson)');
  console.log('4 Patients Created with complex cross-doctor histories');
  console.log('Seeding complete! Ready for multi-doctor demo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
