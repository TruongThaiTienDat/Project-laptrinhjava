'use client';

import React, { useState } from 'react';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { DiffViewer } from '@/components/DiffViewer';
import { Sliders, CheckCircle2, RotateCcw, Upload, Trash2 } from 'lucide-react';

export default function DiffViewPage() {
  const { documents, deleteDocument, setIsTestModalOpen } = useLivingDocs();

  const [selectedDocId, setSelectedDocId] = useState<number>(documents[0]?.id || 1);
  const [customMode, setCustomMode] = useState<boolean>(false);

  // Dữ liệu nhập tùy chỉnh trực tiếp để test
  const [customTitle, setCustomTitle] = useState('OrderService_Guide.md - Đặc tả xử lý đơn hàng');
  const [customSourceFile, setCustomSourceFile] = useState('backend/src/main/java/com/livingdocs/service/OrderService.java');
  const [customCodeEntity, setCustomCodeEntity] = useState('public OrderResponse createOrder(OrderRequest req)');
  const [customCommit, setCustomCommit] = useState('e4a19c0');
  const [customPR, setCustomPR] = useState('#18: Tách logic thanh toán và đặt hàng');
  const [customDiffSnippet, setCustomDiffSnippet] = useState('- public Order createOrder(Order req) { ... }\n+ public OrderResponse createOrder(OrderRequest req) {\n+     return orderProcessor.execute(req);\n+ }');
  const [customOldContent, setCustomOldContent] = useState('# Đặc Tả OrderService (Cũ)\n\nGọi hàm tạo đơn hàng đồng bộ trực tiếp với database.');
  const [customNewContent, setCustomNewContent] = useState('# Đặc Tả OrderService (Mới - Tự Động Cập Nhật)\n\nQuy trình tạo đơn hàng bất đồng bộ thông qua Kafka Event Streaming.');

  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const currentDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tiêu đề trang & Nút tải tài liệu lên */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">So sánh thay đổi (Diff View)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Trực quan hóa sự khác biệt giữa tài liệu hiện hành và bản cập nhật đề xuất, đính kèm bằng chứng Grounding Evidence từ mã nguồn.
          </p>
        </div>

        {/* Nút bấm tải tài liệu lên */}
        <button
          onClick={() => setIsTestModalOpen(true)}
          className="btn-press flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-sm cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Tải tài liệu lên / Tạo bản kiểm tra</span>
        </button>
      </div>

      {/* Thông báo thao tác */}
      {notification && (
        <div className="p-3 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-2 animate-scaleIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Thanh công cụ ngang gọn gàng */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown chọn tài liệu */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Chọn tài liệu:</span>
            <select
              value={customMode ? 'CUSTOM' : selectedDocId}
              onChange={(e) => {
                if (e.target.value === 'CUSTOM') {
                  setCustomMode(true);
                } else {
                  setCustomMode(false);
                  setSelectedDocId(Number(e.target.value));
                }
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 outline-none focus:border-blue-500 cursor-pointer"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title.split(' - ')[0]} (v{d.version} - {d.status})
                </option>
              ))}
              <option value="CUSTOM">★ [Tự nhập dữ liệu test thử nghiệm]</option>
            </select>
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Trạng thái chế độ */}
          <span className="text-slate-500">
            {customMode ? (
              <span className="text-blue-600 font-semibold">Chế độ: Tự nhập dữ liệu test</span>
            ) : (
              <span>Chế độ: <strong className="text-slate-700">{currentDoc?.title.split(' - ')[0]}</strong></span>
            )}
          </span>
        </div>

        {/* Nút thao tác chuyển chế độ hoặc mở modal */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCustomMode(!customMode)}
            className={`btn-press px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 cursor-pointer transition ${
              customMode ? 'bg-blue-600 text-white font-semibold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{customMode ? 'Xem tài liệu hệ thống' : 'Tự nhập dữ liệu test'}</span>
          </button>

          <button
            onClick={() => setIsTestModalOpen(true)}
            className="btn-press px-3 py-1.5 rounded-lg font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 cursor-pointer transition"
          >
            + Quản lý toàn bộ tài liệu test
          </button>

          {!customMode && currentDoc && (
            <button
              onClick={() => {
                if (confirm(`Bạn có chắc muốn xóa tài liệu "${currentDoc.title.split(' - ')[0]}"?`)) {
                  deleteDocument(currentDoc.id);
                  showNotify(`Đã xóa tài liệu "${currentDoc.title.split(' - ')[0]}".`);
                }
              }}
              className="btn-press px-2.5 py-1.5 rounded-lg font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer transition flex items-center space-x-1"
              title="Xóa tài liệu kiểm thử này khỏi hệ thống"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa tài liệu</span>
            </button>
          )}
        </div>
      </div>

      {/* Khu vực nhập trực tiếp khi ở chế độ Custom Mode */}
      {customMode && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 space-y-3 text-xs shadow-2xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">
              Khu vực nhập / sửa dữ liệu kiểm thử Diff View trực tiếp:
            </h3>
            <button
              onClick={() => {
                setCustomTitle('Custom_API_Spec.md');
                setCustomOldContent('# Nội dung cũ');
                setCustomNewContent('# Nội dung mới đã được cập nhật');
                setCustomDiffSnippet('+ public void newMethod()');
              }}
              className="btn-press text-slate-500 hover:text-slate-800 flex items-center space-x-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa trắng / Mẫu nhanh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tên file tài liệu:</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">File code nguồn:</label>
              <input
                type="text"
                value={customSourceFile}
                onChange={(e) => setCustomSourceFile(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Chữ ký hàm / Entity:</label>
              <input
                type="text"
                value={customCodeEntity}
                onChange={(e) => setCustomCodeEntity(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Đoạn code diff trích xuất:</label>
            <textarea
              rows={2}
              value={customDiffSnippet}
              onChange={(e) => setCustomDiffSnippet(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Bản tài liệu cũ (oldContent):</label>
              <textarea
                rows={5}
                value={customOldContent}
                onChange={(e) => setCustomOldContent(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Bản tài liệu mới (newContent):</label>
              <textarea
                rows={5}
                value={customNewContent}
                onChange={(e) => setCustomNewContent(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị Diff Viewer */}
      {customMode ? (
        <DiffViewer
          title={customTitle}
          oldVersion="Bản cũ nhập thử"
          newVersion="Bản mới nhập thử"
          oldContent={customOldContent}
          newContent={customNewContent}
          driftType="Signature"
          driftSeverity="High"
          confidenceScore={0.96}
          groundingEvidence={{
            sourceFile: customSourceFile,
            codeEntity: customCodeEntity,
            commitHash: customCommit,
            pullRequest: customPR,
            diffSnippet: customDiffSnippet
          }}
          onAccept={() => showNotify('Đã chấp thuận bản cập nhật thử nghiệm!')}
          onEdit={() => showNotify('Mở trình biên soạn')}
          onDismiss={() => showNotify('Đã bỏ qua thay đổi')}
        />
      ) : (
        currentDoc && (
          <DiffViewer
            title={currentDoc.title}
            oldVersion={`Bản lưu hành (v${currentDoc.version})`}
            newVersion="Bản tự động cập nhật (AST Sync)"
            oldContent={currentDoc.oldContent || '# Nội dung ban đầu chưa được ghi nhận'}
            newContent={currentDoc.content}
            driftType={currentDoc.driftType}
            driftSeverity={currentDoc.driftSeverity}
            confidenceScore={currentDoc.confidenceScore}
            groundingEvidence={currentDoc.groundingEvidence}
            onAccept={() => showNotify(`Đã chấp thuận cập nhật cho tài liệu ${currentDoc.title.split(' - ')[0]}`)}
            onEdit={() => showNotify(`Mở chỉnh sửa cho tài liệu ${currentDoc.title.split(' - ')[0]}`)}
            onDismiss={() => showNotify(`Đã bỏ qua sai lệch của tài liệu ${currentDoc.title.split(' - ')[0]}`)}
            onRollback={() => showNotify(`Đã hoàn tác tài liệu ${currentDoc.title.split(' - ')[0]}`)}
          />
        )
      )}
    </div>
  );
}
