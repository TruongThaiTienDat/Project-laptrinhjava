from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import ast
import re

from app.parser.java_parser import parse_java  # KAN-21: Java AST parser
from app.services.drift_detector import detect_drift  # KAN-22: RAG drift detection

app = FastAPI(
    title="LivingDocs AI Engine API",
    version="1.0.0",
    description="AI Engine service supporting AST Parsing, LLM & RAG Pipelines"
)

MODEL_NAME = "livingdocs-rule-based-1.0"
LLM_MODEL_NAME = "livingdocs-gemini-rag-1.0"


# ===== Request DTOs =====
class GenerateRequest(BaseModel):
    document_id: int
    file_path: str
    language: Optional[str] = "unknown"
    source_code: str
    template_structure: Optional[str] = None
    commit_hash: Optional[str] = None


class UpdateRequest(BaseModel):
    document_id: int
    file_path: str
    language: Optional[str] = "unknown"
    current_content: str
    code_diff: str
    commit_hash: Optional[str] = None


# ===== Response DTOs =====
class GroundingEvidence(BaseModel):
    file_path: str
    code_entity: str
    commit_hash: Optional[str] = None


class AiEngineResult(BaseModel):
    content: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    grounding_evidence: list[GroundingEvidence]
    model: str


# ===== Helper: extract code entities =====
def extract_entities(source_code: str, language: str) -> list[str]:
    entities = []

    if (language or "").lower() == "python":
        try:
            tree = ast.parse(source_code)

            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    entities.append(f"Function: {node.name}")
                elif isinstance(node, ast.ClassDef):
                    entities.append(f"Class: {node.name}")

        except SyntaxError:
            entities.append("Source code syntax could not be parsed")
    elif (language or "").lower() == "java":  # KAN-21: parse Java bang tree-sitter
        try:
            for e in parse_java(source_code):
                label = e.kind.capitalize()
                if e.kind in ("method", "constructor"):
                    if e.parent:
                        entities.append(f"{label}: {e.parent}.{e.signature}")
                    else:
                        entities.append(f"{label}: {e.signature}")
                else:
                    entities.append(f"{label}: {e.name}")
        except Exception:
            entities.append("Source code syntax could not be parsed")
    else:
        pattern = (
            r"\b(?:class|interface|enum)\s+([A-Za-z_$][\w$]*)"
            r"|\bfunction\s+([A-Za-z_$][\w$]*)"
            r"|\b([A-Za-z_$][\w$]*)\s*\([^;{}]*\)\s*\{"
        )

        for match in re.finditer(pattern, source_code):
            name = next((group for group in match.groups() if group), None)
            if name and name not in entities:
                entities.append(name)

    return entities


def make_evidence(
    file_path: str,
    entities: list[str],
    commit_hash: Optional[str]
) -> list[GroundingEvidence]:
    names = entities or ["Source file"]

    return [
        GroundingEvidence(
            file_path=file_path,
            code_entity=name,
            commit_hash=commit_hash
        )
        for name in names[:50]
    ]


# ===== Helper: build response from LLM drift detection (KAN-22) =====
def build_drift_response(request: UpdateRequest, drift) -> AiEngineResult:
    if drift.drift_detected:
        content = drift.updated_content.rstrip()
    else:
        content = request.current_content.rstrip()

    report = "\n\n## Drift Report\n"
    if drift.findings:
        report += "\n".join(
            f"- **{f.section or 'General'}**: {f.issue}" for f in drift.findings
        )
    else:
        report += "- No documentation drift detected."
    report += f"\n\n- Commit: {request.commit_hash or 'Not provided'}\n"

    evidence = [
        GroundingEvidence(
            file_path=request.file_path,
            code_entity=f.section or "Code changes",
            commit_hash=request.commit_hash
        )
        for f in drift.findings
    ]
    if not evidence:
        evidence = [
            GroundingEvidence(
                file_path=request.file_path,
                code_entity="Code changes",
                commit_hash=request.commit_hash
            )
        ]

    return AiEngineResult(
        content=content + report,
        confidence_score=0.80,  # tam thoi, KAN-23 se tinh diem that
        grounding_evidence=evidence[:50],
        model=LLM_MODEL_NAME
    )


# ===== Existing health endpoints =====
@app.get("/")
def read_root():
    return {"service": "AI Engine", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


# ===== Generate documentation =====
@app.post(
    "/api/v1/documents/generate",
    response_model=AiEngineResult
)
def generate_document(request: GenerateRequest):
    if not request.source_code.strip():
        raise HTTPException(
            status_code=422,
            detail="source_code must not be empty"
        )

    language = request.language or "unknown"
    entities = extract_entities(request.source_code, language)

    content = f"""# Documentation: {request.file_path}

## Overview
Documentation generated by the LivingDocs rule-based engine.

- Document ID: {request.document_id}
- Language: {language}
- Source lines: {len(request.source_code.splitlines())}

## Classes and Functions
"""

    if entities:
        content += "\n".join(f"- {entity}" for entity in entities)
    else:
        content += "- No classes or functions were identified."

    if request.template_structure:
        content += (
            "\n\n## Template Structure\n"
            + request.template_structure
        )

    content += (
        "\n\n## Source Information\n"
        f"- File: {request.file_path}\n"
        f"- Commit: {request.commit_hash or 'Not provided'}\n"
        f"- Generated at: {datetime.now(timezone.utc).isoformat()}\n"
    )

    return AiEngineResult(
        content=content,
        confidence_score=0.75,
        grounding_evidence=make_evidence(
            request.file_path, entities, request.commit_hash
        ),
        model=MODEL_NAME
    )


# ===== Update documentation =====
@app.post(
    "/api/v1/documents/update",
    response_model=AiEngineResult
)
def update_document(request: UpdateRequest):
    if not request.code_diff.strip():
        raise HTTPException(
            status_code=422,
            detail="code_diff must not be empty"
        )

    # KAN-22: thu phat hien lech bang RAG + LLM, loi thi quay ve ban rule-based ben duoi
    drift = detect_drift(
        request.current_content,
        request.code_diff,
        request.file_path,
        request.language or "unknown",
    )
    if drift is not None:
        return build_drift_response(request, drift)

    content = f"""{request.current_content.rstrip()}

## Update Notes
Documentation update based on the supplied code diff.

- Document ID: {request.document_id}
- File: {request.file_path}
- Language: {request.language or 'unknown'}
- Commit: {request.commit_hash or 'Not provided'}

### Code Changes
```diff
{request.code_diff}
```
"""

    return AiEngineResult(
        content=content,
        confidence_score=0.70,
        grounding_evidence=[
            GroundingEvidence(
                file_path=request.file_path,
                code_entity="Code changes",
                commit_hash=request.commit_hash
            )
        ],
        model=MODEL_NAME
    )