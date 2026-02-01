"""
Genera N prompt dettagliati in inglese per un product shooting via OpenAI.
Usa: product (name, product_prompt, analysis_text), brand identity (opzionale), shooting_style, count.
"""
import os
import json
import httpx
from typing import List, Optional, Any
import logging

logger = logging.getLogger(__name__)

DEFAULT_PROMPTS = [
    "Professional product photo on clean white background, soft diffused lighting, subtle shadow, high detail, 8K.",
    "Same product in lifestyle context, natural setting, warm lighting, aspirational mood, professional quality.",
]


def _build_system_prompt(
    product_name: str,
    product_prompt: str,
    product_analysis: Optional[str],
    brand_snapshot: Optional[dict],
    shooting_style: str,
    count: int,
) -> str:
    parts = [
        "You are an expert product photography director. Generate exactly {count} detailed image-generation prompts in English for an AI image editor (e.g. WaveSpeed).",
        "Each prompt must be self-contained, specific, and describe: scene/setting, lighting, composition, style, and any text or details to include.",
        "Output ONLY a JSON array of {count} strings, no other text. Example: [\"First prompt...\", \"Second prompt...\"]",
        "",
        "Product name: {product_name}",
        "Product photography brief: {product_prompt}",
    ]
    if product_analysis:
        parts.append("Product reference style (keep consistent): {product_analysis}")
    if brand_snapshot:
        bi_lines = [f"{k}: {v}" for k, v in (brand_snapshot or {}).items() if v]
        if bi_lines:
            parts.append("Brand identity (align visuals): " + "; ".join(bi_lines))
    parts.append("Shooting style requested by user: {shooting_style}")
    return "\n".join(parts).format(
        count=count,
        product_name=product_name,
        product_prompt=product_prompt,
        product_analysis=product_analysis or "",
        shooting_style=shooting_style,
    )


async def generate_shooting_prompts(
    product_name: str,
    product_prompt: str,
    product_analysis: Optional[str] = None,
    brand_identity_snapshot: Optional[dict] = None,
    shooting_style: str = "Mix: studio, detail zooms, lifestyle",
    count: int = 4,
) -> List[str]:
    """
    Generate `count` prompts in English (2–10) via OpenAI. If API unavailable returns default prompts.
    """
    if count < 2 or count > 10:
        count = min(4, max(2, count))
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.info("OPENAI_API_KEY not set; using default shooting prompts")
        return DEFAULT_PROMPTS * ((count // len(DEFAULT_PROMPTS)) + 1)[:count]

    system = _build_system_prompt(
        product_name=product_name,
        product_prompt=product_prompt,
        product_analysis=product_analysis,
        brand_snapshot=brand_identity_snapshot,
        shooting_style=shooting_style,
        count=count,
    )
    user = (
        f"Generate exactly {count} prompts for a product photoshoot. "
        "Each prompt must be in English, very detailed (lighting, background, composition, style). "
        f"Return only a JSON array of {count} strings."
    )

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "max_tokens": 2000,
                },
            )
            r.raise_for_status()
            data = r.json()
            content = (data.get("choices") or [{}])[0].get("message", {}).get("content", "")
            content = content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            parsed = json.loads(content)
            if isinstance(parsed, list) and all(isinstance(x, str) for x in parsed):
                return parsed[:count]
            return DEFAULT_PROMPTS[:count]
    except Exception as e:
        logger.warning("OpenAI shooting prompts failed: %s", e)
        return (DEFAULT_PROMPTS * ((count // len(DEFAULT_PROMPTS)) + 1))[:count]
