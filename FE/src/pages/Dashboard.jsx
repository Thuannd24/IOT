// src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, AlertCircle } from "lucide-react";
import StatsCard from "../components/Dashboard/StatsCard";
import AttendanceChart from "../components/Dashboard/AttendanceChart";
// import RecentActivity from "../components/Dashboard/RecentActivity";
import { studentAPI, attendanceAPI } from "../services/api"; // 👈 đổi sang attendanceAPI

function fmtYMD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// helper nhỏ để lấy đúng payload bất kể backend bọc data thế nào
const unbox = (res) => res?.data?.data ?? res?.data ?? res;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [presentToday, setPresentToday] = useState(0);
  const [absentToday, setAbsentToday] = useState(0);
  const today = useMemo(() => fmtYMD(new Date()), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        // 1) Tổng SV
        const students = unbox(await studentAPI.getAll());
        if (alive)
          setTotalStudents(Array.isArray(students) ? students.length : 0);

        // 2) Thống kê hôm nay từ /api/attendance?date=YYYY-MM-DD
        const recs = unbox(await attendanceAPI.list({ date: today })) || [];
        let p = 0,
          a = 0;
        for (const r of recs) {
          if (r.status === "present") p++;
          else if (r.status === "absent") a++;
        }
        if (alive) {
          setPresentToday(p);
          setAbsentToday(a);
        }
      } catch (e) {
        console.error("Dashboard load error:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [today]);

  const stats = [
    {
      title: "Tổng sinh viên",
      value: loading ? "..." : String(totalStudents),
      icon: Users,
      color: "bg-blue-500",
      trend: null,
    },
    {
      title: "Có mặt hôm nay",
      value: loading ? "..." : String(presentToday),
      icon: UserCheck,
      color: "bg-green-500",
      trend: null,
    },
    {
      title: "Vắng hôm nay",
      value: loading ? "..." : String(absentToday),
      icon: AlertCircle,
      color: "bg-red-500",
      trend: null,
    },
  ];

  return (
    <div className="space-y-6">
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--primary-color)" }}
      >
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      <AttendanceChart />
      {/* <RecentActivity /> */}
    </div>
  );
};

export default Dashboard;
