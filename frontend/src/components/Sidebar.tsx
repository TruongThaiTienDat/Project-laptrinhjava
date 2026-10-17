'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GitCompare, 
  BookOpen, 
  LayoutDashboard, 
  ShieldCheck, 
  Layers, 
  Workflow
} from 'lucide-react';

// Thanh menu dieu huong ben trai danh cho cac chuc nang cua de tai
export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Tong quan he thong',
      icon: <Layers className="w-4 h-4" />,
      href: '/',
    },
    {
      title: 'Xet duyet quy trinh (Workflow)',
      icon: <Workflow className="w-4 h-4" />,
      href: '/workflow',
      badge: 'Staff/Mgr'
    },
    {
      title: 'So sanh sai lech (Diff View)',
      icon: <GitCompare className="w-4 h-4" />,
      href: '/diff',
      badge: 'AI Drift'
    },
    {
      title: 'Kho tri thuc & Code (KB)',
      icon: <BookOpen className="w-4 h-4" />,
      href: '/knowledge-base',
      badge: 'AST'
    },
    {
      title: 'Bang dieu khien Tech Lead',
      icon: <LayoutDashboard className="w-4 h-4" />,
      href: '/dashboard',
    },
    {
      title: 'Quan tri he thong (Leader)',
      icon: <ShieldCheck className="w-4 h-4" />,
      href: '/admin',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800 select-none">
      {/* Tieu de de tai */}
      <div className="p-5 border-b border-slate-800">
        <h1 className="font-bold text-base tracking-tight text-white leading-tight">
          LivingDocs System
        </h1>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          He thong tai lieu tu cap nhat bang AI
        </p>
      </div>

      {/* Danh sach menu chuc nang */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Phan 5: Frontend Modules
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
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
                      ? 'bg-sky-700 text-white'
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

      {/* Thong tin trang thai dich vu de giang vien danh gia */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-1 font-mono">
        <div className="flex items-center justify-between">
          <span>Backend Spring Boot:</span>
          <span className="text-emerald-400 font-semibold">:8080</span>
        </div>
        <div className="flex items-center justify-between">
          <span>AI Engine FastAPI:</span>
          <span className="text-sky-400 font-semibold">:8000</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 font-sans">
          Do an lap trinh Java • Nhom LivingDocs
        </div>
      </div>
    </aside>
  );
}
