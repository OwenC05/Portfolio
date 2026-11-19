"""Studio v2 full kit, stage M2, PC repair v05: exact restoration of four unrelated UV words (root msg_3bf70918e3a0).

Run (plain Python 3, no Blender, no dependencies; writes two new files and refuses to overwrite):
  python -I build_fullkit_m2_pc_v05.py

Provenance. v05 is v04 with exactly four float32 words of the BIN chunk restored from the pinned v03 parent:
  - Editable source: source/fk-20-workstation-pc-v04.blend, built by source/build_fullkit_m2_pc_v04.py and exported
    as exports/studio-full-kit-m2-proposal-v04.glb (both pinned below).
  - The v04 export carried four 1-ULP TEXCOORD_0 differences on leaves v04 does not touch (desk_top__top x3,
    sub_woofer__cabinet x1): float32 evaluation noise of the unchanged M1/M2 builders. They do not exist in the
    editable state as an authored change, so the frozen-source fix is this byte step, not another Blender run.

Guards (any failure aborts before writing):
  1. Both input GLBs match their pinned SHA-256.
  2. The v04 JSON chunk differs from v03 only in accessor 154 min/max (glow POSITION) and the scene tag extras.
  3. Each of the four words sits exactly at its accessor / vertex / component, and holds the recorded v04 value
     while v03 holds the recorded v03 value.
  4. After restoration, v05 differs from v04 in exactly those 16 bytes, and from v03 in exactly the 76 authorised
     words: four pc_tower__case TEXCOORD_0 words (front panel) and all 72 pc_tower__glow POSITION words.
     No tolerance of any size is applied anywhere.
The GLB header and JSON chunk are v04's, byte for byte (so the embedded scene tag still reads the v04 build).
"""
import hashlib, json, os, struct, sys

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
V03 = os.path.join(KIT, 'exports', 'studio-full-kit-m2-proposal-v03.glb')
V04 = os.path.join(KIT, 'exports', 'studio-full-kit-m2-proposal-v04.glb')
V05 = os.path.join(KIT, 'exports', 'studio-full-kit-m2-proposal-v05.glb')
RECEIPT = os.path.join(KIT, 'manifests', 'm2-pc-v05-restoration-receipt.json')
V03_SHA = '7c0d30428065d0024bb1c4a631a3b54504008edcccab91c75e7367a53fa57752'
V04_SHA = '560acb2f2fa1ae36598a5d63ab484f842766ad344d88b065abad82286b560ea0'

# (BIN-relative byte offset, accessor, vertex, component, v04 value, v03 value) as named in msg_3bf70918e3a0
RESTORE = [
    (411436, 64, 197, 1, 0.6280039548873901, 0.6280038952827454),
    (411448, 64, 199, 0, -0.9475000500679016, -0.9474999308586121),
    (412052, 64, 274, 1, 0.6309999823570251, 0.6309999227523804),
    (1074960, 165, 85, 1, 0.062499940395355225, 0.0625),
]
CASE_UV, GLOW_POS, GLOW_NRM = 149, 154, 155
CASE_UV_OFFSETS_IN_VIEW = [484, 508, 532, 556]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def split(raw):
    magic, version, length = struct.unpack_from('<4sII', raw, 0)
    assert magic == b'glTF' and version == 2 and length == len(raw)
    jlen, jtype = struct.unpack_from('<I4s', raw, 12)
    assert jtype == b'JSON'
    blen, btype = struct.unpack_from('<I4s', raw, 20 + jlen)
    assert btype == b'BIN\x00' and 28 + jlen + blen == len(raw)
    return json.loads(raw[20:20 + jlen]), 28 + jlen, blen


