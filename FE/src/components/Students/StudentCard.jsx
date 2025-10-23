const StudentCard = ({ student }) => {
    return (
        <div className="border border-gray-400 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4">
                <img src={student.image} alt={student.name} className="w-20 h-20 rounded-full object-cover" />
                <div className="flex-1">
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-gray-500 text-sm">{student.studentId}</p>
                    <p className="text-gray-500 text-sm">{student.class}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Tỷ lệ điểm danh</span>
                    <span className="font-bold text-green-600">{student.attendance}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${student.attendance}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default StudentCard;
