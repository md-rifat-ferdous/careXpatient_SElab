const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.labTest.deleteMany({});
  await prisma.lab.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding labs...');
  const careXLab = await prisma.lab.create({
    data: { name: 'careX Lab', address: 'Dhaka', phone: '01711111111' },
  });
  const metroDiagnostics = await prisma.lab.create({
    data: { name: 'Metro Diagnostics', address: 'Dhaka', phone: '01811111111' },
  });
  const labaid = await prisma.lab.create({
    data: { name: 'Labaid Diagnostics', address: 'Dhaka', phone: '01911111111' },
  });
  const popular = await prisma.lab.create({
    data: { name: 'Popular Diagnostic Center', address: 'Dhaka', phone: '01611111111' },
  });

  console.log('Seeding tests...');
  const tests = [
    {
      name: 'Lipid Profile',
      tag: 'Popular',
      tagColor: 'bg-teal-100 text-teal-700',
      description: 'Measures cholesterol and triglyceride levels to assess heart disease risk.',
      prerequisites: '10-12 hours of fasting required. Only water is permitted.',
      deliveryTime: 'Within 24 hours',
      sampleType: 'Blood Sample',
      labId: careXLab.id,
      price: 1200,
      category: 'Blood',
    },
    {
      name: 'HbA1c',
      tag: 'Available Today',
      tagColor: 'bg-blue-100 text-blue-700',
      description: 'Measures average blood sugar levels over the past 2-3 months.',
      prerequisites: 'No fasting required. Can be done anytime.',
      deliveryTime: 'Within 12 hours',
      sampleType: 'Blood Sample',
      labId: metroDiagnostics.id,
      price: 850,
      category: 'Blood',
    },
    {
      name: 'Complete Blood Count (CBC)',
      tag: 'Basic Health',
      tagColor: 'bg-purple-100 text-purple-700',
      description: 'Evaluates overall health and detects a wide range of disorders.',
      prerequisites: 'No fasting required.',
      deliveryTime: 'Within 8 hours',
      sampleType: 'Blood Sample',
      labId: careXLab.id,
      price: 600,
      category: 'Blood',
    },
    {
      name: 'Thyroid Profile (T3, T4, TSH)',
      tag: 'Fasting Required',
      tagColor: 'bg-orange-100 text-orange-700',
      description: 'Evaluates thyroid gland function and helps diagnose thyroid disorders.',
      prerequisites: '10-12 hours fasting required.',
      deliveryTime: 'Within 24 hours',
      sampleType: 'Blood Sample',
      labId: labaid.id,
      price: 1500,
      category: 'Blood',
    },
    {
      name: 'Vitamin D (25-OH)',
      tag: 'Popular',
      tagColor: 'bg-teal-100 text-teal-700',
      description: 'Measures the level of vitamin D in your blood to check for deficiency.',
      prerequisites: 'No special preparation required.',
      deliveryTime: 'Within 48 hours',
      sampleType: 'Blood Sample',
      labId: careXLab.id,
      price: 2200,
      category: 'Full Body Checkup',
    },
    {
      name: 'Liver Function Test (LFT)',
      tag: 'Available Today',
      tagColor: 'bg-blue-100 text-blue-700',
      description: 'Measures proteins, liver enzymes, and bilirubin in your blood.',
      prerequisites: '10-12 hours fasting required.',
      deliveryTime: 'Within 24 hours',
      sampleType: 'Blood Sample',
      labId: popular.id,
      price: 1800,
      category: 'Blood',
    },
    {
      name: 'Echocardiogram',
      tag: 'Cardiac Health',
      tagColor: 'bg-red-100 text-red-700',
      description: 'Uses ultrasound to examine the heart structure and function.',
      prerequisites: 'No fasting required.',
      deliveryTime: 'Within 12 hours',
      sampleType: 'Imaging',
      labId: labaid.id,
      price: 3500,
      category: 'Cardiac',
    },
    {
      name: 'Chest X-Ray',
      tag: 'Available Today',
      tagColor: 'bg-blue-100 text-blue-700',
      description: 'Produces images of the heart, lungs, airways, blood vessels and bones of the spine and chest.',
      prerequisites: 'No fasting required.',
      deliveryTime: 'Within 8 hours',
      sampleType: 'Imaging',
      labId: popular.id,
      price: 800,
      category: 'Imaging',
    }
  ];

  for (const t of tests) {
    await prisma.labTest.create({ data: t });
  }

  console.log('Seeding demo user...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      phone: '01700000000',
      fullName: 'John Doe',
      password: hashedPassword,
    }
  });

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
