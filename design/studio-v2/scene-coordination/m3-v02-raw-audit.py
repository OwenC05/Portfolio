"""Read-only audit of the preserved M3 raw export and its rejected UV word."""
import ast
import hashlib
import json
import struct
import subprocess
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent / 'asset-pipeline' / 'full-kit'
SOURCE = KIT / 'source' / 'build_fullkit_m3.py'
source = SOURCE.read_bytes()
assert hashlib.sha256(source).hexdigest() == 'dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209'
baseline = subprocess.run(['git', 'show', '416af31:design/studio-v2/asset-pipeline/full-kit/source/build_fullkit_m3.py'], check=True, capture_output=True, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0)).stdout
assert hashlib.sha256(baseline).hexdigest() == '8829c741ee25bbb32da8328e4d56eb43fcd40ad9eac931a49bc0bb7192d22954'
tree, base_tree = ast.parse(source), ast.parse(baseline)
names = {'retained_hierarchy_problems', 'retained_texture_problems', 'palette_pixel_problems', 'png_rgba'}
defs = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in names]
old_defs = [node for node in base_tree.body if isinstance(node, ast.FunctionDef) and node.name in names]
assert [ast.dump(node) for node in defs] == [ast.dump(node) for node in old_defs]


def literal(parsed, name):
    return ast.literal_eval(next(node.value for node in ast.walk(parsed) if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == name for target in node.targets)))


for name in ('NOISE', 'ROWS', 'T2', 'FROST_RENDER_ORDER'):
    assert literal(tree, name) == literal(base_tree, name), name
rows, known = literal(tree, 'ROWS'), literal(tree, 'NOISE')
scope = {'struct': struct, 'zlib': zlib}
exec(compile(ast.Module(body=defs, type_ignores=[]), str(SOURCE), 'exec'), scope)


def read_glb(name, expected):
    raw = (KIT / 'exports' / name).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == expected
    assert struct.unpack_from('<III', raw) == (0x46546C67, 2, len(raw))
    length = struct.unpack_from('<I', raw, 12)[0]
    return json.loads(raw[20:20 + length]), raw, 28 + length


parent, pbytes, pbin = read_glb('studio-full-kit-m2-proposal-v05.glb', '4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735')
candidate, cbytes, cbin = read_glb('studio-full-kit-m3-proposal-v02.raw-export.glb', '71b39b5c242278408092d3ee95ab4e996df47014eb30ef57383b88f3e526fd18')
pn, cn = ({node['name']: node for node in doc['nodes']} for doc in (parent, candidate))
removed = set(pn) - set(cn)
assert len(removed) == 11 and set(cn) - set(pn) == set(rows)
hierarchy_errors = scope['retained_hierarchy_problems'](parent, candidate, removed, set(rows))
texture_errors = scope['retained_texture_problems'](parent, candidate, pbytes, cbytes, pbin, cbin)
assert not hierarchy_errors and not texture_errors


def accessor(doc, raw, start, index):
    a = doc['accessors'][index]
    v = doc['bufferViews'][a['bufferView']]
    size = {5121: 1, 5123: 2, 5125: 4, 5126: 4}[a['componentType']]
    width = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    stride = v.get('byteStride', size * width)
    offset = start + v.get('byteOffset', 0) + a.get('byteOffset', 0)
    data = b''.join(raw[offset + vertex * stride:offset + vertex * stride + size * width] for vertex in range(a['count']))
    return data, offset, stride, size, width


