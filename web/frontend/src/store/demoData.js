const TESTS = [
  { id: 1,  name: 'CBC',                  category: 'Blood',   sample_type: 'Blood', price: 500,  delivery_time: '24 Hours',  description: 'Complete Blood Count — hemoglobin, WBC, RBC, platelets',         tag: 'Basic',       tag_color: '#14B8A6' },
  { id: 2,  name: 'Blood Sugar Fasting',   category: 'Blood',   sample_type: 'Blood', price: 300,  delivery_time: '6 Hours',   description: 'Fasting blood glucose level',                                    tag: 'Diabetes',   tag_color: '#3B82F6' },
  { id: 3,  name: 'Lipid Profile',         category: 'Blood',   sample_type: 'Blood', price: 700,  delivery_time: '48 Hours',  description: 'Cholesterol, HDL, LDL, Triglycerides',                           tag: 'Cardiac',    tag_color: '#EF4444' },
  { id: 4,  name: 'Urine R/E',             category: 'Urine',   sample_type: 'Urine', price: 350,  delivery_time: '24 Hours',  description: 'Routine urinalysis — physical, chemical, microscopic exam',       tag: 'Routine',    tag_color: '#F59E0B' },
  { id: 5,  name: 'HbA1c',                 category: 'Blood',   sample_type: 'Blood', price: 700,  delivery_time: '24 Hours',  description: 'Glycated hemoglobin — 3-month average blood sugar',               tag: 'Diabetes',   tag_color: '#3B82F6' },
  { id: 6,  name: 'ESR',                   category: 'Blood',   sample_type: 'Blood', price: 200,  delivery_time: '24 Hours',  description: 'Erythrocyte Sedimentation Rate — inflammation marker',           tag: 'Basic',       tag_color: '#14B8A6' },
  { id: 7,  name: 'Vitamin D',             category: 'Blood',   sample_type: 'Blood', price: 2000, delivery_time: '72 Hours',  description: '25-Hydroxy Vitamin D total',                                     tag: 'Nutrition',  tag_color: '#10B981' },
  { id: 8,  name: 'Thyroid Panel',         category: 'Blood',   sample_type: 'Blood', price: 1500, delivery_time: '48 Hours',  description: 'TSH, T3, T4 — thyroid function assessment',                       tag: 'Hormone',    tag_color: '#8B5CF6' },
  { id: 9,  name: 'LFT',                   category: 'Blood',   sample_type: 'Blood', price: 700,  delivery_time: '24 Hours',  description: 'Liver Function Test — ALT, AST, ALP, Bilirubin',                  tag: 'Liver',      tag_color: '#F59E0B' },
  { id: 10, name: 'KFT',                   category: 'Blood',   sample_type: 'Blood', price: 600,  delivery_time: '24 Hours',  description: 'Kidney Function Test — Creatinine, Urea, Electrolytes',           tag: 'Kidney',     tag_color: '#EF4444' },
  { id: 11, name: 'Glucose Fasting',       category: 'Blood',   sample_type: 'Blood', price: 300,  delivery_time: '6 Hours',   description: 'Fasting blood glucose (standalone)',                              tag: 'Diabetes',   tag_color: '#3B82F6' },
  { id: 12, name: 'Serum Creatinine',      category: 'Blood',   sample_type: 'Blood', price: 350,  delivery_time: '24 Hours',  description: 'Serum creatinine for kidney function',                            tag: 'Kidney',     tag_color: '#EF4444' },
  { id: 13, name: 'Urine C/S',             category: 'Microbiology', sample_type: 'Urine', price: 500, delivery_time: '72 Hours',  description: 'Urine culture and sensitivity — bacterial infection detection',  tag: 'Infection',  tag_color: '#8B5CF6' },
  { id: 14, name: 'ECG',                   category: 'Imaging', sample_type: 'N/A',   price: 800,  delivery_time: '1 Hour',    description: '12-lead electrocardiogram — heart rhythm assessment',            tag: 'Cardiac',    tag_color: '#EF4444' },
  { id: 15, name: 'Vitamin B12',           category: 'Blood',   sample_type: 'Blood', price: 1800, delivery_time: '72 Hours',  description: 'Serum Vitamin B12 level',                                         tag: 'Nutrition',  tag_color: '#10B981' },
];

function getTestPrice(name) {
  const t = TESTS.find(t => t.name === name);
  return t ? t.price : 500;
}

