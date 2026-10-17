'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  Server, 
  Activity, 
  Inbox, 
  Users, 
  FileText, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';

export default function LeaderAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Bảng Quản Lý Dành Cho Leader & Quản Trị Hệ Thống</h1>
            <span className="px-2.5 py-0.5 text-xs bg-sky-100 text-sky-800 rounded font-semibold border border-sky-200">
              Role: Team Leader / Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi hạ tầng Microservices, trạng thái Kafka DLQ (Dead Letter Queue) và luồng hoạt động tổng thể.
          </p>
        </div>

        <a
          href="http://localhost:8085"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <span>Mở Kafka UI (:8085)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">POSTGRESQL DB</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-emerald-600">Active (Port 5432)</div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-tenant Schema Isolated</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">REDIS CACHE</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-emerald-600">Active (Port 6379)</div>
          <p className="text-[11px] text-slate-400 mt-1">Caching Session & VietQR Txn</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">KAFKA BROKER</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-emerald-600">Active (Port 9092)</div>
          <p className="text-[11px] text-slate-400 mt-1">Event Streaming Cluster</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">DLQ MESSAGES</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-blue-600">0 Lỗi tồn đọng</div>
          <p className="text-[11px] text-slate-400 mt-1">Dead Letter Queue sạch sẽ</p>
        </div>
      </div>

      {/* System Logs Table */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-sky-600" />
          <span>Nhật Ký & Hoạt Động Hạ Tầng Gần Đây</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Dịch vụ</th>
                <th className="py-3 px-4">Sự kiện</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-500">Vừa xong</td>
                <td className="py-3 px-4 font-bold text-slate-900">Next.js Frontend (TV5)</td>
                <td className="py-3 px-4 text-slate-700">Tích hợp Diff View, Knowledge Base, Workflow Review UI & Tech Lead Dashboard</td>
                <td className="py-3 px-4">
                  <span className="font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SUCCESS</span>
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-500">10 phút trước</td>
                <td className="py-3 px-4 font-bold text-slate-900">Backend Workflow (TV3)</td>
                <td className="py-3 px-4 text-slate-700">Hoàn thành API luồng xét duyệt tài liệu và audit log KAN-17</td>
                <td className="py-3 px-4">
                  <span className="font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SUCCESS</span>
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-500">Hôm qua</td>
                <td className="py-3 px-4 font-bold text-slate-900">Docker Infrastructure (TV1)</td>
                <td className="py-3 px-4 text-slate-700">Khởi tạo dịch vụ Postgres, Redis, Kafka, DLQ UI KAN-10</td>
                <td className="py-3 px-4">
                  <span className="font-bold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SUCCESS</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

