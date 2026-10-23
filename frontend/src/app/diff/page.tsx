'use client';

import React, { useState, useEffect } from 'react';
import { DiffViewer } from '@/components/DiffViewer';
import { workflowApi, DocumentItem } from '@/services/api';
import { 
  GitCompare, 
  Sparkles, 
  Sliders, 
  RefreshCw, 
  Check, 
  Layers, 
  Code2, 
  FileCheck,
  FileText,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const presetScenarios = [
  {
    id: 'signature',
    title: 'Kịch bản 1: Signature Drift (Thay đổi tham số & Endpoint REST)',
    type: 'Signature' as const,
    severity: 'High' as const,
    confidence: 0.96,
    sourceFile: 'backend/src/main/java/com/livingdocs/controller/WorkflowController.java',
    codeEntity: 'public ResponseEntity<DocResponse> updateStatus(@PathVariable Long id, @RequestBody StatusUpdateReq req)',
    commitHash: 'f5db245',
    pullRequest: '#4 KAN-17: Hoàn thành API xét duyệt tài liệu',
    diffSnippet: `@@ -15,4 +15,6 @@
- @PutMapping("/api/workflow/{id}")
+ @PutMapping("/api/workflow/{id}/staff-approve")
+ @PutMapping("/api/workflow/{id}/manager-publish")
+ @PutMapping("/api/workflow/{id}/reject")`,
    oldContent: `# Hướng Dẫn Gọi API Workflow (Cũ)

Hệ thống chỉ hỗ trợ 1 endpoint cập nhật duy nhất:
- PUT /api/workflow/{id}: Gửi cập nhật trạng thái chung.

Tham số body:
{
  "status": "APPROVED"
}`,
    newContent: `# Hướng Dẫn Gọi API Workflow (Mới - Tự Động Cập Nhật)

Hệ thống đã tách thành quy trình kiểm duyệt 2 cấp:
- PUT /api/workflow/{id}/submit: Gửi tài liệu vào hàng đợi
- PUT /api/workflow/{id}/staff-approve: Quyền Staff kiểm duyệt
- PUT /api/workflow/{id}/manager-publish: Quyền Manager xuất bản chính thức
- PUT /api/workflow/{id}/reject: Từ chối tài liệu và hoàn trả tác giả

Tham số body:
{
  "role": "Staff",
  "reason": "Ghi chú kiểm duyệt nếu từ chối"
}`
  },
  {
    id: 'semantic',
    title: 'Kịch bản 2: Semantic Drift (Thay đổi logic xử lý sự kiện GitHub Webhook)',
    type: 'Semantic' as const,
    severity: 'Critical' as const,
    confidence: 0.98,
    sourceFile: 'backend/src/main/java/com/livingdocs/controller/GitHubWebhookController.java',
    codeEntity: 'public ResponseEntity<String> handleGitHubWebhook(@RequestBody GitHubPayload payload)',
    commitHash: '9a31bc4',
    pullRequest: '#6 KAN-21: Xử lý sự kiện Push và Pull Request từ GitHub Webhook',
    diffSnippet: `@@ -20,3 +20,10 @@
- syncService.checkRepoManual();
+ EventResponse res = webhookProcessor.handleEvent(payload.getEvent(), payload.getCommits());
+ redisCache.setEx("event:" + payload.getDeliveryId(), 900, "PROCESSED");`,
    oldContent: `# Quy Trình Đồng Bộ GitHub Webhook (Cũ)

1. Kiểm tra commit định kỳ bằng cronjob thủ công.
2. Không nhận diện được sự kiện Pull Request thời gian thực.
3. Người dùng phải ấn nút đồng bộ tài liệu bằng tay.`,
    newContent: `# Quy Trình Đồng Bộ GitHub Webhook (Tự Động Thời Gian Thực)

1. Lắng nghe Webhook Push và Pull Request từ GitHub Repository.
2. Lưu vết delivery ID vào Redis Cache để chống trùng lặp sự kiện (Idempotency).
3. Tự động kích hoạt phân tích Drift Detection qua FastAPI AST Parser ngay khi có commit mới.`
  },
  {
    id: 'referential',
    title: 'Kịch bản 3: Referential Drift (Tái cấu trúc parser sang AST Tree-Sitter)',
    type: 'Referential' as const,
    severity: 'Low' as const,
    confidence: 0.91,
    sourceFile: 'ai-engine/app/parser/ast_analyzer.py',
    codeEntity: 'class LivingDocsTreeSitterParser(BaseParser)',
    commitHash: '74456b5',
    pullRequest: '#2 KAN-9: Thay thế Regex bằng Tree-Sitter AST',
    diffSnippet: `@@ -1,3 +1,8 @@
- import re
+ from tree_sitter import Language, Parser
+ import ast`,
    oldContent: `# Module Parser Phân Tích Mã Nguồn

Sử dụng biểu thức chính quy (Regular Expressions) để dò tìm các từ khóa 'class', 'def', 'function' trong file nguồn.`,
    newContent: `# Module Parser Phân Tích Mã Nguồn (AST Tree-Sitter)

Sử dụng AST Parser và Tree-sitter để phân tích cây cú pháp đầy đủ, đảm bảo độ chính xác tuyệt đối và loại bỏ hoàn toàn các trường hợp False Positives từ comments hay chuỗi văn bản.`
  }
];

export default function DiffViewPage() {
  const [activeMode, setActiveMode] = useState<'preset' | 'versions' | 'custom'>('versions');
  
  // Dành cho kịch bản mẫu
  const [selectedScenario, setSelectedScenario] = useState(presetScenarios[0]);
  
  // Dành cho so sánh phiên bản tài liệu hệ thống
  const [systemDocuments, setSystemDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number>(1);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Dành cho tự nhập dữ liệu tùy chỉnh
  const [customOld, setCustomOld] = useState(presetScenarios[0].oldContent);
  const [customNew, setCustomNew] = useState(presetScenarios[0].newContent);

  // Tải danh sách tài liệu từ hệ thống LivingDocs
  useEffect(() => {
    async function fetchDocs() {
      setLoadingDocs(true);
      try {
        const docs = await workflowApi.getDocuments();
        setSystemDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocId(docs[0].id);
        }
      } catch (err) {
        console.error('Lỗi khi tải tài liệu hệ thống:', err);
      } finally {
        setLoadingDocs(false);
      }
    }
    fetchDocs();
  }, []);

  const currentSystemDoc = systemDocuments.find(d => d.id === selectedDocId) || systemDocuments[0];

  const handleActionNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Bộ So Sánh Sai Lệch Tài Liệu (Diff View Component)</h1>
            <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded font-medium border border-slate-200">
              So sánh đa phiên bản
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trực quan hóa sự khác biệt giữa các phiên bản tài liệu, liên kết bằng chứng Grounding Evidence từ AST Code và hỗ trợ quy trình duyệt tài liệu.
          </p>
        </div>

        {/* 3 Chế độ xem */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveMode('versions')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
              activeMode === 'versions'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Tài liệu hệ thống</span>
          </button>
          <button
            onClick={() => setActiveMode('preset')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
              activeMode === 'preset'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kịch bản mẫu</span>
          </button>
          <button
            onClick={() => setActiveMode('custom')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1.5 transition ${
              activeMode === 'custom'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tự nhập thử nghiệm</span>
          </button>
        </div>
      </div>

      {/* Thông báo thao tác */}
      {notification && (
        <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 transition-all ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Chế độ 1: So sánh phiên bản tài liệu hệ thống LivingDocs */}
      {activeMode === 'versions' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="text-xs font-bold text-slate-700 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>CHỌN TÀI LIỆU TRONG HỆ THỐNG ĐỂ SO SÁNH PHIÊN BẢN:</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {systemDocuments.length} tài liệu đã đăng ký
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {systemDocuments.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 shadow-sm ring-1 ring-sky-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-slate-800 truncate">{doc.title.split(' - ')[0]}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        doc.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                        doc.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                        doc.status === 'IN_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] truncate mb-2">{doc.category}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-100">
                      <span>v{doc.version}</span>
                      <span className="text-sky-600 font-semibold">{doc.driftType || 'Signature'} Drift</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diff Viewer cho tài liệu hệ thống */}
          {currentSystemDoc && (
            <DiffViewer
              title={currentSystemDoc.title}
              oldVersion={`Bản lưu trữ hiện hành`}
              newVersion={`Bản cập nhật v${currentSystemDoc.version} (AST Sync)`}
              oldContent={currentSystemDoc.oldContent || '# Nội dung ban đầu chưa được ghi nhận'}
              newContent={currentSystemDoc.content}
              driftType={currentSystemDoc.driftType}
              driftSeverity={currentSystemDoc.driftSeverity}
              confidenceScore={currentSystemDoc.confidenceScore}
              groundingEvidence={currentSystemDoc.groundingEvidence}
              onAccept={() => handleActionNotification(`Đã chấp nhận cập nhật cho tài liệu ${currentSystemDoc.title.split(' - ')[0]}`)}
              onEdit={() => handleActionNotification(`Mở giao diện biên tập tài liệu ${currentSystemDoc.title.split(' - ')[0]}`)}
              onDismiss={() => handleActionNotification(`Đã bỏ qua sai lệch của tài liệu ${currentSystemDoc.title.split(' - ')[0]}`)}
              onRollback={() => handleActionNotification(`Đã kích hoạt rollback về phiên bản trước của tài liệu ${currentSystemDoc.title.split(' - ')[0]}`)}
            />
          )}
        </div>
      )}

      {/* Chế độ 2: Kịch bản mẫu (Preset Scenarios) */}
      {activeMode === 'preset' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presetScenarios.map((sc) => {
              const isSelected = selectedScenario.id === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc)}
                  className={`p-4 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-1 ring-sky-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sky-700">[{sc.type} Drift]</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sc.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                      sc.severity === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {sc.severity}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 leading-snug">{sc.title}</h3>
                  <p className="text-slate-500 text-[11px] font-mono truncate">{sc.sourceFile}</p>
                </div>
              );
            })}
          </div>

          <DiffViewer
            title={selectedScenario.title}
            oldVersion="Bản hiện hành"
            newVersion="AI Tự động cập nhật"
            oldContent={selectedScenario.oldContent}
            newContent={selectedScenario.newContent}
            driftType={selectedScenario.type}
            driftSeverity={selectedScenario.severity}
            confidenceScore={selectedScenario.confidence}
            groundingEvidence={{
              sourceFile: selectedScenario.sourceFile,
              codeEntity: selectedScenario.codeEntity,
              commitHash: selectedScenario.commitHash,
              pullRequest: selectedScenario.pullRequest,
              diffSnippet: selectedScenario.diffSnippet
            }}
            onAccept={() => handleActionNotification('Đã chấp thuận đề xuất và chuyển vào hàng đợi kiểm duyệt!')}
            onEdit={() => handleActionNotification('Mở trình soạn thảo Markdown để tinh chỉnh nội dung')}
            onDismiss={() => handleActionNotification('Đã bỏ qua cảnh báo sai lệch tài liệu')}
            onRollback={() => handleActionNotification('Khôi phục tài liệu về phiên bản gốc')}
          />
        </div>
      )}

      {/* Chế độ 3: Tự nhập dữ liệu tùy chỉnh (Playground) */}
      {activeMode === 'custom' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>Khu vực nhập dữ liệu thử nghiệm Diff View trực tiếp</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phiên bản gốc / ban đầu (Original Version):
                </label>
                <textarea
                  rows={6}
                  value={customOld}
                  onChange={(e) => setCustomOld(e.target.value)}
                  className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-800 mb-1">
                  Phiên bản cập nhật mới (Updated Version):
                </label>
                <textarea
                  rows={6}
                  value={customNew}
                  onChange={(e) => setCustomNew(e.target.value)}
                  className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          <DiffViewer
            title="So sánh nội dung người dùng tùy chỉnh"
            oldVersion="Bản gốc của bạn"
            newVersion="Bản đã sửa của bạn"
            oldContent={customOld}
            newContent={customNew}
            driftType="Signature"
            driftSeverity="Medium"
            confidenceScore={0.93}
            groundingEvidence={{
              sourceFile: 'custom/playground/interactive.md',
              codeEntity: 'customUserDefinedContent()',
              commitHash: 'head-draft',
              diffSnippet: 'Custom diff calculated dynamically in browser'
            }}
          />
        </div>
      )}
    </div>
  );
}
