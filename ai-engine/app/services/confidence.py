import re

from app.services.doc_chunker import chunk_markdown

MIN_SCORE = 0.05
MAX_SCORE = 0.95
WEIGHTS = {
    "grounding": 0.35,
    "retention": 0.25,
    "coverage": 0.20,
    "consistency": 0.20,
}
HEADING_RE = re.compile(r"^#{1,6}\s+(.*)$", re.MULTILINE)


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lstrip("#").strip().lower())


def _lines(text: str) -> list[str]:
    return [ln.strip() for ln in (text or "").splitlines() if ln.strip()]


def doc_headings(document: str) -> set[str]:
    return {_norm(h) for h in HEADING_RE.findall(document)}


def grounding_score(drift, headings: set[str]) -> float:
    """Cac cho lech ma LLM bao co tro toi muc co that trong tai lieu khong."""
    if not drift.findings:
        return 1.0 if not drift.drift_detected else 0.3
    ok = sum(1 for f in drift.findings if _norm(f.section) in headings)
    return ok / len(drift.findings)


def retention_score(current_content: str, updated_content: str) -> float:
    """Ti le dong tai lieu goc con duoc giu nguyen sau khi sua."""
    original = _lines(current_content)
    if not original:
        return 1.0
    kept = set(_lines(updated_content))
    return sum(1 for ln in original if ln in kept) / len(original)


def coverage_score(document: str, names: list[str]) -> float:
    """Ti le ham/class bi doi trong diff ma tai lieu co nhac toi."""
    if not names:
        return 0.5
    low = document.lower()
    return sum(1 for n in names if n.lower() in low) / len(names)


def consistency_score(drift, current_content: str) -> float:
    """Ket luan co khop voi noi dung khong."""
    unchanged = _lines(drift.updated_content) == _lines(current_content)
    if drift.drift_detected:
        return 1.0 if (drift.findings and not unchanged) else 0.2
    return 1.0 if unchanged else 0.3


def compute_confidence(current_content: str, drift, names: list[str]) -> float:
    score = (
        WEIGHTS["grounding"] * grounding_score(drift, doc_headings(current_content))
        + WEIGHTS["retention"] * retention_score(current_content, drift.updated_content)
        + WEIGHTS["coverage"] * coverage_score(current_content, names)
        + WEIGHTS["consistency"] * consistency_score(drift, current_content)
    )
    return round(min(max(score, MIN_SCORE), MAX_SCORE), 2)


def evidence_entities(findings: list, names: list[str], limit: int = 50) -> list[str]:
    """Ten ham/class trong code lam bang chung cho tung cho lech."""
    entities: list[str] = []
    for f in findings:
        text = f"{f.section} {f.issue} {f.suggestion}".lower()
        matched = [n for n in names if n.lower() in text]
        for entity in matched or [f.section or "Code changes"]:
            if entity not in entities:
                entities.append(entity)
    return (entities or ["Code changes"])[:limit]


def _shorten(text: str, limit: int = 200) -> str:
    flat = re.sub(r"\s+", " ", text).strip()
    return flat if len(flat) <= limit else flat[: limit - 3].rstrip() + "..."


def _doc_excerpt(document: str, section: str) -> str:
    """Doan tai lieu (khong tinh dong heading) cua muc bi bao lech."""
    for chunk in chunk_markdown(document):
        if _norm(chunk.heading) == _norm(section):
            body = chunk.content.split("\n", 1)
            text = body[1] if len(body) > 1 and body[0].lstrip().startswith("#") else chunk.content
            return _shorten(text)
    return ""


def _diff_line(code_diff: str, entity: str) -> str:
    """Dong code trong diff nhac toi ham/class bi doi (uu tien dong them vao)."""
    if not entity:
        return ""
    for marker in ("+", "-"):
        for line in code_diff.splitlines():
            if line.startswith(marker) and not line.startswith(marker * 3):
                if entity.lower() in line.lower():
                    return _shorten(f"{marker} {line[1:].strip()}")
    return ""


def extract_evidence(
    document: str, code_diff: str, findings: list, names: list[str], limit: int = 5
) -> list[dict]:
    """Trich dan bang chung: doan tai lieu bi lech va dong code gay ra lech."""
    proofs: list[dict] = []
    for f in findings[:limit]:
        text = f"{f.section} {f.issue} {f.suggestion}".lower()
        entity = next((n for n in names if n.lower() in text), "")
        proofs.append(
            {
                "section": f.section,
                "entity": entity,
                "doc_excerpt": _doc_excerpt(document, f.section),
                "code_excerpt": _diff_line(code_diff, entity),
            }
        )
    return proofs


def format_evidence(proofs: list[dict]) -> str:
    lines: list[str] = []
    for p in proofs:
        parts = []
        if p["doc_excerpt"]:
            parts.append(f'Doc: "{p["doc_excerpt"]}"')
        if p["code_excerpt"]:
            parts.append(f'Code: `{p["code_excerpt"]}`')
        if parts:
            lines.append(f"- **{p['section'] or 'General'}** - " + "; ".join(parts))
    if not lines:
        return ""
    return "\n\n### Evidence\n" + "\n".join(lines)