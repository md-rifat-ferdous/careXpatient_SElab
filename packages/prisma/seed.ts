import { PrismaClient } from './client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create a User and Patient
  const user = await prisma.user.upsert({
    where: { phone: '01712345678' },
    update: {},
    create: {
      phone: '01712345678',
      fullName: 'Rahim Ali',
      role: 'Patient',
      isVerified: true,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      bloodGroup: 'A+',
      address: 'Dhaka, Bangladesh',
    },
  });

  // 2. Create Labs
  const careXLab = await prisma.lab.upsert({
    where: { id: 101n },
    update: {},
    create: {
      id: 101n,
      name: 'careX Lab',
      address: 'Dhaka',
      phone: '01711111111',
    },
  });

  const metroDiagnostics = await prisma.lab.upsert({
    where: { id: 102n },
    update: {},
    create: {
      id: 102n,
      name: 'Metro Diagnostics',
      address: 'Dhaka',
      phone: '01811111111',
    },
  });

  const labaid = await prisma.lab.upsert({
    where: { id: 103n },
    update: {},
    create: {
      id: 103n,
      name: 'Labaid Diagnostics',
      address: 'Dhaka',
      phone: '01911111111',
    },
  });

  const popular = await prisma.lab.upsert({
    where: { id: 104n },
    update: {},
    create: {
      id: 104n,
      name: 'Popular Diagnostic Center',
      address: 'Dhaka',
      phone: '01611111111',
    },
  });

  // 3. Create Lab Tests
  const tests = [
    {
      name: 'Lipid Profile',
      tag: 'Popular',
      tagColor: 'bg-teal-100 text-teal-700',
      description: 'Measures cholesterol and triglyceride levels to assess heart disease risk.',
      prerequisites: '10-12 hours of fasting required. Only water is permitted.',
      deliveryTime: 'Within 24 hours',
      sampleType: 'Blood Sample',
      price: 1200,
      category: 'Blood',
      targetLabId: careXLab.id,
    },
    {
      name: 'HbA1c',
      tag: 'Available Today',
      tagColor: 'bg-blue-100 text-blue-700',
      description: 'Measures average blood sugar levels over the past 2-3 months.',
      prerequisites: 'No fasting required. Can be done anytime.',
      deliveryTime: 'Within 12 hours',
      sampleType: 'Blood Sample',
      price: 850,
      category: 'Blood',
      targetLabId: metroDiagnostics.id,
    },
    {
      name: 'Complete Blood Count (CBC)',
      tag: 'Basic Health',
      tagColor: 'bg-purple-100 text-purple-700',
      description: 'Evaluates overall health and detects a wide range of disorders.',
      prerequisites: 'No fasting required.',
      deliveryTime: 'Within 8 hours',
      sampleType: 'Blood Sample',
      price: 600,
      category: 'Blood',
      targetLabId: careXLab.id,
    },
    {
      name: 'Thyroid Profile (T3, T4, TSH)',
      tag: 'Fasting Required',
      tagColor: 'bg-orange-100 text-orange-700',
      description: 'Evaluates thyroid gland function and helps diagnose thyroid disorders.',
      prerequisites: '10-12 hours fasting required.',
      deliveryTime: 'Within 24 hours',
      sampleType: 'Blood Sample',
      price: 1500,
      category: 'Blood',
      targetLabId: labaid.id,
    },
    {
      name: 'Vitamin D (25-OH)',
      tag: 'Popular',
      tagColor: 'bg-teal-100 text-teal-700',
      description: 'Measures the level of vitamin D in your blood to check for deficiency.',
      prerequisites: 'No special preparation required.',
      deliveryTime: 'Within 48 hours',
      sampleType: 'Blood Sample',
      price: 2200,
      category: 'Full Body Checkup',
      targetLabId: careXLab.id,
    },
    {
      name: 'Liver Function Test (LFT)',
      tag: 'Available Today',
      tagColor: 'bg-blue-100 text-blue-700',
      description: 'Measures proteins, liver enzymes, and bilirubin in your blood.',
      prerequisites: '10-12 hours fasting required.',
      deliveryTime: 'Within 24 hours',
      sampleType: 'Blood Sample',
      price: 1800,
      category: 'Blood',
      targetLabId: popular.id,
    },
    {
      name: 'Echocardiogram',
      tag: 'Cardiac Health',
      tagColor: 'bg-red-100 text-red-700',
      description: 'Uses ultrasound to examine the heart structure and function.',
      prerequisites: 'No fasting required.',
      deliveryTime: 'Within 12 hours',
      sampleType: 'Imaging',
      price: 3500,
      category: 'Cardiac',
      targetLabId: labaid.id,
    },
    {
      name: 'Chest X-Ray',
      tag: 'Available Today',
      tagColor: 'bg-blue-100 text-blue-700',
      description: 'Produces images of the heart, lungs, airways, blood vessels and bones of the spine and chest.',
      prerequisites: 'No fasting required.',
      deliveryTime: 'Within 8 hours',
      sampleType: 'Imaging',
      price: 800,
      category: 'Imaging',
      targetLabId: popular.id,
    }
  ];

  for (const t of tests) {
    const { targetLabId, ...testData } = t;
    const test = await prisma.labTest.create({
      data: testData as any
    });

    // Create a Reported order for each test so they show up in the dashboard
    await prisma.labOrder.create({
      data: {
        patientId: patient.id,
        labId: targetLabId,
        status: 'Reported',
        totalAmount: t.price,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        tests: {
          create: { labTestId: test.id }
        },
        labResults: {
          create: {
            resultSummary: 'Healthy results',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploadedBy: 'Lab Staff'
          }
        }
      }
    });
  }

  console.log('✅ Lab tests and initial orders seeded!');

  // 4. Get all tests to create extra orders (for pagination demo — need 25+ records)
  const allTests = await prisma.labTest.findMany();
  const labs = [careXLab, metroDiagnostics, labaid, popular];

  const extraOrders = [
    { testName: 'Lipid Profile',             labName: 'Ibn Sina Diagnostic' },
    { testName: 'HbA1c',                     labName: 'Ibn Sina Diagnostic' },
    { testName: 'Complete Blood Count (CBC)', labName: 'Metro Diagnostics'  },
    { testName: 'Thyroid Profile (T3, T4, TSH)', labName: 'careX Lab'       },
    { testName: 'Vitamin D (25-OH)',          labName: 'Labaid Diagnostics'  },
    { testName: 'Liver Function Test (LFT)', labName: 'Metro Diagnostics'   },
    { testName: 'Echocardiogram',            labName: 'careX Lab'           },
    { testName: 'Chest X-Ray',               labName: 'Labaid Diagnostics'  },
    { testName: 'Complete Blood Count (CBC)', labName: 'Popular Diagnostic Center' },
    { testName: 'Lipid Profile',             labName: 'Labaid Diagnostics'  },
    { testName: 'HbA1c',                     labName: 'careX Lab'           },
    { testName: 'Thyroid Profile (T3, T4, TSH)', labName: 'Metro Diagnostics' },
    { testName: 'Liver Function Test (LFT)', labName: 'careX Lab'           },
    { testName: 'Chest X-Ray',               labName: 'Metro Diagnostics'   },
    { testName: 'Vitamin D (25-OH)',          labName: 'Popular Diagnostic Center' },
    { testName: 'Echocardiogram',            labName: 'Popular Diagnostic Center' },
    { testName: 'Lipid Profile',             labName: 'Metro Diagnostics'   },
    { testName: 'Complete Blood Count (CBC)', labName: 'Labaid Diagnostics' },
    { testName: 'HbA1c',                     labName: 'Popular Diagnostic Center' },
    { testName: 'Chest X-Ray',               labName: 'careX Lab'           },
    { testName: 'Thyroid Profile (T3, T4, TSH)', labName: 'Labaid Diagnostics' },
    { testName: 'Vitamin D (25-OH)',          labName: 'Metro Diagnostics'  },
  ];

  // Create an "Ibn Sina Diagnostic" lab if missing
  const ibnSina = await prisma.lab.upsert({
    where: { id: 105n },
    update: {},
    create: { id: 105n, name: 'Ibn Sina Diagnostic', address: 'Dhaka', phone: '01511111111' },
  });
  const allLabs = [...labs, ibnSina];

  for (let i = 0; i < extraOrders.length; i++) {
    const o = extraOrders[i];
    const test = allTests.find(t => t.name === o.testName);
    const lab  = allLabs.find(l => l.name === o.labName);
    if (!test || !lab) continue;

    // Spread orders across the past 60 days for variety
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    await prisma.labOrder.create({
      data: {
        patientId: patient.id,
        labId: lab.id,
        status: 'Reported',
        totalAmount: test.price,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        tests:      { create: { labTestId: test.id } },
        labResults: {
          create: {
            resultSummary: 'Normal range',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploadedBy: 'Lab Staff',
          },
        },
      },
    });
  }

  console.log('✅ Seeding complete! Total orders ready for pagination.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
