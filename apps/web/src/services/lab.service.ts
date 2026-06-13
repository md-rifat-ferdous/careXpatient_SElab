const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchLabDashboard(userId: string, token: string) {
  return fetchApi(`/api/lab/dashboard?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchLabOrders(userId: string, token: string, params: { module?: string; status?: string; search?: string } = {}) {
  const qs = new URLSearchParams({ userId, ...params }).toString();
  return fetchApi(`/api/lab/orders?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function advanceOrderStep(orderId: string, userId: string, token: string) {
  return fetchApi(`/api/lab/orders/${orderId}/advance?userId=${userId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function assignStaff(orderId: string, staffName: string, userId: string, token: string) {
  return fetchApi(`/api/lab/orders/${orderId}/assign?userId=${userId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ staffName }),
  });
}

export async function rejectOrder(orderId: string, reason: string, note: string | undefined, userId: string, token: string) {
  return fetchApi(`/api/lab/orders/${orderId}/reject?userId=${userId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason, note }),
  });
}

export async function restoreOrder(orderId: string, userId: string, token: string) {
  return fetchApi(`/api/lab/orders/${orderId}/restore?userId=${userId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createManualEntry(data: any, userId: string, token: string) {
  return fetchApi(`/api/lab/orders/manual-entry?userId=${userId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function fetchLabPatients(userId: string, token: string, search = '') {
  const qs = new URLSearchParams({ userId, search }).toString();
  return fetchApi(`/api/lab/patients?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchPatientProfile(patientUserId: string, userId: string, token: string) {
  return fetchApi(`/api/lab/patients/${patientUserId}?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadReportFile(file: File, token: string) {
  const formData = new FormData();
  formData.append('reportFile', file);
  return fetch(`${API_BASE}/api/lab/reports/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(r => r.json());
}

export async function verifyReport(orderId: string, fileUrl: string, resultSummary: string | undefined, uploadedBy: string | undefined, userId: string, token: string) {
  return fetchApi(`/api/lab/reports/verify?userId=${userId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId, fileUrl, resultSummary, uploadedBy }),
  });
}

export async function sendReport(orderId: string, sentTo: string, channel: string, userId: string, token: string) {
  return fetchApi(`/api/lab/reports/send?userId=${userId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId, sentTo, channel }),
  });
}

export async function fetchEarnings(userId: string, token: string) {
  return fetchApi(`/api/lab/earnings?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchLabSettings(userId: string, token: string) {
  return fetchApi(`/api/lab/settings?userId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateLabProfile(data: any, userId: string, token: string) {
  return fetchApi(`/api/lab/settings/profile?userId=${userId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function changeLabPassword(currentPassword: string, newPassword: string, userId: string, token: string) {
  return fetchApi(`/api/lab/settings/change-password?userId=${userId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function fetchAllLabTests(userId: string, token: string, category?: string, search?: string) {
  const qs = new URLSearchParams({ userId });
  if (category && category !== 'All') qs.set('category', category);
  if (search) qs.set('search', search);
  return fetchApi(`/api/lab-tests?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createLabTest(data: any, token: string) {
  return fetchApi(`/api/lab-tests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function updateLabTest(id: string, data: any, token: string) {
  return fetchApi(`/api/lab-tests/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function deleteLabTest(id: string, token: string) {
  return fetchApi(`/api/lab-tests/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
