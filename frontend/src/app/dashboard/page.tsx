'use client';

import React, { useState } from 'react';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
  Download, 
  RotateCcw, 
  Search, 
  Check, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Sliders,
  Sparkles
} from 'lucide-react';
import { SeverityBadge } from '@/components/StatusBadge';

export default function TechLeadDashboardPage() {
  const { 
    documents, 
    changeLogs, 
    coverageGaps, 
    impactItems, 
    policy, 
    updatePolicy, 
    milestones, 
    resolveGap, 
    rollbackDocument,
    setIsTestModalOpen
  } = useLivingDocs();

  // Tab điều hướng
  const [activeTab, setActiveTab] = useState<
    'IMPACT' | 'GAPS' | 'POLICIES' | 'MILESTONES' | 'AUDIT'
  >('IMPACT');

  const [searchAuditTerm, setSearchAuditTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [selectedRollbackDocId, setSelectedRollbackDocId] = useState<number>(documents[0]?.id || 1);
  const [selectedRollbackVersion, setSelectedRollbackVersion] = useState('1.0');
  const [rollbackReason, setRollbackReason] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Tính toán số liệu
  const criticalDriftsCount = documents.filter(d => d.driftSeverity === 'Critical' || d.driftSeverity === 'High').length;
  const coverageRate = coverageGaps.length === 0 ? '100%' : `${Math.max(65, 100 - coverageGaps.length * 8)}%`;

  // Lọc nhật ký kiểm toán
  const filteredAuditLogs = changeLogs.filter(log => {
    if (selectedRoleFilter !== 'ALL' && !log.role.includes(selectedRoleFilter as any)) return false;
    if (searchAuditTerm) {
      const q = searchAuditTerm.toLowerCase();
      return log.note.toLowerCase().includes(q) || `${log.fromStatus} ${log.toStatus}`.toLowerCase().includes(q);
    }
    return true;
  });

  // Sinh báo cáo Markdown tổng hợp
  const generateMarkdownReport = () => {
    return `# BÁO CÁO QUẢN TRỊ VÀ TUÂN THỦ TÀI LIỆU (LIVINGDOCS)
Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}
Đơn vị: Đồ án Lập trình Java - Nhóm LivingDocs

## 1. CHỈ SỐ SỨC KHỎE HỆ THỐNG
- Tỷ lệ bao phủ tài liệu: ${coverageRate}
- Tổng số tài liệu: ${documents.length}
- Số cảnh báo sai lệch (Drift): ${criticalDriftsCount}
- Khoảng trống chưa có tài liệu: ${coverageGaps.length}

## 2. DANH SÁCH TÀI LIỆU LƯU HÀNH
${documents.map(d => `- [${d.status}] ${d.title} (v${d.version}) - Mức độ: ${d.driftSeverity || 'None'}`).join('\n')}

## 3. LỊCH SỬ KIỂM DUYỆT GẦN NHẤT
${changeLogs.slice(0, 5).map(l => `- [${new Date(l.timestamp).toLocaleTimeString('vi-VN')}] [${l.role}] ${l.fromStatus} ➔ ${l.toStatus}: ${l.note}`).join('\n')}
`;
  };

  const handleDownloadReport = () => {
    const text = generateMarkdownReport();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LivingDocs_BaoCao_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotify('Đã tải xuống file báo cáo thành công!');
  };

  const handleConfirmRollback = () => {
    if (!rollbackReason.trim()) {
      showNotify('Vui lòng nhập lý do rollback bắt buộc.', 'error');
      return;
    }
    rollbackDocument(selectedRollbackDocId, selectedRollbackVersion, rollbackReason);
    setShowRollbackModal(false);
    setRollbackReason('');
    showNotify(`Đã hoàn tất rollback tài liệu về phiên bản v${selectedRollbackVersion}.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tiêu đề trang - Không bọc Card, nằm trực tiếp trên nền */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Thống kê & Cấu hình (Tech Lead Dashboard)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Giám sát sức khỏe tài liệu, phân tích tác động thay đổi mã nguồn, quản trị chính sách CI/CD và nhật ký kiểm toán.
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất báo cáo tuân thủ</span>
          </button>

          <button
            onClick={() => setShowRollbackModal(true)}
            className="px-3 py-1.5 rounded font-medium bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 flex items-center space-x-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Rollback phiên bản</span>
          </button>
        </div>
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

      {/* 4 ô thống kê chính trên 1 hàng (grid-cols-4 đồng nhất với trang chủ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ô 1: Tỷ lệ bao phủ tài liệu */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ lệ bao phủ tài liệu</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{coverageRate}</div>
          <div className="text-xs text-slate-500 mt-1">
            {coverageGaps.length === 0 ? 'Toàn bộ endpoint đã có tài liệu' : `Còn ${coverageGaps.length} hàm cần bổ sung`}
          </div>
        </div>

        {/* Ô 2: Sai lệch mã nguồn (Drift) */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cảnh báo sai lệch (Drift)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">{criticalDriftsCount}</div>
          <div className="text-xs text-amber-600 mt-1">Mức độ Cao / Nghiêm trọng</div>
        </div>

        {/* Ô 3: Mốc phiên bản hiện hành */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Mốc phiên bản hiện hành</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">v2.0</div>
          <div className="text-xs text-emerald-600 mt-1">Đã kiểm duyệt ổn định</div>
        </div>

        {/* Ô 4: Trạng thái hạ tầng */}
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dịch vụ nền tảng</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">Hoạt động</div>
          <div className="text-xs text-slate-500 mt-1 font-mono">Port 8080 & 8000</div>
        </div>
      </div>

      {/* Thanh chuyển đổi 5 Tab nghiệp vụ sạch sẽ */}
      <div className="bg-white p-2 rounded-lg border border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
        {[
          { key: 'IMPACT', label: '1. Phân tích tác động (Impact Analysis)' },
          { key: 'GAPS', label: `2. Khoảng trống bao phủ (${coverageGaps.length})` },
          { key: 'POLICIES', label: '3. Chính sách quản trị CI/CD' },
          { key: 'MILESTONES', label: '4. Mốc phiên bản & Rollback' },
          { key: 'AUDIT', label: `5. Nhật ký kiểm toán (${filteredAuditLogs.length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded font-medium transition ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nội dung chi tiết các Tab dưới dạng Bảng (Table) sạch sẽ */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* TAB 1: PHÂN TÍCH TÁC ĐỘNG (IMPACT ANALYSIS) */}
        {activeTab === 'IMPACT' && (
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Phân tích tác động thay đổi mã nguồn (Impact Analysis)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đánh giá rủi ro lan truyền và các dịch vụ phụ thuộc khi có Pull Request thay đổi code.
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4">Thực thể code thay đổi</th>
                  <th className="py-3 px-4">Kiểu sai lệch & Pull Request</th>
                  <th className="py-3 px-4">Tài liệu liên đới</th>
                  <th className="py-3 px-4">Dịch vụ phụ thuộc (Cascade)</th>
                  <th className="py-3 px-4 text-center">Điểm rủi ro</th>
                  <th className="py-3 px-4 text-right">Độ nghiêm trọng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {impactItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-mono font-medium text-slate-900">{item.sourceEntity}</div>
                      <code className="text-slate-400 text-[11px] font-mono block mt-0.5">{item.service}</code>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{item.changeType}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{item.pullRequest}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="space-y-0.5">
                        {item.affectedDocuments.map((doc, idx) => (
                          <span key={idx} className="block text-[11px] font-mono text-blue-700">
                            • {doc}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {item.cascadeServices.map((srv, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-mono">
                            {srv}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        item.riskScore > 80 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <SeverityBadge severity={item.severity} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: KHOẢNG TRỐNG BAO PHỦ (COVERAGE GAPS) */}
        {activeTab === 'GAPS' && (
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Lỗ hổng bao phủ tài liệu (Coverage Gaps)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các hàm, endpoint hoặc schema đã có trong mã nguồn nhưng chưa được viết tài liệu kỹ thuật.
                </p>
              </div>
            </div>

            {coverageGaps.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Tuyệt vời! Toàn bộ các thực thể mã nguồn hiện tại đều đã được bao phủ tài liệu đầy đủ (100%).
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                    <th className="py-3 px-4">Tên hàm / Thực thể AST</th>
                    <th className="py-3 px-4">Tập tin mã nguồn</th>
                    <th className="py-3 px-4">Tài liệu đề xuất sinh ra</th>
                    <th className="py-3 px-4 text-center">Độ ưu tiên</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coverageGaps.map((gap) => (
                    <tr key={gap.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-900">{gap.entityName}</div>
                        <code className="text-slate-400 text-[11px] font-mono block mt-0.5 truncate max-w-sm">
                          {gap.signature}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {gap.sourceFile.split('/').pop()}
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        {gap.suggestedDocTitle}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          gap.priority === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          gap.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {gap.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            resolveGap(gap.id);
                            showNotify(`Đã tự động tạo tài liệu đề xuất cho hàm "${gap.entityName}".`);
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs flex items-center space-x-1 ml-auto transition"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Sinh tài liệu đề xuất</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 3: CHÍNH SÁCH QUẢN TRỊ CI/CD (GOVERNANCE POLICIES) */}
        {activeTab === 'POLICIES' && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Cấu hình chính sách tự động hóa CI/CD & Kiểm duyệt
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập các quy tắc bắt buộc áp dụng khi hệ thống phát hiện sai lệch tài liệu từ GitHub.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl text-xs">
              {/* Chính sách 1 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">Tự động phát hiện sai lệch khi có Pull Request</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Kích hoạt phân tích AST mỗi khi có PR mở trên GitHub.</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.autoUpdateOnPR}
                  onChange={(e) => updatePolicy({ autoUpdateOnPR: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
              </div>

              {/* Chính sách 2 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">Chặn merge Pull Request khi có Critical Drift</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Không cho phép merge code vào nhánh main nếu tài liệu chưa được cập nhật tương ứng.</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.blockPRMergeOnCriticalDrift}
                  onChange={(e) => updatePolicy({ blockPRMergeOnCriticalDrift: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
              </div>

              {/* Chính sách 3 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">Bắt buộc qua bước Staff kiểm tra kỹ thuật</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Tài liệu phải được Staff Reviewer chấp thuận trước khi chuyển tiếp sang Manager.</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.requireStaffReview}
                  onChange={(e) => updatePolicy({ requireStaffReview: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
              </div>

              {/* Chính sách 4 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">Tạo bản snapshot phiên bản trước khi xuất bản</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Tự động lưu trữ bản snapshot tài liệu cũ phục vụ tính năng Rollback an toàn.</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.snapshotBeforePublish}
                  onChange={(e) => updatePolicy({ snapshotBeforePublish: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
              </div>

              {/* Chính sách 5 */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <div className="font-semibold text-slate-900">Gửi thông báo khẩn cấp qua Webhook / Email</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Tự động bắn cảnh báo kèm đường link xét duyệt nhanh khi phát hiện sai lệch nghiêm trọng.</div>
                </div>
                <input
                  type="checkbox"
                  checked={policy.autoAlertWebhook}
                  onChange={(e) => updatePolicy({ autoAlertWebhook: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MỐC PHIÊN BẢN & ROLLBACK (VERSION MILESTONES) */}
        {activeTab === 'MILESTONES' && (
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Lịch sử các mốc phiên bản hệ thống (Milestones)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi vòng đời tài liệu qua từng đợt phát hành và hỗ trợ khôi phục phiên bản.
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4">Phiên bản</th>
                  <th className="py-3 px-4">Ngày phát hành</th>
                  <th className="py-3 px-4">Tổng số tài liệu</th>
                  <th className="py-3 px-4">Người phát hành</th>
                  <th className="py-3 px-4">Ghi chú phát hành</th>
                  <th className="py-3 px-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {milestones.map((ms, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      v{ms.version}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {ms.releaseDate}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      {ms.totalDocs} tài liệu
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {ms.releasedBy}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                      {ms.notes}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ms.status === 'CURRENT' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        ms.status === 'STABLE' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {ms.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: NHẬT KÝ KIỂM TOÁN (AUDIT LOGS) */}
        {activeTab === 'AUDIT' && (
          <div>
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Nhật ký kiểm toán toàn hệ thống ({filteredAuditLogs.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lưu trữ vết kiểm duyệt theo thời gian thực của các vai trò trong quy trình Human-in-the-loop.
                </p>
              </div>

              {/* Tìm kiếm & Lọc vai trò */}
              <div className="flex items-center space-x-2 text-xs">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Tìm theo ghi chú..."
                    value={searchAuditTerm}
                    onChange={(e) => setSearchAuditTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-500 w-44"
                  />
                </div>

                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Developer">Developer</option>
                  <option value="AI">AI Engine</option>
                </select>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Tài liệu liên quan</th>
                  <th className="py-3 px-4">Vai trò tác tử</th>
                  <th className="py-3 px-4">Chuyển đổi trạng thái</th>
                  <th className="py-3 px-4">Nội dung ghi chú kiểm toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.map((log) => {
                  const doc = documents.find(d => d.id === log.documentId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {doc ? doc.title.split(' - ')[0] : `Mã #${log.documentId}`}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        [{log.role}]
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {log.fromStatus} ➔ {log.toStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                        {log.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Xuất Báo Cáo Tuân Thủ Markdown */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">Báo cáo tuân thủ & quản trị tài liệu (Markdown)</h3>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <pre className="bg-slate-900 text-slate-200 font-mono p-4 rounded text-xs overflow-x-auto max-h-72 leading-relaxed whitespace-pre-wrap">
              {generateMarkdownReport()}
            </pre>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateMarkdownReport());
                  setCopiedReport(true);
                  setTimeout(() => setCopiedReport(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 flex items-center space-x-1.5 transition"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-1.5 rounded font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file .md về máy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rollback Phiên Bản */}
      {showRollbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Rollback khôi phục phiên bản tài liệu</h3>
              <p className="text-slate-500 text-xs mt-1">
                Hoàn tác nội dung tài liệu về phiên bản ổn định đã lưu trước đó.
              </p>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Chọn tài liệu cần hoàn tác:</label>
              <select
                value={selectedRollbackDocId}
                onChange={(e) => setSelectedRollbackDocId(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded outline-none"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title.split(' - ')[0]} (v{d.version})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Chọn phiên bản hoàn tác về:</label>
              <select
                value={selectedRollbackVersion}
                onChange={(e) => setSelectedRollbackVersion(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded outline-none"
              >
                <option value="1.0">v1.0 (Bản gốc ban đầu)</option>
                <option value="1.2">v1.2 (Bản ổn định gần nhất)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Lý do kích hoạt Rollback (*):</label>
              <textarea
                rows={2}
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                placeholder="Ví dụ: Phát hiện sai lệch nghiêm trọng trong tài liệu mới đề xuất..."
                className="w-full p-2 border border-slate-300 rounded outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-medium transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRollback}
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium transition"
              >
                Xác nhận Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
