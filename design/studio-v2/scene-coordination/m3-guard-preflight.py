"""CPU-only tests of the actual pure guard functions, without importing bpy."""
import ast
import copy
import hashlib
import json
import struct
import sys
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent / 'asset-pipeline' / 'full-kit'
SOURCE = KIT / 'source' / 'build_fullkit_m3.py'
source_bytes = SOURCE.read_bytes()
tree = ast.parse(source_bytes, filename=str(SOURCE))
function_names = {'retained_hierarchy_problems', 'retained_texture_problems', 'palette_pixel_problems', 'png_rgba'}
definitions = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in function_names]
assert {node.name for node in definitions} == function_names
scope = {'struct': struct, 'zlib': zlib}
exec(compile(ast.Module(body=definitions, type_ignores=[]), str(SOURCE), 'exec'), scope)
hierarchy = scope['retained_hierarchy_problems']
textures = scope['retained_texture_problems']
pixels = scope['palette_pixel_problems']
rows = ast.literal_eval(next(node.value for node in tree.body if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'ROWS' for t in node.targets)))
parent_bytes = (KIT / 'exports' / 'studio-full-kit-m2-proposal-v05.glb').read_bytes()
assert hashlib.sha256(parent_bytes).hexdigest() == '4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735'
jlen = struct.unpack_from('<I', parent_bytes, 12)[0]
parent = json.loads(parent_bytes[20:20 + jlen])
bin_start = 28 + jlen
asset_ids = {row[0] for row in rows.values()}
removed = {node['name'] for node in parent['nodes'] if node.get('extras', {}).get('assetId') in asset_ids and '__proxy' in node['name']}
assert len(removed) == 11 and len(rows) == 9


def by_name(doc, name):
    return next(node for node in doc['nodes'] if node['name'] == name)


def remap(doc, new_nodes):
    old_names = [node['name'] for node in doc['nodes']]
    indices = {node['name']: index for index, node in enumerate(new_nodes)}
    for node in new_nodes:
        if 'children' in node:
            node['children'] = [indices[old_names[index]] for index in node['children']]
    for scene in doc['scenes']:
        scene['nodes'] = [indices[old_names[index]] for index in scene['nodes']]
    doc['nodes'] = new_nodes


candidate = copy.deepcopy(parent)
old_names = [node['name'] for node in parent['nodes']]
kept = [node for node in candidate['nodes'] if node['name'] not in removed]
for node in kept:
    if 'children' in node:
        node['children'] = [i for i in node['children'] if old_names[i] not in removed]
remap(candidate, kept)
root = by_name(candidate, 'studio_full_kit')
for name, (asset, _, _) in rows.items():
    root['children'].append(len(candidate['nodes']))
    candidate['nodes'].append({'name': name, 'mesh': 0, 'extras': {'assetId': asset}})
assert len(by_name(parent, 'studio_full_kit')['children']) == 117
assert len(root['children']) == 115
assert {k: v for k, v in by_name(parent, 'studio_full_kit').items() if k != 'mesh'} != {k: v for k, v in root.items() if k != 'mesh'}, 'Regression fixture must trigger the original raw root-index check'

results = []


def check(name, fn):
    try:
        assert fn(), name
        results.append({'name': name, 'passed': True})
    except Exception as error:
        results.append({'name': name, 'passed': False, 'error': repr(error)})


def hierarchy_mutation(change):
    changed = copy.deepcopy(candidate)
    change(changed)
    return bool(hierarchy(parent, changed, removed, set(rows)))


check('exact 11 proxy to 9 leaf substitution accepted', lambda: not hierarchy(parent, candidate, removed, set(rows)))
reindexed = copy.deepcopy(candidate)
remap(reindexed, list(reversed(reindexed['nodes'])))
check('semantic hierarchy survives global index reorder', lambda: not hierarchy(parent, reindexed, removed, set(rows)))
check('root transform mutation rejected', lambda: hierarchy_mutation(lambda d: by_name(d, 'studio_full_kit').update(translation=[1, 0, 0])))
check('retained target metadata mutation rejected', lambda: hierarchy_mutation(lambda d: by_name(d, 'target_dissertation')['extras'].update(occluder=not by_name(d, 'target_dissertation')['extras']['occluder'])))
check('missing root child rejected', lambda: hierarchy_mutation(lambda d: by_name(d, 'studio_full_kit')['children'].pop()))
check('duplicate root child rejected', lambda: hierarchy_mutation(lambda d: by_name(d, 'studio_full_kit')['children'].append(by_name(d, 'studio_full_kit')['children'][0])))
check('duplicate node name rejected', lambda: hierarchy_mutation(lambda d: d['nodes'].append(copy.deepcopy(d['nodes'][-1]))))
check('invalid child reference rejected', lambda: hierarchy_mutation(lambda d: by_name(d, 'studio_full_kit')['children'].append(999999)))


def reparent(doc, child_name, new_parent):
    index = next(i for i, node in enumerate(doc['nodes']) if node['name'] == child_name)
    by_name(doc, 'studio_full_kit')['children'].remove(index)
    by_name(doc, new_parent).setdefault('children', []).append(index)