differences = []
for name in sorted(set(pn) & set(cn)):
    if 'mesh' not in pn[name]:
        continue
    pm, cm = parent['meshes'][pn[name]['mesh']], candidate['meshes'][cn[name]['mesh']]
    assert pm['name'] == cm['name'] and len(pm['primitives']) == len(cm['primitives']) == 1
    p, c = pm['primitives'][0], cm['primitives'][0]
    assert parent['materials'][p['material']] == candidate['materials'][c['material']]
    assert {k: v for k, v in p.items() if k not in ('attributes', 'indices', 'material')} == {k: v for k, v in c.items() if k not in ('attributes', 'indices', 'material')}
    assert set(p['attributes']) == set(c['attributes'])
    for attribute in list(p['attributes']) + ['indices']:
        pi, ci = (p['indices'], c['indices']) if attribute == 'indices' else (p['attributes'][attribute], c['attributes'][attribute])
        pa, ca = parent['accessors'][pi], candidate['accessors'][ci]
        assert {k: v for k, v in pa.items() if k not in ('bufferView', 'byteOffset')} == {k: v for k, v in ca.items() if k not in ('bufferView', 'byteOffset')}
        pb, po, ps, size, width = accessor(parent, pbytes, pbin, pi)
        cb, co, cs, _, _ = accessor(candidate, cbytes, cbin, ci)
        assert len(pb) == len(cb)
        for offset in range(0, len(pb), size):
            if pb[offset:offset + size] == cb[offset:offset + size]:
                continue
            assert attribute == 'TEXCOORD_0' and pa['componentType'] == 5126
            vertex, component = divmod(offset // size, width)
            identity = (cm['name'], attribute, vertex, component)
            before, after = struct.unpack_from('<f', pb, offset)[0], struct.unpack_from('<f', cb, offset)[0]
            differences.append({'node': name, 'identity': list(identity), 'parentAccessor': pi, 'rawAccessor': ci,
                                'parentBinOffset': po - pbin + vertex * ps + component * size,
                                'rawBinOffset': co - cbin + vertex * cs + component * size,
                                'rawFileOffset': co + vertex * cs + component * size,
                                'parentHex': pb[offset:offset + size].hex(), 'rawHex': cb[offset:offset + size].hex(),
                                'parentValue': before, 'rawValue': after,
                                'matchesExistingNamedRule': identity in known and struct.pack('<f', known[identity]) == cb[offset:offset + size]})
new_words = [word for word in differences if not word['matchesExistingNamedRule']]
assert len(differences) == 4 and len(new_words) == 1
assert new_words[0]['identity'] == ['desk_top__top_mesh.002', 'TEXCOORD_0', 258, 0]
assert new_words[0]['parentHex'] == '20858b3e' and new_words[0]['rawHex'] == '21858b3e'

cells = {}
for index, (name, colour, roughness, metallic) in enumerate(literal(tree, 'T2'), 19):
    cells[name] = {'index': index, 'srgb': '#%06x' % colour, 'roughness': roughness, 'metallic': metallic}


def decoded(doc, raw, start, name):
    item = next(image for image in doc['images'] if image['name'] == name)
    view = doc['bufferViews'][item['bufferView']]
    offset = start + view.get('byteOffset', 0)
    return scope['png_rgba'](raw[offset:offset + view['byteLength']])


palette_errors = []
m1_source = (KIT / 'source' / 'build_fullkit.py').read_bytes()
m1_tree = ast.parse(m1_source)
grid_assignment = next(node for node in m1_tree.body if isinstance(node, ast.Assign)
                       and len(node.targets) == 1 and isinstance(node.targets[0], ast.Tuple)
                       and [target.id for target in node.targets[0].elts] == ['GRID', 'CELL'])
grid, cell_size = ast.literal_eval(grid_assignment.value)
assert (grid, cell_size) == (8, 16)
for name in ('fk_palette_colour', 'fk_palette_orm'):
    palette_errors.extend(scope['palette_pixel_problems'](decoded(parent, pbytes, pbin, name), decoded(candidate, cbytes, cbin, name), name, cells, grid, cell_size))
assert not palette_errors, palette_errors
report = {'status': 'verified one new out-of-scope retained UV word; no candidate acceptance',
          'sourceSha256': hashlib.sha256(source).hexdigest(), 'reviewedBaselineSha256': hashlib.sha256(baseline).hexdigest(),
          'parentSha256': hashlib.sha256(pbytes).hexdigest(), 'rawSha256': hashlib.sha256(cbytes).hexdigest(),
          'reviewedGuardFunctionsUnchanged': True, 'existingNoiseRulesRowsT2FrostUnchanged': True,
          'paletteGridSourceSha256': hashlib.sha256(m1_source).hexdigest(), 'paletteGrid': grid, 'paletteCellSize': cell_size,
          'auditCorrection': 'First audit run incorrectly assumed a 4px palette cell and failed; actual M1 source declares 16px. Audit now reads that declaration; author source and assets unchanged.',
          'hierarchyErrors': hierarchy_errors, 'textureErrors': texture_errors, 'paletteErrors': palette_errors,
          'retainedAttributeDifferences': differences, 'newOutOfScopeWords': new_words,
          'scope': 'Read-only actual raw bytes, AST guard identity, retained attributes/materials/hierarchy and exact T2/nonpalette texture graph. No new GLB, Blender, source edit, visual or final budget acceptance.'}
(HERE / 'm3-v02-raw-audit.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'status': report['status'], 'retainedWords': len(differences), 'newWords': new_words, 'paletteErrors': palette_errors}))
