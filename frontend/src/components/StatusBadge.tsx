import React from 'react';

// Thành phần hiển thị trạng thái tài liệu trong quy trình kiểm duyệt (Tông màu nhạt, dịu mắt, có dấu)
interface StatusBadgeProps {
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'DRAFT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Bản nháp
        </span>
      );
    case 'IN_REVIEW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          Chờ Staff duyệt
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
          Staff đã duyệt
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
          Bị từ chối
        </span>
      );
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
          Đã xuất bản
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {status}
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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Nghiêm trọng (Critical)
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          Cao (High)
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Trung bình (Medium)
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Thấp (Low)
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
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Lệch tham chiếu (Referential)
        </span>
      );
    case 'Signature':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Lệch chữ ký API (Signature)
        </span>
      );
    case 'Semantic':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Lệch ngữ nghĩa (Semantic)
        </span>
      );
    default:
      return null;
  }
}
