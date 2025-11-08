// src/services/api.js
import axios from "axios";

/**
 * Base URL:
 * - Ưu tiên biến môi trường (Vite): VITE_API_URL (vd: http://localhost:5000/api)
 * - Fallback: http://localhost:5000/api
 */
const API_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  window.__API_URL__ ||
  "http://127.0.0.1:5000/api";

// Ví dụ: API_URL = http://localhost:5000/api  ->  API_ROOT = http://localhost:5000
const API_ROOT = API_URL.replace(/\/api\/?$/, "");

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
  timeout: 20000,
});

// Attach token nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Helpers ---------------------------------------------------------------

// Build absolute URL cho các path kiểu "/static/..."
export function absUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  try {
    new URL(pathOrUrl); // absolute URL hợp lệ
    return pathOrUrl;
  } catch {
    return pathOrUrl.startsWith("/")
      ? `${API_ROOT}${pathOrUrl}`
      : `${API_ROOT}/${pathOrUrl}`;
  }
}

// Convert object -> FormData cho /api/students
function toStudentFormData(data) {
  if (data instanceof FormData) return data;
  const fd = new FormData();
  if (data?.msv) fd.append("msv", data.msv);
  if (data?.full_name) fd.append("full_name", data.full_name);
  if (data?.encoding) fd.append("encoding", data.encoding);
  if (data?.imageFile) {
    const file =
      data.imageFile instanceof File
        ? data.imageFile
        : new File([data.imageFile], "capture.jpg", { type: "image/jpeg" });
    fd.append("image", file);
  }
  return fd;
}

// Gửi ảnh tới /api/recognitions
async function postRecognition(image, { mode = "multipart", signal } = {}) {
  if (mode === "raw") {
    const headers = { "Content-Type": "image/jpeg" };
    return api.post("/recognitions", image, { headers, signal });
  }
  const fd = new FormData();
  const file =
    image instanceof File
      ? image
      : new File([image], "frame.jpg", { type: "image/jpeg" });
  fd.append("file", file);
  return api.post("/recognitions", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
  });
}

// ---- APIs ------------------------------------------------------------------

// Students
export const studentAPI = {
  // GET /api/students
  getAll: ({ signal } = {}) => api.get("/students", { signal }),

  // POST /api/students  (FormData hoặc object { msv, full_name, imageFile })
  create: (data, { signal } = {}) => {
    const formData = toStudentFormData(data);
    return api.post("/students", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
    });
  },

  // ➕ PUT /api/students/:id  (FormData tương tự create; hỗ trợ thay ảnh)
  update: (id, data, { signal } = {}) => {
    const formData = toStudentFormData(data);
    return api.put(`/students/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
    });
  },

  // ➕ DELETE /api/students/:id
  remove: (id, { signal } = {}) => api.delete(`/students/${id}`, { signal }),
};

// Recognition
export const recogAPI = {
  // POST /api/recognitions
  recognize: (image, opts) => postRecognition(image, opts),
};

// Misc
export const miscAPI = {
  // POST /api/reload
  reload: ({ signal } = {}) => api.post("/reload", null, { signal }),
  // GET /api/health
  health: ({ signal } = {}) => api.get("/health", { signal }),
};

// Attendance
export const attendanceAPI = {
  // GET /api/attendance?date=&session=&status=  (hoặc ?session_id=)
  list: (params = {}, { signal } = {}) =>
    api.get("/attendance", { params, signal }),

  // GET /api/attendance/absent?date=&session=
  absent: (params = {}, { signal } = {}) =>
    api.get("/attendance/absent", { params, signal }),
};

// Sessions
export const sessionsAPI = {
  // POST /api/sessions
  create: (body, { signal } = {}) => api.post("/sessions", body, { signal }),

  // POST /api/sessions/finalize
  finalize: ({ signal } = {}) =>
    api.post("/sessions/finalize", null, { signal }),

  // GET /api/sessions?date=YYYY-MM-DD
  list: (params = {}, { signal } = {}) =>
    api.get("/sessions", { params, signal }),

  // GET /api/sessions/:id/stats
  stats: (id, { signal } = {}) => api.get(`/sessions/${id}/stats`, { signal }),
};

// Re-exports
export { api, API_URL, API_ROOT };
