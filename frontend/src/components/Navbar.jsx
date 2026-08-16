import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { 
  Bus, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const Navbar = ({ onOpenDemoModal }) => {
  const { user, logout, quickLoginAs, isAdmin, isDriver, isStudent } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const res = await notificationService.getAll();
      const notifs = res.data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Polling every 10s for live alerts
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickSwitch = async (role) => {
    setShowPersonaMenu(false);
    await quickLoginAs(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'driver') navigate('/driver');
    else navigate('/student');
  };

  const getRoleBadge = () => {
    if (isAdmin) return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Administrator</span>;
    if (isDriver) return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><Bus className="w-3.5 h-3.5" /> Driver / Staff</span>;
    return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> Student / Passenger</span>;
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bus className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Smart<span className="text-indigo-400">Transit</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] tracking-wider uppercase font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  Live City
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Demo Workflow Runner & Persona Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenDemoModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-600/40 hover:bg-amber-900/50 rounded-lg transition-colors shadow-sm"
              title="Launch Guided Breakdown & Replacement Demo"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Interactive Demo Scenario</span>
            </button>

            {/* Quick Switch Persona Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
              >
                <span>Switch Role</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    1-Click Persona Switch
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-200 hover:bg-purple-600/20 hover:text-purple-300 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-semibold">Transport Admin</div>
                      <div className="text-[10px] text-slate-400">Manage Fleet & Incidents</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('driver')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-200 hover:bg-amber-600/20 hover:text-amber-300 rounded-lg transition-colors"
                  >
                    <Bus className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold">Bus Driver (B12)</div>
                      <div className="text-[10px] text-slate-400">GPS & Trip Cockpit</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('student')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left text-slate-200 hover:bg-cyan-600/20 hover:text-cyan-300 rounded-lg transition-colors"
                  >
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-semibold">Student / Passenger</div>
                      <div className="text-[10px] text-slate-400">Live Map & Reporting</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Notifications & Profile */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden z-50 animate-in fade-in">
                  <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-400" /> Notifications & Alerts
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {unreadCount} unread
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications at this time
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            n.is_read ? 'opacity-60 hover:bg-slate-800/40' : 'bg-slate-800/70 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {n.type === 'breakdown' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            ) : n.type === 'replacement' ? (
                              <Bus className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-slate-100">{n.title}</div>
                              <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</div>
                              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Pill & Role */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-slate-200">{user.name}</div>
                  <div className="mt-0.5">{getRoleBadge()}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl border border-transparent hover:border-rose-800/40 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-colors"
              >
                Sign In
              </Link>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
