// Mock Chart Data for Dashboard

// Weekly Attendance Chart Data
export const chartData = [
    { name: 'Thứ 2', present: 32, absent: 12, late: 8 },
    { name: 'Thứ 3', present: 38, absent: 8, late: 10 },
    { name: 'Thứ 4', present: 45, absent: 28, late: 35 },
    { name: 'Thứ 5', present: 52, absent: 18, late: 22 },
    { name: 'Thứ 6', present: 42, absent: 6, late: 12 },
    { name: 'Thứ 7', present: 82, absent: 42, late: 25 },
    { name: 'CN', present: 58, absent: 8, late: 15 },
];

// Radar Chart Data - Attendance Report (Kế hoạch vs Thực tế)
export const pieData = [
    { name: 'Đúng giờ', allocated: 80, actual: 95 },
    { name: 'Chuyên cần', allocated: 85, actual: 75 },
    { name: 'Tham gia', allocated: 90, actual: 85 },
    { name: 'Hoàn thành', allocated: 70, actual: 95 },
    { name: 'Kỷ luật', allocated: 65, actual: 75 },
    { name: 'Tương tác', allocated: 75, actual: 80 },
];

// Monthly Attendance Trend
export const monthlyTrendData = [
    { month: 'T1', rate: 88 },
    { month: 'T2', rate: 90 },
    { month: 'T3', rate: 85 },
    { month: 'T4', rate: 92 },
    { month: 'T5', rate: 87 },
    { month: 'T6', rate: 91 },
    { month: 'T7', rate: 89 },
    { month: 'T8', rate: 93 },
    { month: 'T9', rate: 88 },
    { month: 'T10', rate: 90 },
];

// Class-wise Attendance Data
export const classAttendanceData = [
    { class: 'CNTT01', present: 42, absent: 3, late: 2 },
    { class: 'CNTT02', present: 38, absent: 5, late: 3 },
    { class: 'CNTT03', present: 45, absent: 2, late: 1 },
    { class: 'CNTT04', present: 40, absent: 6, late: 2 },
];
