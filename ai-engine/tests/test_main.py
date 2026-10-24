from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_generate_python_extracts_entities():
    r = client.post("/api/v1/documents/generate", json={
        "document_id": 1,
        "file_path": "a.py",
        "language": "python",
        "source_code": "class A:\n    def f(self):\n        pass\n",
        "commit_hash": "abc123",
    })
    assert r.status_code == 200
    body = r.json()
    assert 0.0 <= body["confidence_score"] <= 1.0
    assert "Class: A" in body["content"]
    entities = [e["code_entity"] for e in body["grounding_evidence"]]
    assert "Class: A" in entities and "Function: f" in entities
    assert all(e["commit_hash"] == "abc123" for e in body["grounding_evidence"])


def test_generate_includes_template_structure():
    r = client.post("/api/v1/documents/generate", json={
        "document_id": 1, "file_path": "A.java", "language": "java",
        "source_code": "public class A { void run() {} }",
        "template_structure": "## Overview",
    })
    assert r.status_code == 200
    assert "## Overview" in r.json()["content"]


def test_generate_rejects_empty_source():
    r = client.post("/api/v1/documents/generate", json={
        "document_id": 1, "file_path": "a.py", "source_code": "   ",
    })
    assert r.status_code == 422


def test_update_appends_diff():
    r = client.post("/api/v1/documents/update", json={
        "document_id": 1, "file_path": "a.py", "language": "python",
        "current_content": "# Old", "code_diff": "+def g(): pass", "commit_hash": "def456",
    })
    assert r.status_code == 200
    body = r.json()
    assert body["content"].startswith("# Old")
    assert "+def g(): pass" in body["content"]
    assert body["grounding_evidence"][0]["commit_hash"] == "def456"


def test_update_rejects_empty_diff():
    r = client.post("/api/v1/documents/update", json={
        "document_id": 1, "file_path": "a.py", "current_content": "# Old", "code_diff": "",
    })
    assert r.status_code == 422