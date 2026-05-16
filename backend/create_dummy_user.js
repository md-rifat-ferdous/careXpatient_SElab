const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Explicitly point to the backend prisma client if needed, 
// but usually it works if we run it from the backend dir
const prisma = new PrismaClient();

async function main() {
  const email = 'doctor@test.com';
  const password = 'password123';
  const name = 'Dr. Dummy Account';
  const phone = '01700000000';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const doctor = await prisma.doctor.upsert({
      where: { email: email },
      update: {
        password: hashedPassword,
        name: name,
        phone: phone,
      },
      create: {
        email: email,
        password: hashedPassword,
        name: name,
        phone: phone,
        specialty: 'General Physician',
        bmdcNumber: 'BMDC12345',
        qualification: 'MBBS',
        experienceYears: 5,
        fee: 500,
        about: 'This is a dummy account for testing purposes.'
      }
    });

    console.log('Dummy doctor account created/updated successfully:');
    console.log('Email:', doctor.email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating dummy account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
