const testApi = async () => {
  const baseUrl = 'http://localhost:5000/api';
  let doctorToken = '';
  let patientId = '';

  const logResult = (route, status, data) => {
    console.log(`\n--- [${route}] ---`);
    console.log(`Status: ${status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
  };

  try {
    // 1. Auth: Register
    let res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test${Date.now()}@test.com`, password: 'password', name: 'Dr. Test' })
    });
    let data = await res.json();
    logResult('POST /api/auth/register', res.status, data);

    // 2. Auth: Login
    res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: 'password' })
    });
    data = await res.json();
    doctorToken = data.token;
    logResult('POST /api/auth/login', res.status, data);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${doctorToken}`
    };

    // 3. Patients: Create
    res = await fetch(`${baseUrl}/patients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'John Doe Test', age: 30, gender: 'Male' })
    });
    data = await res.json();
    patientId = data.id;
    logResult('POST /api/patients', res.status, data);

    // 4. Patients: Get All
    res = await fetch(`${baseUrl}/patients`, { headers });
    data = await res.json();
    logResult('GET /api/patients', res.status, data);

    // 5. Patients: Get Single
    res = await fetch(`${baseUrl}/patients/${patientId}`, { headers });
    data = await res.json();
    logResult(`GET /api/patients/${patientId}`, res.status, data);

    // 6. Reports: Add
    res = await fetch(`${baseUrl}/reports/patient/${patientId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'Blood Test', date: new Date().toISOString() })
    });
    data = await res.json();
    logResult('POST /api/reports/patient/:id', res.status, data);

    // 7. Reports: Get
    res = await fetch(`${baseUrl}/reports/patient/${patientId}`, { headers });
    data = await res.json();
    logResult('GET /api/reports/patient/:id', res.status, data);

    // 8. Prescriptions: Add
    res = await fetch(`${baseUrl}/prescriptions/patient/${patientId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ medications: ['Paracetamol 500mg'], date: new Date().toISOString() })
    });
    data = await res.json();
    logResult('POST /api/prescriptions/patient/:id', res.status, data);

    // 9. Prescriptions: Get
    res = await fetch(`${baseUrl}/prescriptions/patient/${patientId}`, { headers });
    data = await res.json();
    logResult('GET /api/prescriptions/patient/:id', res.status, data);

    // 10. Test Unauthorized (Fail test)
    res = await fetch(`${baseUrl}/patients`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' } // Missing Bearer token
    });
    data = await res.json();
    logResult('GET /api/patients (UNAUTHORIZED TEST)', res.status, data);

  } catch (err) {
    console.error('Test script failed:', err);
  }
};

testApi();
