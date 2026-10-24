'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Upload,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Code,
  GitPullRequest,
  GitCommit,
  Check,
  Activity,
  Layers,
  Sparkles,
  GitCompare,
  ArrowUpRight,
  Database,
  Cpu,
  Radio
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { DocumentItem } from '@/services/api';

export default function HomePage() {
  const router = useRouter();
  const { documents, deleteDocument, setIsTestModalOpen } = useLivingDocs();

  // State bộ lọc và thanh công cụ
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterTab, setSelectedFilterTab] = useState<'ALL' | 'PENDING' | 'CRITICAL' | 'PUBLISHED'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Slide-over Drawer xem nhanh
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Đồng bộ GitHub mô phỏng
  const handleSyncGitHub = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Đã đồng bộ 3 Pull Requests mới nhất từ GitHub Webhook!');
    }, 450);
  };

  // Đếm số lượng tài liệu theo trạng thái
  const inReviewCount = documents.filter(d => d.status === 'IN_REVIEW').length;
  const approvedCount = documents.filter(d => d.status === 'APPROVED' || d.status === 'PUBLISHED').length;
  const criticalCount = documents.filter(d => d.driftSeverity === 'Critical' || d.driftSeverity === 'High').length;

  // Lọc danh sách tài liệu
  const filteredDocuments = documents.filter(doc => {
    if (selectedFilterTab === 'PENDING' && doc.status !== 'IN_REVIEW') return false;
    if (selectedFilterTab === 'CRITICAL' && doc.driftSeverity !== 'Critical' && doc.driftSeverity !== 'High') return false;
    if (selectedFilterTab === 'PUBLISHED' && doc.status !== 'PUBLISHED' && doc.status !== 'APPROVED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchCat = doc.category.toLowerCase().includes(q);
      const matchFile = doc.groundingEvidence?.sourceFile.toLowerCase().includes(q);
      const matchEntity = doc.groundingEvidence?.codeEntity.toLowerCase().includes(q);
      return matchTitle || matchCat || matchFile || matchEntity;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto">
      {/* Toast Notification trượt nổi góc trên */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center space-x-2 border border-slate-700 animate-scaleIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hàng 1: Header Action Bar chuẩn Enterprise Developer Platform */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-1 border-b border-slate-200/60">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tổng quan tài liệu & Giám sát sai lệch
            </h1>
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulseSubtle" />
              <span>AST Sync: Hoạt động</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nền tảng tự động đối chiếu tài liệu kỹ thuật với mã nguồn qua AST Parser, Grounding Evidence và quy trình duyệt 2 cấp.
          </p>
        </div>

        {/* Cụm nút hành động bên phải */}
        <div className="flex items-center space-x-2.5">
          {/* Nút Đồng bộ GitHub PRs */}
          <button
            onClick={handleSyncGitHub}
            disabled={isSyncing}
            className="btn-press flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium shadow-2xs cursor-pointer"
            title="Kích hoạt kiểm tra Pull Request và Webhook mới nhất từ GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ GitHub'}</span>
          </button>

          {/* Nút Tải tài liệu ngoài lên kiểm thử */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="btn-press flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Tải tài liệu kiểm thử</span>
          </button>
        </div>
      </div>

      {/* Hàng 2: 4 Thẻ KPI Tinh Gọn Theo Chuẩn app-screens.md (Type over Tiles, Flat surfaces, Real Context) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Tổng số tài liệu AST */}
        <div className="card-hover bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase text-[10px]">
              Tổng tài liệu giám sát
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-slate-900">
            {documents.length}
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>100% liên kết mã nguồn</span>
            <span className="font-mono text-slate-400">3 modules</span>
          </div>
        </div>

        {/* Thẻ 2: Hàng đợi chờ duyệt */}
        <div className="card-hover bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase text-[10px]">
              Hàng đợi chờ duyệt
            </span>
            <span className={`w-2 h-2 rounded-full ${inReviewCount > 0 ? 'bg-amber-500 animate-pulseSubtle' : 'bg-slate-300'}`} />
          </div>
          <div className={`text-3xl font-bold font-mono tracking-tight tabular-nums ${inReviewCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {inReviewCount}
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className={inReviewCount > 0 ? 'text-amber-700 font-medium' : ''}>
              {inReviewCount > 0 ? 'Cần Staff & Manager duyệt' : 'Không có tồn đọng'}
            </span>
            <span className="font-mono text-slate-400">SLA: 24h</span>
          </div>
        </div>

        {/* Thẻ 3: Đã phê duyệt / Xuất bản */}
        <div className="card-hover bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase text-[10px]">
              Đã xuất bản (v2.0)
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-mono tracking-tight tabular-nums text-emerald-600">
            {approvedCount}
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-medium">Bản chính thức toàn hệ thống</span>
            <span className="font-mono text-slate-400">Khớp 100%</span>
          </div>
        </div>

        {/* Thẻ 4: Cảnh báo sai lệch (Drift) */}
        <div className="card-hover bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase text-[10px]">
              Cảnh báo sai lệch (Drift)
            </span>
            <span className={`w-2 h-2 rounded-full ${criticalCount > 0 ? 'bg-rose-500 animate-pulseSubtle' : 'bg-slate-300'}`} />
          </div>
          <div className={`text-3xl font-bold font-mono tracking-tight tabular-nums ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {criticalCount}
          </div>
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className={criticalCount > 0 ? 'text-rose-700 font-medium' : ''}>
              {criticalCount > 0 ? '2 Critical • 2 High' : 'Đồng bộ hoàn toàn'}
            </span>
            <span className="font-mono text-slate-400">PR #22, #25</span>
          </div>
        </div>
      </div>

      {/* Hàng 3: Bố Cục Lưới 12 Cột (8 Cột Bảng Quản Lý + 4 Cột Widget Giám Sát Hoạt Động) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT CHÍNH (8 CỘT): Bảng Danh Sách Tài Liệu & PR Giám Sát Chuẩn Enterprise */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {/* Header Bảng & Thanh công cụ lọc */}
          <div className="p-4 border-b border-slate-200/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <h2 className="text-sm font-bold text-slate-900">
                  Tài liệu kỹ thuật & Giám sát sai lệch
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 tabular-nums">
                  {filteredDocuments.length} tài liệu
                </span>
              </div>

              {/* Ô tìm kiếm nhanh với shortcut indicator */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lọc tên file, class, method..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-slate-50/50 transition"
                />
              </div>
            </div>

            {/* Các Tab lọc nhanh với phong cách Pill tinh gọn */}
            <div className="flex items-center space-x-1.5 border-t border-slate-100 pt-2.5 text-xs">
              {[
                { key: 'ALL', label: 'Tất cả' },
                { key: 'PENDING', label: `Chờ duyệt (${inReviewCount})` },
                { key: 'CRITICAL', label: `Cảnh báo Drift (${criticalCount})` },
                { key: 'PUBLISHED', label: 'Đã xuất bản' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedFilterTab(tab.key as any)}
                  className={`btn-press px-3 py-1 rounded-md font-medium cursor-pointer transition ${
                    selectedFilterTab === tab.key
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nội dung bảng chuẩn Rules and Alignment (app-screens.md) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/90 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Tài liệu & Module</th>
                  <th className="py-3 px-3">File mã nguồn</th>
                  <th className="py-3 px-3">Commit / PR</th>
                  <th className="py-3 px-3">Độ tin cậy AI</th>
                  <th className="py-3 px-3">Mức độ lệch</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Không tìm thấy tài liệu nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => {
                    const codeFile = doc.groundingEvidence?.sourceFile || 'Chưa liên kết';
                    const prLabel = doc.groundingEvidence?.pullRequest 
                      ? doc.groundingEvidence.pullRequest.split(':')[0].trim()
                      : null;
                    const commitSha = doc.groundingEvidence?.commitHash
                      ? doc.groundingEvidence.commitHash.slice(0, 7)
                      : 'f5db245';
                    const confScore = Math.round((doc.confidenceScore || 0.92) * 100);

                    return (
                      <tr 
                        key={doc.id} 
                        onClick={() => setPreviewDoc(doc)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                {doc.title.split(' - ')[0]}
                              </div>
                              <div className="text-slate-400 text-[11px] flex items-center space-x-1.5 mt-0.5">
                                <span className="font-medium text-slate-600">{doc.category}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px]">v{doc.version}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 inline-block font-mono">
                            {codeFile.split('/').pop()}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1 items-start">
                            {prLabel && (
                              <span 
                                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/80 font-mono text-[10px] font-semibold tracking-tight shadow-2xs"
                                title={`Pull Request: ${doc.groundingEvidence?.pullRequest}`}
                              >
                                <GitPullRequest className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                                <span>{prLabel}</span>
                              </span>
                            )}
                            <span 
                              className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 font-mono text-[10px] transition-colors cursor-default"
                              title={`Mã Commit SHA: ${doc.groundingEvidence?.commitHash}`}
                            >
                              <GitCommit className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                              <span className="font-semibold">{commitSha}</span>
                            </span>
                          </div>
                        </td>

                        {/* Cột độ tin cậy AI với thanh tiến độ mảnh */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  confScore >= 95 ? 'bg-emerald-500' : confScore >= 90 ? 'bg-blue-500' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${confScore}%` }} 
                              />
                            </div>
                            <span className="font-mono text-[11px] font-medium tabular-nums text-slate-700">
                              {confScore}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <SeverityBadge severity={doc.driftSeverity} />
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge status={doc.status} />
                        </td>

                        <td className="py-3 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="btn-press inline-flex items-center px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-medium transition cursor-pointer"
                            title="Xem chi tiết tài liệu"
                          >
                            <span>Xem</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa tài liệu "${doc.title.split(' - ')[0]}"?`)) {
                                deleteDocument(doc.id);
                                showToast(`Đã xóa tài liệu #${doc.id}`);
                              }
                            }}
                            className="btn-press inline-flex items-center text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Chân bảng: Phân trang & Thống kê */}
          <div className="p-3 bg-slate-50/50 border-t border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị <strong className="tabular-nums font-mono text-slate-800">{filteredDocuments.length}</strong> trong tổng số <strong className="tabular-nums font-mono text-slate-800">{documents.length}</strong> tài liệu
            </span>
            <div className="flex items-center space-x-1">
              <button disabled className="px-2.5 py-1 border border-slate-200 rounded bg-white text-slate-400 cursor-not-allowed">
                Trước
              </button>
              <button className="px-2.5 py-1 border border-slate-900 rounded bg-slate-900 text-white font-medium shadow-2xs">
                1
              </button>
              <button disabled className="px-2.5 py-1 border border-slate-200 rounded bg-white text-slate-400 cursor-not-allowed">
                Sau
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHỤ (4 CỘT): Live CI/CD Activity Feed & Module Health */}
        <div className="lg:col-span-4 space-y-6">
          {/* KHỐI 1: Nhật ký sự kiện CI/CD & GitHub Webhook (Live Activity Feed Timeline) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulseSubtle" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Nhật ký hoạt động • CI/CD & Webhook
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Trực tiếp</span>
            </div>

            {/* Timeline nối các sự kiện */}
            <div className="relative pl-4 space-y-4 text-xs before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Event 1 */}
              <div className="relative flex items-start space-x-2.5">
                <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                <div className="min-w-0 flex-1 pl-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">GitHub Webhook Push</span>
                    <span className="text-[10px] text-slate-400 font-mono">2p trước</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Commit <code className="font-mono text-blue-600 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">f5db245</code> đẩy lên nhánh <strong className="text-slate-700">main</strong>.
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative flex items-start space-x-2.5">
                <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white" />
                <div className="min-w-0 flex-1 pl-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">AST Parser Sync</span>
                    <span className="text-[10px] text-slate-400 font-mono">8p trước</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Trích xuất 5 methods trong <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.2 rounded">WorkflowController.java</code>.
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative flex items-start space-x-2.5">
                <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div className="min-w-0 flex-1 pl-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Staff Đã Duyệt</span>
                    <span className="text-[10px] text-slate-400 font-mono">18p trước</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nguyễn Thành Đồng xác thực Grounding Evidence tài liệu <strong className="text-slate-700">Webhook_Guide.md</strong>.
                  </p>
                </div>
              </div>

              {/* Event 4 */}
              <div className="relative flex items-start space-x-2.5">
                <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-white" />
                <div className="min-w-0 flex-1 pl-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Manager Xuất Bản</span>
                    <span className="text-[10px] text-slate-400 font-mono">45p trước</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Phạm Thị Thúy Kiều xuất bản phiên bản chính thức <strong className="text-slate-700">v2.0</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KHỐI 2: Trạng Thái Dịch Vụ & Độ Bao Phủ Theo Module */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>Độ bao phủ theo Module</span>
              </h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                Ổn định 92.3%
              </span>
            </div>

            {/* Thanh phần trăm độ bao phủ tài liệu */}
            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700 flex items-center space-x-1.5">
                    <Database className="w-3 h-3 text-slate-400" />
                    <span>Backend Core (Spring Boot)</span>
                  </span>
                  <span className="text-blue-600 font-mono font-bold tabular-nums">94%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700 flex items-center space-x-1.5">
                    <Cpu className="w-3 h-3 text-slate-400" />
                    <span>AI Engine (FastAPI & AST)</span>
                  </span>
                  <span className="text-indigo-600 font-mono font-bold tabular-nums">98%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: '98%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700 flex items-center space-x-1.5">
                    <Radio className="w-3 h-3 text-slate-400" />
                    <span>Kafka Streaming & DLQ</span>
                  </span>
                  <span className="text-amber-600 font-mono font-bold tabular-nums">85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-300" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Quick Preview Drawer (Trượt từ phải sang khi click dòng) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Nền mờ Backdrop */}
          <div 
            onClick={() => setPreviewDoc(null)} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200" 
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideInRight">
              {/* Header Drawer */}
              <div className="p-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {previewDoc.title.split(' - ')[0]}
                  </span>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="btn-press p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Drawer */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
                {/* Trạng thái & Mức độ lệch */}
                <div className="flex items-center space-x-2">
                  <StatusBadge status={previewDoc.status} />
                  <SeverityBadge severity={previewDoc.driftSeverity} />
                </div>

                {/* Grounding Evidence */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Grounding Evidence (Bằng chứng mã nguồn)</span>
                  </div>
                  <div className="text-slate-600 space-y-1 text-[11px]">
                    <div>
                      File: <code className="font-mono text-slate-800 bg-white px-1 py-0.2 rounded border">{previewDoc.groundingEvidence?.sourceFile || 'N/A'}</code>
                    </div>
                    <div>
                      Entity: <strong className="text-slate-800">{previewDoc.groundingEvidence?.codeEntity || 'N/A'}</strong>
                    </div>
                    <div>
                      Commit: <span className="font-mono text-slate-700">{previewDoc.groundingEvidence?.commitHash ? previewDoc.groundingEvidence.commitHash.slice(0, 7) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Đoạn code Diff trích xuất */}
                {previewDoc.groundingEvidence?.diffSnippet && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                      Đoạn Code Diff trích xuất
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                      {previewDoc.groundingEvidence.diffSnippet}
                    </pre>
                  </div>
                )}

                {/* Nội dung tài liệu cập nhật đề xuất */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Nội dung tài liệu cập nhật đề xuất
                  </span>
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 font-mono text-[11px] whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed text-slate-800">
                    {previewDoc.content}
                  </div>
                </div>
              </div>

              {/* Footer Drawer */}
              <div className="p-4 border-t border-slate-200/90 bg-slate-50/70 flex items-center justify-between gap-3">
                <Link
                  href="/diff"
                  className="btn-press flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium shadow-2xs"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Mở So sánh (Diff)</span>
                </Link>
                <Link
                  href="/workflow"
                  className="btn-press flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm shadow-blue-500/20"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Xử lý tại Workflow</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