def main():
    for p in (V05, RECEIPT):
        if os.path.exists(p):
            raise SystemExit('Refusing to overwrite existing deliverable: ' + p)
    r3, r4 = open(V03, 'rb').read(), open(V04, 'rb').read()
    assert sha(r3) == V03_SHA, 'v03 GLB differs from the pinned parent'
    assert sha(r4) == V04_SHA, 'v04 GLB differs from the pinned candidate'
    d3, b3o, b3l = split(r3)
    d4, b4o, b4l = split(r4)
    assert len(r3) == len(r4) and b3o == b4o and b3l == b4l, 'layout differs'

    # Guard 2: JSON delta limited to glow POSITION min/max and scene tag extras
    for k in set(d3) | set(d4):
        if k in ('accessors', 'scenes'):
            continue
        assert d3.get(k) == d4.get(k), 'JSON section differs: ' + k
    assert [dict(s, extras=None) for s in d3['scenes']] == [dict(s, extras=None) for s in d4['scenes']]
    acc_diff = [i for i, (a, b) in enumerate(zip(d3['accessors'], d4['accessors'])) if a != b]
    assert len(d3['accessors']) == len(d4['accessors']) and acc_diff == [GLOW_POS], acc_diff
    a3, a4 = dict(d3['accessors'][GLOW_POS]), dict(d4['accessors'][GLOW_POS])
    for a in (a3, a4):
        a.pop('min'); a.pop('max')
    assert a3 == a4

    def word_offset(acc_index, vertex, comp):
        acc = d4['accessors'][acc_index]
        view = d4['bufferViews'][acc['bufferView']]
        assert acc['componentType'] == 5126 and acc['type'] == 'VEC2' and vertex < acc['count']
        stride = view.get('byteStride', 8)
        return view.get('byteOffset', 0) + acc.get('byteOffset', 0) + vertex * stride + comp * 4

    # Guard 3: exact location and values
    out = bytearray(r4)
    rows = []
    for off, acc_index, vertex, comp, v4_val, v3_val in RESTORE:
        assert word_offset(acc_index, vertex, comp) == off, (off, acc_index, vertex, comp)
        w3, w4 = r3[b3o + off:b3o + off + 4], r4[b4o + off:b4o + off + 4]
        assert w3 != w4
        assert struct.unpack('<f', w4)[0] == struct.unpack('<f', struct.pack('<f', v4_val))[0]
        assert struct.unpack('<f', w3)[0] == struct.unpack('<f', struct.pack('<f', v3_val))[0]
        out[b4o + off:b4o + off + 4] = w3
        mesh = next(m['name'] for m in d4['meshes'] for p in m['primitives'] if p['attributes'].get('TEXCOORD_0') == acc_index)
        rows.append({'binByteOffset': off, 'accessor': acc_index, 'mesh': mesh, 'attribute': 'TEXCOORD_0', 'vertex': vertex,
                     'component': comp, 'v04Hex': w4.hex(), 'v04': struct.unpack('<f', w4)[0],
                     'restoredHex': w3.hex(), 'restored': struct.unpack('<f', w3)[0]})
    out = bytes(out)

    # Guard 4a: v05 vs v04, exactly the 16 restored bytes
    changed4 = [i for i in range(len(out)) if out[i] != r4[i]]
    expected4 = sorted(b4o + off + k for off, *_ in RESTORE for k in range(4) if r3[b3o + off + k] != r4[b4o + off + k])
    assert changed4 == expected4, 'v05 differs from v04 outside the four restored words'
    assert out[:b4o] == r4[:b4o], 'header or JSON chunk changed'

    # Guard 4b: v05 BIN vs v03 BIN, exactly the 76 authorised words
    def span(acc_index):
        acc = d4['accessors'][acc_index]
        view = d4['bufferViews'][acc['bufferView']]
        return view.get('byteOffset', 0), view['byteLength']

    case_o, _ = span(CASE_UV)
    glow_o, glow_l = span(GLOW_POS)
    authorised = {case_o + o for o in CASE_UV_OFFSETS_IN_VIEW} | set(range(glow_o, glow_o + glow_l, 4))
    assert len(authorised) == 76 and glow_l == 288
    bin5, bin3 = out[b4o:b4o + b4l], r3[b3o:b3o + b3l]
    assert len(bin5) % 4 == 0
    diff_words = {j for j in range(0, len(bin5), 4) if bin5[j:j + 4] != bin3[j:j + 4]}
    assert diff_words == authorised, ('unexpected', sorted(diff_words - authorised), 'missing', sorted(authorised - diff_words))
    case_vals = [(struct.unpack('<f', bin3[case_o + o:case_o + o + 4])[0], struct.unpack('<f', bin5[case_o + o:case_o + o + 4])[0])
                 for o in CASE_UV_OFFSETS_IN_VIEW]
    assert all(a == 0.0625 and b == 0.3125 for a, b in case_vals), case_vals
    n_o, n_l = span(GLOW_NRM)
    assert bin5[n_o:n_o + n_l] == bin3[n_o:n_o + n_l]

    with open(V05, 'xb') as f:
        f.write(out)
    receipt = {
        'statement': 'v05 = v04 with exactly four BIN float32 words restored from pinned v03 (root msg_3bf70918e3a0). No tolerance applied.',
        'script': 'source/build_fullkit_m2_pc_v05.py', 'scriptSha256': sha(open(os.path.abspath(__file__), 'rb').read()),
        'inputs': {'v03': {'glb': 'exports/studio-full-kit-m2-proposal-v03.glb', 'sha256': V03_SHA, 'bytes': len(r3)},
                   'v04': {'glb': 'exports/studio-full-kit-m2-proposal-v04.glb', 'sha256': V04_SHA, 'bytes': len(r4)}},
        'editableSource': {'blend': 'source/fk-20-workstation-pc-v04.blend', 'builder': 'source/build_fullkit_m2_pc_v04.py',
                           'note': 'v05 adds no editable change; the four words are exporter float32 noise restored at byte level.'},
        'output': {'glb': 'exports/studio-full-kit-m2-proposal-v05.glb', 'sha256': sha(out), 'bytes': len(out)},
        'restoredWords': rows,
        'v05VersusV04': {'changedBytes': len(changed4), 'headerAndJsonIdentical': True},
        'v05VersusV03': {'binWordsChanged': len(diff_words), 'authorisedWords': 76,
                         'pcTowerCaseTexcoord0Words': 4, 'pcTowerGlowPositionWords': 72, 'glowNormalIdentical': True,
                         'jsonDelta': 'accessor 154 min/max and scene tag extras only (v04 JSON verbatim)'},
    }
    with open(RECEIPT, 'x', encoding='utf-8') as f:
        json.dump(receipt, f, indent=1)
    print('FK v05 written', V05, len(out), sha(out))
    print('FK v05 receipt', RECEIPT)


if __name__ == '__main__':
    sys.exit(main())
