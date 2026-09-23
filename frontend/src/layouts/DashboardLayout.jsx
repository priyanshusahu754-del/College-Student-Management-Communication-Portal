import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  BookOpen, 
  FileText, 
  Award, 
  Bell, 
  Calendar, 
  Users, 
  Building2, 
  FolderKanban, 
  ClipboardList, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  GraduationCap, 
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Badge } from '../components/common/Badge';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Nav menus by role
  const getNavLinks = () => {
    switch (user?.role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'My Attendance', path: '/student/attendance', icon: UserCheck },
          { name: 'Assignments', path: '/student/assignments', icon: BookOpen },
          { name: 'Study Materials', path: '/student/materials', icon: FileText },
          { name: 'Results & Grades', path: '/student/results', icon: Award },
          { name: 'College Notices', path: '/student/notices', icon: Bell },
          { name: 'Events & Fests', path: '/student/events', icon: Calendar },
          { name: 'My Profile', path: '/student/profile', icon: Settings },
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
          { name: 'Mark Attendance', path: '/teacher/attendance', icon: UserCheck },
          { name: 'Assignments', path: '/teacher/assignments', icon: BookOpen },
          { name: 'Study Materials', path: '/teacher/materials', icon: FileText },
          { name: 'Marks Entry', path: '/teacher/results', icon: Award },
          { name: 'My Subjects', path: '/teacher/subjects', icon: FolderKanban },
          { name: 'Notices', path: '/teacher/notices', icon: Bell },
          { name: 'My Profile', path: '/teacher/profile', icon: Settings },
        ];
      case 'admin':
        return [
          { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Academics & Courses', path: '/admin/academics', icon: Building2 },
          { name: 'Notice Board', path: '/admin/notices', icon: Bell },
          { name: 'Event Management', path: '/admin/events', icon: Calendar },
          { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
          { name: 'System Settings', path: '/admin/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-base tracking-tight leading-none">CampusConnect</h1>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">ERP & Portal</p>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Brief Card */}
          <div className="p-4 mx-3 mt-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center space-x-3">
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=6366f1&color=fff`} 
              alt={user?.full_name} 
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name}</p>
              <div className="mt-0.5">
                <Badge variant={user?.role === 'admin' ? 'rose' : user?.role === 'teacher' ? 'indigo' : 'emerald'} size="sm">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-100"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">CampusConnect Portal</span>
              <p className="text-sm font-bold text-slate-800 capitalize">
                {user?.role} Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            if (!n.is_read) markAsRead(n.id);
                            if (n.link) navigate(n.link);
                            setShowNotifications(false);
                          }}
                          className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1" />}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            {new Date(n.created_at).toLocaleDateString()} at {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications to display
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors"
              >
                <img
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=6366f1&color=fff`}
                  alt={user?.full_name}
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <span className="text-xs font-bold text-slate-700 hidden md:block">{user?.full_name?.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <NavLink
                    to={`/${user?.role}/profile`}
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Body Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
