const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Patient & Test Reports...');

  // 1. Find a Lab (e.g. Popular Diagnostic Centre)
  const popularLab = await prisma.lab.findFirst({
    where: { name: 'Popular Diagnostic Centre' },
  });

  if (!popularLab) {
    console.error('❌ Popular Diagnostic Centre not found. Please run seed_lab_tests.js first.');
    process.exit(1);
  }

  // 2. Find CBC and Fasting Blood Glucose tests
  const cbcTest = await prisma.labTest.findFirst({
    where: { name: 'Complete Blood Count (CBC)' },
  });
  const fbgTest = await prisma.labTest.findFirst({
    where: { name: 'Fasting Blood Glucose (FBG)' },
  });

  if (!cbcTest || !fbgTest) {
    console.error('❌ CBC or FBG tests not found. Please run seed_lab_tests.js first.');
    process.exit(1);
  }

  // 3. Create or update a Patient User
  const patientPhone = '01700000000';
  const hashed = await bcrypt.hash('patient123', 10);
  const user = await prisma.user.upsert({
    where: { phone: patientPhone },
    update: { fullName: 'Rifat Ferdous', role: 'Patient', isVerified: true },
    create: {
      phone: patientPhone,
      fullName: 'Rifat Ferdous',
      email: 'rifat@mail.com',
      password: hashed,
      role: 'Patient',
      isVerified: true,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: user.id },
    update: { bloodGroup: 'O+', dateOfBirth: new Date('1998-10-15') },
    create: {
      userId: user.id,
      bloodGroup: 'O+',
      dateOfBirth: new Date('1998-10-15'),
      address: 'Dhanmondi, Dhaka',
    },
  });

  console.log(`✓ Patient created/found: ${user.fullName} (id: ${patient.id})`);

  // 4. Create Lab Order 1 - CBC
  const order1 = await prisma.labOrder.create({
    data: {
      patientId: patient.id,
      labId: popularLab.id,
      status: 'Reported',
      subtotal: 350.00,
      vat: 17.50,
      totalAmount: 367.50,
      homeCollection: false,
    },
  });

  // Link CBC test to Order 1
  await prisma.labOrderTest.create({
    data: {
      labOrderId: order1.id,
      labTestId: cbcTest.id,
    },
  });

  // Create parameters for CBC
  const cbcParams = [
    { parameterName: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '13.0 - 17.0' },
    { parameterName: 'Red Blood Cells (RBC)', value: '4.8', unit: 'M/µL', referenceRange: '4.5 - 5.9' },
    { parameterName: 'White Blood Cells (WBC)', value: '7.5', unit: 'K/µL', referenceRange: '4.0 - 11.0' },
    { parameterName: 'Platelets', value: '250', unit: 'K/µL', referenceRange: '150 - 450' },
  ];

  for (const p of cbcParams) {
    await prisma.reportParameter.create({
      data: {
        labOrderId: order1.id,
        parameterName: p.parameterName,
        value: p.value,
        unit: p.unit,
        referenceRange: p.referenceRange,
      },
    });
  }

  // Create Lab Result for Order 1
  await prisma.labResult.create({
    data: {
      labOrderId: order1.id,
      resultSummary: 'CBC parameters are within normal biological reference intervals. No abnormal cells detected.',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'Dr. Tasnim Ara (Consultant Pathologist)',
    },
  });

  console.log(`✓ Seeded Reported Lab Order 1 (CBC) with parameters & PDF (id: ${order1.id})`);

  // 5. Create Lab Order 2 - FBG
  const order2 = await prisma.labOrder.create({
    data: {
      patientId: patient.id,
      labId: popularLab.id,
      status: 'Reported',
      subtotal: 200.00,
      vat: 10.00,
      totalAmount: 210.00,
      homeCollection: false,
    },
  });

  // Link FBG test to Order 2
  await prisma.labOrderTest.create({
    data: {
      labOrderId: order2.id,
      labTestId: fbgTest.id,
    },
  });

  // Create parameters for FBG
  const fbgParams = [
    { parameterName: 'Fasting Blood Sugar (FBS)', value: '6.4', unit: 'mmol/L', referenceRange: '4.0 - 6.1' },
  ];

  for (const p of fbgParams) {
    await prisma.reportParameter.create({
      data: {
        labOrderId: order2.id,
        parameterName: p.parameterName,
        value: p.value,
        unit: p.unit,
        referenceRange: p.referenceRange,
      },
    });
  }

  // Create Lab Result for Order 2
  await prisma.labResult.create({
    data: {
      labOrderId: order2.id,
      resultSummary: 'Impaired Fasting Glucose (Prediabetes range). Dietary modification and clinical correlation recommended.',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'Prof. Anisur Rahman (Biochemist)',
    },
  });

  console.log(`✓ Seeded Reported Lab Order 2 (FBG) with parameters & PDF (id: ${order2.id})`);

  console.log('\n🎉 Reports Seeding Complete! Patient phone: 01700000000, password: patient123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
