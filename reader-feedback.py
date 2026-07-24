#!/usr/bin/env python3

from smartcard.System import readers
from smartcard.scard import (
    SCARD_SHARE_DIRECT,
    SCARD_PROTOCOL_UNDEFINED
)

ESCAPE_CODE = 1107296257

def feedback():
    available = readers()

    if not available:
        return False

    connection = available[0].createConnection()
    connection.connect(
        mode=SCARD_SHARE_DIRECT,
        protocol=SCARD_PROTOCOL_UNDEFINED
    )

    command = [
        0xFF, 0x00, 0x40, 0xF2, 0x04,
        0x02, 0x02, 0x01, 0x01
    ]

    response = connection.control(ESCAPE_CODE, command)
    return response == [144, 0]


if __name__ == "__main__":
    if feedback():
        print("Feedback OK")
    else:
        print("No reader detected")