function computeOrderAmounts(testNames, homeCollection) {
  const subtotal = testNames.reduce((sum, n) => sum + getTestPrice(n), 0);
  const homeFee = homeCollection ? 150 : 0;
  const vat = Math.round((subtotal + homeFee) * 0.05);
  const total = subtotal + homeFee + vat;
  return { subtotal, home_collection_fee: homeFee, vat, total_amount: total };
}

const PATIENTS = [
  {
    id: 1, full_name: 'Rahim Ali', phone: '+8801712345678', email: 'rahim.ali@email.com',
    blood_group: 'A+', date_of_birth: '1985-06-15', address: 'House 12, Road 5, Uttara, Dhaka',
    gender: 'Male', registration_date: '2025-11-02',
    test_history: [
      { id: 1, test_names: ['CBC'], created_at: '2026-05-10T10:30:00Z', total_amount: '500', status: 'Reported' },
      { id: 2, test_names: ['Blood Sugar Fasting'], created_at: '2026-03-22T09:00:00Z', total_amount: '300', status: 'Reported' },
    ],
    previous_reports: [
      { id: 1, test_names: ['CBC'], uploaded_at: '2026-05-10T12:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r1.pdf' },
    ],
  },
  {
    id: 2, full_name: 'Nusrat Jahan', phone: '+8801712345679', email: 'nusrat.j@email.com',
    blood_group: 'B+', date_of_birth: '1992-09-08', address: 'Flat 3B, 45 Gulshan Ave, Dhaka',
    gender: 'Female', registration_date: '2025-12-15',
    test_history: [
      { id: 3, test_names: ['Lipid Profile', 'CBC'], created_at: '2026-04-18T11:00:00Z', total_amount: '1200', status: 'Reported' },
    ],
    previous_reports: [
      { id: 2, test_names: ['Lipid Profile', 'CBC'], uploaded_at: '2026-04-18T14:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r2.pdf' },
    ],
  },
  {
    id: 3, full_name: 'Karim Ahmed', phone: '+8801712345680', email: 'karim.a@email.com',
    blood_group: 'O+', date_of_birth: '1978-12-01', address: 'Village: Naldanga, Thana: Sadar, Kushtia',
    gender: 'Male', registration_date: '2026-01-10',
    test_history: [
      { id: 4, test_names: ['CBC'], created_at: '2026-05-28T08:00:00Z', total_amount: '500', status: 'Processing' },
      { id: 5, test_names: ['Urine R/E'], created_at: '2026-02-14T09:30:00Z', total_amount: '350', status: 'Reported' },
    ],
    previous_reports: [
      { id: 3, test_names: ['Urine R/E'], uploaded_at: '2026-02-14T12:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r3.pdf' },
    ],
  },
  {
    id: 4, full_name: 'Shamim Reza', phone: '+8801712345681', email: 'shamim.r@email.com',
    blood_group: 'AB+', date_of_birth: '1988-04-22', address: '23 Mirpur Road, Dhaka',
    gender: 'Male', registration_date: '2026-02-05',
    test_history: [
      { id: 6, test_names: ['HbA1c', 'CBC'], created_at: '2026-06-01T10:00:00Z', total_amount: '1200', status: 'Processing' },
    ],
    previous_reports: [],
  },
  {
    id: 5, full_name: 'Sabina Yasmin', phone: '+8801712345682', email: 'sabina.y@email.com',
    blood_group: 'O-', date_of_birth: '1995-07-30', address: '54 Elephant Road, Dhaka',
    gender: 'Female', registration_date: '2026-03-12',
    test_history: [
      { id: 7, test_names: ['Blood Sugar Fasting', 'Lipid Profile'], created_at: '2026-05-15T07:00:00Z', total_amount: '750', status: 'Reported' },
      { id: 8, test_names: ['CBC'], created_at: '2026-01-20T11:30:00Z', total_amount: '500', status: 'Reported' },
    ],
    previous_reports: [
      { id: 4, test_names: ['Blood Sugar Fasting', 'Lipid Profile'], uploaded_at: '2026-05-15T13:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r4.pdf' },
      { id: 5, test_names: ['CBC'], uploaded_at: '2026-01-20T15:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r5.pdf' },
    ],
  },
  {
    id: 6, full_name: 'Tarique Bin Ali', phone: '+8801712345683', email: 'tarique.ba@email.com',
    blood_group: 'B-', date_of_birth: '1972-11-18', address: '12/1 Motijheel C/A, Dhaka',
    gender: 'Male', registration_date: '2026-01-28',
    test_history: [
      { id: 9, test_names: ['CBC', 'ESR'], created_at: '2026-05-20T09:00:00Z', total_amount: '700', status: 'Reported' },
      { id: 10, test_names: ['Vitamin D'], created_at: '2026-03-10T10:00:00Z', total_amount: '2000', status: 'Reported' },
      { id: 11, test_names: ['Lipid Profile'], created_at: '2026-06-05T08:30:00Z', total_amount: '700', status: 'Processing' },
    ],
    previous_reports: [
      { id: 6, test_names: ['CBC', 'ESR'], uploaded_at: '2026-05-20T14:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r6.pdf' },
      { id: 7, test_names: ['Vitamin D'], uploaded_at: '2026-03-10T16:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r7.pdf' },
    ],
  },
  {
    id: 7, full_name: 'Nasrin Sultana', phone: '+8801712345684', email: 'nasrin.s@email.com',
    blood_group: 'A-', date_of_birth: '1990-03-14', address: '78 Dhanmondi, Rd 2, Dhaka',
    gender: 'Female', registration_date: '2025-10-20',
    test_history: [
      { id: 12, test_names: ['Thyroid Panel'], created_at: '2026-04-05T11:00:00Z', total_amount: '1500', status: 'Reported' },
    ],
    previous_reports: [
      { id: 8, test_names: ['Thyroid Panel'], uploaded_at: '2026-04-05T15:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r8.pdf' },
    ],
  },
  {
    id: 8, full_name: 'Shahidul Islam', phone: '+8801712345685', email: 'shahidul.i@email.com',
    blood_group: 'AB-', date_of_birth: '1980-08-05', address: '56 Banasree, Rampura, Dhaka',
    gender: 'Male', registration_date: '2026-04-01',
    test_history: [
      { id: 13, test_names: ['CBC', 'LFT'], created_at: '2026-06-08T09:00:00Z', total_amount: '1200', status: 'Requested' },
    ],
    previous_reports: [],
  },
  {
    id: 9, full_name: 'Parvin Akhter', phone: '+8801712345686', email: 'parvin.a@email.com',
    blood_group: 'B+', date_of_birth: '1965-12-25', address: '34 Shyamoli, Dhaka',
    gender: 'Female', registration_date: '2026-05-05',
    test_history: [
      { id: 14, test_names: ['Blood Sugar Fasting'], created_at: '2026-06-10T07:00:00Z', total_amount: '300', status: 'Processing' },
      { id: 15, test_names: ['Lipid Profile'], created_at: '2026-04-20T08:00:00Z', total_amount: '700', status: 'Reported' },
      { id: 16, test_names: ['CBC'], created_at: '2026-02-28T10:00:00Z', total_amount: '500', status: 'Reported' },
    ],
    previous_reports: [
      { id: 9, test_names: ['Lipid Profile'], uploaded_at: '2026-04-20T13:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r9.pdf' },
      { id: 10, test_names: ['CBC'], uploaded_at: '2026-02-28T15:00:00Z', uploaded_by: 'Dr. S. Rahman', file_url: '/reports/r10.pdf' },
    ],
  },
  {
    id: 10, full_name: 'Mizanur Rahman', phone: '+8801712345687', email: 'mizanur.r@email.com',
    blood_group: 'A+', date_of_birth: '1975-09-12', address: '89 Wari, Dhaka',
    gender: 'Male', registration_date: '2026-06-01',
    test_history: [
      { id: 17, test_names: ['CBC', 'KFT'], created_at: '2026-06-11T08:00:00Z', total_amount: '1100', status: 'Requested' },
    ],
    previous_reports: [],
  },
];

