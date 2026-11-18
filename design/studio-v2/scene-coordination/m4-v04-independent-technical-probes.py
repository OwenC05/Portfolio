"""Bounded independent v04 handoff review. No audit, export, rays or contacts run.

Only --write creates this review's new evidence and non-authoritative proposal.
Expected identities below are literal root-supplied pins, never learned from input.
"""
import copy
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys
import numpy as np

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parent
SOURCE = STUDIO / 'asset-pipeline/full-kit/source'
MANIFEST = STUDIO / 'asset-pipeline/full-kit/manifests'
PINS = {
 'scene-m4-v04-producer-report.md':'635572bf32854fa274f2445645a0604ba29a77d951abb4cd23880483340f4ac7',
 'scene-m4-v04-preparation-report.md':'6b2a62a31ab086a5a72c880ecad04332576a5ae14c31ab882f6421aa6f51c6be',
 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py':'8d814874ee0ac1317827297d2a729b34f4789fffd891212ae03e2c440a73b792',
 'asset-pipeline/full-kit/source/build_fullkit_m4_v04.py':'0d01536c36481021e8ff7026a6608998eb44dce0d88505dae105f94834909826',
 'asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json':'8ce8db34b40a3ce053d037c5152fec8c8ed19d586b0968439abf64e3308f32bb',
 'asset-pipeline/full-kit/source/produce_fullkit_m4_v04.py':'3c9fe150d859087050fed73d3fed54d3a97a5998774c455203e6a00462dc08d1',
 'asset-pipeline/full-kit/source/measure_fullkit_m4_v04.py':'d56efb031e843320625b610181885ff9110f1789b8bced9bef475f75f50ccf1b',
 'scene-coordination/m4-v04-producer-tests.py':'dcf7b924bb876a44b243e838aa3d4f59ae1ad987cb4b4fbdccaf3a6f39712039',
 'scene-coordination/m4-v04-producer-tests.json':'246465ffe6faa941cbaf81aff900e657fec1aedcd8f5347c2e7831c5a5a762c5',
 'asset-pipeline/full-kit/manifests/m4-v04-pose-comparison.json':'fc4af9e7e8842f315aa7ff3a3ff916e3f27977265e0544c4da7473643aa0eb04',
 'asset-pipeline/full-kit/manifests/m4-v04-rows.json':'1fa5fdd3f267896a76743aca986af9cadd1dd84610395e6049fc799009489992',
 'asset-pipeline/full-kit/manifests/m4-v04-verifier-declaration.json':'5d04a051398e09c9b2aeb309e2893efe09ed286a18e27113785ff487a7074d42',
 'asset-pipeline/full-kit/manifests/m4-v04-cpu-measurements.json':'be6c205db283f86ce8a8048c0dde58ae11e0cdb38ff326e1a4c62d26a9265bea',
}
EXPECTED = {
 'rowsSha256':'cfac1013f686bb7790bc2f5e9ed5acc518009ab7e2bc27d09ad09629c429533e',
 'declarationSha256':'a737d402307d0aa056e375934beab94c7696c1f5a14f0fe7d028893d5c30db7d',
 'invocationSha256':'5128d2a61205f9e4262814ca5bdd96ff661a5e613259c7af852ad9fe9c38f5c6',
}

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def canonical(value):
    return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode('utf-8')

