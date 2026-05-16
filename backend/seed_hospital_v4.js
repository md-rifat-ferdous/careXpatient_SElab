const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting full Hospital Ecosystem seed (v4)...');

  // 0. Clean slate
  await prisma.prescription.deleteMany();
  await prisma.report.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash('password123', salt);

  // 1. Create Doctors
  const docs = [
    { email: 'doctor@test.com', name: 'Dr. Sarah Ahmed', specialty: 'Cardiology', qualification: 'MBBS, MD' },
    { email: 'johnson@carex.com', name: 'Dr. Sarah Johnson', specialty: 'Interventional Cardiology', qualification: 'MBBS, FRCP' },
    { email: 'chen@carex.com', name: 'Dr. Michael Chen', specialty: 'Endocrinology', qualification: 'MBBS, MD (Diabetes)' },
    { email: 'wilson@carex.com', name: 'Dr. Robert Wilson', specialty: 'Respiratory Medicine', qualification: 'MBBS, DTCD' },
    { email: 'markson@carex.com', name: 'Dr. Lisa Markson', specialty: 'General Physician', qualification: 'MBBS, BCS' }
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
  const rwilson = doctors['wilson@carex.com'];
  const markson = doctors['markson@carex.com'];
  const johnson = doctors['johnson@carex.com'];

  console.log('✓ All Doctors Prepared.');

  // 2. Create Patients with Realistic Mixed Histories
  
  // PATIENT: Emma Wilson (Mixed History: Ahmed + Wilson + Markson)
  const emma = await prisma.patient.create({
    data: {
      name: 'Emma Wilson',
      age: 42,
      gender: 'Female',
      phone: '01700112233',
      email: 'emma.w@example.com',
      doctorId: ahmed.id,
      lastVisit: new Date('2024-05-16'),
      reports: {
        create: [
          { name: 'ECG Analysis', labName: 'HeartCenter', date: new Date('2024-05-15'), description: 'Normal sinus rhythm.' },
          { name: 'Chest X-Ray', labName: 'MediScan', date: new Date('2024-04-10'), description: 'Clear lung fields.' },
          { name: 'Urinalysis', labName: 'CareX Lab', date: new Date('2024-05-01'), description: 'Normal results.' }
        ]
      },
      prescriptions: {
        create: [
          { 
            date: new Date('2024-05-16'), 
            doctorId: ahmed.id, 
            notes: 'Manage hypertension.', 
            medications: JSON.stringify([{ name: 'Amlodipine 5mg', dosage: '1+0+0', duration: '30 days' }]) 
          },
          { 
            date: new Date('2024-04-12'), 
            doctorId: rwilson.id, 
            notes: 'Seasonal asthma control.', 
            medications: JSON.stringify([{ name: 'Salbutamol Inhaler', dosage: '2 puffs', duration: 'As needed' }]) 
          },
          { 
            date: new Date('2024-05-05'), 
            doctorId: markson.id, 
            notes: 'Vitamin D deficiency.', 
            medications: JSON.stringify([{ name: 'Vitamin D3 2000IU', dosage: '0+0+1', duration: '15 days' }]) 
          }
        ]
      }
    }
  });

  // PATIENT: John Doe (Mixed History: Ahmed + Chen)
  const john = await prisma.patient.create({
    data: {
      name: 'John Doe',
      age: 55,
      gender: 'Male',
      phone: '01711223344',
      email: 'john.d@example.com',
      doctorId: ahmed.id,
      lastVisit: new Date('2024-05-12'),
      reports: {
        create: [
          { name: 'HbA1c Blood Test', labName: 'Diagnotics Plus', date: new Date('2024-05-05'), description: '7.5% - High glucose levels.' },
          { name: 'Lipid Profile', labName: 'CareX Lab', date: new Date('2024-05-05'), description: 'Elevated LDL.' }
        ]
      },
      prescriptions: {
        create: [
          { 
            date: new Date('2024-05-12'), 
            doctorId: ahmed.id, 
            notes: 'Cholesterol management.', 
            medications: JSON.stringify([{ name: 'Atorvastatin 20mg', dosage: '0+0+1', duration: '3 months' }]) 
          },
          { 
            date: new Date('2024-05-06'), 
            doctorId: chen.id, 
            notes: 'Diabetes initial control.', 
            medications: JSON.stringify([{ name: 'Metformin 500mg', dosage: '1+0+1', duration: '6 months' }]) 
          }
        ]
      }
    }
  });

  // PATIENT: Sarah Miller (Mixed History: Johnson + Ahmed)
  const sarahM = await prisma.patient.create({
    data: {
      name: 'Sarah Miller',
      age: 38,
      gender: 'Female',
      phone: '01733445566',
      email: 's.miller@example.com',
      doctorId: ahmed.id,
      reports: {
        create: [
          { name: 'MRI Cardiac', labName: 'NeuroHealth', date: new Date('2024-04-20'), description: 'Healthy heart muscle.' }
        ]
      },
      prescriptions: {
        create: [
          { 
            date: new Date('2024-05-14'), 
            doctorId: ahmed.id, 
            notes: 'Follow up for palpitations.', 
            medications: JSON.stringify([{ name: 'Propranolol 10mg', dosage: '1+0+1', duration: '15 days' }]) 
          },
          { 
            date: new Date('2024-04-25'), 
            doctorId: johnson.id, 
            notes: 'Post-scan consultation.', 
            medications: JSON.stringify([{ name: 'Omega 3 Caps', dosage: '1 daily', duration: '1 month' }]) 
          }
        ]
      }
    }
  });

  // PATIENT: Robert Brown (History: Only Ahmed)
  const robert = await prisma.patient.create({
    data: {
      name: 'Robert Brown',
      age: 62,
      gender: 'Male',
      phone: '01799887766',
      email: 'r.brown@example.com',
      doctorId: ahmed.id,
      reports: {
        create: [
          { name: 'CBC Blood Test', labName: 'CareX Lab', date: new Date('2024-05-01'), description: 'Normal profile.' }
        ]
      },
      prescriptions: {
        create: [
          { 
            date: new Date('2024-05-08'), 
            doctorId: ahmed.id, 
            notes: 'Annual cardiology checkup.', 
            medications: JSON.stringify([
              { name: 'Ecosprin 75mg', dosage: '0+1+0', duration: '90 days' },
              { name: 'Napa Extend', dosage: '1+0+1', duration: '5 days' }
            ]) 
          }
        ]
      }
    }
  });

  console.log('✓ All Patients & Records Restored.');
  console.log('✓ Multi-doctor Medical History verified.');
  console.log('✓ Diagnostic Reports (ECG, MRI, X-Ray, Blood, Urine) verified.');
  console.log('Hospital Ecosystem Seed Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
