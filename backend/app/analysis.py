"""
Analisi stile da immagini di riferimento (brand identity o product).
Accetta fino a 3 URL immagine e restituisce un testo descrittivo (composizione, illuminazione, palette, ecc.).
Se OPENAI_API_KEY è impostato, usa OpenAI Vision; altrimenti restituisce un placeholder.
"""
import os
import httpx
from typing import List
import logging

logger = logging.getLogger(__name__)

# Placeholder quando non c'è API vision configurata
PLACEHOLDER_ANALYSIS = """Style analysis (placeholder — set OPENAI_API_KEY for automatic analysis):
- Composition: product-focused, centered framing
- Lighting: soft, diffused
- Color mood: neutral to warm
- Props: minimal
- Style: clean, professional product photography"""


async def analyze_reference_images(image_urls: List[str]) -> str:
    """
    Analizza fino a 3 immagini e restituisce una descrizione testuale dello stile.
    image_urls: lista di URL pubblici (max 3).
    """
    if not image_urls or len(image_urls) > 3:
        return ""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        logger.info("OPENAI_API_KEY not set; using placeholder analysis")
        return PLACEHOLDER_ANALYSIS

    # OpenAI Vision: image_url può essere URL pubblico o base64
    content = [
        {
            "type": "text",
            "text": "Describe the visual style of these product/brand reference images in a concise way. Include: composition and camera angle, background type, lighting characteristics, color mood/palette, props usage, realism vs CGI, product placement. Use short paragraphs or bullet-like lines. Output plain text only.",
        }
    ]
    for url in image_urls[:3]:
        if url.startswith("http://") or url.startswith("https://"):
            content.append({"type": "image_url", "image_url": {"url": url}})
        else:
            continue

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": content}],
                    "max_tokens": 500,
                },
            )
            r.raise_for_status()
            data = r.json()
            text = (data.get("choices") or [{}])[0].get("message", {}).get("content", "")
            return text.strip() if text else PLACEHOLDER_ANALYSIS
    except Exception as e:
        logger.warning("OpenAI vision analysis failed: %s", e)
        return PLACEHOLDER_ANALYSIS
