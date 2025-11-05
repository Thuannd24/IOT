// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastProvider } from './contexts/ToastContext';
// import Layout from './components/Layout/Layout';
// import Dashboard from './pages/Dashboard';
// import Students from './pages/Students';
// import Attendance from './pages/Attendance';
// import Camera from './pages/Camera';
// import Settings from './pages/Settings';
// import './App.css';

// export default function App() {
//   return (
//     <Router>
//       <ToastProvider>
//         <Routes>
//           <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           <Route
//             path="/dashboard"
//             element={
//               <Layout>
//                 <Dashboard />
//               </Layout>
//             }
//           />
//           <Route
//             path="/students"
//             element={
//               <Layout>
//                 <Students />
//               </Layout>
//             }
//           />
//           <Route
//             path="/attendance"
//             element={
//               <Layout>
//                 <Attendance />
//               </Layout>
//             }
//           />
//           <Route
//             path="/camera"
//             element={
//               <Layout>
//                 <Camera />
//               </Layout>
//             }
//           />
//           <Route
//             path="/settings"
//             element={
//               <Layout>
//                 <Settings />
//               </Layout>
//             }
//           />
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </ToastProvider>
//     </Router>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";

/**
 * NEW FRONTEND — SINGLE FILE (React + Tailwind)
 * -------------------------------------------------
 * Usage (quick):
 * 1) Ensure backend runs on http://localhost:5000 (or set VITE_API_URL)
 * 2) In FE project (Vite), replace App.jsx with this file content.
 * 3) Make sure Tailwind is enabled in your project (postcss + tailwindcss configured).
 * 4) Run: npm run dev
 *
 * This single-file app includes:
 * - Clean layout (Header + Sidebar)
 * - Pages: Dashboard, Students (CRUD), Attendance (read-only), Camera (stream URL)
 * - API wrapper for /api/* endpoints
 * - Toasts + Modals (vanilla)
 *
 * You can later split components into files.
 */

// -----------------------------
// Small helpers
// -----------------------------
const API_BASE = import.meta?.env?.VITE_API_URL || "http://localhost:5000";

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
  return res.json();
}
async function apiJson(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {})
  });
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}`);
  return res.json();
}

const StudentsAPI = {
  list: () => apiGet('/api/students'),
  // create: (payload) => apiJson('/api/students', 'POST', payload),
  create: (payload) => {
    if (payload instanceof FormData) {
      return fetch(`${API_BASE}/api/students`, {
        method: 'POST',
        body: payload,
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `POST /api/students ${res.status}`);
        }
        return res.json();
      });
    }
    return apiJson('/api/students', 'POST', payload);
  },
  update: (id, payload) => apiJson(`/api/students/${id}`, 'PUT', payload),
  uploadAvatar: (id, file) => {
    const fd = new FormData();
    fd.append('avatar', file);
    return fetch(`${API_BASE}/api/students/${id}/avatar`, {
      method: 'POST',
      body: fd,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `POST /api/students/${id}/avatar ${res.status}`);
      }
      return res.json();
    });
  },
  remove: (id) => apiJson(`/api/students/${id}`, 'DELETE'),
};

const AttendanceAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiGet(`/api/attendance${q ? `?${q}` : ''}`);
  }
};

// -----------------------------
// UI bits
// -----------------------------
function Header({ onToggleSidebar }) {
  return (
    <div className="h-14 border-b bg-white/70 backdrop-blur flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <button onClick={onToggleSidebar} className="p-2 rounded-xl hover:bg-gray-100" aria-label="Toggle sidebar">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div className="font-semibold">IOT-main — New Frontend</div>
      </div>
      <div className="text-sm text-gray-500">API: {API_BASE}</div>
    </div>
  );
}

function Sidebar({ current, setCurrent, open }) {
  const link = (key, label) => (
    <button
      onClick={() => setCurrent(key)}
      className={`w-full text-left px-4 py-2 rounded-xl transition ${current===key ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
    >{label}</button>
  );
  return (
    <div className={`transition-all ${open ? 'w-64' : 'w-0 md:w-64'} overflow-hidden md:overflow-auto`}>
      <div className="p-3 h-[calc(100vh-3.5rem)] border-r bg-white flex flex-col gap-2">
        {link('dashboard','Dashboard')}
        {link('students','Students')}
        {link('attendance','Attendance')}
        {link('camera','Camera')}
        <div className="mt-auto text-xs text-gray-400 px-2">© {new Date().getFullYear()} New UI</div>
      </div>
    </div>
  );
}

