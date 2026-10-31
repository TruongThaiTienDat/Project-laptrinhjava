from fastapi.testclient import TestClient

from app import main
from app.services.confidence import (
    compute_confidence,
    evidence_entities,
    extract_evidence,
    format_evidence,
)
from app.services.drift_detector import DriftFinding, DriftResult

client = TestClient(main.app)

DOC = """# User API

## createUser
Tao nguoi dung moi, nhan 1 tham so la name.

## deleteUser
Xoa nguoi dung theo id.
"""
UPDATED = DOC.replace("nhan 1 tham so la name.", "nhan name va email.")
DIFF = """@@ -1,3 +1,3 @@ public class UserController
-    public User createUser(String name) {
+    public User createUser(String name, String email) {
"""


def _good():
    return DriftResult(True, [DriftFinding("createUser", "thieu email")], UPDATED)


def test_good_result_has_high_score():
    assert compute_confidence(DOC, _good(), ["createUser"]) >= 0.8


def test_invented_section_lowers_score():
    bad = DriftResult(True, [DriftFinding("khong co muc nay", "x")], UPDATED)
    assert compute_confidence(DOC, bad, ["createUser"]) < compute_confidence(
        DOC, _good(), ["createUser"]
    )


def test_rewriting_whole_document_lowers_score():
    rewritten = DriftResult(
        True, [DriftFinding("createUser", "thieu email")], "# Khac\nHoan toan moi\n"
    )
    assert compute_confidence(DOC, rewritten, ["createUser"]) < compute_confidence(
        DOC, _good(), ["createUser"]
    )


def test_drift_without_findings_lowers_score():
    inconsistent = DriftResult(True, [], DOC)
    assert compute_confidence(DOC, inconsistent, ["createUser"]) < compute_confidence(
        DOC, _good(), ["createUser"]
    )


def test_evidence_uses_changed_code_names():
    findings = [DriftFinding("createUser", "thieu email")]
    assert evidence_entities(findings, ["UserController", "createUser"]) == ["createUser"]


def test_evidence_fallback_when_no_findings():
    assert evidence_entities([], ["createUser"]) == ["Code changes"]


def test_update_endpoint_returns_computed_score_and_evidence(monkeypatch):
    monkeypatch.setattr(main, "detect_drift", lambda *a, **k: _good())
    response = client.post(
        "/api/v1/documents/update",
        json={
            "document_id": 1,
            "file_path": "UserController.java",
            "language": "java",
            "current_content": DOC,
            "code_diff": DIFF,
        },
    )
    body = response.json()
    assert body["confidence_score"] == 0.85
    assert "Confidence score: 0.85" in body["content"]
    assert [e["code_entity"] for e in body["grounding_evidence"]] == ["createUser"]


def test_extract_evidence_finds_doc_and_code():
    findings = [DriftFinding("createUser", "thieu email")]
    proofs = extract_evidence(DOC, DIFF, findings, ["UserController", "createUser"])
    assert proofs[0]["doc_excerpt"].startswith("Tao nguoi dung")
    assert proofs[0]["code_excerpt"].startswith("+")
    assert "email" in proofs[0]["code_excerpt"]


def test_format_evidence_empty_returns_blank():
    assert format_evidence([]) == ""