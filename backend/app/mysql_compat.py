"""Keep aiomysql's binary parameters compatible with patched PyMySQL 1.2.

PyMySQL 1.2.3 restored the old import name as a string, not a function.
aiomysql still calls it for bytes. Use the new hexadecimal encoder instead;
do not downgrade PyMySQL and lose its security fixes.
"""
from aiomysql import connection
from pymysql.converters import escape_bytes


def configure_binary_escaping() -> None:
    if not callable(connection.escape_bytes_prefixed):
        connection.escape_bytes_prefixed = escape_bytes
