import json
import re
from dataclasses import dataclass, field

from app.services.doc_chunker import DocChunk, chunk_markdown  # KAN-22: them DocChunk
from app.services.llm_client import ask_llm
from app.services.retriever import retrieve_chunks

MAX_DOC_CHARS = 12000
MAX_DIFF_CHARS = 8000
MAX_SECTIONS = 8  # KAN-22: so muc toi da gui cho LLM khi tai lieu dai
MAX_SECTION_CHARS = 4000  # KAN-22
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
    """Tim cac muc tai lieu lien quan den cac ten bi doi (embedding + tu khoa)."""
    chunks = chunk_markdown(current_content)
    return [chunk.heading for chunk in retrieve_chunks(chunks, names)]


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
        "- Write the 'issue' and 'suggestion' texts in the same language as the document.\n"  # KAN-22
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


# ===== KAN-22: xu ly tai lieu dai (chi gui cac muc lien quan cho LLM) =====
def build_section_prompt(
    sections: list[DocChunk], code_diff: str, file_path: str, language: str
) -> str:
    body = "\n\n".join(
        f"--- SECTION: {chunk.heading} ---\n{chunk.content}" for chunk in sections
    )
    return (
        "You are a documentation maintenance assistant.\n"
        "A source file changed. Below are the documentation sections most related to the "
        "change (the full document is too long to send). Decide which of these sections no "
        "longer match the code change, and fix only those.\n\n"
        f"File: {file_path}\nLanguage: {language}\n\n"
        "RULES:\n"
        "- Base your answer ONLY on the diff and the sections below. Do not invent behavior.\n"
        "- Only return sections that need changes. Do not return sections that are still correct.\n"
        "- For each returned section, 'content' must be the FULL updated section, "
        "including its heading line.\n"
        "- Keep the document's language, tone and Markdown structure.\n"
        "- Write the 'issue' and 'suggestion' texts in the same language as the document.\n"
        "- Reply with ONE JSON object and nothing else, in this shape:\n"
        '{"drift_detected": true or false, '
        '"findings": [{"section": "heading", "issue": "what is wrong", "suggestion": "how it was fixed"}], '
        '"updated_sections": [{"heading": "exact section heading", "content": "full updated section"}]}\n'
        "- If nothing is outdated, set drift_detected to false, findings to [] and "
        "updated_sections to [].\n\n"
        "=== CODE DIFF ===\n"
        f"{code_diff}\n\n"
        "=== RELATED SECTIONS ===\n"
        f"{body}\n"
    )


def apply_section_updates(
    document: str, sections: list[DocChunk], updates: list
) -> str | None:
    """Thay cac muc da sua vao tai lieu goc. Tra ve None neu co muc khong hop le."""
    by_heading = {chunk.heading: chunk for chunk in sections}
    result = document
    for item in updates:
        if not isinstance(item, dict):
            return None
        heading = str(item.get("heading", "")).lstrip("#").strip()
        new_content = item.get("content")
        chunk = by_heading.get(heading)
        if chunk is None or not isinstance(new_content, str) or not new_content.strip():
            return None
        if len(new_content) < 0.3 * len(chunk.content):
            return None  # nghi ngo bi cat ngan
        if chunk.content not in result:
            return None
        result = result.replace(chunk.content, new_content.strip(), 1)
    return result


def _detect_by_sections(
    current_content: str, diff: str, file_path: str, language: str
) -> DriftResult | None:
    """Tai lieu dai: chi gui cac muc tim duoc cho LLM, roi ghep lai vao tai lieu goc."""
    names = changed_names(diff)
    chunks = chunk_markdown(current_content)
    picked = [
        chunk for chunk in retrieve_chunks(chunks, names)
        if len(chunk.content) <= MAX_SECTION_CHARS
    ][:MAX_SECTIONS]
    if not picked:
        return None

    reply = ask_llm(build_section_prompt(picked, diff, file_path, language))
    data = parse_llm_json(reply)
    if not data:
        return None

    updates = data.get("updated_sections") or []
    if not isinstance(updates, list):
        return None

    updated = apply_section_updates(current_content, picked, updates)
    if updated is None:
        return None

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


def detect_drift(
    current_content: str, code_diff: str, file_path: str, language: str
) -> DriftResult | None:
    """Tra ve None neu khong dung duoc LLM (de endpoint quay ve ban rule-based)."""
    if len(current_content) > MAX_DOC_CHARS:
        return _detect_by_sections(  # KAN-22: tai lieu dai thi gui tung muc thay vi bo qua
            current_content, code_diff[:MAX_DIFF_CHARS], file_path, language
        )

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