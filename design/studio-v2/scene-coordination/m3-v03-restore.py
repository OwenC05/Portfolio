"""One-shot, exact M3 v02 raw -> v03 byte restoration; no Blender or source edit.

Authority: m3-v02-raw-root-disposition.md / msg_b489404fc151.
Run: python -I design/studio-v2/scene-coordination/m3-v03-restore.py
All input/layout/value/delta checks precede exclusive creation of either output.
This writer's receipt is not independent review or appearance acceptance.
"""
import hashlib
import json
import struct
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent / 'asset-pipeline' / 'full-kit'
PARENT = KIT / 'exports/studio-full-kit-m2-proposal-v05.glb'
RAW = KIT / 'exports/studio-full-kit-m3-proposal-v02.raw-export.glb'
OUTPUT = KIT / 'exports/studio-full-kit-m3-proposal-v03.glb'
RECEIPT = KIT / 'manifests/m3-v03-restoration-receipt.json'
PARENT_SHA = '4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735'
RAW_SHA = '71b39b5c242278408092d3ee95ab4e996df47014eb30ef57383b88f3e526fd18'
# vertex, component, parent BIN offset, raw BIN offset, raw file offset, raw hex, parent hex
WORDS = (
    (197, 1, 411436, 411384, 487532, 'dec4203f', 'ddc4203f'),
    (199, 0, 411448, 411396, 487544, '5d8f72bf', '5b8f72bf'),
    (258, 0, 411920, 411868, 488016, '21858b3e', '20858b3e'),
    (274, 1, 412052, 412000, 488148, '3789213f', '3689213f'),
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def split(data):
    require(struct.unpack_from('<4sII', data) == (b'glTF', 2, len(data)), 'GLB header')
    length, kind = struct.unpack_from('<I4s', data, 12)
    require(kind == b'JSON' and length % 4 == 0, 'JSON chunk')
    binary_length, kind = struct.unpack_from('<I4s', data, 20 + length)
    start = 28 + length
    require(kind == b'BIN\x00' and start + binary_length == len(data), 'BIN chunk/layout')
    return json.loads(data[20:20 + length]), start


def layout(doc, expected_bin_offset):
    matches = [(index, mesh) for index, mesh in enumerate(doc['meshes'])
               if mesh.get('name') == 'desk_top__top_mesh.002']
    require(len(matches) == 1, 'unique named desk mesh')
    index, mesh = matches[0]
    users = [node for node in doc['nodes'] if node.get('mesh') == index]
    require(len(users) == 1 and users[0]['name'] == 'desk_top__top', 'unique desk node identity')
    require(len(mesh['primitives']) == 1, 'single desk primitive')
    require(mesh['primitives'][0]['attributes']['TEXCOORD_0'] == 64, 'desk UV accessor identity')
    owners = [(m['name'], attribute) for m in doc['meshes'] for primitive in m['primitives']
              for attribute, accessor in primitive['attributes'].items() if accessor == 64]
    require(owners == [('desk_top__top_mesh.002', 'TEXCOORD_0')], 'unique accessor owner')
    accessor = doc['accessors'][64]
    require(accessor == {'bufferView': 67, 'componentType': 5126, 'count': 292, 'type': 'VEC2'},
            'exact float32 VEC2 accessor layout')
    view = doc['bufferViews'][67]
    require(view == {'buffer': 0, 'byteLength': 2336, 'byteOffset': expected_bin_offset, 'target': 34962},
            'exact packed UV view layout')
    return view['byteOffset'], 8, accessor['count']


def restore(parent, raw):
    require(sha(parent) == PARENT_SHA and sha(raw) == RAW_SHA, 'complete input hashes')
    pd, pstart = split(parent)
    rd, rstart = split(raw)
    require((pstart, rstart) == (72260, 76148), 'pinned chunk starts')
    pbase, pstride, count = layout(pd, 409856)
    rbase, rstride, _ = layout(rd, 409804)
    output = bytearray(raw)
    rows, expected_changes = [], []
    for vertex, component, pbin, rbin, rfile, raw_hex, parent_hex in WORDS:
        require(0 <= vertex < count and component in (0, 1), 'word coordinates')
        require(pbase + vertex * pstride + component * 4 == pbin, 'derived parent BIN offset')
        require(rbase + vertex * rstride + component * 4 == rbin, 'derived raw BIN offset')
        require(rstart + rbin == rfile, 'derived raw file offset')
        before = raw[rfile:rfile + 4]
        replacement = parent[pstart + pbin:pstart + pbin + 4]
        require(before.hex() == raw_hex and replacement.hex() == parent_hex, 'exact word input/output bytes')
        output[rfile:rfile + 4] = replacement
        changed = [rfile + k for k in range(4) if before[k] != replacement[k]]
        expected_changes.extend(changed)
        rows.append({'mesh': 'desk_top__top_mesh.002', 'attribute': 'TEXCOORD_0', 'accessor': 64,
                     'vertex': vertex, 'component': component, 'parentBinOffset': pbin,
                     'parentFileOffset': pstart + pbin, 'rawBinOffset': rbin, 'rawFileOffset': rfile,
                     'rawHex': raw_hex, 'outputHex': parent_hex, 'changedFileByteOffsets': changed})
    output = bytes(output)
    changes = [i for i, (before, after) in enumerate(zip(raw, output)) if before != after]
    require(len(output) == len(raw) and changes == sorted(expected_changes), 'exact whole-file delta')
    require(output[:rstart] == raw[:rstart], 'header and JSON preserved')
    require(output[rstart + rbase:rstart + rbase + 2336] == parent[pstart + pbase:pstart + pbase + 2336],
            'complete retained desk UV accessor equality')
    return output, rows, changes


def main():
    for path in (OUTPUT, RECEIPT):
        require(not path.exists(), 'Refusing overwrite: ' + str(path))
    provenance = {
        'source/build_fullkit_m3.py': 'dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209',
        'source/fk-30-nearfield-proposal-v02.blend': '46c52922f77ca1b78546450b5ef43ec3fdcc2ee6e67082070ccd48b63c25d4cd',
        'manifests/m3-v02-author-measurements.json': 'd10621b30ea6f6ceace4c46e03e04ceba7eec8e36b5f58772670f5785b9c654f',
    }
    for name, expected in provenance.items():
        require(sha((KIT / name).read_bytes()) == expected, 'preserved provenance: ' + name)
    parent, raw = PARENT.read_bytes(), RAW.read_bytes()
    output, rows, changes = restore(parent, raw)
    receipt = {
        'scope': 'Exact root-approved restoration for this raw/parent pair; writer receipt, not independent acceptance.',
        'authority': 'scene-coordination/m3-v02-raw-root-disposition.md / msg_b489404fc151',
        'restorer': str(Path(__file__).relative_to(HERE.parent)).replace('\\', '/'),
        'restorerSha256': sha(Path(__file__).read_bytes()),
        'inputs': {'parent': {'sha256': PARENT_SHA, 'bytes': len(parent)},
                   'raw': {'sha256': RAW_SHA, 'bytes': len(raw)}},
        'preservedEditableProvenance': provenance,
        'output': {'path': str(OUTPUT.relative_to(KIT)).replace('\\', '/'), 'sha256': sha(output), 'bytes': len(output)},
        'restoredWordSlots': rows, 'addressedWordCount': len(rows), 'addressedByteSlots': len(rows) * 4,
        'actuallyChangedByteCount': len(changes), 'changedFileByteOffsets': changes,
        'headerJsonAndAllOtherBytesIdenticalToRaw': True,
        'embeddedBuildTags': 'v02 preserved verbatim; v03 is the separate canonical byte-restoration result',
        'candidateRetainedParentFullAudit': 'Separate assembled audit and root independent technical review required.',
    }
    receipt_bytes = (json.dumps(receipt, indent=2) + '\n').encode('utf-8')
    with OUTPUT.open('xb') as target:
        target.write(output)
    with RECEIPT.open('xb') as target:
        target.write(receipt_bytes)
    print(json.dumps({'output': receipt['output'], 'wordSlots': len(rows), 'changedBytes': len(changes),
                      'receiptSha256': sha(receipt_bytes)}))


if __name__ == '__main__':
    main()
