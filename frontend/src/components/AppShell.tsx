'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoaded } = useLivingDocs();

  const isLoginPage = pathname === '/login';

  // Điều hướng bắt buộc: Nếu chưa đăng nhập thì tự động chuyển hướng về /login trước
  useEffect(() => {
    if (!isLoaded) return;
    if (!isAuthenticated && !isLoginPage) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoaded, isLoginPage, router]);

  // Trong khi chờ đọc trạng thái xác thực từ localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2.5 text-slate-500 text-xs font-medium">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Đang tải hệ thống LivingDocs...</span>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập và đang cố truy cập các trang khác: chờ chuyển hướng
  if (!isAuthenticated && !isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2.5 text-slate-500 text-xs font-medium">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Đang chuyển hướng về trang đăng nhập...</span>
        </div>
      </div>
    );
  }

  // Khi đang ở trang đăng nhập /login: ẩn Sidebar và Header, căn giữa toàn màn hình
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fadeIn">
        {children}
      </div>
    );
  }

  // Giao diện chính sau khi người dùng đã đăng nhập hợp lệ
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 w-full px-8 py-6 space-y-6 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}
