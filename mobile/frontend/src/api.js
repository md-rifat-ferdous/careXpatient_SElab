// Centralised API client — all calls go to the mobile backend on :5001 via Vite proxy
const BASE = '/api/mobile';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return res.json();
}

// ── Orders ──────────────────────────────────────────────────────────────────
export const api = {
  // GET /api/mobile/orders?module=&status=&search=
  getOrders(params = {}) {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    );
    return request(`/orders?${qs}`);
  },

  // PATCH /api/mobile/orders/:id/advance
  advance(id) {
    return request(`/orders/${id}/advance`, { method: 'PATCH' });
  },

  // PATCH /api/mobile/orders/:id/assign   { staff_name }
  assign(id, staff_name) {
    return request(`/orders/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ staff_name }),
    });
  },

  // PATCH /api/mobile/orders/:id/reject   { reason, note }
  reject(id, reason, note = '') {
    return request(`/orders/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason, note }),
    });
  },

  // PATCH /api/mobile/orders/:id/restore
  restore(id) {
    return request(`/orders/${id}/restore`, { method: 'PATCH' });
  },

  // POST /api/mobile/orders/manual-entry
  manualEntry(payload) {
    return request(`/orders/manual-entry`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // GET /api/mobile/tests
  getTests() {
    return request('/tests');
  },
};
