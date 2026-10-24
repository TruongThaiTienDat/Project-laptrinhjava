'use client';

import React, { useState } from 'react';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { 
  BookOpen, 
  Search, 
  FileCode, 
  Code, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  FileText, 
  Eye, 
  Check 
} from 'lucide-react';
import { templatesData } from '@/services/api';

export default function KnowledgeBasePage() {
  const { entities } = useLivingDocs();

  const [entityList, setEntityList] = useState(entities);
  const [selectedEntityId, setSelectedEntityId] = useState<string>(entities[0]?.id || 'ent-1');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'TEMPLATES'>('ENTITIES');
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [generatingForMethod, setGeneratingForMethod] = useState<string | null>(null);

  const selectedEntity = entityList.find(e => e.id === selectedEntityId) || entityList[0];

  // Lọc danh sách thực thể
  const filteredEntities = entityList.filter(ent => {
    if (selectedCategory !== 'ALL' && ent.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = ent.entityName.toLowerCase().includes(q);
      const matchPath = ent.filePath.toLowerCase().includes(q);
      const matchMethod = ent.methods.some(m => m.name.toLowerCase().includes(q) || m.signature.toLowerCase().includes(q));
      return matchName || matchPath || matchMethod;
    }
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tự động sinh tài liệu mẫu cho phương thức còn thiếu
  const handleGenerateDocForMethod = (methodName: string) => {
    setGeneratingForMethod(methodName);
    setTimeout(() => {
      setEntityList(prev => prev.map(ent => {
        if (ent.id === selectedEntity.id) {
          const updatedMethods = ent.methods.map(m => {
            if (m.name === methodName) {
              return {
                ...m,
                status: 'DOCUMENTED' as const,
                docTitle: `${ent.entityName} - Đặc tả chi tiết`
              };
            }
            return m;
          });
          return {
            ...ent,
            docCoverage: '100%',
            statusBadge: 'Đã đồng bộ',
            methods: updatedMethods,
            docContent: ent.docContent + `\n\n### Bổ Sung Phương Thức: ${methodName}\n- Đặc tả được hệ thống trích xuất tự động từ chữ ký cú pháp AST.\n- Trạng thái: Sẵn sàng đưa vào luồng xét duyệt Workflow.`
          };
        }
        return ent;
      }));
      setGeneratingForMethod(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tiêu đề trang */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Kho Tri Thức & Liên Kết Mã Nguồn (Knowledge Base)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu tài liệu kỹ thuật, theo dõi quan hệ liên kết giữa tài liệu và cây cú pháp AST (Classes, Methods, Endpoints).
          </p>
        </div>

        {/* Chuyển đổi giữa chế độ xem Code Entity và Thư viện Template */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ENTITIES')}
            className={`btn-press px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${
              activeTab === 'ENTITIES'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Liên kết mã nguồn AST
          </button>
          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={`btn-press px-3 py-1.5 rounded-lg font-medium cursor-pointer transition ${
              activeTab === 'TEMPLATES'
                ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            Thư viện Template ({templatesData.length})
          </button>
        </div>
      </div>

      {activeTab === 'ENTITIES' ? (
        <>
          {/* Thanh tìm kiếm và bộ lọc phân loại */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm class, method, endpoint hoặc file nguồn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-slate-50/50 transition"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Phân loại:</span>
              <div className="flex flex-wrap gap-1">
                {['ALL', 'Backend Controller', 'GitHub Integration', 'AI Engine Parser', 'Authentication'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`btn-press px-2.5 py-1 rounded-md text-xs cursor-pointer transition ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {cat === 'ALL' ? 'Tất cả' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bố cục 2 cột cân đối: 1/3 Danh sách file - 2/3 Bảng phương thức & tài liệu */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Cột trái (1/3): Danh sách File & Class */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-xs font-bold text-slate-800">
                  Tập tin & Class mã nguồn ({filteredEntities.length})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  AST Graph
                </span>
              </div>

              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {filteredEntities.map((ent) => {
                  const isSelected = ent.id === selectedEntity.id;
                  return (
                    <div
                      key={ent.id}
                      onClick={() => setSelectedEntityId(ent.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <FileCode className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-900">{ent.entityName}</span>
                        </div>
                        <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 tabular-nums">
                          {ent.docCoverage}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 truncate mb-2">
                        {ent.packagePath}
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>{ent.methods.length} phương thức / API</span>
                        <span className="font-medium text-slate-700">{ent.statusBadge}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cột phải (2/3): Hiển thị dạng Bảng danh sách phẳng hoặc Xem trước tài liệu */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
              {/* Header tệp nguồn */}
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {selectedEntity.category}
                    </span>
                    <h2 className="text-base font-bold text-slate-900">{selectedEntity.entityName}</h2>
                  </div>
                  <code className="text-xs text-slate-500 font-mono block mt-1">
                    {selectedEntity.filePath}
                  </code>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="btn-press px-3 py-1.5 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{previewMode ? 'Xem bảng hàm / API' : 'Xem nội dung Markdown'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(selectedEntity.filePath)}
                    className="btn-press px-3 py-1.5 text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                    title="Sao chép đường dẫn file"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {!previewMode ? (
                /* Danh sách hàm/phương thức dưới dạng Bảng (Table) */
                <div>
                  <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                      <Code className="w-4 h-4 text-blue-600" />
                      <span>Danh sách Phương thức & Chữ ký cú pháp AST</span>
                    </span>
                    <span className="text-slate-500">
                      Tỷ lệ bao phủ tài liệu: <strong className="text-slate-900 tabular-nums">{selectedEntity.docCoverage}</strong>
                    </span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2.5 px-4 w-2/5">Phương thức & Chữ ký (Signature)</th>
                        <th className="py-2.5 px-4 w-2/5">Tài liệu & Mô tả liên kết</th>
                        <th className="py-2.5 px-4 text-center">Trạng thái</th>
                        <th className="py-2.5 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedEntity.methods.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 align-top">
                            <div className="font-mono font-semibold text-slate-900">{m.name}</div>
                            <code className="text-[11px] text-slate-500 font-mono block mt-0.5 line-clamp-2 leading-relaxed">
                              {m.signature}
                            </code>
                          </td>

                          <td className="py-3 px-4 align-top">
                            <div className="font-semibold text-slate-800 text-[11px]">{m.docTitle}</div>
                            <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                              {m.description}
                            </p>
                          </td>

                          <td className="py-3 px-4 text-center align-top whitespace-nowrap">
                            {m.status === 'DOCUMENTED' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 shrink-0" />
                                <span>Đã có tài liệu</span>
                              </span>
                            )}
                            {m.status === 'NEEDS_UPDATE' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 shrink-0 animate-pulseSubtle" />
                                <span>Cần cập nhật</span>
                              </span>
                            )}
                            {m.status === 'MISSING_DOC' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 shrink-0" />
                                <span>Chưa có tài liệu</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right align-top whitespace-nowrap">
                            {m.status === 'MISSING_DOC' ? (
                              <button
                                onClick={() => handleGenerateDocForMethod(m.name)}
                                disabled={generatingForMethod === m.name}
                                className="btn-press px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-[11px] flex items-center space-x-1 ml-auto transition shadow-2xs cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{generatingForMethod === m.name ? 'Đang tạo...' : 'Tạo AI Doc'}</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">Đã đồng bộ</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Chế độ xem trước nội dung tài liệu Markdown */
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Nội dung tài liệu sinh tự động từ AST: {selectedEntity.entityName}</span>
                    </h3>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
                    {selectedEntity.docContent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Tab 2: Thư viện Template tài liệu */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templatesData.map((tpl) => (
            <div
              key={tpl.id}
              className="card-hover bg-white p-4 rounded-xl border border-slate-200/90 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {tpl.category}
                  </span>
                  <span className="font-mono text-xs text-slate-400 tabular-nums">v{tpl.version}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{tpl.name}</h3>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">
                  {tpl.description}
                </p>

                <div className="text-xs font-semibold text-slate-700 mb-1.5">Cấu trúc đề xuất:</div>
                <div className="space-y-1">
                  {tpl.structure.map((item, idx) => (
                    <div key={idx} className="text-[11px] text-slate-600 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Chuẩn LivingDocs</span>
                <button
                  onClick={() => handleCopy(tpl.sampleContent)}
                  className="btn-press px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center space-x-1 transition cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Sao chép mẫu</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
