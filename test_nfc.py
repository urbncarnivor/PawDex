import nfc

def on_connect(tag):
    print("Tag detected!")
    print(tag)
    return True

with nfc.ContactlessFrontend("usb") as clf:
    print("Waiting for NFC tag...")
    clf.connect(rdwr={"on-connect": on_connect})
