import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AttendanceTable from "../components/Attendance/AttendanceTable";
import AttendanceFilter from "../components/Attendance/AttendanceFilter";
import { attendanceAPI, sessionsAPI } from "../services/api";

const Attendance = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("sessionId"); // nếu đi từ trang phiên
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await attendanceAPI.list({
        ...filters,
        session_id: sessionId || undefined,
      });
      const rows = res?.data?.data || [];
      setRecords(rows);

      // nếu có sessionId -> gọi stats riêng
      if (sessionId) {
        const s = await sessionsAPI.stats(sessionId);
        const d = s?.data?.data || {};
        const present = d.present || 0,
          late = d.late || 0,
          absent = d.absent || 0;
        setStats({ present, late, absent, total: present + late + absent });
      } else {
        // ước lượng nhanh từ dữ liệu trả về (không chuẩn bằng stats)
        const p = rows.filter((r) => r.status === "present").length;
        const l = rows.filter((r) => r.status === "late").length;
        const a = rows.filter((r) => r.status === "absent").length;
        setStats({ present: p, late: l, absent: a, total: rows.length });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll({});
  }, [sessionId]);

  return (
    <div className="space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--primary-color)" }}
      >
        {sessionId ? "Điểm danh theo phiên" : "Quản lý điểm danh"}
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Tổng</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Có mặt</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.present}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Muộn</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Vắng</div>
          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
        </div>
      </div>

      <AttendanceFilter
        onFilter={(f) => fetchAll(f)}
        sessionId={sessionId || undefined}
      />

      {loading ? (
        <div className="p-6 bg-white rounded-lg shadow animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <AttendanceTable records={records} />
      )}
    </div>
  );
};

export default Attendance;
