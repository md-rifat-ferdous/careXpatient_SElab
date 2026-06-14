const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Demo Lab Orders for project showcase...\n');

  // ── 1. Find Patient Rifat Ferdous ────────────────────────────────────────
  const patientUser = await prisma.user.findFirst({
    where: { phone: '01700000000' },
    include: { patient: true },
  });

  if (!patientUser || !patientUser.patient) {
    console.error('❌ Patient Rifat Ferdous (phone: 01700000000) not found. Please run seed_reports.js first.');
    process.exit(1);
  }

  const patient = patientUser.patient;
  console.log(`✓ Found Patient: ${patientUser.fullName} (id: ${patient.id})`);

  // ── 2. Find Labs ─────────────────────────────────────────────────────────
  const popularLab = await prisma.lab.findFirst({ where: { name: 'Popular Diagnostic Centre' } });
  const ibnSinaLab = await prisma.lab.findFirst({ where: { name: 'Ibn Sina Diagnostic' } });
  const labaidLab = await prisma.lab.findFirst({ where: { name: 'Labaid Diagnostics' } });

  if (!popularLab || !ibnSinaLab || !labaidLab) {
    console.error('❌ One or more labs not found. Please run seed_lab_tests.js first.');
    process.exit(1);
  }

  console.log('✓ Found 3 labs: Popular Diagnostic, Ibn Sina, Labaid');

  // ── 3. Find Lab Tests ────────────────────────────────────────────────────
  const cbcTest = await prisma.labTest.findFirst({ where: { name: 'Complete Blood Count (CBC)' } });
  const lipidTest = await prisma.labTest.findFirst({ where: { name: 'Lipid Profile' } });
  const hba1cTest = await prisma.labTest.findFirst({ where: { name: 'HbA1c (Glycated Hemoglobin)' } });
  const chestXrayTest = await prisma.labTest.findFirst({ where: { name: 'Chest X-Ray (PA View)' } });
  const healthCheckupTest = await prisma.labTest.findFirst({ where: { name: 'Basic Health Checkup Package' } });
  const thyroidTest = await prisma.labTest.findFirst({ where: { name: 'Thyroid Function Test (TFT)' } });
  const ecgTest = await prisma.labTest.findFirst({ where: { name: 'ECG (Electrocardiogram)' } });

  if (!cbcTest || !lipidTest || !hba1cTest || !chestXrayTest || !healthCheckupTest || !thyroidTest || !ecgTest) {
    console.error('❌ One or more lab tests not found. Please run seed_lab_tests.js first.');
    process.exit(1);
  }

  console.log('✓ Found all required lab tests\n');

  // ── 4. Helper: create order idempotently by test names ───────────────────
  async function upsertOrder(orderIdempotencyKey, data) {
    // Check if an order with matching items already exists for this patient
    const existingOrder = await prisma.labOrder.findFirst({
      where: { id: BigInt(orderIdempotencyKey) },
      include: { tests: true },
    });

    if (existingOrder) {
      // Update status and demoStep
      await prisma.labOrder.update({
        where: { id: existingOrder.id },
        data: { status: data.status, demoStep: data.demoStep },
      });
      console.log(`  ↻ Updated Order #${existingOrder.id}: ${data.status} (demoStep: ${data.demoStep})`);
      return existingOrder;
    }

    // Create new order
    const order = await prisma.labOrder.create({
      data: {
        patientId: patient.id,
        labId: data.labId,
        status: data.status,
        demoStep: data.demoStep,
        subtotal: data.subtotal,
        vat: data.vat,
        homeCollectionFee: data.homeCollectionFee || 0,
        totalAmount: data.totalAmount,
        homeCollection: data.homeCollection || false,
        collectionAddress: data.collectionAddress || null,
        createdAt: data.createdAt,
        tests: {
          create: data.testIds.map((testId) => ({ labTestId: BigInt(testId) })),
        },
      },
    });

    console.log(`  ✓ Created Order #${order.id}: ${data.status} (demoStep: ${data.demoStep}) — ${data.label}`);
    return order;
  }

  // ── 5. Create 6 Demo Orders ──────────────────────────────────────────────

  const now = new Date();

  // Order 1: CBC + Lipid Profile — Popular Diagnostic — Requested (fresh)
  await upsertOrder('10001', {
    label: 'CBC + Lipid Profile @ Popular',
    labId: popularLab.id,
    status: 'Requested',
    demoStep: 1,
    subtotal: 350 + 600,
    vat: Math.round((350 + 600) * 0.05),
    totalAmount: 350 + 600 + Math.round((350 + 600) * 0.05),
    testIds: [cbcTest.id, lipidTest.id],
    createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
  });

  // Order 2: HbA1c — Labaid — AcceptedByLab
  await upsertOrder('10002', {
    label: 'HbA1c @ Labaid',
    labId: labaidLab.id,
    status: 'AcceptedByLab',
    demoStep: 2,
    subtotal: 700,
    vat: Math.round(700 * 0.05),
    totalAmount: 700 + Math.round(700 * 0.05),
    testIds: [hba1cTest.id],
    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
  });

  // Order 3: Chest X-Ray — Popular Diagnostic — Processing
  await upsertOrder('10003', {
    label: 'Chest X-Ray @ Popular',
    labId: popularLab.id,
    status: 'Processing',
    demoStep: 5,
    subtotal: 500,
    vat: Math.round(500 * 0.05),
    totalAmount: 500 + Math.round(500 * 0.05),
    testIds: [chestXrayTest.id],
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
  });

  // Order 4: Basic Health Checkup — Popular Diagnostic — Reported (with params + result)
  const order4 = await upsertOrder('10004', {
    label: 'Basic Health Checkup @ Popular',
    labId: popularLab.id,
    status: 'Reported',
    demoStep: 8,
    subtotal: 2500,
    vat: Math.round(2500 * 0.05),
    totalAmount: 2500 + Math.round(2500 * 0.05),
    testIds: [healthCheckupTest.id],
    createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000), // 3 days ago
  });

  // Add report parameters + result for Order 4
  const existingResult4 = await prisma.labResult.findFirst({ where: { labOrderId: order4.id } });
  if (!existingResult4) {
    const checkupParams = [
      { parameterName: 'Hemoglobin (Hb)', value: '13.8', unit: 'g/dL', referenceRange: '13.0 - 17.0' },
      { parameterName: 'Blood Glucose (Fasting)', value: '5.2', unit: 'mmol/L', referenceRange: '4.0 - 6.1' },
      { parameterName: 'Total Cholesterol', value: '185', unit: 'mg/dL', referenceRange: '125 - 200' },
      { parameterName: 'HDL Cholesterol', value: '48', unit: 'mg/dL', referenceRange: '40 - 60' },
      { parameterName: 'LDL Cholesterol', value: '110', unit: 'mg/dL', referenceRange: '< 130' },
      { parameterName: 'Triglycerides', value: '135', unit: 'mg/dL', referenceRange: '< 150' },
      { parameterName: 'ALT (SGPT)', value: '28', unit: 'U/L', referenceRange: '10 - 40' },
      { parameterName: 'AST (SGOT)', value: '25', unit: 'U/L', referenceRange: '10 - 40' },
      { parameterName: 'Serum Creatinine', value: '0.9', unit: 'mg/dL', referenceRange: '0.6 - 1.2' },
    ];

    for (const p of checkupParams) {
      await prisma.reportParameter.create({
        data: { labOrderId: order4.id, ...p },
      });
    }

    await prisma.labResult.create({
      data: {
        labOrderId: order4.id,
        resultSummary: 'All parameters within normal biological reference intervals. Fasting blood glucose and lipid profile are optimal. Liver and kidney function tests are normal.',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        uploadedBy: 'Dr. Farzana Khan (Consultant Pathologist)',
      },
    });

    console.log(`  ✓ Added report parameters + result for Order #${order4.id}`);
  }

  // Order 5: Thyroid Function Test — Ibn Sina — Requested (fresh, different lab)
  await upsertOrder('10005', {
    label: 'Thyroid Function Test @ Ibn Sina',
    labId: ibnSinaLab.id,
    status: 'Requested',
    demoStep: 1,
    subtotal: 900,
    vat: Math.round(900 * 0.05),
    totalAmount: 900 + Math.round(900 * 0.05),
    testIds: [thyroidTest.id],
    createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
  });

  // Order 6: ECG — Popular Diagnostic — Cancelled (rejected with reason)
  const order6 = await upsertOrder('10006', {
    label: 'ECG @ Popular (Rejected)',
    labId: popularLab.id,
    status: 'Cancelled',
    demoStep: 0,
    subtotal: 400,
    vat: Math.round(400 * 0.05),
    totalAmount: 400 + Math.round(400 * 0.05),
    testIds: [ecgTest.id],
    createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
  });

  // Add rejection reason for Order 6
  const existingRejection = await prisma.orderRejection.findFirst({ where: { labOrderId: order6.id } });
  if (!existingRejection) {
    await prisma.orderRejection.create({
      data: {
        labOrderId: order6.id,
        reason: 'Patient requested cancellation',
        note: 'Patient called to cancel due to scheduling conflict. Refund processed.',
      },
    });
    console.log(`  ✓ Added rejection reason for Order #${order6.id}`);
  }

  // ── 6. Update existing Reported orders from seed_reports.js ──────────────
  const existingReportedOrders = await prisma.labOrder.findMany({
    where: {
      patientId: patient.id,
      status: 'Reported',
      demoStep: null,
    },
  });

  for (const o of existingReportedOrders) {
    await prisma.labOrder.update({
      where: { id: o.id },
      data: { demoStep: 8 },
    });
    console.log(`  ↻ Updated existing Order #${o.id}: set demoStep = 8`);
  }

  // ── 7. Summary ───────────────────────────────────────────────────────────
  const allOrders = await prisma.labOrder.findMany({
    where: { patientId: patient.id },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`\n📊 Summary: ${allOrders.length} total orders for ${patientUser.fullName}`);
  for (const o of allOrders) {
    console.log(`  #${o.id}: ${o.status} (demoStep: ${o.demoStep ?? 'null'})`);
  }

  console.log('\n🎉 Demo orders seeding complete!');
  console.log('   Patient can see all orders at /dashboard/patient/lab-orders');
  console.log('   Each lab sees only their orders in their portal.\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
