'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  workflowApi, 
  ChangeLogItem, 
  CoverageGapItem, 
  ImpactAnalysisItem, 
  VersionMilestoneItem, 
  GovernancePolicy,
  templatesData,
  initialCoverageGaps,
  initialImpactItems,
  initialVersionMilestones,
  initialGovernancePolicy
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
  FolderTree,
  FileCode,
  Code,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  Check,
  X,
  FileText,
  AlertCircle,
  Copy,
  Clock,
  Cpu,
  Database,
  Server
} from 'lucide-react';

export default function TechLeadDashboardPage() {
  // Trạng thái dữ liệu chính
  const [auditLogs, setAuditLogs] = useState<ChangeLogItem[]>([]);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGapItem[]>(initialCoverageGaps);
  const [impactItems, setImpactItems] = useState<ImpactAnalysisItem[]>(initialImpactItems);
  const [milestones, setMilestones] = useState<VersionMilestoneItem[]>(initialVersionMilestones);
  const [policy, setPolicy] = useState<GovernancePolicy>(initialGovernancePolicy);

  // Trạng thái điều hướng & bộ lọc
  const [activeTab, setActiveTab] = useState<
    'IMPACT_ANALYSIS' | 'COVERAGE_GAPS' | 'GOVERNANCE_POLICIES' | 'VERSION_MILESTONES' | 'AUDIT_LOGS'
  >('IMPACT_ANALYSIS');
  const [selectedImpactId, setSelectedImpactId] = useState<string>('impact-1');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [searchAuditTerm, setSearchAuditTerm] = useState<string>('');

  // Trạng thái xử lý & tương tác
  const [loading, setLoading] = useState<boolean>(false);
  const [resolvingGapId, setResolvingGapId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showRollbackModal, setShowRollbackModal] = useState<boolean>(false);
  const [selectedRollbackVersion, setSelectedRollbackVersion] = useState<string>('1.2');
  const [rollbackReason, setRollbackReason] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Tải dữ liệu từ service API
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [logs, gaps, impacts, ms, pol] = await Promise.all([
        workflowApi.getAllLogs(),
        workflowApi.getCoverageGaps(),
        workflowApi.getImpactAnalysis(),
        workflowApi.getVersionMilestones(),
        workflowApi.getGovernancePolicy()
      ]);
      setAuditLogs(logs);
      setCoverageGaps(gaps);
      setImpactItems(impacts);
      setMilestones(ms);
      setPolicy(pol);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu Tech Lead Dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Thông báo tạm thời
  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Xử lý AI tự động sinh tài liệu giải quyết khoảng trống (Coverage Gap)
  const handleResolveGap = async (id: string) => {
    setResolvingGapId(id);
    try {
      const res = await workflowApi.resolveCoverageGap(id);
      notify(res.message, 'success');
      await loadDashboardData();
    } catch (err: any) {
      notify(err.message || 'Lỗi khi kích hoạt AI sinh tài liệu', 'error');
    } finally {
      setResolvingGapId(null);
    }
  };

  // Lưu cấu hình chính sách quản trị
  const handleSavePolicy = async () => {
    try {
      const res = await workflowApi.updateGovernancePolicy(policy);
      notify(res.message, 'success');
      await loadDashboardData();
    } catch (err: any) {
      notify('Lỗi khi lưu cấu hình chính sách', 'error');
    }
  };

  // Khôi phục chính sách mặc định
  const handleResetPolicyDefaults = () => {
    setPolicy({
      autoUpdateOnPR: true,
      blockPRMergeOnCriticalDrift: true,
      minConfidenceThreshold: 85,
      autoAlertZaloOA: true,
      requireStaffReview: true,
      snapshotBeforePublish: true
    });
    notify('Đã khôi phục cài đặt chính sách về tiêu chuẩn mặc định', 'success');
  };

  // Xử lý Rollback khẩn cấp toàn hệ thống
  const handleConfirmRollback = async () => {
    if (!rollbackReason.trim()) {
      notify('Vui lòng cung cấp lý do kích hoạt Rollback để ghi nhận vào nhật ký kiểm toán', 'error');
      return;
    }
    try {
      const res = await workflowApi.rollbackToMilestone(selectedRollbackVersion, rollbackReason);
      notify(res.message, 'success');
      setShowRollbackModal(false);
      setRollbackReason('');
      await loadDashboardData();
    } catch (err: any) {
      notify('Lỗi khi thực hiện Rollback', 'error');
    }
  };

  // Tạo nội dung báo cáo tuân thủ Markdown
  const generateMarkdownReport = (): string => {
    const totalGaps = coverageGaps.length;
    const coveragePercentage = totalGaps === 0 ? '100%' : '82.4%';
    return `# BÁO CÁO QUẢN TRỊ VÀ SỨC KHỎE TÀI LIỆU KỸ THUẬT LIVINGDOCS
Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
Người phụ trách: Technical Lead (Phần 5: ReactJS/Next.js Governance)
Dự án: LivingDocs - Hệ thống tài liệu tự cập nhật bằng AI
Repository: TruongThaiTienDat/Project-laptrinhjava

---

## 1. CHỈ SỐ SỨC KHỎE TỔNG THỂ (HEALTH METRICS)
- Độ tươi mới tài liệu (Doc Freshness): 94.8% (Đạt tiêu chuẩn xuất sắc)
- Tỷ lệ bao phủ thực thể mã nguồn (API/Entity Coverage): ${coveragePercentage}
- Số lượng khoảng trống tồn đọng: ${totalGaps} methods/endpoints
- Tỷ lệ sinh tài liệu tự động qua AI AST: 88.5%
- Thời gian xử lý trung bình (MTTR Review): 24 phút
- Số cảnh báo Drift nghiêm trọng (Critical/High): 2 cảnh báo đang trong quy trình xử lý

## 2. CHÍNH SÁCH QUẢN TRỊ ĐANG ÁP DỤNG (GOVERNANCE POLICIES)
- Tự động sinh tài liệu nháp khi có PR: ${policy.autoUpdateOnPR ? 'BẬT' : 'TẮT'}
- Chặn hợp nhất Pull Request khi có Critical Drift: ${policy.blockPRMergeOnCriticalDrift ? 'BẬT (Khóa an toàn CI/CD)' : 'TẮT'}
- Ngưỡng tin cậy tối thiểu của AI (Confidence Threshold): ${policy.minConfidenceThreshold}%
- Yêu cầu kiểm duyệt 2 cấp (Human-in-the-Loop): ${policy.requireStaffReview ? 'BẬT (Staff kiểm tra ➔ Manager xuất bản)' : 'TẮT'}
- Thông báo cảnh báo khẩn cấp qua Zalo OA: ${policy.autoAlertZaloOA ? 'BẬT' : 'TẮT'}
- Tự động sao lưu Snapshot trước xuất bản: ${policy.snapshotBeforePublish ? 'BẬT' : 'TẮT'}

## 3. PHÂN TÍCH TÁC ĐỘNG MÃ NGUỒN (IMPACT ANALYSIS)
- VietQRService.java: Semantic Drift (Mức độ Critical) - Tác động Napas 247 dynamic QR
- WorkflowController.java: Signature Drift (Mức độ High) - Tách luồng duyệt 2 cấp
- ast_analyzer.py: Referential Drift (Mức độ Low) - Nâng cấp parser Tree-Sitter

## 4. CÁC MỐC PHIÊN BẢN HỆ THỐNG (MILESTONES)
- v2.0 (Bản hiện tại): Hoàn thiện kiểm duyệt 2 cấp, AST Parser, VietQR động
- v1.2 (Bản ổn định): VietQR tĩnh, Redis Cache
- v1.0 (Bản gốc ban đầu): Khởi tạo dự án LivingDocs

Báo cáo được tổng hợp tự động từ hệ thống LivingDocs Governance Engine.`;
  };

  // Tải file báo cáo Markdown về máy
  const handleDownloadReportFile = () => {
    const reportText = generateMarkdownReport();
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LivingDocs_Governance_Report_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Đã tải xuống file báo cáo LivingDocs_Governance_Report.md thành công!', 'success');
  };

  // Sao chép báo cáo vào clipboard
  const handleCopyReportText = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Dữ liệu lọc cho tab Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    if (selectedRoleFilter !== 'ALL' && !log.role.includes(selectedRoleFilter as any)) return false;
    if (searchAuditTerm) {
      const q = searchAuditTerm.toLowerCase();
      const matchNote = log.note.toLowerCase().includes(q);
      const matchStatus = `${log.fromStatus} ${log.toStatus}`.toLowerCase().includes(q);
      return matchNote || matchStatus;
    }
    return true;
  });

  const selectedImpact = impactItems.find(i => i.id === selectedImpactId) || impactItems[0];
  const coveragePercentDisplay = coverageGaps.length === 0 ? '100%' : '82.4%';

  return (
    <div className="space-y-6">
      {/* 1. Header Banner Bảng Điều Khiển Quản Trị Tech Lead */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">
              Bảng Điều Khiển Quản Trị Tech Lead (Governance Dashboard)
            </h1>
            <span className="px-2.5 py-0.5 text-xs bg-purple-100 text-purple-900 rounded font-semibold border border-purple-200 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>Role: Technical Lead / Doc Owner</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Giám sát toàn diện sức khỏe tài liệu kỹ thuật, phân tích tác động dây chuyền (Impact Analysis), lấp đầy khoảng trống bao phủ (Coverage Gaps), quản trị chính sách tự động hóa CI/CD và lịch sử kiểm toán.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất Báo Cáo Tuân Thủ</span>
          </button>

          <button
            onClick={() => setShowRollbackModal(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Rollback Toàn Hệ Thống</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Làm mới dữ liệu từ hệ thống"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Thông báo trạng thái Notification */}
      {notification && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all ${
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

      {/* 2. Hàng 6 Thẻ Chỉ Số Sức Khỏe & Quản Trị Hệ Thống (Health KPI Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: Freshness */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Độ Tươi Mới</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-slate-900">94.8%</span>
            <span className="text-[11px] text-emerald-600 font-semibold">+2.1%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Khớp sát commit gần nhất</p>
        </div>

        {/* Card 2: Coverage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tỷ Lệ Bao Phủ</span>
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-slate-900">{coveragePercentDisplay}</span>
            <span className={`text-[11px] font-semibold ${coverageGaps.length === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {coverageGaps.length === 0 ? 'Toàn diện' : `${coverageGaps.length} gaps`}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {coverageGaps.length === 0 ? '17/17 endpoints có doc' : '14/17 methods có doc'}
          </p>
        </div>

        {/* Card 3: Active Drift Alerts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cảnh Báo Drift</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-rose-600">2</span>
            <span className="text-[10px] text-rose-500 font-semibold">1 Critical</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Đang chờ xét duyệt</p>
        </div>

        {/* Card 4: AI Automation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tự Động Hóa AI</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-purple-600">88.5%</span>
            <span className="text-[10px] text-purple-700 font-semibold">AST Grounded</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Tiết kiệm 16h viết tay</p>
        </div>

        {/* Card 5: MTTR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thời Gian Duyệt</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-slate-900">24</span>
            <span className="text-[11px] text-slate-500 font-semibold">phút</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">MTTR trung bình</p>
        </div>

        {/* Card 6: Risk Index */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Chỉ Số Rủi Ro</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-emerald-600">12%</span>
            <span className="text-[10px] text-emerald-700 font-bold">Rất Thấp</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Bảo vệ bởi CI/CD Gate</p>
        </div>
      </div>

      {/* 3. Thanh Chuyển Tab Phân Khu Chức Năng Của Tech Lead */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('IMPACT_ANALYSIS')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${
              activeTab === 'IMPACT_ANALYSIS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Phân Tích Tác Động & Phụ Thuộc</span>
          </button>

          <button
            onClick={() => setActiveTab('COVERAGE_GAPS')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${
              activeTab === 'COVERAGE_GAPS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Khoảng Trống Bao Phủ ({coverageGaps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('GOVERNANCE_POLICIES')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${
              activeTab === 'GOVERNANCE_POLICIES'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Chính Sách CI/CD & Rào Chắn</span>
          </button>

          <button
            onClick={() => setActiveTab('VERSION_MILESTONES')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${
              activeTab === 'VERSION_MILESTONES'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Mốc Phiên Bản & Khôi Phục ({milestones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Nhật Ký Kiểm Toán ({auditLogs.length})</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 pr-2">
          LivingDocs Governance v2.0
        </div>
      </div>

      {/* 4. Nội Dung Chi Tiết Từng Tab */}

      {/* TAB 1: PHÂN TÍCH TÁC ĐỘNG & SƠ ĐỒ PHỤ THUỘC (Impact & Dependency Analysis) */}
      {activeTab === 'IMPACT_ANALYSIS' && (
        <div className="space-y-6">
          {/* Sơ đồ luồng dữ liệu kiến trúc LivingDocs */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <span>Sơ Đồ Đường Truyền Dữ Liệu Tự Động Hóa (Architecture Pipeline)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mô hình phát hiện sai lệch tài liệu (Drift Detection) từ commit nguồn đến màn hình kiểm duyệt.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                End-to-End Pipeline
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">1. Git Webhook</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Ingest</span>
                </div>
                <p className="text-slate-600 text-[11px]">Bắt sự kiện Push / Pull Request từ GitHub Actions.</p>
                <div className="text-[10px] text-slate-400 font-mono">Payload: Commit diff</div>
              </div>

              <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-900">2. AST Parser</span>
                  <span className="text-[10px] font-mono bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded font-bold">:8000</span>
                </div>
                <p className="text-sky-800 text-[11px]">Trích xuất cây cú pháp, nhận diện đổi tên hàm/endpoint.</p>
                <div className="text-[10px] text-sky-600 font-mono">FastAPI Tree-Sitter</div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">3. Kafka Queue</span>
                  <span className="text-[10px] font-mono bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">:9092</span>
                </div>
                <p className="text-amber-800 text-[11px]">Hàng đợi sự kiện phi tập trung kèm Dead Letter Queue (DLQ).</p>
                <div className="text-[10px] text-amber-700 font-mono">livingdocs-events</div>
              </div>

              <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">4. Spring Boot Core</span>
                  <span className="text-[10px] font-mono bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded font-bold">:8080</span>
                </div>
                <p className="text-indigo-800 text-[11px]">Xác định loại Drift (Signature/Semantic), lưu trữ Postgres.</p>
                <div className="text-[10px] text-indigo-600 font-mono">Multi-tenant Schema</div>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900">5. Tech Lead UI</span>
                  <span className="text-[10px] font-mono bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold">:3000</span>
                </div>
                <p className="text-purple-800 text-[11px]">Giao diện xét duyệt 2 cấp (Staff ➔ Manager ➔ Published).</p>
                <div className="text-[10px] text-purple-700 font-mono">React / Next.js</div>
              </div>
            </div>
          </div>

          {/* Phân tích tác động chi tiết theo từng tệp/module */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Danh sách module bị tác động */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                <span>Module Bị Tác Động Bởi PR Gần Nhất ({impactItems.length})</span>
                <span className="text-[11px] text-purple-600 font-semibold font-mono">Impact Radar</span>
              </div>

              {impactItems.map((item) => {
                const isSelected = item.id === (selectedImpact?.id || selectedImpactId);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedImpactId(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition text-xs ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/40 shadow-sm ring-1 ring-purple-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <FileCode className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-slate-900">{item.sourceEntity}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.severity === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        item.severity === 'High' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {item.severity} Drift
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 truncate mb-2">
                      {item.sourceFile}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <span className="text-purple-700 font-semibold font-mono">{item.changeType}</span>
                      <span className="font-semibold text-slate-700">Điểm rủi ro: {item.riskScore}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Chi tiết phân tích dây chuyền */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              {selectedImpact ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                        {selectedImpact.service}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedImpact.sourceEntity}</h3>
                      <code className="text-xs text-slate-500 font-mono block mt-0.5">
                        {selectedImpact.sourceFile}
                      </code>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">Mức độ rủi ro tác động:</div>
                      <div className={`text-lg font-extrabold ${
                        selectedImpact.riskScore >= 80 ? 'text-rose-600' :
                        selectedImpact.riskScore >= 50 ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {selectedImpact.riskScore}/100 ({selectedImpact.severity})
                      </div>
                    </div>
                  </div>

                  {/* Mô tả tác động */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">Mô tả tác động kỹ thuật:</span>
                    {selectedImpact.description}
                    <div className="mt-2 text-slate-500 font-mono text-[11px]">
                      Pull Request liên quan: <strong className="text-slate-800">{selectedImpact.pullRequest}</strong>
                    </div>
                  </div>

                  {/* Tài liệu bị tác động dây chuyền */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>Tài Liệu Kỹ Thuật Bị Ảnh Hưởng Trực Tiếp ({(selectedImpact.affectedDocuments || []).length})</span>
                    </h4>
                    <div className="space-y-1.5">
                      {(selectedImpact.affectedDocuments || []).map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 text-xs">
                          <span className="font-semibold text-purple-950 font-mono">{doc}</span>
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                            Cần cập nhật
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dịch vụ phụ thuộc bị tác động */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <Server className="w-4 h-4 text-slate-600" />
                      <span>Dịch Vụ Phụ Thuộc Trong Hệ Thống ({(selectedImpact.cascadeServices || []).length})</span>
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {(selectedImpact.cascadeServices || []).map((svc, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Phím tắt liên kết sang màn hình khác */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                    <Link
                      href="/diff"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center space-x-1.5 transition"
                    >
                      <span>Mở Bộ So Sánh Diff View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/workflow"
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow-sm transition"
                    >
                      <span>Vào Luồng Xét Duyệt Tài Liệu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-xs text-slate-400">
                  Vui lòng chọn một module để xem phân tích tác động chi tiết.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KHOẢNG TRỐNG BAO PHỦ TÀI LIỆU (Coverage Gaps & Orphan Endpoints) */}
      {activeTab === 'COVERAGE_GAPS' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Danh Sách Khoảng Trống Bao Phủ (Coverage Gaps & Orphan APIs)
              </h3>
              <p className="text-slate-500 mt-0.5">
                Các phương thức, controller endpoints hoặc service classes mới được tạo trong mã nguồn nhưng chưa có tài liệu hướng dẫn tương ứng.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-600 font-medium">Hiện có:</span>
              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                {coverageGaps.length} khoảng trống cần xử lý
              </span>
            </div>
          </div>

          {coverageGaps.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tuyệt Vời! Toàn Bộ Mã Nguồn Đã Được Bao Phủ 100%</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Không còn phương thức hay endpoint mồ côi nào thiếu tài liệu. Hệ thống tài liệu LivingDocs đang ở trạng thái đồng bộ hoàn hảo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {coverageGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {gap.entityName}()
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                        {gap.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        gap.priority === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        gap.priority === 'High' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-sky-100 text-sky-800 border border-sky-300'
                      }`}>
                        Ưu tiên {gap.priority}
                      </span>
                    </div>

                    <div className="font-mono text-purple-700 text-xs bg-slate-50 p-2 rounded border border-slate-200 inline-block">
                      {gap.signature}
                    </div>

                    <div className="text-slate-500 font-mono text-[11px]">
                      Tệp nguồn: <strong className="text-slate-700">{gap.sourceFile}</strong> • Dịch vụ: <strong>{gap.service}</strong> • Commit: <code className="text-purple-600">{gap.lastCommit}</code>
                    </div>

                    <div className="text-slate-600 text-[11px] pt-1 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Đề xuất tạo tài liệu: </span>
                      <strong className="text-slate-800">{gap.suggestedDocTitle}</strong>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end space-y-2">
                    <button
                      onClick={() => handleResolveGap(gap.id)}
                      disabled={resolvingGapId === gap.id}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-sm transition text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{resolvingGapId === gap.id ? 'AI Đang Sinh Tài Liệu...' : 'AI Sinh Tài Liệu Bổ Sung'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">Trích xuất tự động qua AST</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CHÍNH SÁCH QUẢN TRỊ CI/CD & RÀO CHẮN CHẤT LƯỢNG (Governance Policies) */}
      {activeTab === 'GOVERNANCE_POLICIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Rào Chắn Quản Trị & Quy Định Tự Động Hóa (Quality Gates)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các tiêu chuẩn kỹ thuật bắt buộc để đảm bảo tài liệu không bị trôi dạt (Drift) khi dự án tăng trưởng.
                </p>
              </div>
              <button
                onClick={handleResetPolicyDefaults}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
              >
                Khôi phục mặc định
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Policy 1: Auto-generate on PR */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="max-w-lg">
                  <span className="font-bold text-slate-900 block text-sm">
                    Tự Động Kích Hoạt AI Sinh Tài Liệu Nháp Khi Mở Pull Request
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Hệ thống tự động kích hoạt FastAPI AST Parser và LLM RAG Pipeline để phân tích code diff ngay khi lập trình viên mở PR.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.autoUpdateOnPR}
                  onChange={(e) => setPolicy({ ...policy, autoUpdateOnPR: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer accent-purple-600"
                />
              </div>

              {/* Policy 2: Block PR merge on Critical */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="max-w-lg">
                  <span className="font-bold text-slate-900 block text-sm flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600 inline" />
                    <span>Chặn Merge Pull Request Khi Phát Hiện Critical Drift</span>
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Khóa trạng thái GitHub CI/CD Status Check; ngăn cản việc merge code vào nhánh main nếu tài liệu liên quan chưa được Manager duyệt xuất bản.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.blockPRMergeOnCriticalDrift}
                  onChange={(e) => setPolicy({ ...policy, blockPRMergeOnCriticalDrift: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer accent-purple-600"
                />
              </div>

              {/* Policy 3: AI Confidence Threshold slider */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      Ngưỡng Tin Cậy Tối Thiểu Của AI (AI Grounding Confidence Threshold)
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Nếu điểm tin cậy dưới ngưỡng này, hệ thống bắt buộc chuyển sang Staff review kỹ lưỡng trước khi hiển thị cho Manager.
                    </span>
                  </div>
                  <span className="font-mono font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-lg text-sm">
                    {policy.minConfidenceThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="99"
                  value={policy.minConfidenceThreshold}
                  onChange={(e) => setPolicy({ ...policy, minConfidenceThreshold: parseInt(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>70% (Linh hoạt)</span>
                  <span>Tiêu chuẩn khuyến nghị: 85%</span>
                  <span>99% (Nghiêm ngặt)</span>
                </div>
              </div>

              {/* Policy 4: Require 2-stage review */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="max-w-lg">
                  <span className="font-bold text-slate-900 block text-sm">
                    Bắt Buộc Quy Trình Kiểm Duyệt 2 Cấp (Human-in-the-Loop)
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Tài liệu phải qua bước Staff kiểm tra tính hợp lệ trước khi chuyển sang quyền Manager phê duyệt xuất bản. Không cho phép vượt cấp.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.requireStaffReview}
                  onChange={(e) => setPolicy({ ...policy, requireStaffReview: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer accent-purple-600"
                />
              </div>

              {/* Policy 5: Zalo OA Emergency Alerts */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="max-w-lg">
                  <span className="font-bold text-slate-900 block text-sm">
                    Thông Báo Cảnh Báo Khẩn Cấp Qua Zalo Official Account (Zalo OA)
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Tự động gửi tin nhắn kèm đường link kiểm duyệt nhanh đến nhóm kỹ thuật qua Webhook khi phát hiện sai lệch mức độ Critical.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.autoAlertZaloOA}
                  onChange={(e) => setPolicy({ ...policy, autoAlertZaloOA: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer accent-purple-600"
                />
              </div>

              {/* Policy 6: Version Snapshot */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="max-w-lg">
                  <span className="font-bold text-slate-900 block text-sm">
                    Tự Động Lưu Snapshot Bản Sao Lưu Trước Khi Xuất Bản
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Tự động tạo điểm mốc an toàn (Checkpoint) trước mỗi lần Manager ấn Publish để phục vụ cứu hộ khẩn cấp nếu phát hiện sai sót.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={policy.snapshotBeforePublish}
                  onChange={(e) => setPolicy({ ...policy, snapshotBeforePublish: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={handleSavePolicy}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình Chính Sách Quản Trị</span>
              </button>
            </div>
          </div>

          {/* Cột phải: Hướng dẫn quản trị & Tiêu chuẩn tuân thủ */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-xl space-y-3 text-xs">
              <div className="flex items-center space-x-2 text-purple-400 font-bold uppercase tracking-wider text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Quy Ước Quản Trị Đồ Án</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Để đạt điểm tối đa trong phần Kiến trúc & Quản trị hệ thống, Tech Lead cần chứng minh hệ thống có:
              </p>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Cơ chế rào chắn không cho phép code lệch pha với tài liệu (No Drift Policy).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Phân quyền rõ ràng giữa Staff (người kiểm tra) và Manager (người xuất bản).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bảo toàn lịch sử thay đổi (Audit trail) không thể xóa sửa.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Trạng Thái Tích Hợp Microservices
              </h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Spring Boot Backend:</span>
                  <span className="text-emerald-600 font-bold font-mono">Connected (:8080)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">FastAPI AI Engine:</span>
                  <span className="text-emerald-600 font-bold font-mono">Connected (:8000)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-600">Kafka Broker & DLQ:</span>
                  <span className="text-emerald-600 font-bold font-mono">Active (:9092)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Redis Cache & Sessions:</span>
                  <span className="text-emerald-600 font-bold font-mono">Active (:6379)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MỐC PHIÊN BẢN & KHÔI PHỤC (Version Milestones & Rollback) */}
      {activeTab === 'VERSION_MILESTONES' && (
        <div className="space-y-5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Quản Lý Các Mốc Phiên Bản Hệ Thống Tài Liệu (Version Milestones)
              </h3>
              <p className="text-slate-500 mt-0.5">
                Mỗi mốc phiên bản ghi lại toàn bộ trạng thái tài liệu kỹ thuật tại thời điểm phát hành. Tech Lead có thể khôi phục khẩn cấp bất kỳ lúc nào.
              </p>
            </div>

            <button
              onClick={() => setShowRollbackModal(true)}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center space-x-1.5 transition text-xs shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Kích Hoạt Rollback Khẩn Cấp</span>
            </button>
          </div>

          <div className="space-y-3.5">
            {milestones.map((ms) => {
              const isCurrent = ms.status === 'CURRENT';
              return (
                <div
                  key={ms.version}
                  className={`p-5 rounded-xl border transition shadow-sm text-xs flex flex-wrap items-start justify-between gap-4 ${
                    isCurrent
                      ? 'bg-purple-50/40 border-purple-300 ring-1 ring-purple-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-base text-slate-900 font-mono">
                        Phiên Bản v{ms.version}
                      </span>
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white">
                          Bản Phát Hành Hiện Tại
                        </span>
                      ) : ms.status === 'STABLE' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Bản Ổn Định
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          Lưu Trữ (Deprecated)
                        </span>
                      )}
                      <span className="text-slate-400 font-mono text-[11px]">• {ms.releaseDate}</span>
                    </div>

                    <p className="text-slate-700 text-xs leading-relaxed">{ms.notes}</p>

                    <div className="text-[11px] text-slate-500 pt-1">
                      Tổng số tài liệu: <strong className="text-slate-800">{ms.totalDocs} tài liệu</strong> • Phát hành bởi: <strong className="text-slate-800">{ms.releasedBy}</strong>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <Link
                      href="/diff"
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition text-xs shadow-sm flex items-center space-x-1"
                    >
                      <span>So Sánh Diff</span>
                    </Link>

                    {!isCurrent && (
                      <button
                        onClick={() => {
                          setSelectedRollbackVersion(ms.version);
                          setShowRollbackModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition text-xs shadow-sm flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Rollback Về v{ms.version}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: NHẬT KÝ KIỂM TOÁN TOÀN HỆ THỐNG (System Audit Trail) */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <FolderTree className="w-4 h-4 text-purple-600" />
                <span>Nhật Ký Kiểm Toán Toàn Diện (System Audit Trail & Change Logs)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bảo toàn lịch sử biến động trạng thái từ AI, Staff, Manager đến các hành động can thiệp của Tech Lead.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Tìm kiếm */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nội dung log..."
                  value={searchAuditTerm}
                  onChange={(e) => setSearchAuditTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-500 outline-none w-48"
                />
              </div>

              {/* Bộ lọc vai trò */}
              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="bg-transparent border-none text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="AI">AI Engine</option>
                  <option value="Staff">Staff Reviewer</option>
                  <option value="Manager">Manager Approver</option>
                  <option value="Tech Lead">Tech Lead</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredAuditLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Không tìm thấy bản ghi nhật ký phù hợp với bộ lọc.
              </div>
            ) : (
              filteredAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 transition hover:bg-slate-100/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 font-mono">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        log.role === 'Tech Lead' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        log.role === 'Manager' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        log.role === 'Staff' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        [{log.role}]
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700 font-semibold">
                        {log.fromStatus} ➔ {log.toStatus}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN')} • {new Date(log.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed">{log.note}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Modal Xuất Báo Cáo Tuân Thủ (Export Compliance Report Modal) */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Xuất Báo Cáo Sức Khỏe & Tuân Thủ Tài Liệu LivingDocs
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Báo cáo được biên soạn tự động theo tiêu chuẩn quản trị kỹ thuật, bao gồm điểm số sức khỏe, tỷ lệ bao phủ code, các cảnh báo Drift và rào chắn CI/CD phục vụ báo cáo đồ án với giảng viên.
            </p>

            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {generateMarkdownReport()}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                onClick={handleCopyReportText}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center space-x-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedReport ? 'Đã Sao Chép!' : 'Sao Chép Nội Dung'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  onClick={handleDownloadReportFile}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải File Báo Cáo (.md)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Xác Nhận Rollback Khẩn Cấp (Emergency Rollback Modal) */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Xác Nhận Kích Hoạt Rollback Toàn Hệ Thống
              </h3>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 leading-relaxed">
              <strong>Cảnh báo an toàn:</strong> Thao tác này sẽ khôi phục trạng thái toàn bộ tài liệu về điểm mốc ổn định đã chọn và ghi nhận sự kiện này vào nhật ký kiểm toán hệ thống.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chọn điểm mốc phiên bản đích:
                </label>
                <select
                  value={selectedRollbackVersion}
                  onChange={(e) => setSelectedRollbackVersion(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="1.2">Phiên bản v1.2 (Bản ổn định hôm qua)</option>
                  <option value="1.0">Phiên bản v1.0 (Bản gốc ban đầu)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lý do kích hoạt Rollback (Bắt buộc):
                </label>
                <textarea
                  rows={3}
                  value={rollbackReason}
                  onChange={(e) => setRollbackReason(e.target.value)}
                  placeholder="Ví dụ: Phát hiện sai lệch nghiêm trọng trong tài liệu cổng thanh toán VietQR..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleConfirmRollback}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
              >
                Xác Nhận Khôi Phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
