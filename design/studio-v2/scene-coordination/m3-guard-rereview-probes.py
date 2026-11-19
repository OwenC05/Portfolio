"""Independent CPU rereview; AST extraction only, no bpy/source-script execution."""
import ast
import copy
import hashlib
import json
import struct
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
runner = HERE / 'm3-guard-preflight.py'
runner_bytes = runner.read_bytes()
original_receipt = HERE / 'm3-guard-preflight.json'
before = hashlib.sha256(original_receipt.read_bytes()).hexdigest()
module = ast.parse(runner_bytes, filename=str(runner))

class SeparateEvidence(ast.NodeTransformer):
    def visit_Constant(self, node):
        if node.value == 'm3-guard-preflight.json':
            return ast.copy_location(ast.Constant('m3-guard-rereview-preflight.json'), node)
        return node

module = SeparateEvidence().visit(module)
assert isinstance(module.body[-1], ast.Expr) and isinstance(module.body[-1].value, ast.Call)
assert ast.unparse(module.body[-1]).startswith('sys.exit(')
module.body.pop()
ast.fix_missing_locations(module)
scope = {'__file__': str(runner), '__name__': '__review__'}
exec(compile(module, str(runner), 'exec'), scope)
assert scope['report']['failed'] == 0
parent, candidate = scope['parent'], scope['candidate']
hierarchy, textures, pixels = scope['hierarchy'], scope['textures'], scope['pixels']
by_name, removed, rows = scope['by_name'], scope['removed'], scope['rows']
checks = []

def check(name, operation):
    try:
        assert operation(), name
        checks.append({'name': name, 'passed': True})
    except Exception as error:
        checks.append({'name': name, 'passed': False, 'error': repr(error)})

def bad_hierarchy(change):
    doc = copy.deepcopy(candidate)
    change(doc)
    return bool(hierarchy(parent, doc, removed, set(rows)))

check('additional scene rejected', lambda: bad_hierarchy(lambda d: d['scenes'].append(copy.deepcopy(d['scenes'][0]))))
check('root cycle rejected', lambda: bad_hierarchy(lambda d: by_name(d, 'studio_full_kit')['children'].append(next(i for i, n in enumerate(d['nodes']) if n['name'] == 'studio_full_kit'))))
check('retained mesh presence removal rejected', lambda: bad_hierarchy(lambda d: by_name(d, 'target_dissertation').pop('mesh')))
check('new leaf children rejected', lambda: bad_hierarchy(lambda d: by_name(d, next(iter(rows))).update(children=[0])))
check('unreachable extra node rejected', lambda: bad_hierarchy(lambda d: d['nodes'].append({'name': 'unreachable'})))
check('retained cast flag change rejected', lambda: bad_hierarchy(lambda d: by_name(d, 'desk_top__top')['extras'].update(nocast=not by_name(d, 'desk_top__top')['extras']['nocast'])))

raw, bo = scope['parent_bytes'], scope['bin_start']
def bad_texture(change):
    doc = copy.deepcopy(parent)
    change(doc)
    return bool(textures(parent, doc, raw, raw, bo, bo))

check('image MIME metadata change rejected', lambda: bad_texture(lambda d: d['images'][0].update(mimeType='image/jpeg')))
check('duplicate image identity rejected', lambda: bad_texture(lambda d: d['images'].append(copy.deepcopy(d['images'][0]))))
check('missing texture rejected', lambda: bad_texture(lambda d: d['textures'].pop()))
check('texture sampler removal rejected', lambda: bad_texture(lambda d: d['textures'][0].pop('sampler')))
reordered = copy.deepcopy(parent)
reordered['images'].reverse()
for texture in reordered['textures']:
    texture['source'] = len(reordered['images']) - 1 - texture['source']
check('semantic image renumbering accepted', lambda: not textures(parent, reordered, raw, raw, bo, bo))

baseline, cells = scope['baseline'], scope['cells']
valid_colour = scope['palette_fixture']()
rgb_parent = (8, 8, 3, [b''.join(line[i:i+3] for i in range(0, len(line), 4)) for line in baseline[3]])
rgb_candidate = (8, 8, 3, [b''.join(line[i:i+3] for i in range(0, len(line), 4)) for line in valid_colour[3]])
check('RGB implicit alpha agrees with RGBA255', lambda: not pixels(rgb_parent, valid_colour, 'fk_palette_colour', cells, 8, 1))
check('RGB candidate accepted with implicit alpha255', lambda: not pixels(baseline, rgb_candidate, 'fk_palette_colour', cells, 8, 1))
missing = copy.deepcopy(cells)
missing['dark_oak']['index'] = 99
check('missing authorized cell rejected', lambda: bool(pixels(baseline, valid_colour, 'fk_palette_colour', missing, 8, 1)))
check('dimension change rejected', lambda: bool(pixels(baseline, (7, 8, 4, valid_colour[3]), 'fk_palette_colour', cells, 8, 1)))

# Exercise the actual PNG decoder with both channel layouts and every supported filter.
def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))

def png_fixture(channels):
    width, height = 4, 5
    decoded = [bytes((17 * x + 31 * y + 4) % 256 for x in range(width * channels)) for y in range(height)]
    encoded = bytearray()
    for y, line in enumerate(decoded):
        encoded.append(y)
        previous = decoded[y - 1] if y else bytes(len(line))
        for x, value in enumerate(line):
            left = line[x - channels] if x >= channels else 0
            up = previous[x]
            corner = previous[x - channels] if x >= channels else 0
            predictors = [left, up, corner]
            estimate = left + up - corner
            paeth = min(enumerate(predictors), key=lambda pair: (abs(estimate - pair[1]), pair[0]))[1]
            prediction = [0, left, up, (left + up) // 2, paeth][y]
            encoded.append((value - prediction) % 256)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6 if channels == 4 else 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(encoded)) + chunk(b'IEND', b'')
    return png, (width, height, channels, decoded)

for channel_count in (3, 4):
    blob, expected = png_fixture(channel_count)
    check(f'actual PNG decoder RGB{channel_count} filters0to4 exact', lambda blob=blob, expected=expected: scope['scope']['png_rgba'](blob) == expected)

source_tree = scope['tree']
branches = [n for n in source_tree.body if isinstance(n, ast.If) and ast.unparse(n.test) == "'glb' in FLAGS"]
guard_names = {'retained_hierarchy_problems', 'retained_texture_problems', 'palette_pixel_problems'}
export_calls = {n.func.id for branch in branches for n in ast.walk(branch) if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)}
check('all corrected guards called inside glb export conditional', lambda: guard_names <= export_calls)
check('original receipt unchanged', lambda: hashlib.sha256(original_receipt.read_bytes()).hexdigest() == before)
report = {'sourceSha256': scope['report']['sourceSha256'], 'preflightRunnerSha256': hashlib.sha256(runner_bytes).hexdigest(), 'originalReceiptSha256': before,
          'scope': 'Actual pure helper AST extraction, 25 original checks rerun into a separate receipt plus independent negative/positive probes. No bpy import or full authoring-script execution.',
          'originalPassed': scope['report']['passed'], 'additionalResults': checks, 'additionalPassed': sum(r['passed'] for r in checks), 'additionalFailed': sum(not r['passed'] for r in checks)}
(HERE / 'm3-guard-rereview-probes.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'originalPassed': report['originalPassed'], 'additionalPassed': report['additionalPassed'], 'additionalFailed': report['additionalFailed'], 'failures': [r for r in checks if not r['passed']]}))
raise SystemExit(bool(report['additionalFailed']))
