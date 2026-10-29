import json
import re
from dataclasses import dataclass, field

from app.services.doc_chunker import chunk_markdown, find_relevant_chunks
from app.services.llm_client import ask_llm

MAX_DOC_CHARS = 12000
MAX_DIFF_CHARS = 8000
KEYWORDS = {
    "if", "for", "while", "switch", "catch", "return", "new",
    "else", "try", "synchronized", "super", "this",
}
NAME_RE = re.compile(r"\b([A-Za-z_$][\w$]*)\s*\(")
CLASS_RE = re.compile(r"\b(?:class|interface|enum|record)\s+([A-Za-z_$][\w$]*)")


@dataclass
class DriftFinding:
    section: str
    issue: str
    suggestion: str = ""


@dataclass
class DriftResult:
    drift_detected: bool
    findings: list[DriftFinding] = field(default_factory=list)
    updated_content: str = ""


def changed_names(code_diff: str, limit: int = 10) -> list[str]:
    """Lay ten ham/class bi doi tu diff (ke ca dong ngu canh trong @@ ... @@)."""
    lines: list[str] = []
    for line in code_diff.splitlines():
        if line.startswith(("+++", "---")):
            continue
        if line.startswith("@@"):
            parts = line.split("@@")
            if len(parts) >= 3:
                lines.append(parts[2])
        elif line[:1] in ("+", "-"):
            lines.append(line[1:])
    text = "\n".join(lines)

    names: list[str] = []
    for name in CLASS_RE.findall(text) + NAME_RE.findall(text):
        if name not in KEYWORDS and name not in names:
            names.append(name)
    return names[:limit]


def select_headings(current_content: str, names: list[str]) -> list[str]:
    """Tim cac muc tai lieu lien quan den cac ten bi doi (buoc retrieve)."""
    chunks = chunk_markdown(current_content)
    picked = {}
    for name in names:
        for chunk, _score in find_relevant_chunks(chunks, name, top_k=2):
            picked[chunk.start_line] = chunk.heading
    return [picked[k] for k in sorted(picked)]


def build_prompt(
    current_content: str,
    code_diff: str,
    file_path: str,
    language: str,
    headings: list[str],
) -> str:
    hint = ", ".join(headings) if headings else "(none found - check all sections)"
    return (
        "You are a documentation maintenance assistant.\n"
        "A source file changed. Decide whether the existing Markdown documentation "
        "still matches the code change, and fix only what is wrong.\n\n"
        f"File: {file_path}\nLanguage: {language}\n\n"
        "RULES:\n"
        "- Base your answer ONLY on the diff and the document below. Do not invent behavior.\n"
        "- Change only the sections affected by the diff. Keep all other text exactly as is.\n"
        "- Keep the document's language, tone and Markdown structure.\n"
        "- Sections named 'Update Notes' or 'Drift Report' are history logs: keep them unchanged.\n"
        "- Reply with ONE JSON object and nothing else, in this shape:\n"
        '{"drift_detected": true or false, '
        '"findings": [{"section": "heading", "issue": "what is wrong", "suggestion": "how it was fixed"}], '
        '"updated_content": "the FULL updated Markdown document"}\n'
        "- If nothing is outdated, set drift_detected to false and findings to [].\n\n"
        f"Sections likely affected: {hint}\n\n"
        "=== CODE DIFF ===\n"
        f"{code_diff}\n\n"
        "=== CURRENT DOCUMENT ===\n"
        f"{current_content}\n"
    )


def parse_llm_json(text: str | None) -> dict | None:
    if not text:
        return None
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end <= start:
        return None
    try:
        data = json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def detect_drift(
    current_content: str, code_diff: str, file_path: str, language: str
) -> DriftResult | None:
    """Tra ve None neu khong dung duoc LLM (de endpoint quay ve ban rule-based)."""
    if len(current_content) > MAX_DOC_CHARS:
        return None

    diff = code_diff[:MAX_DIFF_CHARS]
    headings = select_headings(current_content, changed_names(diff))
    reply = ask_llm(build_prompt(current_content, diff, file_path, language, headings))

    data = parse_llm_json(reply)
    if not data:
        return None

    updated = data.get("updated_content")
    if not isinstance(updated, str) or not updated.strip():
        return None
    if len(updated) < 0.3 * len(current_content):
        return None  # nghi ngo bi cat ngan

    findings: list[DriftFinding] = []
    for item in data.get("findings") or []:
        if isinstance(item, dict) and item.get("issue"):
            findings.append(
                DriftFinding(
                    section=str(item.get("section", "")),
                    issue=str(item["issue"]),
                    suggestion=str(item.get("suggestion", "")),
                )
            )

    drift = bool(data.get("drift_detected", bool(findings)))
    return DriftResult(drift_detected=drift, findings=findings, updated_content=updated)