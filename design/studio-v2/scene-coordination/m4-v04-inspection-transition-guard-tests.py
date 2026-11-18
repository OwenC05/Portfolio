"""Bounded successor fixtures; no old suite, real M4 candidate or Blender run."""
import ast
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import struct
import sys
import time
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
OUTPUT = HERE/'m4-v04-inspection-transition-guard-tests.json'
HELPER = HERE/'m4-v04-inspection-transition-guard.py'
OLD_TEST_SHA = 'd17413ab80c0da964926f46c97cfc61f21f832fc25cddd521e8a49e19badf1c9'
spec=importlib.util.spec_from_file_location('inspection_guard',HELPER)
guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
PARENT=guard.pinned(guard.KIT/guard.CONTRACT['parent']['glb'],guard.PARENT_SHA)
PARENT_DOC,PARENT_BIN=guard.parse_glb(PARENT)


def fixture_helpers():
    # Reuse only the reviewed fixture constructors, never import/run its suite.
    raw=guard.pinned(HERE/'m4-transition-guard-tests.py',OLD_TEST_SHA)
    names={'encode','synthetic','node','primitive','flip','reorder'}
    nodes=[n for n in ast.parse(raw).body if isinstance(n,ast.FunctionDef) and n.name in names]
    assert {n.name for n in nodes}==names
    scope={'copy':copy,'json':json,'struct':struct,'guard':guard,'PARENT':PARENT,
           'PARENT_DOC':PARENT_DOC,'PARENT_BIN':PARENT_BIN,'M4_SCENE_EXTRAS':copy.deepcopy(guard.PROVENANCE['after'])}
    exec(compile(ast.Module(body=nodes,type_ignores=[]),'pinned-fixture-constructors-only','exec'),scope)
    return scope


def protected():
    paths=[HELPER,Path(__file__),HERE/'m4-transition-guard.py',HERE/'m4-transition-guard-tests.py',
           HERE/'m4-transition-guard-tests-v2.json',HERE/'m4-transition-guard-focused-rereview.md',
           HERE/'m4-v04-inspection-export-contract.md',HERE/'m4-v04-inspection-provenance-proposal.json',
           HERE/'m4-v04-root-expected-pins.json',HERE/'m4-v04-candidate-audit.py',HERE/'m4-v04-candidate-audit.json',
           HERE/'m4-v04-candidate-audit.md',HERE/'m4-model-contract.json',
           guard.KIT/'source/build_fullkit_m3.py',guard.KIT/'full-kit-profile-v1.json',guard.KIT/'asset-inventory.json',
           guard.KIT/guard.CONTRACT['parent']['glb'],guard.KIT/guard.CONTRACT['parent']['manifest'],
           guard.KIT/'source/build_fullkit_m4_v04.py',guard.KIT/'source/build_fullkit_m4_geometry_v04.py',
           guard.KIT/'source/produce_fullkit_m4_v04.py',guard.KIT/'source/measure_fullkit_m4_v04.py',
           guard.KIT/'manifests/m4-v04-rows.json',guard.KIT/'manifests/m4-v04-verifier-declaration.json',
           guard.KIT/'manifests/m4-v04-cpu-measurements.json',guard.KIT/'manifests/m4-v04-author-declarations.json']
    return {str(p.relative_to(HERE.parent)):guard.sha(p.read_bytes()) for p in paths}


