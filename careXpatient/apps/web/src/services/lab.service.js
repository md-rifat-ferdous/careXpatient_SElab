const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Types ─────────────────────────────────────────────────────────────────────


































































































// ── API helpers ───────────────────────────────────────────────────────────────

async function get(path, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function getLabPatients(
token,
page = 1,
search = '',
limit = 10)
{
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {})
  });
  return get(`/api/lab/patients?${params}`, token);
}

export async function getPatientHistory(
token,
patientId)
{
  return get(`/api/lab/patients/${patientId}/history`, token);
}

export async function getPendingUploads(
token,
page = 1,
limit = 20)
{
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return get(`/api/lab/pending-uploads?${params}`, token);
}

export async function uploadReport(
token,
payload)
{
  const formData = new FormData();
  formData.append('labOrderId', payload.labOrderId);
  formData.append('summary', payload.summary);
  formData.append('findings', payload.findings);
  formData.append('impression', payload.impression);
  formData.append('recommendations', payload.recommendations);
  if (payload.file) {
    formData.append('file', payload.file);
  }

  const res = await fetch(`${BASE_URL}/api/lab/upload-report`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Upload failed');
  return data;
}