"""Focused independent M4 repair review: pure CPU, no artist artifact writes."""
import ast
import copy
import difflib
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
COMMIT = 'fbe08dae8bbf3f565382d804adafc7dec162563a'
PINS = {
    'm4-transition-guard.py': 'ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b',
    'm4-transition-guard-tests.py': 'd17413ab80c0da964926f46c97cfc61f21f832fc25cddd521e8a49e19badf1c9',
    'm4-transition-guard-tests-v2.json': '4b84d112964c0d1aa671aebab511f4ff250d8c0feb268531e1cc36fa29434b46',
    'm4-scene-provenance-amendment-v01.json': '3b3a011d5d2f599dc63a4bf31aacd115513eb06c31267ddee0201209cebb2229',
    'm4-transition-guard-v2.diff': '59f16120771211f964509554f71e6fdf06cb53b489604831c995a8c37759bcfb',
    'm4-model-contract.json': '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98',
    'm4-transition-guard-tests-v1.json': '6a90cc5c69c79ec676ebdd08db96b5ac80be97cee6b0e2154692ff9f7afc3134',
    'm4-transition-guard-independent-review.md': 'f46c07f30991c0e65b0bd104e381c1b1b6919e772058d27b7e641c437f58dcac',
}
sha = lambda data: hashlib.sha256(data).hexdigest()
before = {name: sha((HERE/name).read_bytes()) for name in PINS}
assert before == PINS, before
writer = json.loads((HERE/'m4-transition-guard-tests-v2.json').read_text(encoding='utf-8'))
assert writer['passed'] == writer['total'] == 81
protected = {path: sha(Path(path).read_bytes()) for path in writer['protectedHashesAfter']}
assert protected == writer['protectedHashesAfter']

preimages = {}
full_diff = ''
for name, expected in [('m4-transition-guard.py', '32673405c0f07e248899e3b4a855081cfb8a98b0ef2077e00e558892481e1b6a'),
                       ('m4-transition-guard-tests.py', '48cf26cee1c47a451bf90e5f42db6b842afddc2f9f0cdeead95daa71cb3cd108')]:
    relative = 'design/studio-v2/scene-coordination/' + name
    previous = subprocess.run(['git', 'show', COMMIT+':'+relative], cwd=REPO, capture_output=True,
                              check=True, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0)).stdout
    assert sha(previous) == expected, (name, sha(previous))
    preimages[name] = previous
    old_lines = previous.decode('utf-8').replace('\r\n', '\n').splitlines(keepends=True)
    new_lines = (HERE/name).read_text(encoding='utf-8').splitlines(keepends=True)
    full_diff += ''.join(difflib.unified_diff(old_lines, new_lines,
                        fromfile=COMMIT+'/'+relative, tofile='working/'+relative))
assert full_diff == (HERE/'m4-transition-guard-v2.diff').read_text(encoding='utf-8')

old_tree = ast.parse(preimages['m4-transition-guard.py'])
new_tree = ast.parse((HERE/'m4-transition-guard.py').read_bytes())
definitions = lambda tree: {n.name:n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef))}
old, new = definitions(old_tree), definitions(new_tree)
assert old.keys() == new.keys()
dump = lambda value: ast.dump(value, include_attributes=False)
changed = [name for name in old if dump(old[name]) != dump(new[name])]
assert changed == ['_audit', 'audit_m4_transition'], changed
def retained_tail(function):
    for index, statement in enumerate(function.body):
        if isinstance(statement, ast.For) and 'retainedNode' in dump(statement):
            return dump(ast.Module(body=function.body[index:], type_ignores=[]))
    raise AssertionError('retainedNode tail missing')
assert retained_tail(old['_audit']) == retained_tail(new['_audit'])
assert dump(old['main']) == dump(new['main'])

