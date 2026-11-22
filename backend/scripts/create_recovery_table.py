"""Create only the additive recovery table using the configured database.
Run from backend: python scripts/create_recovery_table.py
"""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.database import engine
from app.models import RecoveryInvitation

async def main():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda sync: RecoveryInvitation.__table__.create(sync, checkfirst=True))
        print('Recovery invitation table ready.')
    finally:
        await engine.dispose()

if __name__ == '__main__':
    asyncio.run(main())
