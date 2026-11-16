"""Bounded v04 CPU diagnostic primitives; no candidate work on import.

Author-ready pins, the explicit coarse table and subsequent author selection
gate orchestration. No pose search, candidate audit, ranking or art selection
is implemented here. Ray figures are sampled source diagnostics, not pixels.
"""
import math
import json
import struct
import hashlib
import time
import types
from pathlib import Path
from collections import Counter

import numpy as np

EYE = np.array([-.35, -1.70, 1.345])
PROJECT_TARGETS = {'target_dissertation', 'target_copilot', 'target_typeforge'}
PROJECT_BORDERS = {'border_dissertation', 'border_copilot', 'border_typeforge'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def runtime_eligibility(name, metadata, ancestors_visible=True, layers_match=True):
    """Binder candidate policy plus picker material/ancestor checks.

    metadata maps actual loader userData.transparent and live material state;
    semantic `occluder` is intentionally not used as a substitute. Offline
    callers must disclose their visibility/layer/material assumptions.
    """
    candidate = name not in PROJECT_TARGETS | PROJECT_BORDERS and metadata.get('transparent') is False
    visible = ancestors_visible and metadata.get('visible') is True and layers_match
    material = (metadata.get('materialVisible') is True and metadata.get('materialTransparent') is False
                and type(metadata.get('opacity')) in (int, float) and metadata['opacity'] >= 1)
    reasons = []
    if name in PROJECT_TARGETS | PROJECT_BORDERS:
        reasons.append('project_target_or_border_excluded_from_blocker_candidates')
    if metadata.get('transparent') is not False:
        reasons.append('transparent_or_missing_loader_metadata')
    if not visible:
        reasons.append('hidden_ancestor_or_layer')
    if not material:
        reasons.append('material_not_opaque_visible')
    return {'binderCandidate': candidate, 'opaqueBlockerEligible': bool(candidate and visible and material),
            'visible': bool(visible), 'exclusionReasons': reasons}


def triangles(vertices, faces):
    vertices = np.asarray(vertices, dtype=float)
    require(vertices.ndim == 2 and vertices.shape[1] == 3 and np.isfinite(vertices).all(), 'finite XYZ required')
    output, source_faces = [], []
    for fi, face in enumerate(faces):
        require(len(face) >= 3 and all(type(v) is int and 0 <= v < len(vertices) for v in face), 'invalid polygon indices')
        for i in range(1, len(face)-1):
            output.append(vertices[[face[0], face[i], face[i+1]]])
            source_faces.append(fi)
    return np.asarray(output, dtype=float).reshape((-1, 3, 3)), source_faces


def area_samples(tris, count):
    """Deterministic equal-area strata; density is independent of vertex count.

    Triangles receive samples according to area using stratified inverse CDF;
    within-triangle low-discrepancy barycentrics use the square-root map. This
    is uniform surface area sampling, not uniform projected-pixel sampling.
    """
    t = np.asarray(tris, dtype=float)
    require(t.ndim == 3 and t.shape[1:] == (3, 3) and np.isfinite(t).all(), 'finite triangles required')
    require(type(count) is int and count > 0, 'positive sample count required')
    areas = np.linalg.norm(np.cross(t[:, 1]-t[:, 0], t[:, 2]-t[:, 0]), axis=1)/2
    require(len(areas) > 0 and np.all(areas > 0) and np.isfinite(areas).all(), 'nondegenerate area samples required')
    cumulative = np.cumsum(areas)
    where = (np.arange(count)+.5)/count*cumulative[-1]
    selected = np.searchsorted(cumulative, where)
    # Use strata position within its triangle for the first independent axis.
    starts = np.r_[0., cumulative[:-1]][selected]
    u = (where-starts)/areas[selected]
    v = ((np.arange(count)+.5)*((math.sqrt(5)-1)/2)) % 1
    root = np.sqrt(u)
    bary = np.column_stack((1-root, root*(1-v), root*v))
    points = np.einsum('ni,nij->nj', bary, t[selected])
    return points, {'method': 'equal-area stratified triangle selection and square-root barycentrics',
                    'sampleCount': count, 'surfaceAreaM2': float(cumulative[-1]),
                    'triangleSampleCounts': np.bincount(selected, minlength=len(t)).tolist(),
                    'interpretation': 'source surface-area diagnostic; not visible pixels or image approval'}


def bounded_vertices(vertices, limit=150):
    v = np.asarray(vertices, dtype=float)
    require(type(limit) is int and limit > 0, 'positive vertex cap required')
    indices = np.linspace(0, len(v)-1, min(len(v), limit), dtype=int) if len(v) else np.array([], dtype=int)
    return v[indices], indices.tolist()


class RayScene:
    """Finite-endpoint rays with labelled target, blocker and no-hit outcomes."""
    def __init__(self, entries, eye=EYE):
        self.eye = np.asarray(eye, dtype=float)
        require(self.eye.shape == (3,) and np.isfinite(self.eye).all(), 'finite eye required')
        self.entries = entries
        arrays, owners, blockers, targets, transparent, sided = [], [], [], [], [], []
        self.eligibility = {}
        for entry in entries:
            name = entry['name']; meta = entry['metadata']
            policy = runtime_eligibility(name, meta, entry.get('ancestorsVisible', True), entry.get('layersMatch', True))
            self.eligibility[entry['label']] = policy
            t = np.asarray(entry['triangles'], dtype=float)
            require(t.ndim == 3 and t.shape[1:] == (3, 3) and np.isfinite(t).all(), 'finite scene triangles required')
            arrays.append(t); owners.extend([entry['label']]*len(t))
            blockers.extend([policy['opaqueBlockerEligible']]*len(t))
            targets.extend([name in PROJECT_TARGETS and policy['visible'] and meta.get('materialVisible') is True
                            and meta.get('opacity', 0) > 0]*len(t))
            transparent.extend([policy['visible'] and meta.get('materialVisible') is True
                                and meta.get('transparent') is True]*len(t))
            sided.extend([meta.get('doubleSided') is True]*len(t))
        t = np.concatenate(arrays) if arrays else np.empty((0,3,3))
        self.owners = np.asarray(owners, dtype=object)
        self.blockers = np.asarray(blockers, dtype=bool)
        self.targets = np.asarray(targets, dtype=bool)
        self.transparent = np.asarray(transparent, dtype=bool)
        self.double_sided = np.asarray(sided, dtype=bool)
        self.e1, self.e2 = t[:,1]-t[:,0], t[:,2]-t[:,0]
        self.s = self.eye-t[:,0]
        self.q = np.cross(self.s, self.e1)
        self.tq = np.einsum('ij,ij->i',self.e2,self.q)

    def cast(self, points, expected_labels, endpoint_slack_m=.002):
        expected_labels = set(expected_labels)
        results = []
        for point in np.asarray(points, dtype=float):
            require(point.shape == (3,) and np.isfinite(point).all(), 'finite ray endpoint required')
            displacement = point-self.eye; length = float(np.linalg.norm(displacement))
            require(length > 0, 'ray endpoint equals eye')
            direction = displacement/length
            h = np.cross(direction, self.e2)
            determinant = np.einsum('ij,ij->i', self.e1,h)
            usable = np.where(self.double_sided, np.abs(determinant)>1e-15, determinant>1e-15)
            reciprocal = np.divide(1.,determinant,out=np.zeros_like(determinant),where=usable)
            u = reciprocal*np.einsum('ij,ij->i',self.s,h)
            v = reciprocal*np.einsum('ij,j->i',self.q,direction)
            distances = reciprocal*self.tq
            hit = usable & (u >= -1e-12) & (v >= -1e-12) & (u+v <= 1+1e-12) & (distances>1e-9) & (distances <= length+endpoint_slack_m)
            eligible = np.flatnonzero(hit & (self.blockers | self.targets))
            exclusions = sorted(set(self.owners[hit & self.transparent].tolist()))
            if not len(eligible):
                results.append({'category':'no_hit', 'firstLabel':None, 'distanceM':None, 'transparentExclusions':exclusions})
                continue
            index = min(eligible, key=lambda i: (distances[i], str(self.owners[i])))
            label = str(self.owners[index])
            category = 'target_hit' if label in expected_labels else ('other_project_target_hit' if self.targets[index] else 'opaque_blocker')
            results.append({'category':category,'firstLabel':label,'distanceM':float(distances[index]), 'transparentExclusions':exclusions})
        return results


def ray_summary(results, sampling):
    categories = Counter(r['category'] for r in results)
    blockers = Counter(r['firstLabel'] for r in results if r['category']=='opaque_blocker')
    exclusions = Counter(label for r in results for label in r['transparentExclusions'])
    return {'sampling': sampling, 'count':len(results),
            'targetHits': categories['target_hit'], 'opaqueBlockerHits':categories['opaque_blocker'],
            'otherProjectTargetHits':categories['other_project_target_hit'], 'noHits':categories['no_hit'],
            'targetHitFraction': categories['target_hit']/len(results) if results else None,
            'opaqueBlockersByLabel':dict(sorted(blockers.items())),
            'transparentExcludedRayCountsByLabel':dict(sorted(exclusions.items())),
            'interpretation':'no-hit is not a target hit; fractions are sample diagnostics, not visible pixels'}


def scoped_inlay_pair(a, b, declarations):
    """Match exact primitive identities, never row/asset-wide overlap immunity."""
    require(len(declarations) == 4, 'exactly four author-declared indicator/panel seating pairs required')
    wanted = frozenset((tuple(a), tuple(b)))
    pairs = []
    for declaration in declarations:
        pair = frozenset((tuple(declaration['indicator']), tuple(declaration['panel'])))
        require(len(pair) == 2 and pair not in pairs, 'duplicate or self seating pair')
        pairs.append(pair)
    return next((d for d,pair in zip(declarations,pairs) if pair==wanted), None)


def seating_offsets(vertices, plane_point, outward_unit_normal):
    """Signed plane offsets; does not alone prove finite-panel containment."""
    v, p, n = np.asarray(vertices,float), np.asarray(plane_point,float), np.asarray(outward_unit_normal,float)
    require(v.ndim==2 and v.shape[1]==3 and len(v)>0 and np.isfinite(v).all(), 'finite seating vertices required')
    require(p.shape==(3,) and n.shape==(3,) and np.isfinite(p).all() and np.isfinite(n).all()
            and abs(float(np.linalg.norm(n))-1)<1e-9, 'finite plane and unit normal required')
    signed = (v-p)@n
    return {'minimumSignedOffsetM':float(signed.min()), 'maximumSignedOffsetM':float(signed.max()),
            'limitation':'plane offsets only; footprint containment and exact declared pair checked separately'}


def attachment_contact(child_vertices, receiver_xy, receiver_z):
    """Attachment diagnostic, deliberately distinct from a floor-support gap.

    Requires every lowest child vertex to project inside the convex receiver
    footprint and report signed child-bottom-to-receiver-top height. The
    caller supplies the author-declared mating components, never all row verts.
    """
    v = np.asarray(child_vertices,float); boundary = np.asarray(receiver_xy,float)
    require(v.ndim==2 and v.shape[1]==3 and len(v)>0 and np.isfinite(v).all(), 'finite attachment vertices required')
    require(boundary.ndim==2 and boundary.shape[1]==2 and len(boundary)>=3 and np.isfinite(boundary).all(), 'receiver footprint required')
    require(math.isfinite(receiver_z), 'finite attachment receiver height required')
    edges = np.roll(boundary,-1,axis=0)-boundary
    turns = np.cross(np.column_stack((edges,np.zeros(len(edges)))),np.column_stack((np.roll(edges,-1,axis=0),np.zeros(len(edges)))))[:,2]
    require(np.all(turns>=-1e-12) or np.all(turns<=1e-12), 'convex attachment footprint required')
    bottom = v[np.abs(v[:,2]-v[:,2].min())<=1e-9,:2]
    delta = bottom[:,None,:]-boundary[None,:,:]
    signs = edges[None,:,0]*delta[:,:,1]-edges[None,:,1]*delta[:,:,0]
    inside = np.all(signs>=-1e-12,axis=1) | np.all(signs<=1e-12,axis=1)
    return {'signedAttachmentGapM':float(v[:,2].min()-receiver_z),
            'bottomVertexCount':len(bottom),'bottomVerticesInsideReceiver':int(inside.sum()),
            'bottomFootprintInside':bool(inside.all()),
            'scope':'declared attachment only; no floor-gap substitution or solid intersection claim'}


def edge_geometry(vertices, faces, face_classes):
    """Measure raw edge geometry without assigning author edge-set intent.

    Convexity is relative to the supplied oriented faces. Open/inward shells
    are not certified solids. Stable semantic set/status/reason attachment is
    a separate author-declaration operation; a face label cannot grant it.
    """
    v = np.asarray(vertices, dtype=float)
    triangles(v, faces)  # Validate finite positions and source indices.
    require(len(face_classes) == len(faces), 'complete edge face classes required')
    adjacency, normals, centres = {}, [], []
    for fi, face in enumerate(faces):
        require(len(set(face)) == len(face), 'repeated vertex in polygon')
        points = v[face]
        centre = points.mean(axis=0)
        n = np.cross(points-centre, np.roll(points, -1, axis=0)-centre).sum(axis=0)
        size = float(np.linalg.norm(n))
        normals.append(n/size if size > 1e-14 else None)
        centres.append(centre)
        for a, b in zip(face, face[1:]+face[:1]):
            adjacency.setdefault(tuple(sorted((a,b))), []).append((fi,a,b))
    records, seams = [], {}
    for (a,b), uses in sorted(adjacency.items()):
        length = float(np.linalg.norm(v[b]-v[a]))
        record = {'vertices':[a,b], 'faces':[u[0] for u in uses], 'lengthM':length}
        if len(uses) != 2:
            record['band'] = 'boundary' if len(uses) == 1 else 'non_manifold'
        else:
            (f0,a0,b0),(f1,a1,b1) = uses
            if normals[f0] is None or normals[f1] is None or length <= 1e-14:
                record['band'] = 'degenerate'
            elif (a0,b0) != (b1,a1):
                record['band'] = 'inconsistent_winding'
            else:
                angle = math.degrees(math.acos(float(np.clip(np.dot(normals[f0],normals[f1]),-1,1))))
                signed = float(np.dot(normals[f0], centres[f1]-centres[f0]))
                record.update(angleDeg=angle, signedOtherFaceOffsetM=signed)
                if angle < 40-1e-10:
                    record['band'] = 'below_40'
                elif abs(signed) <= 1e-12:
                    record['band'] = 'ambiguous_orientation'
                elif signed > 0:
                    record['band'] = 'concave_at_least_40'
                else:
                    record['band'] = 'convex_at_least_80' if angle >= 80-1e-10 else 'convex_40_to_80'
                c0,c1 = face_classes[f0], face_classes[f1]
                if isinstance(c0,str) and c0.startswith('bevel:') and c0 == c1:
                    seams[c0] = seams.get(c0,0.)+length
        records.append(record)
    totals = {}
    for record in records:
        total = totals.setdefault(record['band'], {'edgeCount':0,'lengthM':0.})
        total['edgeCount'] += 1
        total['lengthM'] += record['lengthM']
    return {'edges':records, 'bands':totals, 'bevelMiddleSeamLengthByClassM':seams,
            'degenerateFaceCount':sum(n is None for n in normals),
            'limitations':['Convexity follows supplied winding; not watertight-solid certification.',
                          'Middle seam sums shared same-class bevel edges, not original treated-edge length.',
                          'No edge-set status, exemption or cap/lengthwise intent inferred.']}


STUDIO = Path(__file__).resolve().parents[3]
STATIC_INPUTS = {
    'parent':('asset-pipeline/full-kit/exports/studio-full-kit-m3-proposal-v03.glb',
              'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf'),
    'mapping':('scene-coordination/m4-model-contract.json',
               '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98'),
    'approvedGeometryUtilities':('scene-coordination/m4-v03-verifier-v3r1.py',
                                '3f32c40e4eca885219b0cb34e8737a318f8fff803b4dfa1950b3857cd956307d'),
}


def captured_static_inputs():
    result = {}
    for key,(relative,pin) in STATIC_INPUTS.items():
        raw = (STUDIO/relative).read_bytes()
        require(hashlib.sha256(raw).hexdigest() == pin, 'static input changed: '+relative)
        result[key] = raw
    return result


def geometry_utilities(raw):
    """Reuse approved pure polygon utilities, never audit_m4_v3 or auto-freeze."""
    require(hashlib.sha256(raw).hexdigest() == STATIC_INPUTS['approvedGeometryUtilities'][1],
            'approved polygon utility source differs')
    module = types.ModuleType('approved_v3r1_polygon_utilities')
    exec(compile(raw, STATIC_INPUTS['approvedGeometryUtilities'][0], 'exec'),module.__dict__)
    return module


def retained_entries(raw, mapping):
    """Decode pinned parent leaves and actual extras/materials, without textures.

    Strictly bounded to the accepted parent subset (one indexed primitive per
    leaf, contiguous accessors, TRS/matrix nodes); unsupported features reject.
    Loader default visibility and layers are explicit planning assumptions.
    """
    require(len(raw)>=28 and struct.unpack_from('<III',raw)==(0x46546c67,2,len(raw)), 'invalid GLB header')
    json_size,json_kind = struct.unpack_from('<II',raw,12)
    require(json_kind==0x4e4f534a, 'missing GLB JSON')
    doc = json.loads(raw[20:20+json_size])
    binary_size,binary_kind = struct.unpack_from('<II',raw,20+json_size)
    base = 28+json_size
    require(binary_kind==0x004e4942 and base+binary_size==len(raw), 'unexpected GLB chunks')
    require(len(doc['scenes'])==1 and len(doc['buffers'])==1, 'single retained scene/buffer required')
    def accessor(index):
        a = doc['accessors'][index]; view = doc['bufferViews'][a['bufferView']]
        require('sparse' not in a and not a.get('normalized',False) and view.get('buffer',0)==0,
                'unsupported retained accessor')
        dtype = np.dtype({5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}[a['componentType']])
        size = {'SCALAR':1,'VEC3':3}[a['type']]
        require(view.get('byteStride',size*dtype.itemsize)==size*dtype.itemsize, 'strided retained accessor')
        offset = view.get('byteOffset',0)+a.get('byteOffset',0)
        end = offset+a['count']*size*dtype.itemsize
        require(end<=binary_size and end<=view.get('byteOffset',0)+view['byteLength'], 'accessor outside buffer')
        return np.frombuffer(raw,dtype=dtype,count=a['count']*size,offset=base+offset).reshape(-1,size)
    def local(node):
        if 'matrix' in node:
            return np.asarray(node['matrix'],float).reshape(4,4).T
        x,y,z,w = node.get('rotation',[0,0,0,1])
        rotation = np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],
                             [2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],
                             [2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
        transform = np.eye(4);transform[:3,:3]=rotation@np.diag(node.get('scale',[1,1,1]))
        transform[:3,3]=node.get('translation',[0,0,0])
        return transform
    retired = {r['name'] for r in mapping['retiredParentLeaves']}
    out,seen,found = [],set(),set()
    def walk(index,parent):
        require(index not in seen,'cyclic/shared retained node');seen.add(index)
        node = doc['nodes'][index]; transform = parent@local(node)
        if 'mesh' in node:
            name=node['name'];found.add(name)
            if name not in retired:
                primitives=doc['meshes'][node['mesh']]['primitives']
                require(len(primitives)==1,'multiple retained primitives')
                primitive=primitives[0]
                require(primitive.get('mode',4)==4, 'non-triangle retained mesh')
                positions=accessor(primitive['attributes']['POSITION']).astype(float)
                indices=accessor(primitive['indices']).ravel().astype(int)
                require(len(indices)%3==0 and indices.min()>=0 and indices.max()<len(positions), 'invalid retained indices')
                world=positions@transform[:3,:3].T+transform[:3,3]
                blender=world[:,[0,2,1]]*np.array([1.,-1.,1.])
                material=doc['materials'][primitive['material']]; extras=node.get('extras',{})
                alpha=material.get('alphaMode','OPAQUE')
                require(alpha in ('OPAQUE','BLEND') and type(extras.get('transparent')) is bool, 'unknown retained opacity metadata')
                transparent=alpha=='BLEND'
                require(transparent==extras['transparent'], 'loader metadata/material parity failure')
                # OPAQUE ignores baseColor alpha in the glTF loader.
                opacity=material.get('pbrMetallicRoughness',{}).get('baseColorFactor',[1,1,1,1])[3] if transparent else 1.
                if name in PROJECT_TARGETS|PROJECT_BORDERS|{'display_studio'}:
                    transparent,opacity=False,1.  # Actual binder replacement material.
                out.append({'name':name,'label':name,'triangles':blender[indices.reshape(-1,3)],
                            'asset':extras.get('assetId'),'rawExtras':extras,
                            'metadata':{'transparent':extras['transparent'],'materialTransparent':transparent,
                                        'opacity':opacity,'materialVisible':True,'visible':True,
                                        'doubleSided':material.get('doubleSided',False)}})
        for child in node.get('children',[]): walk(child,transform)
    for index in doc['scenes'][0]['nodes']:walk(index,np.eye(4))
    require(retired<=found and len(retired)==23,'retired parent leaf mismatch')
    require(len({e['name'] for e in out})==len(out),'duplicate retained leaf name')
    return out


def candidate_entries(parts,mapping):
    records={r['leaf']:r for r in mapping['addedRows']}
    require(set(parts)==set(records), 'candidate mapping row mismatch')
    out=[]
    for name,part in parts.items():
        record=records[name]
        require(record['assetId']==part.asset and record['material']==part.mat and record['castShadow']==part.casts,
                'candidate row metadata differs: '+name)
        require(record['alphaMode']=='OPAQUE','unexpected candidate material opacity')
        out.append({'name':name,'label':name,'asset':part.asset,'triangles':part.triangles(),
                    'metadata':{'transparent':False,'materialTransparent':False,'opacity':1.,
                                'materialVisible':True,'visible':True,'doubleSided':record['doubleSided']}})
    return out


def group_vertices(parts,author,row,group):
    spec = next(r for r in author['rows'] if r['id']==row)
    record = next(g for g in spec['groups'] if g['id']==group)
    part=parts[row];index=part.ids.index(group)
    label,v0,v1,f0,f1=part.groups[index]
    require(record['label']==label and record['vertexRange']==[v0,v1] and record['faceRange']==[f0,f1],
            'declared group locator differs: '+row+'/'+group)
    return np.asarray(part.v,float)[v0:v1],record


def support_diagnostics(parts,author,utilities):
    """Signed declared-support geometry only; no candidate audit/freeze result."""
    surfaces={}
    for surface in author['surfaces']:
        require(surface['kind']=='rug_field','coarse scope expects declared rug field')
        part=parts[surface['boundaryRow']]
        face=part.f[surface['boundaryFace']][0];boundary=np.asarray(part.v,float)[list(face)]
        require(float(np.ptp(boundary[:,2]))<1e-10,'nonhorizontal receiving surface')
        polygon=utilities.convex_boundary(boundary[:,:2],surface['id'])
        surfaces[surface['id']]=(polygon,float(boundary[0,2]))
    results=[]
    for support in author['supports']:
        vertices,_=group_vertices(parts,author,support['row'],support['group'])
        boundary,height=surfaces[support['surface']]
        clearance=utilities.footprint_clearance(vertices[:,:2],boundary,'inside')
        error=float(vertices[:,2].min()-height-.0003)
        results.append({'id':support['id'],'surface':support['surface'],
                        'signedGapErrorM':error,**clearance,
                        'withinGeometricLimits':abs(error)<=1e-6 and clearance['signedClearanceM']>=.020-1e-10})
    return {'method':'all vertices of every authored support; actual rounded receiving polygon; approved pure polygon utilities',
            'supports':results,'minSignedClearanceM':min(r['signedClearanceM'] for r in results),
            'maxAbsoluteGapErrorM':max(abs(r['signedGapErrorM']) for r in results),
            'allWithinGeometricLimits':all(r['withinGeometricLimits'] for r in results),
            'candidateAudit':False,'authorIntentAcceptance':False}


def target_grid(entry,count=9):
    """Validate the retained two-triangle rectangle before interior sampling."""
    t=np.asarray(entry['triangles']);p=np.unique(t.reshape(-1,3),axis=0)
    require(t.shape==(2,3,3) and p.shape==(4,3),'target must be a two-triangle quadrilateral')
    a,b,c=t[0];u=b-a;v=c-b;fourth=a+v
    require(abs(float(np.dot(u,v)))<1e-8 and np.linalg.norm(u)>0 and np.linalg.norm(v)>0,
            'target triangle does not follow a rectangle')
    require(min(np.linalg.norm(p-fourth,axis=1))<1e-7,'missing target fourth corner')
    area=np.linalg.norm(np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]),axis=1).sum()/2
    require(abs(area-np.linalg.norm(u)*np.linalg.norm(v))<1e-8,'target coverage differs from rectangle')
    require(float(np.dot(np.cross(b-a,c-a),EYE-a))>0,'project target back-facing')
    g=np.linspace(.03,.97,count)
    return np.asarray([a+x*u+y*v for x in g for y in g])


