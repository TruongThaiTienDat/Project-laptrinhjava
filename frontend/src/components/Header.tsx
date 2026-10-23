'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLivingDocs, UserRole } from '@/context/LivingDocsContext';
import { TestDataModal } from './TestDataModal';
import { 
  LogOut, 
  ChevronRight 
} from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const { currentUser, role, setRole, logout } = useLivingDocs();

  // Lấy tên trang hiển thị trên Breadcrumb
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Tổng quan hệ thống';
      case '/workflow':
        return 'Xét duyệt tài liệu';
      case '/diff':
        return 'So sánh thay đổi';
      case '/knowledge-base':
        return 'Kho tri thức';
      case '/dashboard':
        return 'Thống kê & Cấu hình';
      case '/admin':
        return 'Quản trị hệ thống';
      default:
        return 'Hệ thống LivingDocs';
    }
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Bên trái: Breadcrumb điều hướng tinh gọn (LivingDocs / Tên trang) */}
        <div className="flex items-center space-x-2">
          <nav className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-slate-500 font-semibold">LivingDocs</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold">{getPageTitle(pathname)}</span>
          </nav>
        </div>

        {/* Bên phải: Thông tin người dùng kèm dropdown chọn vai trò RBAC và nút Đăng xuất */}
        <div className="flex items-center space-x-4 shrink-0">
          {/* Khu vực thông tin người dùng & Chọn quyền RBAC gọn gàng */}
          <div className="flex items-center space-x-2.5 text-xs">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.avatarLetter || 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-slate-900 leading-tight">
                {currentUser?.name || 'Người dùng'}
              </span>
              <div className="flex items-center space-x-1 mt-0.5">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-[11px] text-slate-700 font-medium outline-none cursor-pointer focus:border-blue-500 transition"
                  title="Chuyển đổi vai trò kiểm thử (RBAC)"
                >
                  <option value="Developer">Developer</option>
                  <option value="Staff">Staff Reviewer</option>
                  <option value="Manager">Manager Approver</option>
                  <option value="Technical Lead">Technical Lead</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nút Đăng xuất */}
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition"
            title="Đăng xuất khỏi phiên làm việc"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Modal quản lý dữ liệu test & tải file ngoài */}
      <TestDataModal />
    </>
  );
}
