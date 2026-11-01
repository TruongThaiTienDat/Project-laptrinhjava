import json

from app.services import drift_detector
from app.services.doc_chunker import chunk_markdown
from app.services.drift_detector import (
    apply_section_updates,
    build_prompt,
    detect_drift,
)

FILLER = "".join(
    f"## Muc {i}\n{'Noi dung mo ta. ' * 40}\n\n" for i in range(30)
)
LONG_DOC = (
    "# API\n\n"
    "## createUser\nTao nguoi dung moi, nhan tham so name.\n\n"
    + FILLER
)
DIFF = """@@ -1,3 +1,3 @@ public class UserController
-    public User createUser(String name) {
+    public User createUser(String name, String email) {
"""


def test_long_document_uses_section_mode(monkeypatch):
    captured = {}
    reply = json.dumps(
        {
            "drift_detected": True,
            "findings": [
                {
                    "section": "createUser",
                    "issue": "thieu email",
                    "suggestion": "them email",
                }
            ],
            "updated_sections": [
                {
                    "heading": "createUser",
                    "content": "## createUser\nTao nguoi dung moi, nhan name va email.",
                }
            ],
        }
    )

    def fake_ask(prompt):
        captured["prompt"] = prompt
        return reply

    monkeypatch.setattr(drift_detector, "ask_llm", fake_ask)
    result = detect_drift(LONG_DOC, DIFF, "UserController.java", "java")

    assert result is not None
    assert result.drift_detected is True
    assert "name va email" in result.updated_content
    assert "nhan tham so name." not in result.updated_content
    assert "## Muc 29" in result.updated_content
    assert "Muc 29" not in captured["prompt"]


def test_long_document_without_relevant_section_returns_none(monkeypatch):
    def fail(prompt):
        raise AssertionError("LLM should not be called")

    monkeypatch.setattr(drift_detector, "ask_llm", fail)
    diff = "@@ -1,2 +1,2 @@\n-    foo();\n+    bar();\n"
    assert detect_drift(LONG_DOC, diff, "A.java", "java") is None


def test_apply_section_updates_rejects_unknown_heading():
    sections = chunk_markdown(LONG_DOC)[:2]
    updates = [{"heading": "khong co", "content": "x"}]
    assert apply_section_updates(LONG_DOC, sections, updates) is None


def test_prompt_asks_for_document_language():
    prompt = build_prompt("# A", "diff", "A.java", "java", [])
    assert "same language as the document" in prompt