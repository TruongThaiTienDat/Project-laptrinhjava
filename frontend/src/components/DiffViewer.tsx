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
  Columns, 
  AlignLeft, 
  FileText
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
  oldVersion = 'Bản hiện hành',
  newVersion = 'Bản đề xuất cập nhật',
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
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);

  // Tính toán line diff cho chế độ Liền khối (Unified)
  const diffParts = Diff.diffLines(oldContent || '', newContent || '');

  let addedLinesCount = 0;
  let removedLinesCount = 0;
  diffParts.forEach(part => {
    if (part.added) addedLinesCount += (part.value.match(/\n/g) || []).length || 1;
    if (part.removed) removedLinesCount += (part.value.match(/\n/g) || []).length || 1;
  });

  // Chuẩn hóa và tách dòng theo từng dòng (split('\n')) phục vụ chế độ xem Hai cột (Split View)
  const normalizedOld = (oldContent || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const normalizedNew = (newContent || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const oldLines = normalizedOld ? normalizedOld.split('\n') : [];
  const newLines = normalizedNew ? normalizedNew.split('\n') : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      {/* 1. Header bar - Nền xám nhạt tinh gọn */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-slate-800">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-white border border-slate-200 text-blue-600 rounded-lg shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 truncate">{title}</h3>
              <DriftTypeBadge type={driftType} />
              <SeverityBadge severity={driftSeverity} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh: <span className="font-medium text-slate-700">{oldVersion}</span> ➔ <span className="font-medium text-blue-700">{newVersion}</span>
            </p>
          </div>
        </div>

        {/* Thống kê dòng & Nút chuyển chế độ xem */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-[11px] tabular-nums">
            <span className="text-emerald-700 font-medium">+{addedLinesCount} thêm</span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-700 font-medium">-{removedLinesCount} bớt</span>
          </div>

          <div className="bg-white p-0.5 rounded-lg border border-slate-200 flex items-center space-x-1">
            <button
              onClick={() => setViewMode('split')}
              className={`btn-press px-2.5 py-1 text-xs rounded-md font-medium flex items-center space-x-1 cursor-pointer transition ${
                viewMode === 'split' ? 'bg-blue-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Hai cột</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`btn-press px-2.5 py-1 text-xs rounded-md font-medium flex items-center space-x-1 cursor-pointer transition ${
                viewMode === 'unified' ? 'bg-blue-600 text-white font-semibold shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Liền khối</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Grounding Evidence Banner */}
      {groundingEvidence && (
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-medium text-slate-500">Bằng chứng liên kết:</span>
              <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                <FileCode className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-medium">{groundingEvidence.sourceFile.split('/').pop()}</span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                <span className="text-slate-400">Entity:</span>
                <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 font-medium">
                  {groundingEvidence.codeEntity.split('(')[0]}()
                </span>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-600">
                <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                <span>{groundingEvidence.commitHash.slice(0, 7)}</span>
                {groundingEvidence.pullRequest && (
                  <span className="text-slate-500">({groundingEvidence.pullRequest.split(':')[0]})</span>
                )}
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200 tabular-nums">
                {(confidenceScore * 100).toFixed(0)}% Độ tin cậy
              </span>
            </div>

            {groundingEvidence.diffSnippet && (
              <button
                onClick={() => setShowCodeSnippet(!showCodeSnippet)}
                className="btn-press text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                {showCodeSnippet ? 'Ẩn đoạn code' : 'Xem đoạn code diff'}
              </button>
            )}
          </div>

          {/* Chi tiết đoạn code diff */}
          {showCodeSnippet && groundingEvidence.diffSnippet && (
            <div className="mt-2.5 pt-2 border-t border-slate-200 animate-fadeIn">
              <pre className="bg-slate-900 text-slate-200 font-mono p-3 rounded-lg text-[11px] overflow-x-auto max-h-40 leading-relaxed">
                {groundingEvidence.diffSnippet}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 3. Khu vực so sánh nội dung Diff View */}
      <div className="overflow-x-auto font-mono text-xs max-h-[500px] overflow-y-auto">
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
                    rowBg = 'bg-emerald-50/70 hover:bg-emerald-100/60 text-emerald-950 font-medium';
                    prefix = '+';
                    signColor = 'text-emerald-700 font-bold';
                  } else if (part.removed) {
                    rowBg = 'bg-rose-50/70 hover:bg-rose-100/60 text-rose-950 line-through opacity-80';
                    prefix = '-';
                    signColor = 'text-rose-700 font-bold';
                  }

                  return (
                    <tr key={`${pIdx}-${lIdx}`} className={`border-b border-slate-100 transition-colors ${rowBg}`}>
                      <td className={`w-8 px-2 py-0.5 text-right select-none ${signColor} border-r border-slate-200/60`}>
                        {prefix}
                      </td>
                      <td className="px-3 py-0.5 whitespace-pre-wrap break-words leading-relaxed">
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
            {/* Cột trái (Bản hiện hành) */}
            <div className="flex flex-col bg-white">
              <div className="bg-slate-50 px-3 py-1.5 font-sans font-medium text-slate-600 text-xs border-b border-slate-200 flex items-center justify-between shrink-0">
                <span>{oldVersion.toUpperCase()}</span>
                <span className="text-slate-400 text-[11px]">Bản trước</span>
              </div>
              <div className="py-2 flex-1 overflow-x-auto">
                {oldLines.length > 0 && oldLines.some(l => l.trim() !== '') ? (
                  oldLines.map((line, idx) => {
                    const isRemoved = line.trim() !== '' && !newLines.includes(line);
                    return (
                      <div
                        key={idx}
                        className={`flex items-start py-0.5 font-mono text-xs leading-relaxed transition-colors ${
                          isRemoved
                            ? 'bg-rose-50 hover:bg-rose-100/50 text-rose-900 border-l-4 border-rose-500 px-2'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-l-4 border-transparent px-2'
                        }`}
                      >
                        <span className={`w-4 shrink-0 select-none font-bold ${isRemoved ? 'text-rose-600' : 'text-transparent'}`}>
                          {isRemoved ? '-' : ' '}
                        </span>
                        <span className="whitespace-pre-wrap break-words flex-1">
                          {line || '\u00A0'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3.5 text-slate-400 italic text-xs">
                    {oldContent || '(Tài liệu trống)'}
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải (Bản tự động cập nhật) */}
            <div className="flex flex-col bg-white">
              <div className="bg-blue-50/50 px-3 py-1.5 font-sans font-medium text-blue-900 text-xs border-b border-blue-200/70 flex items-center justify-between shrink-0">
                <span>{newVersion.toUpperCase()}</span>
                <span className="text-blue-700 text-[11px] font-medium">Bản cập nhật</span>
              </div>
              <div className="py-2 flex-1 overflow-x-auto">
                {newLines.length > 0 && newLines.some(l => l.trim() !== '') ? (
                  newLines.map((line, idx) => {
                    const isAdded = line.trim() !== '' && !oldLines.includes(line);
                    return (
                      <div
                        key={idx}
                        className={`flex items-start py-0.5 font-mono text-xs leading-relaxed transition-colors ${
                          isAdded
                            ? 'bg-emerald-50 hover:bg-emerald-100/50 text-emerald-900 border-l-4 border-emerald-500 px-2'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-l-4 border-transparent px-2'
                        }`}
                      >
                        <span className={`w-4 shrink-0 select-none font-bold ${isAdded ? 'text-emerald-600' : 'text-transparent'}`}>
                          {isAdded ? '+' : ' '}
                        </span>
                        <span className="whitespace-pre-wrap break-words flex-1">
                          {line || '\u00A0'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3.5 text-slate-400 italic text-xs">
                    {newContent || '(Nội dung mới)'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Toolbar */}
      {(onAccept || onEdit || onDismiss || onRollback) && (
        <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Xác nhận kiểm tra kỹ nội dung thay đổi trước khi chuyển bước duyệt.
          </span>

          <div className="flex items-center space-x-2">
            {onRollback && (
              <button
                onClick={onRollback}
                className="btn-press px-3 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Khôi phục</span>
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="btn-press px-3 py-1.5 font-medium text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-rose-600" />
                <span>Bỏ qua</span>
              </button>
            )}

            {onEdit && (
              <button
                onClick={onEdit}
                className="btn-press px-3 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                <span>Chỉnh sửa</span>
              </button>
            )}

            {onAccept && (
              <button
                onClick={onAccept}
                className="btn-press px-3.5 py-1.5 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Chấp nhận đề xuất</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
