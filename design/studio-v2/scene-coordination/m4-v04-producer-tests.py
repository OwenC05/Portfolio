"""Targeted v04 writer fixtures. No candidate/helper import or candidate audit.

python -B design/studio-v2/scene-coordination/m4-v04-producer-tests.py
--write exclusively creates the assigned fixture receipt; it never overwrites.
"""
import copy
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import sys
import time
import traceback
from types import SimpleNamespace

import numpy as np


HERE = Path(__file__).resolve().parent
STUDIO = HERE.parent
SOURCE = STUDIO / 'asset-pipeline/full-kit/source'


def load(name):
    path = SOURCE / (name + '.py')
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def synthetic_scope():
    part = SimpleNamespace(row='fixture', asset='fixture-asset', mat='fixture-material', casts=False, ceiling=10,
        v=[[0.,0.,0.],[1.,0.,0.],[0.,1.,0.]], f=[((0,1,2),'fixture-uv')],
        cls=['planar'], groups=[('authored-fixture-label',0,3,0,1)])
    spec = {'id':'fixture', 'vertexCount':3, 'faceCount':1, 'normalsRequired':True,
        'faceClasses':['planar'], 'groups':[{'id':'author-stable-fixture-group','vertexRange':[0,3],
            'faceRange':[0,1],'triangleCount':1,'n1':'in_scope','reason':'explicit synthetic planar scope'}]}
    def normals(p):
        return {(0,v):(0.,0.,1.) for v in (0,1,2)}
    return {'fixture':part}, [spec], normals


def opaque(**changes):
    return {'transparent':False,'materialTransparent':False,'materialVisible':True,
            'visible':True,'opacity':1.,'doubleSided':True, **changes}


def sheet(label, z, *, name=None, meta=None, **extra):
    return {'name':name or label,'label':label,
            'triangles':np.array([[[-1.,-1.,z],[1.,-1.,z],[0.,1.,z]]]),
            'metadata':meta or opaque(), **extra}


