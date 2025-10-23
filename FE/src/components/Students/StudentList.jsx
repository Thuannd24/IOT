import StudentCard from './StudentCard';

const StudentList = ({ students }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {students && students.length > 0 ? (
                students.map((student) => (
                    <StudentCard key={student.id} student={student} />
                ))
            ) : (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">Chưa có sinh viên nào</p>
                </div>
            )}
        </div>
    );
};

export default StudentList;
