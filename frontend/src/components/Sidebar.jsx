import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Route as RouteIcon,
  AlertCircle,
  Clock,
  Bus,
  Shield,
  Layers,
  History,
  Radio,
  FileSpreadsheet,
  Cpu,
  BarChart3
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, isDriver, isStudent } = useAuth();

  const getLinks = () => {
    if (isAdmin) {
      return [
        { to: '/admin', label: 'Command Center', icon: LayoutDashboard, end: true },
        { to: '/admin/buses', label: 'Fleet Management', icon: Bus },
        { to: '/admin/routes', label: 'Routes & Stops', icon: RouteIcon },
        { to: '/admin/incidents', label: 'Incident Control', icon: AlertCircle },
        { to: '/admin/replacements', label: 'Replacement Buses', icon: Layers },
        { to: '/admin/staff', label: 'Staff & Drivers', icon: Shield },
        { to: '/admin/delay-predict', label: 'AI Delay Predictor', icon: Cpu },
        { to: '/admin/analytics', label: 'Fleet Analytics', icon: BarChart3 },
      ];
    }

    if (isDriver) {
      return [
        { to: '/driver', label: 'Driver Cockpit', icon: LayoutDashboard, end: true },
        { to: '/driver/trip-control', label: 'Trip & GPS Broadcast', icon: Radio },
        { to: '/driver/report-incident', label: 'Report Issue', icon: AlertCircle },
        { to: '/driver/tasks', label: 'Assigned Tasks', icon: Clock },
      ];
    }

    // Student / Passenger
    return [
      { to: '/student', label: 'My Dashboard', icon: LayoutDashboard, end: true },
      { to: '/student/tracking', label: 'Live Bus Tracking', icon: MapPin },
      { to: '/student/routes', label: 'Transit Routes', icon: RouteIcon },
      { to: '/student/report-incident', label: 'Report Complaint', icon: AlertCircle },
      { to: '/student/my-incidents', label: 'Incident History', icon: History },
      { to: '/student/notifications', label: 'All Alerts', icon: FileSpreadsheet },
    ];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 p-4 shrink-0 hidden lg:flex flex-col justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Navigation ({user?.role?.toUpperCase()})
          </div>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Status Widget */}
      <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SmartTransit Engine
          </span>
          <span className="text-emerald-400 font-mono text-[10px]">v1.0 MVP</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-1">
          GPS simulator & AI triage connected
        </div>
      </div>
    </aside>
  );
};
