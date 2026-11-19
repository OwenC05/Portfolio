"""Small independent implementation probes; only a new review receipt is written."""
import ast
import copy
import hashlib
import importlib.util
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
STUDIO=HERE.parent
PINS={
 'scene-m4-v03-verifier-binding-report.md':'c76449289e38a5fee2f569eb1d001fc1639b8499a1d7be02c5983a6a88d59cd7',
 'scene-coordination/m4-v03-verifier-v3.py':'0abeb41ea77153ab5bcc442771fff9828edd7220a416ec28f8d10bc7290669dc',
 'scene-coordination/m4-v03-verifier-v3-tests.py':'d638fba2f657df9b88a6d4f85ce2906481c642ea54e5784f03a1b26022257659',
 'scene-coordination/m4-v03-verifier-v3-tests.json':'eac31cf2e41c24b20de348672b0e74111d11d447bf1e504977a7dce6d1143533',
 'scene-coordination/m4-v03-verifier-declaration-contract-v3.json':'5632ca4a42214edc89776c05f6b8f80835c22ddc8fcbeb0429ea3c39f2670e97',
}
sha=lambda b:hashlib.sha256(b).hexdigest()
writer=json.loads((HERE/'m4-v03-verifier-v3-tests.json').read_bytes())
protected={**writer['hashesAfter'],**PINS}
before={name:sha((STUDIO/name).read_bytes()) for name in protected}
assert before==protected
live_paths=list(writer['liveReviewHashesAfter'])
live_before={name:sha((STUDIO/name).read_bytes()) for name in live_paths}
spec=importlib.util.spec_from_file_location('reviewed_v3',HERE/'m4-v03-verifier-v3.py')
V=importlib.util.module_from_spec(spec);spec.loader.exec_module(V)

# Independently frozen with stdlib JSON/SHA only, before invoking the verifier.
# Expected values are literals; none is derived from the live input under test.
FIXTURES={
 'ordered':('881d1c67b3ff917f36c0d59f3bd977365eb16f03d4b4c5f9315cf9191d90c771','570dd143c3fb26bb753a6cac0b942e5ae5748cceddc79e4554429c39daf31eac'),
 'backtracking':('c41c137a926a3bfb6278a43d9b46c95de5fd1c0d7b409e1583e5253d821d7beb','3dd3769a81c9d587c6b009a79f63a98d146d835e4319aa6ed20e1b78b201921e'),
 'backtracking-floor':('b56cb817324c73313dacc275d9c163c8f65d4145a1ef8b56f67a0aee303f2301','56fec6794e81def94c09f8d187d555c22d6235ab64a60b38eb778c56c2ec3e11'),
}
source=b'independent synthetic polygon fixture, no artistic candidate'
def row(vertices):
    return {'vertices':vertices,'faces':[list(range(len(vertices)))],
       'groups':[{'id':'surface','vertexRange':[0,len(vertices)],'faceRange':[0,1],
        'triangleCount':len(vertices)-2,'n1':'out_of_scope',
        'reason':'Synthetic support geometry only; no artistic N1 assertion'}],
       'faceClasses':['out_of_scope']}
def fixture(name):
    xs=[0.,1.,2.,3.] if name=='ordered' else [0.,2.,1.,3.]
    rows={'receiver':row([[x,0.,0.] for x in xs]+[[3.,3.,0.],[0.,3.,0.]]),
          'foot':row([[1.,1.,.0003],[1.1,1.,.0003],[1.1,1.1,.0003],[1.,1.1,.0003]])}
    if name=='backtracking-floor':
        rows['foot']=row([[4.,1.,.0003],[4.1,1.,.0003],[4.1,1.1,.0003],[4.,1.1,.0003]])
    decl={'schema':'m4-source-declaration/3','scope':'fixture',
      'sources':{'synthetic':sha(source)},'rowsSha256':FIXTURES[name][0],
      'rows':[{'id':k,'vertexCount':len(r['vertices']),'faceCount':1,'normalsRequired':False,
               'groups':copy.deepcopy(r['groups']),'faceClasses':list(r['faceClasses'])} for k,r in rows.items()],
      'surfaces':[{'id':'field','kind':'bare_floor' if name=='backtracking-floor' else 'rug_field','boundaryRow':'receiver','boundaryFace':0}],
      'supports':[{'id':'foot','row':'foot','group':'surface','surface':'field'}]}
    return rows,decl
