import { mockAttendance } from '../../data';

const RecentActivity = () => {
    // Format date from yyyy-MM-dd to dd-MM-yyyy
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Điểm danh gần đây</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinh viên</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MSSV</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {mockAttendance.map(record => (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">{record.studentName}</td>
                                <td className="px-6 py-4">{record.studentId}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{formatDate(record.date)}</span>
                                        <span className="text-sm text-gray-500">{record.time}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.status === 'present' ? 'bg-green-500 text-white' : 'bg-[#F59E0B] text-white'
                                        }`}>
                                        {record.status === 'present' ? 'Có mặt' : 'Muộn'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentActivity;
