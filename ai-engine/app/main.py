from fastapi import FastAPI

app = FastAPI(
    title="LivingDocs AI Engine API",
    version="1.0.0",
    description="AI Engine service supporting AST Parsing, LLM & RAG Pipelines"
)

@app.get("/")
def read_root():
    return {"service": "AI Engine", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}