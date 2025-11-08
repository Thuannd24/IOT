import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const SessionTable = ({ sessions, filters, onChangeFilters, onRefresh }) => {
  const nav = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-end gap-3">
        <Input
          label="Lọc theo ngày"
          type="date"
          value={filters.date || ""}
          onChange={(e) =>
            onChangeFilters({ ...filters, date: e.target.value })
          }
        />
        <Button variant="secondary" onClick={onRefresh}>
          Tải lại
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phiên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bắt đầu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kết thúc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                close_time
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions.length ? (
              sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{s.date}</td>
                  <td className="px-6 py-4 text-sm">{s.session_name}</td>
                  <td className="px-6 py-4 text-sm">{s.start_time}</td>
                  <td className="px-6 py-4 text-sm">{s.end_time}</td>
                  <td className="px-6 py-4 text-sm">{s.close_time}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="primary"
                      onClick={() => nav(`/attendance?sessionId=${s.id}`)}
                    >
                      Xem điểm danh
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                  Không có phiên
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionTable;
