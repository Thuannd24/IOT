import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';

const Header = ({ collapsed, setCollapsed }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setShowUserMenu(false);
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        // Just close modal and navigate to login
        navigate('/login');
        setShowLogoutModal(false);
    };

    const getUserInitials = () => {
        return 'AD';
    };

    return (
        <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
            <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile */}
                <div className="relative" ref={menuRef}>
                    <div
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                    >
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {getUserInitials()}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                            Admin
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="text-sm font-semibold text-gray-800">Admin</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <button
                                onClick={() => {
                                    navigate('/settings');
                                    setShowUserMenu(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Cài đặt
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
