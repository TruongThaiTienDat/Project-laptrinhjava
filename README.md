# LivingDocs - Hệ Thống Tự Động Hóa Tài Liệu (Microservices)

Dự án Microservices quản lý và sinh tài liệu kỹ thuật tự động.

## Cấu trúc dự án
- `.github/workflows/`: Cấu hình CI/CD & Drift Detection
- `backend/`: Java Spring Boot Service (Auth, Core, Workflow)
- `ai-engine/`: Python FastAPI Service (LLM, RAG Pipeline, AST Parser)
- `frontend/`: ReactJS / Next.js Admin Panel & User Interface
- `docs/`: Tài liệu kiến trúc và sơ đồ hệ thống