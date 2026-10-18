'use client';

import React, { useState } from 'react';
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
  Filter,
  Check
} from 'lucide-react';
import { templatesData } from '@/services/api';

// Dữ liệu mô phỏng các thực thể mã nguồn (AST Code Entities) được trích xuất từ source code của dự án
interface CodeMethod {
  name: string;
  signature: string;
  status: 'DOCUMENTED' | 'NEEDS_UPDATE' | 'MISSING_DOC';
  docTitle: string;
  description: string;
}

interface CodeEntity {
  id: string;
  entityName: string;
  category: string;
  packagePath: string;
  filePath: string;
  docCoverage: string;
  statusBadge: string;
  methods: CodeMethod[];
  docContent: string;
}

const initialEntities: CodeEntity[] = [
  {
    id: 'ent-1',
    entityName: 'WorkflowController.java',
    category: 'Backend Controller',
    packagePath: 'com.livingdocs.controller.WorkflowController',
    filePath: 'backend/src/main/java/com/livingdocs/controller/WorkflowController.java',
    docCoverage: '80%',
    statusBadge: 'Da dong bo',
    methods: [
      {
        name: 'submitForReview(Long id)',
        signature: 'public ResponseEntity<WorkflowDoc> submitForReview(@PathVariable Long id)',
        status: 'DOCUMENTED',
        docTitle: 'README.md - Huong dan Kien truc LivingDocs',
        description: 'Chuyen trang thai tai lieu tu DRAFT sang IN_REVIEW de cho Staff kiem duyet.'
      },
      {
        name: 'staffApprove(Long id)',
        signature: 'public ResponseEntity<WorkflowDoc> staffApprove(@PathVariable Long id)',
        status: 'DOCUMENTED',
        docTitle: 'README.md - Huong dan Kien truc LivingDocs',
        description: 'Staff kiem tra noi dung hop le, phe duyet buoc 1 va chuyen len Manager.'
      },
      {
        name: 'managerPublish(Long id)',
        signature: 'public ResponseEntity<WorkflowDoc> managerPublish(@PathVariable Long id)',
        status: 'DOCUMENTED',
        docTitle: 'README.md - Huong dan Kien truc LivingDocs',
        description: 'Manager phe duyet cuoi cung, he thong nang phien ban va xuat ban cong khai.'
      },
      {
        name: 'rejectDocument(Long id, RejectReq req)',
        signature: 'public ResponseEntity<WorkflowDoc> rejectDocument(@PathVariable Long id, @RequestBody RejectReq req)',
        status: 'DOCUMENTED',
        docTitle: 'README.md - Huong dan Kien truc LivingDocs',
        description: 'Tu choi tai lieu khi co sai sot ve logic hoac thieu bang tham so.'
      },
      {
        name: 'getAuditLogs(Long id)',
        signature: 'public ResponseEntity<AuditResponse> getAuditLogs(@PathVariable Long id)',
        status: 'NEEDS_UPDATE',
        docTitle: 'README.md - Huong dan Kien truc LivingDocs',
        description: 'Lay danh sach nhat ky thay doi cua tai lieu qua cac buoc duyet.'
      }
    ],
    docContent: `# Tai Lieu Huong Dan: WorkflowController

## 1. Muc Dinh
Controller chiu trach nhiem dieu phoi toan bo luong xet duyet tai lieu 2 cap (Human-in-the-loop).

## 2. Danh Sach API Endpoints
- PUT /api/workflow/{id}/submit: Gui tai lieu di duyet
- PUT /api/workflow/{id}/staff-approve: Staff duyet buoc 1
- PUT /api/workflow/{id}/manager-publish: Manager xuat ban chinh thuc
- PUT /api/workflow/{id}/reject: Tu choi tai lieu kem ly do
- GET /api/workflow/{id}/logs: Xem lich su audit log

## 3. Rang Buoc Quy Trinh
Tai lieu bat buoc phai qua Staff kiem tra truoc khi den Manager.`
  },
  {
    id: 'ent-2',
    entityName: 'GitHubWebhookController.java',
    category: 'GitHub Integration',
    packagePath: 'com.livingdocs.controller.GitHubWebhookController',
    filePath: 'backend/src/main/java/com/livingdocs/controller/GitHubWebhookController.java',
    docCoverage: '66%',
    statusBadge: 'Co canh bao Drift',
    methods: [
      {
        name: 'handleGitHubWebhook(GitHubPayload payload)',
        signature: 'public ResponseEntity<String> handleGitHubWebhook(@RequestBody GitHubPayload payload)',
        status: 'DOCUMENTED',
        docTitle: 'GitHub_Webhook_Guide.md',
        description: 'Lang nghe su kien Push va Pull Request tu GitHub Webhook de tu dong phat hien Drift.'
      },
      {
        name: 'verifyWebhookSignature(String signature, String payload)',
        signature: 'public boolean verifyWebhookSignature(String signature, String payload)',
        status: 'DOCUMENTED',
        docTitle: 'GitHub_Webhook_Guide.md',
        description: 'Kiem tra chu ky bao mat HMAC-SHA256 tu Webhook secret cua GitHub.'
      },
      {
        name: 'processBranchDrift(String branch)',
        signature: 'public DriftReport processBranchDrift(@PathVariable String branch)',
        status: 'MISSING_DOC',
        docTitle: 'Chua co tai lieu',
        description: 'Kich hoat quet toan bo cay AST cua nhanh khi co merge request.'
      }
    ],
    docContent: `# Tai Lieu Huong Dan: GitHub Webhook Controller

## 1. Tong Quan Tich Hop GitHub
Tich hop lang nghe su kien tu dong qua GitHub Webhook.

## 2. Quy Trinh Xu Ly
- Lap trinh vien tao Pull Request hoac Push commit len GitHub.
- GitHub gui payload chua danh sach commit va diff file ve backend.
- LivingDocs phan tich AST va kich hoat kiem tra Documentation Drift.`
  },
  {
    id: 'ent-3',
    entityName: 'ast_analyzer.py',
    category: 'AI Engine Parser',
    packagePath: 'ai-engine/app/parser/ast_analyzer.py',
    filePath: 'ai-engine/app/parser/ast_analyzer.py',
    docCoverage: '100%',
    statusBadge: 'Day du tai lieu',
    methods: [
      {
        name: 'extract_syntax_tree(code_bytes)',
        signature: 'def extract_syntax_tree(code_bytes: bytes) -> ASTNodeStructure',
        status: 'DOCUMENTED',
        docTitle: 'FastAPI_AST_Parser.md',
        description: 'Phan tich cay cu phap truu tuong cua ma nguon Java va Python.'
      },
      {
        name: 'detect_signature_drift(old_ast, new_ast)',
        signature: 'def detect_signature_drift(old_ast: AST, new_ast: AST) -> DriftReport',
        status: 'DOCUMENTED',
        docTitle: 'FastAPI_AST_Parser.md',
        description: 'So sanh hai cay AST de phat hien thay doi ve tham so hoac ten ham.'
      },
      {
        name: 'compute_confidence_score(evidence)',
        signature: 'def compute_confidence_score(evidence: GroundingEvidence) -> float',
        status: 'DOCUMENTED',
        docTitle: 'FastAPI_AST_Parser.md',
        description: 'Tinh toan diem tin cay cua AI dua tren muc do khop voi code diff.'
      }
    ],
    docContent: `# Huong Dan: Module AST Parser

Dich vu FastAPI chiu trach nhiem doc ma nguon va trich xuat cay cu phap:
- Khong phu thuoc vao regex truyen thong de tranh loi sai (False Positives).
- Cung cap dau vao cho RAG Pipeline va LLM xac dinh sai lech tai lieu.`
  },
  {
    id: 'ent-4',
    entityName: 'AuthService.java',
    category: 'Authentication',
    packagePath: 'com.livingdocs.service.AuthService',
    filePath: 'backend/src/main/java/com/livingdocs/service/AuthService.java',
    docCoverage: '50%',
    statusBadge: 'Can bo sung',
    methods: [
      {
        name: 'authenticateWithGitHub(String code)',
        signature: 'public AuthResponse authenticateWithGitHub(String code)',
        status: 'DOCUMENTED',
        docTitle: 'Authentication_OAuth2.md',
        description: 'Xac thuc nguoi dung qua GitHub OAuth2 API va cap JWT Token.'
      },
      {
        name: 'refreshToken(String token)',
        signature: 'public TokenResponse refreshToken(String token)',
        status: 'MISSING_DOC',
        docTitle: 'Chua co tai lieu',
        description: 'Cap lai access token moi tu refresh token hop le.'
      }
    ],
    docContent: `# Huong Dan: Authentication & GitHub OAuth2

Xac thuc nguoi dung va he thong qua OAuth2, phan quyen truy cap cho Staff, Manager va Developer.`
  }
];

