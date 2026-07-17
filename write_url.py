import time
import ndef

from smartcard.System import readers
from smartcard.Exceptions import NoCardException
from smartcard.util import toHexString

URL = "https://pawdex.io/aspen"

available_readers = readers()

if not available_readers:
    raise RuntimeError("No NFC reader found.")

reader = available_readers[0]

print(f"Using reader: {reader}")
print(f"URL to write: {URL}")
print("Place the ROUND NFC sticker on the center of the reader...")

connection = reader.createConnection()

while True:
    try:
        connection.connect()
        break
    except NoCardException:
        time.sleep(0.5)

print("Tag detected.")

# Build a phone-readable NDEF URL record.
record = ndef.UriRecord(URL)
ndef_message = b"".join(ndef.message_encoder([record]))

# Wrap the NDEF message inside an NFC Type 2 NDEF TLV.
if len(ndef_message) > 254:
    raise ValueError("URL record is too large for this simple writer.")

tag_data = bytes([0x03, len(ndef_message)]) + ndef_message + bytes([0xFE])

# Each NTAG page stores four bytes.
while len(tag_data) % 4:
    tag_data += bytes([0x00])

starting_page = 4

print(f"Writing {len(tag_data)} bytes...")

for offset in range(0, len(tag_data), 4):
    page = starting_page + (offset // 4)
    page_data = list(tag_data[offset:offset + 4])

    # ACR122U Update Binary command: write four bytes to one page.
    command = [0xFF, 0xD6, 0x00, page, 0x04] + page_data
    response, sw1, sw2 = connection.transmit(command)

    if (sw1, sw2) != (0x90, 0x00):
        raise RuntimeError(
            f"Write failed on page {page}: {sw1:02X} {sw2:02X}"
        )

    print(f"Page {page:02d} written: {toHexString(page_data)}")

print("Verifying written pages...")

verified_data = bytearray()

for offset in range(0, len(tag_data), 4):
    page = starting_page + (offset // 4)

    command = [0xFF, 0xB0, 0x00, page, 0x04]
    data, sw1, sw2 = connection.transmit(command)

    if (sw1, sw2) != (0x90, 0x00):
        raise RuntimeError(
            f"Verification failed on page {page}: {sw1:02X} {sw2:02X}"
        )

    verified_data.extend(data)

if bytes(verified_data) != tag_data:
    raise RuntimeError("Verification failed: read-back data does not match.")

print()
print("SUCCESS!")
print(f"The NFC sticker now opens: {URL}")
print("The tag remains rewritable and has NOT been permanently locked.")
