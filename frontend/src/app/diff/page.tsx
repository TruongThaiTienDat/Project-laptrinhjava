'use client';

import React, { useState } from 'react';
import { DiffViewer } from '@/components/DiffViewer';
import { 
  GitCompare, 
  Sparkles, 
  Sliders, 
  RefreshCw, 
  Check, 
  Layers, 
  Code2, 
  FileCheck
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
    title: 'Kịch bản 2: Semantic Drift (Thay đổi logic cổng thanh toán VietQR)',
    type: 'Semantic' as const,
    severity: 'Critical' as const,
    confidence: 0.98,
    sourceFile: 'backend/src/main/java/com/livingdocs/payment/VietQRService.java',
    codeEntity: 'public VietQRPayment createDynamicPayment(OrderRequest order)',
    commitHash: '9a31bc4',
    pullRequest: '#6 KAN-21: Chuyển đổi mã QR tĩnh sang Napas 247 động',
    diffSnippet: `@@ -20,3 +20,10 @@
- String qrCode = VietQRConfig.STATIC_IMAGE_URL;
+ VietQRResponse res = napasApi.generateDynamicQR(order.getAmount(), order.getCode());
+ redisCache.setEx("txn:" + order.getCode(), 900, "PENDING");`,
    oldContent: `# Quy Trình Thanh Toán VietQR

1. Hiển thị hình ảnh mã QR ngân hàng cố định.
2. Người dùng chuyển khoản và tự điền mã đơn hàng vào nội dung.
3. Kế toán tra soát sao kê ngân hàng mỗi ngày và duyệt thủ công.`,
    newContent: `# Quy Trình Thanh Toán VietQR (Tự Động Napas 247)

1. Sinh mã QR động Napas 247 chứa chính xác số tiền và mã hóa đơn.
2. Lưu vết giao dịch vào Redis Cache với thời gian sống 15 phút.
3. Nhận Webhook xác nhận tức thì từ ngân hàng, tự động kích hoạt tài khoản.`
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
  const [selectedScenario, setSelectedScenario] = useState(presetScenarios[0]);
  const [customMode, setCustomMode] = useState(false);
  const [customOld, setCustomOld] = useState(presetScenarios[0].oldContent);
  const [customNew, setCustomNew] = useState(presetScenarios[0].newContent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Bộ So Sánh Sai Lệch Tài Liệu (Diff View Component)</h1>
            <span className="px-2 py-0.5 text-xs bg-sky-100 text-sky-800 rounded font-semibold border border-sky-200">
              Phần 5: Core Component
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trực quan hóa sự khác biệt giữa tài liệu đang lưu hành và nội dung AI tự động đề xuất, đính kèm bằng chứng Grounding Evidence từ AST Code.
          </p>
        </div>

        {/* Mode switch */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setCustomMode(false)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              !customMode
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kịch bản mẫu LivingDocs
          </button>
          <button
            onClick={() => setCustomMode(true)}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              customMode
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tự nhập tài liệu để so sánh
          </button>
        </div>
      </div>

      {/* Preset Scenario Selector */}
      {!customMode ? (
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
      ) : (
        /* Custom Textarea comparison input */
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span>Khu vực nhập dữ liệu thử nghiệm Diff View trực tiếp</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tài liệu ban đầu (Original Version):
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
                Tài liệu cập nhật mới (Updated Version):
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
      )}

      {/* Render the Diff View Component */}
      {!customMode ? (
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
          onAccept={() => alert('Đã chấp thuận bản cập nhật tài liệu và chuyển vào hàng đợi kiểm duyệt!')}
          onEdit={() => alert('Mở trình soạn thảo Markdown để tinh chỉnh nội dung')}
          onDismiss={() => alert('Đã bỏ qua cảnh báo sai lệch tài liệu')}
          onRollback={() => alert('Khôi phục tài liệu về phiên bản gốc')}
        />
      ) : (
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
      )}
    </div>
  );
}