export default function KnowledgeBasePage() {
  const [entities, setEntities] = useState<CodeEntity[]>(initialEntities);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('ent-1');
  const [activeTab, setActiveTab] = useState<'ENTITIES' | 'TEMPLATES'>('ENTITIES');
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [generatingForMethod, setGeneratingForMethod] = useState<string | null>(null);

  // Tim kiem va loc thuc the
  const filteredEntities = entities.filter(ent => {
    if (selectedCategory !== 'ALL' && ent.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = ent.entityName.toLowerCase().includes(q);
      const matchPkg = ent.packagePath.toLowerCase().includes(q);
      const matchMethod = ent.methods.some(m => m.name.toLowerCase().includes(q) || m.signature.toLowerCase().includes(q));
      return matchName || matchPkg || matchMethod;
    }
    return true;
  });

  const selectedEntity = entities.find(e => e.id === selectedEntityId) || entities[0];

  // Ham sao chep duong dan ma nguon
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ham sinh tai lieu tu dong cho method chua co tai lieu (Coverage Gap)
  const handleGenerateDocForMethod = (methodName: string) => {
    setGeneratingForMethod(methodName);
    setTimeout(() => {
      setEntities(prev => prev.map(ent => {
        if (ent.id === selectedEntity.id) {
          const updatedMethods = ent.methods.map(m => {
            if (m.name === methodName) {
              return {
                ...m,
                status: 'DOCUMENTED' as const,
                docTitle: `${ent.entityName} - Huong dan chi tiet`
              };
            }
            return m;
          });
          return {
            ...ent,
            docCoverage: '100%',
            statusBadge: 'Da dong bo',
            methods: updatedMethods,
            docContent: ent.docContent + `\n\n### Bo Sung Phuong Thuc: ${methodName}\n- Dac ta duoc AI Engine trich xuat tu dong tu AST signature.\n- Trang thai: San sang dua vao Workflow kiem duyet.`
          };
        }
        return ent;
      }));
      setGeneratingForMethod(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Tieu de trang */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Kho Tri Thuc & Lien Ket Ma Nguon (Knowledge Base Viewer)</h1>
            <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded font-medium border border-slate-200">
              Kho dữ liệu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tra cuu tai lieu ky thuat, theo doi quan he lien ket giua tai lieu va cay cu phap AST (Classes, Methods, Endpoints) va quan ly thu vien Template.
          </p>
        </div>

        {/* Chuyen doi giua che do xem Code Entity va Templates */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('ENTITIES')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              activeTab === 'ENTITIES'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Lien ket Ma nguon AST
          </button>
          <button
            onClick={() => setActiveTab('TEMPLATES')}
            className={`px-3 py-1.5 rounded font-semibold transition ${
              activeTab === 'TEMPLATES'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            Thu vien Template tai lieu
          </button>
        </div>
      </div>

      {activeTab === 'ENTITIES' ? (
        <>
          {/* Thanh tim kiem va bo loc danh muc */}
          <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tim kiem class, method, endpoint hoac file nguon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded focus:ring-1 focus:ring-sky-500 outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-semibold">Phan loai:</span>
              <div className="flex space-x-1">
                {['ALL', 'Backend Controller', 'GitHub Integration', 'AI Engine Parser', 'Authentication'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? 'Tat ca' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bo cuc 2 cot: Danh sach File va Chi tiet lien ket */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cot trai: Danh sach Code Entity */}
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Danh sach Tap tin & Class ({filteredEntities.length})
              </div>

              {filteredEntities.map((ent) => {
                const isSelected = ent.id === selectedEntity.id;
                return (
                  <div
                    key={ent.id}
                    onClick={() => setSelectedEntityId(ent.id)}
                    className={`p-3.5 rounded border cursor-pointer transition text-xs ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/50 shadow-sm ring-1 ring-sky-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <FileCode className="w-4 h-4 text-sky-600" />
                        <span className="font-bold text-slate-900">{ent.entityName}</span>
                      </div>
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ent.docCoverage}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 truncate mb-2">
                      {ent.packagePath}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <span>{ent.methods.length} phuong thuc / API</span>
                      <span className="font-semibold text-slate-700">{ent.statusBadge}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cot phai: Chi tiet phuong thuc & Noi dung tai lieu */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded border border-slate-200 p-5 shadow-sm space-y-4">
                {/* Thong tin tep nguon */}
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                      {selectedEntity.category}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">{selectedEntity.entityName}</h2>
                    <code className="text-xs text-slate-500 font-mono block mt-1">
                      {selectedEntity.filePath}
                    </code>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{previewMode ? 'Xem danh sach Ham' : 'Xem noi dung Tai lieu'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(selectedEntity.filePath)}
                      className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold flex items-center space-x-1"
                      title="Sao chep duong dan file"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Da chep' : 'Sao chep'}</span>
                    </button>
                  </div>
                </div>

                {!previewMode ? (
                  /* Che do 1: Danh sach cac phuong thuc va tinh trang tai lieu */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                        <Code className="w-4 h-4 text-sky-600" />
                        <span>Danh sach Phuong thuc AST & Tinh trang Tai lieu</span>
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        Do bao phu: <strong className="text-slate-900">{selectedEntity.docCoverage}</strong>
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedEntity.methods.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-2"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <code className="font-mono font-bold text-slate-900 block text-xs">
                                {m.signature}
                              </code>
                              <p className="text-slate-600 text-[11px] mt-1">
                                {m.description}
                              </p>
                            </div>

                            <div className="shrink-0">
                              {m.status === 'DOCUMENTED' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                  Da co tai lieu
                                </span>
                              )}
                              {m.status === 'NEEDS_UPDATE' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Can cap nhat lai
                                </span>
                              )}
                              {m.status === 'MISSING_DOC' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                                  Chua co tai lieu (Coverage Gap)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                            <span className="text-slate-500 flex items-center space-x-1">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                              <span>Tai lieu tham chieu: </span>
                              <strong className="text-slate-800">{m.docTitle}</strong>
                            </span>

                            {m.status === 'MISSING_DOC' && (
                              <button
                                onClick={() => handleGenerateDocForMethod(m.name)}
                                disabled={generatingForMethod === m.name}
                                className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[10px] transition"
                              >
                                {generatingForMethod === m.name ? 'Dang sinh bang AI...' : 'AI sinh tai lieu'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Che do 2: Xem noi dung tai lieu ky thuat da ket xuat */
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-sky-600" />
                      <span>Noi dung Tai lieu Ky thuat (Markdown Preview)</span>
                    </h4>
                    <div className="p-4 bg-slate-50 rounded border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 max-h-96 overflow-y-auto">
                      {selectedEntity.docContent}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Tab 2: Danh sach va Mau Template tai lieu */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded border border-slate-200 text-xs text-slate-600">
            Các biểu mẫu tài liệu chuẩn hóa trong hệ thống LivingDocs, giúp định dạng tài liệu thống nhất và dễ tra cứu.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {templatesData.map((tpl) => (
              <div
                key={tpl.id}
                className="bg-white rounded border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {tpl.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">v{tpl.version}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{tpl.name}</h3>
                  <p className="text-xs text-slate-600 mb-3">{tpl.description}</p>

                  <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4">
                    <span className="font-semibold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                      Cac muc bat buoc trong mau:
                    </span>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {tpl.structure.map((item, i) => (
                        <li key={i} className="truncate">- {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono block mb-2">
                    Ap dung cho toan bo repository
                  </span>
                  <button
                    onClick={() => alert(`Da chon ap dung mau: ${tpl.name}`)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold transition"
                  >
                    Su dung bieu mau nay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
