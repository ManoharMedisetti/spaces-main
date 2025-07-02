"""
app/media_parser.py
Extract text from PDFs, Office docs, images, and videos for the RAG pipeline.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Callable

import pdfplumber
import pytesseract
from PIL import Image
from docx import Document

from app.services.config import caption_image, summarize_video

# ─── Sync text extractors ──────────────────────────────────────────────
def _pdf(path: str) -> str:
    with pdfplumber.open(path) as pdf:
        return "\n".join(
            page_text.strip()
            for page in pdf.pages
            if (page_text := page.extract_text())
        )


def _docx(path: str) -> str:
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)


def _txt(path: str) -> str:
    return Path(path).read_text(encoding="utf-8", errors="ignore")


def _ocr_fallback(path: str) -> str:
    """Last‑resort OCR using Tesseract if Gemini captioning fails."""
    return pytesseract.image_to_string(Image.open(path))


# ─── Extension maps ───────────────────────────────────────────────────
SYNC_PARSERS: dict[str, Callable[[str], str]] = {
    ".pdf": _pdf,
    ".docx": _docx,
    ".txt": _txt,
}

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".bmp", ".gif"}
VIDEO_EXT = {".mp4", ".mov", ".avi", ".mkv"}

# ─── Main async extractor ----------------------------------------------------
async def extract_text(path: str) -> str:
    """
    Return a best‑effort text representation of *path*.

    Always returns a string—never raises—so the calling code can
    persist something even when extraction fails.
    """
    ext = Path(path).suffix.lower()

    # ----- Video → Gemini summarisation ----------------------------------
    if ext in VIDEO_EXT:
        try:
            return await summarize_video(path)
        except Exception as exc:
            return f"[Video summarization error: {exc}]"

    # ----- Image → Gemini caption, fallback OCR --------------------------
    if ext in IMAGE_EXT:
        try:
            return await caption_image(path)
        except Exception:
            return _ocr_fallback(path)

    # ----- PDF / DOCX / TXT ---------------------------------------------
    parser = SYNC_PARSERS.get(ext)
    if parser:
        try:
            return parser(path)
        except Exception as exc:
            return f"[Extraction error: {exc}]"

    return f"[Unsupported file type: {ext}]"
