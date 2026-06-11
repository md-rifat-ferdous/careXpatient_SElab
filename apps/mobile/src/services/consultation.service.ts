const API_URL = 'http://localhost:5000/api';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function startConsultationApi(appointmentId: string, token: string): Promise<any> {
  const res = await fetch(`${API_URL}/consultations/${appointmentId}/start`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to start consultation');
  return res.json();
}

export async function joinConsultationApi(appointmentId: string, token: string): Promise<any> {
  const res = await fetch(`${API_URL}/consultations/${appointmentId}/join`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to join consultation');
  return res.json();
}

export async function endConsultationApi(appointmentId: string, token: string): Promise<any> {
  const res = await fetch(`${API_URL}/consultations/${appointmentId}/end`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to end consultation');
  return res.json();
}

export async function sendChatMessageApi(
  appointmentId: string,
  message: string,
  token: string
): Promise<any> {
  const res = await fetch(`${API_URL}/consultations/${appointmentId}/chat`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function getChatHistoryApi(appointmentId: string, token: string): Promise<any> {
  const res = await fetch(`${API_URL}/consultations/${appointmentId}/chat`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch chat history');
  return res.json();
}

export async function uploadFileApi(
  appointmentId: string,
  file: any,
  token: string
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/consultations/${appointmentId}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return res.json();
}

export async function getFilesApi(appointmentId: string, token: string): Promise<any> {
  const res = await fetch(`${API_URL}/consultations/${appointmentId}/files`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch files');
  return res.json();
}
