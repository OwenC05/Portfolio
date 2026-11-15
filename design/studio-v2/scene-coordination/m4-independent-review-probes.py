"""Independent CPU-only review of the frozen M4 guard; no artist artifacts written."""
import ast
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import struct
import sys

HERE = Path(__file__).resolve().parent
HELPER = HERE / 'm4-transition-guard.py'
TESTS = HERE / 'm4-transition-guard-tests.py'
EXPECTED = {
    HELPER: '32673405c0f07e248899e3b4a855081cfb8a98b0ef2077e00e558892481e1b6a',
    TESTS: '48cf26cee1c47a451bf90e5f42db6b842afddc2f9f0cdeead95daa71cb3cd108',
    HERE / 'm4-model-contract.json': '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98',
    HERE / 'm4-transition-guard-tests-v1.json': '6a90cc5c69c79ec676ebdd08db96b5ac80be97cee6b0e2154692ff9f7afc3134',
}

def hashes():
    return {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in EXPECTED}

before = hashes()
assert before == {str(p): h for p, h in EXPECTED.items()}, before

# Rerun all 50 original in-memory checks. Omit only the CLI test because it writes
# and deletes fixtures outside this review's owned prefix. Its frozen receipt is
# read separately; it is not represented as an independently rerun check.
tree = ast.parse(TESTS.read_text(encoding='utf-8'))
removed = 0
for function in tree.body:
    if isinstance(function, ast.FunctionDef) and function.name == 'main':
        retained = []
        for statement in function.body:
            if (isinstance(statement, ast.Expr) and isinstance(statement.value, ast.Call)
                and isinstance(statement.value.func, ast.Name) and statement.value.func.id == 'check'
                and statement.value.args and isinstance(statement.value.args[0], ast.Constant)
                and statement.value.args[0].value == 'receipt-only CLI and exclusive existing-path refusal'):
                removed += 1
            else:
                retained.append(statement)
        function.body = retained
assert removed == 1
scope = {'__file__': str(TESTS), '__name__': 'independent_in_memory_rerun'}
exec(compile(tree, str(TESTS), 'exec'), scope)
sys.argv = [str(TESTS), '--report', str(HERE / 'm4-independent-review-rerun.json')]
if not (HERE / 'm4-independent-review-rerun.json').exists():
    assert scope['main']() == 0
else:
    previous = json.loads((HERE / 'm4-independent-review-rerun.json').read_text(encoding='utf-8'))
    assert previous['passed'] == previous['total'] == 50
    assert previous['helperSha256'] == EXPECTED[HELPER] and previous['testSha256'] == EXPECTED[TESTS]
guard = scope['guard']
synthetic, encode, node, primitive, flip = (scope[k] for k in ['synthetic', 'encode', 'node', 'primitive', 'flip'])
parent = scope['PARENT']
results = []

def probe(name, change, expected, code=None, detail=None):
    d, b = synthetic()
    change(d, b)
    raw = encode(d, b)
    try:
        receipt = guard.audit_m4_transition(parent, raw)
        actual = 'valid' if receipt['valid'] else 'invalid'
        codes = sorted({e['code'] for e in receipt['errors']})
        passed = actual == expected and (code is None or code in codes)
        if detail:
            passed = passed and detail(receipt)
        result = {'name': name, 'expected': expected, 'actual': actual, 'passed': passed,
                  'codes': codes, 'errors': receipt['errors'][:3]}
    except Exception as error:
        result = {'name': name, 'expected': expected, 'actual': 'exception', 'passed': False,
                  'exception': type(error).__name__, 'message': str(error)}
    results.append(result)

def interleave(d, b):
    ai = primitive(d, 'desk_top__top')['attributes']['TEXCOORD_0']
    a = d['accessors'][ai]
    v = d['bufferViews'][a['bufferView']]
    old_start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    old_stride = v.get('byteStride', 8)
    old = bytes(b)
    b.extend(b'\0' * (-len(b) % 4))
    offset = len(b)
    for i in range(a['count']):
        b.extend(old[old_start+i*old_stride:old_start+i*old_stride+8] + b'\0'*4)
    new_view = copy.deepcopy(v)
    new_view.update(byteOffset=offset, byteLength=a['count']*12, byteStride=12)
    d['bufferViews'].append(new_view)
    a.update(bufferView=len(d['bufferViews'])-1, byteOffset=0)

probe('retained UV repacking into strided storage preserves exact logical bytes', interleave, 'valid')

def split_accessor(d, b):
    # Clone a shared retained mesh for one node, then clone only its UV accessor.
    n = node(d, 'mon_side__copilot')
    mesh = copy.deepcopy(d['meshes'][n['mesh']])
    n['mesh'] = len(d['meshes']); d['meshes'].append(mesh)
    p = mesh['primitives'][0]
    d['accessors'].append(copy.deepcopy(d['accessors'][p['attributes']['TEXCOORD_0']]))
    p['attributes']['TEXCOORD_0'] = len(d['accessors'])-1

