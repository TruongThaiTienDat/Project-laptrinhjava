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
  const { currentUser, role, logout } = useLivingDocs();

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

  // Định dạng nhãn vai trò chuẩn tiếng Anh
  const getRoleLabel = (userRole: UserRole) => {
    if (userRole === 'Staff') return 'Staff Reviewer';
    if (userRole === 'Manager') return 'Manager Approver';
    return userRole;
  };

  // Màu sắc badge vai trò dịu mắt theo chuẩn thiết kế
  const getRoleBadgeClasses = (userRole: UserRole) => {
    switch (userRole) {
      case 'Developer':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Staff':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
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
      <header className="h-14 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Bên trái: Breadcrumb điều hướng */}
        <div className="flex items-center space-x-3">
          <nav className="flex items-center space-x-2 text-xs font-medium">
            <span className="text-slate-500 font-semibold">LivingDocs</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-semibold">{getPageTitle(pathname)}</span>
          </nav>
        </div>

        {/* Bên phải: Thông tin người dùng & Vai trò cố định theo tài khoản */}
        <div className="flex items-center space-x-4 shrink-0">
          <div className="flex items-center space-x-2.5 text-xs">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {currentUser?.avatarLetter || 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-slate-900 leading-tight">
                {currentUser?.name || 'Người dùng'}
              </span>
              <div className="mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border inline-block ${getRoleBadgeClasses(role)}`}>
                  {getRoleLabel(role)}
                </span>
              </div>
            </div>
          </div>

          {/* Nút Đăng xuất để đổi tài khoản khác */}
          <button
            onClick={logout}
            className="btn-press flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition cursor-pointer"
            title="Đăng xuất khỏi phiên làm việc để đăng nhập tài khoản khác"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Modal Tải tài liệu kiểm thử */}
      <TestDataModal />
    </>
  );
}
