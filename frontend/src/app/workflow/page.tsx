'use client';

import React, { useState, useEffect } from 'react';
import { 
  workflowApi, 
  DocumentItem, 
  ChangeLogItem 
} from '@/services/api';
import { StatusBadge, SeverityBadge, DriftTypeBadge } from '@/components/StatusBadge';
import { DiffViewer } from '@/components/DiffViewer';
import { 
  CheckCircle2, 
  XCircle, 
  Send, 
  Clock, 
  Filter, 
  RefreshCw, 
  History, 
  FileText, 
  UserCheck, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Check,
  Search
} from 'lucide-react';

export default function WorkflowReviewPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'STAFF_QUEUE' | 'MANAGER_QUEUE' | 'ALL'>('STAFF_QUEUE');
  const [selectedRole, setSelectedRole] = useState<'Staff' | 'Manager' | 'Developer'>('Staff');
  const [changeLogs, setChangeLogs] = useState<ChangeLogItem[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial documents and logs
  const loadData = async () => {
    setLoading(true);
    try {
      const docs = await workflowApi.getDocuments();
      setDocuments([...docs]);
      if (docs.length > 0) {
        const logsRes = await workflowApi.getLogs(selectedDocId);
        setChangeLogs(logsRes.history);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDocId]);

  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Staff Approve
  const handleStaffApprove = async (id: number) => {
    try {
      const res = await workflowApi.staffApprove(id);
      showNotify(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showNotify(err.message, 'error');
    }
  };

  // Manager Publish
  const handleManagerPublish = async (id: number) => {
    try {
      const res = await workflowApi.managerPublish(id);
      showNotify(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showNotify(err.message, 'error');
    }
  };

  // Submit Draft to Review
  const handleSubmitDraft = async (id: number) => {
    try {
      const res = await workflowApi.submitForReview(id, selectedRole);
      showNotify(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showNotify(err.message, 'error');
    }
  };

  // Reject Document
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showNotify('Vui lòng nhập lý do từ chối để tác giả biết và sửa lại', 'error');
      return;
    }
    try {
      const res = await workflowApi.reject(selectedDocId, selectedRole, rejectReason);
      showNotify(res.message, 'success');
      setShowRejectModal(false);
      setRejectReason('');
      await loadData();
    } catch (err: any) {
      showNotify(err.message, 'error');
    }
  };

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  // Filtering documents according to queue tabs
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'STAFF_QUEUE' && doc.status !== 'IN_REVIEW') return false;
    if (activeTab === 'MANAGER_QUEUE' && doc.status !== 'APPROVED') return false;
    if (filterSeverity !== 'ALL' && doc.driftSeverity !== filterSeverity) return false;
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Role switch header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Luồng Phê Duyệt & Xét Duyệt Tài Liệu (Workflow Review)</h1>
            <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded font-semibold border border-indigo-200">
              Human-In-The-Loop
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình đảm bảo chất lượng: AI sinh/cập nhật ➔ Staff rà soát kỹ thuật ➔ Manager phê duyệt xuất bản
          </p>
        </div>

        {/* Action simulator for role */}
        <div className="flex items-center space-x-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-600 font-semibold px-2 flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Thao tác với tư cách:</span>
          </span>
          <div className="flex space-x-1">
            {(['Staff', 'Manager', 'Developer'] as const).map(r => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  selectedRole === r
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {r === 'Staff' ? 'Staff Reviewer' : r === 'Manager' ? 'Manager Approver' : 'Developer'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
            : 'bg-rose-50 text-rose-900 border border-rose-300'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Queue Selection Tabs & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('STAFF_QUEUE')}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'STAFF_QUEUE'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hàng đợi Staff ({documents.filter(d => d.status === 'IN_REVIEW').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGER_QUEUE')}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'MANAGER_QUEUE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hàng đợi Manager ({documents.filter(d => d.status === 'APPROVED').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition ${
              activeTab === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tất cả tài liệu ({documents.length})</span>
          </button>
        </div>

        {/* Severity filter & Search */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500 outline-none w-44"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 outline-none"
            >
              <option value="ALL">Mọi mức Drift</option>
              <option value="Critical">Critical Drift</option>
              <option value="High">High Drift</option>
              <option value="Medium">Medium Drift</option>
              <option value="Low">Low Drift</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Documents List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Danh sách tài liệu ({filteredDocuments.length})
              </span>
              <button
                onClick={loadData}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
                title="Làm mới"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Không có tài liệu nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredDocuments.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                          v{doc.version}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <StatusBadge status={doc.status} />
                        <SeverityBadge severity={doc.driftSeverity} />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>{doc.category}</span>
                        <span>{doc.lastModifiedBy || 'AI'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Workflow Status Reference Card */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Quy trình chuyển dịch trạng thái</span>
            </h4>
            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="font-semibold text-slate-200">DRAFT</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>Submit ➔ IN_REVIEW</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="font-semibold text-amber-300">IN_REVIEW</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>Staff Duyệt ➔ APPROVED</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="font-semibold text-blue-300">APPROVED</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>Manager Publish ➔ PUBLISHED (v+1.0)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="font-semibold text-rose-300">REJECTED</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>Trả về Developer sửa đổi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Document Review & Diff View */}
        <div className="lg:col-span-8 space-y-5">
          {selectedDoc ? (
            <>
              {/* Review Control Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        DOC-ID #{selectedDoc.id}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">{selectedDoc.title}</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Repository: <code className="font-mono text-sky-700">{selectedDoc.repository}</code> • Cập nhật lúc {new Date(selectedDoc.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <StatusBadge status={selectedDoc.status} />
                    <SeverityBadge severity={selectedDoc.driftSeverity} />
                  </div>
                </div>

                {/* Role-Specific Action Bar */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-700">Hành động khả dụng cho vai trò: </span>
                    <span className="font-bold text-indigo-600 underline">{selectedRole}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* If Draft: Allow Submit */}
                    {selectedDoc.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmitDraft(selectedDoc.id)}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi đi duyệt (Submit for Review)</span>
                      </button>
                    )}

                    {/* If In Review: Allow Staff to Approve or Reject */}
                    {selectedDoc.status === 'IN_REVIEW' && (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-3.5 py-2 rounded-lg bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Từ chối (Reject)</span>
                        </button>

                        <button
                          onClick={() => handleStaffApprove(selectedDoc.id)}
                          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Staff Duyệt (Chuyển lên Manager)</span>
                        </button>
                      </>
                    )}

                    {/* If Approved: Allow Manager to Publish or Reject */}
                    {selectedDoc.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-3.5 py-2 rounded-lg bg-white border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Từ chối / Yêu cầu sửa</span>
                        </button>

                        <button
                          onClick={() => handleManagerPublish(selectedDoc.id)}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Manager Phê Duyệt & Xuất Bản</span>
                        </button>
                      </>
                    )}

                    {/* If Published: Show indicator */}
                    {selectedDoc.status === 'PUBLISHED' && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Tài liệu đã được xuất bản chính thức v{selectedDoc.version}</span>
                      </span>
                    )}

                    {/* If Rejected: Show indicator and allow resubmit */}
                    {selectedDoc.status === 'REJECTED' && (
                      <button
                        onClick={() => handleSubmitDraft(selectedDoc.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Gửi lại vào hàng đợi duyệt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Integrated Diff View Component */}
              <DiffViewer
                title={`So sánh phiên bản: ${selectedDoc.title}`}
                oldVersion={`v${selectedDoc.version} (Hiện tại)`}
                newVersion={`v${(parseFloat(selectedDoc.version) + 0.1).toFixed(1)} (AI Cập nhật)`}
                oldContent={selectedDoc.oldContent || ''}
                newContent={selectedDoc.content || ''}
                driftType={selectedDoc.driftType}
                driftSeverity={selectedDoc.driftSeverity}
                confidenceScore={selectedDoc.confidenceScore}
                groundingEvidence={selectedDoc.groundingEvidence}
                onAccept={() => {
                  if (selectedDoc.status === 'IN_REVIEW') handleStaffApprove(selectedDoc.id);
                  else if (selectedDoc.status === 'APPROVED') handleManagerPublish(selectedDoc.id);
                  else handleSubmitDraft(selectedDoc.id);
                }}
                onDismiss={() => setShowRejectModal(true)}
              />

              {/* System Audit Change Logs */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <History className="w-4 h-4 text-indigo-600" />
                    <span>Lịch Sử Thay Đổi & Nhật Ký Kiểm Duyệt (Audit Change Log)</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {changeLogs.length} sự kiện ghi nhận
                  </span>
                </div>

                {changeLogs.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4">Chưa có thay đổi nào.</div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {changeLogs.map((log) => (
                      <div key={log.id} className="relative text-xs">
                        {/* Dot indicator */}
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white ring-2 ring-indigo-200" />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 font-mono">[{log.role}]</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                              {log.fromStatus} ➔ {log.toStatus}
                            </span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {log.note}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Vui lòng chọn tài liệu để bắt đầu kiểm duyệt.
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal dialog */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              <span>Từ Chối & Yêu Cầu Chỉnh Sửa Tài Liệu</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vui lòng nêu rõ lý do từ chối (Ví dụ: thông tin endpoint chưa chính xác với code, thiếu bảng tham số) để tác giả hoặc AI sửa lại.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập phản hồi chi tiết cho tài liệu này..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
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
