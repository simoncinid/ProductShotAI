"""
Modifica un prompt con istruzioni utente via OpenAI.
Input: original_prompt, edit_instructions → output: edited_prompt (solo testo).
"""
import os
import httpx
import logging

logger = logging.getLogger(__name__)

SYSTEM = """You are a prompt editor for product/image generation. You will receive:
1. The current prompt (text used for AI image generation).
2. The user's edit instructions (how they want to change the prompt).

Your task: output ONLY the revised prompt text. No explanation, no preamble, no quotes. Just the new prompt, ready to be used as-is. Keep the same language as the original unless the user asks to change it. Preserve detail and quality."""


async def edit_prompt(original_prompt: str, edit_instructions: str) -> str:
    """
    Chiama OpenAI per modificare il prompt secondo le istruzioni.
    Se OPENAI_API_KEY non è impostata o la chiamata fallisce, restituisce original_prompt invariato.
    """
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.info("OPENAI_API_KEY not set; returning original prompt unchanged")
        return original_prompt

    user_content = f"""Current prompt:
{original_prompt}

User's edit instructions:
{edit_instructions}

Output only the revised prompt (no other text):"""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": SYSTEM},
                        {"role": "user", "content": user_content},
                    ],
                    "max_tokens": 1500,
                },
            )
            r.raise_for_status()
            data = r.json()
            content = (data.get("choices") or [{}])[0].get("message", {}).get("content", "")
            content = content.strip().strip('"').strip("'")
            return content if content else original_prompt
    except Exception as e:
        logger.warning("OpenAI prompt edit failed: %s", e)
        return original_prompt
