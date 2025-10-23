import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import StudentList from '../components/Students/StudentList';
import AddStudentModal from '../components/Students/AddStudentModal';
import Button from '../components/common/Button';
import { mockStudents } from '../data';
import { useToast } from '../contexts/ToastContext';

const Students = () => {
    const toast = useToast();
    const [students, setStudents] = useState(mockStudents);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddStudent = (formData) => {
        try {
            // Simulate API call
            // await api.addStudent(formData);

            const newStudent = {
                id: students.length + 1,
                ...formData,
                image: 'https://ui-avatars.com/api/?name=' + formData.name,
                lastAttendance: new Date().toISOString().split('T')[0],
                attendanceRate: 100
            };

            setStudents([...students, newStudent]);
            setIsModalOpen(false);
            toast.success('Thêm sinh viên thành công!');
        } catch (error) {
            toast.error('Không thể thêm sinh viên. Vui lòng thử lại!');
        }
    };

    return (
        <div className="space-y-6">
            {/* Title */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>Quản lý Sinh viên</h1>
                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                        type="submit"
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Thêm sinh viên
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg">
                {/*  Search and filter */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sinh viên..."
                                className="input-search"
                            />
                        </div>
                        <select className="select-primary">
                            <option>Tất cả lớp</option>
                            <option>CNTT01</option>
                            <option>CNTT02</option>
                        </select>
                    </div>
                </div>

                {/* Student list */}
                <StudentList students={students} />
            </div>

            {/* Add Student Modal */}
            <AddStudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddStudent}
            />
        </div>
    );
};

export default Students;
