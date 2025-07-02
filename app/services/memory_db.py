import asyncio, datetime
from typing import List, Tuple
import chromadb
from app.services.config import embed_text


class MemoryDB:
    def __init__(self, path: str = "db_chroma") -> None:
        # PersistentClient → embedded DuckDB backend
        self.client = chromadb.PersistentClient(path=path)
        self.col = self.client.get_or_create_collection(
            name="user_memories", metadata={"hnsw:space": "cosine"}
        )

    # ── internal helper ─────────────────────────────────────────────
    @staticmethod
    def _doc_id(user_id: str, type_: str, subtype: str) -> str:
        """Return deterministic ID so re‑inserts overwrite."""
        return f"{user_id}:{type_}:{subtype}"

    # ── public API ──────────────────────────────────────────────────
    async def upsert(
        self,
        *,
        user_id: str,
        text: str,
        type_: str,
        subtype: str,
        visibility: str = "owner",
        score_boost: float = 1.0,
    ) -> None:
        """Store or update a memory chunk with its embedding."""
        emb = await embed_text(text)
        doc_id = self._doc_id(user_id, type_, subtype)
        meta = {
            "user_id": user_id,
            "type": type_,
            "subtype": subtype,
            "visibility": visibility,
            "ts": datetime.datetime.utcnow().isoformat(),
            "score_boost": score_boost,
        }
        # Replace any previous entry with same logical ID
        await asyncio.to_thread(self.col.delete, ids=[doc_id])
        await asyncio.to_thread(
            self.col.add,
            ids=[doc_id],
            embeddings=[emb],
            documents=[text],
            metadatas=[meta],
        )

    async def retrieve(
        self,
        user_id: str,
        query: str,
        k: int = 5,
        allowed: Tuple[str, ...] = ("owner", "public"),
    ) -> List[str]:
        """Return up to *k* memory snippets relevant to *query*."""
        emb = await embed_text(query)
        res = await asyncio.to_thread(
            self.col.query,
            query_embeddings=[emb],
            n_results=k,
            where={
                "$and": [
                    {"user_id": user_id},
                    {"visibility": {"$in": list(allowed)}},
                ]
            },
        )
        docs = res.get("documents")
        return docs[0] if docs else []


# Singleton instance used across the app
memory_db = MemoryDB()