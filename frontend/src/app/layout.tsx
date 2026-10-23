import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LivingDocsProvider } from '@/context/LivingDocsContext';

export const metadata: Metadata = {
  title: 'LivingDocs - Hệ thống quản lý tài liệu',
  description: 'Hệ thống quản lý và cập nhật tài liệu kỹ thuật LivingDocs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <LivingDocsProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Header />
              <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
                {children}
              </main>
            </div>
          </div>
        </LivingDocsProvider>
      </body>
    </html>
  );
}
