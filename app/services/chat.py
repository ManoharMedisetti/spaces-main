"""
app/chat.py
Space‑scoped conversational helper using MemoryDB + Gemini Flash‑Lite
"""
from __future__ import annotations

from typing import List, Dict

from app.services.memory_db import memory_db
from app.services.config import llm_chat

# ─── Prompt templates ──────────────────────────────────────────────────
SYSTEM_TEMPLATE = """You are TutorWise, an AI tutor that answers user questions \
using only information from the provided context. If the context does \
not contain the answer, say you don't know instead of inventing one."""

CONTEXT_HEADER = "Here are some relevant snippets from your space:\n"
CONTEXT_ITEM = "- {chunk}"

USER_HEADER = "\n\nUser: {message}\nAI:"
# ----------------------------------------------------------------------


async def _build_context(user_id: str, space: str, query: str, k: int = 5) -> List[str]:
    """
    Retrieve *k* most relevant snippets for *query* within a *space*.
    Filters by subtype prefix '<space>/' in MemoryDB.
    """
    # add simple prefix so retrieval is scoped
    scoped_query = f"[{space}] {query}"
    chunks = await memory_db.retrieve(user_id=user_id, query=scoped_query, k=k)
    return chunks


def _assemble_prompt(chunks: List[str], user_msg: str) -> str:
    """
    Combine system message, context chunks, and user message.
    """
    context_text = (
        CONTEXT_HEADER
        + "\n".join(CONTEXT_ITEM.format(chunk=ck) for ck in chunks)
        + "\n"
        if chunks
    else ""
    )
    return f"{SYSTEM_TEMPLATE}\n\n{context_text}{USER_HEADER.format(message=user_msg)}"


# ─── Public helper -----------------------------------------------------------
async def chat(
    user_id: str,
    space: str,
    user_msg: str,
    history: List[Dict[str, str]] | None = None,
    *,
    k: int = 5,
    temperature: float = 0.3,
) -> Dict[str, str]:
    """
    High‑level chat helper.

    Parameters
    ----------
    user_id : str
        Current user.
    space : str
        Space name (folder) to scope retrieval.
    user_msg : str
        The latest user message/question.
    history : List[Dict[str,str]]
        Optional list of past (role, content) dicts to provide short‑term memory.
        Example: [{"role":"user","content":"..."},{"role":"assistant","content":"..."}]
    k : int
        Number of context chunks to retrieve.
    temperature : float
        Sampling temperature for the LLM.

    Returns
    -------
    dict
        {"answer": ..., "context": [...]} – you can remove "context" if not needed.
    """
    # 1️⃣  fetch relevant snippets
    snippets = await _build_context(user_id, space, user_msg, k=k)

    # 2️⃣  build prompt
    prompt = _assemble_prompt(snippets, user_msg)

    # optionally add condensed chat history
    if history:
        history_text = "\n".join(f"{h['role'].capitalize()}: {h['content']}" for h in history[-6:])
        prompt = f"{history_text}\n\n{prompt}"

    # 3️⃣  call Gemini
    answer = await llm_chat(prompt, temperature=temperature)

    # 4️⃣  return
    return {"answer": answer, "context": snippets}
