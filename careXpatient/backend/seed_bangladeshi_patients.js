/**
 * seed_bangladeshi_patients.js
 * Seeds 5 realistic Bangladeshi patients with lab orders and report data
 * for the Lab Portal Patients page verification.
 * 
 * Prerequisites: seed_lab_accounts.js and seed_lab_tests.js must be run first.
 * Safe to re-run (uses upsert for patients, clears existing orders for these patients).
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('\n🇧🇩 Seeding 5 Bangladeshi Patients with Lab Orders...\n');

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

  // ── 2. Look up existing LabTest records by name ──
  const testNames = [
    'Complete Blood Count (CBC)',
    'Fasting Blood Glucose (FBG)',
    'Lipid Profile',
    'Thyroid Function Test (TFT)',
    'Liver Function Test (LFT)',
    'HbA1c (Glycated Hemoglobin)',
    'Chest X-Ray (PA View)',
    'Basic Health Checkup Package',
  ];

  const tests = {};
  for (const name of testNames) {
    const test = await prisma.labTest.findFirst({ where: { name } });
    if (!test) {
      throw new Error(`Lab test "${name}" not found. Run seed_lab_tests.js first.`);
    }
    tests[name] = test;
    console.log(`  ✓ Found test: ${test.name}`);
  }

  // ── 3. Define 5 Bangladeshi patients ──
  const patientDefs = [
    {
      phone: '01911222304',
      fullName: 'Ayesha Akter',
      email: 'ayesha.akter@test.com',
      bloodGroup: 'B+',
      dateOfBirth: new Date('1997-05-12'),
      address: 'House 23, Road 4, Mirpur-12, Dhaka',
      orders: [
        {
          tests: [tests['Complete Blood Count (CBC)'], tests['Lipid Profile']],
          status: 'Reported',
          subtotal: 950.00,
          vat: 47.50,
          totalAmount: 997.50,
          resultSummary: 'CBC within normal limits. Lipid profile shows optimal HDL (1.6 mmol/L) and LDL (2.8 mmol/L) levels. Total cholesterol 4.2 mmol/L. No significant abnormalities detected.',
        },
        {
          tests: [tests['Thyroid Function Test (TFT)']],
          status: 'Processing',
          subtotal: 900.00,
          vat: 45.00,
          totalAmount: 945.00,
        },
      ],
    },
    {
      phone: '01911222305',
      fullName: 'Md. Rakib Hasan',
      email: 'rakib.hasan@test.com',
      bloodGroup: 'O+',
      dateOfBirth: new Date('1990-11-03'),
      address: 'Flat 5B, House 12, Road 7, Uttara Sector-4, Dhaka',
      orders: [
        {
          tests: [tests['Fasting Blood Glucose (FBG)']],
          status: 'Reported',
          subtotal: 200.00,
          vat: 10.00,
          totalAmount: 210.00,
          resultSummary: 'Fasting blood glucose 5.2 mmol/L — within normal range (normal: 4.0–6.1 mmol/L). No signs of diabetes or prediabetes.',
        },
        {
          tests: [tests['Lipid Profile']],
          status: 'Processing',
          subtotal: 600.00,
          vat: 30.00,
          totalAmount: 630.00,
        },
      ],
    },
    {
      phone: '01911222306',
      fullName: 'Nusrat Jahan',
      email: 'nusrat.jahan@test.com',
      bloodGroup: 'A+',
      dateOfBirth: new Date('2001-08-20'),
      address: 'House 45, Road 15, Gulshan-1, Dhaka',
      orders: [
        {
          tests: [tests['Complete Blood Count (CBC)']],
          status: 'Reported',
          subtotal: 350.00,
          vat: 17.50,
          totalAmount: 367.50,
          resultSummary: 'All CBC parameters within normal biological reference ranges. Hemoglobin 12.8 g/dL, WBC 6.2 K/µL, RBC 4.5 M/µL, Platelets 280 K/µL.',
        },
        {
          tests: [tests['Chest X-Ray (PA View)']],
          status: 'Requested',
          subtotal: 500.00,
          vat: 25.00,
          totalAmount: 525.00,
        },
        {
          tests: [tests['Basic Health Checkup Package']],
          status: 'Reported',
          subtotal: 2500.00,
          vat: 125.00,
          totalAmount: 2625.00,
          resultSummary: 'Comprehensive health checkup results: All major parameters within normal range. Vitamin D level slightly low at 22 ng/mL (normal: 30–100 ng/mL). Supplementation with Vitamin D3 2000 IU daily recommended. Follow-up in 3 months.',
        },
      ],
    },
    {
      phone: '01911222307',
      fullName: 'Tanvir Ahmed',
      email: 'tanvir.ahmed@test.com',
      bloodGroup: 'AB+',
      dateOfBirth: new Date('1983-02-14'),
      address: 'House 8, Road 3, Banani, Dhaka',
      orders: [
        {
          tests: [tests['Liver Function Test (LFT)']],
          status: 'Reported',
          subtotal: 800.00,
          vat: 40.00,
          totalAmount: 840.00,
          resultSummary: 'Liver enzymes within normal range. ALT 32 U/L (normal: 10–40), AST 28 U/L (normal: 10–35), ALP 85 U/L (normal: 44–147). Total bilirubin 0.8 mg/dL. Normal liver function.',
        },
        {
          tests: [tests['HbA1c (Glycated Hemoglobin)']],
          status: 'Reported',
          subtotal: 700.00,
          vat: 35.00,
          totalAmount: 735.00,
          resultSummary: 'HbA1c 5.4% — within normal range (normal: <5.7%). Average blood glucose over past 3 months is well controlled. No diabetes risk identified.',
        },
      ],
    },
    {
      phone: '01911222308',
      fullName: 'Sharmeen Sultana',
      email: 'sharmeen.sultana@test.com',
      bloodGroup: 'O-',
      dateOfBirth: new Date('1994-06-25'),
      address: 'House 30, Road 6, Dhanmondi, Dhaka',
      orders: [
        {
          tests: [tests['Complete Blood Count (CBC)']],
          status: 'Reported',
          subtotal: 350.00,
          vat: 17.50,
          totalAmount: 367.50,
          resultSummary: 'CBC results: Hemoglobin 13.1 g/dL, RBC 4.6 M/µL, WBC 5.8 K/µL, Platelets 310 K/µL. All values within normal limits for adult female.',
        },
        {
          tests: [tests['Thyroid Function Test (TFT)']],
          status: 'Processing',
          subtotal: 900.00,
          vat: 45.00,
          totalAmount: 945.00,
        },
      ],
    },
  ];

  // ── 4. Create patients and orders ──
  for (const p of patientDefs) {
    // Upsert user + patient
    const hashed = await bcrypt.hash('Test1234', 10);
    const user = await prisma.user.upsert({
      where: { phone: p.phone },
      update: { fullName: p.fullName, email: p.email, isVerified: true },
      create: {
        phone: p.phone,
        fullName: p.fullName,
        email: p.email,
        password: hashed,
        role: 'Patient',
        isVerified: true,
      },
    });

    const patient = await prisma.patient.upsert({
      where: { userId: user.id },
      update: { bloodGroup: p.bloodGroup, dateOfBirth: p.dateOfBirth, address: p.address },
      create: {
        userId: user.id,
        bloodGroup: p.bloodGroup,
        dateOfBirth: p.dateOfBirth,
        address: p.address,
      },
    });

    // Remove old orders for this patient to keep re-run clean
    const existingOrders = await prisma.labOrder.findMany({
      where: { patientId: patient.id },
      select: { id: true },
    });
    for (const order of existingOrders) {
      await prisma.labOrderTest.deleteMany({ where: { labOrderId: order.id } });
      await prisma.reportParameter.deleteMany({ where: { labOrderId: order.id } });
      await prisma.labResult.deleteMany({ where: { labOrderId: order.id } });
      await prisma.labOrder.delete({ where: { id: order.id } });
    }

    console.log(`\n  ✓ Patient: ${p.fullName} (id: ${patient.id}) — ${p.orders.length} orders`);

    // Create orders
    for (const o of p.orders) {
      const order = await prisma.labOrder.create({
        data: {
          patientId: patient.id,
          labId: lab.id,
          status: o.status,
          subtotal: o.subtotal,
          vat: o.vat,
          totalAmount: o.totalAmount,
          homeCollection: false,
          tests: {
            create: o.tests.map((t) => ({ labTestId: t.id })),
          },
        },
      });

      if (o.resultSummary) {
        await prisma.labResult.create({
          data: {
            labOrderId: order.id,
            resultSummary: o.resultSummary,
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploadedBy: 'Lab Staff',
          },
        });
      }

      const testNamesList = o.tests.map((t) => t.name).join(', ');
      console.log(`    └─ Order [${o.status}] — ${testNamesList}`);
    }
  }

  console.log('\n' + '━'.repeat(52));
  console.log('🎉  5 Bangladeshi patients seeded successfully!\n');
  console.log('  Login: 01811111101 / Lab12345  (labmanager1)');
  console.log('  Patients should now appear at:');
  console.log('  http://localhost:3000/dashboard/lab/patients\n');
}

main()
  .catch((e) => {
    console.error('\n❌  Seeding failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
