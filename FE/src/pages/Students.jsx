// src/pages/Students.jsx
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import StudentList from "../components/Students/StudentList";
import AddStudentModal from "../components/Students/AddStudentModal";
import Button from "../components/common/Button";
import { useToast } from "../contexts/ToastContext";
import { studentAPI, API_ROOT } from "../services/api";

const absUrl = (u) => {
  if (!u) return "";
  try {
    new URL(u);
    return u;
  } catch {
    return u.startsWith("/") ? `${API_ROOT}${u}` : `${API_ROOT}/${u}`;
  }
};

const toFormData = (data) => {
  if (data instanceof FormData) return data;
  const fd = new FormData();
  if (data?.msv) fd.append("msv", data.msv);
  if (data?.full_name) fd.append("full_name", data.full_name);
  if (data?.imageFile) {
    const file =
      data.imageFile instanceof File
        ? data.imageFile
        : new File([data.imageFile], "capture.jpg", { type: "image/jpeg" });
    fd.append("image", file);
  }
  return fd;
};

const normalize = (rows) =>
  (rows || []).map((s) => ({
    id: s.id,
    studentCode: s.studentCode || s.msv,
    full_name: s.full_name,
    image_url: absUrl(s.image_url),
    created_at: s.created_at || "",
  }));

const Students = () => {
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); // ➕
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchStudents = async (signal) => {
    try {
      const res = await studentAPI.getAll({ signal });
      const list = res?.data?.data || [];
      setStudents(normalize(list));
    } catch (e) {
      if (e?.name !== "CanceledError" && e?.message !== "canceled") {
        console.error("Fetch students error:", e);
        toast.error("Không thể tải danh sách sinh viên.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchStudents(controller.signal);
    return () => controller.abort();
  }, []);

  // Thêm mới
  const handleAddStudent = async (data) => {
    try {
      setLoading(true);
      const formData = toFormData(data);
      await studentAPI.create(formData);
      await fetchStudents();
      setIsModalOpen(false);
      toast.success("Thêm sinh viên thành công!");
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error("MSV đã tồn tại!");
      } else {
        toast.error("Không thể thêm sinh viên. Vui lòng thử lại!");
      }
      setLoading(false);
    }
  };

  // ➕ Sửa
  const handleEditStudent = (student) => {
    setEditingStudent(student); // mở modal ở chế độ edit
    setIsModalOpen(true);
  };

  // ➕ Submit cho chế độ edit
  const handleSubmit = async (data) => {
    // nếu có editingStudent -> update, ngược lại -> create
    if (editingStudent) {
      try {
        setLoading(true);
        const formData = toFormData(data);
        await studentAPI.update(editingStudent.id, formData);
        await fetchStudents();
        setIsModalOpen(false);
        setEditingStudent(null);
        toast.success("Cập nhật sinh viên thành công!");
      } catch (err) {
        console.error("Update student error", err);
        toast.error("Không thể cập nhật sinh viên.");
        setLoading(false);
      }
    } else {
      await handleAddStudent(data);
    }
  };

  // ➕ Xóa
  const handleDeleteStudent = async (student) => {
    const ok = window.confirm(`Xóa sinh viên "${student.full_name}"?`);
    if (!ok) return;
    try {
      setLoading(true);
      await studentAPI.remove(student.id);
      await fetchStudents();
      toast.success("Đã xóa sinh viên.");
    } catch (err) {
      console.error("Delete student error", err);
      toast.error("Không thể xóa sinh viên.");
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return students;
    return students.filter(
      (s) =>
        (s.full_name || "").toLowerCase().includes(key) ||
        (s.studentCode || "").toLowerCase().includes(key)
    );
  }, [q, students]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--primary-color)" }}
        >
          Quản lý Sinh viên
        </h1>
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button
            variant="primary"
            onClick={() => {
              setEditingStudent(null);
              setIsModalOpen(true);
            }}
          >
            Thêm sinh viên
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg">
        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc MSV..."
                className="input-search pl-10"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* List / Skeleton */}
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded" />
          </div>
        ) : (
          <StudentList
            students={filtered}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        )}
      </div>

      {/* Add/Edit Student Modal */}
      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleSubmit}
        // hai prop dưới đây là tùy chọn, nếu modal có hỗ trợ sẽ tự fill form
        initialData={editingStudent || undefined}
        mode={editingStudent ? "edit" : "create"}
      />
    </div>
  );
};

export default Students;
