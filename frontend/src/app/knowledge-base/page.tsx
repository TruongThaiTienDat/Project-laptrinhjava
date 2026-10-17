'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  FileCode, 
  Code, 
  GitBranch, 
  FolderTree, 
  Sparkles, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Layers,
  FileText
} from 'lucide-react';
import { templatesData } from '@/services/api';

// AST Code entity mappings to documents
const knowledgeEntities = [
  {
    id: 'ent-1',
    entityName: 'WorkflowController.java',
    category: 'Backend Controller',
    packagePath: 'com.livingdocs.controller.WorkflowController',
    methods: [
      { name: 'submitForReview(Long id)', status: 'DOCUMENTED', docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs' },
      { name: 'staffApprove(Long id)', status: 'DOCUMENTED', docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs' },
      { name: 'managerPublish(Long id)', status: 'DOCUMENTED', docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs' },
      { name: 'rejectDocument(Long id, RejectReq req)', status: 'DOCUMENTED', docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs' },
      { name: 'getAuditLogs(Long id)', status: 'NEEDS_UPDATE', docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs' }
    ],
    docCoverage: '80%',
    statusBadge: 'Synced'
  },
  {
    id: 'ent-2',
    entityName: 'VietQRService.java',
    category: 'Payment Microservice',
    packagePath: 'com.livingdocs.payment.VietQRService',
    methods: [
      { name: 'generateDynamicVietQR(PaymentRequest req)', status: 'DOCUMENTED', docTitle: 'PaymentGateway_VietQR.md' },
      { name: 'handleBankWebhook(NapasPayload payload)', status: 'DOCUMENTED', docTitle: 'PaymentGateway_VietQR.md' },
      { name: 'checkTransactionStatus(String txnCode)', status: 'MISSING_DOC', docTitle: 'Chưa có tài liệu' }
    ],
    docCoverage: '66%',
    statusBadge: 'Drift Detected'
  },
  {
    id: 'ent-3',
    entityName: 'ast_analyzer.py',
    category: 'AI Engine Parser',
    packagePath: 'ai-engine/app/parser/ast_analyzer.py',
    methods: [
      { name: 'extract_syntax_tree(code_bytes)', status: 'DOCUMENTED', docTitle: 'FastAPI_AST_Parser.md' },
      { name: 'detect_signature_drift(old_ast, new_ast)', status: 'DOCUMENTED', docTitle: 'FastAPI_AST_Parser.md' },
      { name: 'compute_confidence_score(evidence)', status: 'DOCUMENTED', docTitle: 'FastAPI_AST_Parser.md' }
    ],
    docCoverage: '100%',
    statusBadge: 'Fully Documented'
  },
  {
    id: 'ent-4',
    entityName: 'ZaloOAService.java',
    category: 'Notification Integration',
    packagePath: 'com.livingdocs.notification.ZaloOAService',
    methods: [
      { name: 'sendDriftAlertToZalo(String id, Alert a)', status: 'DOCUMENTED', docTitle: 'ZaloOA_Webhook_Notification.md' },
      { name: 'verifyZaloWebhookSignature(String signature)', status: 'MISSING_DOC', docTitle: 'Chưa có tài liệu' }
    ],
    docCoverage: '50%',
    statusBadge: 'Needs Review'
  }
];

export default function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState(knowledgeEntities[0]);
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'TEMPLATES'>('ENTITIES');
  const [copied, setCopied] = useState(false);

  const filteredEntities = knowledgeEntities.filter(ent => {
    if (activeCategory !== 'ALL' && ent.category !== activeCategory) return false;
    if (searchTerm) {
      const matchName = ent.entityName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPkg = ent.packagePath.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMethod = ent.methods.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchName || matchPkg || matchMethod;
    }
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Kho Tri Thức & Liên Kết Mã Nguồn (Knowledge Base Viewer)</h1>
            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded font-semibold border border-emerald-200">
              Doc-to-Code Linker
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu tài liệu kỹ thuật, khám phá quan hệ phụ thuộc giữa tài liệu với cây cú pháp AST (Classes, Methods, Endpoints) và thư viện mẫu.
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ENTITIES')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              activeTab === 'ENTITIES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Liên kết Thực thể Code (AST Map)
          </button>
          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              activeTab === 'TEMPLATES'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Thư viện Template Tài liệu
          </button>
        </div>
      </div>

      {activeTab === 'ENTITIES' ? (
        <>
          {/* Search & Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm class, method, endpoint hoặc file nguồn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Lọc theo nhóm:</span>
              <div className="flex space-x-1">
                {['ALL', 'Backend Controller', 'Payment Microservice', 'AI Engine Parser'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      activeCategory === cat
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'Tất cả' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Layout: Entities & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Entity Cards */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Tập tin & Class đã trích xuất AST ({filteredEntities.length})
              </div>

              {filteredEntities.map((ent) => {
                const isSelected = ent.id === selectedEntity.id;
                return (
                  <div
                    key={ent.id}
                    onClick={() => setSelectedEntity(ent)}
                    className={`p-4 rounded-xl border cursor-pointer transition text-xs ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <FileCode className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-slate-900">{ent.entityName}</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Coverage: {ent.docCoverage}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 truncate mb-2">
                      {ent.packagePath}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <span>{ent.methods.length} phương thức / endpoints</span>
                      <span className="font-semibold text-emerald-700">{ent.statusBadge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Code Entity Details & Method Mapping */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      {selectedEntity.category}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedEntity.entityName}</h2>
                    <code className="text-xs text-slate-500 font-mono block mt-1">
                      {selectedEntity.packagePath}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedEntity.packagePath)}
                    className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center space-x-1"
                    title="Copy đường dẫn"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Đã chép!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Method List & Document Linkages */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-1.5">
                    <Code className="w-4 h-4 text-emerald-600" />
                    <span>Danh sách hàm & Tài liệu kỹ thuật tương ứng</span>
                  </h4>

                  <div className="space-y-2.5">
                    {selectedEntity.methods.map((method, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <code className="font-mono font-bold text-slate-900 block">
                            {method.name}
                          </code>
                          <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                            <BookOpen className="w-3 h-3 text-sky-600" />
                            <span>Tài liệu: </span>
                            <span className="font-semibold text-slate-800 underline">
                              {method.docTitle}
                            </span>
                          </div>
                        </div>

                        <div>
                          {method.status === 'DOCUMENTED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Đã có tài liệu</span>
                            </span>
                          )}
                          {method.status === 'NEEDS_UPDATE' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Cần cập nhật</span>
                            </span>
                          )}
                          {method.status === 'MISSING_DOC' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Khoảng trống (Coverage Gap)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Generation action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Phát hiện <strong className="text-slate-800">1 khoảng trống</strong> tài liệu cần bổ sung.
                  </span>
                  <button
                    onClick={() => alert(`Yêu cầu AI Engine đọc AST và sinh tài liệu tự động cho ${selectedEntity.entityName}...`)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 shadow-sm transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Sinh Tài Liệu Tự Động</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Templates Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {templatesData.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      {tpl.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">v{tpl.version}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{tpl.name}</h3>
                  <p className="text-xs text-slate-600 mb-3">{tpl.description}</p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs mb-4">
                    <span className="font-semibold text-slate-700 block mb-1.5 text-[11px] uppercase tracking-wider">
                      Cấu trúc chuẩn bắt buộc:
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {tpl.structure.map((item, i) => (
                        <li key={i} className="truncate">• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => alert(`Đã kích hoạt áp dụng template "${tpl.name}" cho các module được chọn.`)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Áp dụng mẫu này</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
