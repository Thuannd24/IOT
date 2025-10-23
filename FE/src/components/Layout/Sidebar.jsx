import { LayoutDashboard, Users, ClipboardCheck, Camera, Settings, LogOut } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Modal from '../common/Modal';

const Sidebar = ({ collapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'students', path: '/students', icon: Users, label: 'Sinh viên' },
        { id: 'attendance', path: '/attendance', icon: ClipboardCheck, label: 'Điểm danh' },
        { id: 'camera', path: '/camera', icon: Camera, label: 'Camera' },
        { id: 'settings', path: '/settings', icon: Settings, label: 'Cài đặt' },
    ];

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        // Just close modal and navigate to login
        navigate('/login');
        setShowLogoutModal(false);
    };

    return (
        <div className={`${collapsed ? 'w-20' : 'w-64'} text-white h-screen fixed left-0 top-0 transition-all duration-300 z-30`} style={{ backgroundColor: 'var(--primary-color)' }}>
            {/* Title */}
            <div className="p-6">
                <h1 className={`text-2xl font-bold ${collapsed ? 'hidden' : 'block'}`}>SmartAttendance</h1>
                <div className={`${collapsed ? 'block' : 'hidden'} text-2xl font-bold text-center`}>SA</div>
            </div>
            {/* Menu Items */}
            <nav className="mt-6">
                {menuItems.map(item => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-6 py-4 transition-colors ${isActive ? 'border-r-4 border-white' : ''}`}
                            style={{
                                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className={`ml-4 ${collapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
