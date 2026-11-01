import re
from dataclasses import dataclass

HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$")


@dataclass
class DocChunk:
    heading: str
    content: str
    start_line: int


def chunk_markdown(text: str) -> list[DocChunk]:
    """Chia tai lieu Markdown thanh cac doan theo heading."""
    chunks: list[DocChunk] = []
    heading = "(intro)"
    buf: list[str] = []
    start = 1
    in_code = False

    def flush():
        body = "\n".join(buf).strip()
        if body:
            chunks.append(DocChunk(heading=heading, content=body, start_line=start))

    for i, line in enumerate(text.splitlines(), start=1):
        if line.strip().startswith("```"):
            in_code = not in_code
        match = None if in_code else HEADING_RE.match(line)
        if match:
            flush()
            heading = match.group(2).strip()
            buf = [line]
            start = i
        else:
            buf.append(line)

    flush()
    return chunks


def split_identifier(name: str) -> list[str]:
    """createUser -> ['create', 'user']"""
    parts = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", name).replace("_", " ").split()
    return [p.lower() for p in parts if len(p) > 1]


def find_relevant_chunks(
    chunks: list[DocChunk], entity_name: str, top_k: int = 3
) -> list[tuple[DocChunk, float]]:
    """Tim cac doan tai lieu lien quan den mot ham/class (chua dung embedding)."""
    exact = entity_name.lower()
    words = split_identifier(entity_name)
    scored: list[tuple[DocChunk, float]] = []

    for chunk in chunks:
        haystack = f"{chunk.heading}\n{chunk.content}".lower()
        score = 3.0 if exact in haystack else 0.0
        score += sum(1.0 for w in words if w in haystack)
        if score > 0:
            scored.append((chunk, score))

    scored.sort(key=lambda item: item[1], reverse=True)
    return scored[:top_k]