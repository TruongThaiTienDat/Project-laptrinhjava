'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  workflowApi, 
  DocumentItem 
} from '@/services/api';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    workflowApi.getDocuments().then(docs => setDocuments(docs));
  }, []);

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Bản nháp', className: 'bg-slate-100 text-slate-700' };
      case 'IN_REVIEW':
        return { label: 'Chờ duyệt', className: 'bg-amber-100 text-amber-800' };
      case 'APPROVED':
        return { label: 'Đã duyệt', className: 'bg-blue-100 text-blue-800' };
      case 'PUBLISHED':
        return { label: 'Đã xuất bản', className: 'bg-emerald-100 text-emerald-800' };
      case 'REJECTED':
        return { label: 'Bị từ chối', className: 'bg-red-100 text-red-800' };
      default:
        return { label: status, className: 'bg-slate-100 text-slate-700' };
    }
  };

  // Hàm hiển thị mức độ lệch
  const getDriftSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Critical</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">Low</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">None</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Tổng quan hệ thống</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi số lượng tài liệu kỹ thuật và các thay đổi mã nguồn gần đây.
        </p>
      </div>

      {/* 4 ô thống kê số liệu tiêu chuẩn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ô 1: Tổng số tài liệu */}
        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng số tài liệu</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">4</div>
          <div className="text-xs text-slate-500 mt-1">Đang hoạt động</div>
        </div>

        {/* Ô 2: Chờ duyệt */}
        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">1</div>
          <div className="text-xs text-amber-600 mt-1">Cần kiểm tra</div>
        </div>

        {/* Ô 3: Đã duyệt */}
        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đã duyệt</span>
            <CheckCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">1</div>
          <div className="text-xs text-blue-600 mt-1">Sẵn sàng xuất bản</div>
        </div>

        {/* Ô 4: Tự động hóa */}
        <div className="bg-white p-4 rounded border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tự động hóa</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-800">88.5%</div>
          <div className="text-xs text-emerald-600 mt-1">Được sinh tự động</div>
        </div>
      </div>

      {/* Bảng dữ liệu: Danh sách tài liệu cập nhật gần đây */}
      <div className="bg-white rounded border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-800">
            Danh sách tài liệu cập nhật gần đây
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-3 px-4">Tên tài liệu</th>
                <th className="py-3 px-4">File code liên kết</th>
                <th className="py-3 px-4">Commit / PR</th>
                <th className="py-3 px-4">Mức độ lệch</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const statusInfo = getStatusText(doc.status);
                const codeFile = doc.groundingEvidence?.sourceFile || 'Chưa liên kết';
                const prCommit = doc.groundingEvidence?.pullRequest 
                  ? `${doc.groundingEvidence.pullRequest.split(':')[0]} - ${doc.groundingEvidence.commitHash.slice(0, 7)}`
                  : 'Commit mới';

                return (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{doc.title.split(' - ')[0]}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-xs">{doc.title}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {codeFile.split('/').pop()}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {prCommit}
                    </td>
                    <td className="py-3 px-4">
                      {getDriftSeverityBadge(doc.driftSeverity)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href="/workflow"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
