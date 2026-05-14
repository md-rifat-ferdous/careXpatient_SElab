import { PrismaClient } from './client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed with real Bangladesh doctors...');

  // --- REAL DOCTORS from doctorbangladesh.com ---

  // Doctor 1: Cardiologist
  const user1 = await prisma.user.upsert({
    where: { phone: '01811000001' },
    update: {},
    create: { fullName: 'Dr. Md. Habib Ahsan', phone: '01811000001', email: 'habib.ahsan@carex.com', role: 'Doctor', profilePhotoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b1f8?q=80&w=150&h=150&auto=format&fit=crop' },
  });
  const doctor1 = await prisma.doctor.upsert({
    where: { userId: user1.id },
    update: {},
    create: { userId: user1.id, qualification: 'MBBS, BCS (Health), D-Card (BMU), CCD (BIRDEM)', bmdcNumber: 'BMDC-10011' },
  });

  // Doctor 2: ENT Specialist
  const user2 = await prisma.user.upsert({
    where: { phone: '01811000002' },
    update: {},
    create: { fullName: 'Dr. Md. Sohel Rana', phone: '01811000002', email: 'sohel.rana@carex.com', role: 'Doctor', profilePhotoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=150&h=150&auto=format&fit=crop' },
  });
  const doctor2 = await prisma.doctor.upsert({
    where: { userId: user2.id },
    update: {},
    create: { userId: user2.id, qualification: 'MBBS, BCS (Health), DLO (BMU), MACS (USA)', bmdcNumber: 'BMDC-10022' },
  });

  // Doctor 3: Eye Specialist
  const user3 = await prisma.user.upsert({
    where: { phone: '01811000003' },
    update: {},
    create: { fullName: 'Dr. Mahamud Adnan Himel', phone: '01811000003', email: 'adnan.himel@carex.com', role: 'Doctor', profilePhotoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=150&h=150&auto=format&fit=crop' },
  });
  const doctor3 = await prisma.doctor.upsert({
    where: { userId: user3.id },
    update: {},
    create: { userId: user3.id, qualification: 'MBBS, BCS (Health), D-Ophth (Eye), Fellowship in Retina (NIOH)', bmdcNumber: 'BMDC-10033' },
  });

  // Doctor 4: Urologist
  const user4 = await prisma.user.upsert({
    where: { phone: '01811000004' },
    update: {},
    create: { fullName: 'Dr. Md. Mezbahul Moker Rabin', phone: '01811000004', email: 'mezbahul.rabin@carex.com', role: 'Doctor', profilePhotoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=150&h=150&auto=format&fit=crop' },
  });
  const doctor4 = await prisma.doctor.upsert({
    where: { userId: user4.id },
    update: {},
    create: { userId: user4.id, qualification: 'MBBS, BCS (Health), MS (Urology), FCPS (Urology)', bmdcNumber: 'BMDC-10044' },
  });

  // Doctor 5: Orthopedic Surgeon
  const user5 = await prisma.user.upsert({
    where: { phone: '01811000005' },
    update: {},
    create: { fullName: 'Dr. Abdullah Al Manjurul', phone: '01811000005', email: 'abdullah.manjurul@carex.com', role: 'Doctor', profilePhotoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b1f8?q=80&w=150&h=150&auto=format&fit=crop' },
  });
  const doctor5 = await prisma.doctor.upsert({
    where: { userId: user5.id },
    update: {},
    create: { userId: user5.id, qualification: 'MBBS, BCS (Health), D-Ortho (BMU), FCPS (Orthopedics)', bmdcNumber: 'BMDC-10055' },
  });

  // Doctor 6: Oncologist
  const user6 = await prisma.user.upsert({
    where: { phone: '01811000006' },
    update: {},
    create: { fullName: 'Dr. Md. Nazmus Sakib', phone: '01811000006', email: 'nazmus.sakib@carex.com', role: 'Doctor', profilePhotoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=150&h=150&auto=format&fit=crop' },
  });
  const doctor6 = await prisma.doctor.upsert({
    where: { userId: user6.id },
    update: {},
    create: { userId: user6.id, qualification: 'MBBS, MD (Oncology)', bmdcNumber: 'BMDC-10066' },
  });

  // --- PATIENT ---
  const patientUser = await prisma.user.upsert({
    where: { phone: '01911111111' },
    update: {},
    create: { fullName: 'Mr. Karim Hossain', phone: '01911111111', email: 'karim@example.com', role: 'Patient' },
  });
  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: { gender: 'Male', bloodGroup: 'O+' },
    create: { userId: patientUser.id, bloodGroup: 'O+', gender: 'Male', address: 'Dhaka, Bangladesh' },
  });

  // --- REALISTIC PRESCRIPTIONS ---
  const prescriptionData = [
    {
      doctor: doctor1,
      title: 'Cardiology Follow-up',
      summary: 'Management of hypertension and cardiovascular risk factor reduction.',
      diagnosis: 'Essential Hypertension with Hyperlipidemia',
      medicines: 'Amlodipine | 5mg | 1+0+0 | 1 Month || Atorvastatin | 20mg | 0+0+1 | 1 Month || Aspirin | 75mg | 0+1+0 | 1 Month',
      advice: 'Low sodium diet. Avoid stress. Walk 30 mins daily. Follow-up in 1 month.',
      status: 'Completed',
      issuedAt: new Date('2025-01-10'),
    },
    {
      doctor: doctor2,
      title: 'ENT Consultation - Sinusitis',
      summary: 'Acute sinusitis with nasal congestion and headache.',
      diagnosis: 'Acute Maxillary Sinusitis',
      medicines: 'Amoxicillin-Clavulanate | 625mg | 1+0+1 | 7 Days || Fluticasone Nasal Spray | 50mcg | 2 puffs | 2 Weeks || Cetirizine | 10mg | 0+0+1 | 10 Days',
      advice: 'Steam inhalation twice daily. Drink warm liquids. Avoid cold environment.',
      status: 'Completed',
      issuedAt: new Date('2025-02-05'),
    },
    {
      doctor: doctor3,
      title: 'Ophthalmology - Retinal Check',
      summary: 'Routine retinal assessment and management of early macular degeneration.',
      diagnosis: 'Early Age-related Macular Degeneration',
      medicines: 'Lutein + Zeaxanthin | 10mg+2mg | 1+0+1 | 3 Months || Vitamin C | 500mg | 1+0+0 | 3 Months',
      advice: 'Avoid bright light exposure. Wear UV-protected sunglasses. Annual fundus exam required.',
      status: 'Confirmed',
      issuedAt: new Date('2025-03-12'),
    },
    {
      doctor: doctor4,
      title: 'Urology - Kidney Stone',
      summary: 'Management of right-sided renal calculi with pain control.',
      diagnosis: 'Right Renal Calculus (6mm)',
      medicines: 'Tamsulosin | 0.4mg | 0+0+1 | 1 Month || Ketorolac | 30mg | 1+0+1 | 5 Days || Potassium Citrate | 1080mg | 1+1+1 | 2 Months',
      advice: 'Drink 2.5 to 3 litres of water daily. Reduce salt and meat intake. Avoid oxalate-rich foods.',
      status: 'Completed',
      issuedAt: new Date('2025-03-20'),
    },
    {
      doctor: doctor5,
      title: 'Orthopedic - Knee Pain',
      summary: 'Evaluation and treatment plan for degenerative joint disease of the right knee.',
      diagnosis: 'Right Knee Osteoarthritis (Grade II)',
      medicines: 'Diclofenac | 50mg | 1+0+1 | 2 Weeks || Glucosamine Sulphate | 750mg | 1+0+1 | 3 Months || Omeprazole | 20mg | 1+0+0 | 2 Weeks',
      advice: 'Quadriceps strengthening exercises. Avoid climbing stairs. Physiotherapy recommended.',
      status: 'Completed',
      issuedAt: new Date('2025-04-02'),
    },
    {
      doctor: doctor6,
      title: 'Oncology Follow-up',
      summary: 'Post-chemotherapy follow-up with blood count monitoring.',
      diagnosis: 'Hodgkin Lymphoma - Remission',
      medicines: 'Ondansetron | 8mg | 1+0+1 | 2 Weeks || Filgrastim Injection | 300mcg | As directed | 5 Days || Folic Acid | 5mg | 1+0+0 | 1 Month',
      advice: 'Avoid infection. Maintain hygiene. Report any fever above 38°C immediately. Monthly CBC required.',
      status: 'Confirmed',
      issuedAt: new Date('2025-04-15'),
    },
    {
      doctor: doctor1,
      title: 'Diabetes & Cardio Combined',
      summary: 'Dual management of Type 2 Diabetes and Ischemic Heart Disease.',
      diagnosis: 'Type 2 Diabetes Mellitus with Ischemic Heart Disease',
      medicines: 'Metformin | 500mg | 1+0+1 | 3 Months || Empagliflozin | 10mg | 1+0+0 | 3 Months || Bisoprolol | 5mg | 1+0+0 | 1 Month',
      advice: 'HbA1c test every 3 months. Low glycemic diet. Avoid strenuous physical activity.',
      status: 'Completed',
      issuedAt: new Date('2025-05-01'),
    },
    {
      doctor: doctor2,
      title: 'ENT - Vertigo Treatment',
      summary: 'Positional vertigo treatment with vestibular rehabilitation plan.',
      diagnosis: 'Benign Paroxysmal Positional Vertigo (BPPV)',
      medicines: 'Betahistine | 16mg | 1+0+1 | 1 Month || Cinnarizine | 25mg | 0+0+1 | 2 Weeks',
      advice: 'Epley manoeuvre exercises daily. Avoid sudden head movements. No driving during acute episodes.',
      status: 'Confirmed',
      issuedAt: new Date('2025-05-10'),
    },
  ];

  for (const p of prescriptionData) {
    await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: p.doctor.id,
        date: p.issuedAt,
        timeSlot: p.issuedAt,
        status: p.status,
        type: 'Online',
        consultation: {
          create: {
            notes: 'Patient advised to follow prescription strictly.',
            prescription: {
              create: {
                title: p.title,
                summary: p.summary,
                medicinesText: p.medicines,
                adviceText: p.advice,
                diagnosis: p.diagnosis,
                issuedAt: p.issuedAt,
              },
            },
          },
        },
      },
    });
    console.log(`✅ Created prescription: ${p.title} — Dr. ${p.doctor.id}`);
  }

  console.log('\n🎉 Seeding complete! Database now has real Bangladeshi doctors from doctorbangladesh.com.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
