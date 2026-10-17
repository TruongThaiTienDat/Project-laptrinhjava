'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  UserCheck, 
  Bell, 
  Github, 
  RefreshCw, 
  ChevronDown 
} from 'lucide-react';

interface HeaderProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export function Header({ currentRole = 'Staff', onRoleChange }: HeaderProps) {
  const [role, setRole] = useState(currentRole);
  const [syncing, setSyncing] = useState(false);

  const handleRoleSelect = (newRole: string) => {
    setRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
  };

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 1200);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Workspace & Repo Breadcrumb */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
          <Github className="w-4 h-4 text-slate-800" />
          <span className="font-semibold text-slate-900">TruongThaiTienDat/Project-laptrinhjava</span>
          <span className="text-slate-400">/</span>
          <GitBranch className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-sky-700 font-bold">main</span>
        </div>

        <button
          onClick={triggerSync}
          disabled={syncing}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          title="Đồng bộ lại từ GitHub"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>

      {/* Role Switcher & User Profile */}
      <div className="flex items-center space-x-4">
        {/* Role selector dropdown */}
        <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-500 px-2 font-medium flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Vai trò đang đóng:</span>
          </span>
          <select
            value={role}
            onChange={(e) => handleRoleSelect(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="Developer">💻 Developer (Author)</option>
            <option value="Staff">🔍 Staff (Reviewer Bước 1)</option>
            <option value="Manager">👑 Manager (Phê duyệt Cuối)</option>
            <option value="Tech Lead">📊 Technical Lead</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            TV5
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-900 leading-tight">Thành Viên 5</div>
            <div className="text-[11px] text-slate-500">Frontend Specialist</div>
          </div>
        </div>
      </div>
    </header>
  );
}