results=[]
for name in FIXTURES:
    rows,decl=fixture(name);snapshot=copy.deepcopy((rows,decl))
    result=V.audit_m4_v3(rows,decl,expected_declaration_sha256=FIXTURES[name][1],source_bytes={'synthetic':source})
    assert (rows,decl)==snapshot and result['candidateAcceptance'] is False
    json.dumps(result,allow_nan=False)
    # Record the observed defect, not a green test that excuses it.
    results.append({'name':name,'expectedCoverageValid':name=='ordered','actual':result,
                    'expectationMet':result['coverage']['valid']==(name=='ordered'),'inputsPreserved':True})
    assert result['coverage']['valid'] and result['supportGeometry']['status']=='checked'
rows,decl=fixture('ordered')
changed=copy.deepcopy(rows);changed['foot']['vertices'][0][0]+=.001
bound=V.audit_m4_v3(changed,decl,expected_declaration_sha256=FIXTURES['ordered'][1],source_bytes={'synthetic':source})
assert not bound['valid'] and bound['coverage']['errors'][0]['code']=='rowsPinMismatch'
assert bound['supportGeometry']['status']==bound['normalValidity']['status']=='not_run'
results.append({'name':'same frozen fixture rejects substituted payload','expectationMet':True,'actual':bound})

deep={'schema':V.SCHEMA,'scope':'fixture','nested':[]};cursor=deep['nested']
for _ in range(1100):
    child=[];cursor.append(child);cursor=child
try:
    result=V.audit_m4_v3({},deep,expected_declaration_sha256='0'*64,source_bytes={})
    results.append({'name':'deep malformed declaration','expectationMet':not result['valid'],'actual':result})
except Exception as error:
    results.append({'name':'deep malformed declaration','expectationMet':False,'escapedException':type(error).__name__,
                    'message':str(error)})

def definitions(path):
    return {n.name:ast.dump(n,include_attributes=False) for n in ast.parse(path.read_bytes()).body
            if isinstance(n,(ast.FunctionDef,ast.ClassDef))}
old,new=definitions(HERE/'m4-v03-verifier-v2.py'),definitions(HERE/'m4-v03-verifier-v3.py')
unchanged=sorted(k for k in old.keys()&new.keys() if old[k]==new[k])
assert len(unchanged)==15
assert [k for k in old.keys()&new.keys() if old[k]!=new[k]]==['validate_coverage']
after={name:sha((STUDIO/name).read_bytes()) for name in protected};assert after==before
live_after={name:sha((STUDIO/name).read_bytes()) for name in live_paths}
report={'scope':'Independent implementation review probes, not candidate or artistic acceptance',
 'pins':PINS,'immutableHashesBefore':before,'immutableHashesAfter':after,
 'authorizedLiveReviewHashesBefore':live_before,'authorizedLiveReviewHashesAfter':live_after,
 'writerSuiteRerun':{'command':'python -B design/studio-v2/scene-coordination/m4-v03-verifier-v3-tests.py',
                    'runs':1,'writeFlag':False,'exit':0,'passed':58,'failures':0,'elapsedSeconds':1.4059999999590218},
 'fixturePins':FIXTURES,'sourceFixtureSha256':sha(source),'unchangedInheritedDefinitions':unchanged,
 'results':results,'expectationsMet':sum(r['expectationMet'] for r in results),'total':len(results),
 'blockingFindings':['non-simple backtracking receiver accepted','deep declaration RecursionError escapes API'],
 'candidateProducerIntegration':'UNSATISFIED; payload identity does not prove source derivation or author intent'}
report['earlierObservation']='Original independent-probes.json preserved: indoor backtracking case rejects only downstream as outside, not at the required boundary gate. Added separately frozen bare-floor fixture demonstrates full false pass; earlier fixture pins unchanged.'
with (HERE/'m4-v03-verifier-v3-independent-probes-v2.json').open('x',encoding='utf-8') as out:
    json.dump(report,out,indent=2,allow_nan=False);out.write('\n')
print(json.dumps({'expectationsMet':report['expectationsMet'],'total':len(results),
 'findings':report['blockingFindings'],'protectedUnchanged':True,
 'authorizedLivePairChanged':live_before!=live_after}))
