import json

from fastapi.testclient import TestClient

from app import main
from app.services import drift_detector
from app.services.drift_detector import (
    DriftFinding,
    DriftResult,
    changed_names,
    detect_drift,
    parse_llm_json,
)

client = TestClient(main.app)

DOC = """# API
## createUser
Tao nguoi dung, nhan tham so name.
"""

DIFF = """@@ -1,3 +1,3 @@ public class UserController
-    public User createUser(String name) {
+    public User createUser(String name, String email) {
"""

REQUEST = {
    "document_id": 1,
    "file_path": "UserController.java",
    "language": "java",
    "current_content": DOC,
    "code_diff": DIFF,
}


def test_changed_names_reads_hunk_header_and_changed_lines():
    names = changed_names(DIFF)
    assert "createUser" in names
    assert "UserController" in names
    assert "if" not in names


def test_parse_llm_json_handles_code_fence():
    text = '```json\n{"drift_detected": true, "findings": []}\n```'
    assert parse_llm_json(text) == {"drift_detected": True, "findings": []}


def test_parse_llm_json_returns_none_for_garbage():
    assert parse_llm_json("khong phai json") is None
    assert parse_llm_json(None) is None


def test_detect_drift_falls_back_when_llm_unavailable(monkeypatch):
    monkeypatch.setattr(drift_detector, "ask_llm", lambda prompt: None)
    assert detect_drift(DOC, DIFF, "UserController.java", "java") is None


def test_detect_drift_parses_llm_answer(monkeypatch):
    reply = json.dumps(
        {
            "drift_detected": True,
            "findings": [
                {
                    "section": "createUser",
                    "issue": "Thieu tham so email",
                    "suggestion": "Them email vao mo ta",
                }
            ],
            "updated_content": "# API\n## createUser\nTao nguoi dung, nhan name va email.\n",
        }
    )
    monkeypatch.setattr(drift_detector, "ask_llm", lambda prompt: reply)
    result = detect_drift(DOC, DIFF, "UserController.java", "java")
    assert result is not None
    assert result.drift_detected is True
    assert result.findings[0].section == "createUser"
    assert "email" in result.updated_content


def test_update_endpoint_uses_llm_result(monkeypatch):
    fake = DriftResult(
        True,
        [DriftFinding("createUser", "thieu tham so email")],
        "# API\n## createUser\nCap nhat email\n",
    )
    monkeypatch.setattr(main, "detect_drift", lambda *a, **k: fake)
    response = client.post("/api/v1/documents/update", json=REQUEST)
    assert response.status_code == 200
    body = response.json()
    assert "Cap nhat email" in body["content"]
    assert "Drift Report" in body["content"]
    assert 0 <= body["confidence_score"] <= 1


def test_update_endpoint_falls_back_without_llm(monkeypatch):
    monkeypatch.setattr(main, "detect_drift", lambda *a, **k: None)
    response = client.post("/api/v1/documents/update", json=REQUEST)
    assert response.status_code == 200
    assert "Update Notes" in response.json()["content"]
    