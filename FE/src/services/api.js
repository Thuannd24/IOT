const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiGet(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}

export async function apiJson(path, method, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}`);
  return res.json();
}

// Students
export const StudentsAPI = {
  list: () => apiGet('/api/students'),
  create: (payload) => apiJson('/api/students', 'POST', payload),
  update: (id, payload) => apiJson(`/api/students/${id}`, 'PUT', payload),
  remove: (id) => apiJson(`/api/students/${id}`, 'DELETE'),
};

// Attendance
export const AttendanceAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiGet(`/api/attendance${q ? `?${q}` : ''}`);
  },
  checkin: (studentId, status='present') => apiJson('/api/attendance/checkin', 'POST', { studentId, status }),
};

// Recognitions
export const RecognitionsAPI = {
  recent: (limit=20) => apiGet(`/api/recognitions?limit=${limit}`),
  health: () => apiGet('/api/health'),
};
