import logging
import os

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
DEFAULT_MODELS = ["gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash"]
DEFAULT_TIMEOUT_SECONDS = 15


def is_llm_available() -> bool:
    return bool(os.getenv("GEMINI_API_KEY"))


def _models() -> list[str]:
    raw = os.getenv("GEMINI_MODELS") or os.getenv("GEMINI_MODEL") or ""
    models = [m.strip() for m in raw.split(",") if m.strip()]
    return models or DEFAULT_MODELS


def ask_llm(prompt: str) -> str | None:
    """Thu lan luot cac model Gemini. Tra ve None neu khong co key hoac tat ca deu loi."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        from google.genai import types

        timeout_s = float(os.getenv("GEMINI_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS))
        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=int(timeout_s * 1000),
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        )
    except Exception as exc:
        logger.warning("Cannot create Gemini client: %s", exc)
        return None

    for model in _models():
        try:
            response = client.models.generate_content(model=model, contents=prompt)
            if response.text:
                return response.text
        except Exception as exc:
            logger.warning("Gemini model %s failed: %s", model, exc)
    return None