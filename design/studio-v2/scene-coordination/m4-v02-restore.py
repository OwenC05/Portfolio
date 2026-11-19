"""Exact M4 raw v01 -> v02 canonicalization, separate from the Blender author.

Authority: m4-v01-raw-root-disposition.md / msg_4abbeff01768.
Run with python -B; all verification precedes exclusive output creation.
This writer's receipt does not constitute independent or visual acceptance.
"""
import hashlib
import json
import struct
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent / 'asset-pipeline' / 'full-kit'
PARENT = KIT / 'exports/studio-full-kit-m3-proposal-v03.glb'
RAW = KIT / 'exports/studio-full-kit-m4-proposal-v01.raw-export.glb'
OUTPUT = KIT / 'exports/studio-full-kit-m4-proposal-v02.glb'
RECEIPT = KIT / 'manifests/m4-v02-restoration-receipt.json'
PARENT_SHA = 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf'
RAW_SHA = 'c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906'
# vertex, component, parent BIN, parent file, raw BIN, raw file, raw word, parent word
WORDS = (
    (199, 0, 411396, 487544, 580196, 662880, '5d8f72bf', '5b8f72bf'),
    (258, 0, 411868, 488016, 580668, 663352, '21858b3e', '20858b3e'),
    (274, 1, 412000, 488148, 580800, 663484, '3789213f', '3689213f'),
)
PROVENANCE = {
    KIT / 'source/build_fullkit_m4.py': 'aa9724dcd14dbc428ca5c2ba84cffdcbb469fa14c53cf3866ac46164ec04dc22',
    KIT / 'source/build_fullkit_m4_geometry.py': 'c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0',
    KIT / 'source/fk-40-music-proposal-v01.blend': '0ae40460b9a2cb578fc35a96497a9016e5f116a1efe98cac4809568fd68c4665',
    KIT / 'manifests/m4-v01-author-measurements.json': '22039aa167938fea67554bf42158b8d66eae2b4a244ddf1ee63486a93b194782',
    KIT / 'manifests/m4-v01-transition-guard-receipt.json': 'b31e17bfd8782ce5625f80222e28dd836a0cb5930f07cd4d5b6e990e7d250fcd',
    HERE / 'm4-transition-guard.py': 'ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b',
    HERE / 'm4-model-contract.json': '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98',
    HERE / 'm4-scene-provenance-amendment-v01.json': '3b3a011d5d2f599dc63a4bf31aacd115513eb06c31267ddee0201209cebb2229',
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def split(data):
    require(len(data) >= 28, 'GLB minimum length')
    require(struct.unpack_from('<4sII', data) == (b'glTF', 2, len(data)), 'GLB header')
    length, kind = struct.unpack_from('<I4s', data, 12)
    require(kind == b'JSON' and length % 4 == 0 and length <= len(data) - 28, 'JSON chunk')
    binary_length, kind = struct.unpack_from('<I4s', data, 20 + length)
    start = 28 + length
    require(kind == b'BIN\x00' and start + binary_length == len(data), 'BIN chunk/layout')
    return json.loads(data[20:20 + length]), start


def layout(doc, accessor_index, view_index, expected_bin_offset):
    matches = [(index, mesh) for index, mesh in enumerate(doc['meshes'])
               if mesh.get('name') == 'desk_top__top_mesh.002']
    require(len(matches) == 1, 'unique named desk mesh')
    index, mesh = matches[0]
    users = [node for node in doc['nodes'] if node.get('mesh') == index]
    require(len(users) == 1 and users[0]['name'] == 'desk_top__top', 'unique desk node identity')
    require(len([n for n in doc['nodes'] if n.get('name') == 'desk_top__top']) == 1,
            'unique named desk node')
    require(len(mesh['primitives']) == 1, 'single desk primitive')
    require(mesh['primitives'][0]['attributes']['TEXCOORD_0'] == accessor_index,
            'desk UV accessor identity')
    owners = [(m['name'], attribute) for m in doc['meshes'] for primitive in m['primitives']
              for attribute, accessor in primitive['attributes'].items() if accessor == accessor_index]
    require(owners == [('desk_top__top_mesh.002', 'TEXCOORD_0')], 'unique accessor owner')
    require(not any(p.get('indices') == accessor_index for m in doc['meshes'] for p in m['primitives']),
            'UV accessor is not an index accessor')
    accessor = doc['accessors'][accessor_index]
    require(accessor == {'bufferView': view_index, 'componentType': 5126, 'count': 292, 'type': 'VEC2'},
            'exact float32 VEC2 accessor layout')
    require([i for i, a in enumerate(doc['accessors']) if a.get('bufferView') == view_index] == [accessor_index],
            'unique UV bufferView owner')
    view = doc['bufferViews'][view_index]
    require(view == {'buffer': 0, 'byteLength': 2336, 'byteOffset': expected_bin_offset, 'target': 34962},
            'exact packed UV view layout')
    return view['byteOffset'], 8, accessor['count']


def restore(parent, raw):
    require(sha(parent) == PARENT_SHA and sha(raw) == RAW_SHA, 'complete input hashes')
    pd, pstart = split(parent)
    rd, rstart = split(raw)
    require((pstart, rstart) == (76148, 82684), 'pinned chunk starts')
    pbase, pstride, count = layout(pd, 64, 67, 409804)
    rbase, rstride, _ = layout(rd, 75, 78, 578604)
    output = bytearray(raw)
    rows, expected_changes = [], []
    for vertex, component, pbin, pfile, rbin, rfile, raw_hex, parent_hex in WORDS:
        require(0 <= vertex < count and component in (0, 1), 'word coordinates')
        require(pbase + vertex * pstride + component * 4 == pbin, 'derived parent BIN offset')
        require(rbase + vertex * rstride + component * 4 == rbin, 'derived raw BIN offset')
        require(pstart + pbin == pfile and rstart + rbin == rfile, 'derived file offsets')
        before = raw[rfile:rfile + 4]
        replacement = parent[pfile:pfile + 4]
        require(before.hex() == raw_hex and replacement.hex() == parent_hex, 'exact word input/output bytes')
        output[rfile:rfile + 4] = replacement
        changed = [rfile + k for k in range(4) if before[k] != replacement[k]]
        expected_changes.extend(changed)
        rows.append({'mesh': 'desk_top__top_mesh.002', 'attribute': 'TEXCOORD_0',
                     'parentAccessor': 64, 'rawAccessor': 75, 'vertex': vertex, 'component': component,
                     'parentBinOffset': pbin, 'parentFileOffset': pfile, 'rawBinOffset': rbin,
                     'rawFileOffset': rfile, 'rawHex': raw_hex, 'outputHex': parent_hex,
                     'changedFileByteOffsets': changed})
    output = bytes(output)
    changes = [i for i, (before, after) in enumerate(zip(raw, output)) if before != after]
    require(len(output) == len(raw) and changes == sorted(expected_changes) == [662880, 663352, 663484],
            'exact whole-file delta')
    require(output[:rstart] == raw[:rstart], 'header and JSON preserved')
    require(output[rstart + rbase:rstart + rbase + 2336] == parent[pstart + pbase:pstart + pbase + 2336],
            'complete retained desk UV accessor equality')
    return output, rows, changes


def write_fresh(output_path, receipt_path, output, receipt_bytes):
    # Preflight both paths, then use exclusive opens; an I/O failure is never retried here.
    for path in (output_path, receipt_path):
        require(not path.exists(), 'Refusing overwrite: ' + str(path))
    with output_path.open('xb') as target, receipt_path.open('xb') as receipt:
        target.write(output)
        receipt.write(receipt_bytes)


def main():
    for path in (OUTPUT, RECEIPT):
        require(not path.exists(), 'Refusing overwrite: ' + str(path))
    for path, expected in PROVENANCE.items():
        require(sha(path.read_bytes()) == expected, 'preserved provenance: ' + str(path))
    parent, raw = PARENT.read_bytes(), RAW.read_bytes()
    output, rows, changes = restore(parent, raw)
    receipt = {
        'scope': 'Exact root-approved restoration; writer evidence, not independent or visual acceptance.',
        'authority': 'scene-coordination/m4-v01-raw-root-disposition.md / msg_4abbeff01768',
        'restorerSha256': sha(Path(__file__).read_bytes()),
        'inputs': {'parent': {'sha256': PARENT_SHA, 'bytes': len(parent)},
                   'raw': {'sha256': RAW_SHA, 'bytes': len(raw)}},
        'preservedProvenance': {str(p.relative_to(HERE.parent)).replace('\\', '/'): v for p, v in PROVENANCE.items()},
        'output': {'path': str(OUTPUT.relative_to(KIT)).replace('\\', '/'), 'sha256': sha(output), 'bytes': len(output)},
        'restoredWordSlots': rows, 'addressedWordCount': len(rows), 'addressedByteSlots': len(rows) * 4,
        'actuallyChangedByteCount': len(changes), 'changedFileByteOffsets': changes,
        'headerJsonAndAllOtherBytesIdenticalToRaw': True,
        'embeddedBuildTags': 'M4 v01 preserved verbatim; v02 denotes this separate byte canonicalization.',
        'independentReview': 'Required before capture; exact transition guard and assembled audit run separately.',
    }
    receipt_bytes = (json.dumps(receipt, indent=2) + '\n').encode('utf-8')
    write_fresh(OUTPUT, RECEIPT, output, receipt_bytes)
    print(json.dumps({'output': receipt['output'], 'wordSlots': len(rows), 'changedBytes': len(changes),
                      'receiptSha256': sha(receipt_bytes)}))


if __name__ == '__main__':
    main()