probe('shared retained accessor splitting rejected even with identical bytes', split_accessor,
      'invalid', 'retainedSharingChanged', lambda r: any(e.get('kind') == 'accessor' for e in r['errors']))

def collapse_accessors(d, b):
    p = primitive(d, 'desk_top__top')
    p['attributes']['NORMAL'] = p['attributes']['POSITION']

probe('distinct retained accessors cannot collapse onto one reference', collapse_accessors,
      'invalid', 'retainedSharingChanged')
probe('retained transform numeric boolean cannot exploit Python equality',
      lambda d,b: node(d, 'studio_full_kit').update(scale=[True, True, True]), 'invalid')
probe('retained boolean flag cannot become numeric one',
      lambda d,b: node(d, 'desk_top__top')['extras'].update(occluder=1), 'invalid', 'retainedNode')
probe('retained frost renderOrder cannot drift',
      lambda d,b: node(d, 'kb_case__frost_shell')['extras'].update(renderOrder=2), 'invalid')
probe('retained full image metadata including name cannot drift',
      lambda d,b: d['images'][0].update(name='renamed_existing_image'), 'invalid', 'imageIdentities')

def material_slot(d, b):
    material = next(m for m in d['materials'] if m['name'] == 'lib_palette')
    slot = material['pbrMetallicRoughness']['baseColorTexture']
    slot['index'] = (slot['index']+1) % len(d['textures'])

probe('material texture slot changed without changing texture graph', material_slot, 'invalid', 'materialDefinition')
probe('duplicate existing texture record is unexpected graph data',
      lambda d,b: d['textures'].append(copy.deepcopy(d['textures'][0])), 'invalid', 'textureWiring')
probe('retained target normal payload changed',
      lambda d,b: flip(d,b,'display_studio','NORMAL'), 'invalid', 'retainedAccessorBytes')
probe('full semantic relocation remains accepted in independent invocation',
      lambda d,b: scope['reorder'](d,b), 'valid')
# Exact pixel meaning is protected more strongly here by encoded-byte identity;
# original independent rerun exercises both palette byte flips.
probe('honest M4 provenance currently rejected (known release blocker)',
      lambda d,b: d['scenes'][0]['extras'].update(fk_stage='M4', fk_tag='m4-v01', fk_m4_tag='v01'),
      'invalid', 'sceneMetadata')

probe('negative accessor reference rejected',
      lambda d,b: primitive(d,'ctl_body__shell')['attributes'].update(POSITION=-1), 'invalid', 'invalidReference')
probe('out-of-buffer retained accessor offset rejected',
      lambda d,b: d['accessors'][primitive(d,'desk_top__top')['attributes']['POSITION']].update(byteOffset=len(b)+1),
      'invalid', 'accessorBounds')
probe('sparse retained accessor unsupported and rejected',
      lambda d,b: d['accessors'][primitive(d,'desk_top__top')['attributes']['POSITION']].update(sparse={}),
      'invalid', 'sparseAccessorUnsupported')
probe('malformed scene value returns invalid receipt', lambda d,b: d['scenes'].__setitem__(0, None), 'invalid')
probe('malformed image record returns invalid receipt', lambda d,b: d['images'].__setitem__(0, None), 'invalid')
probe('malformed accessor record returns invalid receipt',
      lambda d,b: d['accessors'].__setitem__(primitive(d,'ctl_body__shell')['attributes']['POSITION'], None), 'invalid')
probe('malformed texture record returns invalid receipt', lambda d,b: d['textures'].__setitem__(0, None), 'invalid')

# Raw malformed inputs bypass fixture JSON encoding, still exercising the public API.
for name, raw in [('truncated GLB', parent[:20]), ('invalid UTF8 JSON',
        parent[:20] + b'\xff' + parent[21:])]:
    r = guard.audit_m4_transition(parent, raw)
    results.append({'name': name, 'expected': 'invalid', 'actual': 'invalid' if not r['valid'] else 'valid',
                    'passed': not r['valid'], 'codes': sorted({e['code'] for e in r['errors']})})

after = hashes()
assert before == after
original = json.loads((HERE/'m4-transition-guard-tests-v1.json').read_text(encoding='utf-8'))
rerun = json.loads((HERE/'m4-independent-review-rerun.json').read_text(encoding='utf-8'))
assert original['passed'] == original['total'] == 51
assert rerun['passed'] == rerun['total'] == 50
output = {'scope': 'independent frozen M4 helper synthetic CPU review; no actual M4 artifact or art acceptance',
          'originalReceipt': {'passed':51, 'independentlyRerun':50, 'omitted':'CLI fixture writing/cleanup only; reviewed source and frozen receipt'},
          'protectedHashesBefore':before, 'protectedHashesAfter':after,
          'additionalResults':results, 'passed':sum(r['passed'] for r in results), 'total':len(results),
          'apiContractFailures':[r for r in results if not r['passed']]}
with (HERE/'m4-independent-review-probes.json').open('x', encoding='utf-8') as f:
    json.dump(output, f, indent=2, allow_nan=False); f.write('\n')
print(json.dumps({'passed':output['passed'], 'total':output['total'], 'failures':output['apiContractFailures']}))
