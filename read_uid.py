from smartcard.System import readers
from smartcard.util import toHexString

available_readers = readers()

if not available_readers:
    raise RuntimeError("No smart-card reader found.")

reader = available_readers[0]
print(f"Using reader: {reader}")
print("Place a card or NFC tag on the reader...")

connection = reader.createConnection()
connection.connect()

# ACR122U pseudo-APDU for reading the card/tag UID.
command = [0xFF, 0xCA, 0x00, 0x00, 0x00]
data, sw1, sw2 = connection.transmit(command)

if (sw1, sw2) == (0x90, 0x00):
    print("UID:", toHexString(data).replace(" ", ""))
else:
    print(f"Could not read UID. Status: {sw1:02X} {sw2:02X}")
