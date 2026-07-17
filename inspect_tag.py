import time
from smartcard.System import readers
from smartcard.util import toHexString
from smartcard.Exceptions import NoCardException

available_readers = readers()

if not available_readers:
    raise RuntimeError("No NFC reader found.")

reader = available_readers[0]
print(f"Using reader: {reader}")
print("Place the round NFC tag flat on the center of the reader...")

connection = reader.createConnection()

while True:
    try:
        connection.connect()
        break
    except NoCardException:
        time.sleep(0.5)

print("Tag detected.")

for page in range(0, 16):
    command = [0xFF, 0xB0, 0x00, page, 0x04]
    data, sw1, sw2 = connection.transmit(command)

    if (sw1, sw2) == (0x90, 0x00):
        print(f"Page {page:02d}: {toHexString(data)}")
    else:
        print(f"Page {page:02d}: read failed — {sw1:02X} {sw2:02X}")
        break
