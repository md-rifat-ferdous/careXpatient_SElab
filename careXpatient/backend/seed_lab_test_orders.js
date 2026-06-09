/**
 * seed_lab_test_orders.js
 * Seeds realistic test lab orders for Lab Portal verification.
 * Links orders to labmanager1 (Popular Diagnostic Centre - Branch 1).
 * Creates 3 patients + 5 orders (mix of pending/reported).
 * Safe to re-run (uses upsert for patients).
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🔬 Seeding Lab Portal test orders for verification...\n');

  // ── 1. Find labmanager1's Lab record ──
  const labUser = await prisma.user.findFirst({
    where: { phone: '01811111101' },
    include: { lab: true },
  });
  if (!labUser || !labUser.lab) {
    throw new Error('labmanager1 not found. Run seed_lab_accounts.js first.');
  }
  const lab = labUser.lab;
  console.log(`  Using lab: ${lab.name} (id: ${lab.id})`);

  // ── 2. Ensure some LabTest records exist ──
  const testDefs = [
    { name: 'Complete Blood Count (CBC)',     price: 350, sampleType: 'Blood', category: 'Hematology' },
    { name: 'Fasting Blood Glucose (FBG)',    price: 200, sampleType: 'Blood', category: 'Biochemistry' },
    { name: 'Lipid Profile',                 price: 800, sampleType: 'Blood', category: 'Biochemistry' },
    { name: 'Urine Routine & Microscopy',    price: 250, sampleType: 'Urine', category: 'Pathology' },
    { name: 'Thyroid Function Test (TFT)',   price: 600, sampleType: 'Blood', category: 'Endocrinology' },
  ];

  const labTests = [];
  for (const t of testDefs) {
    const test = await prisma.labTest.upsert({
      where: { id: (await prisma.labTest.findFirst({ where: { name: t.name } }))?.id ?? BigInt(0) },
      update: { ...t, labId: lab.id },
      create: { ...t, labId: lab.id },
    }).catch(async () => {
      // fallback: create without upsert if id lookup fails
      return await prisma.labTest.create({ data: { ...t, labId: lab.id } });
    });
    labTests.push(test);
    console.log(`  ✓ Lab test: ${test.name} (id: ${test.id})`);
  }

  // ── 3. Create 3 test patients ──
  const patientDefs = [
    {
      phone: '01911222301', fullName: 'Emma Wilson', email: 'emma@test.com',
      bloodGroup: 'B+', dateOfBirth: new Date('1990-03-15'), address: 'Gulshan, Dhaka',
    },
    {
      phone: '01911222302', fullName: 'James Rahman', email: 'james@test.com',
      bloodGroup: 'O+', dateOfBirth: new Date('1985-07-22'), address: 'Banani, Dhaka',
    },
    {
      phone: '01911222303', fullName: 'Priya Chowdhury', email: 'priya@test.com',
      bloodGroup: 'A-', dateOfBirth: new Date('1998-11-08'), address: 'Uttara, Dhaka',
    },
  ];

  const patients = [];
  for (const p of patientDefs) {
    const hashed = await bcrypt.hash('Test1234', 10);
    const user = await prisma.user.upsert({
      where: { phone: p.phone },
      update: { fullName: p.fullName, email: p.email, isVerified: true },
      create: { phone: p.phone, fullName: p.fullName, email: p.email, password: hashed, role: 'Patient', isVerified: true },
    });
    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: { bloodGroup: p.bloodGroup, dateOfBirth: p.dateOfBirth, address: p.address },
      create: { userId: user.id, bloodGroup: p.bloodGroup, dateOfBirth: p.dateOfBirth, address: p.address },
    });
    patients.push({ user, patient });
    console.log(`  ✓ Patient: ${p.fullName} (id: ${patient.id})`);
  }

  console.log('');

  // ── 4. Create 5 lab orders ──
  const orderDefs = [
    // Emma — CBC + Lipid (Reported, has result PDF)
    {
      patient: patients[0],
      tests: [labTests[0], labTests[2]],
      status: 'Reported',
      totalAmount: 1150,
      withResult: true,
      resultSummary: 'CBC within normal range. Lipid profile shows borderline high LDL (3.4 mmol/L). Dietary modification advised.',
    },
    // Emma — Thyroid (Processing, no report yet)
    {
      patient: patients[0],
      tests: [labTests[4]],
      status: 'Processing',
      totalAmount: 600,
      withResult: false,
    },
    // James — FBG + Urine (Reported, has result)
    {
      patient: patients[1],
      tests: [labTests[1], labTests[3]],
      status: 'Reported',
      totalAmount: 450,
      withResult: true,
      resultSummary: 'Fasting blood sugar 6.8 mmol/L — prediabetes range. Urine routine: normal. Clinical correlation recommended.',
    },
    // James — CBC (SampleCollected, no report)
    {
      patient: patients[1],
      tests: [labTests[0]],
      status: 'SampleCollected',
      totalAmount: 350,
      withResult: false,
    },
    // Priya — FBG (Requested, no report)
    {
      patient: patients[2],
      tests: [labTests[1]],
      status: 'Requested',
      totalAmount: 200,
      withResult: false,
    },
  ];

  for (const def of orderDefs) {
    const order = await prisma.labOrder.create({
      data: {
        patientId:   def.patient.patient.id,
        labId:       lab.id,
        status:      def.status,
        totalAmount: def.totalAmount,
        homeCollection: false,
        tests: {
          create: def.tests.map((t) => ({ labTestId: t.id })),
        },
      },
    });

    if (def.withResult) {
      await prisma.labResult.create({
        data: {
          labOrderId:    order.id,
          resultSummary: def.resultSummary,
          fileUrl:       'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          uploadedBy:    'Lab Staff',
        },
      });
    }

    const testNames = def.tests.map((t) => t.name).join(', ');
    console.log(`  ✓ Order [${def.status}] — ${def.patient.user.fullName}: ${testNames}`);
  }

  console.log('\n━'.repeat(52));
  console.log('🎉  Test orders seeded! Verify at:\n');
  console.log('  Patients List  : http://localhost:3000/dashboard/lab/patients');
  console.log('  Upload Reports : http://localhost:3000/dashboard/lab/upload-reports');
  console.log('\n  Login: 01811111101 / Lab12345  (labmanager1)\n');
}

main()
  .catch((e) => {
    console.error('\n❌  Seeding failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
