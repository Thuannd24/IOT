// src/components/Dashboard/AttendanceChart.jsx
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { attendanceAPI } from "../../services/api"; // 👈 đổi sang attendanceAPI

// helper lấy đúng payload (backend có thể bọc data)
const unbox = (res) => res?.data?.data ?? res?.data ?? res;

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function lastNDates(n = 7) {
  const arr = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    arr.push(d);
  }
  return arr;
}

const AttendanceChart = () => {
  const days = useMemo(() => lastNDates(7), []);
  const [chartData, setChartData] = useState(
    days.map((d) => ({
      name: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      present: 0,
      late: 0,
      absent: 0,
    }))
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = [];
        for (const d of days) {
          const dateStr = ymd(d);

          // 👉 LẤY THEO NGÀY TỪ /api/attendance (không đụng /sessions)
          const recs = unbox(await attendanceAPI.list({ date: dateStr })) || [];

          let present = 0,
            late = 0,
            absent = 0;
          for (const r of recs) {
            if (r.status === "present") present++;
            else if (r.status === "late") late++;
            else if (r.status === "absent") absent++;
          }

          rows.push({
            name: d.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
            }),
            present,
            late,
            absent,
          });
        }
        if (alive) setChartData(rows);
      } catch (e) {
        console.error("AttendanceChart load error:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [days]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          Thống kê điểm danh{" "}
          <span className="text-sm text-gray-400 font-normal">
            / 7 ngày gần đây
          </span>
        </h2>

        {/* Fix cảnh báo width/height: bọc ResponsiveContainer trong div có height cố định */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: "30px" }}
              />

              <Line
                type="monotone"
                dataKey="present"
                stroke="#10b981"
                strokeWidth={2}
                name="Có mặt"
                dot={{ fill: "#10b981", r: 2 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="late"
                stroke="#f97316"
                strokeWidth={2}
                name="Muộn"
                dot={{ fill: "#f97316", r: 2 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="absent"
                stroke="#fb2c36"
                strokeWidth={2}
                name="Vắng"
                dot={{ fill: "#fb2c36", r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChart;
