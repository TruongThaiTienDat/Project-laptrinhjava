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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bảng Quản Lý Dành Cho Leader & Quản Trị Hệ Thống</h1>
            <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200">
              Role: Administrator
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
          className="btn-press inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
        >
          <span>Mở Kafka UI (:8085)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-hover bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">PostgreSQL DB</span>
            <span className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulseSubtle" />
              <span>Active</span>
            </span>
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900">Port 5432</div>
          <p className="text-[11px] text-slate-400">Multi-tenant Schema Isolated</p>
        </div>

        <div className="card-hover bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Redis Cache</span>
            <span className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulseSubtle" />
              <span>Active</span>
            </span>
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900">Port 6379</div>
          <p className="text-[11px] text-slate-400">Session & GitHub Payload Cache</p>
        </div>

        <div className="card-hover bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kafka Broker</span>
            <span className="flex items-center space-x-1 text-[11px] text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulseSubtle" />
              <span>Active</span>
            </span>
          </div>
          <div className="text-xl font-bold font-mono tracking-tight text-slate-900">Port 9092</div>
          <p className="text-[11px] text-slate-400">Event Streaming Cluster</p>
        </div>

        <div className="card-hover bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">DLQ Messages</span>
            <span className="flex items-center space-x-1 text-[11px] text-blue-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Clean</span>
            </span>
          </div>
          <div className="text-xl font-bold font-mono tracking-tight tabular-nums text-blue-600">0 Lỗi tồn đọng</div>
          <p className="text-[11px] text-slate-400">Dead Letter Queue sạch sẽ</p>
        </div>
      </div>

      {/* System Logs Table */}
      <section className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Nhật ký & Hoạt động hạ tầng gần đây</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Real-time Telemetry</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">Thời gian</th>
                <th className="py-2.5 px-4">Dịch vụ</th>
                <th className="py-2.5 px-4">Sự kiện</th>
                <th className="py-2.5 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">Vừa xong</td>
                <td className="py-3 px-4 font-semibold text-slate-900">Next.js Frontend</td>
                <td className="py-3 px-4 text-slate-700">Tích hợp Diff View, Knowledge Base, Workflow Review UI & Tech Lead Dashboard</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    <span>SUCCESS</span>
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">10 phút trước</td>
                <td className="py-3 px-4 font-semibold text-slate-900">Backend Workflow</td>
                <td className="py-3 px-4 text-slate-700">Hoàn thành API luồng xét duyệt tài liệu và audit log KAN-17</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    <span>SUCCESS</span>
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">Hôm qua</td>
                <td className="py-3 px-4 font-semibold text-slate-900">Docker Infrastructure</td>
                <td className="py-3 px-4 text-slate-700">Khởi tạo dịch vụ Postgres, Redis, Kafka, DLQ UI KAN-10</td>
                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
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
