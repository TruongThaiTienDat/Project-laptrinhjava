import pytest

from app.services import retriever
from app.services.doc_chunker import chunk_markdown
from app.services.embedder import embed_texts

DOC = """# API

## createUser
Tao nguoi dung moi.

## deleteUser
Xoa nguoi dung.

## exportReport
Xuat bao cao ra file.
"""


def test_cosine():
    assert retriever._cosine([1, 0], [1, 0]) == pytest.approx(1.0)
    assert retriever._cosine([1, 0], [0, 1]) == pytest.approx(0.0)
    assert retriever._cosine([0, 0], [1, 0]) == 0.0


def test_embed_texts_returns_none_without_key():
    assert embed_texts(["xin chao"]) is None


def test_fallback_to_keyword_when_embedding_unavailable(monkeypatch):
    monkeypatch.setattr(retriever, "embed_texts", lambda texts: None)
    chunks = chunk_markdown(DOC)
    headings = [c.heading for c in retriever.retrieve_chunks(chunks, ["createUser"])]
    assert "createUser" in headings


def test_semantic_search_finds_chunk_without_shared_keyword(monkeypatch):
    def fake_embed(texts):
        out = []
        for t in texts:
            if "Xuat bao cao" in t or t.startswith("generateSummary"):
                out.append([0.0, 0.0, 1.0])
            elif "Tao nguoi dung" in t:
                out.append([1.0, 0.0, 0.0])
            elif "Xoa" in t:
                out.append([0.0, 1.0, 0.0])
            else:
                out.append([0.1, 0.1, 0.1])
        return out

    monkeypatch.setattr(retriever, "embed_texts", fake_embed)
    chunks = chunk_markdown(DOC)
    found = retriever.retrieve_chunks(chunks, ["generateSummary"], top_k=1)
    assert [c.heading for c in found] == ["exportReport"]