def project_points(points,yaw,pitch,fov,width,height):
    y,p=math.radians(yaw),math.radians(pitch)
    forward=np.array([math.sin(y)*math.cos(p),math.cos(y)*math.cos(p),math.sin(p)])
    right=np.cross(forward,[0,0,1]);right/=np.linalg.norm(right);up=np.cross(right,forward)
    delta=np.asarray(points)-EYE;depth=delta@forward
    require(np.all(depth>0),'projection behind fixed eye')
    scale=(height/2)/math.tan(math.radians(fov)/2)
    return np.column_stack((width/2+scale*(delta@right)/depth,height/2-scale*(delta@up)/depth))


def coarse_views(helper,parts,author,pose,retained,mapping,area_count=384):
    entries=retained+candidate_entries(parts,mapping)
    scene=RayScene(entries)
    feature_specs={
        'kickPedal':('drum_kick__tower',lambda v:(v[:,2]<.2)&(v[:,1]<.4),'z < 0.2m and y < 0.4m'),
        'kickTowerUpper':('drum_kick__tower',lambda v:v[:,2]>.2,'z > 0.2m'),
        'hihatPedal':('drum_hihat_pedal__pedal',lambda v:np.ones(len(v),bool),'all row vertices'),
        'sustainPedal':('ctl_sustain_pedal__pedal',lambda v:v[:,2]<.04,'z < 0.04m'),
        'throneSeat':('drum_throne__throne',lambda v:v[:,2]>.4,'z > 0.4m'),
        'stoolSeat':('stool_keys__stool',lambda v:v[:,2]>.43,'z > 0.43m'),
        'moduleDisplay':('drum_module__display',lambda v:np.ones(len(v),bool),'all row vertices'),
    }
    features={}
    for label,(row,select,description) in feature_specs.items():
        vertices=np.asarray(parts[row].v,float);filtered=vertices[select(vertices)]
        samples,indices=bounded_vertices(filtered,150)
        features[label]=ray_summary(scene.cast(samples,{row}),
            {'method':'source vertex subsample','selector':description,'row':row,
             'eligibleVertexCount':len(filtered),'sampleIndices':indices,'cap':150})
    throne=parts['drum_throne__throne'];_,seat=group_vertices(parts,author,throne.row,'throne.seat')
    f0,f1=seat['faceRange'];roof=[];roof_faces=[]
    for fi in range(f0,f1):
        face=throne.f[fi][0];points=np.asarray(throne.v,float)[list(face)]
        if float(points[:,2].min())>=helper.THRONE['seat']-.020-1e-10:
            roof.extend([points[[0,i,i+1]] for i in range(1,len(points)-1)])
            roof_faces.append(fi)
    points,method=area_samples(np.asarray(roof),area_count)
    method.update(row=throne.row,group='throne.seat',faceIndices=roof_faces,
                  selector='upper roof faces wholly at or above seat height minus 0.020m; includes shoulder and shallow dome')
    area=ray_summary(scene.cast(points,{throne.row}),method)
    targets={entry['name']:ray_summary(scene.cast(target_grid(entry),{entry['name']}),
                {'method':'9 by 9 interior grid of validated rectangle','count':81})
             for entry in retained if entry['name'] in PROJECT_TARGETS}
    require(set(targets)==PROJECT_TARGETS,'missing retained project target')
    controller=np.concatenate([np.asarray(parts[r].v,float) for r in ('ctl_body__shell','ctl_keys__keys')])
    sample,indices=bounded_vertices(controller,360)
    hits=scene.cast(sample,{'ctl_body__shell','ctl_keys__keys'})
    actual=sample[[r['category']=='target_hit' for r in hits]]
    def span(points):
        if len(points)<2:return None
        angles=np.degrees(np.arctan2(points[:,0]-EYE[0],points[:,1]-EYE[1]))
        return float(np.ptp(angles))
    envelope=span(actual)
    azimuth=ray_summary(hits,{'method':'source vertex subsample','sampleIndices':indices,'cap':360})
    azimuth.update(actualHitEnvelopeDeg=envelope,allVertexEnvelopeDeg=span(controller),
                   envelopeMeets30Deg=envelope is not None and envelope>=30.,
                   continuousVisibleSpanVerified=False,
                   limitation='Angular envelope of actual own-row hits only; no-hit excluded; not contiguous visibility or capture acceptance.')
    # build_all restores helper MC; derive this diagnostic frame from the explicit pose.
    matrix=helper.T(pose['cx'],pose['cy'],helper.CTL['zb'])@helper.Rz(pose['yaw'])
    key=helper.KEY
    tops=np.asarray([helper.apply(matrix,(key['x0']+(k+.5)*key['pitch'],key['yf']+.03,key['top']+.0005)) for k in range(29)])
    key_hits=ray_summary(scene.cast(tops,{'ctl_keys__keys'}),{'method':'29 fixed white-key top centres'})
    pitches={}
    for name,settings in {'music-1440':(44,-8,58,1440,900),'right-down':(58,-16,58,1440,900),
                          'music-320-f74':(44,-8,74,320,844)}.items():
        projected=project_points(tops,*settings);distances=np.linalg.norm(np.diff(projected,axis=0),axis=1)
        width,height=settings[-2:]
        pitches[name]={'minimumPx':float(distances.min()),'maximumPx':float(distances.max()),
                       'keysInFrame':int(((projected[:,0]>=0)&(projected[:,0]<=width)&(projected[:,1]>=0)&(projected[:,1]<=height)).sum()),
                       'cameraYawPitchFovWidthHeight':list(settings),'interpretation':'pinhole planning estimate only'}
    local=(np.c_[parts['ctl_body__shell'].v,np.ones(len(parts['ctl_body__shell'].v))]@np.linalg.inv(matrix).T)[:,:3]
    size=np.ptp(local,axis=0);target=np.array([.99,.32,.095])
    stand=np.asarray(parts['ctl_stand__frame'].v);stand_height=float(np.ptp(stand[:,2]))
    return {'featureVertexDiagnostics':features,'throneTopUniformSurfaceArea':area,'targetRays':targets,
            'controllerAzimuth':azimuth,'whiteKeys':key_hits,'keyPitchEstimates':pitches,
            'sizeConstraints':{'controllerEnvelopeWDHM':size.tolist(),'targetWDHM':target.tolist(),
                               'deviationPercent':((size-target)/target*100).tolist(),
                               'within3Percent':bool(np.all(np.abs(size-target)/target<=.03)),
                               'standOwnHeightM':stand_height,'standTargetM':.68,
                               'standWithin3Percent':abs(stand_height-.68)/.68<=.03},
            'sceneTriangles':len(scene.owners),'sceneEntries':len(entries)}


