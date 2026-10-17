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

/**
 * Giao dien xet duyet quy trinh (Workflow Review UI)
 * Muc tieu do an: Xay dung luong kiem duyet tai lieu 2 cap co su tham gia cua con nguoi (Human-in-the-loop).
 * - Buoc 1: Developer hoac AI Engine nop tai lieu vao hang doi (trang thai DRAFT -> IN_REVIEW).
 * - Buoc 2: Staff kiem tra tai lieu voi bang chung ma nguon (Grounding Evidence), neu dat se duyet len buoc 3 (IN_REVIEW -> APPROVED).
 * - Buoc 3: Manager phe duyet xuat ban chinh thuc, he thong tu dong tang so phien ban (APPROVED -> PUBLISHED).
 * - Buoc phu: Neu phat hien sai sot, Staff hoac Manager co the tu choi va tra ve kem ly do (-> REJECTED).
 */
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

  // Ham tai du lieu tu backend Spring Boot (hoac Mock Fallback neu backend chua chay)
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
      console.error('Loi khi tai du lieu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDocId]);

  // Hien thi thong bao tam thoi cho nguoi dung
  const showNotify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Xu ly khi Staff bam duyet buoc 1 (API: /api/workflow/:id/staff-approve)
  const handleStaffApprove = async (id: number) => {
    try {
      const res = await workflowApi.staffApprove(id);
      showNotify(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showNotify(err.message, 'error');
    }
  };

  // Xu ly khi Manager phe duyet xuat ban chinh thuc (API: /api/workflow/:id/manager-publish)
  const handleManagerPublish = async (id: number) => {
    try {
      const res = await workflowApi.managerPublish(id);
      showNotify(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showNotify(err.message, 'error');
    }
  };

  // Xu ly khi Developer hoac AI nop tai lieu vao hang doi (API: /api/workflow/:id/submit)
  const handleSubmitDraft = async (id: number) => {
    try {
      const res = await workflowApi.submitForReview(id, selectedRole);
      showNotify(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showNotify(err.message, 'error');
    }
  };

  // Xu ly khi tu choi tai lieu kem ly do (API: /api/workflow/:id/reject)
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showNotify('Vui long nhap ly do tu choi de tac gia biet va sua lai', 'error');
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

  // Loc danh sach tai lieu theo hang doi duyet va tim kiem
  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'STAFF_QUEUE' && doc.status !== 'IN_REVIEW') return false;
    if (activeTab === 'MANAGER_QUEUE' && doc.status !== 'APPROVED') return false;
    if (filterSeverity !== 'ALL' && doc.driftSeverity !== filterSeverity) return false;
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tieu de trang va cong cu chon vai tro demo */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Luong Kiem Duyet Tai Lieu (Workflow Review UI)</h1>
            <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-800 rounded font-semibold border border-slate-300">
              Quy trinh 2 cap kiem duyet
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quy trinh tuan thu de tai: Developer / AI sinh tai lieu ➔ Staff kiem tra ky thuat ➔ Manager phe duyet xuat ban.
          </p>
        </div>

        {/* Chon vai tro thao tac de giao vien de dang kiem thu */}
        <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded border border-slate-200 text-xs">
          <span className="text-slate-600 font-semibold px-1 flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Thao tac voi vai tro:</span>
          </span>
          <div className="flex space-x-1">
            {(['Staff', 'Manager', 'Developer'] as const).map(r => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1 rounded font-semibold transition ${
                  selectedRole === r
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {r === 'Staff' ? 'Staff Reviewer' : r === 'Manager' ? 'Manager Approver' : 'Developer'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Thong bao trang thai */}
      {notification && (
        <div className={`p-3.5 rounded text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all ${
          notification.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
            : 'bg-red-50 text-red-900 border border-red-300'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Thanh chuyen tab giua cac hang doi */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('STAFF_QUEUE')}
            className={`px-3 py-2 rounded font-bold flex items-center space-x-2 transition ${
              activeTab === 'STAFF_QUEUE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hang doi Staff ({documents.filter(d => d.status === 'IN_REVIEW').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGER_QUEUE')}
            className={`px-3 py-2 rounded font-bold flex items-center space-x-2 transition ${
              activeTab === 'MANAGER_QUEUE'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hang doi Manager ({documents.filter(d => d.status === 'APPROVED').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-2 rounded font-bold flex items-center space-x-2 transition ${
              activeTab === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tat ca tai lieu ({documents.length})</span>
          </button>
        </div>

        {/* Tim kiem va loc theo muc do sai lech */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tim ten tai lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-sky-500 outline-none w-48"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 outline-none"
            >
              <option value="ALL">Moi muc sai lech</option>
              <option value="Critical">Muc Critical</option>
              <option value="High">Muc High</option>
              <option value="Medium">Muc Medium</option>
              <option value="Low">Muc Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bo cuc 2 cot: Danh sach hang doi va Chi tiet xet duyet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cot trai: Danh sach tai lieu can duyet */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tai lieu trong hang doi ({filteredDocuments.length})
              </span>
              <button
                onClick={loadData}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
                title="Tai lai danh sach"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Khong co tai lieu nao trong hang doi nay.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredDocuments.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3.5 rounded border cursor-pointer transition text-xs ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/50 shadow-sm ring-1 ring-sky-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                          v{doc.version}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <StatusBadge status={doc.status} />
                        <SeverityBadge severity={doc.driftSeverity} />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>{doc.category}</span>
                        <span>Nguoi cap nhat: {doc.lastModifiedBy || 'AI'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bang huong dan quy trinh cho sinh vien va giang vien */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded text-xs space-y-3 font-mono">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Bang Huong Dan Chuyen Trang Thai</span>
            </h4>
            <div className="space-y-2 text-[11px]">
              <div>
                <span className="font-bold text-slate-200">1. DRAFT</span>: Ban nhap moi sinh ra, bam Submit de gui len Staff.
              </div>
              <div>
                <span className="font-bold text-amber-300">2. IN_REVIEW</span>: Staff kiem tra code diff va phe duyet buoc 1.
              </div>
              <div>
                <span className="font-bold text-blue-300">3. APPROVED</span>: Manager kiem tra lan cuoi va bam Xuat ban.
              </div>
              <div>
                <span className="font-bold text-emerald-300">4. PUBLISHED</span>: Xuat ban thanh cong va tu dong nang version.
              </div>
              <div>
                <span className="font-bold text-red-300">5. REJECTED</span>: Tu choi va tra ve cho Developer sua lai.
              </div>
            </div>
          </div>
        </div>

        {/* Cot phai: Chi tiet xet duyet tai lieu & So sanh Diff View */}
        <div className="lg:col-span-8 space-y-5">
          {selectedDoc ? (
            <>
              {/* Thong tin tai lieu va thanh hanh dong */}
              <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        Ma tai lieu: #{selectedDoc.id}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">{selectedDoc.title}</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Repository: <code className="font-mono text-slate-700">{selectedDoc.repository}</code> • Phien ban: <span className="font-bold text-slate-900">v{selectedDoc.version}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <StatusBadge status={selectedDoc.status} />
                    <SeverityBadge severity={selectedDoc.driftSeverity} />
                  </div>
                </div>

                {/* Thanh nut hanh dong tuong ung theo tung vai tro */}
                <div className="p-4 bg-slate-50 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700">Quyen han hanh dong: </span>
                    <span className="font-bold text-sky-700 underline">{selectedRole}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Neu trang thai la DRAFT: Cho phep gui di duyet */}
                    {selectedDoc.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmitDraft(selectedDoc.id)}
                        className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Nop tai lieu di duyet (Submit)</span>
                      </button>
                    )}

                    {/* Neu trang thai la IN_REVIEW: Staff co quyen Duyet hoac Tu choi */}
                    {selectedDoc.status === 'IN_REVIEW' && (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-3.5 py-2 rounded bg-white border border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Tu choi (Reject)</span>
                        </button>

                        <button
                          onClick={() => handleStaffApprove(selectedDoc.id)}
                          className="px-4 py-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Staff Duyet buoc 1 (Len Manager)</span>
                        </button>
                      </>
                    )}

                    {/* Neu trang thai la APPROVED: Manager co quyen Xuat ban hoac Tu choi */}
                    {selectedDoc.status === 'APPROVED' && (
                      <>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-3.5 py-2 rounded bg-white border border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>Tu choi / Tra ve</span>
                        </button>

                        <button
                          onClick={() => handleManagerPublish(selectedDoc.id)}
                          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Manager Phe Duyet & Xuat Ban</span>
                        </button>
                      </>
                    )}

                    {/* Neu trang thai la PUBLISHED */}
                    {selectedDoc.status === 'PUBLISHED' && (
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-300 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Tai lieu da duoc xuat ban chinh thuc v{selectedDoc.version}</span>
                      </span>
                    )}

                    {/* Neu trang thai la REJECTED */}
                    {selectedDoc.status === 'REJECTED' && (
                      <button
                        onClick={() => handleSubmitDraft(selectedDoc.id)}
                        className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Gui lai vao hang doi xet duyet</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tich hop truc tiep bo so sanh Diff View */}
              <DiffViewer
                title={`So sanh phien ban: ${selectedDoc.title}`}
                oldVersion={`v${selectedDoc.version} (Hien tai)`}
                newVersion={`v${(parseFloat(selectedDoc.version) + 0.1).toFixed(1)} (AI Cap nhat)`}
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

              {/* Nhat ky kiem duyet va lich su thay doi (Audit Log) */}
              <div className="bg-white rounded border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <History className="w-4 h-4 text-slate-700" />
                    <span>Lich Su Thay Doi & Nhat Ky Kiem Duyet (Audit Change Log)</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {changeLogs.length} su kien ghi nhan
                  </span>
                </div>

                {changeLogs.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-4">Chua co nhat ky nao.</div>
                ) : (
                  <div className="space-y-3">
                    {changeLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 font-mono">[{log.role}]</span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 font-mono text-[10px] text-slate-700 font-semibold">
                              {log.fromStatus} ➔ {log.toStatus}
                            </span>
                          </div>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          {log.note}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Vui long chon tai lieu de bat dau kiem duyet.
            </div>
          )}
        </div>
      </div>

      {/* Hop thoai nhap ly do tu choi tai lieu */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 max-w-md w-full shadow-xl space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span>Tu Choi & Yeu Cau Chinh Sua Tai Lieu</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vui long nhap ly do tu choi (Vi du: Thong tin API Endpoint chua khop voi code, thieu bang tham so request body) de tac gia biet va sua lai.
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhap phan hoi chi tiet tai day..."
              className="w-full text-xs p-3 border border-slate-200 rounded focus:ring-1 focus:ring-red-500 outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
              >
                Huy bo
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded shadow-sm"
              >
                Xac nhan tu choi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
