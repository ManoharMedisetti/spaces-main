from pathlib import Path
from uuid import UUID
import shutil
import os

UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def save_upload(upload_file, content_id: UUID) -> Path:
    """
    Save *upload_file* to disk preserving its extension.
    Returns the absolute path.
    """
    _, ext = os.path.splitext(upload_file.filename)
    ext = ext.lower()
    if not ext:
        # basic safeguard – you can allow no‑ext if you add a default
        raise ValueError("File must have an extension")

    dest = UPLOAD_DIR / f"{content_id}{ext}"
    with dest.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return dest
