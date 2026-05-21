const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Demo Prescriptions...');

  // 1. Find Patient Rifat Ferdous
  const patientUser = await prisma.user.findFirst({
    where: { phone: '01700000000' },
    include: { patient: true }
  });

  if (!patientUser || !patientUser.patient) {
    console.error('❌ Patient Rifat Ferdous (phone: 01700000000) not found. Please run seed_reports.js first to create this patient user.');
    process.exit(1);
  }

  const patient = patientUser.patient;
  console.log(`✓ Found Patient: ${patientUser.fullName} (id: ${patient.id})`);

  // 2. Find Doctors
  const sarah = await prisma.doctor.findFirst({
    include: { user: { select: { fullName: true } } },
    where: { user: { fullName: 'Dr. Sarah Ahmed' } }
  });

  const rahim = await prisma.doctor.findFirst({
    include: { user: { select: { fullName: true } } },
    where: { user: { fullName: 'Dr. Rahim Khan' } }
  });

  const anika = await prisma.doctor.findFirst({
    include: { user: { select: { fullName: true } } },
    where: { user: { fullName: 'Dr. Anika Rahman' } }
  });

  const iqbal = await prisma.doctor.findFirst({
    include: { user: { select: { fullName: true } } },
    where: { user: { fullName: 'Dr. S.M. Iqbal' } }
  });

  if (!sarah || !rahim || !anika || !iqbal) {
    console.error('❌ One or more doctors not found. Please run seed_doctors.js first.');
    process.exit(1);
  }

  console.log('✓ Found doctors: Dr. Sarah Ahmed, Dr. Rahim Khan, Dr. Anika Rahman, Dr. S.M. Iqbal');

  // Clean existing prescriptions and consultations for these seeded appointments
  // To avoid duplicates, let's delete any appointments created for these specific test prescriptions
  console.log('Cleaning old demo prescriptions...');
  const oldAppointments = await prisma.appointment.findMany({
    where: {
      patientId: patient.id,
      reasonForVisit: { startsWith: '[DEMO RX]' }
    }
  });

  for (const appt of oldAppointments) {
    await prisma.$executeRawUnsafe(`DELETE FROM "Prescription" WHERE consultation_id IN (SELECT id FROM "Consultation" WHERE appointment_id = ${appt.id})`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Consultation" WHERE appointment_id = ${appt.id}`).catch(() => {});
    await prisma.$executeRawUnsafe(`DELETE FROM "Appointment" WHERE id = ${appt.id}`).catch(() => {});
  }
  console.log('Old demo prescriptions cleaned.');

  // 3. Define Prescription Data
  const prescriptionsData = [
    {
      doctor: sarah,
      doctorName: 'Dr. Sarah Ahmed',
      reason: '[DEMO RX] Routine checkup for hypertension & cholesterol management',
      status: 'Completed', // Maps to 'Completed' prescription status
      date: new Date('2026-05-20T10:00:00Z'),
      diagnosis: 'Essential Hypertension (Grade 1), Hyperlipidemia',
      adviceText: '1. Keep a daily log of blood pressure readings (morning and evening).\n2. Reduce intake of salt, fried foods, and red meat.\n3. Brisk walking for at least 30-40 minutes daily.\n4. Plenty of water intake.\n5. Follow up in 4 weeks with fresh Lipid Profile reports.',
      medicinesText: [
        'Esomeprazole 20mg | 1+0+1 | 30 Mins Before Meal | 1 Month',
        'Amlodipine 5mg | 0+0+1 | After Dinner | 3 Months',
        'Atorvastatin 10mg | 0+0+1 | At Bedtime | 3 Months',
        'Clopidogrel 75mg | 1+0+0 | After Breakfast | 1 Month'
      ].join('\n'),
      issuedAt: new Date('2026-05-20T10:30:00Z')
    },
    {
      doctor: rahim,
      doctorName: 'Dr. Rahim Khan',
      reason: '[DEMO RX] High fever, throat pain, difficulty swallowing',
      status: 'Completed', // Maps to 'Completed' prescription status
      date: new Date('2026-05-21T11:15:00Z'), // Today
      diagnosis: 'Acute Bilateral Tonsillitis with Pharyngitis',
      adviceText: '1. Avoid cold water, soft drinks, and ice creams.\n2. Gargle with warm saline water 3 to 4 times a day.\n3. Drink lukewarm water and ginger tea.\n4. Complete the antibiotic course strictly.\n5. Bed rest for 3 days.',
      medicinesText: [
        'Cefuroxime Axetil 250mg | 1+0+1 | After Meal | 7 Days',
        'Paracetamol 500mg | 1+1+1 | After Meal | 3 Days (As needed for fever)',
        'Fexofenadine Hydrochloride 120mg | 0+0+1 | After Meal | 7 Days',
        'De-rash Throat Lozenges | 1+1+1+1 | Dissolve slowly in mouth | 5 Days'
      ].join('\n'),
      issuedAt: new Date('2026-05-21T11:45:00Z')
    },
    {
      doctor: anika,
      doctorName: 'Dr. Anika Rahman',
      reason: '[DEMO RX] Red itchy rashes on arms and legs',
      status: 'Confirmed', // Maps to 'Verified' prescription status
      date: new Date('2026-05-18T16:30:00Z'),
      diagnosis: 'Severe Atopic Dermatitis (Eczema Flare-up)',
      adviceText: '1. Use a mild, soap-free cleanser for bathing.\n2. Apply moisturizer within 3 minutes after towel drying.\n3. Wear loose cotton clothes; avoid synthetic materials.\n4. Avoid direct scratching; keep nails trimmed.\n5. Avoid exposure to dust and animal dander.',
      medicinesText: [
        'Desloratadine 5mg | 0+0+1 | After Dinner | 15 Days',
        'Mometasone Furoate 0.1% Cream | Apply sparingly | Twice daily on affected areas | 7 Days',
        'Physiogel Calming Lotion | Apply freely | Three times daily | 1 Month'
      ].join('\n'),
      issuedAt: new Date('2026-05-18T17:00:00Z')
    },
    {
      doctor: iqbal,
      doctorName: 'Dr. S.M. Iqbal',
      reason: '[DEMO RX] Severe throbbing headache with sensitivity to light',
      status: 'Pending', // Maps to 'Issued' prescription status
      date: new Date('2026-05-15T09:30:00Z'),
      diagnosis: 'Chronic Migraine without Aura',
      adviceText: '1. Maintain a headache diary to identify trigger items.\n2. Ensure 7-8 hours of sound sleep at regular times.\n3. Avoid skipping meals and long screen times.\n4. Keep yourself hydrated (2.5-3L water daily).\n5. Limit caffeine intake.',
      medicinesText: [
        'Amitriptyline Hydrochloride 10mg | 0+0+1 | 1 Hour Before Bedtime | 2 Months',
        'Naproxen Sodium 500mg | 1+0+1 | After Meal | 5 Days (During acute phase)',
        'Pantoprazole 20mg | 1+0+1 | 30 Mins Before Meal | 1 Month'
      ].join('\n'),
      issuedAt: new Date('2026-05-15T10:00:00Z')
    }
  ];

  // 4. Create database records
  console.log('Seeding new demo prescriptions...');
  for (const item of prescriptionsData) {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: item.doctor.id,
        type: 'In_person',
        status: item.status,
        date: item.date,
        timeSlot: item.date,
        reasonForVisit: item.reason
      }
    });

    const consultation = await prisma.consultation.create({
      data: {
        appointmentId: appointment.id,
        startTime: item.date,
        endTime: new Date(item.date.getTime() + 20 * 60 * 1000), // 20 mins later
        notes: `Demo consultation with ${item.doctorName} for ${item.diagnosis}`
      }
    });

    const prescription = await prisma.prescription.create({
      data: {
        consultationId: consultation.id,
        medicinesText: item.medicinesText,
        adviceText: item.adviceText,
        diagnosis: item.diagnosis,
        digitalSignature: `Digitally signed by ${item.doctorName} on ${item.issuedAt.toLocaleDateString()}`,
        issuedAt: item.issuedAt
      }
    });

    console.log(`  ✓ Created Rx ID: RX-${String(prescription.id).padStart(6, '0')} (Issued Status: ${item.status === 'Completed' ? 'Completed' : (item.status === 'Pending' ? 'Issued' : 'Verified')}) by ${item.doctorName}`);
  }

  console.log('\n🎉 Prescription Seeding Complete! Enjoy testing!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
