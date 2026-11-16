"""Focused independent two-fix rereview; original fixtures/receipts untouched."""
import ast, copy, difflib, hashlib, importlib.util, json, subprocess, sys
from pathlib import Path
H=Path(__file__).resolve().parent
S=H.parent
sha=lambda b:hashlib.sha256(b).hexdigest()
pins={
 'scene-m4-v03-verifier-correctness-repair-report.md':'606939a3cebb1b9fbbc7222e1a9c2de72eb911ccb6db4f3449ec6dd79a1e0363',
 'scene-coordination/m4-v03-verifier-v3r1.py':'3f32c40e4eca885219b0cb34e8737a318f8fff803b4dfa1950b3857cd956307d',
 'scene-coordination/m4-v03-verifier-v3r1-tests.py':'ee285af8df5e9e5b37a0e1f58b951e03da9cae8fda0563ce7c98344a608c3c33',
 'scene-coordination/m4-v03-verifier-v3r1-tests.json':'dc7f06b6f674bd03014f43beb6fe5ce6447f0bd050b54e1227b7e6e213c00ea8',
 'scene-coordination/m4-v03-verifier-declaration-contract-v3.json':'5632ca4a42214edc89776c05f6b8f80835c22ddc8fcbeb0429ea3c39f2670e97'}
receipt=json.loads((H/'m4-v03-verifier-v3r1-tests.json').read_bytes())
protected={**receipt['hashesAfter'],**pins}
before={k:sha((S/k).read_bytes()) for k in protected};assert before==protected
old=(H/'m4-v03-verifier-v3.py').read_text(encoding='utf-8')
new=(H/'m4-v03-verifier-v3r1.py').read_text(encoding='utf-8')
assert sha((H/'m4-v03-verifier-v3.py').read_bytes())=='0abeb41ea77153ab5bcc442771fff9828edd7220a416ec28f8d10bc7290669dc'
ot,nt=ast.parse(old),ast.parse(new)
defs=lambda t:{n.name:n for n in t.body if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
od,nd=defs(ot),defs(nt);assert od.keys()==nd.keys()
dump=lambda n:ast.dump(n,include_attributes=False)
changed=[k for k in od if dump(od[k])!=dump(nd[k])]
assert changed==['convex_boundary','audit_m4_v3']
nt.body=[od[n.name] if isinstance(n,(ast.FunctionDef,ast.ClassDef)) and n.name in changed else n for n in nt.body]
assert dump(nt)==dump(ot),'Changes outside the two definitions'
spec=importlib.util.spec_from_file_location('fixed',H/'m4-v03-verifier-v3r1.py')
V=importlib.util.module_from_spec(spec);spec.loader.exec_module(V)
# Extract only original fixture constants/functions, never run the prior probe.
t=ast.parse((H/'m4-v03-verifier-v3-independent-probes.py').read_bytes())
selected=[n for n in t.body if (isinstance(n,ast.Assign) and any(isinstance(x,ast.Name) and x.id in ('FIXTURES','source') for x in n.targets)) or (isinstance(n,ast.FunctionDef) and n.name in ('row','fixture'))]
scope={'copy':copy,'sha':sha}
exec(compile(ast.Module(body=selected,type_ignores=[]),'original-frozen-fixtures-only','exec'),scope)
results=[]
for name in ('ordered','backtracking','backtracking-floor'):
    rows,decl=scope['fixture'](name);snap=copy.deepcopy((rows,decl))
    r=V.audit_m4_v3(rows,decl,expected_declaration_sha256=scope['FIXTURES'][name][1],source_bytes={'synthetic':scope['source']})
    assert (rows,decl)==snap and r['candidateAcceptance'] is False
    if name=='ordered':assert r['valid']
    else:
        assert not r['valid'] and r['coverage']['errors'][0]['code']=='nonConvexOrCrossedBoundary'
        assert r['supportGeometry']['status']==r['normalValidity']['status']=='not_run'
    json.dumps(r,allow_nan=False)
    results.append({'name':name,'passed':True,'result':r,'inputsUnchanged':True})
points=[[0.,0.],[1.,0.],[2.,0.],[3.,0.],[3.,3.],[0.,3.]]
for name,polygon in [('forward-collinear-ccw',points),('forward-collinear-cw',points[::-1])]:
    actual=V.convex_boundary(polygon,name).tolist()
    assert actual==points
    results.append({'name':name,'passed':True,'actualOrderedBoundaryPreserved':True})
for kind in ('deep','cycle'):
    d={'schema':V.SCHEMA,'scope':'fixture','nested':[]};cursor=d['nested']
    if kind=='cycle':cursor.append(cursor)
    else:
        for _ in range(1100):child=[];cursor.append(child);cursor=child
    r=V.audit_m4_v3({},d,expected_declaration_sha256='0'*64,source_bytes={})
    assert not r['valid'] and not r['candidateAcceptance']
    assert r['coverage']['errors'][0]['code']=='malformedInput'
    assert r['supportGeometry']['status']==r['normalValidity']['status']=='not_run'
    json.dumps(r,allow_nan=False)
    results.append({'name':kind+' declaration','passed':True,'result':r})
# One writer suite, no --write; no other suite or source search.
run=subprocess.run([sys.executable,'-B',str(H/'m4-v03-verifier-v3r1-tests.py')],capture_output=True,text=True,
                   creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
assert run.returncode==0,(run.stdout,run.stderr)
summary=json.loads(run.stdout);assert summary['passed'] and summary['testCount']==67 and not summary['failures']
prior=json.loads((H/'m4-v03-verifier-v3-tests.json').read_bytes())
assert [r['name'] for r in receipt['tests'][:58]]==[r['name'] for r in prior['tests']]
after={k:sha((S/k).read_bytes()) for k in protected};assert before==after
out={'scope':'Independent focused implementation rereview only; no candidate/source-producer/art/export acceptance',
 'pins':pins,'immutableBefore':before,'immutableAfter':after,'changedDefinitions':changed,
 'allOtherModuleAstUnchanged':True,'fullDiff':list(difflib.unified_diff(old.splitlines(),new.splitlines(),fromfile='frozen-v3',tofile='v3r1')),
 'originalFrozenFixturePins':scope['FIXTURES'],'independentProbes':results,'passed':len(results),
 'writerSuiteRuns':1,'writerWriteFlag':False,'writerResult':summary,'original58NamesPreserved':True,
 'limits':'No unfinished v04/producer read; complete candidate producer/source reproduction and art acceptance remain separate'}
with (H/'m4-v03-verifier-v3r1-independent-probes.json').open('x',encoding='utf-8') as f:json.dump(out,f,indent=2);f.write('\n')
print(json.dumps({'independentPassed':len(results),'writerTests':67,'changedDefinitions':changed,'protectedUnchanged':True}))
