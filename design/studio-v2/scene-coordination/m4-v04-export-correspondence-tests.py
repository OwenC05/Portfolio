"""Tiny finite synthetic correspondence controls; never produce a candidate from frozen rows."""
import copy
import importlib.util
import io
import json
from pathlib import Path
import struct
import sys
import time
from unittest.mock import patch

HERE=Path(__file__).resolve().parent
HELPER=HERE/'m4-v04-export-correspondence.py'
OUTPUT=HERE/'m4-v04-export-correspondence-tests.json'
spec=importlib.util.spec_from_file_location('correspondence',HELPER)
C=importlib.util.module_from_spec(spec);spec.loader.exec_module(C)


def source(vertices=None,faces=None,normals=None):
    vertices=vertices or [[.1,.2,0.],[1.,.2,0.],[1.,1.,0.],[.1,1.,0.]]
    faces=faces or [[0,1,2,3]]
    return {'asset':'toy','material':'toy_material','vertices':vertices,'faces':faces,
            'cornerNormals':normals or [[[0.,0.,1.] for _ in face] for face in faces],
            'rawFaceClasses':['planar']*len(faces)}


def witness(row,flips=None):
    flips=flips or [];faces=row['faces'];custom=any(c is not None for c in row['rawFaceClasses'])
    return {'helperVertices':len(row['vertices']),'helperFaces':len(faces),'triangles':sum(len(f)-2 for f in faces),
            'meshVertices':len(row['vertices']),'meshPolygons':len(faces),'meshLoops':sum(map(len,faces)),
            'customNormals':custom,'polygonsWindingFlippedByRecalc':len(flips) if custom else None,
            'flippedPolygonIndices':flips,'loopVertexOrder':C.LOOP_ORDER}


def toy_glb(row=None,triangle_faces=None,split=False,flip=False):
    row=row or source();triangle_faces=triangle_faces or [(0,[0,1,2]),(0,[0,2,3])]
    binary=bytearray();accessors=[];views=[]
    positions=[];normals=[];indices=[];shared={}
    for fi,triangle in triangle_faces:
        triangle=list(reversed(triangle)) if flip else triangle
        for vertex in triangle:
            face=row['faces'][fi];normal=row['cornerNormals'][fi][face.index(vertex)]
            # Independent explicit transform, not the implementation's to_gltf.
            x,y,z=row['vertices'][vertex];nx,ny,nz=normal;sign=-1 if flip else 1
            p=(x,z,-y);n=(sign*nx,sign*nz,-sign*ny);key=(p,n)
            if split or key not in shared:
                shared[key]=len(positions);positions.append(p);normals.append(n)
            indices.append(shared[key])
    def accessor(values,fmt,kind,component):
        offset=len(binary);blob=b''.join(struct.pack(fmt,*v) for v in values);binary.extend(blob)
        views.append({'buffer':0,'byteOffset':offset,'byteLength':len(blob)})
        accessors.append({'bufferView':len(views)-1,'componentType':component,'count':len(values),'type':kind})
        return len(accessors)-1
    pi=accessor(positions,'<fff','VEC3',5126);ni=accessor(normals,'<fff','VEC3',5126)
    ii=accessor([(i,) for i in indices],'<I','SCALAR',5125)
    doc={'asset':copy.deepcopy(C.guard.PROVENANCE['assetMetadata']),'buffers':[{'byteLength':len(binary)}],
         'bufferViews':views,'accessors':accessors,'materials':[{'name':'toy_material'}],
         'meshes':[{'primitives':[{'attributes':{'POSITION':pi,'NORMAL':ni},'indices':ii,'material':0,'mode':4}]}],
         'nodes':[{'name':'toy_row','mesh':0,'extras':{'assetId':'toy'}},{'name':'studio_full_kit','children':[0]}],
         'scenes':[{'nodes':[1]}],'scene':0}
    return doc,binary,{'toy_row':row},{'toy_row':witness(row,[fi for fi in range(len(row['faces']))] if flip else [])}


