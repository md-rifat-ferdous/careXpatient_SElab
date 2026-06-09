/**
 * seed_lab_accounts.js
 * Creates 4 realistic Lab Portal test accounts.
 * Uses upsert — safe to run multiple times; does NOT touch existing accounts.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const LAB_ACCOUNTS = [
  {
    phone:    '01811111101',
    email:    'labmanager1@carex.com',
    fullName: 'Farhan Hossain',          // Lab Manager 1
    password: 'Lab12345',
    role:     'Lab',
    labName:  'Popular Diagnostic Centre - Branch 1',
    labAddress: 'House 16, Road 2, Dhanmondi, Dhaka 1205',
    labPhone: '01811111101',
  },
  {
    phone:    '01811111102',
    email:    'labmanager2@carex.com',
    fullName: 'Nusrat Jahan',            // Lab Manager 2
    password: 'Lab12345',
    role:     'Lab',
    labName:  'Ibn Sina Diagnostic & Imaging Centre',
    labAddress: 'House 48, Road 9/A, Dhanmondi, Dhaka 1209',
    labPhone: '01811111102',
  },
  {
    phone:    '01811111103',
    email:    'labtech1@carex.com',
    fullName: 'Rashed Karim',            // Lab Technician 1
    password: 'Lab12345',
    role:     'Lab',
    labName:  'Lab Aid Hospital Diagnostic',
    labAddress: 'House 1, Road 4, Dhanmondi, Dhaka 1205',
    labPhone: '01811111103',
  },
  {
    phone:    '01811111104',
    email:    'labtech2@carex.com',
    fullName: 'Sadia Islam',             // Lab Technician 2
    password: 'Lab12345',
    role:     'Lab',
    labName:  'Medinova Medical Services',
    labAddress: 'Haque Tower, Bir Uttam CR Datta Road, Dhaka 1000',
    labPhone: '01811111104',
  },
];

async function main() {
  console.log('\n🧪 Seeding Lab Portal test accounts...\n');

  for (const acc of LAB_ACCOUNTS) {
    const hashedPassword = await bcrypt.hash(acc.password, 10);

    // Upsert User (Lab role)
    const user = await prisma.user.upsert({
      where: { phone: acc.phone },
      update: {
        email:       acc.email,
        fullName:    acc.fullName,
        password:    hashedPassword,
        role:        acc.role,
        isVerified:  true,
      },
      create: {
        phone:       acc.phone,
        email:       acc.email,
        fullName:    acc.fullName,
        password:    hashedPassword,
        role:        acc.role,
        isVerified:  true,
      },
    });

    // Upsert Lab record linked to this user
    await prisma.lab.upsert({
      where: { userId: user.id },
      update: {
        name:    acc.labName,
        address: acc.labAddress,
        phone:   acc.labPhone,
      },
      create: {
        userId:  user.id,
        name:    acc.labName,
        address: acc.labAddress,
        phone:   acc.labPhone,
      },
    });

    console.log(`  ✅ ${acc.fullName}`);
    console.log(`     Email   : ${acc.email}`);
    console.log(`     Phone   : ${acc.phone}`);
    console.log(`     Password: ${acc.password}`);
    console.log(`     Lab     : ${acc.labName}`);
    console.log('');
  }

  console.log('━'.repeat(52));
  console.log('🎉  Lab accounts seeded successfully!\n');
  console.log('Login at: http://localhost:3000/login');
  console.log('Role    : Lab  →  redirects to /dashboard/lab\n');
  console.log('Credentials summary:');
  console.log('  labmanager1@carex.com  /  Lab12345  (Farhan Hossain)');
  console.log('  labmanager2@carex.com  /  Lab12345  (Nusrat Jahan)');
  console.log('  labtech1@carex.com     /  Lab12345  (Rashed Karim)');
  console.log('  labtech2@carex.com     /  Lab12345  (Sadia Islam)');
  console.log('━'.repeat(52));
}

main()
  .catch((e) => {
    console.error('❌  Seeding failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
