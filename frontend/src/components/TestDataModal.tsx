'use client';

import React, { useState, useRef } from 'react';
import { useLivingDocs } from '@/context/LivingDocsContext';
import { 
  X, 
  Upload, 
  FileText, 
  FileCode, 
  Sparkles, 
  Check, 
  Trash2, 
  RotateCcw, 
  Sliders, 
  AlertCircle,
  CheckCircle2,
  Edit2
} from 'lucide-react';
import { DocumentItem } from '@/services/api';

// Hàm phân tích AST đơn giản bằng Regex hỗ trợ đa ngôn ngữ
function parseCodeAST(code: string, fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const methods: { name: string; signature: string; params: string }[] = [];
  let primaryClass = '';

  if (ext === 'java' || ext === 'cs' || ext === 'cpp') {
    const classMatch = code.match(/(?:public\s+|private\s+|protected\s+)?(?:abstract\s+)?(?:class|interface|enum|record)\s+([A-Za-z0-9_]+)/);
    if (classMatch) primaryClass = classMatch[1];

    const methodRegex = /(?:public|protected|private|static)\s+([\w<>\[\]]+)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g;
    let match;
    while ((match = methodRegex.exec(code)) !== null) {
      methods.push({
        name: match[2],
        signature: `public ${match[1]} ${match[2]}(${match[3].trim()})`,
        params: match[3].trim()
      });
    }
  } else if (ext === 'py') {
    const classMatch = code.match(/class\s+([A-Za-z0-9_]+)/);
    if (classMatch) primaryClass = classMatch[1];

    const defRegex = /def\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g;
    let match;
    while ((match = defRegex.exec(code)) !== null) {
      methods.push({
        name: match[1],
        signature: `def ${match[1]}(${match[2].trim()})`,
        params: match[2].trim()
      });
    }
  } else if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx') {
    const classMatch = code.match(/(?:export\s+)?class\s+([A-Za-z0-9_]+)/);
    if (classMatch) primaryClass = classMatch[1];

    const fnRegex = /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g;
    let match;
    while ((match = fnRegex.exec(code)) !== null) {
      methods.push({
        name: match[1],
        signature: `function ${match[1]}(${match[2].trim()})`,
        params: match[2].trim()
      });
    }
    const arrowRegex = /(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/g;
    while ((match = arrowRegex.exec(code)) !== null) {
      methods.push({
        name: match[1],
        signature: `const ${match[1]} = (${match[2].trim()}) =>`,
        params: match[2].trim()
      });
    }
  } else if (ext === 'sql') {
    const tableMatch = code.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z0-9_]+)/i);
    if (tableMatch) primaryClass = `TABLE ${tableMatch[1]}`;

    const procMatch = code.match(/CREATE\s+(?:OR\s+REPLACE\s+)?(?:PROCEDURE|FUNCTION)\s+([A-Za-z0-9_]+)/i);
    if (procMatch) {
      methods.push({
        name: procMatch[1],
        signature: `PROCEDURE ${procMatch[1]}()`,
        params: ''
      });
    }
  }

  // Fallback
  if (methods.length === 0) {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    primaryClass = primaryClass || baseName;
    methods.push({
      name: `handle${baseName}`,
      signature: `public void handle${baseName}()`,
      params: ''
    });
  }

  const primaryEntity = methods[0]?.signature || (primaryClass ? `class ${primaryClass}` : `File ${fileName}`);

  const diffSnippet = `@@ -1,5 +1,15 @@
// Tệp nguồn: src/${fileName}
+ // [LivingDocs AST Analyzer] Phát hiện ${methods.length} phương thức:
${methods.slice(0, 4).map(m => `+ ${m.signature}`).join('\n')}`;

  return {
    primaryClass,
    methods,
    primaryEntity,
    diffSnippet
  };
}

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

  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'MANUAL' | 'LIST'>('UPLOAD');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Backend Service');
  const [sourceFile, setSourceFile] = useState('src/service/SampleService.java');
  const [codeEntity, setCodeEntity] = useState('public void processRequest()');
  const [commitHash, setCommitHash] = useState('a9c2b4d');
  const [pullRequest, setPullRequest] = useState('#25: Cập nhật tệp mã nguồn');
  const [diffSnippet, setDiffSnippet] = useState('+ public void processRequest() {\n+     // new business logic\n+ }');
  const [status, setStatus] = useState<'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'>('IN_REVIEW');
  const [driftSeverity, setDriftSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [driftType, setDriftType] = useState<'Signature' | 'Semantic' | 'Referential'>('Signature');
  const [oldContent, setOldContent] = useState('');
  const [newContent, setNewContent] = useState('');

  // Trạng thái tệp tải lên
  const [uploadedDocName, setUploadedDocName] = useState<string>('');
  const [uploadedDocSize, setUploadedDocSize] = useState<string>('');
  const [uploadedCodeName, setUploadedCodeName] = useState<string>('');
  const [uploadedCodeSize, setUploadedCodeSize] = useState<string>('');
  const [uploadedCodeRaw, setUploadedCodeRaw] = useState<string>('');
  const [detectedMethods, setDetectedMethods] = useState<{ name: string; signature: string }[]>([]);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const docFileInputRef = useRef<HTMLInputElement>(null);
  const codeFileInputRef = useRef<HTMLInputElement>(null);

  if (!isTestModalOpen) return null;

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Xử lý đọc file tài liệu từ máy tính (.md, .txt, .rst, .adoc)
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const formattedTitle = `${file.name} - Tài liệu tải lên`;
      setTitle(formattedTitle);
      setOldContent(text);
      setNewContent(text); // Khởi tạo nội dung mới tương tự bản cũ
      setUploadedDocName(file.name);
      setUploadedDocSize(`${(file.size / 1024).toFixed(1)} KB`);
      showToast(`Đã đọc thành công tệp tài liệu: ${file.name}`);
    };
    reader.onerror = () => {
      showToast('Lỗi khi đọc file tài liệu.', 'error');
    };
    reader.readAsText(file);
  };

  // 2. Xử lý đọc file mã nguồn từ máy tính (.java, .py, .ts, .js, .cpp, .cs, .sql...)
  const handleCodeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const codeText = event.target?.result as string;
      setUploadedCodeRaw(codeText);
      setUploadedCodeName(file.name);
      setUploadedCodeSize(`${(file.size / 1024).toFixed(1)} KB`);
      setSourceFile(`src/${file.name}`);

      // Phân tích AST trích xuất hàm và class
      const ast = parseCodeAST(codeText, file.name);
      setDetectedMethods(ast.methods);
      setCodeEntity(ast.primaryEntity);
      setDiffSnippet(ast.diffSnippet);
      setCommitHash(Math.random().toString(16).substring(2, 9));
      setPullRequest(`#${Math.floor(Math.random() * 50) + 10}: Cập nhật ${file.name}`);

      showToast(`Đã trích xuất ${ast.methods.length} thực thể AST từ ${file.name}`);
    };
    reader.onerror = () => {
      showToast('Lỗi khi đọc file mã nguồn.', 'error');
    };
    reader.readAsText(file);
  };

  // 3. Tự động sinh bản cập nhật tài liệu từ mã nguồn vừa tải lên
  const handleAutoGenerateDoc = () => {
    if (!uploadedCodeRaw && !diffSnippet) {
      showToast('Vui lòng tải lên file mã nguồn hoặc nhập đoạn code trước khi sinh tài liệu.', 'error');
      return;
    }

    const ast = parseCodeAST(uploadedCodeRaw || diffSnippet, uploadedCodeName || 'SourceCode.java');
    const baseContent = oldContent.trim() 
      ? oldContent 
      : `# Tài Liệu: ${title.split(' - ')[0] || uploadedDocName || 'Hướng Dẫn Dịch Vụ'}\n\n## 1. Tổng Quan\nTài liệu hệ thống ban đầu.`;

    const generatedDoc = `${baseContent}

## 2. Đặc Tả Phương Thức (Sinh Tự Động Từ AST)
Mã nguồn tệp \`${sourceFile || uploadedCodeName}\` đã được phân tích tự động:
- **Thực thể AST:** \`${ast.primaryEntity}\`
- **Mã Commit / PR:** \`${commitHash}\` (${pullRequest})

### Danh Sách Phương Thức Nhận Diện:
${ast.methods.map((m, idx) => `### 2.${idx + 1}. \`${m.signature}\`
- **Mô tả:** Xử lý nghiệp vụ logic cho phương thức \`${m.name}\`.
- **Tham số đầu vào:** \`${m.params || 'Không có'}\`
- **Trạng thái đồng bộ:** Đã đồng bộ với mã nguồn mới nhất qua LivingDocs AST Analyzer.`).join('\n\n')}

