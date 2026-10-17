'use client';

import React, { useState, useEffect } from 'react';
import { 
  workflowApi, 
  ChangeLogItem, 
  templatesData 
} from '@/services/api';
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
  Sparkles, 
  Download, 
  RotateCcw, 
  Filter, 
  Sliders, 
  GitBranch, 
  Share2, 
  Layers,
  CheckCircle2,
  PieChart,
  FolderTree
} from 'lucide-react';

export default function TechLeadDashboardPage() {
  const [auditLogs, setAuditLogs] = useState<ChangeLogItem[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [blockPrMergeOnCritical, setBlockPrMergeOnCritical] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    workflowApi.getAllLogs().then(logs => setAuditLogs(logs));
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    if (selectedRoleFilter !== 'ALL' && !log.role.includes(selectedRoleFilter)) return false;
    return true;
  });

  const handleExportReport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('Đã xuất báo cáo tuân thủ tài liệu LivingDocs (PDF/Markdown) thành công!');
    }, 1200);
  };

  const handleRollbackGlobal = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục toàn bộ tài liệu về điểm mốc ổn định v1.0 gần nhất?')) {
      alert('Đã kích hoạt rollback phiên bản an toàn!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Bảng Điều Khiển Quản Trị Tech Lead (Governance Dashboard)</h1>
            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded font-semibold border border-purple-200">
              Role: Tech Lead / Doc Owner
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi chỉ số sức khỏe tài liệu, cây quan hệ tác động (Impact Analysis), quản trị chính sách tự động cập nhật và kiểm soát Change Log.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportReport}
            disabled={exporting}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>{exporting ? 'Đang xuất file...' : 'Xuất Báo Cáo Sức Khỏe'}</span>
          </button>

          <button
            onClick={handleRollbackGlobal}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Rollback Toàn Hệ Thống</span>
          </button>
        </div>
      </div>

      {/* 4 Health Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Độ tươi mới (Freshness)</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">94.8%</span>
            <span className="text-xs text-emerald-600 font-semibold">Tốt (+2.1%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tài liệu đồng bộ sát với commit gần nhất</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ bao phủ (Coverage)</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">82.4%</span>
            <span className="text-xs text-amber-600 font-semibold">2 khoảng trống</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">14/17 methods & endpoints có tài liệu</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cảnh báo Drift tồn đọng</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-600">1</span>
            <span className="text-xs text-rose-500 font-semibold">1 Critical (VietQR)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cần Manager duyệt xuất bản</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tự động hóa AI (Self-Update)</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-purple-600">88.5%</span>
            <span className="text-xs text-purple-600 font-semibold">Tiết kiệm 14h viết tay</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tự động sinh khi PR được mở</p>
        </div>
      </div>

      {/* Impact Analysis & Dependency Graph */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-purple-600" />
              <span>Sơ Đồ Phụ Thuộc Tài Liệu & Phân Tích Tác Động (Impact Analysis)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Khi mã nguồn tại nhánh PR thay đổi, sơ đồ chỉ rõ các module và tài liệu bị tác động dây chuyền.
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-purple-50 text-purple-800 rounded font-semibold border border-purple-200">
            Interactive AST Graph
          </span>
        </div>

        {/* Visual node flowchart cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">1. Git Ingestion</span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">PR #4</span>
            </div>
            <p className="text-slate-600 font-mono text-[11px]">WorkflowController.java</p>
            <div className="text-slate-400 text-[10px]">Tác động trực tiếp: 4 Endpoints mới</div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900">2. AI AST Parser & RAG</span>
              <span className="text-[10px] font-mono bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-bold">FastAPI</span>
            </div>
            <p className="text-indigo-800 font-mono text-[11px]">Trích xuất AST: Signature Drift</p>
            <div className="text-indigo-600 text-[10px]">Độ tin cậy: 94.0% (Grounded)</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">3. Tài Liệu Cần Cập Nhật</span>
              <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Target</span>
            </div>
            <p className="text-emerald-800 font-mono text-[11px]">README.md (v1.0 ➔ v2.0)</p>
            <div className="text-emerald-700 text-[10px]">Đang trong luồng duyệt của Staff</div>
          </div>
        </div>
      </div>

      {/* Governance Policy Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Governance Config */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-purple-600" />
            <span>Chính Sách Quản Trị Tự Động Hóa (Policy Config)</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Auto-update toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Tự động sinh tài liệu khi có PR</span>
                <span className="text-slate-500 text-[11px]">Tự động kích hoạt AI đọc AST và tạo bản Draft</span>
              </div>
              <input
                type="checkbox"
                checked={autoUpdateEnabled}
                onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Merge block policy */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block">Chặn Merge PR khi có Critical Drift</span>
                <span className="text-slate-500 text-[11px]">Không cho phép hợp nhất code nếu tài liệu chưa được duyệt</span>
              </div>
              <input
                type="checkbox"
                checked={blockPrMergeOnCritical}
                onChange={(e) => setBlockPrMergeOnCritical(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Confidence Threshold slider */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Ngưỡng tin cậy tối thiểu AI (Confidence Threshold)</span>
                <span className="font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {confidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="99"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Nếu điểm tin cậy thấp hơn {confidenceThreshold}%, tài liệu bắt buộc phải có Staff kiểm tra kỹ lưỡng.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Global Audit Log & Rollback Center */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-purple-600" />
              <span>Nhật Ký Thay Đổi Toàn Hệ Thống (Audit Change Logs)</span>
            </h3>

            {/* Role Filter */}
            <div className="flex items-center space-x-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="AI">Chỉ AI</option>
                <option value="Staff">Chỉ Staff</option>
                <option value="Manager">Chỉ Manager</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="font-bold text-purple-700">[{log.role}]</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-semibold">{log.fromStatus} ➔ {log.toStatus}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">{log.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
