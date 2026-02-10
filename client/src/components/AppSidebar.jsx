import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  LayoutDashboard,
  CalendarCheck,
  Users,
  BarChart3,
  LogOut,
  User,
  ChevronLeft,
  Menu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/elections", icon: CalendarCheck, label: "Elections" },
  { to: "/admin/candidates", icon: Users, label: "Candidates" },
  { to: "/admin/results", icon: BarChart3, label: "Results" }
];

const studentLinks = [
  { to: "/student", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/student/vote", icon: Vote, label: "Vote" },
  { to: "/student/results", icon: BarChart3, label: "Results" },
  { to: "/student/profile", icon: User, label: "Profile" }
];

const AppSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "admin" ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 120, damping: 20 }}
      className="fixed left-0 top-0 h-screen bg-white text-slate-950 z-50 flex flex-col border-r border-slate-200 shadow-xl shadow-slate-200/50"
    >
      {/* Header / Logo */}
      <div className="flex items-center justify-between p-6 h-20 border-b border-slate-100">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center shadow-lg shadow-slate-900/20">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-950">CampusVote</span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mx-auto"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center shadow-lg shadow-slate-900/20">
                <Vote className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        <p className={`px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "Menu" : "Main Menu"}
        </p>

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `relative group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${isActive
                ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"
              } ${collapsed ? "justify-center px-0" : ""}`
            }
          >
            <link.icon className={`w-5 h-5 flex-shrink-0 transition-transform ${collapsed ? "w-6 h-6" : ""}`} />

            {!collapsed && (
              <span className="tracking-wide">
                {link.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile - Bottom */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors border border-transparent ${!collapsed ? "bg-white border-slate-200 hover:border-slate-300 shadow-sm" : "justify-center"}`}>
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 relative flex-shrink-0">
            <User className="w-5 h-5 text-slate-600" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>

          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || "User"}</p>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{user?.role || "Guest"}</p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggle Button for Collapsed Mode (Only visible if collapsed) */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="w-full mt-4 flex justify-center p-3 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex justify-center p-3 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.aside>
  );
};
export default AppSidebar;
