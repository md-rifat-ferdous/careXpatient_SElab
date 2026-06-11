const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const mockOrders = [
  {
    id: 1001,
    patient_name: 'Kazi Ashfaq',
    patient_phone: '+880 1819 123456',
    patient_photo: '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png',
    demo_step: 1,
    assigned_staff: null,
    total_amount: '1365.00',
    home_collection: true,
    collection_address: 'House 45, Road 11, Sector 4, Uttara, Dhaka',
    collection_slot: '08:00:00',
    home_collection_fee: '150.00',
    subtotal: '1150.00',
    vat: '65.00',
    test_ids: [1, 2],
  },
  {
    id: 1002,
    patient_name: 'Dr. Nadia Islam',
    patient_phone: '+880 1711 987654',
    patient_photo: '/assets/e7b2f880878a62318682e68ff12cea28.png',
    demo_step: 1,
    assigned_staff: null,
    total_amount: '2310.00',
    home_collection: false,
    collection_address: null,
    collection_slot: null,
    home_collection_fee: '0.00',
    subtotal: '2200.00',
    vat: '110.00',
    test_ids: [3, 6],
  },
  {
    id: 1003,
    patient_name: 'Imtiaz Ahmed',
    patient_phone: '+880 1552 456789',
    patient_photo: '/assets/a524dd9f1541c95195021849ce900b27.png',
    demo_step: 2,
    assigned_staff: null,
    total_amount: '1732.50',
    home_collection: true,
    collection_address: 'Flat 4B, Concord Tower, Dhanmondi, Dhaka',
    collection_slot: '09:00:00',
    home_collection_fee: '150.00',
    subtotal: '1500.00',
    vat: '82.50',
    test_ids: [4],
  },
  {
    id: 1004,
    patient_name: 'Sultana Razia',
    patient_phone: '+880 1913 789123',
    patient_photo: '/assets/8b050976103bda6b4905d66fb1351961.png',
    demo_step: 4,
    assigned_staff: 'Kamal Hossain',
    total_amount: '577.50',
    home_collection: true,
    collection_address: 'House 12/A, Road 2, Banani, Dhaka',
    collection_slot: '07:30:00',
    home_collection_fee: '150.00',
    subtotal: '400.00',
    vat: '27.50',
    test_ids: [2, 10],
  },
  {
    id: 1005,
    patient_name: 'Tanvir Hossain',
    patient_phone: '+880 1678 234567',
    patient_photo: '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png',
    demo_step: 7,
    assigned_staff: 'Rashedul Islam',
    total_amount: '577.50',
    home_collection: false,
    collection_address: null,
    collection_slot: null,
    home_collection_fee: '0.00',
    subtotal: '550.00',
    vat: '27.50',
    test_ids: [1, 5],
  },
  {
    id: 1006,
    patient_name: 'Farhana Chowdhury',
    patient_phone: '+880 1722 345678',
    patient_photo: '/assets/e7b2f880878a62318682e68ff12cea28.png',
    demo_step: 8,
    assigned_staff: 'Farhana Yasmin',
    total_amount: '2257.50',
    home_collection: true,
    collection_address: 'Plot 89, Sector 7, Uttara, Dhaka',
    collection_slot: '10:00:00',
    home_collection_fee: '150.00',
    subtotal: '2000.00',
    vat: '107.50',
    test_ids: [3, 4],
  },
  {
    id: 1007,
    patient_name: 'Ziaur Rahman',
    patient_phone: '+880 1812 345678',
    patient_photo: '/assets/a524dd9f1541c95195021849ce900b27.png',
    demo_step: 9,
    assigned_staff: 'Dr. S. Rahman',
    total_amount: '1260.00',
    home_collection: false,
    collection_address: null,
    collection_slot: null,
    home_collection_fee: '0.00',
    subtotal: '1200.00',
    vat: '60.00',
    test_ids: [1, 2],
  },
  {
    id: 1008,
    patient_name: 'Tasnim Ara',
    patient_phone: '+880 1755 876543',
    patient_photo: '/assets/8b050976103bda6b4905d66fb1351961.png',
    demo_step: 9,
    assigned_staff: 'Kamal Hossain',
    total_amount: '997.50',
    home_collection: true,
    collection_address: 'House 5, Road 8, Sector 1, Uttara, Dhaka',
    collection_slot: '11:00:00',
    home_collection_fee: '150.00',
    subtotal: '800.00',
    vat: '47.50',
    test_ids: [3],
  },
  {
    id: 1009,
    patient_name: 'Mahbubul Alam',
    patient_phone: '+880 1312 908172',
    patient_photo: '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png',
    demo_step: 0,
    assigned_staff: null,
    total_amount: '1890.00',
    home_collection: false,
    collection_address: null,
    collection_slot: null,
    home_collection_fee: '0.00',
    subtotal: '1800.00',
    vat: '90.00',
    test_ids: [1, 3],
  },
  {
    id: 1010,
    patient_name: 'Anika Tabassum',
    patient_phone: '+880 1987 654321',
    patient_photo: '/assets/e7b2f880878a62318682e68ff12cea28.png',
    demo_step: 1,
    assigned_staff: null,
    total_amount: '787.50',
    home_collection: true,
    collection_address: 'House 10, Road 4, Sector 9, Uttara, Dhaka',
    collection_slot: '08:00:00',
    home_collection_fee: '150.00',
    subtotal: '600.00',
    vat: '37.50',
    test_ids: [1],
  },
  {
    id: 1011,
    patient_name: 'Sajid Khan',
    patient_phone: '+880 1765 432109',
    patient_photo: '/assets/a524dd9f1541c95195021849ce900b27.png',
    demo_step: 3,
    assigned_staff: 'Rashedul Islam',
    total_amount: '1575.00',
    home_collection: false,
    collection_address: null,
    collection_slot: null,
    home_collection_fee: '0.00',
    subtotal: '1500.00',
    vat: '75.00',
    test_ids: [10, 12],
  },
  {
    id: 1012,
    patient_name: 'Rina Begum',
    patient_phone: '+880 1515 234567',
    patient_photo: '/assets/8b050976103bda6b4905d66fb1351961.png',
    demo_step: 2,
    assigned_staff: null,
    total_amount: '1207.50',
    home_collection: true,
    collection_address: 'House 55, Road 2, Sector 12, Uttara, Dhaka',
    collection_slot: '09:30:00',
    home_collection_fee: '150.00',
    subtotal: '1000.00',
    vat: '57.50',
    test_ids: [4, 5],
  },
  {
    id: 1013,
    patient_name: 'Mustafa Kamal',
    patient_phone: '+880 1733 998877',
    patient_photo: '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png',
    demo_step: 5,
    assigned_staff: 'Farhana Yasmin',
    total_amount: '840.00',
    home_collection: false,
    collection_address: null,
    collection_slot: null,
    home_collection_fee: '0.00',
    subtotal: '800.00',
    vat: '40.00',
    test_ids: [1, 3],
  },
  {
    id: 1014,
    patient_name: 'Jahanara Alam',
    patient_phone: '+880 1611 223344',
    patient_photo: '/assets/e7b2f880878a62318682e68ff12cea28.png',
    demo_step: 6,
    assigned_staff: 'Dr. S. Rahman',
    total_amount: '1102.50',
    home_collection: true,
    collection_address: 'House 88, Road 5, Sector 10, Uttara, Dhaka',
    collection_slot: '08:00:00',
    home_collection_fee: '150.00',
    subtotal: '900.00',
    vat: '52.50',
    test_ids: [6],
  },
  {
    id: 1015,
    patient_name: 'Kamrul Hasan',
    patient_phone: '+880 1822 556677',
    patient_photo: '/assets/a524dd9f1541c95195021849ce900b27.png',
    demo_step: 8,
    assigned_staff: 'Kamal Hossain',
    total_amount: '787.50',
    home_collection: false,
    collection_address: null,
    collection_slot: null,
    home_collection_fee: '0.00',
    subtotal: '750.00',
    vat: '37.50',
    test_ids: [1, 2],
  },
  {
    id: 1016,
    patient_name: 'Nusrat Jahan',
    patient_phone: '+880 1744 889900',
    patient_photo: '/assets/8b050976103bda6b4905d66fb1351961.png',
    demo_step: 9,
    assigned_staff: 'Rashedul Islam',
    total_amount: '1102.50',
    home_collection: true,
    collection_address: 'House 22, Road 7, Sector 3, Uttara, Dhaka',
    collection_slot: '10:30:00',
    home_collection_fee: '150.00',
    subtotal: '900.00',
    vat: '52.50',
    test_ids: [1],
  },
  {
    id: 1017,
    patient_name: 'Ahsan Habib',
    patient_phone: '+880 1955 667788',
    patient_photo: '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png',
    demo_step: 9,
    assigned_staff: 'Dr. S. Rahman',
    total_amount: '525.00',
    home_collection: false,
    collection_address: null,
    collection_slot: null,
    home_collection_fee: '0.00',
    subtotal: '500.00',
    vat: '25.00',
    test_ids: [1, 2],
  },
  {
    id: 1018,
    patient_name: 'Sabina Yasmin',
    patient_phone: '+880 1715 001122',
    patient_photo: '/assets/e7b2f880878a62318682e68ff12cea28.png',
    demo_step: 0,
    assigned_staff: null,
    total_amount: '577.50',
    home_collection: true,
    collection_address: 'House 14, Road 1, Sector 5, Uttara, Dhaka',
    collection_slot: '07:00:00',
    home_collection_fee: '150.00',
    subtotal: '400.00',
    vat: '27.50',
    test_ids: [1],
  }
];

