const db = require('./config/db');

const TESTS = [
  {
    name: 'Complete Blood Count (CBC)',
    price: 500,
    sample_type: 'Blood',
    category: 'Blood',
    delivery_time: '6 Hours',
    description: 'Comprehensive analysis of red blood cells, white blood cells, hemoglobin, hematocrit, and platelets to evaluate overall health.',
    prerequisites: 'Fasting for 8 hours preferred. Avoid strenuous exercise 24 hours before.',
    tag: 'Popular',
    tag_color: '#14B8A6'
  },
  {
    name: 'HbA1c (Glycated Hemoglobin)',
    price: 750,
    sample_type: 'Blood',
    category: 'Blood',
    delivery_time: '12 Hours',
    description: 'Measures average blood glucose over the past 2–3 months. Key indicator for long-term diabetes management.',
    prerequisites: 'No fasting required.',
    tag: 'Recommended',
    tag_color: '#3B82F6'
  },
  {
    name: 'Lipid Profile',
    price: 850,
    sample_type: 'Serum',
    category: 'Blood',
    delivery_time: '12 Hours',
    description: 'Measures total cholesterol, LDL, HDL, triglycerides, and VLDL to assess cardiovascular risk.',
    prerequisites: 'Fasting for 10–12 hours required. Avoid fatty foods the night before.',
    tag: 'Popular',
    tag_color: '#14B8A6'
  },
  {
    name: 'Liver Function Test (LFT)',
    price: 1200,
    sample_type: 'Blood',
    category: 'Blood',
    delivery_time: '24 Hours',
    description: 'Evaluates ALT, AST, ALP, bilirubin, albumin, and total protein to assess liver health and detect liver damage.',
    prerequisites: 'Fasting for 8 hours recommended.',
    tag: 'Routine',
    tag_color: '#10B981'
  },
  {
    name: 'Kidney Function Test (KFT)',
    price: 1100,
    sample_type: 'Blood',
    category: 'Blood',
    delivery_time: '24 Hours',
    description: 'Measures creatinine, BUN, uric acid, and electrolytes to evaluate kidney function and detect renal disorders.',
    prerequisites: 'Fasting for 8 hours recommended. Stay hydrated.',
    tag: 'Routine',
    tag_color: '#10B981'
  },
  {
    name: 'Thyroid Panel (T3, T4, TSH)',
    price: 1500,
    sample_type: 'Serum',
    category: 'Blood',
    delivery_time: '24 Hours',
    description: 'Complete thyroid assessment including Free T3, Free T4, and TSH levels to diagnose hypo/hyperthyroidism.',
    prerequisites: 'No fasting required. Take medications as usual unless advised otherwise.',
    tag: 'Premium',
    tag_color: '#8B5CF6'
  },
  {
    name: 'Vitamin D (25-Hydroxy)',
    price: 1800,
    sample_type: 'Serum',
    category: 'Blood',
    delivery_time: '48 Hours',
    description: 'Measures 25-hydroxyvitamin D level to assess bone health and detect deficiency. Common in Bangladesh due to limited sun exposure.',
    prerequisites: 'No fasting required.',
    tag: 'Recommended',
    tag_color: '#3B82F6'
  },
  {
    name: 'Dengue NS1 Antigen',
    price: 950,
    sample_type: 'Serum',
    category: 'Blood',
    delivery_time: 'Same Day',
    description: 'Rapid detection of Dengue NS1 antigen for early diagnosis within the first 5 days of fever onset.',
    prerequisites: 'No fasting required. Best performed within first 5 days of symptoms.',
    tag: 'Express',
    tag_color: '#EF4444'
  },
  {
    name: 'CRP (C-Reactive Protein)',
    price: 600,
    sample_type: 'Serum',
    category: 'Blood',
    delivery_time: '12 Hours',
    description: 'Detects inflammation or infection in the body. Used to monitor chronic inflammatory conditions and assess infection severity.',
    prerequisites: 'No fasting required.',
    tag: 'Routine',
    tag_color: '#10B981'
  },
  {
    name: 'ESR (Erythrocyte Sedimentation Rate)',
    price: 300,
    sample_type: 'Blood',
    category: 'Blood',
    delivery_time: '6 Hours',
    description: 'Non-specific marker of inflammation. Helps monitor infections, autoimmune diseases, and certain cancers.',
    prerequisites: 'No fasting required.',
    tag: 'Routine',
    tag_color: '#10B981'
  },
  {
    name: 'Urine R/E (Routine Examination)',
    price: 250,
    sample_type: 'Urine',
    category: 'Urine',
    delivery_time: '6 Hours',
    description: 'Routine urinalysis including physical, chemical, and microscopic examination for detecting UTI, kidney disease, and diabetes.',
    prerequisites: 'Collect midstream clean-catch urine sample. Morning sample preferred.',
    tag: 'Popular',
    tag_color: '#14B8A6'
  },
  {
    name: 'Urine Culture & Sensitivity',
    price: 800,
    sample_type: 'Urine',
    category: 'Microbiology',
    delivery_time: '3 Working Days',
    description: 'Identifies bacterial pathogens causing urinary tract infections and determines antibiotic sensitivity pattern.',
    prerequisites: 'Collect midstream clean-catch sample before starting antibiotics.',
    tag: 'New',
    tag_color: '#F59E0B'
  },
  {
    name: 'Chest X-Ray (PA View)',
    price: 700,
    sample_type: 'N/A',
    category: 'Imaging',
    delivery_time: 'Same Day',
    description: 'Standard posteroanterior chest radiograph for evaluating lungs, heart size, and thoracic structures.',
    prerequisites: 'Remove metal objects and jewelry. Inform if pregnant.',
    tag: 'Routine',
    tag_color: '#10B981'
  },
  {
    name: 'Histopathology (Biopsy)',
    price: 3500,
    sample_type: 'Tissue',
    category: 'Pathology',
    delivery_time: '3 Working Days',
    description: 'Microscopic examination of tissue specimens obtained by biopsy for diagnosis of tumors, infections, and other conditions.',
    prerequisites: 'Sample must be collected by a physician. Preserve in formalin.',
    tag: 'Premium',
    tag_color: '#8B5CF6'
  },
  {
    name: 'Blood Culture & Sensitivity',
    price: 1200,
    sample_type: 'Blood',
    category: 'Microbiology',
    delivery_time: '3 Working Days',
    description: 'Detects bacteria or fungi in the bloodstream causing sepsis or bacteremia. Includes antibiotic sensitivity testing.',
    prerequisites: 'Collect before starting antibiotics. Two samples from different sites recommended.',
    tag: 'Express',
    tag_color: '#EF4444'
  }
];

