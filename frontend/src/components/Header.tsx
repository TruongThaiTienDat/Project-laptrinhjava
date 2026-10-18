'use client';

import React, { useState } from 'react';

interface HeaderProps {
  currentRole?: string;
  onRoleChange?: (role: string) => void;
}

export function Header({ currentRole = 'Staff', onRoleChange }: HeaderProps) {
  const [role, setRole] = useState(currentRole);

  const handleRoleSelect = (newRole: string) => {
    setRole(newRole);
    if (onRoleChange) onRoleChange(newRole);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Tiêu đề ứng dụng ở góc trái */}
      <div className="flex items-center space-x-3">
        <h2 className="text-sm font-semibold text-slate-800">
          Hệ thống quản lý tài liệu LivingDocs
        </h2>
      </div>

      {/* Thông tin quyền và tài khoản ở góc phải */}
      <div className="flex items-center space-x-4">
        {/* Dropdown chọn quyền */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-600">
          <span>Quyền:</span>
          <select
            value={role}
            onChange={(e) => handleRoleSelect(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-none focus:border-blue-500"
          >
            <option value="Staff">Staff</option>
            <option value="Manager">Manager</option>
            <option value="Developer">Developer</option>
          </select>
        </div>

        {/* Tên tài khoản mẫu */}
        <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 text-xs">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-medium text-xs">
            A
          </div>
          <span className="font-medium text-slate-700">Nguyễn Văn A</span>
        </div>
      </div>
    </header>
  );
}
