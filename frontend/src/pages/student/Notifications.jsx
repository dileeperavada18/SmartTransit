import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/api';
import { Bell, CheckCheck, AlertTriangle, Bus, CheckCircle2, Clock } from 'lucide-react';

export const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await notificationService.getAll();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSingle = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-400" /> Notifications & Broadcasts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System announcements, replacement bus alerts, breakdown notices, and schedule changes
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAll}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
            <Bell className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">No notifications</div>
            <p className="text-xs text-slate-500">You're all caught up with transit alerts.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkSingle(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                n.is_read
                  ? 'bg-slate-900/40 border-slate-800/80 opacity-70 hover:opacity-100'
                  : 'bg-slate-900/90 border-slate-700 shadow-md hover:border-slate-600'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${
                n.type === 'breakdown' ? 'bg-rose-500/20 text-rose-400' :
                n.type === 'replacement' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-indigo-500/20 text-indigo-400'
              }`}>
                {n.type === 'breakdown' ? <AlertTriangle className="w-5 h-5" /> :
                 n.type === 'replacement' ? <Bus className="w-5 h-5" /> :
                 <CheckCircle2 className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">{n.title}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
              </div>

              {!n.is_read && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 self-center"></span>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
