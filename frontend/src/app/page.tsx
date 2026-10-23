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
  Activity
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
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification trượt nổi góc trên */}
      {toastMessage && (
        <div className="fixed top-16 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center space-x-2 border border-slate-700 animate-scaleIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hàng 1: Header Action Bar chuẩn Enterprise */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Nền tảng giám sát sai lệch tài liệu kỹ thuật, tự động hóa AST và quy trình kiểm duyệt 2 cấp.
          </p>
        </div>

        {/* Cụm nút hành động bên phải: Chỉ giữ lại 2 nút thực tế */}
        <div className="flex items-center space-x-2.5">
          {/* Nút Đồng bộ GitHub PRs */}
          <button
            onClick={handleSyncGitHub}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium transition shadow-2xs"
            title="Kích hoạt kiểm tra Pull Request và Webhook mới nhất từ GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Đang quét PR...' : 'Đồng bộ GitHub (Sync)'}</span>
          </button>

          {/* Nút Tải tài liệu ngoài lên kiểm thử */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Tải tài liệu kiểm thử</span>
          </button>
        </div>
      </div>

      {/* Hàng 2: 4 Thẻ KPI Tinh Gọn (Tiêu đề, Con số lớn, 1 dòng mô tả, Thanh tiến độ mảnh) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Tổng số tài liệu */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-200 space-y-2.5">
          <span className="text-xs font-medium text-slate-500">Tổng tài liệu giám sát</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {documents.length}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            Tài liệu kỹ thuật được quản lý tự động
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Thẻ 2: Hàng đợi chờ duyệt */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-200 space-y-2.5">
          <span className="text-xs font-medium text-slate-500">Hàng đợi chờ duyệt</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {inReviewCount}
          </div>
          <p className="text-[11px] text-amber-600 truncate">
            {inReviewCount > 0 ? `${inReviewCount} tài liệu cần Staff & Manager kiểm tra` : 'Không có tài liệu tồn đọng'}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, Math.max(10, (inReviewCount / (documents.length || 1)) * 100))}%` }} 
            />
          </div>
        </div>

        {/* Thẻ 3: Đã phê duyệt & Xuất bản */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-200 space-y-2.5">
          <span className="text-xs font-medium text-slate-500">Đã phê duyệt / Xuất bản</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {approvedCount}
          </div>
          <p className="text-[11px] text-emerald-600 truncate">
            Đã ban hành chính thức trên toàn hệ thống
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, Math.max(15, (approvedCount / (documents.length || 1)) * 100))}%` }} 
            />
          </div>
        </div>

        {/* Thẻ 4: Cảnh báo sai lệch (Drift) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-200 space-y-2.5">
          <span className="text-xs font-medium text-slate-500">Cảnh báo sai lệch (Drift)</span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {criticalCount}
          </div>
          <p className="text-[11px] text-rose-600 truncate">
            {criticalCount > 0 ? `${criticalCount} tài liệu cần đồng bộ lại với mã nguồn` : 'Tất cả tài liệu khớp hoàn toàn'}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-rose-500 h-1.5 rounded-full" 
              style={{ width: `${Math.min(100, Math.max(10, (criticalCount / (documents.length || 1)) * 100))}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Hàng 3: Bố Cục Lưới 12 Cột (8 Cột Bảng Quản Lý + 4 Cột Widget Giám Sát Hoạt Động) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT CHÍNH (8 CỘT): Bảng Danh Sách Tài Liệu & PR Giám Sát Chuẩn Enterprise */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Header Bảng & Thanh công cụ lọc */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Tài liệu kỹ thuật & Thay đổi mã nguồn
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {filteredDocuments.length} tài liệu
                </span>
              </div>

              {/* Ô tìm kiếm nhanh ngay trong bảng */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lọc tên file, class, method..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Các Tab lọc nhanh */}
            <div className="flex items-center space-x-1.5 border-t border-slate-100 pt-2.5 text-xs">
              {[
                { key: 'ALL', label: 'Tất cả' },
                { key: 'PENDING', label: `Chờ duyệt (${inReviewCount})` },
                { key: 'CRITICAL', label: `Cảnh báo Drift cao (${criticalCount})` },
                { key: 'PUBLISHED', label: 'Đã xuất bản' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedFilterTab(tab.key as any)}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    selectedFilterTab === tab.key
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nội dung bảng */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
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
                    const prCommit = doc.groundingEvidence?.pullRequest 
                      ? `${doc.groundingEvidence.pullRequest.split(':')[0]} - ${doc.groundingEvidence.commitHash.slice(0, 7)}`
                      : 'Commit mới';
                    const confScore = Math.round((doc.confidenceScore || 0.92) * 100);

                    return (
                      <tr 
                        key={doc.id} 
                        onClick={() => setPreviewDoc(doc)}
                        className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {doc.title.split(' - ')[0]}
                          </div>
                          <div className="text-slate-400 text-[11px] flex items-center space-x-1.5 mt-0.5">
                            <span className="font-medium text-slate-600">{doc.category}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px]">v{doc.version}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {codeFile.split('/').pop()}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px] truncate max-w-[130px]">
                          {prCommit}
                        </td>

                        {/* Cột độ tin cậy AI có thanh tiến độ mini */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  confScore >= 95 ? 'bg-emerald-500' : confScore >= 90 ? 'bg-blue-500' : 'bg-amber-500'
                                }`} 
                                style={{ width: `${confScore}%` }} 
                              />
                            </div>
                            <span className="font-mono text-[11px] font-medium text-slate-700">
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
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group-hover:translate-x-0.5 transition-transform"
                            title="Xem nhanh chi tiết tài liệu"
                          >
                            <span>Xem</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa tài liệu "${doc.title.split(' - ')[0]}"?`)) {
                                deleteDocument(doc.id);
                                showToast(`Đã xóa tài liệu #${doc.id}`);
                              }
                            }}
                            className="inline-flex items-center text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition"
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
          <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>
              Hiển thị <strong>{filteredDocuments.length}</strong> trong tổng số <strong>{documents.length}</strong> tài liệu
            </span>
            <div className="flex items-center space-x-1">
              <button disabled className="px-2.5 py-1 border border-slate-200 rounded bg-white text-slate-400 cursor-not-allowed">
                Trước
              </button>
              <button className="px-2.5 py-1 border border-blue-500 rounded bg-blue-600 text-white font-medium">
                1
              </button>
              <button disabled className="px-2.5 py-1 border border-slate-200 rounded bg-white text-slate-400 cursor-not-allowed">
                Sau
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHỤ (4 CỘT): 2 Khối Xếp Dọc (Live CI/CD Activity Feed & Module Health) */}
        <div className="lg:col-span-4 space-y-6">
          {/* KHỐI 1: Nhật ký sự kiện CI/CD & GitHub Webhook (Live Activity Feed) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulseSubtle" />
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Nhật ký hoạt động • CI/CD & Webhook
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Trực tiếp</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Event 1 */}
              <div className="flex items-start space-x-2.5">
                <div className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-200 mt-0.5 shrink-0">
                  <GitCommit className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">GitHub Push</span>
                    <span className="text-[10px] text-slate-400">2p trước</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Commit <code className="font-mono text-blue-600">f5db245</code> đẩy lên nhánh <strong className="text-slate-700">main</strong>.
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex items-start space-x-2.5">
                <div className="p-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 mt-0.5 shrink-0">
                  <Code className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">AST Parser Sync</span>
                    <span className="text-[10px] text-slate-400">8p trước</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Trích xuất 5 methods trong <code className="font-mono text-slate-700">WorkflowController.java</code>.
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="flex items-start space-x-2.5">
                <div className="p-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 mt-0.5 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Staff Đã Duyệt</span>
                    <span className="text-[10px] text-slate-400">18p trước</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Nguyễn Thành Đồng xác thực Grounding Evidence tài liệu <strong className="text-slate-700">Webhook_Guide.md</strong>.
                  </p>
                </div>
              </div>

              {/* Event 4 */}
              <div className="flex items-start space-x-2.5">
                <div className="p-1 rounded bg-purple-50 text-purple-600 border border-purple-200 mt-0.5 shrink-0">
                  <GitPullRequest className="w-3 h-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Manager Xuất Bản</span>
                    <span className="text-[10px] text-slate-400">45p trước</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Phạm Thị Thúy Kiều xuất bản phiên bản chính thức <strong className="text-slate-700">v2.0</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* KHỐI 2: Trạng Thái Dịch Vụ & Độ Bao Phủ Theo Module */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>Độ bao phủ theo Module</span>
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold">Ổn định</span>
            </div>

            {/* Thanh phần trăm độ bao phủ tài liệu */}
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700">Backend Core (Spring Boot)</span>
                  <span className="text-blue-600 font-mono font-bold">94%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700">AI Engine (FastAPI & AST)</span>
                  <span className="text-indigo-600 font-mono font-bold">98%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1 font-medium">
                  <span className="text-slate-700">Kafka Streaming & DLQ</span>
                  <span className="text-amber-600 font-mono font-bold">85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Quick Preview Drawer (Trượt từ phải sang khi click dòng) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-2xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-slideInRight">
            {/* Header Drawer */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="min-w-0 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    ID #{previewDoc.id}
                  </span>
                  <StatusBadge status={previewDoc.status} />
                  <SeverityBadge severity={previewDoc.driftSeverity} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-2 truncate">
                  {previewDoc.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Chuyên mục: <strong>{previewDoc.category}</strong> • Phiên bản: <strong>v{previewDoc.version}</strong>
                </p>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung chi tiết Drawer */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Bằng chứng Grounding Evidence */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                  Bằng chứng đối chiếu mã nguồn (Grounding Evidence)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">File nguồn:</span>
                    <span className="font-mono text-blue-600 truncate block">
                      {previewDoc.groundingEvidence?.sourceFile || 'Chưa liên kết'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Commit / PR:</span>
                    <span className="font-mono text-slate-700 truncate block">
                      {previewDoc.groundingEvidence?.commitHash} ({previewDoc.groundingEvidence?.pullRequest})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Chữ ký hàm AST:</span>
                  <code className="font-mono text-[11px] text-slate-800 bg-white p-1 rounded border border-slate-200 block truncate mt-0.5">
                    {previewDoc.groundingEvidence?.codeEntity || 'Chưa nhận diện'}
                  </code>
                </div>

                {previewDoc.groundingEvidence?.diffSnippet && (
                  <div>
                    <span className="text-slate-400 block text-[11px] mb-1">Đoạn Code Diff trích xuất:</span>
                    <pre className="p-2.5 rounded bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                      {previewDoc.groundingEvidence.diffSnippet}
                    </pre>
                  </div>
                )}
              </div>

              {/* So sánh nội dung Markdown */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  Nội dung tài liệu cập nhật đề xuất:
                </span>
                <div className="p-3.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px] whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                  {previewDoc.content}
                </div>
              </div>
            </div>

            {/* Footer Drawer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium"
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  setPreviewDoc(null);
                  router.push('/workflow');
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center space-x-1.5 transition shadow-sm"
              >
                <span>Mở quy trình xét duyệt (Workflow)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
