import pytest


@pytest.fixture(autouse=True)
def _no_real_llm(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)