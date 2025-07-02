"""
app/config.py
Central configuration + helper functions for TutorWise‑Spaces
"""
from __future__ import annotations

import os, asyncio, base64, mimetypes
from pathlib import Path
from typing import List, Tuple, Optional
from dotenv import load_dotenv
import httpx
from dotenv import load_dotenv
from passlib.context import CryptContext

# ─── 1. ENV & CONSTANTS ────────────────────────────────────────────────
load_dotenv()  # read .env

GOOGLE_API_KEY: str | None = 'AIzaSyA2YW2sLt5R2PhT86hc69LR37eY1DHwWTo'
if not GOOGLE_API_KEY:
    raise RuntimeError("Environment variable GOOGLE_API_KEY missing")

BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

# text models
EMBED_MODEL = "text-embedding-004"
EMBED_DIM = 768
LLM_MODEL = "gemini-2.0-flash-lite"

# multimodal models
IMAGE_MODEL = "gemma-3-12b-it"
VIDEO_MODEL = "gemma-3-12b-it"

# ─── 2. PASSWORD HASHING ───────────────────────────────────────────────
_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(raw: str) -> str:
    return _pwd_ctx.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    return _pwd_ctx.verify(raw, hashed)


# ─── 3. SINGLETON ASYNC HTTP CLIENT ────────────────────────────────────
_client: Optional[httpx.AsyncClient] = None


def get_http_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=BASE_URL,
            headers={
                "x-goog-api-key": GOOGLE_API_KEY,
                "Content-Type": "application/json",
            },
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_connections=50, max_keepalive_connections=20),
        )
    return _client


# ─── 4. TEXT EMBEDDING & CHAT ──────────────────────────────────────────
async def embed_text(text: str) -> List[float]:
    """Return a 768‑dimensional embedding for *text*."""
    payload = {
        "model": f"models/{EMBED_MODEL}",
        "content": {"parts": [{"text": text}]},
        "task_type": "retrieval_document",
        "output_dimensionality": EMBED_DIM,
    }
    client = get_http_client()
    r = await client.post(f"/models/{EMBED_MODEL}:embedContent", json=payload)
    r.raise_for_status()
    return r.json()["embedding"]["values"]


async def llm_chat(
    prompt: str,
    *,
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> str:
    """Lightweight chat wrapper around Gemini flash‑lite."""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "max_output_tokens": max_tokens},
    }
    client = get_http_client()
    r = await client.post(f"/models/{LLM_MODEL}:generateContent", json=payload)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()


# ─── 5. MULTIMODAL HELPERS ─────────────────────────────────────────────
async def caption_image(
    image_path: str,
    prompt: str = "Describe this image.",
) -> str:
    """Get a caption/description for *image_path* using Gemini Flash 2.5."""
    data_b64 = base64.b64encode(Path(image_path).read_bytes()).decode()
    mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"

    payload = {
        "contents": [
            {
                "parts": [
                    {"inline_data": {"mime_type": mime_type, "data": data_b64}},
                    {"text": prompt},
                ]
            }
        ]
    }

    client = get_http_client()
    r = await client.post(f"/models/{IMAGE_MODEL}:generateContent", json=payload)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()


# ------- internal: resumable upload to Google --------------------------
async def _gemini_resumable_upload(file_path: str) -> Tuple[str, str]:
    """Upload *file_path* and return (file_uri, mime_type)."""
    mime_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
    size = os.path.getsize(file_path)

    start_headers = {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": str(size),
        "X-Goog-Upload-Header-Content-Type": mime_type,
        "Content-Type": "application/json",
    }
    payload = {"file": {"display_name": Path(file_path).name}}

    client = get_http_client()
    start = await client.post("/upload/v1beta/files", headers=start_headers, json=payload)
    start.raise_for_status()

    upload_url = start.headers.get("X-Goog-Upload-URL")
    if not upload_url:
        raise RuntimeError("Google API did not return X-Goog-Upload-URL header")

    with open(file_path, "rb") as fh:
        data = fh.read()

    fin_headers = {
        "Content-Length": str(size),
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
        "Content-Type": mime_type,
    }
    final = await client.post(upload_url, headers=fin_headers, content=data)
    final.raise_for_status()
    file_uri = final.json()["file"]["uri"]
    return file_uri, mime_type


async def summarize_video(
    video_path: str,
    prompt: str | None = None,
) -> str:
    """
    Upload a video and ask Gemini to summarise it + generate a quiz.

    Returns the generated text.
    """
    if prompt is None:
        prompt = (
            "Summarize this video. Then create a quiz with an answer key based on "
            "the information in this video."
        )

    file_uri, mime_type = await _gemini_resumable_upload(video_path)

    payload = {
        "contents": [
            {
                "parts": [
                    {"file_data": {"mime_type": mime_type, "file_uri": file_uri}},
                    {"text": prompt},
                ]
            }
        ]
    }

    client = get_http_client()
    r = await client.post(f"/models/{VIDEO_MODEL}:generateContent", json=payload)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
