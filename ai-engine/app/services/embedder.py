import logging
import os

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
DEFAULT_EMBED_MODEL = "gemini-embedding-001"
DEFAULT_TIMEOUT_SECONDS = 8
BATCH_SIZE = 100


def embed_texts(texts: list[str]) -> list[list[float]] | None:
    """Tao embedding bang Gemini. Tra ve None neu khong co key hoac bi loi."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not texts:
        return None
    try:
        from google import genai
        from google.genai import types

        timeout_s = float(
            os.getenv("GEMINI_EMBED_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS)
        )
        client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=int(timeout_s * 1000),
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        )
        model = os.getenv("GEMINI_EMBED_MODEL", DEFAULT_EMBED_MODEL)
        vectors: list[list[float]] = []
        for i in range(0, len(texts), BATCH_SIZE):
            result = client.models.embed_content(
                model=model, contents=texts[i:i + BATCH_SIZE]
            )
            vectors.extend([list(e.values) for e in result.embeddings])
        return vectors
    except Exception as exc:
        logger.warning("Embedding failed: %s", exc)
        return None