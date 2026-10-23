'use client';

import React from 'react';
import { useLivingDocs, UserRole } from '@/context/LivingDocsContext';
import { TestDataModal } from './TestDataModal';
import { Sliders, LogOut } from 'lucide-react';

export function Header() {
  const { currentUser, role, setRole, logout, setIsTestModalOpen } = useLivingDocs();

  // Màu sắc badge vai trò dịu mắt theo chuẩn thiết kế phẳng
  const getRoleBadgeClasses = (userRole: UserRole) => {
    switch (userRole) {
      case 'Developer':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Staff':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Manager':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Technical Lead':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Administrator':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Tiêu đề ứng dụng ở góc trái */}
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Hệ thống quản lý tài liệu LivingDocs
          </h2>
        </div>

        {/* Thông tin quyền, nút Dữ liệu Test, thông tin tài khoản và Đăng xuất ở góc phải */}
        <div className="flex items-center space-x-3.5">
          {/* Nút mở quản lý Dữ liệu Test */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded transition"
            title="Thêm hoặc sửa dữ liệu tài liệu kiểm thử"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Dữ liệu Test</span>
          </button>

          {/* Dropdown đổi nhanh quyền (đồng bộ toàn hệ thống và đổi tài khoản mẫu tương ứng) */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <span className="font-medium">Quyền:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 outline-none focus:border-blue-500 font-medium"
              title="Đổi vai trò để kiểm thử nhanh phân quyền RBAC"
            >
              <option value="Developer">Developer</option>
              <option value="Staff">Staff Reviewer</option>
              <option value="Manager">Manager Approver</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          {/* Thông tin tài khoản đang đăng nhập & Role Badge */}
          <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.avatarLetter || 'U'}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                  {currentUser?.name || 'Người dùng'}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${getRoleBadgeClasses(role)}`}>
                  {role}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                {currentUser?.email || ''}
              </span>
            </div>
          </div>

          {/* Nút Đăng xuất */}
          <button
            onClick={logout}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded transition"
            title="Đăng xuất khỏi phiên làm việc và quay về trang đăng nhập"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Modal quản lý dữ liệu test động */}
      <TestDataModal />
    </>
  );
}