def run(write=False):
    if write and OUTPUT.exists():raise FileExistsError(OUTPUT)
    before=protected();f=fixture_helpers();results=[];start=time.monotonic()
    def test(name,operation):
        try:results.append({'name':name,'passed':True,'evidence':operation()})
        except Exception as error:results.append({'name':name,'passed':False,'error':repr(error)})
    def exercise(mutation=None,code=None):
        doc,binary=f['synthetic']()
        if mutation:mutation(doc,binary)
        raw=f['encode'](doc,binary);identity=guard.sha(raw)
        result=guard.audit_m4_transition(PARENT,raw)
        assert result['valid']==(code is None),result['errors']
        if code:assert code in {e['code'] for e in result['errors']},result['errors']
        assert guard.sha(raw)==identity and result['candidateSha256']==identity
        assert json.loads(json.dumps(result,allow_nan=False))==result
        return {'valid':result['valid'],'codes':sorted({e['code'] for e in result['errors']}),
                'retainedComparisons':result.get('metrics',{}).get('retainedAccessorComparisons'),'inputUnchanged':True}
    def ast_preserved():
        old=ast.parse((HERE/'m4-transition-guard.py').read_bytes());new=ast.parse(HELPER.read_bytes())
        defs=lambda tree:{n.name:ast.dump(n,include_attributes=False) for n in tree.body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
        a,b=defs(old),defs(new);changed={k for k in a if a[k]!=b[k]}
        assert a.keys()==b.keys() and changed=={'audit_m4_transition'},changed
        # The sole function change is explanatory receipt scope, never enforcement.
        fn=next(n for n in new.body if isinstance(n,ast.FunctionDef) and n.name=='audit_m4_transition')
        oldfn=next(n for n in old.body if isinstance(n,ast.FunctionDef) and n.name=='audit_m4_transition')
        for n in ast.walk(fn):
            if isinstance(n,ast.Constant) and n.value=='exact v04 inspection transition only; proposal is not export authorization; full structural validator still required':
                n.value='transition only; full structural validator and independent review still required'
        assert ast.dump(fn)==ast.dump(oldfn)
        return {'allEnforcementFunctionsAstIdentical':True,'changedFunctionOnlyScopeText':True}
    test('reviewed enforcement/parser/accessor/CLI AST unchanged',ast_preserved)
    test('exact v04 synthetic substitution against pinned real parent',exercise)
    test('storage remapping and BIN relocation preserve exact semantics',lambda:exercise(f['reorder']))
    for key in guard.PROVENANCE['after']:
        test('missing provenance '+key,lambda key=key:exercise(lambda d,b:d['scenes'][0]['extras'].pop(key),'sceneMetadata'))
    for key,value in [('fk_tag','m4-v01'),('fk_m4_tag','v01'),('fk_tag','m4-v04-inspection'),
                      ('fk_m4_tag','v05'),('fk_m3_tag','v03'),('fk_stage','M3')]:
        test('wrong exact provenance '+key+'='+value,lambda key=key,value=value:exercise(
            lambda d,b:d['scenes'][0]['extras'].update({key:value}),'sceneMetadata'))
    test('extra provenance key',lambda:exercise(lambda d,b:d['scenes'][0]['extras'].update(extra=True),'sceneMetadata'))
    test('unrelated scene field',lambda:exercise(lambda d,b:d['scenes'][0].update(extensions={}),'sceneMetadata'))
    test('exporter substitution',lambda:exercise(lambda d,b:d['asset'].update(generator='different'),'documentMetadata'))
    test('target reparenting',lambda:exercise(lambda d,b:f['node'](d,'target_dissertation').update(translation=[0,0,1]),'hierarchy'))
    for name,semantic,vertex in [('target_dissertation','POSITION',0),('desk_top__top','TEXCOORD_0',258),
                                 ('desk_top__top','NORMAL',0),('desk_top__top','indices',0)]:
        test('single retained word '+name+'/'+semantic,lambda name=name,semantic=semantic,vertex=vertex:exercise(
            lambda d,b:f['flip'](d,b,name,semantic,vertex),'retainedAccessorBytes'))
    def image_change(d,b):
        image=next(x for x in d['images'] if x['name']=='fk_palette_colour');v=d['bufferViews'][image['bufferView']]
        b[v.get('byteOffset',0)+20]^=1
    test('encoded image bytes',lambda:exercise(image_change,'imageBytes'))
    test('material factor',lambda:exercise(lambda d,b:d['materials'][0]['pbrMetallicRoughness'].update(roughnessFactor=.123),'materialDefinition'))
    test('row flag boolean substitution',lambda:exercise(lambda d,b:f['node'](d,'ctl_body__shell')['extras'].update(occluder=1),'newRowFlags'))
    test('row identity substitution',lambda:exercise(lambda d,b:f['node'](d,'music_cables__runs').update(name='other'),'hierarchy'))
    test('malformed scene is structured failure',lambda:exercise(lambda d,b:d['scenes'].__setitem__(0,None),'malformedInput'))
    def wrong_parent():
        d,b=f['synthetic']();r=guard.audit_m4_transition(PARENT[:-1]+bytes([PARENT[-1]^1]),f['encode'](d,b))
        assert not r['valid'] and r['errors'][0]['code']=='parentHashMismatch'
        return r['errors']
    test('exact accepted parent required',wrong_parent)
    def receipt_cli():
        candidate=Path('synthetic-in-memory.glb');report=Path('synthetic-in-memory-receipt.json')
        d,b=f['synthetic']();raw=f['encode'](d,b);modes=[];output=io.StringIO()
        class Sink:
            def __enter__(self):return output
            def __exit__(self,*args):return False
        readable={candidate:raw,guard.KIT/guard.CONTRACT['parent']['glb']:PARENT,HELPER:HELPER.read_bytes()}
        def read(path):return readable[path]
        def opened(path,mode,*args,**kwargs):
            assert path==report;modes.append(mode);assert mode=='x';return Sink()
        with patch.object(Path,'read_bytes',read),patch.object(Path,'exists',lambda path:False),patch.object(Path,'open',opened):
            # read_bytes uses io.open internally; candidate and dependencies remain in memory/read-only.
            assert guard.main([str(candidate),'--report',str(report)])==0
        assert modes==['x'] and json.loads(output.getvalue())['valid']
        try:guard.main(['missing-candidate','--report',str(HELPER)])
        except SystemExit as error:assert error.code==2
        else:raise AssertionError('existing receipt was not refused')
        return {'freshReceiptMode':'x','freshCliTestUsesMemorySink':True,'existingFileRejectedBeforeCandidateRead':True}
    test('receipt CLI exclusive creation and existing-path refusal without candidate file',receipt_cli)
    after=protected();assert before==after
    receipt={'schema':'m4-v04-inspection-transition-writer-fixtures/1','scope':'synthetic only; no candidate export or prior audit/suite rerun',
             'exportAuthorization':False,'candidateAcceptance':False,'sourceHashes':{'guard':guard.sha(HELPER.read_bytes()),
             'tests':guard.sha(Path(__file__).read_bytes())},'protectedBefore':before,'protectedAfter':after,
             'results':results,'passed':sum(r['passed'] for r in results),'total':len(results),'elapsedSeconds':time.monotonic()-start}
    if write:
        with OUTPUT.open('x',encoding='utf-8',newline='\n') as output:json.dump(receipt,output,indent=2,allow_nan=False);output.write('\n')
    print(json.dumps({k:receipt[k] for k in ('passed','total','elapsedSeconds')}))
    for result in results:
        if not result['passed']:print(json.dumps(result))
    return 0 if receipt['passed']==receipt['total'] else 1


if __name__=='__main__':
    if sys.argv[1:] not in ([],['--write']):raise SystemExit('Only --write supported')
    raise SystemExit(run('--write' in sys.argv))
