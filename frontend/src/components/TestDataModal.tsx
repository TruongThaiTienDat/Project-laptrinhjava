'use client';

import React, { useState } from 'react';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { X, Plus, Edit2, Trash2, RotateCcw, Check, FileText } from 'lucide-react';
import { DocumentItem } from '@/services/api';

export function TestDataModal() {
  const { 
    isTestModalOpen, 
    setIsTestModalOpen, 
    documents, 
    addDocument, 
    updateDocument, 
    deleteDocument, 
    resetToDefaultData,
    editingDocument,
    setEditingDocument
  } = useLivingDocs();

  const [activeTab, setActiveTab] = useState<'LIST' | 'FORM'>('LIST');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Backend Service');
  const [sourceFile, setSourceFile] = useState('backend/src/main/java/com/livingdocs/service/UserService.java');
  const [codeEntity, setCodeEntity] = useState('public UserResponse getUserProfile(Long id)');
  const [commitHash, setCommitHash] = useState('b7c8912');
  const [pullRequest, setPullRequest] = useState('#15: Tối ưu UserService API');
  const [diffSnippet, setDiffSnippet] = useState('+ public UserResponse getUserProfile(Long id) {\n+     return userRepository.findDtoById(id);\n+ }');
  const [status, setStatus] = useState<'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'>('IN_REVIEW');
  const [driftSeverity, setDriftSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [driftType, setDriftType] = useState<'Signature' | 'Semantic' | 'Referential'>('Signature');
  const [oldContent, setOldContent] = useState('# Hướng Dẫn UserService (Cũ)\n\nHàm lấy thông tin người dùng cũ chưa tối ưu.');
  const [newContent, setNewContent] = useState('# Hướng Dẫn UserService (Mới)\n\nCập nhật trả về UserResponse DTO trực tiếp từ database.');

  if (!isTestModalOpen) return null;

  const handleOpenAddForm = () => {
    setEditingDocument(null);
    setTitle('UserService_Guide.md - Đặc tả dịch vụ người dùng');
    setCategory('Backend Service');
    setSourceFile('backend/src/main/java/com/livingdocs/service/UserService.java');
    setCodeEntity('public UserResponse getUserProfile(Long id)');
    setCommitHash('c4d21e8');
    setPullRequest('#20: Tối ưu hoá truy vấn UserService');
    setDiffSnippet('+ public UserResponse getUserProfile(Long id)');
    setStatus('IN_REVIEW');
    setDriftSeverity('High');
    setDriftType('Signature');
    setOldContent('# Hướng Dẫn UserService (Phiên bản 1.0)\n\nLấy thông tin người dùng truyền thống.');
    setNewContent('# Hướng Dẫn UserService (Phiên bản 2.0)\n\nTối ưu hóa truy vấn qua Spring Data JPA DTO Projection.');
    setActiveTab('FORM');
  };

  const handleOpenEditForm = (doc: DocumentItem) => {
    setEditingDocument(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setSourceFile(doc.groundingEvidence?.sourceFile || 'backend/src/main/java/...');
    setCodeEntity(doc.groundingEvidence?.codeEntity || 'public void handleMethod()');
    setCommitHash(doc.groundingEvidence?.commitHash || 'a1b2c3d');
    setPullRequest(doc.groundingEvidence?.pullRequest || '#10: Cập nhật tài liệu');
    setDiffSnippet(doc.groundingEvidence?.diffSnippet || '+ code diff snippet');
    setStatus(doc.status);
    setDriftSeverity(doc.driftSeverity || 'Medium');
    setDriftType(doc.driftType || 'Signature');
    setOldContent(doc.oldContent || '');
    setNewContent(doc.content);
    setActiveTab('FORM');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingDocument) {
      updateDocument(editingDocument.id, {
        title,
        category,
        content: newContent,
        oldContent,
        status,
        driftSeverity,
        driftType,
        groundingEvidence: {
          sourceFile,
          codeEntity,
          commitHash,
          pullRequest,
          diffSnippet
        }
      });
    } else {
      addDocument({
        title,
        category,
        repository: 'TruongThaiTienDat/Project-laptrinhjava',
        version: '1.0',
        content: newContent,
        oldContent,
        status,
        driftSeverity,
        driftType,
        confidenceScore: 0.95,
        groundingEvidence: {
          sourceFile,
          codeEntity,
          commitHash,
          pullRequest,
          diffSnippet
        },
        lastModifiedBy: 'Người dùng Test'
      });
    }

    setActiveTab('LIST');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">
              Quản Lý Dữ Liệu Thử Nghiệm (Dynamic Test Data)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Thêm, sửa tài liệu để kiểm thử đồng bộ dữ liệu tức thời trên cả 5 trang.
            </p>
          </div>
          <button
            onClick={() => setIsTestModalOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab chuyển đổi */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 text-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-3 py-1.5 rounded font-medium transition ${
                activeTab === 'LIST' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Danh sách tài liệu ({documents.length})
            </button>
            <button
              onClick={handleOpenAddForm}
              className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1 transition ${
                activeTab === 'FORM' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingDocument ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu mẫu ban đầu?')) {
                resetToDefaultData();
                setActiveTab('LIST');
              }
            }}
            className="text-slate-600 hover:text-rose-600 flex items-center space-x-1 font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục gốc</span>
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="flex-1 overflow-y-auto p-4 text-xs">
          {activeTab === 'LIST' ? (
            <div className="space-y-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px]">
                    <th className="py-2 px-3">Tên file tài liệu</th>
                    <th className="py-2 px-3">File code liên kết</th>
                    <th className="py-2 px-3">Trạng thái</th>
                    <th className="py-2 px-3">Mức độ lệch</th>
                    <th className="py-2 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">{doc.title.split(' - ')[0]}</div>
                        <div className="text-slate-400 text-[11px] truncate max-w-xs">{doc.category}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                        {doc.groundingEvidence?.sourceFile.split('/').pop() || 'Chưa liên kết'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {doc.driftSeverity || 'Low'}
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditForm(doc)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          title="Chỉnh sửa tài liệu"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa tài liệu "${doc.title.split(' - ')[0]}"?`)) {
                              deleteDocument(doc.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 font-medium"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Form Thêm / Sửa tài liệu
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tên tài liệu / Tiêu đề (*):</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
                    placeholder="Ví dụ: OrderService_Guide.md - Đặc tả đơn hàng"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Chuyên mục / Module:</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs outline-none focus:border-blue-500"
                    placeholder="Backend Controller / Service"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">File code liên kết (sourceFile):</label>
                  <input
                    type="text"
                    value={sourceFile}
                    onChange={(e) => setSourceFile(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">AST Entity (Chữ ký hàm/class):</label>
                  <input
                    type="text"
                    value={codeEntity}
                    onChange={(e) => setCodeEntity(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Commit Hash & Pull Request:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={commitHash}
                      onChange={(e) => setCommitHash(e.target.value)}
                      className="p-2 border border-slate-300 rounded text-xs font-mono outline-none"
                      placeholder="Commit Hash (vd: a1b2c3d)"
                    />
                    <input
                      type="text"
                      value={pullRequest}
                      onChange={(e) => setPullRequest(e.target.value)}
                      className="p-2 border border-slate-300 rounded text-xs outline-none"
                      placeholder="PR (vd: #15: Feature)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Trạng thái:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded text-xs outline-none"
                    >
                      <option value="DRAFT">Bản nháp (DRAFT)</option>
                      <option value="IN_REVIEW">Chờ duyệt (IN_REVIEW)</option>
                      <option value="APPROVED">Đã duyệt (APPROVED)</option>
                      <option value="PUBLISHED">Đã xuất bản (PUBLISHED)</option>
                      <option value="REJECTED">Từ chối (REJECTED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Mức độ lệch:</label>
                    <select
                      value={driftSeverity}
                      onChange={(e) => setDriftSeverity(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded text-xs outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Kiểu sai lệch:</label>
                    <select
                      value={driftType}
                      onChange={(e) => setDriftType(e.target.value as any)}
                      className="w-full p-2 border border-slate-300 rounded text-xs outline-none"
                    >
                      <option value="Signature">Signature</option>
                      <option value="Semantic">Semantic</option>
                      <option value="Referential">Referential</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Đoạn Code Diff trích xuất:</label>
                <textarea
                  rows={2}
                  value={diffSnippet}
                  onChange={(e) => setDiffSnippet(e.target.value)}
                  className="w-full p-2 font-mono text-xs border border-slate-300 rounded outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nội dung tài liệu cũ (oldContent):</label>
                  <textarea
                    rows={4}
                    value={oldContent}
                    onChange={(e) => setOldContent(e.target.value)}
                    className="w-full p-2 font-mono text-xs border border-slate-300 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Nội dung tài liệu mới (newContent):</label>
                  <textarea
                    rows={4}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full p-2 font-mono text-xs border border-slate-300 rounded outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="px-3.5 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-medium transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center space-x-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingDocument ? 'Cập nhật tài liệu' : 'Lưu tài liệu mới'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
