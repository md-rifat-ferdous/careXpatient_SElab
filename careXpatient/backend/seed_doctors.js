const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  // Use raw SQL to bypass FK constraints cleanly
  await prisma.$executeRawUnsafe(`DELETE FROM "DoctorSpecialty"`);
  await prisma.$executeRawUnsafe(`DELETE FROM "Appointment" WHERE doctor_id IN (SELECT id FROM "Doctor")`).catch(() => {});
  await prisma.$executeRawUnsafe(`DELETE FROM "Doctor"`);
  await prisma.$executeRawUnsafe(`DELETE FROM "Specialty"`);
  await prisma.$executeRawUnsafe(`DELETE FROM "User" WHERE role = 'Doctor'`);

  console.log('Seeding specialties...');
  const specialtyNames = [
    'Cardiologist', 'Pediatrician', 'Dermatologist', 
    'Neurologist', 'Gynecologist', 'Orthopedic'
  ];

  const specialties = {};
  for (const name of specialtyNames) {
    const s = await prisma.specialty.create({ data: { name } });
    specialties[name] = s.id;
  }

  const doctorsData = [
    {
      fullName: 'Dr. Sarah Ahmed',
      email: 'sarah@mail.com',
      phone: '01711111111',
      specialty: 'Cardiologist',
      qualification: 'MBBS, MD (Cardiology), FCPS',
      experience: 12,
      fee: 120,
      rating: 4.9,
      reviews: 320,
      photo: 'https://i.pravatar.cc/150?u=sarah',
    },
    {
      fullName: 'Dr. Rahim Khan',
      email: 'rahim@mail.com',
      phone: '01711111112',
      specialty: 'Pediatrician',
      qualification: 'MBBS, DCH, FCPS (Paediatrics)',
      experience: 8,
      fee: 80,
      rating: 4.8,
      reviews: 512,
      photo: 'https://i.pravatar.cc/150?u=rahim',
    },
    {
      fullName: 'Dr. Anika Rahman',
      email: 'anika@mail.com',
      phone: '01711111113',
      specialty: 'Dermatologist',
      qualification: 'MBBS, DDV, MD (Dermatology)',
      experience: 6,
      fee: 100,
      rating: 5.0,
      reviews: 198,
      photo: 'https://i.pravatar.cc/150?u=anika',
    },
    {
      fullName: 'Dr. S.M. Iqbal',
      email: 'iqbal@mail.com',
      phone: '01711111114',
      specialty: 'Neurologist',
      qualification: 'MBBS, MD (Neurology), PhD',
      experience: 15,
      fee: 150,
      rating: 4.7,
      reviews: 440,
      photo: 'https://i.pravatar.cc/150?u=iqbal',
    },
    {
      fullName: 'Dr. Maria Gomez',
      email: 'maria@mail.com',
      phone: '01711111115',
      specialty: 'Gynecologist',
      qualification: 'MBBS, FCPS (Obs & Gynae)',
      experience: 10,
      fee: 110,
      rating: 4.9,
      reviews: 275,
      photo: 'https://i.pravatar.cc/150?u=maria',
    },
    {
      fullName: 'Dr. Tanvir Hossain',
      email: 'tanvir@mail.com',
      phone: '01711111116',
      specialty: 'Orthopedic',
      qualification: 'MBBS, MS (Ortho), FCPS',
      experience: 9,
      fee: 130,
      rating: 4.6,
      reviews: 189,
      photo: 'https://i.pravatar.cc/150?u=tanvir',
    },
  ];

  console.log('Seeding doctors...');
  for (const data of doctorsData) {
    // Upsert user: create if not exists, update if exists
    const user = await prisma.user.upsert({
      where: { phone: data.phone },
      update: {
        fullName: data.fullName,
        email: data.email,
        role: 'Doctor',
        isVerified: true,
        profilePhotoUrl: data.photo,
      },
      create: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: 'Doctor',
        isVerified: true,
        profilePhotoUrl: data.photo,
      },
    });

    // Upsert doctor: create if not exists, update if exists
    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        qualification: data.qualification,
        experienceYears: data.experience,
        fee: data.fee,
        rating: data.rating,
        reviewCount: data.reviews,
      },
      create: {
        userId: user.id,
        qualification: data.qualification,
        experienceYears: data.experience,
        fee: data.fee,
        rating: data.rating,
        reviewCount: data.reviews,
      },
    });

    // Link specialty (upsert to avoid duplicates)
    await prisma.doctorSpecialty.upsert({
      where: {
        doctorId_specialtyId: {
          doctorId: doctor.id,
          specialtyId: specialties[data.specialty],
        },
      },
      update: {},
      create: {
        doctorId: doctor.id,
        specialtyId: specialties[data.specialty],
      },
    });

    console.log(`  ✓ ${data.fullName} (${data.specialty})`);
  }

  console.log('Clean seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
