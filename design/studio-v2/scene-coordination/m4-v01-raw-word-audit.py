"""Read-only independent component/offset check of the rejected M4 raw export."""
import hashlib
import json
import struct
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent / 'asset-pipeline' / 'full-kit'


def load(name, expected):
    raw = (KIT / 'exports' / name).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == expected
    assert struct.unpack_from('<4sII', raw) == (b'glTF', 2, len(raw))
    length, kind = struct.unpack_from('<I4s', raw, 12)
    assert kind == b'JSON'
    size, kind = struct.unpack_from('<I4s', raw, 20 + length)
    assert kind == b'BIN\0' and 28 + length + size == len(raw)
    return json.loads(raw[20:20 + length]), raw, 28 + length


p, pb, ps = load('studio-full-kit-m3-proposal-v03.glb', 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf')
c, cb, cs = load('studio-full-kit-m4-proposal-v01.raw-export.glb', 'c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906')
pn, cn = ({n['name']: n for n in d['nodes']} for d in (p, c))
assert len(pn) == len(p['nodes']) and len(cn) == len(c['nodes'])
contract_bytes = (HERE / 'm4-model-contract.json').read_bytes()
assert hashlib.sha256(contract_bytes).hexdigest() == '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98'
contract = json.loads(contract_bytes)
assert set(pn) - set(cn) == {n['name'] for n in contract['retiredParentLeaves']}
assert set(cn) - set(pn) == {r['leaf'] for r in contract['addedRows']}


def payload(doc, raw, start, index):
    a = doc['accessors'][index]
    v = doc['bufferViews'][a['bufferView']]
    size = {5121: 1, 5123: 2, 5125: 4, 5126: 4}[a['componentType']]
    width = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    assert 'sparse' not in a
    stride = v.get('byteStride', size * width)
    offset = start + v.get('byteOffset', 0) + a.get('byteOffset', 0)
    data = b''.join(raw[offset + i * stride:offset + i * stride + size * width] for i in range(a['count']))
    return data, offset, stride, size, width


differences, leaves, comparisons = [], 0, 0
for name in sorted(set(pn) & set(cn)):
    if 'mesh' not in pn[name]:
        continue
    leaves += 1
    pm, cm = p['meshes'][pn[name]['mesh']], c['meshes'][cn[name]['mesh']]
    assert pm['name'] == cm['name'] and len(pm['primitives']) == len(cm['primitives']) == 1
    pp, cp = pm['primitives'][0], cm['primitives'][0]
    assert set(pp['attributes']) == set(cp['attributes'])
    for semantic in list(pp['attributes']) + ['indices']:
        pi, ci = (pp['indices'], cp['indices']) if semantic == 'indices' else (pp['attributes'][semantic], cp['attributes'][semantic])
        pa, ca = p['accessors'][pi], c['accessors'][ci]
        assert {k: v for k, v in pa.items() if k not in ('bufferView', 'byteOffset')} == {k: v for k, v in ca.items() if k not in ('bufferView', 'byteOffset')}
        before, po, pt, size, width = payload(p, pb, ps, pi)
        after, co, ct, csize, cwidth = payload(c, cb, cs, ci)
        assert (len(before), size, width) == (len(after), csize, cwidth)
        comparisons += 1
        for at in range(0, len(before), size):
            first, second = before[at:at + size], after[at:at + size]
            if first == second:
                continue
            assert semantic == 'TEXCOORD_0' and size == 4 and pa['componentType'] == 5126
            vertex, component = divmod(at // size, width)
            poff, coff = po + vertex * pt + component * size, co + vertex * ct + component * size
            differences.append({'node': name, 'mesh': cm['name'], 'semantic': semantic, 'vertex': vertex,
                                'component': component, 'parentAccessor': pi, 'rawAccessor': ci,
                                'parentBinOffset': poff - ps, 'rawBinOffset': coff - cs,
                                'parentFileOffset': poff, 'rawFileOffset': coff,
                                'parentHex': first.hex(), 'rawHex': second.hex(),
                                'parentFloat': struct.unpack('<f', first)[0], 'rawFloat': struct.unpack('<f', second)[0],
                                'sameSignFloat32UlpDistance': abs(struct.unpack('<I', first)[0] - struct.unpack('<I', second)[0])})
expected = [(199, 0, '5b8f72bf', '5d8f72bf'), (258, 0, '20858b3e', '21858b3e'), (274, 1, '3689213f', '3789213f')]
assert leaves == 92 and comparisons == 368
assert [(w['vertex'], w['component'], w['parentHex'], w['rawHex']) for w in differences] == expected
assert all(w['mesh'] == 'desk_top__top_mesh.002' and w['parentAccessor'] == 64 and w['rawAccessor'] == 75 for w in differences)
report = {'scope': 'Read-only independent logical retained-component comparison; no restoration or candidate acceptance.',
          'parentSha256': hashlib.sha256(pb).hexdigest(), 'rawSha256': hashlib.sha256(cb).hexdigest(),
          'retainedLeaves': leaves, 'retainedAccessors': comparisons, 'differences': differences,
          'wordCount': len(differences), 'parentBinStart': ps, 'rawBinStart': cs,
          'correction': 'The author called all three 1 ULP; vertex199/component0 is2 ULP, the others1. Exact bytes, not tolerance, govern any proposed repair.'}
out = json.dumps(report, indent=2) + '\n'
with (HERE / 'm4-v01-raw-word-audit.json').open('x', encoding='utf-8') as target:
    target.write(out)
print(json.dumps(report))