check('retained leaf reparenting rejected', lambda: hierarchy_mutation(lambda d: reparent(d, 'target_dissertation', 'desk_top__top')))
check('new leaf reparenting rejected', lambda: hierarchy_mutation(lambda d: reparent(d, next(iter(rows)), 'desk_top__top')))
check('wrong default scene rejected', lambda: hierarchy_mutation(lambda d: d.update(scene=1)))
check('changed scene root rejected', lambda: hierarchy_mutation(lambda d: d['scenes'][0].update(nodes=[0])))
check('unexpected replacement-name set rejected', lambda: bool(hierarchy(parent, candidate, removed, set(rows) - {next(iter(rows))})))

check('actual parent image and sampler graph accepted', lambda: not textures(parent, parent, parent_bytes, parent_bytes, bin_start, bin_start))
texture_change = copy.deepcopy(parent)
texture_change['textures'][0]['source'] = (texture_change['textures'][0]['source'] + 1) % len(parent['images'])
check('retained texture source rewire rejected', lambda: bool(textures(parent, texture_change, parent_bytes, parent_bytes, bin_start, bin_start)))
sampler_change = copy.deepcopy(parent)
sampler_change['samplers'][0]['wrapS'] = 33071 if parent['samplers'][0].get('wrapS') != 33071 else 10497
check('sampler mutation rejected', lambda: bool(textures(parent, sampler_change, parent_bytes, parent_bytes, bin_start, bin_start)))
nonpalette = next(image for image in parent['images'] if image['name'] not in ('fk_palette_colour', 'fk_palette_orm'))
image_view = parent['bufferViews'][nonpalette['bufferView']]
image_change = bytearray(parent_bytes)
image_change[bin_start + image_view.get('byteOffset', 0) + 20] ^= 1
check('nonpalette embedded image mutation rejected', lambda: bool(textures(parent, parent, parent_bytes, image_change, bin_start, bin_start)))

cells = {'oak_tone': {'index': 19, 'srgb': '#a47c55', 'roughness': 0.62, 'metallic': 0.0},
         'dark_oak': {'index': 20, 'srgb': '#5e4130', 'roughness': 0.55, 'metallic': 0.0}}
baseline = (8, 8, 4, [bytes([12, 23, 34, 255] * 8) for _ in range(8)])


def palette_fixture(orm=False):
    lines = [bytearray(row) for row in baseline[3]]
    values = {19: [255, 158, 0, 255], 20: [255, 140, 0, 255]} if orm else {19: [164, 124, 85, 255], 20: [94, 65, 48, 255]}
    for index, value in values.items():
        y, x = divmod(index, 8)
        lines[y][x * 4:x * 4 + 4] = bytes(value)
    return (8, 8, 4, lines)


check('exact authorized colour cells accepted', lambda: not pixels(baseline, palette_fixture(), 'fk_palette_colour', cells, 8, 1))
check('exact authorized ORM cells accepted', lambda: not pixels(baseline, palette_fixture(True), 'fk_palette_orm', cells, 8, 1))
bad_alpha = palette_fixture()
bad_alpha[3][0][3] = 254
check('alpha-only change outside T2 rejected', lambda: bool(pixels(baseline, bad_alpha, 'fk_palette_colour', cells, 8, 1)))
bad_rgb = palette_fixture()
bad_rgb[3][0][0] ^= 1
check('RGB change outside T2 rejected', lambda: bool(pixels(baseline, bad_rgb, 'fk_palette_colour', cells, 8, 1)))
bad_cell = palette_fixture()
bad_cell[3][2][3 * 4] ^= 1
check('incorrect new-cell RGB rejected', lambda: bool(pixels(baseline, bad_cell, 'fk_palette_colour', cells, 8, 1)))
bad_cell_alpha = palette_fixture()
bad_cell_alpha[3][2][3 * 4 + 3] = 254
check('incorrect new-cell alpha rejected', lambda: bool(pixels(baseline, bad_cell_alpha, 'fk_palette_colour', cells, 8, 1)))
bad_orm = palette_fixture(True)
bad_orm[3][2][4 * 4 + 1] ^= 1
check('incorrect new-cell roughness rejected', lambda: bool(pixels(baseline, bad_orm, 'fk_palette_orm', cells, 8, 1)))

# Confirm the actual export branch calls the tested helpers, without executing it.
calls = [node.func.id for node in ast.walk(tree) if isinstance(node, ast.Call) and isinstance(node.func, ast.Name)]
check('tested guards wired into export branch', lambda: all(calls.count(name) == 1 for name in function_names - {'png_rgba'}))
report = {'sourceSha256': hashlib.sha256(source_bytes).hexdigest(), 'parentSha256': hashlib.sha256(parent_bytes).hexdigest(),
          'scope': 'CPU-only AST-extracted production guards, actual parent hierarchy/texture data and synthetic authorized replacement/mutation fixtures; no bpy import, Blender or M3 export.',
          'regression': 'Original retained-root JSON equality rejects the valid 117-to-115 direct-child fixture; semantic named substitution accepts it.',
          'results': results, 'passed': sum(item['passed'] for item in results), 'failed': sum(not item['passed'] for item in results)}
(HERE / 'm3-guard-preflight.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'passed': report['passed'], 'failed': report['failed'], 'failures': [r for r in results if not r['passed']]}))
sys.exit(bool(report['failed']))
