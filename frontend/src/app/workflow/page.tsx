'use client';

import React, { useState } from 'react';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { StatusBadge, SeverityBadge } from '@/components/StatusBadge';
import { DiffViewer } from '@/components/DiffViewer';
import { 
  Check, 
  X, 
  Send, 
  Clock, 
  Filter, 
  Search, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  History,
  RotateCcw
} from 'lucide-react';

export default function WorkflowReviewPage() {
  const { 
    role, 
    documents, 
    changeLogs, 
    submitForReview, 
    staffApprove, 
    managerPublish, 
    rejectDocument,
    rollbackDocument
  } = useLivingDocs();

  const [selectedDocId, setSelectedDocId] = useState<number>(documents[0]?.id || 1);
  const [activeTab, setActiveTab] = useState<'STAFF_QUEUE' | 'MANAGER_QUEUE' | 'ALL'>('STAFF_QUEUE');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  // Lọc tài liệu theo hàng đợi
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'STAFF_QUEUE' && doc.status !== 'IN_REVIEW') return false;
    if (activeTab === 'MANAGER_QUEUE' && doc.status !== 'APPROVED') return false;
    if (filterSeverity !== 'ALL' && doc.driftSeverity !== filterSeverity) return false;
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const staffQueueCount = documents.filter(d => d.status === 'IN_REVIEW').length;
  const managerQueueCount = documents.filter(d => d.status === 'APPROVED').length;

  const handleStaffApproveAction = () => {
    if (!selectedDoc) return;
    staffApprove(selectedDoc.id);
    showNotify(`Staff đã duyệt tài liệu "${selectedDoc.title.split(' - ')[0]}" và chuyển tiếp lên Manager.`);
  };

  const handleManagerPublishAction = () => {
    if (!selectedDoc) return;
    managerPublish(selectedDoc.id);
    showNotify(`Manager đã phê duyệt và xuất bản chính thức phiên bản v${(parseFloat(selectedDoc.version) + 0.1).toFixed(1)}.`);
  };

  const handleSubmitDraftAction = () => {
    if (!selectedDoc) return;
    submitForReview(selectedDoc.id);
    showNotify(`Đã gửi tài liệu "${selectedDoc.title.split(' - ')[0]}" vào hàng đợi kiểm duyệt.`);
  };

  const handleRejectConfirm = () => {
    if (!selectedDoc) return;
    if (!rejectReason.trim()) {
      showNotify('Vui lòng nhập lý do từ chối để tác giả biết và sửa lại.', 'error');
      return;
    }
    rejectDocument(selectedDoc.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
    showNotify(`Đã từ chối tài liệu "${selectedDoc.title.split(' - ')[0]}".`);
  };

  const relevantLogs = changeLogs.filter(l => l.documentId === selectedDocId);

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang - Không bọc Card, nằm trực tiếp trên nền */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Xét duyệt tài liệu (Workflow)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quy trình kiểm duyệt tài liệu 2 cấp: Developer nộp tài liệu ➔ Staff kiểm tra kỹ thuật ➔ Manager phê duyệt xuất bản.
        </p>
      </div>

      {/* Thông báo thao tác */}
      {notification && (
        <div className={`p-3 rounded-lg text-xs font-medium flex items-center space-x-2 transition-all ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Thanh tab hàng đợi và thanh tìm kiếm */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('STAFF_QUEUE')}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition ${
              activeTab === 'STAFF_QUEUE'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hàng đợi Staff ({staffQueueCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGER_QUEUE')}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition ${
              activeTab === 'MANAGER_QUEUE'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hàng đợi Manager ({managerQueueCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition ${
              activeTab === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tất cả tài liệu ({documents.length})</span>
          </button>
        </div>

        {/* Tìm kiếm & Lọc độ lệch */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm tên tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-500 w-44"
            />
          </div>

          <div className="flex items-center space-x-1 bg-white border border-slate-300 rounded px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-700 outline-none"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bố cục 2 cột cân đối: 1/3 Hàng đợi - 2/3 Chi tiết xét duyệt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái (1/3): Danh sách tài liệu */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <span className="text-xs font-semibold text-slate-700">
              Danh sách hàng đợi ({filteredDocuments.length})
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Quyền hiện tại: <span className="font-semibold text-blue-600">{role}</span>
            </span>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              Không có tài liệu nào trong hàng đợi này.
            </div>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredDocuments.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-medium text-slate-900 line-clamp-1">{doc.title.split(' - ')[0]}</h4>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        v{doc.version}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <StatusBadge status={doc.status} />
                      <SeverityBadge severity={doc.driftSeverity} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-100">
                      <span className="truncate max-w-[130px]">{doc.category}</span>
                      <span>Sửa bởi: {doc.lastModifiedBy || 'AI'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cột phải (2/3): Chi tiết tài liệu, Nút duyệt/từ chối & Khung Diff View */}
        <div className="lg:col-span-8 space-y-4">
          {selectedDoc ? (
            <>
              {/* Thẻ thông tin và nút hành động */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900">{selectedDoc.title}</h2>
                      <StatusBadge status={selectedDoc.status} />
                      <SeverityBadge severity={selectedDoc.driftSeverity} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                      <span>Chuyên mục: <strong className="text-slate-700">{selectedDoc.category}</strong></span>
                      <span>Phiên bản: <strong className="font-mono text-slate-700">v{selectedDoc.version}</strong></span>
                      <span>Mã nguồn: <code className="font-mono text-blue-600">{selectedDoc.groundingEvidence?.sourceFile.split('/').pop()}</code></span>
                    </div>
                  </div>

                  {/* Nhóm nút Duyệt / Từ chối theo phân quyền */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Nút gửi duyệt dành cho DRAFT */}
                    {selectedDoc.status === 'DRAFT' && (
                      <button
                        onClick={handleSubmitDraftAction}
                        className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center space-x-1.5 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Nộp kiểm duyệt (Submit)</span>
                      </button>
                    )}

                    {/* Quyền Staff: Kiểm tra & Duyệt bước 1 */}
                    {selectedDoc.status === 'IN_REVIEW' && (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-3 py-1.5 rounded border border-rose-300 text-rose-700 hover:bg-rose-50 font-medium text-xs flex items-center space-x-1.5 transition"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>Từ chối</span>
                        </button>
                        <button
                          onClick={handleStaffApproveAction}
                          className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center space-x-1.5 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Staff Duyệt (Bước 1)</span>
                        </button>
                      </>
                    )}

                    {/* Quyền Manager: Phê duyệt xuất bản chính thức */}
                    {selectedDoc.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-3 py-1.5 rounded border border-rose-300 text-rose-700 hover:bg-rose-50 font-medium text-xs flex items-center space-x-1.5 transition"
                        >
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>Từ chối</span>
                        </button>
                        <button
                          onClick={handleManagerPublishAction}
                          className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center space-x-1.5 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Manager Phê Duyệt & Xuất Bản</span>
                        </button>
                      </>
                    )}

                    {/* Đã xuất bản */}
                    {selectedDoc.status === 'PUBLISHED' && (
                      <span className="px-3 py-1.5 rounded bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tài liệu đã xuất bản lưu hành</span>
                      </span>
                    )}

                    {/* Bị từ chối: Nút nộp lại */}
                    {selectedDoc.status === 'REJECTED' && (
                      <button
                        onClick={handleSubmitDraftAction}
                        className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center space-x-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Gửi lại kiểm duyệt</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Nhật ký kiểm duyệt gần nhất của tài liệu này */}
                {relevantLogs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center space-x-1 text-slate-500 font-medium mb-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lịch sử chuyển trạng thái gần nhất:</span>
                    </div>
                    <div className="space-y-1">
                      {relevantLogs.slice(0, 2).map((log) => (
                        <div key={log.id} className="text-slate-600 text-[11px] flex items-center space-x-2">
                          <span className="font-semibold text-slate-800">[{log.role}]</span>
                          <span>{log.fromStatus} ➔ {log.toStatus}:</span>
                          <span className="italic text-slate-500">{log.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Khung Diff View so sánh chi tiết phiên bản */}
              <DiffViewer
                title={`So sánh phiên bản: ${selectedDoc.title.split(' - ')[0]}`}
                oldVersion={`Bản lưu hành (v${selectedDoc.version})`}
                newVersion="Bản đề xuất cập nhật (AST Sync)"
                oldContent={selectedDoc.oldContent || '# Nội dung ban đầu trống'}
                newContent={selectedDoc.content}
                driftType={selectedDoc.driftType}
                driftSeverity={selectedDoc.driftSeverity}
                confidenceScore={selectedDoc.confidenceScore}
                groundingEvidence={selectedDoc.groundingEvidence}
              />
            </>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Vui lòng chọn một tài liệu từ danh sách bên trái để xem chi tiết xét duyệt.
            </div>
          )}
        </div>
      </div>

      {/* Modal Từ Chối Tài Liệu */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Từ chối xét duyệt tài liệu</h3>
              <p className="text-xs text-slate-500 mt-1">
                Nhập lý do từ chối để thông báo cho tác giả và chuyển tài liệu về trạng thái REJECTED.
              </p>
            </div>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ví dụ: Tài liệu thiếu tham số headers xác thực, yêu cầu bổ sung..."
              className="w-full p-2.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-1.5 rounded text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
