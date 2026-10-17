import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface DocumentItem {
  id: number;
  title: string;
  category: string;
  repository: string;
  content: string;
  oldContent?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  version: string;
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
  lastModifiedBy?: string;
  updatedAt: string;
}

export interface ChangeLogItem {
  id: number;
  documentId: number;
  role: 'AI' | 'Staff' | 'Manager' | 'AI/Developer' | 'Reviewer';
  fromStatus: string;
  toStatus: string;
  timestamp: string;
  note: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  structure: string[];
  sampleContent: string;
}

// Initial fallback mock data matching backend/server.js and LivingDocs specs
const initialMockDocuments: DocumentItem[] = [
  {
    id: 1,
    title: 'README.md - Hướng dẫn Kiến trúc LivingDocs',
    category: 'Architecture',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '1.0',
    status: 'IN_REVIEW',
    driftType: 'Signature',
    driftSeverity: 'High',
    confidenceScore: 0.94,
    content: `# LivingDocs - Hệ Thống Tự Động Hóa Tài Liệu (Microservices)

## 1. Tổng Quan Kiến Trúc
LivingDocs là nền tảng tự cập nhật tài liệu dựa trên phân tích AST và AI (RAG + LLM).
Khi mã nguồn thay đổi qua Pull Request, hệ thống tự động phát hiện sai lệch (Drift Detection) và sinh tài liệu cập nhật.

## 2. API Endpoints
- POST /api/v1/auth/login: Xác thực người dùng qua JWT/OAuth2
- GET /api/v1/repositories: Lấy danh sách repository đã kết nối
- POST /api/workflow/:id/submit: Gửi tài liệu vào luồng xét duyệt
- PUT /api/workflow/:id/staff-approve: Staff kiểm tra và duyệt bước 1
- PUT /api/workflow/:id/manager-publish: Manager phê duyệt chính thức và nâng phiên bản

## 3. Cổng Dịch Vụ
- Backend Spring Boot: 8080
- AI Engine FastAPI: 8000
- Kafka Broker: 9092
- PostgreSQL DB: 5432
- Redis Cache: 6379`,
    oldContent: `# LivingDocs - Hệ Thống Tự Động Hóa Tài Liệu

## 1. Tổng Quan
LivingDocs là hệ thống lưu trữ tài liệu đơn giản.

## 2. API Endpoints
- GET /api/v1/auth/token: Lấy token người dùng cũ
- GET /api/v1/repos: Danh sách repository cũ

## 3. Cổng Dịch Vụ
- Backend: 8080
- DB: 5432`,
    groundingEvidence: {
      sourceFile: 'backend/src/main/java/com/livingdocs/controller/WorkflowController.java',
      codeEntity: 'public ResponseEntity<WorkflowResult> approveWorkflow(@PathVariable Long id)',
      commitHash: 'f5db245c10',
      pullRequest: '#4 KAN-17: Hoàn thành API luồng xét duyệt',
      diffSnippet: `@@ -45,6 +45,18 @@
- @GetMapping("/api/v1/repos")
+ @GetMapping("/api/v1/repositories")
+ @PutMapping("/api/workflow/{id}/staff-approve")
+ @PutMapping("/api/workflow/{id}/manager-publish")
+ public ResponseEntity<WorkflowResult> approveWorkflow(...)`
    },
    lastModifiedBy: 'AI Engine (Auto-Drift)',
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    title: 'PaymentGateway_VietQR.md - Đặc tả tích hợp VietQR',
    category: 'Payment',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '1.2',
    status: 'APPROVED',
    driftType: 'Semantic',
    driftSeverity: 'Critical',
    confidenceScore: 0.98,
    content: `# Tài Liệu Tích Hợp VietQR Gateway

## 1. Quy Trình Thanh Toán Tự Động
- Khởi tạo mã QR động theo chuẩn Napas 247.
- Tự động gán Transaction ID vào nội dung chuyển khoản.
- Lắng nghe Webhook phản hồi từ VietQR API để kích hoạt gói dịch vụ.

## 2. Mã Trạng Thái Giao Dịch
- PENDING: Đang chờ chuyển khoản
- SUCCESS: Thanh toán thành công qua ngân hàng
- EXPIRED: Mã QR hết hạn sau 15 phút`,
    oldContent: `# Tài Liệu Tích Hợp VietQR Gateway

## 1. Quy Trình
- Quét mã QR tĩnh thủ công.
- Nhân viên kiểm tra sao kê bằng tay.`,
    groundingEvidence: {
      sourceFile: 'backend/src/main/java/com/livingdocs/payment/VietQRService.java',
      codeEntity: 'public QRPaymentResponse generateDynamicVietQR(PaymentRequest req)',
      commitHash: '9a31bc40e',
      pullRequest: '#6 KAN-21: Tích hợp Napas VietQR động',
      diffSnippet: `@@ -12,4 +12,12 @@
- public String getStaticQR() { return STATIC_QR; }
+ public QRPaymentResponse generateDynamicVietQR(PaymentRequest req) {
+     return napasClient.createDynamicQR(req.getAmount(), req.getTxnCode());
+ }`
    },
    lastModifiedBy: 'Staff Reviewer',
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    title: 'FastAPI_AST_Parser.md - Hướng dẫn phân tích cú pháp AST',
    category: 'AI Engine',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '2.0',
    status: 'PUBLISHED',
    driftType: 'Referential',
    driftSeverity: 'Low',
    confidenceScore: 0.91,
    content: `# Hướng Dẫn Module AST Parser (Python FastAPI)

Module phụ trách phân tích cây cú pháp trừu tượng (Abstract Syntax Tree) của source code:
- Trích xuất Classes, Methods, Parameters, Annotations.
- Phát hiện thay đổi signature khi có Git commit mới.
- Sinh Embedding vector đưa vào RAG Pipeline với ChromaDB / Qdrant.`,
    oldContent: `# Hướng Dẫn AST Parser

Phân tích regex đơn giản để tìm tên class.`,
    groundingEvidence: {
      sourceFile: 'ai-engine/app/parser/ast_analyzer.py',
      codeEntity: 'def extract_syntax_tree(code_bytes: bytes) -> ASTNodeStructure',
      commitHash: '74456b5',
      pullRequest: '#2 KAN-9: Init AST Parser',
      diffSnippet: `@@ -1,5 +1,12 @@
- import re
+ import ast, tree_sitter
+ def extract_syntax_tree(code_bytes: bytes) -> ASTNodeStructure:`
    },
    lastModifiedBy: 'Manager',
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 4,
    title: 'ZaloOA_Webhook_Notification.md - Hướng dẫn cấu hình thông báo Zalo',
    category: 'Integration',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '0.9',
    status: 'DRAFT',
    driftType: 'Semantic',
    driftSeverity: 'Medium',
    confidenceScore: 0.88,
    content: `# Cấu hình Zalo Official Account (Zalo OA)

Khi tài liệu bị phát hiện Documentation Drift cấp độ High hoặc Critical:
- Hệ thống gửi tin nhắn thông báo tự động đến nhóm Kỹ thuật qua Zalo OA Webhook API.
- Đính kèm đường link kiểm duyệt nhanh (Workflow Review URL).`,
    groundingEvidence: {
      sourceFile: 'backend/src/main/java/com/livingdocs/notification/ZaloOAService.java',
      codeEntity: 'public void sendDriftAlertToZalo(String recipientId, DriftAlert alert)',
      commitHash: 'e319fa0',
      pullRequest: '#5 KAN-19: Zalo OA Integration',
      diffSnippet: `@@ -0,0 +1,15 @@
+ @PostMapping("/api/v1/webhook/zalo")
+ public ResponseEntity<?> handleZaloWebhook(@RequestBody ZaloPayload payload)`
    },
    lastModifiedBy: 'AI Engine',
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];

let mockDocuments = [...initialMockDocuments];

let mockChangeLogs: ChangeLogItem[] = [
  {
    id: 1,
    documentId: 1,
    role: 'AI',
    fromStatus: 'DRAFT',
    toStatus: 'IN_REVIEW',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    note: 'AI Engine tự động phân tích commit f5db245 và đề xuất cập nhật danh sách endpoint'
  },
  {
    id: 2,
    documentId: 2,
    role: 'Staff',
    fromStatus: 'IN_REVIEW',
    toStatus: 'APPROVED',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    note: 'Staff xác nhận code VietQR trùng khớp với tài liệu Napas247, chuyển tiếp cho Manager duyệt xuất bản'
  },
  {
    id: 3,
    documentId: 3,
    role: 'Manager',
    fromStatus: 'APPROVED',
    toStatus: 'PUBLISHED',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    note: 'Manager phê duyệt chính thức xuất bản phiên bản v2.0 cho AST Parser'
  }
];

export const workflowApi = {
  // Lấy toàn bộ danh sách tài liệu
  async getDocuments(): Promise<DocumentItem[]> {
    return mockDocuments;
  },

  // Lấy chi tiết 1 tài liệu
  async getDocument(id: number): Promise<DocumentItem | undefined> {
    return mockDocuments.find(d => d.id === id);
  },

  // 1. Submit tài liệu (DRAFT -> IN_REVIEW)
  async submitForReview(id: number, role: string = 'Developer'): Promise<{ message: string; data: DocumentItem }> {
    try {
      const res = await axios.put(`${API_BASE_URL}/workflow/${id}/submit`);
      return res.data;
    } catch {
      // Fallback local update
      const doc = mockDocuments.find(d => d.id === id);
      if (!doc) throw new Error('Không tìm thấy tài liệu');
      const oldStatus = doc.status;
      doc.status = 'IN_REVIEW';
      doc.updatedAt = new Date().toISOString();

      mockChangeLogs.push({
        id: mockChangeLogs.length + 1,
        documentId: id,
        role: (role as any) || 'AI/Developer',
        fromStatus: oldStatus,
        toStatus: 'IN_REVIEW',
        timestamp: new Date().toISOString(),
        note: `Tài liệu đã được gửi vào hàng đợi duyệt bởi ${role}`
      });

      return { message: 'Đã gửi lên Staff kiểm duyệt thành công (Mock Mode)', data: { ...doc } };
    }
  },

  // 2. Staff kiểm tra và duyệt bước 1 (IN_REVIEW -> APPROVED)
  async staffApprove(id: number, note?: string): Promise<{ message: string; data: DocumentItem }> {
    try {
      const res = await axios.put(`${API_BASE_URL}/workflow/${id}/staff-approve`);
      return res.data;
    } catch {
      const doc = mockDocuments.find(d => d.id === id);
      if (!doc) throw new Error('Không tìm thấy tài liệu');
      if (doc.status !== 'IN_REVIEW') {
        throw new Error('Sai luồng quy trình! Tài liệu phải ở trạng thái IN_REVIEW');
      }

      const oldStatus = doc.status;
      doc.status = 'APPROVED';
      doc.lastModifiedBy = 'Staff Reviewer';
      doc.updatedAt = new Date().toISOString();

      mockChangeLogs.push({
        id: mockChangeLogs.length + 1,
        documentId: id,
        role: 'Staff',
        fromStatus: oldStatus,
        toStatus: 'APPROVED',
        timestamp: new Date().toISOString(),
        note: note || 'Staff kiểm tra nội dung hợp lệ và chuyển tiếp lên Manager'
      });

      return { message: 'Staff đã duyệt! Đang chờ Manager phê duyệt cuối (Mock Mode)', data: { ...doc } };
    }
  },

  // 3. Manager phê duyệt cuối để xuất bản (APPROVED -> PUBLISHED)
  async managerPublish(id: number, note?: string): Promise<{ message: string; data: DocumentItem }> {
    try {
      const res = await axios.put(`${API_BASE_URL}/workflow/${id}/manager-publish`);
      return res.data;
    } catch {
      const doc = mockDocuments.find(d => d.id === id);
      if (!doc) throw new Error('Không tìm thấy tài liệu');
      if (doc.status !== 'APPROVED') {
        throw new Error('Chưa thể xuất bản! Tài liệu bắt buộc phải được Staff duyệt trước');
      }

      const oldStatus = doc.status;
      doc.status = 'PUBLISHED';
      const curVer = parseFloat(doc.version) || 1.0;
      doc.version = (curVer + 1.0).toFixed(1);
      doc.lastModifiedBy = 'Manager Approver';
      doc.updatedAt = new Date().toISOString();

      mockChangeLogs.push({
        id: mockChangeLogs.length + 1,
        documentId: id,
        role: 'Manager',
        fromStatus: oldStatus,
        toStatus: 'PUBLISHED',
        timestamp: new Date().toISOString(),
        note: note || `Manager chấp thuận xuất bản chính thức bản nâng cấp v${doc.version}`
      });

      return { message: `Tuyệt vời! Tài liệu đã được xuất bản công khai v${doc.version} (Mock Mode)`, data: { ...doc } };
    }
  },

  // 4. Từ chối tài liệu (Trả về REJECTED)
  async reject(id: number, role: string, reason: string): Promise<{ message: string; data: DocumentItem }> {
    try {
      const res = await axios.put(`${API_BASE_URL}/workflow/${id}/reject`, { role, reason });
      return res.data;
    } catch {
      const doc = mockDocuments.find(d => d.id === id);
      if (!doc) throw new Error('Không tìm thấy tài liệu');

      const oldStatus = doc.status;
      doc.status = 'REJECTED';
      doc.lastModifiedBy = role;
      doc.updatedAt = new Date().toISOString();

      mockChangeLogs.push({
        id: mockChangeLogs.length + 1,
        documentId: id,
        role: (role as any) || 'Reviewer',
        fromStatus: oldStatus,
        toStatus: 'REJECTED',
        timestamp: new Date().toISOString(),
        note: reason || 'Tài liệu sai logic code, yêu cầu chỉnh sửa lại'
      });

      return { message: 'Tài liệu đã bị từ chối và trả ngược về tác giả để sửa (Mock Mode)', data: { ...doc } };
    }
  },

  // 5. Lấy lịch sử thay đổi (Audit Change Log)
  async getLogs(id: number): Promise<{ documentId: number; totalChanges: number; history: ChangeLogItem[] }> {
    try {
      const res = await axios.get(`${API_BASE_URL}/workflow/${id}/logs`);
      return res.data;
    } catch {
      const history = mockChangeLogs.filter(l => l.documentId === id);
      return { documentId: id, totalChanges: history.length, history };
    }
  },

  // Lấy toàn bộ audit logs hệ thống
  async getAllLogs(): Promise<ChangeLogItem[]> {
    return [...mockChangeLogs].reverse();
  }
};

export const templatesData: TemplateItem[] = [
  {
    id: 'api-reference',
    name: 'Tài liệu API Reference (OpenAPI/REST)',
    category: 'API Specification',
    description: 'Dành cho các Controller & Endpoint RESTful trong Spring Boot / FastAPI.',
    version: '1.4',
    structure: [
      '1. Endpoint URL & HTTP Method',
      '2. Yêu cầu Quyền hạn & Authentication (RBAC / JWT)',
      '3. Request Headers & Path Parameters',
      '4. Request Body Schema (JSON Example)',
      '5. Response Body & HTTP Status Codes (200, 400, 401, 500)',
      '6. Error Handling & Dead Letter Queue (DLQ) Fallback'
    ],
    sampleContent: `# API: {{ENDPOINT_NAME}}
**Phương thức**: \`{{HTTP_METHOD}}\`
**Đường dẫn**: \`{{URL_PATH}}\`
**Quyền truy cập**: \`{{ROLES_REQUIRED}}\`

### Request Parameters
| Tham số | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| id | Long | Có | ID tài liệu |

### Response Example (200 OK)
\`\`\`json
{
  "code": 200,
  "message": "Success",
  "data": {}
}
\`\`\``
  },
  {
    id: 'adr-architecture',
    name: 'Architecture Decision Record (ADR)',
    category: 'Architecture',
    description: 'Ghi lại các quyết định kiến trúc quan trọng (Kafka, Microservices, Multi-tenant schema).',
    version: '2.1',
    structure: [
      '1. Bối cảnh & Vấn đề kỹ thuật (Context & Problem)',
      '2. Các giải pháp cân nhắc (Considered Options)',
      '3. Quyết định đã chọn & Lý do (Decision & Rationale)',
      '4. Hệ quả & Rủi ro chấp nhận (Consequences & Trade-offs)',
      '5. Trạng thái (Proposed, Accepted, Deprecated)'
    ],
    sampleContent: `# ADR-004: Sử dụng Kafka và DLQ cho luồng bất đồng bộ
**Trạng thái**: Đã chấp thuận (Accepted)
**Người quyết định**: Tech Lead & Team Leader
**Bối cảnh**: Hệ thống cần phân tích Drift tài liệu cho hàng nghìn commit mà không chặn luồng commit/PR của developer.`
  },
  {
    id: 'module-guide',
    name: 'Hướng dẫn Module & AST Parsing Guide',
    category: 'Module Guide',
    description: 'Dành cho việc giải thích cấu trúc code, sơ đồ class, dependency và logic xử lý.',
    version: '1.1',
    structure: [
      '1. Mục đích của Module',
      '2. Các Class chính & Luồng dữ liệu (Data Flow)',
      '3. Phụ thuộc bên ngoài (Redis, DB, Message Broker)',
      '4. Hướng dẫn cài đặt & Chạy Test',
      '5. FAQ & Troubleshooting'
    ],
    sampleContent: `# Module: {{MODULE_NAME}}
Mô tả nhiệm vụ cốt lõi và các interface liên kết...`
  }
];