const AVATARS = [
  '/assets/4bd37d2d183662ae6e8134b5c5dd7463.png',
  '/assets/e7b2f880878a62318682e68ff12cea28.png',
  '/assets/a524dd9f1541c95195021849ce900b27.png',
  '/assets/8b050976103bda6b4905d66fb1351961.png',
];

function buildOrder(id, patient, testNames, step, opts = {}) {
  const amounts = computeOrderAmounts(testNames, opts.home_collection || false);
  return {
    id,
    patient_name: patient.full_name,
    patient_phone: patient.phone,
    patient_email: patient.email || '',
    patient_id: patient.id,
    patient_photo: AVATARS[patient.id % AVATARS.length],
    test_names: testNames,
    demo_step: step,
    status: step === 0 ? 'Rejected'
           : step === 1 ? 'Requested'
           : step === 2 ? 'Accepted'
           : step <= 6 ? 'Sample Collection'
           : step === 7 ? 'Processing'
           : step === 8 ? 'Ready for Report'
           : 'Completed',
    assigned_staff: opts.assigned_staff || null,
    created_at: opts.created_at || new Date().toISOString(),
    home_collection: opts.home_collection || false,
    collection_address: opts.collection_address || '',
    collection_slot: opts.collection_slot || '',
    ...amounts,
    rejection_reason: opts.rejection_reason || null,
    rejection_note: opts.rejection_note || null,
    rejected_at: opts.rejected_at || null,
    result_summary: opts.result_summary || null,
  };
}