async function seed() {
  console.log('Seeding LabTest table with 15 realistic tests for lab_id = 1...\n');

  // First, clear existing lab_id = 1 tests to avoid duplicates
  const delResult = await db.query('DELETE FROM "LabTest" WHERE lab_id = 1');
  console.log(`Cleared ${delResult.rowCount} existing lab_id=1 tests.\n`);

  let inserted = 0;
  for (const t of TESTS) {
    const q = `
      INSERT INTO "LabTest" (name, price, sample_type, category, delivery_time, description, lab_id, prerequisites, tag, tag_color)
      VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8, $9)
      RETURNING id, name, category, price
    `;
    const params = [t.name, t.price, t.sample_type, t.category, t.delivery_time, t.description, t.prerequisites, t.tag, t.tag_color];
    const r = await db.query(q, params);
    console.log(`  ✓ [${r.rows[0].id}] ${r.rows[0].name} — ৳${r.rows[0].price} (${r.rows[0].category})`);
    inserted++;
  }

  console.log(`\n✅ Successfully seeded ${inserted} tests.`);

  // Verify
  const verify = await db.query('SELECT COUNT(*) as count FROM "LabTest" WHERE lab_id = 1');
  console.log(`   Database now has ${verify.rows[0].count} tests for lab_id = 1.`);

  process.exit(0);
}

seed().catch(e => { console.error('Seed failed:', e); process.exit(1); });
