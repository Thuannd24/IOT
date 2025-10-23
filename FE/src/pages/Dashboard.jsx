import { Users, UserCheck, AlertCircle, BarChart as BarChartIcon } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import AttendanceChart from '../components/Dashboard/AttendanceChart';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { mockDashboardStats } from '../data';

const Dashboard = () => {
    const stats = [
        { title: 'Tổng sinh viên', value: mockDashboardStats.totalStudents.toString(), icon: Users, color: 'bg-blue-500', trend: mockDashboardStats.trends.students },
        { title: 'Có mặt hôm nay', value: mockDashboardStats.presentToday.toString(), icon: UserCheck, color: 'bg-green-500', trend: mockDashboardStats.trends.attendance },
        { title: 'Vắng', value: mockDashboardStats.absentToday.toString(), icon: AlertCircle, color: 'bg-red-500', trend: -mockDashboardStats.trends.attendance },
        { title: 'Tỷ lệ điểm danh', value: `${mockDashboardStats.attendanceRate}%`, icon: BarChartIcon, color: 'bg-purple-500', trend: mockDashboardStats.trends.rate },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts */}
            <AttendanceChart />

            {/* Recent Attendance */}
            <RecentActivity />
        </div>
    );
};

export default Dashboard;
