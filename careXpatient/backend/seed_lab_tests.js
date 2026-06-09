const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Lab Tests data...\n');

  // ── 1. Create Lab Users & Lab records ─────────────────────────────────────
  const labsData = [
    {
      phone: '01800000010',
      fullName: 'Popular Diagnostic Centre',
      password: 'lab123',
      labName: 'Popular Diagnostic Centre',
      address: 'House 16, Road 2, Dhanmondi, Dhaka',
    },
    {
      phone: '01800000011',
      fullName: 'Ibn Sina Diagnostic',
      password: 'lab123',
      labName: 'Ibn Sina Diagnostic',
      address: 'Panthapath, Dhaka',
    },
    {
      phone: '01800000012',
      fullName: 'Labaid Diagnostics',
      password: 'lab123',
      labName: 'Labaid Diagnostics',
      address: 'Mirpur Road, Dhaka',
    },
  ];

  const createdLabs = [];

  for (const l of labsData) {
    const hashed = await bcrypt.hash(l.password, 10);
    const user = await prisma.user.upsert({
      where: { phone: l.phone },
      update: { fullName: l.fullName, role: 'Lab', isVerified: true },
      create: {
        phone: l.phone,
        fullName: l.fullName,
        password: hashed,
        role: 'Lab',
        isVerified: true,
      },
    });

    const lab = await prisma.lab.upsert({
      where: { userId: user.id },
      update: { name: l.labName, address: l.address },
      create: { userId: user.id, name: l.labName, address: l.address, phone: l.phone },
    });

    createdLabs.push(lab);
    console.log(`  ✓ Lab created: ${lab.name} (id: ${lab.id})`);
  }

  const [popularLab, ibnSinaLab, labaidLab] = createdLabs;

  // ── 2. Create Lab Tests ───────────────────────────────────────────────────
  const labTests = [
    // ── Blood Tests ──
    {
      name: 'Complete Blood Count (CBC)',
      tag: 'Most Popular',
      tagColor: '#14B8A6',
      description: 'A comprehensive blood test that evaluates overall health and detects a wide range of disorders including anemia, infection, and many other diseases.',
      prerequisites: 'Fasting for 8 hours preferred. Avoid strenuous exercise 24 hours before.',
      deliveryTime: '6–8 hours',
      sampleType: 'Blood',
      price: 350,
      category: 'Blood',
      labId: popularLab.id,
    },
    {
      name: 'Fasting Blood Glucose (FBG)',
      tag: 'Diabetes Check',
      tagColor: '#F59E0B',
      description: 'Measures your blood glucose level after an overnight fast. Essential for diagnosing diabetes and prediabetes.',
      prerequisites: 'Fasting for at least 8–12 hours required.',
      deliveryTime: '4–6 hours',
      sampleType: 'Blood',
      price: 200,
      category: 'Blood',
      labId: popularLab.id,
    },
    {
      name: 'Lipid Profile',
      tag: 'Heart Health',
      tagColor: '#EF4444',
      description: 'Measures cholesterol levels (total, LDL, HDL) and triglycerides to assess cardiovascular risk.',
      prerequisites: 'Fasting for 10–12 hours required. Avoid fatty foods the night before.',
      deliveryTime: '6–8 hours',
      sampleType: 'Blood',
      price: 600,
      category: 'Blood',
      labId: ibnSinaLab.id,
    },
    {
      name: 'Thyroid Function Test (TFT)',
      tag: 'Thyroid Panel',
      tagColor: '#8B5CF6',
      description: 'Evaluates TSH, T3, and T4 levels to assess thyroid gland function and detect hypothyroidism or hyperthyroidism.',
      prerequisites: 'No fasting required. Take medications as usual unless told otherwise.',
      deliveryTime: '8–12 hours',
      sampleType: 'Blood',
      price: 900,
      category: 'Blood',
      labId: ibnSinaLab.id,
    },
    {
      name: 'HbA1c (Glycated Hemoglobin)',
      tag: '3-Month Sugar',
      tagColor: '#F59E0B',
      description: 'Reflects average blood sugar levels over the past 2–3 months. Used to monitor long-term diabetes management.',
      prerequisites: 'No fasting required.',
      deliveryTime: '6–8 hours',
      sampleType: 'Blood',
      price: 700,
      category: 'Blood',
      labId: labaidLab.id,
    },
    {
      name: 'Liver Function Test (LFT)',
      tag: 'Liver Panel',
      tagColor: '#10B981',
      description: 'A group of blood tests that check how well your liver is working. Measures proteins, enzymes, and bilirubin.',
      prerequisites: 'Fasting for 8 hours preferred.',
      deliveryTime: '8–12 hours',
      sampleType: 'Blood',
      price: 800,
      category: 'Blood',
      labId: labaidLab.id,
    },

    // ── Imaging Tests ──
    {
      name: 'Chest X-Ray (PA View)',
      tag: 'Quick Result',
      tagColor: '#0EA5E9',
      description: 'A standard chest X-ray that gives a clear picture of the heart, lungs, airways, blood vessels, and the bones of the spine and chest.',
      prerequisites: 'Remove metal objects and jewelry. Inform if pregnant.',
      deliveryTime: '1–2 hours',
      sampleType: 'Imaging',
      price: 500,
      category: 'Imaging',
      labId: popularLab.id,
    },
    {
      name: 'Abdominal Ultrasound',
      tag: 'Recommended',
      tagColor: '#14B8A6',
      description: 'Uses sound waves to produce pictures of the structures within the upper abdomen including liver, gallbladder, spleen, pancreas, and kidneys.',
      prerequisites: 'Fasting for 6 hours. Drink 4–6 glasses of water 1 hour before (do not urinate).',
      deliveryTime: '1–3 hours',
      sampleType: 'Imaging',
      price: 1200,
      category: 'Imaging',
      labId: ibnSinaLab.id,
    },
    {
      name: 'MRI Brain (Without Contrast)',
      tag: 'Advanced',
      tagColor: '#6366F1',
      description: 'A non-invasive imaging test that creates detailed pictures of your brain and surrounding nerve tissue using magnetic fields.',
      prerequisites: 'Remove all metallic objects. Inform of any implants. No fasting required.',
      deliveryTime: '24 hours',
      sampleType: 'Imaging',
      price: 8500,
      category: 'Imaging',
      labId: labaidLab.id,
    },

    // ── Cardiac Tests ──
    {
      name: 'ECG (Electrocardiogram)',
      tag: 'Quick',
      tagColor: '#EF4444',
      description: 'Records the electrical signals in your heart to detect heart conditions like arrhythmias, heart attacks, and heart failure.',
      prerequisites: 'Wear comfortable clothing. Avoid applying lotions or oils to the chest area.',
      deliveryTime: '30 minutes',
      sampleType: 'Cardiac',
      price: 400,
      category: 'Cardiac',
      labId: popularLab.id,
    },
    {
      name: 'Echocardiogram (Echo)',
      tag: 'Heart Scan',
      tagColor: '#EF4444',
      description: 'Uses ultrasound waves to create detailed images of your heart\'s structure and function in real-time.',
      prerequisites: 'No special preparation needed. Wear comfortable, loose-fitting clothing.',
      deliveryTime: '2–4 hours',
      sampleType: 'Cardiac',
      price: 3500,
      category: 'Cardiac',
      labId: ibnSinaLab.id,
    },
    {
      name: 'Troponin I (Cardiac Marker)',
      tag: 'Emergency',
      tagColor: '#EF4444',
      description: 'Measures troponin proteins released when heart muscle is damaged. Key test for diagnosing heart attacks.',
      prerequisites: 'No preparation required. Emergency test available 24/7.',
      deliveryTime: '2–3 hours',
      sampleType: 'Blood',
      price: 1500,
      category: 'Cardiac',
      labId: labaidLab.id,
    },

    // ── Full Body Checkup ──
    {
      name: 'Basic Health Checkup Package',
      tag: 'Best Value',
      tagColor: '#14B8A6',
      description: 'Includes CBC, Blood Glucose (Fasting), Lipid Profile, Liver Function Test, Kidney Function Test, and Urine R/E. Perfect for an annual health screening.',
      prerequisites: 'Fasting for 10–12 hours required. Bring urine sample in a clean container.',
      deliveryTime: '12–24 hours',
      sampleType: 'Blood + Urine',
      price: 2500,
      category: 'Full Body Checkup',
      labId: popularLab.id,
    },
    {
      name: 'Comprehensive Executive Health Package',
      tag: 'Premium',
      tagColor: '#6366F1',
      description: 'Our most thorough health assessment including 30+ tests: CBC, Lipid Panel, Thyroid, Liver, Kidney, Diabetes, Vitamin D, B12, Chest X-Ray, and ECG.',
      prerequisites: 'Fasting for 12 hours. Avoid alcohol for 24 hours before. Wear comfortable clothes.',
      deliveryTime: '24–48 hours',
      sampleType: 'Blood + Urine + Imaging',
      price: 6500,
      category: 'Full Body Checkup',
      labId: ibnSinaLab.id,
    },
    {
      name: 'Women\'s Wellness Package',
      tag: 'For Women',
      tagColor: '#EC4899',
      description: 'Designed for women\'s health: CBC, Thyroid Panel, Iron Studies, Vitamin D, B12, Pap Smear guidance, and Pelvic Ultrasound.',
      prerequisites: 'Fasting for 8 hours. Schedule between days 5–10 of menstrual cycle for best results.',
      deliveryTime: '24–48 hours',
      sampleType: 'Blood + Imaging',
      price: 4500,
      category: 'Full Body Checkup',
      labId: labaidLab.id,
    },
  ];

  console.log('\n📋 Creating Lab Tests...\n');
  let created = 0;

  for (const test of labTests) {
    // Use upsert by name to avoid duplicates on re-run
    const existing = await prisma.labTest.findFirst({ where: { name: test.name } });
    if (existing) {
      await prisma.labTest.update({
        where: { id: existing.id },
        data: {
          tag: test.tag,
          tagColor: test.tagColor,
          description: test.description,
          prerequisites: test.prerequisites,
          deliveryTime: test.deliveryTime,
          sampleType: test.sampleType,
          price: test.price,
          category: test.category,
          labId: test.labId,
        },
      });
      console.log(`  ↻ Updated: ${test.name}`);
    } else {
      await prisma.labTest.create({ data: test });
      console.log(`  ✓ Created: ${test.name}`);
      created++;
    }
  }

  console.log(`\n✅ Done! ${created} lab tests seeded across 3 labs.`);
  console.log('\n📊 Summary:');
  console.log(`  • Popular Diagnostic Centre: Blood, Imaging, Cardiac, Full Body tests`);
  console.log(`  • Ibn Sina Diagnostic: Blood, Imaging, Cardiac, Full Body tests`);
  console.log(`  • Labaid Diagnostics: Blood, Imaging, Cardiac, Full Body tests`);
  console.log('\n🎉 Navigate to http://localhost:3000/dashboard/patient/lab-tests to see them!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
