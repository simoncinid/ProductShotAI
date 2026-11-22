"""UTC comparisons for databases such as MySQL that return naive DATETIME values."""

from datetime import datetime, timezone


def as_utc(value: datetime) -> datetime:
    # Application timestamps are written in UTC. MySQL does not retain tzinfo.
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)