## 3. Lịch Sử Sai Lệch (Drift Audit)
Phát hiện sai lệch dạng **${driftType}** với mức độ nghiêm trọng **${driftSeverity}**. Tài liệu được hệ thống tự động cập nhật.`;

    setNewContent(generatedDoc);
    showToast(`Đã tự động tạo bản cập nhật tài liệu từ ${ast.methods.length} phương thức AST!`);
  };

  // Lưu tài liệu vào Global Store Context & localStorage
  const handleSaveDocument = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      showToast('Vui lòng nhập tên tài liệu.', 'error');
      return;
    }

    if (editingDocument) {
      updateDocument(editingDocument.id, {
        title,
        category,
        content: newContent || oldContent || '# Tài liệu cập nhật',
        oldContent: oldContent || '# Tài liệu ban đầu',
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
      showToast(`Đã cập nhật tài liệu: ${title.split(' - ')[0]}`);
    } else {
      addDocument({
        title,
        category,
        repository: 'TruongThaiTienDat/Project-laptrinhjava',
        version: '1.0',
        content: newContent || oldContent || '# Tài liệu mới tải lên',
        oldContent: oldContent || '# Bản tài liệu ban đầu trước khi sửa',
        status,
        driftSeverity,
        driftType,
        confidenceScore: 0.96,
        groundingEvidence: {
          sourceFile,
          codeEntity,
          commitHash,
          pullRequest,
          diffSnippet
        },
        lastModifiedBy: 'Tải lên từ máy tính'
      });
      showToast(`Đã đưa tài liệu "${title.split(' - ')[0]}" vào hệ thống!`);
    }

    setEditingDocument(null);
    setIsTestModalOpen(false);
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setEditingDocument(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setSourceFile(doc.groundingEvidence?.sourceFile || 'src/Service.java');
    setCodeEntity(doc.groundingEvidence?.codeEntity || 'public void method()');
    setCommitHash(doc.groundingEvidence?.commitHash || 'c1d2e3f');
    setPullRequest(doc.groundingEvidence?.pullRequest || '#1: Cập nhật');
    setDiffSnippet(doc.groundingEvidence?.diffSnippet || '+ code diff');
    setStatus(doc.status);
    setDriftSeverity(doc.driftSeverity || 'High');
    setDriftType(doc.driftType || 'Signature');
    setOldContent(doc.oldContent || '');
    setNewContent(doc.content);
    setActiveTab('MANUAL');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Header Modal */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-900 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Tải tài liệu & Mã nguồn từ máy tính (Upload External Files)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hỗ trợ chọn file trực tiếp từ máy tính để kiểm thử luồng phát hiện sai lệch và đồng bộ toàn hệ thống.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingDocument(null);
              setIsTestModalOpen(false);
            }}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thông báo Toast bên trong Modal */}
        {toastMsg && (
          <div className={`px-4 py-2 text-xs font-medium flex items-center space-x-2 border-b ${
            toastMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Tab chuyển đổi */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 text-xs">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('UPLOAD')}
              className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition ${
                activeTab === 'UPLOAD' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file từ máy tính</span>
            </button>
            <button
              onClick={() => setActiveTab('MANUAL')}
              className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition ${
                activeTab === 'MANUAL' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tự nhập / Sửa thủ công</span>
            </button>
            <button
              onClick={() => setActiveTab('LIST')}
              className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 transition ${
                activeTab === 'LIST' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Danh sách tài liệu ({documents.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Khôi phục toàn bộ tài liệu về trạng thái mẫu ban đầu?')) {
                resetToDefaultData();
                showToast('Đã khôi phục dữ liệu gốc thành công!');
              }
            }}
            className="text-slate-500 hover:text-slate-800 text-[11px] flex items-center space-x-1 hover:underline"
            title="Khôi phục dữ liệu ban đầu"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Khôi phục dữ liệu gốc</span>
          </button>
        </div>

        {/* Nội dung Modal cuộn được */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: Tải file từ máy tính (Cách 1) */}
          {activeTab === 'UPLOAD' && (
            <div className="space-y-4">
              {/* Hai ô tải tệp song song */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ô 1: Chọn File tài liệu hiện tại */}
                <div 
                  onClick={() => docFileInputRef.current?.click()}
                  className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition text-center flex flex-col items-center justify-center space-y-2 ${
                    uploadedDocName ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept=".md,.markdown,.txt,.rst,.adoc"
                    onChange={handleDocFileUpload}
                    className="hidden"
                  />
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {uploadedDocName ? uploadedDocName : 'Chọn File tài liệu hiện tại'}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {uploadedDocSize ? `Kích thước: ${uploadedDocSize}` : 'Hỗ trợ .md, .txt, .rst, .adoc'}
                    </span>
                  </div>
                  {uploadedDocName && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      Đã đọc nội dung thành công
                    </span>
                  )}
                </div>

                {/* Ô 2: Chọn File mã nguồn thay đổi */}
                <div 
                  onClick={() => codeFileInputRef.current?.click()}
                  className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition text-center flex flex-col items-center justify-center space-y-2 ${
                    uploadedCodeName ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={codeFileInputRef}
                    type="file"
                    accept=".java,.py,.ts,.js,.tsx,.jsx,.cpp,.c,.cs,.sql,.go,.rs,.php"
                    onChange={handleCodeFileUpload}
                    className="hidden"
                  />
                  <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {uploadedCodeName ? uploadedCodeName : 'Chọn File mã nguồn thay đổi'}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {uploadedCodeSize ? `Kích thước: ${uploadedCodeSize}` : 'Hỗ trợ .java, .py, .ts, .js, .cpp...'}
                    </span>
                  </div>
                  {uploadedCodeName && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-medium">
                      Đã trích xuất {detectedMethods.length} thực thể AST
                    </span>
                  )}
                </div>
              </div>

              {/* Nút Tự động sinh bản cập nhật từ Code */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Tự động sinh bản cập nhật tài liệu từ mã nguồn:
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Hệ thống tự động quét hàm/class có trong file code để chèn mô tả vào tài liệu mới, tạo Diff sát thực tế.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateDoc}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs flex items-center space-x-1.5 transition shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tự động sinh bản cập nhật từ Code</span>
                </button>
              </div>

              {/* Thông tin cấu hình tài liệu */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">Tên tài liệu:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: UserService_API_Guide.md"
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Chuyên mục:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Backend Service">Backend Service</option>
                    <option value="Architecture">Architecture</option>
                    <option value="AI Engine">AI Engine</option>
                    <option value="GitHub Integration">GitHub Integration</option>
                    <option value="Database & Security">Database & Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Trạng thái khởi tạo:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="DRAFT">DRAFT (Bản nháp - Chờ Developer gửi)</option>
                    <option value="IN_REVIEW">IN_REVIEW (Hàng đợi Staff duyệt)</option>
                    <option value="APPROVED">APPROVED (Chờ Manager xuất bản)</option>
                  </select>
                </div>
              </div>

              {/* So sánh 2 bản xem trước (Diff Preview) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Bản tài liệu cũ (Trước khi sửa):
                  </label>
                  <textarea
                    rows={8}
                    value={oldContent}
                    onChange={(e) => setOldContent(e.target.value)}
                    placeholder="Nội dung file tài liệu hiện tại đọc từ máy tính..."
                    className="w-full p-2.5 border border-slate-300 rounded font-mono text-xs bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Bản tài liệu mới (Sau khi cập nhật từ Code):
                  </label>
                  <textarea
                    rows={8}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Bản cập nhật đề xuất (hoặc bấm 'Tự động sinh bản cập nhật từ Code')..."
                    className="w-full p-2.5 border border-slate-300 rounded font-mono text-xs bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Tự nhập / Sửa thủ công (Cách 2) */}
          {activeTab === 'MANUAL' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Tên tài liệu:</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: OrderController.md"
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Đường dẫn file code nguồn:</label>
                  <input
                    type="text"
                    value={sourceFile}
                    onChange={(e) => setSourceFile(e.target.value)}
                    placeholder="backend/src/main/java/.../OrderController.java"
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Chữ ký hàm / AST Entity:</label>
                  <input
                    type="text"
                    value={codeEntity}
                    onChange={(e) => setCodeEntity(e.target.value)}
                    placeholder="public OrderResponse createOrder(...)"
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mã Commit / Hash:</label>
                  <input
                    type="text"
                    value={commitHash}
                    onChange={(e) => setCommitHash(e.target.value)}
                    placeholder="e4a19c0"
                    className="w-full p-2 border border-slate-300 rounded text-xs font-mono bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mã Pull Request:</label>
                  <input
                    type="text"
                    value={pullRequest}
                    onChange={(e) => setPullRequest(e.target.value)}
                    placeholder="#18: Thêm API thanh toán"
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mức độ lệch (Severity):</label>
                  <select
                    value={driftSeverity}
                    onChange={(e) => setDriftSeverity(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Loại sai lệch (Drift Type):</label>
                  <select
                    value={driftType}
                    onChange={(e) => setDriftType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Signature">Signature (Thay đổi tham số / hàm)</option>
                    <option value="Semantic">Semantic (Thay đổi logic / luồng)</option>
                    <option value="Referential">Referential (Thay đổi tham chiếu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Trạng thái:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Đoạn code diff trích xuất (diffSnippet):</label>
                <textarea
                  rows={2}
                  value={diffSnippet}
                  onChange={(e) => setDiffSnippet(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-mono text-xs bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bản tài liệu cũ (oldContent):</label>
                  <textarea
                    rows={6}
                    value={oldContent}
                    onChange={(e) => setOldContent(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Bản tài liệu mới (newContent):</label>
                  <textarea
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded font-mono text-xs bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Danh sách toàn bộ tài liệu trong hệ thống */}
          {activeTab === 'LIST' && (
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Tên tài liệu</th>
                      <th className="p-2.5">Trạng thái</th>
                      <th className="p-2.5">Phiên bản</th>
                      <th className="p-2.5">File code</th>
                      <th className="p-2.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-slate-500">#{doc.id}</td>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-800">{doc.title.split(' - ')[0]}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{doc.category}</div>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            doc.status === 'PUBLISHED' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : doc.status === 'APPROVED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : doc.status === 'IN_REVIEW'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">v{doc.version}</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-600 truncate max-w-[140px]">
                          {doc.groundingEvidence?.sourceFile.split('/').pop()}
                        </td>
                        <td className="p-2.5 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEdit(doc)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Edit2 className="w-3 h-3 mr-0.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa tài liệu "${doc.title.split(' - ')[0]}" khỏi hệ thống?`)) {
                                deleteDocument(doc.id);
                                showToast(`Đã xóa tài liệu #${doc.id}`);
                              }
                            }}
                            className="inline-flex items-center text-rose-600 hover:text-rose-800 font-medium"
                          >
                            <Trash2 className="w-3 h-3 mr-0.5" />
                            <span>Xóa</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Chân trang Modal */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {activeTab === 'LIST' 
              ? `Tổng số: ${documents.length} tài liệu đang lưu trong hệ thống (Đồng bộ Context & localStorage)`
              : 'Dữ liệu được lưu ngay vào Global Store để kiểm thử trên cả 5 trang.'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setEditingDocument(null);
                setIsTestModalOpen(false);
              }}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 rounded text-slate-700 font-medium transition"
            >
              Đóng
            </button>

            {activeTab !== 'LIST' && (
              <button
                type="button"
                onClick={handleSaveDocument}
                className="btn-press px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Lưu & Đưa vào hệ thống</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Alias xuất khẩu để tương thích hoàn toàn
export const DocumentUploadModal = TestDataModal;