spec = importlib.util.spec_from_file_location('m4_focused_fixtures', HERE/'m4-transition-guard-tests.py')
fixtures = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixtures)  # Defines synthetic helpers only; never calls the 81-test main.
guard = fixtures.guard
parent = fixtures.PARENT
parent_doc = fixtures.PARENT_DOC
amendment = guard.PROVENANCE
request_bytes = (HERE/'m4-scene-provenance-request.json').read_bytes()
request = json.loads(request_bytes)
expected_before = {'fk_variant':'proposal','fk_tag':'m3-v02','fk_profile':'studio-full-kit-v1',
                   'fk_stage':'M3','fk_m2_tag':'v04-pc','fk_m3_tag':'v02'}
expected_after = {**expected_before, 'fk_tag':'m4-v01', 'fk_stage':'M4', 'fk_m4_tag':'v01'}
expected_asset = {'generator':'Khronos glTF Blender I/O v5.2.41','version':'2.0'}
assert sha(request_bytes) == amendment['requestSha256']
assert parent_doc['scenes'][0]['extras'] == request['before'] == amendment['before'] == expected_before
assert request['after'] == amendment['after'] == expected_after
assert parent_doc['asset'] == request['unchangedAssetMetadata'] == amendment['assetMetadata'] == expected_asset
assert len(parent_doc['scenes']) == amendment['sceneCount'] == 1
assert parent_doc['scenes'][0]['name'] == amendment['sceneName'] == request['unchangedSceneName'] == 'Scene'
assert [parent_doc['nodes'][i]['name'] for i in parent_doc['scenes'][0]['nodes']] == amendment['sceneRootNames'] == ['studio_full_kit']
assert request['unchangedRoot'] == 'studio_full_kit'
assert {k for k in expected_before if expected_before[k] != expected_after[k]} == {'fk_tag','fk_stage'}
assert expected_after.keys() - expected_before.keys() == {'fk_m4_tag'}

results = []
def probe(name, mutate=None, valid=False, code=None):
    d,b = fixtures.synthetic()
    assert d['scenes'][0]['extras'] == expected_after
    if mutate:
        mutate(d,b)
    raw = fixtures.encode(d,b)
    parent_snapshot, candidate_snapshot = bytes(parent), bytes(raw)
    result = guard.audit_m4_transition(parent,raw)
    assert result['valid'] is valid, (name,result)
    assert isinstance(result['errors'],list)
    if code:
        assert any(e['code'] == code for e in result['errors']), (name,result)
    assert json.loads(json.dumps(result,allow_nan=False)) == result
    assert parent == parent_snapshot and raw == candidate_snapshot
    assert result['parentSha256'] == sha(parent_snapshot) == guard.PARENT_SHA
    assert result['candidateSha256'] == sha(candidate_snapshot)
    assert result['sceneProvenanceAmendmentSha256'] == PINS['m4-scene-provenance-amendment-v01.json']
    results.append({'name':name,'passed':True,'valid':valid,'codes':sorted({e['code'] for e in result['errors']}),
                    'jsonSafe':True,'inputsPreserved':True})
    return result

positive = probe('exact approved M4 v01 metadata with pinned corrected parent',valid=True)
probe('stale entire M3 metadata rejected',lambda d,b:d['scenes'][0].update(extras=copy.deepcopy(expected_before)),code='sceneMetadata')
probe('unapproved future M4 tag rejected',lambda d,b:d['scenes'][0]['extras'].update(fk_tag='m4-v02'),code='sceneMetadata')
probe('wrong stage rejected',lambda d,b:d['scenes'][0]['extras'].update(fk_stage='M3'),code='sceneMetadata')
probe('wrong M4 revision rejected',lambda d,b:d['scenes'][0]['extras'].update(fk_m4_tag='v02'),code='sceneMetadata')
for key in expected_after:
    probe('missing exact key '+key,lambda d,b,key=key:d['scenes'][0]['extras'].pop(key),code='sceneMetadata')
for key in ['fk_variant','fk_profile','fk_m2_tag','fk_m3_tag']:
    probe('inherited value remains exact '+key,lambda d,b,key=key:d['scenes'][0]['extras'].update({key:'changed'}),code='sceneMetadata')
