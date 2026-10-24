'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { 
  GitCompare, 
  BookOpen, 
  BarChart2, 
  Layers, 
  Workflow
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { documents } = useLivingDocs();

  // Đếm số lượng tài liệu đang trong hàng đợi chờ duyệt
  const pendingWorkflowCount = documents.filter(d => d.status === 'IN_REVIEW').length;

  // Nhóm 1: Không gian làm việc
  const workspaceGroup = [
    {
      title: 'Tổng quan hệ thống',
      icon: <Layers className="w-4 h-4" />,
      href: '/',
    },
    {
      title: 'Xét duyệt tài liệu (Workflow)',
      icon: <Workflow className="w-4 h-4" />,
      href: '/workflow',
      badge: pendingWorkflowCount,
    },
    {
      title: 'So sánh thay đổi (Diff View)',
      icon: <GitCompare className="w-4 h-4" />,
      href: '/diff',
    },
  ];

  // Nhóm 2: Tri thức & Quản trị
  const governanceGroup = [
    {
      title: 'Kho tri thức (Knowledge Base)',
      icon: <BookOpen className="w-4 h-4" />,
      href: '/knowledge-base',
    },
    {
      title: 'Thống kê & Cấu hình',
      icon: <BarChart2 className="w-4 h-4" />,
      href: '/dashboard',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800 select-none shrink-0 transition-all duration-200">
      {/* Tiêu đề ứng dụng LivingDocs */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            LD
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
              LivingDocs
            </h1>
            <p className="text-[11px] text-slate-400">
              Hệ thống quản lý tài liệu
            </p>
          </div>
        </div>
      </div>

      {/* Danh mục menu chức năng chia 2 nhóm tách biệt */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {/* Nhóm 1: KHÔNG GIAN LÀM VIỆC */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            KHÔNG GIAN LÀM VIỆC
          </div>
          {workspaceGroup.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm translate-x-1'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className={`transition-transform duration-200 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.title}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-2 text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Nhóm 2: TRI THỨC & QUẢN TRỊ */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            TRI THỨC & QUẢN TRỊ
          </div>
          {governanceGroup.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm translate-x-1'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className={`transition-transform duration-200 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Thông tin chân trang */}
      <div className="p-4 border-t border-slate-800 text-xs">
        <div className="text-[11px] text-slate-400">
          LivingDocs v2.0 • Đồ án Lập trình Java
        </div>
      </div>
    </aside>
  );
}
