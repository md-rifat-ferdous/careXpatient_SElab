const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  
  const accounts = [
    {
      phone: '01700000001',
      fullName: 'Test Patient',
      email: 'patient@test.com',
      password: 'patient123',
      role: 'Patient',
      details: {
        bloodGroup: 'O+',
        address: 'Dhaka, Bangladesh'
      }
    },
    {
      phone: '01700000002',
      fullName: 'Test Doctor',
      email: 'doctor@test.com',
      password: 'doctor123',
      role: 'Doctor',
      details: {
        bmdcNumber: 'BMDC12345',
        qualification: 'MBBS, FCPS',
        experienceYears: 10,
        fee: 500
      }
    },
    {
      phone: '01700000003',
      fullName: 'Test Lab',
      email: 'lab@test.com',
      password: 'lab123',
      role: 'Lab',
      details: {
        name: 'CareX Lab',
        address: 'Uttara, Dhaka',
        phone: '01700000003'
      }
    }
  ];

  console.log('Creating dummy accounts...');

  for (const acc of accounts) {
    const hashedPassword = await bcrypt.hash(acc.password, saltRounds);
    
    // Create User
    const user = await prisma.user.upsert({
      where: { phone: acc.phone },
      update: {
        fullName: acc.fullName,
        email: acc.email,
        password: hashedPassword,
        role: acc.role,
        isVerified: true
      },
      create: {
        phone: acc.phone,
        fullName: acc.fullName,
        email: acc.email,
        password: hashedPassword,
        role: acc.role,
        isVerified: true
      }
    });

    // Create Profile
    if (acc.role === 'Patient') {
      await prisma.patient.upsert({
        where: { userId: user.id },
        update: acc.details,
        create: {
          userId: user.id,
          ...acc.details
        }
      });
    } else if (acc.role === 'Doctor') {
      await prisma.doctor.upsert({
        where: { userId: user.id },
        update: acc.details,
        create: {
          userId: user.id,
          ...acc.details
        }
      });
    } else if (acc.role === 'Lab') {
      await prisma.lab.upsert({
        where: { userId: user.id },
        update: acc.details,
        create: {
          userId: user.id,
          ...acc.details
        }
      });
    }
    
    console.log(`  ✓ ${acc.role} account created: ${acc.phone} / ${acc.password}`);
  }

  console.log('All dummy accounts created/updated!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
