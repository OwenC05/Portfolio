"""Read-only strict frozen-row to raw-glTF correspondence; no Blender/imported art execution.

Positions are exact IEEE float32 Blender mesh coordinates, then (x,z,-y).
Normals are exact float32 source corner normals, oriented by the hash-bound
builder winding witness, then (x,z,-y). Signed zero is canonicalized only.
No angular/position epsilon can make a substitution pass. Blender custom-normal
encoding or automatic-normal differences can therefore yield a legitimate
export with valid topology but FAILED strict normal correspondence; diagnostics
disclose angles, never authorize a tolerance. This is not a full GLB validator.
"""
import argparse
from collections import Counter,defaultdict
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import struct

HERE=Path(__file__).resolve().parent
KIT=HERE.parent/'asset-pipeline/full-kit'
GUARD_SHA='b79fca8ae91c97a8d817154a948e4b7388664e1ddbc5b11c1ffc744de513524c'
FREEZE_SHA='48d7925416bd1ffab4ddfed0935f18ef074522d23c6a678af150fa3d6351ef72'
ROWS_FILE_SHA='1fa5fdd3f267896a76743aca986af9cadd1dd84610395e6049fc799009489992'
ROWS_CANONICAL_SHA='cfac1013f686bb7790bc2f5e9ed5acc518009ab7e2bc27d09ad09629c429533e'
FROZEN_BUILDER_SHA='0d01536c36481021e8ff7026a6608998eb44dce0d88505dae105f94834909826'
LOOP_ORDER='mesh loops of polygon i list the helper face i vertices in Blender order (reversed cyclically when i is flipped); vertex index == helper vertex index'


def sha(raw):return hashlib.sha256(raw).hexdigest()


class CorrespondenceError(ValueError):
    def __init__(self,code,**context):
        super().__init__(code);self.detail={'code':code,**context}


def require(ok,code,**context):
    if not ok:raise CorrespondenceError(code,**context)


def strict_json(raw):
    def pairs(items):
        out={}
        for key,value in items:
            require(key not in out,'duplicateJsonKey',key=key);out[key]=value
        return out
    def bad(value):raise CorrespondenceError('nonfiniteJson',value=value)
    return json.loads(raw,object_pairs_hook=pairs,parse_constant=bad)


def canonical(value):return json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=False,allow_nan=False).encode()


guard_path=HERE/'m4-v04-inspection-transition-guard.py'
require(sha(guard_path.read_bytes())==GUARD_SHA,'guardSourcePin')
spec=importlib.util.spec_from_file_location('inspection_transition_parser',guard_path)
guard=importlib.util.module_from_spec(spec);spec.loader.exec_module(guard)
freeze_raw=(HERE/'m4-v04-root-expected-pins.json').read_bytes()
require(sha(freeze_raw)==FREEZE_SHA,'rootFreezePin')
FREEZE=strict_json(freeze_raw)
require(FREEZE['rowsSha256']==ROWS_CANONICAL_SHA and
        FREEZE['artifactBytePins']['asset-pipeline/full-kit/manifests/m4-v04-rows.json']==ROWS_FILE_SHA,'rootRowsPin')
CHECKER_SHA=sha(Path(__file__).read_bytes())


def f32(value):
    require(type(value) in (int,float) and math.isfinite(value),'nonfiniteComponent')
    result=struct.unpack('<f',struct.pack('<f',value))[0]
    require(math.isfinite(result),'float32Overflow')
    return 0.0 if result==0 else result


def xyz_key(vector):
    require(len(vector)==3,'xyzShape')
    return tuple(f32(x) for x in vector)


def to_gltf(vector,sign=1):
    x,y,z=xyz_key(vector)
    return xyz_key((sign*x,sign*z,-sign*y))


def identity_transform(node):
    if 'matrix' in node:
        require(not set(node)&{'translation','rotation','scale'},'mixedTransform')
        require(node['matrix']==[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],'nonIdentityTransform',node=node.get('name'))
    for key,value in [('translation',[0,0,0]),('rotation',[0,0,0,1]),('scale',[1,1,1])]:
        if key in node:require(node[key]==value,'nonIdentityTransform',node=node.get('name'),field=key)