probe('additional extras key rejected',lambda d,b:d['scenes'][0]['extras'].update(extra='unapproved'),code='sceneMetadata')
probe('additional scene field rejected',lambda d,b:d['scenes'][0].update(extras2={}),code='sceneMetadata')
probe('scene name stays exact',lambda d,b:d['scenes'][0].update(name='other'),code='sceneMetadata')
probe('asset generator stays exact',lambda d,b:d['asset'].update(generator='other'),code='documentMetadata')
probe('asset version stays exact',lambda d,b:d['asset'].update(version='2.1'),code='documentMetadata')
probe('other document metadata stays exact',lambda d,b:d.update(extras={'unexpected':True}),code='documentMetadata')
for collection in ['scenes','images','textures']:
    probe('former null-record escape now structured: '+collection,
          lambda d,b,collection=collection:d[collection].__setitem__(0,None),code='malformedInput')
probe('semantic reindexing and BIN relocation still pass',fixtures.reorder,valid=True)
# Reuse only the earlier independent strided-UV mutation definition, not its runner.
earlier = ast.parse((HERE/'m4-independent-review-probes.py').read_text(encoding='utf-8'))
interleave_def = next(n for n in earlier.body if isinstance(n,ast.FunctionDef) and n.name=='interleave')
scope = {'copy':copy,'primitive':fixtures.primitive}
exec(compile(ast.Module(body=[interleave_def],type_ignores=[]),'earlier-review-interleave-only','exec'),scope)
probe('retained UV storage repacking still passes',scope['interleave'],valid=True)
probe('retained prior-noise UV word still rejected',lambda d,b:fixtures.flip(d,b,'desk_top__top','TEXCOORD_0',258,0),code='retainedAccessorBytes')
probe('retained boolean drift still rejected',lambda d,b:fixtures.node(d,'desk_top__top')['extras'].update(occluder=1),code='retainedNode')
probe('new row flags stay binding',lambda d,b:fixtures.node(d,'music_cables__runs')['extras'].update(occluder=False),code='newRowFlags')
def palette_flip(d,b):
    image = next(i for i in d['images'] if i['name']=='fk_palette_colour')
    view = d['bufferViews'][image['bufferView']]
    b[view.get('byteOffset',0)+20] ^= 1
probe('palette bytes stay exact',palette_flip,code='imageBytes')
probe('material definition stays exact',lambda d,b:d['materials'][0]['pbrMetallicRoughness'].update(roughnessFactor=0.123),code='materialDefinition')

after = {name:sha((HERE/name).read_bytes()) for name in PINS}
assert before == after
assert protected == {path:sha(Path(path).read_bytes()) for path in protected}
cli_evidence = next(r for r in writer['results'] if r['name']=='receipt-only CLI and exclusive existing-path refusal')
assert cli_evidence['passed'] and cli_evidence['evidence']['malformedExit'] == 1
output = {
    'scope':'focused independent helper repair only; no actual M4, structural/visual/stage acceptance',
    'protectedPinsBefore':before,'protectedPinsAfter':after,
    'allWriterProtectedHashesRechecked':True,'preimageCommit':COMMIT,
    'exactPreimageHashesVerified':True,'reproducedFullHelperAndTestDiff':True,
    'changedFunctionNames':changed,'retainedChecksThroughBudgetsAstIdentical':True,'cliAstIdentical':True,
    'amendmentMatchesActualParentAndAuthorRequestAndRootValues':True,
    'parentSceneBefore':expected_before,'approvedSceneAfter':expected_after,
    'writerReceiptReviewedNotRerun':{'passed':81,'total':81,'cli':cli_evidence},
    'syntheticPositiveMetrics':positive['metrics'],
    'results':results,'passed':len(results),'total':len(results),
}
with (HERE/'m4-focused-rereview-probes.json').open('x',encoding='utf-8') as out:
    json.dump(output,out,indent=2,allow_nan=False);out.write('\n')
print(json.dumps({'passed':len(results),'total':len(results),'changedFunctions':changed,'protectedHashesUnchanged':True}))
