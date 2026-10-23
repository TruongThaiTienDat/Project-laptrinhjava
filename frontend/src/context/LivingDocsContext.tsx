'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DocumentItem, 
  ChangeLogItem, 
  CoverageGapItem, 
  ImpactAnalysisItem, 
  GovernancePolicy, 
  VersionMilestoneItem,
  initialCoverageGaps,
  initialImpactItems,
  initialGovernancePolicy,
  initialVersionMilestones
} from '@/services/api';

// Định nghĩa các vai trò người dùng theo đúng đề cương LivingDocs (RBAC)
export type UserRole = 'Developer' | 'Staff' | 'Manager' | 'Technical Lead' | 'Administrator';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarLetter: string;
  roleDescription: string;
}

// Danh sách tài khoản mẫu phục vụ kiểm thử phân quyền RBAC
export const sampleAccounts: AuthUser[] = [
  {
    id: 'user-dev',
    name: 'Phạm Minh Toàn',
    email: 'toan.pham@livingdocs.vn',
    role: 'Developer',
    avatarLetter: 'T',
    roleDescription: 'Developer'
  },
  {
    id: 'user-staff',
    name: 'Nguyễn Thành Đồng',
    email: 'dong.nguyen@livingdocs.vn',
    role: 'Staff',
    avatarLetter: 'Đ',
    roleDescription: 'Staff Reviewer'
  },
  {
    id: 'user-manager',
    name: 'Phạm Thị Thúy Kiều',
    email: 'kieu.pham@livingdocs.vn',
    role: 'Manager',
    avatarLetter: 'K',
    roleDescription: 'Manager Approver'
  },
  {
    id: 'user-lead',
    name: 'Lê Thị Thanh Tuyền',
    email: 'tuyen.le@livingdocs.vn',
    role: 'Technical Lead',
    avatarLetter: 'T',
    roleDescription: 'Technical Lead'
  },
  {
    id: 'user-admin',
    name: 'Trương Thái Tiến Đạt',
    email: 'admin@livingdocs.vn',
    role: 'Administrator',
    avatarLetter: 'Đ',
    roleDescription: 'Administrator'
  }
];