def run():
    out = HERE/'m4-v04-producer-tests.json'
    if '--write' in sys.argv and out.exists():
        raise SystemExit('Refusing to overwrite producer fixture receipt')
    start = time.monotonic()
    before = {name:digest(STUDIO/name) for name in PROTECTED_PINS}
    assert before == PROTECTED_PINS
    P, M = load('produce_fullkit_m4_v04'), load('measure_fullkit_m4_v04')
    tests = []
    def test(name, action):
        try:
            evidence = action()
            tests.append({'name':name,'passed':True,'evidence':evidence})
        except Exception:
            tests.append({'name':name,'passed':False,'traceback':traceback.format_exc()})
    def rejects(action, error=P.PreparationError):
        try:
            action()
        except error as caught:
            return {'rejection':str(caught)}
        raise AssertionError('Expected rejection did not occur')

    def raw_identity():
        parts,specs,normals = synthetic_scope()
        before = copy.deepcopy(specs)
        rows = P.snapshot_rows(parts,specs,normals)
        row = rows['fixture']
        assert row['groups'] == specs[0]['groups'] and specs == before
        assert row['rawGroups'][0]['label'] == 'authored-fixture-label'
        assert row['rawFaceClasses'] == row['faceClasses'] == ['planar']
        assert row['cornerNormals'] == [[[0.,0.,1.]]*3] and row['uvRules']==['fixture-uv']
        assert row['faces']==[[0,1,2]] and row['vertices']==parts['fixture'].v
        return {'fullRowsSha256':P.payload_sha256(rows),'scope':'synthetic-only'}
    test('producer_preserves_authored_primitive_class_normal_and_UV_identity',raw_identity)
    def mutation(kind):
        parts,specs,normals = synthetic_scope()
        if kind=='missing_row': specs=[]
        if kind=='class': specs[0]['faceClasses']=['round']
        if kind=='missing_class': specs[0]['faceClasses']=[]
        if kind=='range': specs[0]['groups'][0]['vertexRange']=[0,2]
        if kind=='missing_reason': specs[0]['groups'][0]['reason']=''
        if kind=='normal_scope': specs[0]['normalsRequired']=False
        if kind=='duplicate_group': specs[0]['groups'].append(copy.deepcopy(specs[0]['groups'][0]))
        if kind=='missing_normal': normals=lambda p:{(0,0):(0.,0.,1.)}
        return rejects(lambda:P.snapshot_rows(parts,specs,normals))
    for kind in ('missing_row','class','missing_class','range','missing_reason','normal_scope','duplicate_group','missing_normal'):
        test('producer_rejects_'+kind,lambda kind=kind:mutation(kind))
    def explicit_out_scope():
        parts,specs,normals=synthetic_scope();parts['fixture'].cls=[None]
        specs[0]['faceClasses']=['out_of_scope'];specs[0]['normalsRequired']=False
        specs[0]['groups'][0].update(n1='out_of_scope',reason='Author explicitly excludes this synthetic scope')
        rows=P.snapshot_rows(parts,specs,normals)
        assert rows['fixture']['rawFaceClasses']==[None] and rows['fixture']['faceClasses']==['out_of_scope']
        return {'rawNullPreserved':True,'declaredExclusionRequired':True}
    test('explicit_out_of_scope_is_preserved_without_inference',explicit_out_scope)
    test('unready_changed_helper_bytes_reject_before_execution',lambda:rejects(lambda:
        P.load_pinned_helper(b"raise AssertionError('must not execute')",'0'*64,'synthetic-only.py')))
    test('duplicate_author_JSON_keys_reject',lambda:rejects(lambda:
        P.parse_pinned_author(b'{"x":1,"x":2}',P.sha_bytes(b'{"x":1,"x":2}'))))
    def identity_provenance():
        parts,specs,normals=synthetic_scope();rows=P.snapshot_rows(parts,specs,normals)
        decl={'schema':'m4-source-declaration/3','scope':'fixture','rows':specs,'surfaces':[],'supports':[]}
        sources={'helper':b'synthetic helper','authorDeclarations':P.canonical_bytes(decl),'producer':b'synthetic producer'}
        invocation={'entrypoint':'synthetic_only.snapshot_rows','pose':{'cx':1.325,'cy':-.825,'yaw':-.85}}
        a=P.provisional_product(rows,decl,sources,invocation)
        b=P.provisional_product(copy.deepcopy(rows),copy.deepcopy(decl),dict(sources),copy.deepcopy(invocation))
        assert a==b
        assert not a['provenance']['independentExpectedDigestFreeze'] and not a['provenance']['candidateAcceptance']
        changed=copy.deepcopy(rows);changed['fixture']['vertices'][0][0]+=.001
        c=P.provisional_product(changed,decl,sources,invocation)
        assert c['provenance']['rowsSha256']!=a['provenance']['rowsSha256']
        d=P.provisional_product(rows,decl,sources|{'producer':b'changed producer'},invocation)
        assert d['provenance']['declarationSha256']!=a['provenance']['declarationSha256']
        e=P.provisional_product(rows,decl,sources,invocation|{'entrypoint':'different.entrypoint'})
        assert e['provenance']['invocationSha256']!=a['provenance']['invocationSha256']
        return a['provenance']
    test('producer_binding_tracks_payload_source_and_invocation_without_claiming_freeze',identity_provenance)
    def pose_limits():
        old={'cx':1.325,'cy':-.825,'yaw':-.85}
        assert P.validate_pose_options([old])==[old]
        rejects(lambda:P.validate_pose_options([old]*25))
        rejects(lambda:P.validate_pose_options([old,old]))
        rejects(lambda:P.validate_pose_options([old|{'yaw':-1.}]))
        rejects(lambda:P.validate_pose_options([old|{'cx':1.35}]))
        return {'explicitTableOnly':True,'oldReferenceRequired':True}
    test('bounded_author_pose_table_no_expansion_or_selection',pose_limits)
    def policy():
        assert M.runtime_eligibility('ordinary',opaque(occluder=False))['opaqueBlockerEligible']
        assert not M.runtime_eligibility('ordinary',opaque(transparent=True,occluder=True))['binderCandidate']
        for name in M.PROJECT_TARGETS|M.PROJECT_BORDERS:
            assert not M.runtime_eligibility(name,opaque())['binderCandidate']
        assert not M.runtime_eligibility('ordinary',opaque(),False)['opaqueBlockerEligible']
        assert not M.runtime_eligibility('ordinary',opaque(),True,False)['opaqueBlockerEligible']
        for metadata in (opaque(materialTransparent=True),opaque(opacity=.5),opaque(materialVisible=False),{}):
            assert not M.runtime_eligibility('ordinary',metadata)['opaqueBlockerEligible']
        return {'actualTransparentPolicy':True,'semanticOccluderNotSubstituted':True}
    test('binder_and_picker_eligibility_metadata_and_ancestors',policy)
    def rays():
        target=sheet('target',1.)
        contact=sheet('decal',.5,meta=opaque(transparent=True,materialTransparent=True,opacity=.3))
        scene=M.RayScene([target,contact],eye=[0,0,0])
        result=scene.cast([[0,0,1],[4,4,1]],{'target'})
        assert [r['category'] for r in result]==['target_hit','no_hit']
        assert result[0]['transparentExclusions']==['decal']
        summary=M.ray_summary(result,'synthetic endpoints')
        assert summary['targetHits']==1 and summary['noHits']==1 and summary['targetHitFraction']==.5
        blocked=M.RayScene([target,contact,sheet('opaque-part',.7)],eye=[0,0,0]).cast([[0,0,1]],{'target'})
        assert blocked[0]['category']=='opaque_blocker' and blocked[0]['firstLabel']=='opaque-part'
        return summary
    test('transparent_contact_not_blocker_and_no_hit_not_target_success',rays)
    def border_target():
        target=sheet('requested',1.,name='target_dissertation')
        border=sheet('border',.25,name='border_dissertation')
        other=sheet('other-target',.5,name='target_typeforge')
        r=M.RayScene([target,border],eye=[0,0,0]).cast([[0,0,1]],{'requested'})[0]
        assert r['category']=='target_hit'
        r=M.RayScene([target,border,other],eye=[0,0,0]).cast([[0,0,1]],{'requested'})[0]
        assert r['category']=='other_project_target_hit'
        return r
    test('project_border_excluded_and_other_target_reported_separately',border_target)
    def area():
        triangles=np.array([[[0.,0.,0.],[2.,0.,0.],[0.,1.,0.]],[[10.,0.,0.],[16.,0.,0.],[10.,1.,0.]]])
        pts,info=M.area_samples(triangles,400)
        assert info['triangleSampleCounts']==[100,300]
        assert int((pts[:,0]<5).sum())==100 and np.all(pts[:,2]==0)
        assert np.allclose(M.area_samples(triangles,400)[0],pts,rtol=0,atol=0)
        # Physical area ratio is 1:3, despite each triangle contributing 3 vertices.
        assert info['surfaceAreaM2']==4.
        return info
    test('uniform_area_sampling_differs_from_equal_vertex_weighting',area)
    def vertex_cap():
        points,indices=M.bounded_vertices(np.arange(1077).reshape(359,3),150)
        assert len(points)==150 and len(set(indices))==150 and indices[0]==0 and indices[-1]==358
        return {'sourceVertices':359,'actualSamples':len(points),'oldFloorDivisionCapWouldExceed':True}
    test('vertex_diagnostic_enforces_actual_sample_cap',vertex_cap)
    def inlays():
        pairs=[{'indicator':['ctl_body__indicators','strip-'+str(i)],'panel':['ctl_body__shell','panel']} for i in range(4)]
        assert M.scoped_inlay_pair(pairs[0]['indicator'],pairs[0]['panel'],pairs)==pairs[0]
        assert M.scoped_inlay_pair(['ctl_body__indicators','display'],pairs[0]['panel'],pairs) is None
        assert M.scoped_inlay_pair(['ctl_body__shell','knob'],pairs[0]['panel'],pairs) is None
        rejects(lambda:M.scoped_inlay_pair(pairs[0]['indicator'],pairs[0]['panel'],pairs[:3]),ValueError)
        offsets=M.seating_offsets([[0,0,-.001],[0,0,.0025]],[0,0,0],[0,0,1])
        assert offsets['minimumSignedOffsetM']==-.001 and offsets['maximumSignedOffsetM']==.0025
        return {'fourExactPairsOnly':True,'seating':offsets}
    test('four_indicator_pairs_do_not_exempt_other_same_asset_primitives',inlays)
    def attachment():
        footprint=[[0,0],[1,0],[1,1],[0,1]]
        good=M.attachment_contact([[.2,.2,.006],[.3,.2,.006],[.3,.3,.01]],footprint,.006)
        raised=M.attachment_contact([[.2,.2,.012],[.3,.2,.012]],footprint,.006)
        outside=M.attachment_contact([[1.1,.2,.006],[1.2,.2,.006]],footprint,.006)
        assert good['signedAttachmentGapM']==0 and good['bottomFootprintInside']
        assert raised['signedAttachmentGapM']==.006 and raised['bottomFootprintInside']
        assert outside['signedAttachmentGapM']==0 and not outside['bottomFootprintInside']
        return {'seated':good,'floatingDespiteProjection':raised,'outsideDespiteCorrectHeight':outside}
    test('attachment_requires_height_and_receiver_footprint_independently_of_floor_contact',attachment)
    def edge_bands():
        results = {}
        for angle,sign,band in ((39, -1, 'below_40'), (40,-1,'convex_40_to_80'),
                                (79,-1,'convex_40_to_80'), (80,-1,'convex_at_least_80'),
                                (90,-1,'convex_at_least_80'), (60,1,'concave_at_least_40')):
            radians = math.radians(angle)
            vertices = [[0.,0.,0.],[1.,0.,0.],[0.,1.,0.],
                        [0.,-math.cos(radians),sign*math.sin(radians)]]
            result = M.edge_geometry(vertices,[[0,1,2],[1,0,3]],['round','round'])
            common = next(e for e in result['edges'] if e['vertices']==[0,1])
            assert common['band']==band and abs(common['angleDeg']-angle)<1e-10
            assert common['lengthM']==1. and result['bands']['boundary']['edgeCount']==4
            results[str((angle,sign))] = common
        return results
    test('analytic_wedges_separate_40_to_80_at_least_80_and_concave_edges',edge_bands)
    def seam_and_winding():
        vertices = [[0.,0.,0.],[1.,0.,0.],[0.,1.,0.],[0.,-1.,-1.]]
        good = M.edge_geometry(vertices,[[0,1,2],[1,0,3]],['bevel:casing']*2)
        bad = M.edge_geometry(vertices,[[0,1,2],[0,1,3]],['bevel:casing']*2)
        assert good['bevelMiddleSeamLengthByClassM']=={'bevel:casing':1.}
        assert bad['bands']['inconsistent_winding']['edgeCount']==1
        assert bad['bevelMiddleSeamLengthByClassM']=={}
        assert all('status' not in edge and 'reason' not in edge for edge in good['edges'])
        return {'sharedSeamM':1.,'badWindingNotClassifiedConvex':True,'noInferredExemption':True}
    test('middle_seam_is_named_honestly_and_bad_winding_stays_unclassified',seam_and_winding)
    def added_identity():
        parts,specs,normals=synthetic_scope();part=parts['fixture']
        part.ids=['author-stable-fixture-group'];part.roles=['cap'];part.runs=[None]
        specs[0]['groups'][0]['label']='authored-fixture-label'
        row=P.snapshot_rows(parts,specs,normals)['fixture']
        assert row['rawGroupIds']==part.ids and row['rawFaceRoles']==['cap'] and row['rawRoundRuns']==[None]
        part.ids=['changed-id']
        rejects(lambda:P.snapshot_rows(parts,specs,normals))
        return {'rawNewAuthorFieldsBound':True,'changedStableIdRejected':True}
    test('v04_author_roles_runs_and_stable_ids_remain_in_complete_payload',added_identity)
    def target_rectangle():
        # Normal points at fixed EYE, independently known unit square in Z=0.
        entry={'triangles':np.array([[[0.,0.,0.],[1.,0.,0.],[1.,1.,0.]],
                                    [[0.,0.,0.],[1.,1.,0.],[0.,1.,0.]]])}
        grid=M.target_grid(entry)
        assert len(grid)==81 and np.allclose(grid.min(0),[.03,.03,0.]) and np.allclose(grid.max(0),[.97,.97,0.])
        duplicate={'triangles':np.repeat(entry['triangles'][:1],2,axis=0)}
        rejects(lambda:M.target_grid(duplicate),ValueError)
        backwards={'triangles':entry['triangles'][:,::-1,:]}
        rejects(lambda:M.target_grid(backwards),ValueError)
        return {'interiorGrid81':True,'missingCornerAndReversedTargetRejected':True}
    test('project_target_sampling_requires_actual_rectangle_and_front_face',target_rectangle)
    def declared_support_adapter():
        static=M.captured_static_inputs();utilities=M.geometry_utilities(static['approvedGeometryUtilities'])
        # Bevelled-square boundary cuts the top-right corner away from the AABB.
        boundary=[[0.,0.,.0083],[1.,0.,.0083],[1.,.8,.0083],[.8,1.,.0083],[0.,1.,.0083]]
        rug=SimpleNamespace(v=boundary,f=[((0,1,2,3,4),'weave')])
        foot=SimpleNamespace(ids=['foot'],v=[[.2,.2,.0086],[.3,.2,.0086],[.3,.3,.02]],groups=[('foot',0,3,0,1)])
        author={'rows':[{'id':'footrow','groups':[{'id':'foot','label':'foot','vertexRange':[0,3],'faceRange':[0,1]}]}],
                'surfaces':[{'id':'rug','kind':'rug_field','boundaryRow':'rugrow','boundaryFace':0}],
                'supports':[{'id':'one','row':'footrow','group':'foot','surface':'rug'}]}
        parts={'rugrow':rug,'footrow':foot}
        good=M.support_diagnostics(parts,author,utilities)
        assert good['allWithinGeometricLimits'] and not good['candidateAudit']
        foot.v=[[x,y,z+.005] for x,y,z in foot.v]
        raised=M.support_diagnostics(parts,author,utilities)
        assert not raised['allWithinGeometricLimits'] and abs(raised['supports'][0]['signedGapErrorM']-.005)<1e-12
        foot.v=[[.94,.94,.0086],[.95,.94,.0086],[.94,.95,.02]]
        corner=M.support_diagnostics(parts,author,utilities)
        assert not corner['allWithinGeometricLimits'] and corner['minSignedClearanceM']<0
        return {'liftedDeclaredFootRejected':True,'insideRectangleOutsideActualBoundaryRejected':True}
    test('declared_support_adapter_catches_lift_and_actual_boundary_failure',declared_support_adapter)
    def parent_metadata():
        static=M.captured_static_inputs();mapping=json.loads(static['mapping'])
        entries=M.retained_entries(static['parent'],mapping)
        by_name={e['name']:e for e in entries}
        decal=by_name['contact_decals__music_corner'];steel=by_name['desk_frame__steel']
        assert decal['metadata']['transparent'] is True and not M.runtime_eligibility(decal['name'],decal['metadata'])['opaqueBlockerEligible']
        assert M.runtime_eligibility(steel['name'],steel['metadata'])['opaqueBlockerEligible']
        assert abs(float(decal['triangles'][:,:,2].min())-.0205)<1e-7
        for name in M.PROJECT_TARGETS:
            assert len(M.target_grid(by_name[name]))==81
            assert not M.runtime_eligibility(name,by_name[name]['metadata'])['binderCandidate']
        return {'retainedLeaves':len(entries),'retainedTriangles':sum(len(e['triangles']) for e in entries),
                'actualMusicDecalHeightM':float(decal['triangles'][:,:,2].min()),
                'runtimeMetadataApplied':True,'candidateGeometryConsumed':False}
    test('pinned_retained_loader_metadata_and_transforms_match_known_controls',parent_metadata)
    def author_pose_adapter():
        pose={'cx':1.325,'cy':-.825,'yaw':-.85}
        author={'poseOptionIds':['P00'],'poseOptions':[pose],'selectedPose':pose,
                'selectedPoseStatus':'provisional: reference only'}
        helper=SimpleNamespace(POSE_OPTIONS=[dict(id='P00',**pose)],SELECTED_POSE=pose,
                               SELECTED_POSE_STATUS=author['selectedPoseStatus'])
        P.check_helper_pose_table(helper,author)
        helper.POSE_OPTIONS=[dict(id='P99',**pose)]
        rejects(lambda:P.check_helper_pose_table(helper,author))
        return {'helperEmbeddedIdsMatchSeparateJSONIds':True,'changedOptionIdRejected':True}
    test('author_pose_table_adapter_preserves_explicit_ids_and_status',author_pose_adapter)
    after={name:digest(STUDIO/name) for name in PROTECTED_PINS}
    assert before==after
    receipt={'schema':'m4-v04-producer-writer-fixtures/1','task':'task_2cf416822c8f','dispatch':'ctx_55fd1ff42d3b',
             'status':'synthetic producer preparation; no live candidate consumed',
             'candidateAcceptance':False,'independentExpectedDigestFreeze':False,
             'candidateCoarseRuns':0,'candidateFullRuns':0,'fullPlacementSearchRuns':0,
             'tests':tests,'testCount':len(tests),'passed':all(x['passed'] for x in tests),
             'elapsedSeconds':time.monotonic()-start,'protectedBefore':before,'protectedAfter':after,
             'sourceHashes':{p.name:digest(p) for p in [SOURCE/'produce_fullkit_m4_v04.py',SOURCE/'measure_fullkit_m4_v04.py',Path(__file__)]}}
    print(json.dumps({'passed':receipt['passed'],'count':len(tests),'seconds':receipt['elapsedSeconds'],
                      'failures':[x for x in tests if not x['passed']]},indent=2))
    if '--write' in sys.argv:
        with out.open('x',encoding='utf-8',newline='\n') as f:
            json.dump(receipt,f,indent=2,allow_nan=False);f.write('\n')
        print('receiptSha256='+digest(out))
    return 0 if receipt['passed'] else 1
