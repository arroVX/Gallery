import struct

d = open("rot.jpg", "rb").read()
print("first bytes:", d[:4].hex())
if d[0:2] == b"\xff\xd8":
    i = 2
    while i < len(d):
        if d[i] != 0xFF:
            break
        m = d[i + 1]
        if m in (0xC0, 0xC2):
            h = struct.unpack(">H", d[i + 5:i + 7])[0]
            w = struct.unpack(">H", d[i + 7:i + 9])[0]
            print("jpeg pixels:", w, "x", h)
            break
        ln = struct.unpack(">H", d[i + 2:i + 4])[0]
        i += 2 + ln
