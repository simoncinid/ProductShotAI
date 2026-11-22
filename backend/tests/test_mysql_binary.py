"""Binary uploads must work with the current security-patched PyMySQL."""
from aiomysql.connection import Connection

from app.mysql_compat import configure_binary_escaping


def test_all_byte_values_are_encoded_as_safe_hex_literals():
    configure_binary_escaping()
    payload = bytes(range(256))
    encoded = Connection().escape(payload)
    assert encoded == "_binary X'" + payload.hex() + "'"


def test_binary_encoder_preserves_quotes_backslashes_and_nulls():
    configure_binary_escaping()
    payload = b"\x00'\\\xff\n\r\x1a"
    encoded = Connection().escape(payload)
    assert bytes.fromhex(encoded.removeprefix("_binary X'").removesuffix("'")) == payload
