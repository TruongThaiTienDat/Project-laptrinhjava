'use client';

import React, { useState } from 'react';
import * as Diff from 'diff';
import { 
  Check, 
  X, 
  Edit3, 
  RotateCcw, 
  GitCommit, 
  FileCode, 
  Layers, 
  Eye, 
  Columns, 
  AlignLeft, 
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { SeverityBadge, DriftTypeBadge } from './StatusBadge';

interface DiffViewerProps {
  title: string;
  oldVersion?: string;
  newVersion?: string;
  oldContent: string;
  newContent: string;
  driftType?: 'Referential' | 'Signature' | 'Semantic';
  driftSeverity?: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore?: number;
  groundingEvidence?: {
    sourceFile: string;
    codeEntity: string;
    commitHash: string;
    pullRequest?: string;
    diffSnippet: string;
  };
  onAccept?: () => void;
  onEdit?: () => void;
  onDismiss?: () => void;
  onRollback?: () => void;
}

export function DiffViewer({
  title,
  oldVersion = 'v1.0 (Hiện tại)',
  newVersion = 'v2.0 (AI Đề xuất)',
  oldContent,
  newContent,
  driftType,
  driftSeverity,
  confidenceScore = 0.95,
  groundingEvidence,
  onAccept,
  onEdit,
  onDismiss,
  onRollback,
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showEvidence, setShowEvidence] = useState(true);

  // Compute line diff
  const diffParts = Diff.diffLines(oldContent || '', newContent || '');

  let addedLinesCount = 0;
  let removedLinesCount = 0;
  diffParts.forEach(part => {
    if (part.added) addedLinesCount += (part.value.match(/\n/g) || []).length || 1;
    if (part.removed) removedLinesCount += (part.value.match(/\n/g) || []).length || 1;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-base text-white">{title}</h3>
              <DriftTypeBadge type={driftType} />
              <SeverityBadge severity={driftSeverity} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              So sánh phiên bản xuất bản ({oldVersion}) với bản tự động cập nhật ({newVersion})
            </p>
          </div>
        </div>

        {/* View toggles & Stats */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-emerald-400 font-bold">+{addedLinesCount} thêm</span>
            <span className="text-slate-500">|</span>
            <span className="text-rose-400 font-bold">-{removedLinesCount} bớt</span>
          </div>

          <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'split' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Hai cột (Split)</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'unified' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Liền khối (Unified)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grounding Evidence Banner */}
      {groundingEvidence && (
        <div className="border-b border-slate-200 bg-sky-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                Grounding Evidence (Bằng chứng trích xuất từ Source Code)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                {(confidenceScore * 100).toFixed(1)}% AI Confidence
              </span>
            </div>
            <button
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-xs text-sky-700 hover:underline flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>{showEvidence ? 'Thu gọn' : 'Xem chi tiết'}</span>
            </button>
          </div>

          {showEvidence && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 bg-white p-2.5 rounded-lg border border-sky-100">
                <div className="text-slate-500 font-medium">Tập tin mã nguồn gốc:</div>
                <code className="text-sky-700 font-mono font-bold block truncate">
                  {groundingEvidence.sourceFile}
                </code>
                <div className="text-slate-500 font-medium pt-1">AST Code Entity:</div>
                <code className="text-slate-800 font-mono block bg-slate-50 p-1.5 rounded border border-slate-200 truncate">
                  {groundingEvidence.codeEntity}
                </code>
              </div>

              <div className="space-y-1 bg-white p-2.5 rounded-lg border border-sky-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Commit & Pull Request:</span>
                  <span className="font-mono text-slate-700 flex items-center space-x-1">
                    <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-sky-600">{groundingEvidence.commitHash}</span>
                  </span>
                </div>
                {groundingEvidence.pullRequest && (
                  <div className="text-slate-700 font-medium">
                    PR: <span className="font-semibold">{groundingEvidence.pullRequest}</span>
                  </div>
                )}
                <div className="text-slate-500 font-medium pt-1">Code Diff kích hoạt:</div>
                <pre className="bg-slate-900 text-slate-200 font-mono p-1.5 rounded text-[11px] overflow-x-auto max-h-20">
                  {groundingEvidence.diffSnippet}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Diff View Area */}
      <div className="overflow-x-auto font-mono text-xs max-h-[500px] overflow-y-auto bg-slate-50">
        {viewMode === 'unified' ? (
          // Unified Inline Diff
          <table className="w-full border-collapse">
            <tbody>
              {diffParts.map((part, pIdx) => {
                const lines = part.value.split('\n');
                if (lines[lines.length - 1] === '') lines.pop();

                return lines.map((line, lIdx) => {
                  let rowBg = 'bg-white hover:bg-slate-50 text-slate-800';
                  let prefix = ' ';
                  let signColor = 'text-slate-400';

                  if (part.added) {
                    rowBg = 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-950 font-medium';
                    prefix = '+';
                    signColor = 'text-emerald-600 font-bold';
                  } else if (part.removed) {
                    rowBg = 'bg-rose-50 hover:bg-rose-100/70 text-rose-950 line-through opacity-85';
                    prefix = '-';
                    signColor = 'text-rose-600 font-bold';
                  }

                  return (
                    <tr key={`${pIdx}-${lIdx}`} className={`border-b border-slate-100 ${rowBg}`}>
                      <td className={`w-8 px-2 py-0.5 text-right select-none ${signColor} border-r border-slate-200/60`}>
                        {prefix}
                      </td>
                      <td className="px-3 py-0.5 whitespace-pre-wrap break-words">
                        {line || ' '}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        ) : (
          // Split Side-by-Side Diff
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            {/* Left Column (Old Version) */}
            <div>
              <div className="bg-slate-100 px-3 py-1.5 font-sans font-semibold text-slate-600 text-[11px] border-b border-slate-200 flex items-center justify-between">
                <span>BẢN HIỆN TẠI ({oldVersion})</span>
                <span className="text-slate-400 font-normal">Chưa cập nhật</span>
              </div>
              <div className="p-3 whitespace-pre-wrap break-words leading-relaxed text-slate-700 bg-white">
                {oldContent || '(Tài liệu trống)'}
              </div>
            </div>

            {/* Right Column (New Version with AI Update) */}
            <div>
              <div className="bg-emerald-50 px-3 py-1.5 font-sans font-semibold text-emerald-800 text-[11px] border-b border-emerald-200 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>BẢN TỰ ĐỘNG CẬP NHẬT ({newVersion})</span>
                </span>
                <span className="text-emerald-600 font-semibold">Grounded AI</span>
              </div>
              <div className="p-3 whitespace-pre-wrap break-words leading-relaxed text-slate-900 bg-emerald-50/20">
                {newContent || '(Nội dung mới)'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-600 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span>Quy trình Human-in-the-loop: Kiểm tra kỹ bằng chứng trước khi xác nhận.</span>
        </div>

        <div className="flex items-center space-x-2">
          {onRollback && (
            <button
              onClick={onRollback}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center space-x-1 transition shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Rollback</span>
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 flex items-center space-x-1 transition shadow-sm"
            >
              <X className="w-3.5 h-3.5 text-rose-500" />
              <span>Bỏ qua (Dismiss)</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs font-medium text-sky-700 bg-white border border-sky-300 rounded-lg hover:bg-sky-50 flex items-center space-x-1 transition shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-600" />
              <span>Chỉnh sửa (Edit)</span>
            </button>
          )}

          {onAccept && (
            <button
              onClick={onAccept}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1.5 transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Chấp nhận đề xuất (Accept)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

