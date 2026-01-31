"""
Composizione del prompt finale per la generazione: base + product + brand identity + constraints.
"""
from typing import Optional, Any


def _block(title: str, content: str) -> str:
    if not content or not content.strip():
        return ""
    return f"\n\n--- {title} ---\n{content.strip()}"


def compose_final_prompt(
    user_prompt_input: Optional[str] = None,
    product_prompt: Optional[str] = None,
    product_analysis_text: Optional[str] = None,
    brand_identity_snapshot: Optional[dict] = None,
    brand_analysis_text: Optional[str] = None,
    base_prompt: str = "",
) -> str:
    """
    Costruisce il prompt finale concatenando in ordine:
    - base_prompt (testo principale che l'utente ha scritto o che viene da product)
    - user_prompt_input (eventuale testo aggiuntivo utente)
    - product prompt e analysis
    - brand identity (campi + analysis) se apply_brand_identity
    - constraints block
    """
    parts = []
    if base_prompt and base_prompt.strip():
        parts.append(base_prompt.strip())
    if user_prompt_input and user_prompt_input.strip():
        parts.append(user_prompt_input.strip())
    if product_prompt and product_prompt.strip():
        parts.append(_block("Product prompt", product_prompt))
    if product_analysis_text and product_analysis_text.strip():
        parts.append(_block("Product reference style", product_analysis_text))
    if brand_identity_snapshot:
        bi_parts = []
        for key, label in [
            ("average_customer", "Target audience"),
            ("sales_channels", "Sales channels"),
            ("price_range", "Price range"),
            ("lighting_style", "Lighting style"),
            ("photo_style", "Photo style"),
            ("color_palette", "Color palette"),
            ("brand_notes", "Brand notes"),
        ]:
            v = brand_identity_snapshot.get(key)
            if v is not None and str(v).strip():
                if isinstance(v, (list, dict)):
                    bi_parts.append(f"{label}: {v}")
                else:
                    bi_parts.append(f"{label}: {v}")
        if bi_parts:
            parts.append(_block("Brand identity", "\n".join(bi_parts)))
        if brand_analysis_text and brand_analysis_text.strip():
            parts.append(_block("Brand reference style", brand_analysis_text))
    parts.append(
        _block(
            "Constraints",
            "Keep product centered and in focus. Avoid unwanted artifacts, text distortions, or inconsistent lighting. Maintain professional product photography quality.",
        )
    )
    return "\n".join(parts).strip() if parts else base_prompt.strip() or "Professional product photo, clean background, soft lighting."


def brand_identity_to_snapshot(bi: Any) -> Optional[dict]:
    """Estrae un dict snapshot dalla BrandIdentity ORM per salvare in generation."""
    if bi is None:
        return None
    return {
        "average_customer": getattr(bi, "average_customer", None),
        "sales_channels": getattr(bi, "sales_channels", None),
        "price_range": getattr(bi, "price_range", None),
        "lighting_style": getattr(bi, "lighting_style", None),
        "photo_style": getattr(bi, "photo_style", None),
        "color_palette": getattr(bi, "color_palette", None),
        "brand_notes": getattr(bi, "brand_notes", None),
        "analysis_text": getattr(bi, "analysis_text", None),
    }
