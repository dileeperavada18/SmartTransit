import React, { useState, useEffect } from 'react';
import { busService } from '../../services/api';
import { Shield, User, Phone, Mail, Bus, CheckCircle2 } from 'lucide-react';

export const AdminStaff = () => {
  // Preconfigured transport staff directory
  const staffMembers = [
    { id: 1, name: "Fleet Director Admin", email: "admin@smarttransit.com", role: "Transport Administrator", phone: "+91 98765 43210", assignedBus: "All Operations" },
    { id: 2, name: "Ramesh Kumar", email: "driver@smarttransit.com", role: "Senior Bus Driver", phone: "+91 98765 43211", assignedBus: "Bus B12 (Route 4)" },
    { id: 3, name: "Suresh Reddy", email: "driver2@smarttransit.com", role: "Standby Driver / Mechanic", phone: "+91 98765 43212", assignedBus: "Bus B18 (Standby Fleet)" },
    { id: 4, name: "Venkat Rao", email: "driver3@smarttransit.com", role: "Route Field Driver", phone: "+91 98765 43213", assignedBus: "Bus B22 (Route 2)" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-purple-400" /> Staff & Driver Directory
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Authorized transport operators, standby drivers, mechanics, and contact points
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                {staff.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">{staff.name}</h3>
                <span className="text-[11px] text-purple-400 font-medium">{staff.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{staff.phone}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-slate-900 text-indigo-300">
                <Bus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Assignment: <strong>{staff.assignedBus}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
