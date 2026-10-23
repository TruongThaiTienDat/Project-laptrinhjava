'use client';

import React from 'react';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { TestDataModal } from './TestDataModal';
import { Sliders } from 'lucide-react';

export function Header() {
  const { role, setRole, setIsTestModalOpen } = useLivingDocs();

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Tiêu đề ứng dụng ở góc trái */}
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Hệ thống quản lý tài liệu LivingDocs
          </h2>
        </div>

        {/* Thông tin quyền, nút Dữ liệu Test và tài khoản ở góc phải */}
        <div className="flex items-center space-x-4">
          {/* Nút mở quản lý Dữ liệu Test */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded transition"
            title="Thêm hoặc sửa dữ liệu tài liệu kiểm thử"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Dữ liệu Test</span>
          </button>

          {/* Dropdown chọn quyền (đồng bộ toàn hệ thống) */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <span>Quyền:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
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

      {/* Modal quản lý dữ liệu test động */}
      <TestDataModal />
    </>
  );
}