const ORDERS = [
  // Step 1 — New Requests (for Test Queue)
  buildOrder(562, PATIENTS[0], ['CBC'], 1, { created_at: '2026-06-11T08:00:00Z' }),
  buildOrder(563, PATIENTS[4], ['HbA1c'], 1, { created_at: '2026-06-11T07:30:00Z' }),
  buildOrder(564, PATIENTS[6], ['Lipid Profile'], 1, { created_at: '2026-06-10T16:00:00Z' }),
  buildOrder(565, PATIENTS[8], ['Vitamin D'], 1, { created_at: '2026-06-11T09:00:00Z' }),
  buildOrder(566, PATIENTS[5], ['KFT'], 1, { created_at: '2026-06-11T06:00:00Z' }),

  buildOrder(567, PATIENTS[1], ['Lipid Profile'], 3, { created_at: '2026-06-10T10:00:00Z', assigned_staff: 'Kamal Hossain' }),
  buildOrder(568, PATIENTS[9], ['CBC'], 3, { created_at: '2026-06-10T14:00:00Z', assigned_staff: 'Rashedul Islam' }),

  // Step 3 — Assigned (Sample Collection)
  buildOrder(569, PATIENTS[3], ['HbA1c', 'CBC'], 3, { created_at: '2026-06-09T09:00:00Z', assigned_staff: 'Rashedul Islam', home_collection: true, collection_address: '23 Mirpur Road, Dhaka', collection_slot: 'Morning 8-10 AM' }),

  // Step 4 — Collector Arrived
  buildOrder(570, PATIENTS[1], ['Thyroid Panel'], 4, { created_at: '2026-06-09T11:00:00Z', assigned_staff: 'Farhana Yasmin' }),

  // Step 5 — Sample Collected
  buildOrder(571, PATIENTS[2], ['Lipid Profile'], 5, { created_at: '2026-06-08T10:00:00Z', assigned_staff: 'Kamal Hossain' }),

  // Step 6 — Delivered to Lab
  buildOrder(572, PATIENTS[7], ['CBC', 'LFT'], 6, { created_at: '2026-06-08T08:00:00Z', assigned_staff: 'Rashedul Islam' }),

  // Step 7 — Processing (in lab)
  buildOrder(552, PATIENTS[0], ['CBC'], 7, { created_at: '2026-06-11T08:00:00Z', assigned_staff: 'Dr. S. Rahman' }),
  buildOrder(553, PATIENTS[1], ['Glucose Fasting'], 7, { created_at: '2026-06-11T08:30:00Z', assigned_staff: 'Dr. S. Rahman' }),
  buildOrder(555, PATIENTS[3], ['HbA1c', 'CBC'], 7, { created_at: '2026-06-09T09:00:00Z', assigned_staff: 'Dr. S. Rahman' }),
  buildOrder(559, PATIENTS[7], ['CBC', 'LFT'], 7, { created_at: '2026-06-11T07:00:00Z', assigned_staff: 'Dr. S. Rahman' }),
  buildOrder(561, PATIENTS[9], ['CBC', 'KFT'], 7, { created_at: '2026-06-11T09:00:00Z' }),

  // Step 8 — Ready for Report
  buildOrder(554, PATIENTS[2], ['CBC'], 8, { created_at: '2026-06-10T10:00:00Z', assigned_staff: 'Dr. S. Rahman' }),
  buildOrder(556, PATIENTS[4], ['Lipid Profile'], 8, { created_at: '2026-06-08T11:00:00Z', assigned_staff: 'Dr. S. Rahman' }),
  buildOrder(560, PATIENTS[8], ['Blood Sugar Fasting'], 8, { created_at: '2026-06-10T12:00:00Z', assigned_staff: 'Dr. S. Rahman' }),

  // Step 9 — Completed
  buildOrder(557, PATIENTS[5], ['CBC', 'ESR'], 9, { created_at: '2026-06-05T09:00:00Z', assigned_staff: 'Dr. S. Rahman', result_summary: 'All values within normal range. CBC unremarkable. ESR slightly elevated at 22 mm/hr.' }),
  buildOrder(558, PATIENTS[6], ['Thyroid Panel'], 9, { created_at: '2026-06-03T10:00:00Z', assigned_staff: 'Dr. S. Rahman', result_summary: 'TSH: 2.5 µIU/mL (normal), T3: 120 ng/dL (normal), T4: 8.2 µg/dL (normal). Thyroid function normal.' }),

  // Step 0 — Rejected
  buildOrder(573, PATIENTS[8], ['ECG'], 0, { created_at: '2026-06-09T15:00:00Z', rejection_reason: 'Incomplete documentation', rejection_note: 'Doctor prescription was not attached properly.', rejected_at: '2026-06-09T16:30:00Z' }),
];

