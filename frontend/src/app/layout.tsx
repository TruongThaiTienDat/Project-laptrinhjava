import type { Metadata } from 'next';
import './globals.css';
import { LivingDocsProvider } from '@/context/LivingDocsContext';
import { AppShell } from '@/components/AppShell';

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
          <AppShell>{children}</AppShell>
        </LivingDocsProvider>
      </body>
    </html>
  );
}
