import React from 'react';

interface StatusBadgeProps {
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'DRAFT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
          ● Bản nháp (DRAFT)
        </span>
      );
    case 'IN_REVIEW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
          ⏳ Đang xét duyệt (IN_REVIEW)
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
          ✓ Staff đã duyệt (APPROVED)
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          ✕ Bị từ chối (REJECTED)
        </span>
      );
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          ★ Đã xuất bản (PUBLISHED)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          {status}
        </span>
      );
  }
}

export function SeverityBadge({ severity }: { severity?: 'Low' | 'Medium' | 'High' | 'Critical' }) {
  if (!severity) return null;
  switch (severity) {
    case 'Critical':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white shadow-sm">
          🚨 Critical Drift
        </span>
      );
    case 'High':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-500 text-white shadow-sm">
          ⚠️ High Drift
        </span>
      );
    case 'Medium':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
          ⚡ Medium Drift
        </span>
      );
    case 'Low':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          ℹ️ Low Drift
        </span>
      );
    default:
      return null;
  }
}

export function DriftTypeBadge({ type }: { type?: 'Referential' | 'Signature' | 'Semantic' }) {
  if (!type) return null;
  switch (type) {
    case 'Referential':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-purple-100 text-purple-800 border border-purple-200">
          🔗 Referential
        </span>
      );
    case 'Signature':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
          🧩 Signature
        </span>
      );
    case 'Semantic':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-rose-100 text-rose-800 border border-rose-200">
          🧠 Semantic
        </span>
      );
    default:
      return null;
  }
}
