from app.services.llm_client import _models, ask_llm, is_llm_available


def test_no_api_key_returns_none(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    assert is_llm_available() is False
    assert ask_llm("hello") is None


def test_models_list_parsing(monkeypatch):
    monkeypatch.setenv("GEMINI_MODELS", "a, b ,c")
    assert _models() == ["a", "b", "c"]