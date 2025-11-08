import { useEffect, useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import { useToast } from "../../contexts/ToastContext";
import { sessionsAPI } from "../../services/api";

// helpers
const pad = (n) => String(n).padStart(2, "0");
const fmtDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`; // HH:MM
const addMinutes = (d, m) => new Date(d.getTime() + m * 60 * 1000);

export default function SessionForm({ onCreated }) {
  const toast = useToast();

  // default theo thời điểm mở form
  const now = new Date();
  const defaultDate = fmtDate(now);
  const defaultStart = fmtTime(now);
  const defaultEnd = fmtTime(addMinutes(now, 10));

  const [form, setForm] = useState({
    date: defaultDate,
    session_name: "Sáng",
    shift: 1, // ✅ NEW
    start_time: defaultStart,
    end_time: defaultEnd,
    close_time: defaultEnd,
  });

  // mount -> đồng bộ lại thời điểm hiện tại
  useEffect(() => {
    const t = new Date();
    const start = fmtTime(t);
    const end = fmtTime(addMinutes(t, 10));
    setForm((s) => ({
      ...s,
      date: fmtDate(t),
      start_time: start,
      end_time: end,
      close_time: end,
    }));
  }, []);

  // đổi start_time -> gợi ý end/close = +10'
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => {
      if (name === "start_time") {
        const [h, m] = value.split(":").map((x) => parseInt(x || "0", 10));
        const base = new Date();
        base.setHours(h || 0, m || 0, 0, 0);
        const suggestedEnd = fmtTime(addMinutes(base, 10));
        return {
          ...s,
          start_time: value,
          end_time: suggestedEnd,
          close_time: suggestedEnd,
        };
      }
      if (name === "shift") return { ...s, shift: parseInt(value, 10) || 1 }; // ✅ NEW
      return { ...s, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sessionsAPI.create({
        date: form.date,
        session_name: form.session_name,
        shift: form.shift, // ✅ NEW
        start_time: `${form.start_time}:00`,
        end_time: `${form.end_time}:00`,
        close_time: `${form.close_time}:00`,
      });
      toast.success("Tạo phiên điểm danh thành công!");
      onCreated?.(form.date); // (gợi ý) refresh đúng ngày
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("Phiên này đã tồn tại (cùng ngày + buổi + ca)!");
        onCreated?.(form.date); // hiển thị phiên đã có
      } else {
        toast.error(err?.response?.data?.message || "Không thể tạo phiên.");
      }
    }
  };

  const handleFinalize = async () => {
    try {
      await sessionsAPI.finalize();
      toast.success("Đã chốt các phiên đã quá hạn (đánh vắng).");
      onCreated?.();
    } catch {
      toast.error("Chốt phiên thất bại.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Tạo phiên điểm danh
        </h2>
        <Button variant="secondary" type="button" onClick={handleFinalize}>
          Chốt các phiên đã quá hạn
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Input
          label="Ngày"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buổi
          </label>
          <select
            name="session_name"
            value={form.session_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Sáng">Sáng</option>
            <option value="Chiều">Chiều</option>
          </select>
        </div>

        {/* ✅ Ca (shift) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ca
          </label>
          <select
            name="shift"
            value={form.shift}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>Ca 1</option>
            <option value={2}>Ca 2</option>
            <option value={3}>Ca 3</option>
          </select>
        </div>

        <Input
          label="Giờ bắt đầu điểm danh"
          name="start_time"
          type="time"
          value={form.start_time}
          onChange={handleChange}
        />
        <Input
          label="Giờ kết thúc điểm danh (đúng giờ)"
          name="end_time"
          type="time"
          value={form.end_time}
          onChange={handleChange}
        />
        <Input
          label="Giờ kết thúc môn học (close_time)"
          name="close_time"
          type="time"
          value={form.close_time}
          onChange={handleChange}
        />

        <div className="md:col-span-2 text-sm text-gray-600">
          <ul className="list-disc ml-5 space-y-1">
            <li>
              ≤ giờ kết thúc điểm danh → <b>Có mặt</b>
            </li>
            <li>
              Giữa kết thúc điểm danh và close_time → <b>Muộn</b>
            </li>
            <li>
              Sau close_time → <b>Vắng</b> khi chốt phiên
            </li>
          </ul>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" variant="primary">
            Tạo phiên
          </Button>
        </div>
      </form>
    </div>
  );
}