let nextOrderId = 600;
let nextReportId = 20;
let nextHistoryId = 20;
let nextTestId = 16;

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

export function getAvatar(index) {
  return AVATARS[index % AVATARS.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchOrderSearch(order, q) {
  return order.patient_name.toLowerCase().includes(q) || order.id.toString().includes(q);
}

function filterOrders(module, status, search) {
  let list = [...ORDERS];
  if (module === 'testqueue') {
    list = list.filter(o => [0, 1, 2].includes(o.demo_step));
    if (status && status !== 'All') {
      if (status === 'New Requests') list = list.filter(o => o.demo_step === 1);
      else if (status === 'Accepted')  list = list.filter(o => o.demo_step === 2);
      else if (status === 'Rejected')  list = list.filter(o => o.demo_step === 0);
    }
  } else if (module === 'samplecollection') {
    list = list.filter(o => [3, 4, 5, 6].includes(o.demo_step));
  } else if (module === 'uploadreports') {
    list = list.filter(o => [7, 8, 9].includes(o.demo_step));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(o => matchOrderSearch(o, q));
  }
  return list;
}

// ─── Orders API ───────────────────────────────────────────────────────────────

export async function fetchOrders(module, status, search) {
  await delay();
  const list = filterOrders(module, status, search);
  return { success: true, data: list };
}

export async function acceptOrder(orderId) {
  await delay();
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return { success: false, error: 'Order not found' };
  if (order.demo_step !== 1) return { success: false, error: 'Order is not in New Request state' };
  order.demo_step = 3;
  order.status = 'Sample Collection';
  order.assigned_staff = 'Dr. S. Rahman';
  return { success: true };
}

export async function rejectOrder(orderId, reason, note) {
  await delay();
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return { success: false, error: 'Order not found' };
  order.demo_step = 0;
  order.status = 'Rejected';
  order.rejection_reason = reason;
  order.rejection_note = note || '';
  order.rejected_at = new Date().toISOString();
  return { success: true };
}

export async function restoreOrder(orderId) {
  await delay();
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return { success: false, error: 'Order not found' };
  if (order.demo_step !== 0) return { success: false, error: 'Only rejected orders can be restored' };
  order.demo_step = 1;
  order.status = 'Requested';
  order.rejection_reason = null;
  order.rejection_note = null;
  order.rejected_at = null;
  return { success: true };
}

export async function advanceOrderStep(orderId) {
  await delay();
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return { success: false, error: 'Order not found' };
  const STEP_LABELS = {
    1: 'Requested', 2: 'Accepted', 3: 'Sample Collection', 4: 'Sample Collection',
    5: 'Sample Collection', 6: 'Sample Collection', 7: 'Processing', 8: 'Ready for Report',
  };
  if (order.demo_step >= 9) return { success: false, error: 'Order already completed' };
  if (order.demo_step === 0) return { success: false, error: 'Cannot advance rejected order' };
  order.demo_step += 1;
  order.status = STEP_LABELS[order.demo_step] || 'Completed';
  return { success: true };
}

export async function assignStaff(orderId, staffName) {
  await delay();
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return { success: false, error: 'Order not found' };
  order.assigned_staff = staffName;
  return { success: true };
}

// ─── Upload Reports API ───────────────────────────────────────────────────────

export async function fetchUploadOrders(activeTab, search) {
  await delay();
  let list = ORDERS.filter(o => [7, 8, 9].includes(o.demo_step));
  if (activeTab === 'Processing') list = list.filter(o => o.demo_step === 7);
  else if (activeTab === 'Ready for Report') list = list.filter(o => o.demo_step === 8);
  else if (activeTab === 'Completed') list = list.filter(o => o.demo_step === 9);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(o => matchOrderSearch(o, q));
  }
  return { success: true, data: list };
}

export async function completeReport(orderId, resultSummary) {
  await delay(500);
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return { success: false, error: 'Order not found' };
  order.demo_step = 9;
  order.status = 'Completed';
  order.result_summary = resultSummary || '';
  const patient = PATIENTS.find(p => p.id === order.patient_id);
  if (patient) {
    const reportId = nextReportId++;
    const historyId = nextHistoryId++;
    const now = new Date().toISOString();
    patient.previous_reports.push({
      id: reportId,
      test_names: [...order.test_names],
      uploaded_at: now,
      uploaded_by: 'Dr. S. Rahman',
      file_url: `/reports/report_${orderId}.pdf`,
      summary: resultSummary || '',
    });
    const pendingIdx = patient.test_history.findIndex(h => h.status === 'Processing' || h.status === 'Requested');
    if (pendingIdx !== -1) {
      patient.test_history[pendingIdx].status = 'Reported';
    } else {
      patient.test_history.push({
        id: historyId,
        test_names: [...order.test_names],
        created_at: now,
        total_amount: String(order.total_amount),
        status: 'Reported',
      });
    }
  }
  return { success: true, data: { fileUrl: `/reports/report_${orderId}.pdf` } };
}

export async function createManualEntry(data) {
  await delay(300);
  const patient = PATIENTS.find(p => p.phone === data.patient_phone) || PATIENTS[0];
  const testNames = data.test_ids && data.test_ids.length > 0
    ? data.test_ids.map(id => { const t = TESTS.find(t => t.id === id); return t ? t.name : 'CBC'; })
    : (data.test_names || ['CBC']);
  const newOrder = buildOrder(nextOrderId++, patient, testNames, 1, {
    created_at: new Date().toISOString(),
    home_collection: data.home_collection || false,
    collection_address: data.collection_address || '',
    collection_slot: data.collection_slot || '',
  });
  ORDERS.push(newOrder);
  return { success: true, data: newOrder };
}

// ─── Patients API ─────────────────────────────────────────────────────────────

export async function fetchPatientsList(search, filters) {
  await delay();
  let list = PATIENTS.map(p => ({
    id: p.id, full_name: p.full_name, phone: p.phone, email: p.email,
    blood_group: p.blood_group, date_of_birth: p.date_of_birth, address: p.address,
    gender: p.gender, registration_date: p.registration_date,
  }));
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.full_name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    );
  }
  if (filters.gender) {
    list = list.filter(p => p.gender === filters.gender);
  }
  if (filters.sort === 'recent') {
    list = [...list].sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date));
  }
  if (filters.hasReports) {
    const withReports = new Set();
    PATIENTS.forEach(p => {
      if (p.previous_reports.length > 0) withReports.add(p.id);
    });
    list = list.filter(p => withReports.has(p.id));
  }
  return { success: true, data: list };
}