def load(path):
    spec=importlib.util.spec_from_file_location(path.stem,path)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def run():
    before={p:digest((STUDIO/p).read_bytes()) for p in PINS}
    assert before==PINS, 'root supplied input identity differs'
    P=load(SOURCE/'produce_fullkit_m4_v04.py')
    M=load(SOURCE/'measure_fullkit_m4_v04.py')
    T=load(HERE/'m4-v04-producer-tests.py')  # reusable synthetic shapes only; suite not rerun
    hp=PINS['asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py']
    ap=PINS['asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json']
    product=P.produce_selected(SOURCE/'build_fullkit_m4_geometry_v04.py',hp,MANIFEST/'m4-v04-author-declarations.json',ap)
    rows=json.loads((MANIFEST/'m4-v04-rows.json').read_bytes())
    declaration=json.loads((MANIFEST/'m4-v04-verifier-declaration.json').read_bytes())
    cpu=json.loads((MANIFEST/'m4-v04-cpu-measurements.json').read_bytes())
    observed={'rowsSha256':digest(canonical(rows)),'declarationSha256':digest(canonical(declaration)),
              'invocationSha256':digest(canonical(declaration['producerInvocation']))}
    assert observed==EXPECTED
    assert canonical(product['rows'])==canonical(rows)
    assert canonical(product['declaration'])==canonical(declaration)
    assert product['provenance']['candidateAcceptance'] is False
    helper,author,_=P.ready_author(SOURCE/'build_fullkit_m4_geometry_v04.py',hp,MANIFEST/'m4-v04-author-declarations.json',ap)
    parts,meta=helper.build_all(author['selectedPose'])
    # Direct raw-source correspondence independently of snapshot_rows' assertions.
    groups=vertices=faces=corners=0
    for name,part in parts.items():
        row=rows[name]
        assert row['vertices']==[[float(x) for x in v] for v in part.v]
        assert row['faces']==[list(f) for f,_ in part.f]
        assert row['rawFaceClasses']==part.cls and row['rawFaceRoles']==part.roles
        assert row['rawRoundRuns']==part.runs and row['rawGroupIds']==part.ids
        assert row['uvRules']==[uv for _,uv in part.f]
        assert [(g['label'],*g['vertexRange'],*g['faceRange']) for g in row['groups']]==part.groups
        groups+=len(part.groups);vertices+=len(part.v);faces+=len(part.f)
        corners+=sum(len(f) for f,_ in part.f)
    assert M.selected_layout_preflight(parts,author,rows)['candidateAcceptance'] is False
    checks=[]
    # Omit one concrete locator in every explicit candidate attachment criterion.
    omission_keys={
      'rod_tip_inside_solid':('footVertices',),
      'rod_root_embedded_through_flat_face':('armSideFaces',),
      'board_end_seated_through_top_face':('boardVertices',),
      'barrel_knuckle_seated_through_top_face':('baseVertices',),
      'board_heel_captured_in_hinge_barrel':('board','vertices'),
      'board_rests_on_lip_separating_plane':('housing','vertices'),
    }
    for index,a in enumerate(author['attachments']):
        if 'criterion' not in a:continue
        changed=copy.deepcopy(author);c=changed['attachments'][index]['criterion']
        for key in omission_keys[c['kind']][:-1]:c=c[key]
        c[omission_keys[a['criterion']['kind']][-1]].pop()
        try:M.selected_layout_preflight(parts,changed,rows)
        except ValueError as e:checks.append({'name':a['id']+'/omitted_locator','rejected':True,'reason':str(e)})
        else:raise AssertionError('incomplete attachment locator accepted: '+a['id'])
    # Role-pair specificity, reversed supplied roles, and overlap disclosure.
    rules=[{'id':'a','status':'contact','reason':'test','match':[{'label':'sample','kinds':['ring'],
            'bands':['convex40-80'],'rolePairs':[['bottom','side']]}]}]
    assert M.match_authored_edge_set('sample','ring','convex40-80',['side','bottom'],rules)['setId']=='a'
    assert M.match_authored_edge_set('sample','ring','convex40-80',['top','side'],rules)['setId'] is None
    overlap=M.match_authored_edge_set('sample','ring','convex40-80',['side','bottom'],rules+[dict(rules[0],id='b')])
    assert overlap['matchingSetIds']==['a','b'] and overlap['setId']=='a'
    checks.append({'name':'role_pairs_exact_and_priority_disclosed','passed':True})
    # New angle: 40-degree inclined receiver, both penetration and lateral escape.
    rv,rf=T.fixture_box([-1,-1,-.1],[1,1,0]);cv,cf=T.fixture_box([-.2,-.2,.0003],[.2,.2,.02])
    rel={'id':'independent.rest','row':'drum_kick__tower','group':'child','ontoRow':'drum_kick__tower',
         'ontoGroup':'receiver','relation':'rests_on','gapM':.0003}
    theta=math.radians(40)
    rot=np.array([[math.cos(theta),0,math.sin(theta)],[0,1,0],[-math.sin(theta),0,math.cos(theta)]])
    p,a=T.fixture_attachment_parts('receiver',((np.array(rv)@rot.T).tolist(),rf),'child',((np.array(cv)@rot.T).tolist(),cf))
    assert M.rest_on_diagnostic(p,a,rel)['geometry']['withinDeclaredGeometricCriterion']
    for label,shift in [('penetration',np.array([0,0,-.001])@rot.T),('finite_footprint_escape',np.array([2.,0,0])@rot.T)]:
        altered=copy.deepcopy(p)
        altered['drum_kick__tower'].v[8:]=(np.asarray(altered['drum_kick__tower'].v[8:])+shift).tolist()
        assert not M.rest_on_diagnostic(altered,a,rel)['geometry']['withinDeclaredGeometricCriterion']
        checks.append({'name':'inclined_rest_'+label,'rejected':True})
    # 1.9/2.1 degree controls ensure the oriented threshold itself is reached.
    for angle,accept in [(1.9,True),(2.1,False),(178.1,False)]:
        rad=math.radians(angle)
        row={'vertices':[[0,0,0],[.02,0,0],[0,.02,0]],'faces':[[0,1,2]],
             'cornerNormals':[[[math.sin(rad),0,math.cos(rad)]]*3],
             'faceClasses':['planar'],'rawRoundRuns':[None]}
        assert M.normal_diagnostics({'small_planar':row},{'roundRuns':[]})['allWithinMeasuredLimits']==accept
    checks.append({'name':'small_planar_oriented_two_degree_boundary','passed':True})
    # Independent scalar budget reduction from the frozen rows, no measurement adapter.
    counts={name:sum(len(f)-2 for f in row['faces']) for name,row in rows.items()}
    stage={'main':len(rows),'casters':sum(int(r['casts']) for r in rows.values()),
           'refresh':sum(1+int(r['casts']) for r in rows.values()),'placed':sum(counts.values()),
           'refreshTriangles':sum(counts[n]*(1+int(r['casts'])) for n,r in rows.items())}
    assert stage==cpu['budgets']['stage']=={'main':18,'casters':9,'refresh':27,'placed':13968,'refreshTriangles':24836}
    assert all(counts[n]==r['triangles']<=r['ceiling'] for n,r in cpu['budgets']['rows'].items())
    assert len(cpu['supports']['supports'])==25 and cpu['supports']['allWithinGeometricLimits']
    assert len(cpu['attachments'])==13 and all(a['geometry']['withinDeclaredGeometricCriterion'] for a in cpu['attachments'])
    assert len(cpu['inlays'])==4 and all(a['withinDeclaredGeometricCriterion'] for a in cpu['inlays'])
    assert cpu['normals']['allWithinMeasuredLimits'] and corners==26368
    assert sum(r['edgeCount'] for r in cpu['edges']['sets'].values())==7375 and len(cpu['edges']['sets'])==44
    assert not cpu['edges']['undeclaredHardEdges']
    contacts=cpu['surfaceContacts'];unclassified=[p for p in contacts['contactPairs'] if not p['transparentRetainedPair'] and p['declaredPairCriterion'] is None]
    assert len(unclassified)==299 and all(p['a'][0]==p['b'][0] for p in unclassified)
    # Independent angular/pinhole equations on the actual key centres.
    pose=author['selectedPose'];key=helper.KEY;matrix=helper.T(pose['cx'],pose['cy'],helper.CTL['zb'])@helper.Rz(pose['yaw'])
    pts=np.asarray([helper.apply(matrix,(key['x0']+(k+.5)*key['pitch'],key['yf']+.03,key['top']+.0005)) for k in range(29)])
    yaw,pitch=map(math.radians,[44,-8]);delta=pts-np.array([-.35,-1.70,1.345])
    x=delta[:,0]*math.cos(yaw)-delta[:,1]*math.sin(yaw)
    y=-delta[:,0]*math.sin(yaw)*math.sin(pitch)-delta[:,1]*math.cos(yaw)*math.sin(pitch)+delta[:,2]*math.cos(pitch)
    z=delta[:,0]*math.sin(yaw)*math.cos(pitch)+delta[:,1]*math.cos(yaw)*math.cos(pitch)+delta[:,2]*math.sin(pitch)
    f=422/math.tan(math.radians(37));pixels=np.stack((160+f*x/z,422-f*y/z),axis=1)
    inside=int(((pixels[:,0]>=0)&(pixels[:,0]<=320)&(pixels[:,1]>=0)&(pixels[:,1]<=844)&(z>0)).sum())
    assert inside==10==cpu['views']['keyPitchEstimates']['music-320-f74']['keysInFrame']
    assert np.max(np.abs(pixels-M.project_points(pts,44,-8,74,320,844)))<1e-10
    after={p:digest((STUDIO/p).read_bytes()) for p in PINS}
    assert before==after
    receipt={'verdict':'ready-for-root-freeze','sourceAndArtifactPins':before,'unchangedAfter':before==after,
             'expectedCanonicalPins':EXPECTED,'observedCanonicalPins':observed,'namedProducerReproducesExactArtifacts':True,
             'directSourceCoverage':{'rows':len(rows),'groups':groups,'vertices':vertices,'faces':faces,'corners':corners},
             'writerSuiteSeparateInvocation':{'passed':42,'failed':0,'write':False},'independentChecks':checks,
             'independentStageBudget':stage,'phoneCentreCount':inside,'unclassifiedWithinRowContacts':len(unclassified),
             'candidateAcceptance':False,'audit_m4_v3Called':False,'fullMeasurementRepeated':False,
             'probeSourceSha256':digest(Path(__file__).read_bytes())}
    proposal={'status':'independent proposal only; root adoption required','technicalCommitReportedByRoot':'8a6addb9c9e16074f1106ca51b26d41830add71a',
              'authorCommitReportedByRoot':'e684190b6c19af4b664f2d32e1f3d097ab00d25f',
              'canonicalEncoding':'UTF-8 JSON, sort_keys=True, separators=(comma,colon), ensure_ascii=False, allow_nan=False; no rounding',
              **EXPECTED,'sources':declaration['sources'],'producerInvocation':declaration['producerInvocation'],
              'artifactBytePins':{p:v for p,v in PINS.items() if p.endswith(('m4-v04-rows.json','m4-v04-verifier-declaration.json'))},
              'candidateAcceptance':False,'authoritativeFreeze':False}
    if '--write' in sys.argv:
        for name,data in [('m4-v04-independent-technical-probes.json',receipt),('m4-v04-independent-expected-pins-proposal.json',proposal)]:
            with (HERE/name).open('x',encoding='utf-8',newline='\n') as stream:
                json.dump(data,stream,indent=2,allow_nan=False);stream.write('\n')
    print(json.dumps({'verdict':receipt['verdict'],'coverage':receipt['directSourceCoverage'],
                      'checks':len(checks),'phoneCentres':inside,'canonicalPins':observed,'unchanged':before==after},indent=2))

if __name__=='__main__':
    run()