PROTECTED_PINS = {'asset-pipeline/full-kit/asset-inventory.json': 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87',
 'asset-pipeline/full-kit/export-ledger-v01.json': '26b4c143f64f6880f012c316e81f124fe899b69312b61866531e6bf884320775',
 'asset-pipeline/full-kit/exports/studio-full-kit-m3-proposal-v03.glb': 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf',
 'asset-pipeline/full-kit/exports/studio-full-kit-m4-proposal-v01.raw-export.glb': 'c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906',
 'asset-pipeline/full-kit/exports/studio-full-kit-m4-proposal-v02.glb': 'baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f',
 'asset-pipeline/full-kit/full-kit-profile-v1.json': '7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052',
 'asset-pipeline/full-kit/m4-author-report.md': '93d7c5c124a846240173b0a04fed1dffd4fb9743e15971d3ea41a966feb3ee79',
 'asset-pipeline/full-kit/manifests/m4-v01-tier-ledger.json': '63848642fde09d4d5762c9c5054129c22df51f0838bcc8f1b7c450fd80ffae63',
 'asset-pipeline/full-kit/manifests/m4-v03-cpu-preparation.json': 'd7196145a8665abefdf41b3235f3be8ec91aa7474b3c71fed2186d7537e20253',
 'asset-pipeline/full-kit/manifests/studio-full-kit-m3-proposal-v03.manifest.json': '060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405',
 'asset-pipeline/full-kit/manifests/studio-full-kit-m4-proposal-v02.manifest.json': '42597f1b859fdae354063e09ee925d4d2dc9be8ae0ac8556663e391db6906b82',
 'asset-pipeline/full-kit/source/build_fullkit_m4.py': 'aa9724dcd14dbc428ca5c2ba84cffdcbb469fa14c53cf3866ac46164ec04dc22',
 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry.py': 'c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0',
 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v03.py': '3b220b1d4614a8111247270b21771c5f2280493c16e3ab986603a24efcffaf37',
 'asset-pipeline/full-kit/source/build_fullkit_m4_v03.py': '53fa310f1144c46916b0ce63f05188818861e63fe9c32abbf4fb3f1596872b84',
 'asset-pipeline/full-kit/source/fk-40-music-proposal-v01.blend': '0ae40460b9a2cb578fc35a96497a9016e5f116a1efe98cac4809568fd68c4665',
 'asset-pipeline/full-kit/source/measure_fullkit_m4_v03.py': '9a3a098195e99b889ecee8b2213c9acc6a9dc50af68e1ae35e507e09b1b0bff5',
 'asset-pipeline/full-kit/source/render_m4_v01_evidence.py': 'bfa6fc9bf22707dc08f44f0bd4a7033e3817d54d2d142d5dea7a969fca161e18',
 'scene-coordination/m4-model-contract.json': '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98',
 'scene-coordination/m4-transition-guard.py': 'ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b',
 'scene-coordination/m4-v03-art-closure-interrupted-20261115/partial-evidence.json': '8322d1cd0b11cd27af16ac9dfc990b6e279639469f263fb15cc4de98451bf307',
 'scene-coordination/m4-v03-art-closure-interrupted-20261115/partial-report.md': 'c0f673655f2daa99adea3019935e1294ef098927b1ac307d83a128f692cac207',
 'scene-coordination/m4-v03-art-closure-interrupted-20261115/snapshot-manifest.json': '483c601a7c470d0a81221f780048568bb9e6dd41b7df1675fa5d16e462282b68',
 'scene-coordination/m4-v03-art-review-interruption.md': '7f78ad65ecb95584211bdd79c7a6ee734349f4eabff4982258b2d73b2bebf1b0',
 'scene-coordination/m4-v03-cpu-verification.json': 'c0fcce453614ff08e0facb5517fb4ed6fc430217ac455a2bbcf1e6dd325b6927',
 'scene-coordination/m4-v03-cpu-verification.py': '11b1356d5afcfe9260b2e28e22b498279d1c33450aa5f4a82e9319fa324f5dd6',
 'scene-coordination/m4-v03-focused-art-closure-task.md': '614e8acb0aa03f6fdf41d17dcb91b8c664c9ae63d1e46a80de1ef3c1081492e4',
 'scene-coordination/m4-v03-normal-check-contract-review.md': 'cc7812bd57027365bb6e61064eabea6564c7c20aa7eec8c2f9d3b8e07312a3fc',
 'scene-m4-v03-cpu-verification.md': '815edfabfb41fde8c3cd21e4a9429c1cf8be6d33f1a16ae2e008a23f5f2af174',
 'scene-m4-v03-preparation-report.md': 'b21b6f2b7b6b97786b4da8a34d59b114e2daf6fe5ffb5ae7d49c4117ecc3abc3',
 'scene-coordination/m4-v03-verifier-v2.py': '12658d50605c9bc7fe625151adf05a8b9faa993c4f378cc99a502402ebf24710',
 'scene-coordination/m4-v03-verifier-v2-tests.py': 'af71947a0647259ce22eed99a17193f3f8072f63bad3f494a0341d53b7aea00a',
 'scene-coordination/m4-v03-verifier-v2-tests.json': '31648785e1d4fa93b1a16daa9f941af0de8418d4eefe74db0d3fecc41899246c',
 'scene-coordination/m4-v03-verifier-declaration-contract.json': '71eb54107e54ae94856ea3461471a1afe3e3a27b7de97bfe5a331fe91c8e5293',
 'scene-m4-v03-verification-repair-report.md': '6f1088bcf5691de641c55e959fdb7290bbcc310fc99bbf64a410be337c92209d',
 'scene-coordination/m4-v03-verifier-contract-review.md': '7f5f6340960ab3aabf4d107577b6702f36d205257b73fa88de59bdbfd8a94e35',
 'scene-coordination/m4-v03-verifier-binding-task.md': '4eff478f63355ff551fa9f72e9bb86a5d988a020c5f80ba95ea2750b8eb27c16',
 'scene-coordination/m4-v03-verifier-binding-disposition.md': '4ac02bc7a2ec2f09f38545270b9ff47c7c1e43d08d032ba5a8fdf79597800acd',
 'scene-coordination/m4-v03-verifier-declaration-contract-v3.json': '5632ca4a42214edc89776c05f6b8f80835c22ddc8fcbeb0429ea3c39f2670e97',
 'scene-coordination/m4-v03-verifier-v3-independent-probes-v2.json': '72a2c9a60cd4418ffe5bb78892453e7332a12036c6aae419d86364c975a76a81',
 'scene-coordination/m4-v03-verifier-v3-independent-probes.json': '10ff605b13da906553ddddb1131129cc1d05d67bbbc767a9043dc1a52db91be6',
 'scene-coordination/m4-v03-verifier-v3-independent-probes.py': 'd6b99b15096153140f7a41b86cfd959997ba032297771d600d0e08ea5c0ce5d6',
 'scene-coordination/m4-v03-verifier-v3-independent-review.md': '26951c0ee6dd005f8526148c276c8f784880aff567afaa4a4fd4910b91a4247a',
 'scene-coordination/m4-v03-verifier-v3-tests.json': 'eac31cf2e41c24b20de348672b0e74111d11d447bf1e504977a7dce6d1143533',
 'scene-coordination/m4-v03-verifier-v3-tests.py': 'd638fba2f657df9b88a6d4f85ce2906481c642ea54e5784f03a1b26022257659',
 'scene-coordination/m4-v03-verifier-v3.py': '0abeb41ea77153ab5bcc442771fff9828edd7220a416ec28f8d10bc7290669dc',
 'scene-coordination/m4-v04-author-task.md': 'bb6f4dce04d3c1f810391556a04ebf9243b9b140b18c3734b7c37393af0a3f3d',
 'scene-coordination/m4-v04-producer-task.md': '5cd88fdd7576ec52e2f517b320f8562fbaa3c08aef0b79c38244c8b62c40cadf',
 'scene-coordination/m4-v04-internal-contract.md': 'a2afc8a324681c595ae4d9e849f56ff01a28b126f3d33dc1db5a28609400b5ae',
 'scene-coordination/m4-v04-combined-repair-disposition.md': '24e9b32c05c0c7f58da9f8a38054aecfc85bf7fb2f909c6d65d40d3016821890',
 'scene-m4-v03-verifier-binding-report.md': 'c76449289e38a5fee2f569eb1d001fc1639b8499a1d7be02c5983a6a88d59cd7',
 'scene-m4-v03-focused-art-closure.md': '4157a176701d2697e44cd39cc3de0b0b3a4d2101d36a46bf8212ff01361401af',
 'scene-coordination/m4-v03-focused-art-closure.json': 'd21dfd71cff79ed4747d55b8afcee810d9427b07f8a910b2cb2ad8b8841adc03'}


if __name__ == "__main__":
    if sys.argv[1:] not in ([], ["--write"]):
        raise SystemExit("Only --write is supported")
    raise SystemExit(run())
