// src/components/Layout/Sidebar.jsx
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarClock,
  LogOut, // ⬅️ thêm LogOut
} from "lucide-react";

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(
    () => [
      {
        id: "dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      { id: "students", path: "/students", icon: Users, label: "Sinh viên" },
      {
        id: "sessions",
        path: "/sessions",
        icon: CalendarClock,
        label: "Phiên điểm danh",
      },
      {
        id: "attendance",
        path: "/attendance",
        icon: ClipboardCheck,
        label: "Điểm danh",
      },
    ],
    []
  );

  // ✅ logout gọn
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } text-white h-screen fixed left-0 top-0 transition-all duration-300 z-30`}
      style={{ backgroundColor: "var(--primary-color)" }}
    >
      {/* Title */}
      <div className="p-6">
        <h1 className={`text-2xl font-bold ${collapsed ? "hidden" : "block"}`}>
          SmartAttendance
        </h1>
        <div
          className={`${
            collapsed ? "block" : "hidden"
          } text-2xl font-bold text-center`}
        >
          SA
        </div>
      </div>

      {/* Menu */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              } px-6 py-4 transition-colors ${
                isActive ? "border-r-4 border-white" : ""
              }`}
              style={{
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.1)"
                  : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = isActive
                  ? "rgba(255,255,255,0.1)"
                  : "transparent")
              }
            >
              <item.icon className="w-6 h-6" />
              <span className={`ml-4 ${collapsed ? "hidden" : "block"}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: Admin / Logout */}
      <button
        onClick={handleLogout}
        className="absolute bottom-4 left-0 right-0 mx-4 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10"
        title="Đăng xuất"
      >
        <LogOut className="w-5 h-5" />
        <span className={`${collapsed ? "hidden" : "block"}`}>Đăng xuất</span>
      </button>
    </div>
  );
};

export default Sidebar;