def windows_resources():
    import ctypes
    from ctypes import wintypes
    class MemoryStatus(ctypes.Structure):
        _fields_=[('length',wintypes.DWORD),('load',wintypes.DWORD)]+[(n,ctypes.c_ulonglong) for n in
                  ('totalPhysical','availablePhysical','totalPage','availablePage','totalVirtual','availableVirtual','extended')]
    status=MemoryStatus();status.length=ctypes.sizeof(status)
    require(ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status)), 'resource query failed')
    class Counters(ctypes.Structure):
        _fields_=[('size',wintypes.DWORD),('faults',wintypes.DWORD)]+[(n,ctypes.c_size_t) for n in
                  ('peakWorkingSet','workingSet','peakPaged','paged','peakNonpaged','nonpaged','pageUse','peakPageUse')]
    counters=Counters();counters.size=ctypes.sizeof(counters)
    process=ctypes.windll.kernel32.GetCurrentProcess;process.restype=wintypes.HANDLE
    query=ctypes.windll.psapi.GetProcessMemoryInfo
    query.argtypes=[wintypes.HANDLE,ctypes.c_void_p,wintypes.DWORD]
    require(query(process(),ctypes.byref(counters),counters.size),'process memory query failed')
    return {'totalPhysicalBytes':status.totalPhysical,'availablePhysicalBytes':status.availablePhysical,
            'workingSetBytes':counters.workingSet,'peakWorkingSetBytes':counters.peakWorkingSet,
            'timestampUtc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}


def coarse_main(args):
    import produce_fullkit_m4_v04 as producer
    output=STUDIO/'asset-pipeline/full-kit/manifests/m4-v04-pose-comparison.json'
    require(not output.exists(),'comparison receipt exists; no repeated coarse comparison')
    helper_path=Path(__file__).with_name('build_fullkit_m4_geometry_v04.py')
    author_path=STUDIO/'asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json'
    helper,author,inputs=producer.ready_author(helper_path,args.helper_sha,author_path,args.author_sha)
    for key,path,pin in (
        ('heldBuilder',helper_path.with_name('build_fullkit_m4_v04.py'),args.builder_sha),
        ('authorReport',STUDIO/'scene-m4-v04-preparation-report.md',args.author_report_sha)):
        raw=path.read_bytes();producer.check_source_pin(raw,pin);inputs[key]=raw
    static=captured_static_inputs();inputs.update(static)
    mapping=json.loads(static['mapping']);retained=retained_entries(static['parent'],mapping)
    utilities=geometry_utilities(static['approvedGeometryUtilities'])
    for entry in retained:
        if entry['name'] in PROJECT_TARGETS:target_grid(entry)
    inputs['measurement']=Path(__file__).read_bytes()
    inputs['producer']=Path(producer.__file__).read_bytes()
    inputs['writerTests']=(STUDIO/'scene-coordination/m4-v04-producer-tests.py').read_bytes()
    for name in ('bind-full-kit.ts','load-full-kit.ts','picking.ts'):
        inputs['runtime/'+name]=(STUDIO.parents[1]/'components/studio/scene'/name).read_bytes()
    resources=windows_resources()
    # Scene and rays are O(triangles), with one ray and pose in flight. No N-by-N buffers.
    reserve=512*1024**2;estimated_peak=256*1024**2
    require(resources['availablePhysicalBytes']>=reserve+estimated_peak,
            'insufficient free RAM for 256 MiB estimated peak plus 512 MiB headroom')
    receipt={'schema':'m4-v04-coarse-comparison/1','status':'running provisional writer diagnostics',
             'candidateAcceptance':False,'independentExpectedDigestFreeze':False,'candidateAudit':False,
             'coarseComparisonRuns':1,'fullSelectedPoseRuns':0,'artSelection':None,
             'sourceSha256':{k:producer.sha_bytes(v) for k,v in inputs.items()},
             'invocation':{'entrypoint':'measure_fullkit_m4_v04.coarse_main','mode':'coarse',
                           'helperSha256':args.helper_sha,'authorSha256':args.author_sha,
                           'builderSha256':args.builder_sha,'authorReportSha256':args.author_report_sha,
                           'poseOptionIds':author['poseOptionIds'],'poseOptions':author['poseOptions'],
                           'areaSamplesPerPose':384,'featureVertexCap':150,'controllerVertexCap':360},
             'fixedEyeBlenderM':EYE.tolist(),'runtimeEye':[ -.7,2.8,3.4],
             'runtimeTransform':'scale 2, Blender Z-up to runtime Y-up, runtime Y offset 0.11',
             'resourceGate':{'before':resources,'estimatedProcessPeakBytes':estimated_peak,'reservedHeadroomBytes':reserve,
                             'method':'one pose and ray at a time; retained triangles reused; no all-pose geometry retained'},
             'runtimeEligibility':{'rule':'exclude project targets/borders as blockers; userData.transparent exactly false; material opaque and visible; live ancestors/layers assumed visible/matching',
                                   'transparentLeavesExcluded':[e['name'] for e in retained if e['metadata']['transparent']],
                                   'metadata':[{'name':e['name'],'metadata':e['metadata'],'rawExtras':e['rawExtras'],
                                                'eligibility':runtime_eligibility(e['name'],e['metadata'])} for e in retained],
                                   'limitations':['CPU endpoint rays; no browser or camera clipping/touch-expansion certification.',
                                                  'Opaque target backs reported separately; front-facing rectangle prerequisite checked.',
                                                  'Live scene visibility/layers cannot be observed offline; defaults assumed.']},
             'results':[], 'limitations':['Area samples are uniform source surface area, not pixels or a projected-area disk.',
                                         'Vertex samples and actual-hit angular envelopes are diagnostics, not contiguous visibility.',
                                         'No-hit is reported separately, never added to target hits.',
                                         'Pending edge/embedding root decisions remain pending; no new exception granted.']}
    started=time.monotonic()
    # Exclusive creation records that the sole comparison has started, including failures.
    with output.open('x',encoding='utf-8',newline='\n') as file:
        json.dump(receipt,file,indent=2,allow_nan=False);file.write('\n')
    try:
        for pose_id,pose in zip(author['poseOptionIds'],author['poseOptions']):
            tick=time.monotonic()
            parts,meta=helper.build_all(pose)
            require(meta['pose']==pose,'helper returned wrong explicit pose')
            # Same raw author groups and classes at every pose; no changed scope hidden by measurements.
            for spec in author['rows']:
                part=parts[spec['id']]
                require(len(part.v)==spec['vertexCount'] and len(part.f)==spec['faceCount'], 'pose changed declared topology')
                require(part.ids==[g['id'] for g in spec['groups']], 'pose changed group identity')
                require([c if c is not None else 'out_of_scope' for c in part.cls]==spec['faceClasses'], 'pose changed face classes')
            views=coarse_views(helper,parts,author,pose,retained,mapping)
            supports=support_diagnostics(parts,author,utilities)
            ledger,totals=helper.ledger(parts)
            record={'id':pose_id,'pose':pose,'views':views,'supportDiagnostics':supports,
                    'rowLedger':ledger,'sourceLedgerTotals':totals,'keyCounts':{'white':meta['whiteKeys'],'black':meta['blackKeys']},
                    'elapsedSeconds':time.monotonic()-tick,'resourcesAfter':windows_resources()}
            receipt['results'].append(record)
            # Preserve completed pose evidence if a later pose fails; never silently rerun.
            with output.open('w',encoding='utf-8',newline='\n') as file:
                json.dump(receipt,file,indent=2,allow_nan=False);file.write('\n')
            print(json.dumps({'poseId':pose_id,'seconds':round(record['elapsedSeconds'],2),
                              'areaTargetHits':views['throneTopUniformSurfaceArea']['targetHits'],
                              'azimuthEnvelopeDeg':views['controllerAzimuth']['actualHitEnvelopeDeg'],
                              'workingSetMiB':record['resourcesAfter']['workingSetBytes']/1024**2}),flush=True)
            require(record['resourcesAfter']['availablePhysicalBytes']>=256*1024**2,'free RAM fell below 256 MiB reserve; comparison stopped')
            del parts
        producer.check_source_pin(helper_path.read_bytes(),args.helper_sha)
        producer.check_source_pin(author_path.read_bytes(),args.author_sha)
        for key,(relative,pin) in STATIC_INPUTS.items():
            producer.check_source_pin((STUDIO/relative).read_bytes(),pin)
        receipt['status']='complete provisional writer comparison; author selection and fresh pins required'
    except Exception as error:
        receipt['status']='incomplete comparison; bounded recovery requires coordinator disposition'
        receipt['failure']={'type':type(error).__name__,'message':str(error)}
        raise
    finally:
        receipt['elapsedSeconds']=time.monotonic()-started
        receipt['resourceGate']['after']=windows_resources()
        with output.open('w',encoding='utf-8',newline='\n') as file:
            json.dump(receipt,file,indent=2,allow_nan=False);file.write('\n')
        print('comparisonSha256='+hashlib.sha256(output.read_bytes()).hexdigest(),flush=True)


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description='Exactly one author-table coarse comparison; no selected-pose audit.')
    parser.add_argument('--coarse',action='store_true',required=True)
    for flag in ('helper-sha','author-sha','builder-sha','author-report-sha'):
        parser.add_argument('--'+flag,required=True)
    coarse_main(parser.parse_args())
