import { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";

const AttendanceFilter = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    date: "",
    status: "",
  });

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({
      date: filters.date,
      status: filters.status,
      session_id: sessionId,
    });
  };
  const handleReset = () => {
    setFilters({ date: "", status: "" });
    onFilter({ session_id: sessionId });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h3>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Input
          label="Ngày"
          name="date"
          type="date"
          value={filters.date}
          onChange={handleChange}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="present">Có mặt</option>
            <option value="late">Muộn</option>
            <option value="absent">Vắng</option>
          </select>
        </div>

        <div className="flex items-end space-x-2">
          <Button type="submit" variant="primary" className="flex-1">
            Lọc
          </Button>
          <Button type="button" variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AttendanceFilter;
