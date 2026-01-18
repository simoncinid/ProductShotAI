from app.schemas import CreditPack

# Credit pack definitions
CREDIT_PACKS = {
    "starter": CreditPack(
        id="starter",
        name="Starter",
        credits=5,
        price_per_credit=0.99,
        total_price=4.95
    ),
    "standard": CreditPack(
        id="standard",
        name="Standard",
        credits=15,
        price_per_credit=0.89,
        total_price=13.35
    ),
    "pro": CreditPack(
        id="pro",
        name="Pro",
        credits=40,
        price_per_credit=0.79,
        total_price=31.60
    ),
    "power": CreditPack(
        id="power",
        name="Power",
        credits=100,
        price_per_credit=0.69,
        total_price=69.00
    )
}


def get_credit_pack(pack_id: str) -> CreditPack:
    """Get credit pack by ID"""
    if pack_id not in CREDIT_PACKS:
        raise ValueError(f"Invalid pack_id: {pack_id}")
    return CREDIT_PACKS[pack_id]


def get_all_credit_packs() -> list[CreditPack]:
    """Get all available credit packs"""
    return list(CREDIT_PACKS.values())
