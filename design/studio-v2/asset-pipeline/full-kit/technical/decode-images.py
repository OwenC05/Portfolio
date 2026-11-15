"""Independent native Pillow decode evidence. No browser/ImageBitmap/WebGL claim."""
import hashlib
import io
import json
from pathlib import Path
import struct
import sys
import PIL
from PIL import Image


def decode(path):
    data = Path(path).read_bytes()
    json_length = struct.unpack_from('<I', data, 12)[0]
    doc = json.loads(data[20:20 + json_length])
    binary = data[28 + json_length:]
    images = []
    for index, image in enumerate(doc.get('images', [])):
        view = doc['bufferViews'][image['bufferView']]
        offset = view.get('byteOffset', 0)
        payload = binary[offset:offset + view['byteLength']]
        with Image.open(io.BytesIO(payload)) as decoded:
            decoded.load()
            rgba = decoded.convert('RGBA')
            rgba.load()
            images.append({'index': index, 'sha256': hashlib.sha256(payload).hexdigest(),
                           'width': decoded.width, 'height': decoded.height,
                           'mode': decoded.mode, 'rgbaBytes': len(rgba.tobytes())})
    return {'path': str(path), 'glbSha256': hashlib.sha256(data).hexdigest(),
            'decoder': 'Pillow ' + PIL.__version__, 'scope': 'Actual native image decode; not browser decoding or GPU upload',
            'valid': True, 'images': images}


if __name__ == '__main__':
    print(json.dumps([decode(path) for path in sys.argv[1:]], indent=2))
