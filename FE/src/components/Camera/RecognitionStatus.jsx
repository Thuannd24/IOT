import { CheckCircle, XCircle, Clock } from 'lucide-react';

const RecognitionStatus = ({ recentAttendance }) => {
    return (
        <div className="space-y-6">
            {/* Camera Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Trạng thái hệ thống</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Camera</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Hoạt động
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">AI Model</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Sẵn sàng
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Kết nối</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Tốt
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Recognition */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Nhận diện gần đây</h2>
                <div className="space-y-3">
                    {recentAttendance && recentAttendance.length > 0 ? (
                        recentAttendance.map((record) => (
                            <div
                                key={record.id}
                                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                    {record.studentName.split(' ')[0][0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{record.studentName}</p>
                                    <p className="text-xs text-gray-500">
                                        {record.time} • {record.confidence}%
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    {record.status === 'present' ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Clock className="w-5 h-5 text-orange-500" />
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            Chưa có dữ liệu nhận diện
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecognitionStatus;