def float_vectors(doc,raw,start,index,semantic):
    item=guard.accessor(doc,raw,start,index)
    require(item['meta']['componentType']==5126 and item['meta']['type']=='VEC3' and
            not item['meta'].get('normalized',False),'float32Vec3Required',semantic=semantic)
    require(not item['meta'].get('extensions'),'accessorExtensionUnsupported',semantic=semantic)
    values=[xyz_key(v) for v in struct.iter_unpack('<fff',item['data'])]
    return values,item


def triangle_indices(doc,raw,start,primitive,count):
    if 'indices' not in primitive:return list(range(count))
    item=guard.accessor(doc,raw,start,primitive['indices']);meta=item['meta']
    require(meta['type']=='SCALAR' and meta['componentType'] in (5121,5123,5125) and
            not meta.get('normalized',False),'unsignedIndexLayout')
    return [v[0] for v in struct.iter_unpack('<'+{5121:'B',5123:'H',5125:'I'}[meta['componentType']],item['data'])]


def projected_orientation(points):
    # Used only for sign/degeneracy of exact float32 coordinates, never proximity.
    newell=[sum((a[(axis+1)%3]-b[(axis+1)%3])*(a[(axis+2)%3]+b[(axis+2)%3])
                for a,b in zip(points,points[1:]+points[:1])) for axis in range(3)]
    axis=max(range(3),key=lambda i:abs(newell[i]));require(newell[axis]!=0,'degenerateSourcePolygon')
    return axis,1 if newell[axis]>0 else -1


def triangle_orientation(points,axis):
    a,b,c=points;u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)]
    cross=u[(axis+1)%3]*v[(axis+2)%3]-u[(axis+2)%3]*v[(axis+1)%3]
    require(cross!=0,'degenerateProjectedTriangle')
    return 1 if cross>0 else -1


def verify_tessellation(face,triangles,positions,flipped):
    """Exact polygon coverage: boundary, opposite interior edges, noncrossing chords.

    Any valid source-corner triangulation is allowed; a fixed fan/index ordering
    is not assumed. No invented vertices, omitted faces or swapped diagonals
    outside a concave polygon can hide behind coincident positions.
    """
    require(len(triangles)==len(face)-2,'sourceFaceTriangleCount')
    local={value:i for i,value in enumerate(face)};n=len(face);edges=Counter();undirected=Counter();seen=set()
    points=[positions[v] for v in face];axis,source_sign=projected_orientation(points)
    sign=-1 if flipped else 1
    for triangle in triangles:
        require(len(set(triangle))==3,'degenerateTopologyTriangle')
        key=tuple(sorted(triangle));require(key not in seen,'duplicateSourceTriangle');seen.add(key)
        require(triangle_orientation([positions[v] for v in triangle],axis)==source_sign*sign,'windingWitnessMismatch')
        t=[local[v] for v in triangle]
        for a,b in zip(t,t[1:]+t[:1]):edges[(a,b)]+=1;undirected[tuple(sorted((a,b)))]+=1
    boundary={tuple(sorted((i,(i+1)%n))) for i in range(n)}
    for i in range(n):
        edge=(i,(i+1)%n) if not flipped else ((i+1)%n,i)
        require(edges[edge]==1 and edges[edge[::-1]]==0,'polygonBoundaryCoverage')
    diagonals=[]
    for edge,count in undirected.items():
        if edge in boundary:continue
        require(count==2 and edges[edge]==edges[edge[::-1]]==1,'interiorEdgeCoverage')
        diagonals.append(edge)
    for i,(a,b) in enumerate(diagonals):
        for c,d in diagonals[i+1:]:
            require(not (a<c<b<d or c<a<d<b),'crossingTriangulationDiagonals')


def normal_angle(actual,expected):
    an=math.sqrt(sum(x*x for x in actual));en=math.sqrt(sum(x*x for x in expected))
    if an==0 or en==0:return None
    return math.degrees(math.acos(max(-1,min(1,sum(a*b for a,b in zip(actual,expected))/(an*en)))))


