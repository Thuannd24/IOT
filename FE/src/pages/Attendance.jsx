import { useState } from 'react';
import AttendanceTable from '../components/Attendance/AttendanceTable';
import AttendanceFilter from '../components/Attendance/AttendanceFilter';
import { mockAttendance } from '../data';

const Attendance = () => {
    const [records, setRecords] = useState(mockAttendance);

    const handleFilter = (filters) => {
        console.log('Applying filters:', filters);
        // Implement filter logic with API call
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>Quản lý điểm danh</h1>

            <AttendanceFilter onFilter={handleFilter} />

            <AttendanceTable records={records} />
        </div>
    );
};

export default Attendance;
