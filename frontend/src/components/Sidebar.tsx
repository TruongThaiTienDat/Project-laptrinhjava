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
  Workflow,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { documents } = useLivingDocs();

  // Đếm số lượng tài liệu đang trong hàng đợi chờ duyệt
  const pendingWorkflowCount = documents.filter(d => d.status === 'IN_REVIEW').length;

  // Nhóm 1: Không gian làm việc chính
  const workspaceGroup = [
    {
      title: 'Tổng quan hệ thống',
      icon: <Layers className="w-4 h-4" />,
      href: '/',
      description: 'Giám sát tài liệu & AST drift'
    },
    {
      title: 'Xét duyệt tài liệu',
      icon: <Workflow className="w-4 h-4" />,
      href: '/workflow',
      badge: pendingWorkflowCount,
      description: 'Quy trình kiểm duyệt 2 cấp'
    },
    {
      title: 'So sánh thay đổi (Diff)',
      icon: <GitCompare className="w-4 h-4" />,
      href: '/diff',
      description: 'Đối chiếu mã nguồn và tài liệu'
    },
  ];

  // Nhóm 2: Tri thức & Quản trị
  const governanceGroup = [
    {
      title: 'Kho tri thức (Knowledge Base)',
      icon: <BookOpen className="w-4 h-4" />,
      href: '/knowledge-base',
      description: 'Thư viện tài liệu kỹ thuật'
    },
    {
      title: 'Thống kê & Cấu hình',
      icon: <BarChart2 className="w-4 h-4" />,
      href: '/dashboard',
      description: 'Chỉ số hiệu năng & Rollback'
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col min-h-screen border-r border-slate-800/90 select-none shrink-0 transition-all duration-200">
      {/* Tiêu đề ứng dụng LivingDocs chuẩn Enterprise Monogram */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20 ring-1 ring-white/10 shrink-0">
            LD
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                LivingDocs
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              DocuSync & AST Engine
            </p>
          </div>
        </div>
      </div>

      {/* Danh mục menu điều hướng chính */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Nhóm 1: KHÔNG GIAN LÀM VIỆC */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Không gian làm việc
          </div>
          {workspaceGroup.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn-press group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className={`transition-colors duration-150 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.title}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums shrink-0 ${
                    isActive 
                      ? 'bg-amber-400 text-slate-950 font-mono' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulseSubtle'
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
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Tri thức & Quản trị
          </div>
          {governanceGroup.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn-press group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-xs border-l-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className={`transition-colors duration-150 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Thông tin chân trang chuẩn kỹ thuật */}
      <div className="p-3.5 border-t border-slate-800/80 text-xs space-y-1.5">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulseSubtle shrink-0" />
          <span className="truncate">AST Engine: Hoạt động</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          LivingDocs v2.0 • Đồ án Lập trình Java
        </div>
      </div>
    </aside>
  );
}
