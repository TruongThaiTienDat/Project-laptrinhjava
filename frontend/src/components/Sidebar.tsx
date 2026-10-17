'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  GitPullRequest, 
  GitCompare, 
  BookOpen, 
  LayoutDashboard, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Workflow
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Tổng quan LivingDocs',
      icon: <Layers className="w-4 h-4" />,
      href: '/',
    },
    {
      title: 'Xét duyệt quy trình (Workflow)',
      icon: <Workflow className="w-4 h-4" />,
      href: '/workflow',
      badge: 'Staff / Mgr'
    },
    {
      title: 'So sánh sai lệch (Diff View)',
      icon: <GitCompare className="w-4 h-4" />,
      href: '/diff',
      badge: 'AI Drift'
    },
    {
      title: 'Kho tri thức & Code (KB)',
      icon: <BookOpen className="w-4 h-4" />,
      href: '/knowledge-base',
    },
    {
      title: 'Bảng điều khiển Tech Lead',
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: '/dashboard',
    },
    {
      title: 'Quản trị hệ thống (Leader)',
      icon: <ShieldCheck className="w-4 h-4" />,
      href: '/admin',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800 select-none">
      {/* Brand header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white leading-tight">
            Living<span className="text-sky-400">Docs</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Self-Updating AI Docs</p>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Phần 5: Frontend Modules
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>Backend Microservices:</span>
          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Online :8080</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>AI Engine (FastAPI):</span>
          <span className="text-sky-400 font-semibold">Online :8000</span>
        </div>
        <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
          Thành viên 5 • Next.js & React Frontend
        </div>
      </div>
    </aside>
  );
}
