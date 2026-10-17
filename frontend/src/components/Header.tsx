'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  UserCheck, 
  Bell, 
  Github, 
  RefreshCw 
} from 'lucide-react';

interface HeaderProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

// Thanh tieu de tren cung he thong, cho phep chuyen doi vai tro nguoi dung khi bao cao do an
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
    }, 1000);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Thong tin repository Git va nhanh dang lam viec */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 bg-slate-100 px-3 py-1.5 rounded border border-slate-200 font-mono">
          <Github className="w-4 h-4 text-slate-800" />
          <span className="font-semibold text-slate-900">TruongThaiTienDat/Project-laptrinhjava</span>
          <span className="text-slate-400">/</span>
          <GitBranch className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-sky-700 font-bold">feature/KAN-25</span>
        </div>

        <button
          onClick={triggerSync}
          disabled={syncing}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
          title="Kiem tra dong bo Git"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-sky-600' : ''}`} />
        </button>
      </div>

      {/* Chuyen doi vai tro kiem thu cho sinh vien khi demo voi giang vien */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded border border-slate-200 text-xs">
          <span className="text-slate-600 px-2 font-medium flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Vai tro demo:</span>
          </span>
          <select
            value={role}
            onChange={(e) => handleRoleSelect(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          >
            <option value="Developer">Developer (Nguoi lap trinh)</option>
            <option value="Staff">Staff (Nguoi kiem duyet buoc 1)</option>
            <option value="Manager">Manager (Nguoi phe duyet cuoi)</option>
            <option value="Tech Lead">Technical Lead (Quan tri du an)</option>
          </select>
        </div>

        {/* Thong tin sinh vien thuc hien phan 5 */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-xs">
          <div className="w-7 h-7 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
            TV5
          </div>
          <div className="hidden md:block text-left">
            <div className="font-semibold text-slate-900 leading-tight">Thanh vien 5</div>
            <div className="text-[11px] text-slate-500">Phu trach Frontend</div>
          </div>
        </div>
      </div>
    </header>
  );
}
