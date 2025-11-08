import { useEffect, useState } from "react";
import SessionForm from "../components/Sessions/SessionForm";
import SessionTable from "../components/Sessions/SessionTable";
import { sessionsAPI } from "../services/api";

const normalize = (rows = []) =>
  rows.map((r) => ({
    ...r,
    shift: r.shift, // ✅ giữ shift
    start_time: r.start_time?.toString().slice(0, 8),
    end_time: r.end_time?.toString().slice(0, 8),
    close_time: r.close_time?.toString().slice(0, 8),
    date: r.date?.toString().slice(0, 10),
  }));

const SessionsPage = () => {
  const [filters, setFilters] = useState({ date: "" });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (signal) => {
    try {
      setLoading(true);
      const res = await sessionsAPI.list(filters, { signal });
      setList(normalize(res?.data?.data || []));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const c = new AbortController();
    fetchData(c.signal);
    return () => c.abort();
  }, [filters]); // đổi filter sẽ tự reload

  return (
    <div className="space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--primary-color)" }}
      >
        Quản lý phiên điểm danh
      </h1>

      {/* ✅ nhận date từ form để lọc đúng ngày vừa tạo */}
      <SessionForm
        onCreated={(date) => {
          if (date) setFilters((f) => ({ ...f, date }));
          fetchData(); // refresh ngay
        }}
      />

      {loading ? (
        <div className="p-6 bg-white rounded-lg shadow animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded" />
        </div>
      ) : (
        <SessionTable
          sessions={list}
          filters={filters}
          onChangeFilters={setFilters}
          onRefresh={() => fetchData()}
        />
      )}
    </div>
  );
};

export default SessionsPage;