def witness_row(row,record):
    vertices,faces=row['vertices'],row['faces']
    for key,value in {'helperVertices':len(vertices),'helperFaces':len(faces),'triangles':sum(len(f)-2 for f in faces),
                      'meshVertices':len(vertices),'meshPolygons':len(faces),'meshLoops':sum(map(len,faces))}.items():
        require(type(record.get(key)) is int and record[key]==value,'witnessCountMismatch',field=key)
    flipped=record['flippedPolygonIndices']
    require(type(flipped) is list and len(set(flipped))==len(flipped) and
            all(type(x) is int and 0<=x<len(faces) for x in flipped),'invalidWindingWitness')
    custom=any(c is not None for c in row['rawFaceClasses'])
    require(type(record['customNormals']) is bool and record['customNormals']==custom,'normalModeWitnessMismatch')
    require(record['loopVertexOrder']==LOOP_ORDER,'loopCorrespondenceContractMismatch')
    require(record['polygonsWindingFlippedByRecalc']==(len(flipped) if custom else None),'windingCountWitnessMismatch')
    return set(flipped)


def check_row(row,positions,normals,indices,witness):
    flipped=witness_row(row,witness)
    expected=[to_gltf(v) for v in row['vertices']];faces=row['faces']
    require(len(positions)==len(normals),'positionNormalCount')
    require(len(indices)>0 and len(indices)%3==0 and all(type(i) is int and 0<=i<len(positions) for i in indices),'indexRange')
    require(set(indices)==set(range(len(positions))),'unreferencedExportVertex')
    expected_set=set(expected);require(set(positions)==expected_set,'positionSetMismatch',
            missing=len(expected_set-set(positions)),unexpected=len(set(positions)-expected_set))
    memberships=defaultdict(set);face_maps=[]
    for fi,face in enumerate(faces):
        require(len(face)>=3 and len(face)==len(set(face)),'sourceFaceLayout')
        mapping={expected[v]:v for v in face}
        require(len(mapping)==len(face),'float32CollapsedSourceCorners',sourceFace=fi)
        face_maps.append(mapping)
        for key in mapping:memberships[key].add(fi)
    triangles=defaultdict(list);correspondence=[];mismatches=[];mismatch_count=0;max_angle=0.;min_norm=float('inf');max_norm=0.
    for offset in range(0,len(indices),3):
        exported=indices[offset:offset+3];keys=[positions[i] for i in exported]
        candidates=set.intersection(*(memberships[k] for k in keys))
        require(len(candidates)==1,'ambiguousOrForeignSourceTriangle',exportedTriangle=offset//3,candidateFaces=sorted(candidates))
        fi=next(iter(candidates));face=faces[fi];source=[face_maps[fi][key] for key in keys]
        triangles[fi].append(source);sign=-1 if fi in flipped else 1
        correspondence.append({'exportedTriangle':offset//3,'sourceFace':fi,'sourceVertices':source,
                               'exportedVertices':exported,'windingSign':sign})
        for ev,sv in zip(exported,source):
            corner=face.index(sv);target=to_gltf(row['cornerNormals'][fi][corner],sign);actual=normals[ev]
            norm=math.sqrt(sum(x*x for x in actual));min_norm=min(min_norm,norm);max_norm=max(max_norm,norm)
            angle=normal_angle(actual,target)
            if angle is not None:max_angle=max(max_angle,angle)
            if actual!=target:
                mismatch_count+=1
                if len(mismatches)<32:mismatches.append({'exportedVertex':ev,'sourceFace':fi,'sourceVertex':sv,
                        'actual':actual,'expected':target,'actualFloat32Hex':struct.pack('<fff',*actual).hex(),
                        'expectedFloat32Hex':struct.pack('<fff',*target).hex(),'angleDeg':angle})
    require(set(triangles)==set(range(len(faces))),'sourceFaceCoverage')
    for fi,face in enumerate(faces):verify_tessellation(face,triangles[fi],expected,fi in flipped)
    return {'positionAndTopologyExact':True,'strictSourceNormalAgreement':mismatch_count==0,
            'sourceVertices':len(expected),'exportedVerticesAfterCornerSplitting':len(positions),'sourceFaces':len(faces),
            'triangles':len(indices)//3,'flippedFaces':sorted(flipped),'normalMode':'custom' if witness['customNormals'] else 'automatic',
            'normalCornerOccurrencesCompared':len(indices),'normalMismatchOccurrences':mismatch_count,
            'normalMismatchExamples':mismatches,'maximumNormalAngleDifferenceDeg':max_angle,
            'exportedNormalLengthRange':[min_norm,max_norm],'triangleCorrespondence':correspondence,
            'mappingSha256':sha(canonical(correspondence))}


def check_document(raw,rows,witness_rows):
    doc,start=guard.parse_glb(raw)
    require(doc['asset']==guard.PROVENANCE['assetMetadata'],'exporterIdentity')
    forbidden={'KHR_mesh_quantization','KHR_draco_mesh_compression','EXT_meshopt_compression'}
    require(not forbidden.intersection(doc.get('extensionsUsed',[])+doc.get('extensionsRequired',[])),'quantizedOrCompressedGeometryUnsupported')
    named=guard.unique_named(doc['nodes'],'node');root=named['studio_full_kit'];identity_transform(root)
    require(len(doc['scenes'])==1 and doc.get('scene',0)==0 and
            doc['scenes'][0]['nodes']==[doc['nodes'].index(root)],'sceneRootIdentity')
    parents=defaultdict(list)
    for index,node in enumerate(doc['nodes']):
        for child in node.get('children',[]):parents[child].append(index)
    root_index=doc['nodes'].index(root);output={};errors=[]
    require(set(witness_rows)==set(rows),'witnessRowSet')
    for name,row in rows.items():
        try:
            node=named[name];index=doc['nodes'].index(node)
            require(parents[index]==[root_index] and not node.get('children'),'rowParentIdentity',row=name)
            identity_transform(node)
            require(node.get('extras',{}).get('assetId')==row['asset'],'rowAssetIdentity',row=name)
            require('skin' not in node and 'weights' not in node,'deformedRowUnsupported',row=name)
            mesh=guard.ref(doc['meshes'],node['mesh'],'mesh');require(len(mesh['primitives'])==1,'onePrimitivePerRow',row=name)
            primitive=mesh['primitives'][0]
            require(primitive.get('mode',4)==4 and not primitive.get('targets') and not primitive.get('extensions'),'plainTrianglePrimitive',row=name)
            material=guard.ref(doc['materials'],primitive['material'],'material')
            require(material['name']==row['material'],'rowMaterialIdentity',row=name)
            p,_=float_vectors(doc,raw,start,primitive['attributes']['POSITION'],'POSITION')
            n,_=float_vectors(doc,raw,start,primitive['attributes']['NORMAL'],'NORMAL')
            indices=triangle_indices(doc,raw,start,primitive,len(p))
            output[name]=check_row(row,p,n,indices,witness_rows[name])
            if not output[name]['strictSourceNormalAgreement']:errors.append({'code':'strictNormalMismatch','row':name,
                    'occurrences':output[name]['normalMismatchOccurrences'],'maximumAngleDeg':output[name]['maximumNormalAngleDifferenceDeg']})
        except CorrespondenceError as error:errors.append({'row':name,**error.detail})
    return output,errors


def audit_export_correspondence(candidate_bytes,rows_bytes,witness_bytes,*,expected_candidate_sha256,
                                 expected_witness_sha256,expected_builder_sha256):
    """Pure audit with caller-supplied pinned raw/witness/released-builder identities.

    The witness is supporting evidence from that builder, not an independent
    truth source: exported topology must independently agree with every flip.
    Hashes establish byte identity, not proof that a claimed execution occurred.
    """
    report={'schema':'m4-v04-export-correspondence/1','valid':False,'candidateAcceptance':False,'exportAuthorization':False,
            'checkerSha256':CHECKER_SHA,'rootFreezeSha256':FREEZE_SHA,'guardSha256':GUARD_SHA,
            'errors':[],'rows':{},'scope':'exact source POSITION/topology and strict source NORMAL correspondence only',
            'limitations':['No candidate/export exists during preparation; fixture success is not actual correspondence.',
                'Normals compare exact float32 source components after witnessed winding orientation; no epsilon.',
                'Blender custom-normal encoding/normalization and automatic normal generation may differ from frozen source normals.',
                'Such differences fail strict normal correspondence even when angularly small; angle is diagnostic only.',
                'Ambiguous coincident source faces and float32-collapsed corners fail closed; no nearest-point assignment.',
                'Identity root/leaf transforms and uncompressed FLOAT VEC3 required; runtime scale 2 / Y+0.11 is not in GLB coordinates.',
                'UVs/material/image/retained-byte preservation require the separate transition guard and full validator.',
                'Externally supplied hashes bind the witness and raw bytes, but do not cryptographically prove builder execution.']}
    try:
        for name,value in [('raw',expected_candidate_sha256),('witness',expected_witness_sha256),('builder',expected_builder_sha256)]:
            require(type(value) is str and len(value)==64 and all(c in '0123456789abcdef' for c in value),'externalPinRequired',kind=name)
        require(all(type(x) is bytes for x in (candidate_bytes,rows_bytes,witness_bytes)),'bytesRequired')
        report.update(candidateSha256=sha(candidate_bytes),rowsArtifactSha256=sha(rows_bytes),
                      witnessSha256=sha(witness_bytes),expectedBuilderSha256=expected_builder_sha256)
        require(sha(candidate_bytes)==expected_candidate_sha256,'candidateHashMismatch')
        require(sha(witness_bytes)==expected_witness_sha256,'witnessHashMismatch')
        require(sha(rows_bytes)==ROWS_FILE_SHA,'frozenRowsArtifactMismatch')
        rows=strict_json(rows_bytes);require(sha(canonical(rows))==ROWS_CANONICAL_SHA,'frozenRowsCanonicalMismatch')
        require(set(rows)=={r['leaf'] for r in guard.CONTRACT['addedRows']},'frozenRowSet')
        witness=strict_json(witness_bytes)
        require(witness['sourceScript']=='source/build_fullkit_m4_v04_inspection.py' and
                witness['sourceScriptSha256']==expected_builder_sha256,'witnessBuilderIdentity')
        require(witness['exportReadback']['rawSha256']==expected_candidate_sha256,'witnessRawIdentity')
        inspection=witness['inspection'];pins=inspection['pins']
        expected={'helper':FREEZE['sources']['helper'],'declaration':FREEZE['sources']['authorDeclarations'],
                  'rows':ROWS_FILE_SHA,'rowsCanonical':ROWS_CANONICAL_SHA,'producer':FREEZE['sources']['producer'],
                  'mapping':guard.MAPPING_SHA,'parent':guard.PARENT_SHA,'parentManifest':guard.MANIFEST_SHA,
                  'proposal':guard.AMENDMENT_SHA,'guard':GUARD_SHA,'checker':CHECKER_SHA,
                  'gltfGenerator':guard.PROVENANCE['assetMetadata']['generator']}
        require(pins==expected,'witnessInputPins')
        require(inspection['derivedFrom']=={'path':'source/build_fullkit_m4_v04.py','sha256':FROZEN_BUILDER_SHA},'witnessBuilderLineage')
        require(inspection['selectedPose']==FREEZE['producerInvocation']['pose'],'witnessPose')
        report['rows'],report['errors']=check_document(candidate_bytes,rows,inspection['rows'])
        report['positionAndTopologyExact']=len(report['rows'])==len(rows) and all(r['positionAndTopologyExact'] for r in report['rows'].values())
        report['strictSourceNormalAgreement']=len(report['rows'])==len(rows) and all(r['strictSourceNormalAgreement'] for r in report['rows'].values())
    except CorrespondenceError as error:report['errors'].append(error.detail)
    except guard.AuditError as error:report['errors'].append(error.detail)
    except (KeyError,IndexError,TypeError,AttributeError,ValueError,OverflowError,struct.error) as error:
        report['errors'].append({'code':'malformedInput','message':str(error)})
    report['valid']=not report['errors']
    return report


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidate',type=Path);parser.add_argument('--witness',required=True,type=Path)
    for name in ('candidate-sha','witness-sha','builder-sha'):parser.add_argument('--'+name,required=True)
    parser.add_argument('--report',required=True,type=Path);args=parser.parse_args(argv)
    if args.report.exists():parser.exit(2,'receipt already exists; nothing overwritten\n')
    result=audit_export_correspondence(args.candidate.read_bytes(),(KIT/'manifests/m4-v04-rows.json').read_bytes(),
            args.witness.read_bytes(),expected_candidate_sha256=args.candidate_sha,
            expected_witness_sha256=args.witness_sha,expected_builder_sha256=args.builder_sha)
    result['candidatePath']=str(args.candidate);result['witnessPath']=str(args.witness)
    with args.report.open('x',encoding='utf-8',newline='\n') as output:json.dump(result,output,indent=2,allow_nan=False);output.write('\n')
    print(json.dumps({'valid':result['valid'],'errors':len(result['errors']),'report':str(args.report)}))
    return 0 if result['valid'] else 1


if __name__=='__main__':raise SystemExit(main())