def encode(doc,binary):
    doc=copy.deepcopy(doc);doc['buffers'][0]['byteLength']=len(binary)
    j=json.dumps(doc,separators=(',',':'),allow_nan=False).encode();j+=b' '*(-len(j)%4)
    b=bytes(binary)+b'\0'*(-len(binary)%4)
    return struct.pack('<III',0x46546c67,2,28+len(j)+len(b))+struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(b),b'BIN\0')+b


def replace_component(doc,binary,semantic,vertex,component,value):
    ai=doc['meshes'][0]['primitives'][0]['attributes'][semantic];a=doc['accessors'][ai];view=doc['bufferViews'][a['bufferView']]
    offset=view.get('byteOffset',0)+vertex*12+component*4;struct.pack_into('<f',binary,offset,value)


def controls_protected():
    relative=['scene-coordination/m4-v04-root-expected-pins.json','scene-coordination/m4-v04-inspection-export-contract.md',
              'scene-coordination/m4-v04-inspection-provenance-proposal.json','scene-coordination/m4-transition-guard.py',
              'scene-coordination/m4-v04-inspection-transition-guard.py','scene-coordination/m4-v04-inspection-transition-guard-tests.json',
              'scene-coordination/m4-v04-candidate-audit.py','scene-coordination/m4-v04-candidate-audit.json',
              'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py','asset-pipeline/full-kit/source/build_fullkit_m4_v04.py',
              'asset-pipeline/full-kit/source/produce_fullkit_m4_v04.py','asset-pipeline/full-kit/source/measure_fullkit_m4_v04.py',
              'asset-pipeline/full-kit/manifests/m4-v04-rows.json','asset-pipeline/full-kit/manifests/m4-v04-verifier-declaration.json',
              'asset-pipeline/full-kit/manifests/m4-v04-cpu-measurements.json','asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json',
              'asset-pipeline/full-kit/exports/studio-full-kit-m3-proposal-v03.glb',
              'asset-pipeline/full-kit/manifests/studio-full-kit-m3-proposal-v03.manifest.json']
    paths=[HERE.parent/p for p in relative]+[HELPER,Path(__file__)]
    return {str(p.relative_to(HERE.parent)):C.sha(p.read_bytes()) for p in paths}


