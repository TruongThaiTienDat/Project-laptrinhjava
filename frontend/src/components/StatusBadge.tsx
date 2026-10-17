import React from 'react';

// Thanh phan hien thi trang thai tai lieu trong quy trinh kiem duyet
interface StatusBadgeProps {
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'DRAFT':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          Ban nhap (DRAFT)
        </span>
      );
    case 'IN_REVIEW':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          Dang cho Staff duyet (IN_REVIEW)
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
          Staff da duyet - Cho Manager (APPROVED)
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          Tu choi - Can sua lai (REJECTED)
        </span>
      );
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
          Da xuat ban chinh thuc (PUBLISHED)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
}

// Thanh phan hien thi muc do nghiem trong cua sai lech tai lieu (Drift Severity)
export function SeverityBadge({ severity }: { severity?: 'Low' | 'Medium' | 'High' | 'Critical' }) {
  if (!severity) return null;
  switch (severity) {
    case 'Critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-700 text-white">
          Muc do: Nghiem trong (Critical)
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-600 text-white">
          Muc do: Cao (High)
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-200 text-amber-900 border border-amber-300">
          Muc do: Trung binh (Medium)
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-900 border border-emerald-300">
          Muc do: Thap (Low)
        </span>
      );
    default:
      return null;
  }
}

// Thanh phan hien thi phan loai kieu sai lech tai lieu (Drift Type)
export function DriftTypeBadge({ type }: { type?: 'Referential' | 'Signature' | 'Semantic' }) {
  if (!type) return null;
  switch (type) {
    case 'Referential':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-purple-100 text-purple-900 border border-purple-200">
          Kieu: Sai lech tham chieu (Referential)
        </span>
      );
    case 'Signature':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-indigo-100 text-indigo-900 border border-indigo-200">
          Kieu: Doi chu ky ham/API (Signature)
        </span>
      );
    case 'Semantic':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-rose-100 text-rose-900 border border-rose-200">
          Kieu: Doi logic nghiep vu (Semantic)
        </span>
      );
    default:
      return null;
  }
}
