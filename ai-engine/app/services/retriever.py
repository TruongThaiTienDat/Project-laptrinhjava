import math

from app.services.doc_chunker import DocChunk, find_relevant_chunks, split_identifier
from app.services.embedder import embed_texts

MAX_CHUNKS_EMBEDDED = 60
CHUNK_TEXT_LIMIT = 1500


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def _chunk_text(chunk: DocChunk) -> str:
    return f"{chunk.heading}\n{chunk.content}"[:CHUNK_TEXT_LIMIT]


def _query_text(name: str) -> str:
    words = " ".join(split_identifier(name))
    return f"{name} {words}".strip()


def semantic_search(
    chunks: list[DocChunk], names: list[str], top_k: int = 2
) -> dict[str, list[DocChunk]] | None:
    """Tim theo embedding. Tra ve None neu khong embed duoc."""
    if not chunks or not names:
        return None
    use = chunks[:MAX_CHUNKS_EMBEDDED]
    texts = [_chunk_text(c) for c in use] + [_query_text(n) for n in names]
    vectors = embed_texts(texts)
    if not vectors or len(vectors) != len(texts):
        return None

    chunk_vecs = vectors[:len(use)]
    query_vecs = vectors[len(use):]
    result: dict[str, list[DocChunk]] = {}
    for name, qv in zip(names, query_vecs):
        scored = sorted(
            ((_cosine(qv, cv), c) for c, cv in zip(use, chunk_vecs)),
            key=lambda item: item[0],
            reverse=True,
        )
        result[name] = [c for _, c in scored[:top_k]]
    return result


def retrieve_chunks(
    chunks: list[DocChunk], names: list[str], top_k: int = 2
) -> list[DocChunk]:
    """Ket hop tim theo tu khoa va embedding. Embedding loi thi chi dung tu khoa."""
    semantic = semantic_search(chunks, names, top_k)
    picked: dict[int, DocChunk] = {}
    for name in names:
        for chunk, _score in find_relevant_chunks(chunks, name, top_k=top_k):
            picked[chunk.start_line] = chunk
        if semantic:
            for chunk in semantic.get(name, []):
                picked[chunk.start_line] = chunk
    return [picked[k] for k in sorted(picked)]