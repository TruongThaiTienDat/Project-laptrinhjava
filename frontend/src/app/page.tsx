'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GitCompare, 
  Workflow, 
  BookOpen, 
  LayoutDashboard, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  GitPullRequest,
  Clock
} from 'lucide-react';

export default function LivingDocsHome() {
  const modules = [
    {
      title: 'Xét Duyệt Quy Trình (Workflow UI)',
      desc: 'Quản lý luồng kiểm duyệt 2 cấp: Staff rà soát nội dung & Manager phê duyệt xuất bản chính thức.',
      href: '/workflow',
      icon: <Workflow className="w-6 h-6 text-indigo-500" />,
      color: 'border-indigo-200 hover:border-indigo-400',
      badge: 'Bắt buộc quy trình',
      actionText: 'Vào luồng xét duyệt'
    },
    {
      title: 'Bộ So Sánh Sai Lệch (Diff View)',
      desc: 'Trực quan hóa khác biệt giữa tài liệu hiện tại và bản tự cập nhật từ AI, hiển thị bằng chứng (Grounding Evidence).',
      href: '/diff',
      icon: <GitCompare className="w-6 h-6 text-sky-500" />,
      color: 'border-sky-200 hover:border-sky-400',
      badge: 'Split & Unified',
      actionText: 'Mở bộ so sánh'
    },
    {
      title: 'Kho Tri Thức & Code (Knowledge Base)',
      desc: 'Tìm kiếm tài liệu kết nối thực thể AST, duyệt cây quan hệ Document-to-Code và các mẫu template.',
      href: '/knowledge-base',
      icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
      color: 'border-emerald-200 hover:border-emerald-400',
      badge: 'AST Connected',
      actionText: 'Khám phá kho tri thức'
    },
    {
      title: 'Bảng Điều Khiển Tech Lead',
      desc: 'Theo dõi chỉ số sức khỏe tài liệu, tỷ lệ bao phủ (Coverage Gaps), quản trị mẫu và lịch sử thay đổi (Change Logs).',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-6 h-6 text-purple-500" />,
      color: 'border-purple-200 hover:border-purple-400',
      badge: 'Governance & Metrics',
      actionText: 'Xem dashboard kỹ thuật'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-semibold mb-4 border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nhiệm vụ Thành viên 5: ReactJS / Next.js Frontend Specialist</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            LivingDocs System
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Hệ thống tài liệu tự cập nhật với sự hỗ trợ của trí tuệ nhân tạo (AI-Assisted Self-Updating Document System).
            Tự động phát hiện <span className="text-sky-400 font-semibold">Documentation Drift</span> từ Pull Request & Commit, 
            kết hợp quy trình kiểm duyệt có kiểm soát <span className="text-indigo-400 font-semibold">Human-in-the-Loop</span> (Staff & Manager).
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/workflow"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-lg shadow-sky-500/30"
            >
              <Workflow className="w-4 h-4" />
              <span>Vào hàng đợi xét duyệt (Staff / Manager)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <Link
              href="/diff"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
            >
              <GitCompare className="w-4 h-4 text-sky-400" />
              <span>Thử nghiệm Diff View Component</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tài liệu quản lý</span>
            <span className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900">4</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">100% được liên kết AST Code</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Chờ duyệt (In Review)</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-amber-600">1</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Staff cần kiểm tra bước 1</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Chờ xuất bản (Approved)</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-blue-600">1</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Manager sẵn sàng ấn Publish</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Độ tin cậy AI</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-emerald-600">96.4%</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Kèm Grounding Evidence</div>
        </div>
      </div>

      {/* 4 Core Functional Modules */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Các Thành Phần Chức Năng Cốt Lõi (Phần 5 Frontend)</h2>
          <p className="text-xs text-slate-500">Được xây dựng đầy đủ theo đề cương LivingDocs và phân công nhiệm vụ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {modules.map((m) => (
            <div
              key={m.href}
              className={`bg-white rounded-xl p-6 border transition shadow-sm hover:shadow-md flex flex-col justify-between ${m.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {m.icon}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700">
                    {m.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{m.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{m.desc}</p>
              </div>

              <Link
                href={m.href}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 pt-3 border-t border-slate-100"
              >
                <span>{m.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