// Dữ liệu tài liệu mặc định chuẩn đồ án LivingDocs
export const defaultMockDocuments: DocumentItem[] = [
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
    title: 'GitHub_Webhook_Guide.md - Đặc tả tích hợp GitHub Webhook',
    category: 'GitHub Integration',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '1.2',
    status: 'APPROVED',
    driftType: 'Semantic',
    driftSeverity: 'Critical',
    confidenceScore: 0.98,
    content: `# Tài Liệu Tích Hợp GitHub Webhook

## 1. Quy Trình Nhận Sự Kiện Tự Động
- Lắng nghe sự kiện Push và Pull Request từ GitHub Repository qua Webhook.
- Tự động trích xuất commit hash, tác giả và danh sách tệp mã nguồn thay đổi.
- Kích hoạt phân tích Drift Detection qua FastAPI AST Parser.

## 2. Các Loại Sự Kiện Hỗ Trợ
- push: Nhận diện commit mới trên nhánh chính
- pull_request: Kích hoạt kiểm tra sai lệch tài liệu trước khi merge
- ping: Kiểm tra kết nối webhook giữa GitHub và LivingDocs`,
    oldContent: `# Tài Liệu Tích Hợp GitHub Webhook

## 1. Quy Trình Cũ
- Kiểm tra commit thủ công bằng lệnh git fetch định kỳ.
- Không hỗ trợ webhook thời gian thực.`,
    groundingEvidence: {
      sourceFile: 'backend/src/main/java/com/livingdocs/controller/GitHubWebhookController.java',
      codeEntity: 'public ResponseEntity<String> handleGitHubWebhook(@RequestBody GitHubPayload payload)',
      commitHash: '9a31bc40e',
      pullRequest: '#6 KAN-21: Xử lý sự kiện Push và Pull Request từ GitHub Webhook',
      diffSnippet: `@@ -12,4 +12,12 @@
- public void syncRepoManual() { ... }
+ public ResponseEntity<String> handleGitHubWebhook(@RequestBody GitHubPayload payload) {
+     return webhookService.processEvent(payload.getEvent(), payload.getCommits());
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
    title: 'Authentication_OAuth2.md - Hướng dẫn xác thực GitHub OAuth2',
    category: 'Authentication',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '0.9',
    status: 'DRAFT',
    driftType: 'Semantic',
    driftSeverity: 'Medium',
    confidenceScore: 0.88,
    content: `# Hướng Dẫn Xác Thực GitHub OAuth2

Khi người dùng hoặc hệ thống CI/CD truy cập LivingDocs:
- Xác thực định danh người dùng thông qua GitHub OAuth2 API.
- Cấp JWT Token kèm quyền hạn RBAC (Staff, Manager, Developer) để bảo vệ các endpoint.`,
    oldContent: `# Hướng Dẫn Xác Thực Người Dùng

Đăng nhập bằng form truyền thống username và password.`,
    groundingEvidence: {
      sourceFile: 'backend/src/main/java/com/livingdocs/service/AuthService.java',
      codeEntity: 'public AuthResponse authenticateWithGitHub(String code)',
      commitHash: 'e319fa0',
      pullRequest: '#5 KAN-19: Tích hợp đăng nhập GitHub OAuth2',
      diffSnippet: `@@ -0,0 +1,15 @@
+ @PostMapping("/api/v1/auth/github")
+ public ResponseEntity<AuthResponse> loginWithGitHub(@RequestParam String code)`
    },
    lastModifiedBy: 'AI Engine',
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    title: 'RAG_Vector_Retriever.md - Truy hồi ngữ nghĩa và Embeddings',
    category: 'AI Engine',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '1.4',
    status: 'IN_REVIEW',
    driftType: 'Semantic',
    driftSeverity: 'High',
    confidenceScore: 0.95,
    content: `# Module RAG & Vector Retriever (ChromaDB & Qdrant)

Hệ thống truy hồi tăng cường (Retrieval-Augmented Generation):
- Tự động chia nhỏ (Chunking) tài liệu kỹ thuật và mã nguồn Java/Python thành các đoạn vector 512 dimensions.
- Sử dụng mô hình Text-Embedding-3-Large để đánh chỉ mục vector.
- Truy vấn tài liệu ngữ nghĩa tương đồng (Cosine Similarity > 0.82) để phát hiện sai lệch ngữ nghĩa.`,
    oldContent: `# Vector Retriever
Sử dụng tìm kiếm từ khóa SQL LIKE đơn giản.`,
    groundingEvidence: {
      sourceFile: 'ai-engine/app/retriever/vector_store.py',
      codeEntity: 'def query_relevant_chunks(query: str, top_k: int = 5) -> List[Chunk]',
      commitHash: '8b41ca9',
      pullRequest: '#8 KAN-23: Nâng cấp ChromaDB Vector Indexing',
      diffSnippet: `@@ -15,3 +15,12 @@
+ def query_relevant_chunks(query: str, top_k: int = 5) -> List[Chunk]:
+     return vector_store.similarity_search(query, k=top_k)`
    },
    lastModifiedBy: 'AI Engine',
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 6,
    title: 'Kafka_Event_Consumer.md - Xử lý hàng đợi sự kiện Kafka & DLQ',
    category: 'Message Broker',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '1.1',
    status: 'APPROVED',
    driftType: 'Signature',
    driftSeverity: 'Critical',
    confidenceScore: 0.97,
    content: `# Xử Lý Sự Kiện Kafka Event-Driven & Dead Letter Queue

Đặc tả luồng xử lý tin nhắn bất đồng bộ:
- Topic livingdocs.code-drift: Lắng nghe sự kiện mã nguồn thay đổi từ Webhook.
- Topic livingdocs.doc-approved: Thông báo khi Manager xuất bản phiên bản mới.
- Hàng đợi Dead Letter Queue (DLQ livingdocs.drift.dlq) tự động cô lập các payload JSON lỗi cú pháp để tránh nghẽn luồng.`,
    oldContent: `# Xử Lý Sự Kiện
Sử dụng RabbitMQ truyền tin nhắn đồng bộ.`,
    groundingEvidence: {
      sourceFile: 'backend/src/main/java/com/livingdocs/consumer/KafkaEventConsumer.java',
      codeEntity: 'public void handleCodeDriftEvent(@Payload DriftEvent event, Acknowledgment ack)',
      commitHash: 'd2149e8',
      pullRequest: '#11 KAN-27: Tích hợp Kafka Consumer & DLQ Retry Mechanism',
      diffSnippet: `@@ -20,6 +20,14 @@
+ @KafkaListener(topics = "livingdocs.code-drift", groupId = "livingdocs-core")
+ public void handleCodeDriftEvent(@Payload DriftEvent event, Acknowledgment ack) {
+     driftProcessor.process(event);
+     ack.acknowledge();
+ }`
    },
    lastModifiedBy: 'Technical Lead',
    updatedAt: new Date(Date.now() - 55 * 60 * 1000).toISOString()
  },
  {
    id: 7,
    title: 'RBAC_Policy_Service.md - Đặc tả ma trận phân quyền 5 cấp',
    category: 'Security & RBAC',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '2.1',
    status: 'PUBLISHED',
    driftType: 'Referential',
    driftSeverity: 'Low',
    confidenceScore: 0.99,
    content: `# Ma Trận Phân Quyền Vai Trò (Role-Based Access Control)

Hệ thống phân cấp 5 vai trò theo quy chuẩn Enterprise:
1. Developer: Nộp tài liệu mới (Submit DRAFT -> IN_REVIEW), sửa lỗi tài liệu bị từ chối.
2. Staff Reviewer: Kiểm tra tính xác thực mã nguồn, duyệt bước 1 (IN_REVIEW -> APPROVED) hoặc từ chối.
3. Manager Approver: Quyền phê duyệt tối cao và xuất bản (APPROVED -> PUBLISHED).
4. Technical Lead: Giám sát chỉ số kiến trúc, quản trị chính sách CI/CD và thực hiện Rollback.
5. Administrator: Toàn quyền quản trị hệ sinh thái người dùng và hạ tầng Microservices.`,
    oldContent: `# Phân Quyền
Chỉ có vai trò Admin và User thông thường.`,
    groundingEvidence: {
      sourceFile: 'backend/src/main/java/com/livingdocs/service/RbacPolicyService.java',
      codeEntity: 'public boolean evaluateAccess(User user, DocumentAction action, Document doc)',
      commitHash: '3a110e5',
      pullRequest: '#14 KAN-30: Hoàn thành Service ma trận phân quyền RBAC',
      diffSnippet: `@@ -30,4 +30,12 @@
+ public boolean evaluateAccess(User user, DocumentAction action, Document doc) {
+     return rbacMatrix.get(user.getRole()).contains(action);
+ }`
    },
    lastModifiedBy: 'Manager Approver',
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 8,
    title: 'Audit_Logger_Compliance.md - Ghi nhật ký kiểm toán và tuân thủ',
    category: 'Audit & Governance',
    repository: 'TruongThaiTienDat/Project-laptrinhjava',
    version: '1.0',
    status: 'IN_REVIEW',
    driftType: 'Signature',
    driftSeverity: 'Medium',
    confidenceScore: 0.93,
    content: `# Tiêu Chuẩn Ghi Nhật Ký Kiểm Toán (Audit Logging & Compliance)

Mọi biến động trạng thái trên tài liệu bắt buộc phải sinh Audit Record bất biến:
- Ghi nhận định danh người thực hiện (User ID, Role, IP Address).
- Trạng thái trước (fromStatus) và trạng thái sau (toStatus).
- Lý do phê duyệt hoặc từ chối kèm thời gian chính xác dạng ISO 8601.
- Hash chữ ký số đảm bảo dữ liệu lịch sử không bị can thiệp trái phép.`,
    oldContent: `# Ghi Log
Ghi log ra tệp text đơn giản bằng log4j.`,
    groundingEvidence: {
      sourceFile: 'backend/src/main/java/com/livingdocs/aspect/AuditLogAspect.java',
      codeEntity: 'public Object logWorkflowTransition(ProceedingJoinPoint pjp, WorkflowTransition wt)',
      commitHash: '6f7881c',
      pullRequest: '#16 KAN-32: AOP Aspect tự động ghi Audit Log chuyển trạng thái',
      diffSnippet: `@@ -18,5 +18,16 @@
+ @Around("@annotation(wt)")
+ public Object logWorkflowTransition(ProceedingJoinPoint pjp, WorkflowTransition wt) throws Throwable {
+     auditRepository.save(AuditRecord.from(wt, pjp.getArgs()));
+     return pjp.proceed();
+ }`
    },
    lastModifiedBy: 'AI Engine',
    updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
  }
];

export const defaultMockLogs: ChangeLogItem[] = [
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
    note: 'Staff xác nhận cấu hình GitHub Webhook trùng khớp với tài liệu kỹ thuật, chuyển tiếp cho Manager duyệt xuất bản'
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

export interface CodeMethod {
  name: string;
  signature: string;
  status: 'DOCUMENTED' | 'NEEDS_UPDATE' | 'MISSING_DOC';
  docTitle: string;
  description: string;
}

export interface CodeEntity {
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

export const defaultMockEntities: CodeEntity[] = [
  {
    id: 'ent-1',
    entityName: 'WorkflowController.java',
    category: 'Backend Controller',
    packagePath: 'com.livingdocs.controller.WorkflowController',
    filePath: 'backend/src/main/java/com/livingdocs/controller/WorkflowController.java',
    docCoverage: '80%',
    statusBadge: 'Đã đồng bộ',
    methods: [
      {
        name: 'submitForReview(Long id)',
        signature: 'public ResponseEntity<WorkflowDoc> submitForReview(@PathVariable Long id)',
        status: 'DOCUMENTED',
        docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs',
        description: 'Chuyển trạng thái tài liệu từ DRAFT sang IN_REVIEW để chờ Staff kiểm duyệt.'
      },
      {
        name: 'staffApprove(Long id)',
        signature: 'public ResponseEntity<WorkflowDoc> staffApprove(@PathVariable Long id)',
        status: 'DOCUMENTED',
        docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs',
        description: 'Staff kiểm tra nội dung hợp lệ, phê duyệt bước 1 và chuyển tiếp lên Manager.'
      },
      {
        name: 'managerPublish(Long id)',
        signature: 'public ResponseEntity<WorkflowDoc> managerPublish(@PathVariable Long id)',
        status: 'DOCUMENTED',
        docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs',
        description: 'Manager phê duyệt cuối cùng, hệ thống tự động nâng phiên bản và xuất bản công khai.'
      },
      {
        name: 'rejectDocument(Long id, RejectReq req)',
        signature: 'public ResponseEntity<WorkflowDoc> rejectDocument(@PathVariable Long id, @RequestBody RejectReq req)',
        status: 'DOCUMENTED',
        docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs',
        description: 'Từ chối tài liệu khi phát hiện sai sót về logic hoặc thiếu bảng tham số.'
      },
      {
        name: 'getAuditLogs(Long id)',
        signature: 'public ResponseEntity<AuditResponse> getAuditLogs(@PathVariable Long id)',
        status: 'NEEDS_UPDATE',
        docTitle: 'README.md - Hướng dẫn Kiến trúc LivingDocs',
        description: 'Lấy danh sách nhật ký thay đổi của tài liệu qua các bước kiểm duyệt.'
      }
    ],
    docContent: `# Tài Liệu Hướng Dẫn: WorkflowController

## 1. Mục Đích
Controller chịu trách nhiệm điều phối toàn bộ luồng xét duyệt tài liệu 2 cấp (Human-in-the-loop).

## 2. Danh Sách API Endpoints
- PUT /api/workflow/{id}/submit: Gửi tài liệu đi duyệt
- PUT /api/workflow/{id}/staff-approve: Staff duyệt bước 1
- PUT /api/workflow/{id}/manager-publish: Manager xuất bản chính thức
- PUT /api/workflow/{id}/reject: Từ chối tài liệu kèm lý do
- GET /api/workflow/{id}/logs: Xem lịch sử audit log

## 3. Ràng Buộc Quy Trình
Tài liệu bắt buộc phải qua Staff kiểm tra trước khi đến Manager.`
  },
  {
    id: 'ent-2',
    entityName: 'GitHubWebhookController.java',
    category: 'GitHub Integration',
    packagePath: 'com.livingdocs.controller.GitHubWebhookController',
    filePath: 'backend/src/main/java/com/livingdocs/controller/GitHubWebhookController.java',
    docCoverage: '66%',
    statusBadge: 'Có cảnh báo Drift',
    methods: [
      {
        name: 'handleGitHubWebhook(GitHubPayload payload)',
        signature: 'public ResponseEntity<String> handleGitHubWebhook(@RequestBody GitHubPayload payload)',
        status: 'DOCUMENTED',
        docTitle: 'GitHub_Webhook_Guide.md',
        description: 'Lắng nghe sự kiện Push và Pull Request từ GitHub Webhook để tự động phát hiện Drift.'
      },
      {
        name: 'verifyWebhookSignature(String signature, String payload)',
        signature: 'public boolean verifyWebhookSignature(String signature, String payload)',
        status: 'DOCUMENTED',
        docTitle: 'GitHub_Webhook_Guide.md',
        description: 'Kiểm tra chữ ký bảo mật HMAC-SHA256 từ Webhook secret của GitHub.'
      },
      {
        name: 'processBranchDrift(String branch)',
        signature: 'public DriftReport processBranchDrift(@PathVariable String branch)',
        status: 'MISSING_DOC',
        docTitle: 'Chưa có tài liệu',
        description: 'Kích hoạt quét toàn bộ cây AST của nhánh khi có merge request.'
      }
    ],
    docContent: `# Tài Liệu Hướng Dẫn: GitHub Webhook Controller

## 1. Tổng Quan Tích Hợp GitHub
Tích hợp lắng nghe sự kiện tự động qua GitHub Webhook.

## 2. Quy Trình Xử Lý
- Lập trình viên tạo Pull Request hoặc Push commit lên GitHub.
- GitHub gửi payload chứa danh sách commit và diff file về backend.
- LivingDocs phân tích AST và kích hoạt kiểm tra Documentation Drift.`
  },
  {
    id: 'ent-3',
    entityName: 'ast_analyzer.py',
    category: 'AI Engine Parser',
    packagePath: 'ai-engine/app/parser/ast_analyzer.py',
    filePath: 'ai-engine/app/parser/ast_analyzer.py',
    docCoverage: '100%',
    statusBadge: 'Đầy đủ tài liệu',
    methods: [
      {
        name: 'extract_syntax_tree(code_bytes)',
        signature: 'def extract_syntax_tree(code_bytes: bytes) -> ASTNodeStructure',
        status: 'DOCUMENTED',
        docTitle: 'FastAPI_AST_Parser.md',
        description: 'Sử dụng Tree-sitter để phân tích mã nguồn thành cây cú pháp Abstract Syntax Tree.'
      },
      {
        name: 'compare_ast_signatures(old_ast, new_ast)',
        signature: 'def compare_ast_signatures(old_ast: AST, new_ast: AST) -> DriftReport',
        status: 'DOCUMENTED',
        docTitle: 'FastAPI_AST_Parser.md',
        description: 'So sánh chữ ký các hàm để nhận diện Signature Drift hoặc Semantic Drift.'
      }
    ],
    docContent: `# Tài Liệu Hướng Dẫn: AST Analyzer Engine

## 1. Chức Năng
Module phân tích cú pháp tĩnh chạy trên nền Python FastAPI.
Bóc tách class, method, tham số và annotation từ source code.`
  },
  {
    id: 'ent-4',
    entityName: 'AuthService.java',
    category: 'Authentication',
    packagePath: 'com.livingdocs.service.AuthService',
    filePath: 'backend/src/main/java/com/livingdocs/service/AuthService.java',
    docCoverage: '75%',
    statusBadge: 'Chờ cập nhật',
    methods: [
      {
        name: 'authenticateWithGitHub(String code)',
        signature: 'public AuthResponse authenticateWithGitHub(String code)',
        status: 'DOCUMENTED',
        docTitle: 'Authentication_OAuth2.md',
        description: 'Trao đổi authorization code từ GitHub để lấy Access Token và thông tin người dùng.'
      },
      {
        name: 'generateJwtToken(User user)',
        signature: 'public String generateJwtToken(User user)',
        status: 'DOCUMENTED',
        docTitle: 'Authentication_OAuth2.md',
        description: 'Sinh JWT token có chứa claims về quyền hạn (Staff, Manager, Developer).'
      },
      {
        name: 'refreshToken(String token)',
        signature: 'public TokenResponse refreshToken(String token)',
        status: 'MISSING_DOC',
        docTitle: 'Chưa có tài liệu',
        description: 'Làm mới token đăng nhập khi JWT hết hạn 24 giờ.'
      }
    ],
    docContent: `# Hướng Dẫn Dịch Vụ Xác Thực AuthService

## 1. Cơ Chế Xác Thực
Sử dụng chuẩn GitHub OAuth2 và JSON Web Token (JWT) để bảo mật hệ thống LivingDocs.`
  }
];

interface LivingDocsContextType {
  // Quản lý người dùng & phân quyền RBAC
  currentUser: AuthUser;
  role: UserRole;
  isAuthenticated: boolean;
  isLoaded: boolean;
  setRole: (role: UserRole) => void;
  setCurrentUser: (user: AuthUser) => void;
  login: (user: AuthUser) => void;
  logout: () => void;

  documents: DocumentItem[];
  changeLogs: ChangeLogItem[];
  coverageGaps: CoverageGapItem[];
  impactItems: ImpactAnalysisItem[];
  policy: GovernancePolicy;
  milestones: VersionMilestoneItem[];
  entities: CodeEntity[];
  
  // Hành động với tài liệu
  addDocument: (doc: Omit<DocumentItem, 'id' | 'updatedAt'>) => DocumentItem;
  updateDocument: (id: number, partialDoc: Partial<DocumentItem>) => void;
  deleteDocument: (id: number) => void;
  submitForReview: (id: number) => void;
  staffApprove: (id: number, note?: string) => void;
  managerPublish: (id: number, note?: string) => void;
  rejectDocument: (id: number, reason: string) => void;
  rollbackDocument: (id: number, targetVersion: string, reason: string) => void;
  
  // Hành động bổ trợ
  resolveGap: (gapId: string) => void;
  updatePolicy: (partialPolicy: Partial<GovernancePolicy>) => void;
  resetToDefaultData: () => void;
  
  // Điều khiển Test Modal
  isTestModalOpen: boolean;
  setIsTestModalOpen: (open: boolean) => void;
  editingDocument: DocumentItem | null;
  setEditingDocument: (doc: DocumentItem | null) => void;
}

const LivingDocsContext = createContext<LivingDocsContextType | undefined>(undefined);

const STORAGE_KEY = 'livingdocs_state_dynamic_v3';
const SESSION_AUTH_KEY = 'livingdocs_session_auth_v1';

export function LivingDocsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Trạng thái xác thực & người dùng: mặc định chưa đăng nhập
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUserState] = useState<AuthUser>(sampleAccounts[1]);
  const [documents, setDocuments] = useState<DocumentItem[]>(defaultMockDocuments);
  const [changeLogs, setChangeLogs] = useState<ChangeLogItem[]>(defaultMockLogs);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGapItem[]>(initialCoverageGaps);
  const [impactItems, setImpactItems] = useState<ImpactAnalysisItem[]>(initialImpactItems);
  const [policy, setPolicy] = useState<GovernancePolicy>(initialGovernancePolicy);
  const [milestones, setMilestones] = useState<VersionMilestoneItem[]>(initialVersionMilestones);
  const [entities, setEntities] = useState<CodeEntity[]>(defaultMockEntities);

  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [editingDocument, setEditingDocument] = useState<DocumentItem | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Tải dữ liệu từ localStorage và kiểm tra phiên xác thực từ sessionStorage
  useEffect(() => {
    try {
      // 1. Dọn dẹp triệt để trạng thái isAuthenticated cũ trong localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isAuthenticated !== undefined || parsed.currentUser !== undefined) {
          delete parsed.isAuthenticated;
          delete parsed.currentUser;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.changeLogs) setChangeLogs(parsed.changeLogs);
        if (parsed.coverageGaps) setCoverageGaps(parsed.coverageGaps);
        if (parsed.impactItems) setImpactItems(parsed.impactItems);
        if (parsed.policy) setPolicy(parsed.policy);
        if (parsed.milestones) setMilestones(parsed.milestones);
        if (parsed.entities) setEntities(parsed.entities);
      }

      // 2. Chỉ kiểm tra phiên đăng nhập từ sessionStorage (tự động mất khi đóng tab hoặc mở link mới)
      const sessionAuth = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (sessionAuth) {
        const parsedAuth = JSON.parse(sessionAuth);
        if (parsedAuth.isAuthenticated === true && parsedAuth.currentUser) {
          setIsAuthenticated(true);
          setCurrentUserState(parsedAuth.currentUser);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.error('Lỗi đọc dữ liệu khởi động:', e);
      setIsAuthenticated(false);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Lưu dữ liệu vào localStorage khi có thay đổi (tuyệt đối không lưu isAuthenticated vào localStorage)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        documents,
        changeLogs,
        coverageGaps,
        impactItems,
        policy,
        milestones,
        entities
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Không thể lưu dữ liệu vào localStorage:', e);
    }
  }, [documents, changeLogs, coverageGaps, impactItems, policy, milestones, entities, isLoaded]);

  // Đổi role trực tiếp từ Header -> tự động khớp với tài khoản mẫu tương ứng
  const setRole = (newRole: UserRole) => {
    const matchedAccount = sampleAccounts.find(acc => acc.role === newRole);
    const updatedUser: AuthUser = matchedAccount || {
      ...currentUser,
      role: newRole,
      roleDescription: newRole
    };
    setCurrentUserState(updatedUser);
    try {
      sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({
        isAuthenticated: true,
        currentUser: updatedUser
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const setCurrentUser = (user: AuthUser) => {
    setCurrentUserState(user);
    try {
      sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({
        isAuthenticated: true,
        currentUser: user
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Đăng nhập: chỉ lưu vào sessionStorage của phiên làm việc
  const login = (user: AuthUser) => {
    setCurrentUserState(user);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({
        isAuthenticated: true,
        currentUser: user
      }));
    } catch (e) {
      console.error(e);
    }
  };

  // Đăng xuất: xóa session đăng nhập và điều hướng bắt buộc về /login
  const logout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    } catch {}
    router.replace('/login');
  };

  // Thêm tài liệu mới
  const addDocument = (doc: Omit<DocumentItem, 'id' | 'updatedAt'>): DocumentItem => {
    const newId = documents.length > 0 ? Math.max(...documents.map(d => d.id)) + 1 : 1;
    const newDoc: DocumentItem = {
      ...doc,
      id: newId,
      updatedAt: new Date().toISOString()
    };
    const updatedDocs = [newDoc, ...documents];
    setDocuments(updatedDocs);

    // Ghi nhật ký
    const newLog: ChangeLogItem = {
      id: changeLogs.length + 1,
      documentId: newId,
      role: (currentUser.role as any) || 'Developer',
      fromStatus: 'NONE',
      toStatus: newDoc.status,
      timestamp: new Date().toISOString(),
      note: `Khởi tạo tài liệu mới: ${newDoc.title.split(' - ')[0]}`
    };
    setChangeLogs([newLog, ...changeLogs]);
    return newDoc;
  };

  // Cập nhật tài liệu
  const updateDocument = (id: number, partialDoc: Partial<DocumentItem>) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          ...partialDoc,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }));
  };

  // Xóa tài liệu
  const deleteDocument = (id: number) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Nộp tài liệu vào hàng đợi duyệt
  const submitForReview = (id: number) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const oldStatus = doc.status;
    updateDocument(id, { status: 'IN_REVIEW', lastModifiedBy: currentUser.name });

    const newLog: ChangeLogItem = {
      id: changeLogs.length + 1,
      documentId: id,
      role: (currentUser.role as any) || 'Developer',
      fromStatus: oldStatus,
      toStatus: 'IN_REVIEW',
      timestamp: new Date().toISOString(),
      note: `Gửi tài liệu vào hàng đợi kiểm duyệt bởi ${currentUser.name} (${currentUser.role})`
    };
    setChangeLogs([newLog, ...changeLogs]);
  };

  // Staff kiểm duyệt bước 1
  const staffApprove = (id: number, note?: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const oldStatus = doc.status;
    updateDocument(id, { status: 'APPROVED', lastModifiedBy: `${currentUser.name} (Staff)` });

    const newLog: ChangeLogItem = {
      id: changeLogs.length + 1,
      documentId: id,
      role: 'Staff',
      fromStatus: oldStatus,
      toStatus: 'APPROVED',
      timestamp: new Date().toISOString(),
      note: note || `Staff ${currentUser.name} xác nhận nội dung tài liệu khớp với Grounding Evidence mã nguồn`
    };
    setChangeLogs([newLog, ...changeLogs]);
  };

  // Manager phê duyệt xuất bản
  const managerPublish = (id: number, note?: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const oldStatus = doc.status;
    const currentVer = parseFloat(doc.version) || 1.0;
    const nextVer = (currentVer + 0.1).toFixed(1);

    updateDocument(id, { 
      status: 'PUBLISHED', 
      version: nextVer,
      lastModifiedBy: `${currentUser.name} (Manager)`
    });

    const newLog: ChangeLogItem = {
      id: changeLogs.length + 1,
      documentId: id,
      role: 'Manager',
      fromStatus: oldStatus,
      toStatus: 'PUBLISHED',
      timestamp: new Date().toISOString(),
      note: note || `Manager ${currentUser.name} phê duyệt xuất bản chính thức phiên bản v${nextVer}`
    };
    setChangeLogs([newLog, ...changeLogs]);
  };

  // Từ chối tài liệu
  const rejectDocument = (id: number, reason: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const oldStatus = doc.status;
    updateDocument(id, { status: 'REJECTED', lastModifiedBy: currentUser.name });

    const newLog: ChangeLogItem = {
      id: changeLogs.length + 1,
      documentId: id,
      role: (currentUser.role as any) || 'Reviewer',
      fromStatus: oldStatus,
      toStatus: 'REJECTED',
      timestamp: new Date().toISOString(),
      note: reason || `Từ chối bởi ${currentUser.name}: Sai lệch thông tin tham số mã nguồn`
    };
    setChangeLogs([newLog, ...changeLogs]);
  };

  // Khôi phục phiên bản Rollback
  const rollbackDocument = (id: number, targetVersion: string, reason: string) => {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    const oldStatus = doc.status;
    updateDocument(id, { 
      status: 'APPROVED', 
      version: targetVersion,
      content: doc.oldContent || doc.content,
      lastModifiedBy: `${currentUser.name} (Rollback)`
    });

    const newLog: ChangeLogItem = {
      id: changeLogs.length + 1,
      documentId: id,
      role: 'Tech Lead',
      fromStatus: oldStatus,
      toStatus: 'APPROVED',
      timestamp: new Date().toISOString(),
      note: `Rollback về v${targetVersion} bởi ${currentUser.name}. Lý do: ${reason}`
    };
    setChangeLogs([newLog, ...changeLogs]);
  };

  // Xử lý lấp khoảng trống bao phủ
  const resolveGap = (gapId: string) => {
    const gap = coverageGaps.find(g => g.id === gapId);
    if (!gap) return;
    
    // Tạo tài liệu mới từ gap
    addDocument({
      title: `${gap.suggestedDocTitle}`,
      category: gap.service,
      repository: 'TruongThaiTienDat/Project-laptrinhjava',
      version: '1.0',
      status: 'IN_REVIEW',
      driftType: 'Signature',
      driftSeverity: gap.priority as any,
      confidenceScore: 0.95,
      content: `# Tài Liệu Sinh Tự Động Cho: ${gap.entityName}\n\n## Chữ ký hàm\n\`\`\`java\n${gap.signature}\n\`\`\`\n\nTập tin nguồn: ${gap.sourceFile}`,
      oldContent: '# Chưa có tài liệu',
      groundingEvidence: {
        sourceFile: gap.sourceFile,
        codeEntity: gap.signature,
        commitHash: gap.lastCommit,
        diffSnippet: `+ ${gap.signature}`
      },
      lastModifiedBy: 'AI Auto-Resolve'
    });

    setCoverageGaps(prev => prev.filter(g => g.id !== gapId));
  };

  const updatePolicy = (partialPolicy: Partial<GovernancePolicy>) => {
    setPolicy(prev => ({ ...prev, ...partialPolicy }));
  };

  // Khôi phục dữ liệu gốc
  const resetToDefaultData = () => {
    setCurrentUserState(sampleAccounts[1]);
    setDocuments(defaultMockDocuments);
    setChangeLogs(defaultMockLogs);
    setCoverageGaps(initialCoverageGaps);
    setImpactItems(initialImpactItems);
    setPolicy(initialGovernancePolicy);
    setMilestones(initialVersionMilestones);
    setEntities(defaultMockEntities);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  return (
    <LivingDocsContext.Provider
      value={{
        currentUser,
        role: currentUser.role,
        isAuthenticated,
        isLoaded,
        setRole,
        setCurrentUser,
        login,
        logout,
        documents,
        changeLogs,
        coverageGaps,
        impactItems,
        policy,
        milestones,
        entities,
        addDocument,
        updateDocument,
        deleteDocument,
        submitForReview,
        staffApprove,
        managerPublish,
        rejectDocument,
        rollbackDocument,
        resolveGap,
        updatePolicy,
        resetToDefaultData,
        isTestModalOpen,
        setIsTestModalOpen,
        editingDocument,
        setEditingDocument
      }}
    >
      {children}
    </LivingDocsContext.Provider>
  );
}

export function useLivingDocs() {
  const context = useContext(LivingDocsContext);
  if (!context) {
    throw new Error('useLivingDocs phải được sử dụng bên trong LivingDocsProvider');
  }
  return context;
}