def run(write=False):
    if write and OUTPUT.exists():raise FileExistsError(OUTPUT)
    before=controls_protected();results=[];start=time.monotonic()
    def test(name,fn):
        try:results.append({'name':name,'passed':True,'evidence':fn()})
        except Exception as error:results.append({'name':name,'passed':False,'error':repr(error)})
    def checked(fixture=None,mutation=None,expected=None):
        d,b,rows,w=fixture or toy_glb()
        if mutation:mutation(d,b,rows,w)
        raw=encode(d,b);prior=bytes(raw)
        try:out,errors=C.check_document(raw,rows,w)
        except (C.CorrespondenceError,C.guard.AuditError) as error:out,errors={},[error.detail]
        if expected is None:assert not errors,errors
        else:assert expected in {x['code'] for x in errors},errors
        assert raw==prior
        return {'codes':[x['code'] for x in errors],'rows':{k:{f:r[f] for f in ('positionAndTopologyExact','strictSourceNormalAgreement',
                'sourceVertices','exportedVerticesAfterCornerSplitting','triangles','normalMismatchOccurrences','maximumNormalAngleDifferenceDeg')} for k,r in out.items()}}
    test('float32 rounded noninteger positions and source normals',checked)
    test('exporter UV/normal corner splitting',lambda:checked(toy_glb(split=True)))
    test('alternate quad diagonal and triangle order',lambda:checked(toy_glb(triangle_faces=[(0,[1,2,3]),(0,[0,1,3])],split=True)))
    test('witnessed winding reversal also reverses oriented source normals',lambda:checked(toy_glb(flip=True)))
    def reindex(d,b,rows,w):
        p=d['meshes'][0]['primitives'][0];count=d['accessors'][p['attributes']['POSITION']]['count']
        for semantic in ('POSITION','NORMAL'):
            a=d['accessors'][p['attributes'][semantic]];v=d['bufferViews'][a['bufferView']];o=v['byteOffset']
            chunks=[b[o+i*12:o+(i+1)*12] for i in range(count)];b[o:o+count*12]=b''.join(reversed(chunks))
        a=d['accessors'][p['indices']];v=d['bufferViews'][a['bufferView']];o=v['byteOffset']
        for i in range(a['count']):old=struct.unpack_from('<I',b,o+i*4)[0];struct.pack_into('<I',b,o+i*4,count-1-old)
    test('accessor vertex reordering does not substitute identity',lambda:checked(mutation=reindex))
    test('one float step POSITION substitution rejects',lambda:checked(mutation=lambda d,b,r,w:replace_component(d,b,'POSITION',0,0,
         struct.unpack('<f',struct.pack('<I',struct.unpack('<I',struct.pack('<f',.1))[0]+1))[0]),expected='positionSetMismatch'))
    test('one float step NORMAL substitution fails strict agreement even if tiny angle',lambda:checked(mutation=lambda d,b,r,w:replace_component(d,b,'NORMAL',0,1,
         struct.unpack('<f',struct.pack('<I',0x3f800001))[0]),expected='strictNormalMismatch'))
    for value,label in [(float('nan'),'NaN'),(float('inf'),'infinity')]:
        test('nonfinite '+label+' NORMAL',lambda value=value:checked(mutation=lambda d,b,r,w:replace_component(d,b,'NORMAL',0,0,value),expected='nonfiniteComponent'))
    test('normal reversal without winding reversal',lambda:checked(mutation=lambda d,b,r,w:replace_component(d,b,'NORMAL',0,1,-1.),expected='strictNormalMismatch'))
    test('zero NORMAL is not a usable source normal',lambda:checked(mutation=lambda d,b,r,w:replace_component(d,b,'NORMAL',0,1,0.),expected='strictNormalMismatch'))
    def false_flip(d,b,r,w):w['toy_row']['flippedPolygonIndices']=[0];w['toy_row']['polygonsWindingFlippedByRecalc']=1
    test('forged winding witness contradicts actual triangles',lambda:checked(mutation=false_flip,expected='windingWitnessMismatch'))
    test('witness source count substitution',lambda:checked(mutation=lambda d,b,r,w:w['toy_row'].update(meshLoops=3),expected='witnessCountMismatch'))
    test('unbound textual loop convention rejects',lambda:checked(mutation=lambda d,b,r,w:w['toy_row'].update(loopVertexOrder='nearest points'),expected='loopCorrespondenceContractMismatch'))
    test('duplicate triangle cannot replace polygon coverage',lambda:checked(toy_glb(triangle_faces=[(0,[0,1,2]),(0,[0,1,2])]),expected='positionSetMismatch'))
    test('same vertex set with overlapping triangles fails polygon boundary coverage',lambda:checked(
         toy_glb(triangle_faces=[(0,[0,1,2]),(0,[0,1,3])]),expected='polygonBoundaryCoverage'))
    def automatic_mode():
        row=source();row['rawFaceClasses']=[None]
        good=checked(toy_glb(row))
        bad=checked(toy_glb(row),mutation=lambda d,b,r,w:replace_component(d,b,'NORMAL',0,0,.01),expected='strictNormalMismatch')
        return {'automaticModeRetainsStrictNormalObligation':True,'positive':good,'mismatch':bad}
    test('automatic-normal rows are never exempted from frozen normal comparison',automatic_mode)
    test('foreign row transform rejected without epsilon',lambda:checked(mutation=lambda d,b,r,w:d['nodes'][0].update(translation=[1e-12,0,0]),expected='nonIdentityTransform'))
    test('runtime scale cannot be baked into GLB root',lambda:checked(mutation=lambda d,b,r,w:d['nodes'][1].update(scale=[2,2,2]),expected='nonIdentityTransform'))
    test('quantisation extension is unsupported',lambda:checked(mutation=lambda d,b,r,w:d.update(extensionsUsed=['KHR_mesh_quantization']),expected='quantizedOrCompressedGeometryUnsupported'))
    test('normal accessor layout substitution',lambda:checked(mutation=lambda d,b,r,w:d['accessors'][1].update(normalized=True),expected='float32Vec3Required'))
    test('row asset identity is required',lambda:checked(mutation=lambda d,b,r,w:d['nodes'][0]['extras'].update(assetId='other'),expected='rowAssetIdentity'))
    test('material row identity is required',lambda:checked(mutation=lambda d,b,r,w:d['materials'][0].update(name='other'),expected='rowMaterialIdentity'))
    def ambiguous():
        r=source(faces=[[0,1,2,3],[0,1,2,3]])
        return checked(toy_glb(r,[(0,[0,1,2]),(0,[0,2,3]),(1,[0,1,2]),(1,[0,2,3])]),expected='ambiguousOrForeignSourceTriangle')
    test('coincident duplicate polygons fail closed rather than nearest assignment',ambiguous)
    def bent():
        r=source(vertices=[[0.,0.,0.],[1.,0.,0.],[1.,1.,0.],[0.,1.,0.],[1.,0.,1.],[1.,1.,1.]],
                 faces=[[0,1,2,3],[1,4,5,2]],normals=[[[0.,0.,1.]]*4,[[-1.,0.,0.]]*4])
        fixture=toy_glb(r,[(0,[0,1,2]),(0,[0,2,3]),(1,[1,4,5]),(1,[1,5,2])],split=True)
        good=checked(copy.deepcopy(fixture));bad=checked(fixture,mutation=lambda d,b,r,w:replace_component(d,b,'NORMAL',6,0,0.),expected='strictNormalMismatch')
        return {'splitSeamPositive':good,'samePositionWrongFaceNormalRejected':bad}
    test('normal correspondence follows exact polygon corner across coincident seams',bent)
    def concave():
        r=source(vertices=[[0.,0.,0.],[2.,0.,0.],[1.,.4,0.],[2.,2.,0.],[0.,2.,0.]],faces=[[0,1,2,3,4]])
        good=checked(toy_glb(r,[(0,[0,1,2]),(0,[0,2,4]),(0,[2,3,4])]))
        bad=checked(toy_glb(r,[(0,[0,1,4]),(0,[1,2,4]),(0,[2,3,4])]),expected='windingWitnessMismatch')
        return {'concaveValid':good,'outsideDiagonalReject':bad}
    test('concave polygon triangulation must cover oriented interior',concave)
    # Public binding controls use frozen bytes only as read-only input; no geometry
    # is generated from them and no successful candidate audit is represented.
    frozen=(C.KIT/'manifests/m4-v04-rows.json').read_bytes();toy=toy_glb();raw=encode(*toy[:2])
    pins={'helper':C.FREEZE['sources']['helper'],'declaration':C.FREEZE['sources']['authorDeclarations'],
          'rows':C.ROWS_FILE_SHA,'rowsCanonical':C.ROWS_CANONICAL_SHA,'producer':C.FREEZE['sources']['producer'],
          'mapping':C.guard.MAPPING_SHA,'parent':C.guard.PARENT_SHA,'parentManifest':C.guard.MANIFEST_SHA,
          'proposal':C.guard.AMENDMENT_SHA,'guard':C.GUARD_SHA,'checker':C.CHECKER_SHA,
          'gltfGenerator':C.guard.PROVENANCE['assetMetadata']['generator']}
    envelope={'sourceScript':'source/build_fullkit_m4_v04_inspection.py','sourceScriptSha256':'a'*64,
              'exportReadback':{'rawSha256':C.sha(raw)},'inspection':{'pins':pins,
              'derivedFrom':{'path':'source/build_fullkit_m4_v04.py','sha256':C.FROZEN_BUILDER_SHA},
              'selectedPose':C.FREEZE['producerInvocation']['pose'],'rows':toy[3]}}
    def binding(code,change=None,arguments=None):
        e=copy.deepcopy(envelope)
        if change:change(e)
        w=C.canonical(e);kwargs={'expected_candidate_sha256':C.sha(raw),'expected_witness_sha256':C.sha(w),'expected_builder_sha256':'a'*64}
        if arguments:kwargs.update(arguments)
        result=C.audit_export_correspondence(raw,frozen,w,**kwargs)
        assert not result['valid'] and code in {x['code'] for x in result['errors']},result['errors']
        assert json.loads(json.dumps(result,allow_nan=False))==result
        return {'codes':[x['code'] for x in result['errors']],'candidateAcceptance':result['candidateAcceptance']}
    test('externally supplied raw hash must match',lambda:binding('candidateHashMismatch',arguments={'expected_candidate_sha256':'b'*64}))
    test('externally supplied witness hash must match',lambda:binding('witnessHashMismatch',arguments={'expected_witness_sha256':'b'*64}))
    test('witness cannot choose its own trusted builder',lambda:binding('witnessBuilderIdentity',lambda e:e.update(sourceScriptSha256='b'*64)))
    test('witness raw cross-link required',lambda:binding('witnessRawIdentity',lambda e:e['exportReadback'].update(rawSha256='b'*64)))
    test('source normal/payload pin substitution rejects',lambda:binding('witnessInputPins',lambda e:e['inspection']['pins'].update(rowsCanonical='b'*64)))
    test('witness pose substitution rejects',lambda:binding('witnessPose',lambda e:e['inspection'].update(selectedPose={'cx':0,'cy':0,'yaw':0})))
    test('complete witness row set required',lambda:binding('witnessRowSet'))
    def bad_frozen():
        w=C.canonical(envelope);r=C.audit_export_correspondence(raw,b'{}',w,expected_candidate_sha256=C.sha(raw),
                         expected_witness_sha256=C.sha(w),expected_builder_sha256='a'*64)
        assert r['errors'][0]['code']=='frozenRowsArtifactMismatch';return r['errors']
    test('caller cannot replace root frozen rows with a fixture',bad_frozen)
    def cli():
        candidate=Path('toy-memory.glb');witness_path=Path('toy-memory-witness.json');report=Path('toy-memory-result.json')
        w=C.canonical(envelope);readable={candidate:raw,witness_path:w,C.KIT/'manifests/m4-v04-rows.json':frozen};sink=io.StringIO();modes=[]
        class Sink:
            def __enter__(self):return sink
            def __exit__(self,*args):return False
        def opened(path,mode,*args,**kwargs):assert path==report and mode=='x';modes.append(mode);return Sink()
        args=[str(candidate),'--witness',str(witness_path),'--candidate-sha',C.sha(raw),'--witness-sha',C.sha(w),
              '--builder-sha','a'*64,'--report',str(report)]
        with patch.object(Path,'read_bytes',lambda p:readable[p]),patch.object(Path,'exists',lambda p:False),patch.object(Path,'open',opened):
            assert C.main(args)==1
        assert modes==['x'] and json.loads(sink.getvalue())['errors'][0]['code']=='witnessRowSet'
        args[-1]=str(HELPER)
        try:C.main(args)
        except SystemExit as e:assert e.code==2
        else:raise AssertionError('existing path not protected')
        return {'invalidExit':1,'memoryOnlyReceiptMode':'x','existingPathExit':2}
    test('fresh-exclusive CLI evidence and existing-file refusal',cli)
    after=controls_protected();assert before==after
    receipt={'schema':'m4-v04-export-correspondence-writer-fixtures/1','scope':'synthetic finite geometry only; no actual candidate, Blender, source producer or completed audit run',
             'candidateAcceptance':False,'exportAuthorization':False,'checkerSha256':C.CHECKER_SHA,'testSha256':C.sha(Path(__file__).read_bytes()),
             'protectedBefore':before,'protectedAfter':after,'results':results,'passed':sum(r['passed'] for r in results),
             'total':len(results),'elapsedSeconds':time.monotonic()-start}
    if write:
        with OUTPUT.open('x',encoding='utf-8',newline='\n') as output:json.dump(receipt,output,indent=2,allow_nan=False);output.write('\n')
    print(json.dumps({k:receipt[k] for k in ('passed','total','elapsedSeconds')}))
    for r in results:
        if not r['passed']:print(json.dumps(r))
    return 0 if receipt['passed']==receipt['total'] else 1


if __name__=='__main__':
    if sys.argv[1:] not in ([],['--write']):raise SystemExit('Only --write supported')
    raise SystemExit(run('--write' in sys.argv))
