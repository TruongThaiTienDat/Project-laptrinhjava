import React from 'react';

// Thành phần hiển thị trạng thái tài liệu trong quy trình kiểm duyệt (Tông màu nhạt, dịu mắt, có dấu)
interface StatusBadgeProps {
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'DRAFT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5 shrink-0" />
          <span>Bản nháp</span>
        </span>
      );
    case 'IN_REVIEW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 shrink-0 animate-pulseSubtle" />
          <span>Chờ Staff duyệt</span>
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 shrink-0" />
          <span>Staff đã duyệt</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 shrink-0" />
          <span>Bị từ chối</span>
        </span>
      );
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
          <span>Đã xuất bản</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
  }
}

// Thành phần hiển thị mức độ nghiêm trọng của sai lệch tài liệu (Drift Severity)
export function SeverityBadge({ severity }: { severity?: 'Low' | 'Medium' | 'High' | 'Critical' }) {
  if (!severity) return null;
  switch (severity) {
    case 'Critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 shrink-0 animate-pulseSubtle" />
          <span>Nghiêm trọng (Critical)</span>
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 shrink-0" />
          <span>Cao (High)</span>
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 shrink-0" />
          <span>Trung bình (Medium)</span>
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5 shrink-0" />
          <span>Thấp (Low)</span>
        </span>
      );
    default:
      return null;
  }
}

// Thành phần hiển thị phân loại kiểu sai lệch tài liệu (Drift Type)
export function DriftTypeBadge({ type }: { type?: 'Referential' | 'Signature' | 'Semantic' }) {
  if (!type) return null;
  switch (type) {
    case 'Referential':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span>Lệch tham chiếu (Referential)</span>
        </span>
      );
    case 'Signature':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span>Lệch chữ ký API (Signature)</span>
        </span>
      );
    case 'Semantic':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <span>Lệch ngữ nghĩa (Semantic)</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span>{type}</span>
        </span>
      );
  }
}