const STEP_TO_STATUS = {
  0: 'Cancelled',
  1: 'Requested',
  2: 'AcceptedByLab',
  3: 'AcceptedByLab',
  4: 'SampleCollected',
  5: 'SampleCollected',
  6: 'Processing',
  7: 'Processing',
  8: 'Processing',
  9: 'Reported',
};

async function main() {
  const client = await pool.connect();
  try {
    console.log('Running self-healing migrations on "LabOrder"...');
    await client.query('ALTER TABLE "LabOrder" ADD COLUMN IF NOT EXISTS demo_step INT DEFAULT 1');
    await client.query('ALTER TABLE "LabOrder" ADD COLUMN IF NOT EXISTS assigned_staff VARCHAR(255)');
    console.log('Migrations completed successfully.');

    // Ensure LabOrderRejection table
    await client.query(`
      CREATE TABLE IF NOT EXISTS "OrderRejection" (
        id SERIAL PRIMARY KEY,
        order_id BIGINT UNIQUE NOT NULL,
        reason VARCHAR(255) NOT NULL,
        note TEXT,
        rejected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verify Lab 1 exists
    const labCheck = await client.query('SELECT id FROM "Lab" WHERE id = 1');
    if (labCheck.rows.length === 0) {
      console.log('Creating default Lab with ID 1...');
      let labUserId = 5; // default from User table
      await client.query(`
        INSERT INTO "Lab" (id, user_id, name, address, phone, created_at, updated_at)
        VALUES (1, $1, 'Modern Lab Center', 'Uttara, Dhaka', '01700000003', NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [labUserId]);
    }

    console.log('Seeding mock orders if not present...');
    for (const o of mockOrders) {
      const orderCheck = await client.query('SELECT id FROM "LabOrder" WHERE id = $1', [o.id]);
      if (orderCheck.rows.length === 0) {
        console.log(`Seeding Order #${o.id} (${o.patient_name})...`);

        // Clean phone number (strip spaces)
        const cleanPhone = o.patient_phone.replace(/\s+/g, '');

        // 1. Create or Find User
        let userRes = await client.query('SELECT id FROM "User" WHERE phone = $1', [cleanPhone]);
        let userId;
        if (userRes.rows.length > 0) {
          userId = userRes.rows[0].id;
        } else {
          const email = `patient_${o.id}@example.com`;
          const insertUser = await client.query(`
            INSERT INTO "User" (phone, email, full_name, role, is_verified, profile_photo_url, created_at, updated_at)
            VALUES ($1, $2, $3, 'Patient', true, $4, NOW(), NOW())
            RETURNING id
          `, [cleanPhone, email, o.patient_name, o.patient_photo]);
          userId = insertUser.rows[0].id;
        }

        // 2. Create or Find Patient
        let patientRes = await client.query('SELECT id FROM "Patient" WHERE user_id = $1', [userId]);
        let patientId;
        if (patientRes.rows.length > 0) {
          patientId = patientRes.rows[0].id;
        } else {
          const insertPatient = await client.query(`
            INSERT INTO "Patient" (user_id, date_of_birth, blood_group, address, created_at, updated_at)
            VALUES ($1, '1990-01-01', 'O+', $2, NOW(), NOW())
            RETURNING id
          `, [userId, o.collection_address || 'Dhaka, Bangladesh']);
          patientId = insertPatient.rows[0].id;
        }

        // 3. Create LabOrder
        const status = STEP_TO_STATUS[o.demo_step];
        await client.query(`
          INSERT INTO "LabOrder" (id, patient_id, lab_id, status, demo_step, assigned_staff, total_amount, home_collection, collection_address, collection_slot, home_collection_fee, subtotal, vat, created_at, updated_at)
          VALUES ($1, $2, 1, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
        `, [
          o.id,
          patientId,
          status,
          o.demo_step,
          o.assigned_staff,
          o.total_amount,
          o.home_collection,
          o.collection_address,
          o.collection_slot,
          o.home_collection_fee,
          o.subtotal,
          o.vat
        ]);

        // 4. Create LabOrderTest records
        for (const testId of o.test_ids) {
          const testCheck = await client.query('SELECT id FROM "LabTest" WHERE id = $1', [testId]);
          if (testCheck.rows.length > 0) {
            await client.query(`
              INSERT INTO "LabOrderTest" (lab_order_id, lab_test_id)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `, [o.id, testId]);
          } else {
            await client.query(`
              INSERT INTO "LabOrderTest" (lab_order_id, lab_test_id)
              VALUES ($1, 1)
              ON CONFLICT DO NOTHING
            `, [o.id]);
          }
        }

        // 5. If rejected (step 0), also seed into OrderRejection
        if (o.demo_step === 0) {
          const reason = o.id === 1009 ? 'Duplicate request' : 'Incomplete documentation';
          const note = o.id === 1009 
            ? 'Patient already has an active order for the same tests submitted 2 hours prior.' 
            : 'Patient prescription is missing the doctor\'s signature and stamp. Please resubmit.';
          
          await client.query(`
            INSERT INTO "OrderRejection" (order_id, reason, note, rejected_at)
            VALUES ($1, $2, $3, NOW() - INTERVAL '1 day')
            ON CONFLICT (order_id) DO NOTHING
          `, [o.id, reason, note]);
        }
      }
    }
    console.log('Seeding completed successfully.');
  } catch (err) {
    console.error('Error in seeder:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
