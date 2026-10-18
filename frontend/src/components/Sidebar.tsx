'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GitCompare, 
  BookOpen, 
  BarChart2, 
  Layers, 
  Workflow
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Tổng quan hệ thống',
      icon: <Layers className="w-4 h-4" />,
      href: '/',
    },
    {
      title: 'Xét duyệt tài liệu (Workflow)',
      icon: <Workflow className="w-4 h-4" />,
      href: '/workflow',
    },
    {
      title: 'So sánh thay đổi (Diff View)',
      icon: <GitCompare className="w-4 h-4" />,
      href: '/diff',
    },
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
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800 select-none">
      {/* Tiêu đề ứng dụng */}
      <div className="p-4 border-b border-slate-800">
        <h1 className="font-bold text-base tracking-tight text-white leading-tight">
          LivingDocs
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Hệ thống quản lý tài liệu
        </p>
      </div>

      {/* Danh mục menu chức năng */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          DANH MỤC CHỨC NĂNG
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3.5 py-2.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Thông tin chân trang */}
      <div className="p-4 border-t border-slate-800 text-xs">
        <div className="text-[11px] text-slate-400">
          LivingDocs v1.0 - Đồ án Lập trình Java
        </div>
      </div>
    </aside>
  );
}