function Page({ title, children, actions }) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex gap-2">{actions}</div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border p-4">{children}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-4 rounded-2xl bg-gray-50 border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

// -----------------------------
// Pages
// -----------------------------
function DashboardPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    apiGet('/api/health').then(setHealth).catch(setError).finally(()=>setLoading(false));
  }, []);
  return (
    <Page title="Dashboard">
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-red-600">{String(error)}</div>}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat label="Students" value={health.students} />
          <Stat label="Attendance logs" value={health.attendance} />
          <Stat label="API OK" value={health.ok ? 'Yes' : 'No'} />
        </div>
      )}
    </Page>
  );
}

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await StudentsAPI.list();
      setStudents(data);
    } catch (e) { setError(e) } finally { setLoading(false) }
  }
  useEffect(()=>{ load(); }, []);

  const [studentCode, setStudentCode] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  async function handleSubmit(e) {
    // e.preventDefault();
    // if (!name.trim() || !studentCode.trim()) return alert('Nhập student code và name');
    // if (editing){
    // await StudentsAPI.update(editing.id,{ studentCode, name, className });
    // if (avatarFile){ await StudentsAPI.uploadAvatar(editing.id, avatarFile); }
    // } else {
    // const fd = new FormData();
    // fd.append('studentCode', studentCode);
    // fd.append('name', name);
    // fd.append('className', className);
    // if (avatarFile) fd.append('avatar', avatarFile);
    // await StudentsAPI.create(fd);
    // }
    // setStudentCode(""); setName(""); setClassName(""); setAvatarFile(null); await load();
     e.preventDefault();
    if (!name.trim() || !studentCode.trim())
      return alert('Nhập student code và name');
    setSaving(true);
    try {
      if (editing) {
        // 👉 update text fields
        await StudentsAPI.update(editing.id, {
          studentCode,
          name,
          className,
        });

        // 👉 nếu chọn file mới, upload avatar
        if (avatarFile) {
          await StudentsAPI.uploadAvatar(editing.id, avatarFile);
        }

        setEditing(null);
      } else {
        // 👉 tạo mới dùng FormData (gửi luôn avatar)
        const fd = new FormData();
        fd.append('studentCode', studentCode);
        fd.append('name', name);
        fd.append('className', className);
        if (avatarFile) fd.append('avatar', avatarFile);
        await StudentsAPI.create(fd);
      }

      // reset form
      setStudentCode('');
      setName('');
      setClassName('');
      setAvatarFile(null);

      await load(); // reload danh sách
    } catch (err) {
      alert(err.message || err);
    } finally {
      setSaving(false);
    }
  }
  
  function startEdit(s) {
    setEditing(s);
    setStudentCode(s.studentCode || '');
    setName(s.name);
    setClassName(s.className || "");
    setAvatarFile(s.avatarFile || null);
  }

  async function remove(id) {
    if (!confirm('Delete this student?')) return;
    await StudentsAPI.remove(id);
    await load();
  }

  return (
    <Page
      title="Students"
      actions={
        <button
          onClick={() => {
            setEditing(null);
            setStudentCode('');
            setName('');
            setClassName('');
            setAvatarFile(null);
          }}
          className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50"
        >
          New
        </button>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
        {/* Mã sinh viên (bắt buộc) */}
        <input
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
          placeholder="Student code"
          className="px-3 py-2 rounded-xl border"
        />
        {/* Tên sinh viên (bắt buộc) */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Student name"
          className="px-3 py-2 rounded-xl border"
        />
        {/* Lớp (tuỳ chọn) */}
        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Class name (optional)"
          className="px-3 py-2 rounded-xl border"
        />
        {/* Ảnh avatar (tuỳ chọn) */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          className="px-3 py-2 rounded-xl border"
        />

        <button
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-60"
        >
          {editing ? 'Save' : 'Add'}
        </button>

        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setStudentCode('');
              setName('');
              setClassName('');
              setAvatarFile(null);
            }}
            className="px-4 py-2 rounded-xl border"
          >
            Cancel
          </button>
        )}
      </form>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-red-600">{String(error)}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {students.map((s) => {
          // 👇 Thêm dòng này để ghép đường dẫn ảnh đầy đủ
          const avatarSrc = s.avatarUrl
            ? (s.avatarUrl.startsWith('http')
                ? s.avatarUrl
                : `${API_BASE}${s.avatarUrl}`)
            : null;

          return (
            <div key={s.id} className="p-4 rounded-2xl border bg-white flex flex-col gap-2">
              {/* Hiển thị avatar */}
              {avatarSrc && (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover border"
                />
              )}

              <div className="font-medium">{s.name}</div>
              <div className="text-sm text-gray-500">{s.className || '—'}</div>
              <div className="text-xs text-gray-500">Code: {s.studentCode || '—'}</div>
              <div className="text-xs text-gray-400">#{s.id}</div>

              <div className="flex gap-2 mt-2">
                <button onClick={() => startEdit(s)} className="px-3 py-1.5 rounded-xl border">
                  Edit
                </button>
                <button
                  onClick={() => remove(s.id)}
                  className="px-3 py-1.5 rounded-xl border bg-red-50 text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
//   return (
//     <Page title="Students" actions={
//       <button onClick={()=>{setEditing(null); setName(""); setClassName("")}} className="px-3 py-2 rounded-xl border bg-white hover:bg-gray-50">New</button>
//     }>
//       <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
//         <input value={name} onChange={e=>setName(e.target.value)} placeholder="Student name" className="px-3 py-2 rounded-xl border"/>
//         <input value={className} onChange={e=>setClassName(e.target.value)} placeholder="Class name (optional)" className="px-3 py-2 rounded-xl border"/>
//         <button disabled={saving} className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-60">
//           {editing ? 'Save' : 'Add'}
//         </button>
//         {editing && (
//           <button type="button" onClick={()=>{setEditing(null); setName(""); setClassName("")}} className="px-4 py-2 rounded-xl border">Cancel</button>
//         )}
//       </form>

//       {loading && <div className="text-sm text-gray-500">Loading…</div>}
//       {error && <div className="text-sm text-red-600">{String(error)}</div>}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//         {students.map(s => (
//           <div key={s.id} className="p-4 rounded-2xl border bg-white flex flex-col gap-2">
//             <div className="font-medium">{s.name}</div>
//             <div className="text-sm text-gray-500">{s.className || '—'}</div>
//             <div className="text-xs text-gray-400">#{s.id}</div>
//             <div className="flex gap-2 mt-2">
//               <button onClick={()=>startEdit(s)} className="px-3 py-1.5 rounded-xl border">Edit</button>
//               <button onClick={()=>remove(s.id)} className="px-3 py-1.5 rounded-xl border bg-red-50 text-red-700">Delete</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </Page>
//   );
}

function AttendancePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState("");
  const [date, setDate] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await AttendanceAPI.list({ className, date });
      setItems(data);
    } finally { setLoading(false) }
  }
  useEffect(()=>{ load(); }, []);

  return (
    <Page title="Attendance" actions={
      <div className="flex gap-2">
        <input value={className} onChange={e=>setClassName(e.target.value)} placeholder="Filter by class" className="px-3 py-2 rounded-xl border"/>
        <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-3 py-2 rounded-xl border"/>
        <button onClick={load} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Refresh</button>
      </div>
    }>
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Time</th>
              <th className="py-2">Student</th>
              <th className="py-2">Class</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={`${it.id}-${it.timestamp}`} className="border-t">
                <td className="py-2">{new Date(it.timestamp).toLocaleString()}</td>
                <td className="py-2">{it.studentName}</td>
                <td className="py-2">{it.className}</td>
                <td className="py-2">{it.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

function CameraPage() {
  const url = import.meta?.env?.VITE_CAMERA_STREAM_URL || "";
  return (
    <Page title="Camera" actions={
      <a className="px-3 py-2 rounded-xl border" href={url} target="_blank" rel="noreferrer">Open Stream</a>
    }>
      {!url && <div className="text-sm text-gray-500">Set VITE_CAMERA_STREAM_URL in .env to preview stream.</div>}
      {url && (
        <div className="flex justify-center">
          {/* MJPEG image preview; for HLS you can integrate hls.js later */}
          <img src={url} alt="Live" className="max-h-[70vh] rounded-2xl border" />
        </div>
      )}
    </Page>
  );
}

// -----------------------------
// Main App
// -----------------------------
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState('dashboard');

  const Current = useMemo(() => {
    switch (page) {
      case 'students': return <StudentsPage/>;
      case 'attendance': return <AttendancePage/>;
      case 'camera': return <CameraPage/>;
      default: return <DashboardPage/>;
    }
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header onToggleSidebar={()=>setSidebarOpen(s=>!s)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} current={page} setCurrent={setPage} />
        <div className="flex-1">{Current}</div>
      </div>
    </div>
  );
}