export async function fetchPatientProfile(id) {
  await delay(300);
  const patient = PATIENTS.find(p => p.id === id);
  if (!patient) return { success: false, error: 'Patient not found' };
  return {
    success: true,
    data: {
      profile: {
        full_name: patient.full_name, phone: patient.phone, email: patient.email,
        blood_group: patient.blood_group, date_of_birth: patient.date_of_birth,
        address: patient.address, gender: patient.gender, registration_date: patient.registration_date,
      },
      history: patient.test_history,
      reports: patient.previous_reports,
    },
  };
}

// ─── Test Management API ──────────────────────────────────────────────────────

export async function getAllTests(category, search) {
  await delay();
  let list = [...TESTS];
  if (category && category !== 'All') {
    list = list.filter(t => t.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(t => t.name.toLowerCase().includes(q));
  }
  return { success: true, data: list };
}

export async function saveTest(testData) {
  await delay(300);
  if (testData.id) {
    const idx = TESTS.findIndex(t => t.id === testData.id);
    if (idx === -1) return { success: false, error: 'Test not found' };
    TESTS[idx] = { ...TESTS[idx], ...testData, price: parseFloat(testData.price) };
    return { success: true, data: TESTS[idx] };
  }
  const newTest = {
    id: nextTestId++,
    ...testData,
    price: parseFloat(testData.price),
  };
  TESTS.push(newTest);
  return { success: true, data: newTest };
}

export async function deleteTest(testId) {
  await delay();
  const idx = TESTS.findIndex(t => t.id === testId);
  if (idx === -1) return { success: false, error: 'Test not found' };
  TESTS.splice(idx, 1);
  return { success: true };
}

// ─── Dashboard API ────────────────────────────────────────────────────────────

export async function fetchDashboard() {
  await delay(300);
  const today = new Date().toISOString().slice(0, 10);
  const todaysOrders = ORDERS.filter(o => o.created_at && o.created_at.slice(0, 10) === today);
  const todaysTests = todaysOrders.reduce((sum, o) => sum + (o.test_names?.length || 0), 0);
  const pendingOrders = ORDERS.filter(o => o.demo_step >= 1 && o.demo_step <= 7);
  const pendingTests = pendingOrders.reduce((sum, o) => sum + (o.test_names?.length || 0), 0);
  const completedOrders = ORDERS.filter(o => o.demo_step >= 8);
  const completedTests = completedOrders.reduce((sum, o) => sum + (o.test_names?.length || 0), 0);
  const totalRevenue = ORDERS
    .filter(o => o.demo_step === 9)
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  const recentActivities = [...ORDERS]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  const statusCounts = {};
  ORDERS.forEach(o => {
    const label = o.demo_step === 0 ? 'Cancelled'
                : o.demo_step === 1 ? 'Requested'
                : o.demo_step === 2 ? 'AcceptedByLab'
                : o.demo_step <= 6 ? 'SampleCollected'
                : o.demo_step === 7 ? 'Processing'
                : o.demo_step === 8 ? 'Processing'
                : 'Reported';
    statusCounts[label] = (statusCounts[label] || 0) + 1;
  });
  const statusStats = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  return {
    success: true,
    data: {
      todaysTests,
      pendingTests,
      completedTests,
      totalRevenue,
      recentActivities,
      statusStats,
    },
  };
}

// ─── Earnings API ─────────────────────────────────────────────────────────────

export async function fetchEarnings() {
  await delay(300);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Compute period revenues
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let daily = 0, weekly = 0, monthly = 0, allTime = 0;
  ORDERS.filter(o => o.demo_step === 9).forEach(o => {
    const d = new Date(o.created_at);
    const amount = o.total_amount || 0;
    if (d >= dayStart) daily += amount;
    if (d >= weekStart) weekly += amount;
    if (d >= monthStart) monthly += amount;
    allTime += amount;
  });

  // 7-day analytics
  const analytics = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    const total = ORDERS
      .filter(o => o.demo_step === 9 && o.created_at && o.created_at.slice(0, 10) === dayStr)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    analytics.push({ day: dayStr, total: String(total) });
  }

  // Test-wise revenue breakdown
  const testRevenue = {};
  ORDERS.filter(o => o.demo_step === 9).forEach(o => {
    const perTest = (o.total_amount || 0) / (o.test_names.length || 1);
    o.test_names.forEach(name => {
      if (!testRevenue[name]) testRevenue[name] = { total_revenue: 0, test_count: 0 };
      testRevenue[name].total_revenue += perTest;
      testRevenue[name].test_count += 1;
    });
  });
  const testBreakdown = Object.entries(testRevenue).map(([name, data]) => ({
    name,
    total_revenue: String(Math.round(data.total_revenue)),
    test_count: data.test_count,
  }));

  // Transactions from completed orders
  const transactions = ORDERS
    .filter(o => o.demo_step === 9)
    .map((o, i) => ({
      id: 1000 + i,
      transaction_id: `TXN-${String(1000 + i).padStart(6, '0')}`,
      patient_name: o.patient_name,
      order_id: o.id,
      amount: String(o.total_amount || 0),
      gateway: ['bKash', 'Nagad', 'SSLCommerz'][i % 3],
      paid_at: o.created_at,
      status: 'Paid',
    }));

  return {
    success: true,
    data: {
      daily,
      weekly,
      monthly,
      all_time: allTime,
      analytics,
      testBreakdown,
      transactions,
    },
  };
}
