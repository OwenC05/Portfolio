"""Bounded v04 CPU diagnostic primitives; no candidate work on import.

Author-ready pins, the explicit coarse table and subsequent author selection
gate orchestration. No pose search, candidate audit, ranking or art selection
is implemented here. Ray figures are sampled source diagnostics, not pixels.
"""
import math
import fnmatch
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


def convex_solid_planes(vertices, faces, tolerance=1e-9):
    """Closed convex receiving solid from actual faces; no AABB substitution.

    Planes are oriented away from the centroid solely for inside tests. This
    does not replace validation of source shading normals or authorize joins.
    """
    v=np.asarray(vertices,float)
    triangles(v,faces)
    require(len(v)>=4 and len(faces)>=4,'solid receiver needs volume')
    centre=v.mean(axis=0);planes=[];edges={}
    for fi,face in enumerate(faces):
        require(len(set(face))==len(face),'receiver repeats polygon vertex')
        points=v[list(face)];origin=points.mean(axis=0)
        n=np.cross(points-origin,np.roll(points,-1,axis=0)-origin).sum(axis=0)
        size=float(np.linalg.norm(n));require(size>1e-14,'degenerate receiver face')
        n/=size
        require(float(np.max(np.abs((points-origin)@n)))<=tolerance,'nonplanar receiver face')
        if float((centre-origin)@n)>0:n=-n
        require(float((centre-origin)@n)<-tolerance,'receiver has no strict interior')
        require(float(np.max((v-origin)@n))<=tolerance,'receiver is not convex')
        # Convex polygon ordering, including no backtracking, in its own plane.
        e=np.roll(points,-1,axis=0)-points
        require(np.all(np.linalg.norm(e,axis=1)>tolerance),'zero receiver edge')
        turns=np.einsum('ij,j->i',np.cross(e,np.roll(e,-1,axis=0)),n)
        require(np.all(turns>=-tolerance) or np.all(turns<=tolerance),'nonconvex receiver face')
        for i,(a,b) in enumerate(zip(face,face[1:]+face[:1])):
            sides=np.einsum('ij,j->i',np.cross(e[i],points-points[i]),n)
            require(np.all(sides>=-tolerance) or np.all(sides<=tolerance),
                    'receiver face is crossed or nonconvex')
            require(not (abs(turns[i-1])<=tolerance and float(np.dot(e[i-1],e[i]))<0),
                    'receiver face backtracks')
            edges.setdefault(tuple(sorted((a,b))),[]).append((a,b))
        planes.append({'face':fi,'point':origin,'normal':n})
    require(all(len(uses)==2 and uses[0]==uses[1][::-1] for uses in edges.values()),
            'receiver is not a closed consistently wound solid')
    require(set(i for face in faces for i in face)==set(range(len(v))),'unused receiver vertices')
    return planes


def solid_signed_distances(vertices, planes):
    v=np.asarray(vertices,float)
    require(v.ndim==2 and v.shape[1]==3 and len(v)>0 and np.isfinite(v).all(),'finite solid-test vertices required')
    return np.column_stack([(v-plane['point'])@plane['normal'] for plane in planes])


def source_edges(vertices, faces):
    triangles(vertices,faces)
    return sorted({tuple(sorted((a,b))) for f in faces for a,b in zip(f,f[1:]+f[:1])})


def solid_edge_crossings(vertices, edges, planes, tolerance=1e-9):
    """Intersect complete supplied segments against all finite receiver faces.

    Includes vertex touches. Coplanar boundary segments are reported separately
    and cannot silently pass an allowed-face-only criterion.
    """
    v=np.asarray(vertices,float);signed=solid_signed_distances(v,planes)
    crossings=[];coplanar=[]
    for a,b in edges:
        require(type(a) is int and type(b) is int and 0<=a<len(v) and 0<=b<len(v) and a!=b,'invalid attachment edge')
        da,db=signed[a],signed[b]
        # Clip the entire segment to the receiver half-spaces.
        lo,hi=0.,1.;possible=True
        for start,end in zip(da,db):
            delta=end-start
            if abs(delta)<1e-15:
                if start>tolerance:possible=False;break
            elif delta>0:hi=min(hi,float(-start/delta))
            else:lo=max(lo,float(-start/delta))
        if not possible or lo>hi+tolerance or hi < -tolerance or lo > 1+tolerance:continue
        lo,hi=max(0.,lo),min(1.,hi)
        for fi,(start,end) in enumerate(zip(da,db)):
            if abs(start)<=tolerance and abs(end)<=tolerance:
                coplanar.append({'edge':[a,b],'face':fi,'clippedInterval':[lo,hi]})
            elif abs(end-start)>1e-15:
                t=float(-start/(end-start))
                if lo-tolerance<=t<=hi+tolerance and -tolerance<=t<=1+tolerance:
                    point=v[a]+t*(v[b]-v[a])
                    if np.max(solid_signed_distances([point],planes))<=tolerance:
                        crossings.append({'edge':[a,b],'face':fi,'fraction':t,'point':point.tolist()})
    return {'crossings':crossings,'coplanarBoundarySegments':coplanar,
            'scope':'segments against closed convex receiver, including touches; not a general triangle/solid collision audit'}


def spur_root_criterion(arm_vertices, arm_faces, receiver_vertices, receiver_faces,
                        root_ring_indices, lengthwise_edges, side_face_index,
                        centre_inset_m=.006, minimum_ring_burial_m=.001):
    """Root-authorized two spur pairs only; caller binds exact semantic pair.

    Ring and longitudinal locators are author-owned. Their completeness is
    checked against the simple capped eight-sided arm topology before use.
    """
    v=np.asarray(arm_vertices,float);edges=source_edges(v,arm_faces)
    require(len(root_ring_indices)==8 and len(set(root_ring_indices))==8,
            'spur criterion needs exactly eight root-ring vertices')
    require(all(type(i) is int and 0<=i<len(v) for i in root_ring_indices),'invalid root-ring index')
    ring=set(root_ring_indices)
    require(any(set(f)==ring for f in arm_faces),'root-ring locator is not a complete source cap')
    actual_long=[e for e in edges if (e[0] in ring)!=(e[1] in ring)]
    declared_long=sorted(tuple(sorted(e)) for e in lengthwise_edges)
    require(actual_long==declared_long and len(actual_long)==8,'lengthwise edge coverage differs from complete arm topology')
    require(len(v)==16 and set(i for e in actual_long for i in e)==set(range(16)),
            'criterion expects one eight-sided capped arm, no hidden vertices')
    planes=convex_solid_planes(receiver_vertices,receiver_faces)
    require(type(side_face_index) is int and 0<=side_face_index<len(planes),'explicit side face required')
    distances=solid_signed_distances(v[root_ring_indices],planes)
    burial=-distances[:,side_face_index]
    centre_inset=float(burial.mean())
    crossings=solid_edge_crossings(v,actual_long,planes)
    wrong=[c for c in crossings['crossings'] if c['face']!=side_face_index]
    counts=Counter(tuple(c['edge']) for c in crossings['crossings'])
    crossing_coverage=all(counts[e]==1 for e in actual_long)
    # Positive margin to every other plane excludes bevel/top/back boundaries.
    margins=[float(np.min(-np.delete(solid_signed_distances([c['point']],planes)[0],side_face_index)))
             for c in crossings['crossings'] if c['face']==side_face_index]
    valid=bool(np.max(distances)<=1e-9 and burial.min()>=minimum_ring_burial_m-1e-6
               and abs(centre_inset-centre_inset_m)<=1e-6 and not wrong and crossing_coverage
               and not crossings['coplanarBoundarySegments'] and margins and min(margins)>1e-9)
    return {'withinDeclaredGeometricCriterion':valid,'rootRingVertices':len(ring),
            'rootRingInsideSolid':bool(np.max(distances)<=1e-9),
            'minimumSideBurialM':float(burial.min()),'maximumSideBurialM':float(burial.max()),
            'rootCentreInsetM':centre_inset,'declaredCentreInsetM':centre_inset_m,
            'declaredMinimumRingBurialM':minimum_ring_burial_m,
            'crossings':crossings,'eachLengthwiseEdgeCrossesSideOnce':crossing_coverage,
            'unexpectedFaceCrossings':wrong,'minimumCrossingOtherPlaneClearanceM':min(margins) if margins else None,
            'scope':'exact declared spur arm/base pair; support foot and tip require separate checks; no export/image approval'}


def heel_seating_criterion(board_vertices, board_faces, receiver_vertices, receiver_faces,
                           top_face_index, underside_face_index, proud_vertex_indices,
                           board_thickness_face_indices,
                           board_thickness_m=.008, maximum_depth_m=.004, minimum_proud_m=.0038):
    """Complete footboard vertex/edge coverage for the one released heel seat.

    proud_vertex_indices explicitly names the authored upper heel-end corners,
    not whichever vertices happen to pass. All source edges and below-plane
    vertices are checked independently of this authored exposed-end locator.
    """
    v=np.asarray(board_vertices,float);edges=source_edges(v,board_faces)
    planes=convex_solid_planes(receiver_vertices,receiver_faces)
    board_planes=convex_solid_planes(board_vertices,board_faces)
    require(len(board_thickness_face_indices)==2 and len(set(board_thickness_face_indices))==2
            and all(type(i) is int and 0<=i<len(board_planes) for i in board_thickness_face_indices),
            'explicit board thickness face pair required')
    lower,upper=[board_planes[i] for i in board_thickness_face_indices]
    require(float(np.dot(lower['normal'],upper['normal']))<=-1+1e-10,'board thickness faces must be parallel and opposite')
    measured_thickness=abs(float((upper['point']-lower['point'])@lower['normal']))
    require(type(top_face_index) is int and type(underside_face_index) is int and
            0<=top_face_index<len(planes) and 0<=underside_face_index<len(planes)
            and top_face_index!=underside_face_index,'top and underside faces required')
    require(np.allclose(planes[top_face_index]['normal'],[0,0,1],rtol=0,atol=1e-9) and
            np.allclose(planes[underside_face_index]['normal'],[0,0,-1],rtol=0,atol=1e-9),
            'kick heel criterion requires horizontal top and underside')
    require(len(proud_vertex_indices)>=2 and len(set(proud_vertex_indices))==len(proud_vertex_indices)
            and all(type(i) is int and 0<=i<len(v) for i in proud_vertex_indices),'explicit upper heel-end corners required')
    signed=solid_signed_distances(v,planes);top=signed[:,top_face_index]
    below=np.flatnonzero(top < -1e-9);depth=float(max(0.,-top.min()))
    below_inside=bool(len(below)>0 and np.max(signed[below])<=1e-9)
    underside_ok=bool(np.max(signed[:,underside_face_index])<=1e-9)
    proud=float(top[proud_vertex_indices].min())
    crossings=solid_edge_crossings(v,edges,planes)
    wrong=[c for c in crossings['crossings'] if c['face']!=top_face_index]
    valid=bool(below_inside and underside_ok and depth<=maximum_depth_m+1e-6
               and abs(measured_thickness-board_thickness_m)<=1e-6
               and depth<=measured_thickness/2+1e-6 and proud>=minimum_proud_m-1e-6
               and crossings['crossings'] and not wrong and not crossings['coplanarBoundarySegments'])
    return {'withinDeclaredGeometricCriterion':valid,'allSourceEdgesChecked':len(edges),
            'belowTopVertexIndices':below.tolist(),'allBelowTopVerticesInsideReceiver':below_inside,
            'maximumDepthM':depth,'declaredMaximumDepthM':maximum_depth_m,'declaredBoardThicknessM':board_thickness_m,
            'measuredBoardThicknessM':measured_thickness,
            'minimumDeclaredUpperHeelCornerProudM':proud,'noVertexBelowReceiverUnderside':underside_ok,
            'crossings':crossings,'unexpectedFaceCrossings':wrong,
            'scope':'exact kick footboard/heel pair, all source edges and below-top vertices; not floor support or a cylindrical hinge rule'}


def declared_primitive(parts,author,row,group):
    """Translate author row-global locators to a complete primitive, never crop."""
    vertices,spec=group_vertices(parts,author,row,group)
    v0,v1=spec['vertexRange'];f0,f1=spec['faceRange']
    faces=[[i-v0 for i in face] for face,_ in parts[row].f[f0:f1]]
    require(all(0<=i<len(vertices) for face in faces for i in face),'primitive face crosses authored range')
    return {'vertices':vertices,'faces':faces,'vertexRange':[v0,v1],'faceRange':[f0,f1],
            'row':row,'group':group}


def local_vertices(primitive,indices):
    require(type(indices) is list and len(indices)>0 and len(set(indices))==len(indices),
            'explicit unique vertex index list required')
    low,high=primitive['vertexRange']
    require(all(type(i) is int and low<=i<high for i in indices),'vertex locator outside declared primitive')
    return [i-low for i in indices]


def local_face(primitive,index):
    low,high=primitive['faceRange']
    require(type(index) is int and low<=index<high,'face locator outside declared primitive')
    return index-low


def complete_side_faces(primitive,explicit_faces,caps):
    require(type(explicit_faces) is list and len(explicit_faces)>0 and len(set(explicit_faces))==len(explicit_faces),
            'explicit complete side-face list required; ambiguous ranges unsupported')
    local=[local_face(primitive,i) for i in explicit_faces]
    require(set(local)==set(range(len(primitive['faces'])))-set(caps),
            'side-face list omits or adds source faces')
    return local


def attachment_metadata_diagnostic(parts,author,attachment):
    """Bind accepted root/tip/heel criteria to explicit author-owned locators.

    No fallback for provisional range conventions, unknown joint kinds or
    authorObserved figures. Hi-hat needs its final separate receiver metadata.
    """
    child=declared_primitive(parts,author,attachment['row'],attachment['group'])
    receiver=declared_primitive(parts,author,attachment['ontoRow'],attachment['ontoGroup'])
    criterion=attachment.get('criterion')
    require(type(criterion) is dict and criterion.get('meaning'),'explicit meaningful criterion required')
    require('depthM' not in attachment,'ambiguous generic depthM is unsupported')
    kind=criterion.get('kind');v,faces=child['vertices'],child['faces']
    rv,rf=receiver['vertices'],receiver['faces']
    if kind=='rod_root_embedded_through_flat_face':
        require(attachment['row']==attachment['ontoRow']=='drum_kick__tower' and
                attachment['group'] in ('kick.spur_arm.L','kick.spur_arm.R') and attachment['ontoGroup']=='kick.base',
                'spur root criterion outside exact released pair')
        roots=local_vertices(child,criterion['rootRingVertices']);tips=local_vertices(child,criterion['tipRingVertices'])
        root_cap=local_face(child,criterion['rootCapFace']);tip_cap=local_face(child,criterion['tipCapFace'])
        require(set(faces[root_cap])==set(roots) and set(faces[tip_cap])==set(tips),'ring/cap source correspondence differs')
        complete_side_faces(child,criterion.get('armSideFaces'),[root_cap,tip_cap])
        face=criterion['receivingFace']
        require(face['row']==receiver['row'] and face['group']==receiver['group'],'receiving face references another primitive')
        side=local_face(receiver,face['face'])
        planes=convex_solid_planes(rv,rf)
        require(np.allclose(planes[side]['normal'],face['outwardNormal'],rtol=0,atol=1e-9),
                'declared receiving face orientation differs')
        require(criterion['minRingBurialM']==.001 and criterion['rootCentreInsetM']==.006,
                'spur numerical limits differ from root disposition')
        long=[local_vertices(child,edge) for edge in criterion['lengthwiseEdges']]
        result=spur_root_criterion(v,faces,rv,rf,roots,long,side,.006,.001)
        root_height=float(v[roots,2].mean()-criterion['restingHeightM'])
        tip_height=float(v[tips,2].mean()-criterion['restingHeightM'])
        require(criterion['rootCentreHeightM']==.022 and criterion['tipCentreHeightM']==.014,
                'spur centre height intent differs from settled change')
        heights_ok=abs(root_height-.022)<=1e-6 and abs(tip_height-.014)<=1e-6
        result.update(rootCentreHeightM=root_height,tipCentreHeightM=tip_height,centreHeightsMatch=heights_ok)
        result['withinDeclaredGeometricCriterion'] &= heights_ok
    elif kind=='rod_tip_inside_solid':
        require(attachment['row']==attachment['ontoRow']=='drum_kick__tower' and
                (attachment['group'],attachment['ontoGroup']) in
                (('kick.spur_arm.L','kick.spur_foot.L'),('kick.spur_arm.R','kick.spur_foot.R')),
                'spur tip criterion outside exact intended pair')
        tips=local_vertices(child,criterion['tipRingVertices']);cap=local_face(child,criterion['tipCapFace'])
        require(len(tips)==8 and set(faces[cap])==set(tips),'tip locator must cover whole eight-vertex source cap')
        distances=solid_signed_distances(v[tips],convex_solid_planes(rv,rf))
        result={'withinDeclaredGeometricCriterion':bool(np.max(distances)<=1e-9),
                'tipRingVertexCount':len(tips),'minimumPlaneBurialM':float(-np.max(distances)),
                'scope':'exact complete tip cap inside the receiving foot solid; floor support separate'}
    elif kind=='board_end_seated_through_top_face':
        require(attachment['id']=='kick.footboard_on_heel' and
                attachment['row']==attachment['ontoRow']=='drum_kick__tower' and
                attachment['group']=='kick.footboard' and attachment['ontoGroup']=='kick.heel',
                'heel seat criterion outside exact released pair')
        all_vertices=local_vertices(child,criterion.get('boardVertices'))
        require(set(all_vertices)==set(range(len(v))),'boardVertices omits complete source coverage')
        caps=[local_face(child,criterion['boardFaces'][key]) for key in ('underside','top')]
        complete_side_faces(child,criterion.get('boardSideFaces'),caps)
        top=local_face(receiver,criterion['receivingTopFace']);under=local_face(receiver,criterion['receivingUndersideFace'])
        forbidden=[local_face(receiver,i) for i in criterion['forbiddenCrossingFaces'].values()]
        require(set(forbidden)==set(range(len(rf)))-{top,under},'forbidden receiver-side coverage differs')
        require(criterion['maxDepthM']==.004 and criterion['boardThicknessM']==.008 and criterion['minProudM']==.0038,
                'heel numerical limits differ from root disposition')
        proud=local_vertices(child,criterion['exposedUpperHeelEndCorners'])
        require(set(proud)<=set(faces[caps[1]]),'proud locator outside upper board face')
        result=heel_seating_criterion(v,faces,rv,rf,top,under,proud,caps,.008,.004,.0038)
    else:
        raise ValueError('criterion requires a separate explicit adapter: '+str(kind))
    return {'id':attachment['id'],'row':child['row'],'group':child['group'],
            'ontoRow':receiver['row'],'ontoGroup':receiver['group'],'criterionKind':kind,
            'declaredMeaning':criterion['meaning'],'geometry':result,
            'authorObservedUsedAsEvidence':False,'candidateAcceptance':False}


def match_authored_edge_set(label,kind,band,roles,edge_sets):
    """Apply explicit author priority and optional sorted role-pair constraint.

    Return all matching IDs so shadowed declarations remain visible. The
    consumer measures geometry independently; this function only copies intent.
    """
    require(type(roles) is list and all(type(role) is str for role in roles), 'explicit source roles required')
    pair=sorted(roles);matches=[]
    for edge_set in edge_sets:
        require(edge_set.get('id') and edge_set.get('status') and edge_set.get('reason'), 'edge set identity/status/reason required')
        for rule in edge_set['match']:
            if 'rolePairs' in rule:
                require(type(rule['rolePairs']) is list and all(type(p) is list and len(p)==2 and
                        all(type(r) is str for r in p) and p==sorted(p) for p in rule['rolePairs']),
                        'rolePairs must contain explicit sorted pairs')
            if (fnmatch.fnmatchcase(label,rule['label']) and kind in rule['kinds'] and band in rule['bands']
                    and ('rolePairs' not in rule or pair in rule['rolePairs'])):
                matches.append(edge_set);break
    selected=matches[0] if matches else None
    return {'setId':selected['id'] if selected else None,'status':selected['status'] if selected else 'undeclared',
            'reason':selected['reason'] if selected else None,'matchingSetIds':[s['id'] for s in matches],
            'sourceRoles':roles,'sortedRolePair':pair,'policy':'first matching author entry; all matching IDs disclosed',
            'semanticApprovalInferred':False}


def projected_face_clearance(points,vertices,face,plane):
    """Signed Euclidean clearance of orthogonal projections to a convex face."""
    v=np.asarray(vertices,float);polygon=v[list(face)];normal=plane['normal']
    edge=np.roll(polygon,-1,axis=0)-polygon
    centroid=polygon.mean(axis=0)
    sense=np.sign(float(np.dot(np.cross(edge[0],centroid-polygon[0]),normal)))
    require(sense!=0,'degenerate face footprint')
    results=[]
    for point in np.asarray(points,float):
        projection=point-float((point-plane['point'])@normal)*normal
        inside=all(sense*float(np.dot(np.cross(b-a,projection-a),normal))>=-1e-10
                   for a,b in zip(polygon,np.roll(polygon,-1,axis=0)))
        distances=[]
        for a,b in zip(polygon,np.roll(polygon,-1,axis=0)):
            delta=b-a;t=float(np.clip(np.dot(projection-a,delta)/np.dot(delta,delta),0,1))
            distances.append(float(np.linalg.norm(projection-(a+t*delta))))
        distance=min(distances)
        results.append({'projection':projection.tolist(),'inside':inside,
                        'signedBoundaryClearanceM':distance if inside else -distance})
    return results


def point_to_convex_solid_distances(points,vertices,faces,planes=None):
    """Exact vertex-to-convex-surface distance; not minimum solid-pair distance."""
    planes=planes or convex_solid_planes(vertices,faces)
    v=np.asarray(vertices,float);points=np.asarray(points,float);signed=solid_signed_distances(points,planes)
    output=[]
    for index,point in enumerate(points):
        if np.max(signed[index])<=1e-10:
            output.append(0.);continue
        distances=[]
        for fi,face in enumerate(faces):
            footprint=projected_face_clearance([point],v,face,planes[fi])[0]
            if footprint['inside']:distances.append(abs(float(signed[index,fi])))
            polygon=v[list(face)]
            for a,b in zip(polygon,np.roll(polygon,-1,axis=0)):
                edge=b-a;t=float(np.clip(np.dot(point-a,edge)/np.dot(edge,edge),0,1))
                distances.append(float(np.linalg.norm(point-(a+t*edge))))
        output.append(min(distances))
    return np.asarray(output)


def barrel_geometry(vertices,faces,ring_indices,end_disc_faces):
    """Derive exact axis/radius from the two complete authored 12-vertex rings."""
    v=np.asarray(vertices,float);planes=convex_solid_planes(v,faces)
    require(len(ring_indices)==2 and len(end_disc_faces)==2 and len(set(end_disc_faces))==2,
            'two barrel rings and end discs required')
    require(len(v)==24 and all(len(r)==12 and len(set(r))==12 for r in ring_indices)
            and set(ring_indices[0]).isdisjoint(ring_indices[1])
            and set(ring_indices[0]+ring_indices[1])==set(range(24)), 'complete 12-sided barrel coverage required')
    for ring,fi in zip(ring_indices,end_disc_faces):
        require(type(fi) is int and 0<=fi<len(faces) and set(faces[fi])==set(ring),'barrel ring/cap differs')
    centres=np.asarray([v[ring].mean(axis=0) for ring in ring_indices]);delta=centres[1]-centres[0]
    length=float(np.linalg.norm(delta));require(length>0,'zero barrel axis length')
    axis=delta/length;radii=[]
    for ring,centre,fi in zip(ring_indices,centres,end_disc_faces):
        require(abs(float(np.dot(planes[fi]['normal'],axis)))>=1-1e-10,'barrel cap not normal to derived axis')
        radii.extend(np.linalg.norm(v[ring]-centre,axis=1).tolist())
    require(max(abs(r-.009) for r in radii)<=1e-6,'barrel vertex radius differs from 9mm')
    require(abs(length-.090)<=1e-6,'barrel width differs from 90mm')
    return {'planes':planes,'centres':centres,'axis':axis,'length':length,'radii':radii}


def hinge_base_seating_criterion(barrel_vertices,barrel_faces,ring_indices,end_disc_faces,
                                 base_vertices,base_faces,base_top_face,base_under_face,
                                 expected_seated_indices,expected_deepest_indices,
                                 heel_vertices,heel_faces):
    """Criterion A: exact barrel/base seating, all barrel vertices and edges."""
    v=np.asarray(barrel_vertices,float);barrel=barrel_geometry(v,barrel_faces,ring_indices,end_disc_faces)
    base_planes=convex_solid_planes(base_vertices,base_faces)
    require(0<=base_top_face<len(base_faces) and 0<=base_under_face<len(base_faces)
            and base_top_face!=base_under_face,'base face identity required')
    top,under=base_planes[base_top_face],base_planes[base_under_face]
    require(float(np.dot(top['normal'],under['normal']))<=-1+1e-10,'base cap planes must be opposite')
    base_thickness=abs(float((top['point']-under['point'])@top['normal']))
    signed=solid_signed_distances(v,base_planes);heights=signed[:,base_top_face]
    seated=np.flatnonzero(heights < -1e-9).tolist();depth=float(-heights.min())
    deepest=np.flatnonzero(np.abs(heights-heights.min())<=1e-9).tolist()
    require(len(expected_seated_indices)==6 and len(set(expected_seated_indices))==6
            and len(expected_deepest_indices)==2 and len(set(expected_deepest_indices))==2,
            'explicit six seated and two deepest barrel vertices required')
    rest=[i for i in range(len(v)) if i not in seated]
    footprints=projected_face_clearance(v[seated],base_vertices,base_faces[base_top_face],top) if seated else []
    margin=min((p['signedBoundaryClearanceM'] for p in footprints),default=None)
    underside_clearance=float((-signed[:,base_under_face]).min())
    axis_heights=(barrel['centres']-top['point'])@top['normal']
    heel_distances=point_to_convex_solid_distances(v,heel_vertices,heel_faces)
    crossings=solid_edge_crossings(v,source_edges(v,barrel_faces),base_planes)
    only_top=bool(crossings['crossings'] and not crossings['coplanarBoundarySegments'] and
                  all(c['face']==base_top_face for c in crossings['crossings']))
    matches=(set(seated)==set(expected_seated_indices) and set(deepest)==set(expected_deepest_indices))
    valid=bool(matches and abs(base_thickness-.010)<=1e-6 and abs(depth-.003)<=.00005+1e-10
               and rest and heights[rest].min()>=.001-1e-9 and margin is not None and margin>=.010-1e-9
               and underside_clearance>=.005-1e-9 and np.max(np.abs(axis_heights-.006))<=.00005+1e-10
               and heel_distances.min()>=.0025-1e-9 and only_top)
    return {'withinDeclaredGeometricCriterion':valid,'seatedVertexIndices':seated,'deepestVertexIndices':deepest,
            'exactSeatedAndDeepestIdentitiesMatch':matches,'maximumSeatDepthM':depth,
            'minimumOtherVertexAboveTopM':float(heights[rest].min()) if rest else None,
            'minimumSeatedFootprintMarginM':margin,'minimumAboveBaseUndersideM':underside_clearance,
            'baseThicknessM':base_thickness,'axisHeightsAboveBaseTopM':axis_heights.tolist(),
            'minimumBarrelVertexDistanceToHeelSolidM':float(heel_distances.min()),
            'barrelVertexDistancesToHeelSolidM':heel_distances.tolist(),'crossings':crossings,
            'boundaryCrossingsOnlyThroughBaseTop':only_top,
            'scope':'criterion A: exact barrel/base pair; vertex-to-heel clearance is not a full solid-pair distance'}


def board_hinge_capture_criterion(board_vertices,board_faces,board_under_face,board_top_face,
                                  heel_axis_indices,heel_end_face,barrel_vertices,barrel_faces,
                                  ring_indices,end_disc_faces,base_vertices,base_faces,base_top_face):
    """Criterion B: cylindrical capture; all board vertices are classified."""
    v=np.asarray(board_vertices,float);board_planes=convex_solid_planes(v,board_faces)
    barrel=barrel_geometry(barrel_vertices,barrel_faces,ring_indices,end_disc_faces)
    base_planes=convex_solid_planes(base_vertices,base_faces);base_top=base_planes[base_top_face]
    require(len(heel_axis_indices)==2 and len(set(heel_axis_indices))==2 and
            set(heel_axis_indices)<=set(board_faces[board_under_face]),'two source underside heel-axis vertices required')
    require(set(heel_axis_indices)<=set(board_faces[heel_end_face]),'heel-end face misses axis vertices')
    lower,upper=board_planes[board_under_face],board_planes[board_top_face]
    require(float(np.dot(lower['normal'],upper['normal']))<=-1+1e-10,'parallel board thickness caps required')
    thickness=abs(float((upper['point']-lower['point'])@lower['normal']))
    d=v-barrel['centres'][0];axial=d@barrel['axis'];radial=np.linalg.norm(d-axial[:,None]*barrel['axis'],axis=1)
    between=(axial>=-1e-9)&(axial<=barrel['length']+1e-9)
    tested=np.flatnonzero(between&(radial<=.009+1e-9))
    distances=solid_signed_distances(v,barrel['planes'])
    exact_inside=bool(len(tested)>0 and distances[tested].max()<=1e-9)
    heel_inside=bool(distances[board_faces[heel_end_face]].max()<=1e-9)
    overhang=np.maximum(np.maximum(-axial,axial-barrel['length']),0)
    base_height=(v-base_top['point'])@base_top['normal']
    axes_ok=bool(radial[heel_axis_indices].max()<=.00005+1e-10 and between[heel_axis_indices].all())
    valid=bool(axes_ok and exact_inside and heel_inside and overhang.max()<=.007+1e-9
               and base_height.min()>=-1e-9 and abs(thickness-.008)<=1e-6)
    return {'withinDeclaredGeometricCriterion':valid,'heelAxisRadialDistancesM':radial[heel_axis_indices].tolist(),
            'heelAxisVerticesBetweenEndDiscs':bool(between[heel_axis_indices].all()),
            'allBoardVertexCount':len(v),'verticesBetweenEndsWithinRadius':tested.tolist(),
            'allSelectedVerticesInsideExactBarrel':exact_inside,'wholeHeelEndFaceInsideBarrel':heel_inside,
            'maximumAxialOverhangM':float(overhang.max()),'minimumBoardAboveBaseTopM':float(base_height.min()),
            'measuredBoardThicknessM':thickness,'derivedAxisStart':barrel['centres'][0].tolist(),
            'derivedAxisEnd':barrel['centres'][1].tolist(),
            'scope':'criterion B: board/barrel capture only; criterion A independently establishes mounting'}


def toe_lip_rest_criterion(board_vertices,board_faces,board_under_face,housing_vertices,housing_faces,
                           lip_vertex_indices,housing_top_face,toe_tip_indices):
    """Criterion C: full-source convex separating plane plus finite lip rest."""
    board=np.asarray(board_vertices,float);housing=np.asarray(housing_vertices,float)
    bp=convex_solid_planes(board,board_faces);hp=convex_solid_planes(housing,housing_faces)
    underside=bp[board_under_face]
    require(len(lip_vertex_indices)==2 and len(set(lip_vertex_indices))==2 and
            set(lip_vertex_indices)<=set(housing_faces[housing_top_face]),'two explicit top-cap lip vertices required')
    require(len(toe_tip_indices)==2 and len(set(toe_tip_indices))==2 and
            set(toe_tip_indices)<=set(board_faces[board_under_face]),'two explicit underside toe vertices required')
    clearance=(housing-underside['point'])@underside['normal']
    lips=clearance[lip_vertex_indices];others=np.delete(clearance,lip_vertex_indices)
    footprint=projected_face_clearance(housing[lip_vertex_indices],board,board_faces[board_under_face],underside)
    margin=min(p['signedBoundaryClearanceM'] for p in footprint)
    plane_separates=bool(clearance.min()>=.00025-1e-10)
    rest=bool(np.max(np.abs(lips-.0003))<=.00005+1e-10)
    next_clearer=bool(len(others)>0 and others.min()>lips.max()+1e-10)
    housing_top=hp[housing_top_face]
    tip_height=(board[toe_tip_indices]-housing_top['point'])@housing_top['normal']
    return {'withinDeclaredGeometricCriterion':bool(plane_separates and rest and next_clearer and margin>=.005-1e-9),
            'allHousingVertexCount':len(housing),'allHousingClearancesM':clearance.tolist(),
            'minimumHousingClearanceM':float(clearance.min()),'lipClearancesM':lips.tolist(),
            'minimumOtherHousingVertexClearanceM':float(others.min()),'otherVerticesHaveGreaterClearance':next_clearer,
            'lipProjections':footprint,'minimumLipProjectedFootprintMarginM':margin,
            'sourceConvexSolidsSeparatedByBoardUndersidePlane':plane_separates,
            'toeTipHeightAboveHousingTopM':tip_height.tolist(),
            'scope':'criterion C: exact board/housing pair; convex-plane separation covers all vertices/edges/faces; no overlap exemption'}


def whole_vertex_list(primitive,indices):
    local=local_vertices(primitive,indices)
    require(set(local)==set(range(len(primitive['vertices']))),'explicit vertex list omits source coverage')
    return local


def face_correspondence(primitive,index,indices):
    face=local_face(primitive,index);local=local_vertices(primitive,indices)
    require(set(local)==set(primitive['faces'][face]),'face vertex correspondence differs')
    return face


def declared_surface(parts,author,description):
    primitive=declared_primitive(parts,author,description['row'],description['group'])
    face=face_correspondence(primitive,description['face'],description['faceVertices'])
    plane=convex_solid_planes(primitive['vertices'],primitive['faces'])[face]
    require(np.allclose(plane['normal'],description['outwardNormal'],atol=1e-9,rtol=0),'receiving surface orientation differs')
    return primitive,face


def fixed_metrics(criterion,expected):
    for key,value in expected.items():
        actual=criterion.get(key)
        require(type(actual) in (int,float) and math.isfinite(actual) and abs(actual-value)<1e-12,
                'criterion changes settled metric: '+key)


def explicit_barrel(primitive,description):
    require(description['group']==primitive['group'],'barrel identity differs')
    fixed_metrics(description,{'radiusM':.009,'sides':12})
    rings=[local_vertices(primitive,r) for r in description['ringVertices']]
    caps=[local_face(primitive,i) for i in description['endDiscFaces']]
    complete_side_faces(primitive,description['sideFaces'],caps)
    return rings,caps


def hihat_metadata_diagnostic(parts,author,attachment):
    row='drum_hihat_pedal__pedal';criterion=attachment['criterion'];kind=criterion['kind']
    require(attachment['row']==attachment['ontoRow']==row,'hi-hat criterion outside its row')
    child=declared_primitive(parts,author,row,attachment['group'])
    receiver=declared_primitive(parts,author,row,attachment['ontoGroup'])
    if kind=='barrel_knuckle_seated_through_top_face':
        require((attachment['id'],child['group'],receiver['group'],attachment['relation'])==
                ('hihat.hinge_in_base','hihat.hinge','hihat.base','embedded'),'criterion A pair differs')
        fixed_metrics(criterion,{'baseThicknessM':.010,'seatDepthM':.003,'axisHeightAboveTopM':.006,'toleranceM':.00005,
                                 'minUnseatedAboveTopM':.001,'minInsideTopOutlineM':.010,
                                 'minAboveBaseUndersideM':.005,'minClearanceToHeelM':.0025})
        base,top=declared_surface(parts,author,criterion['receivingTopFace'])
        require(base['row']==receiver['row'] and base['group']==receiver['group'],'criterion A base differs')
        whole_vertex_list(base,criterion['baseVertices'])
        under=local_face(base,criterion['receivingUndersideFace'])
        rings,caps=explicit_barrel(child,criterion['barrel'])
        heel=declared_primitive(parts,author,row,criterion['heel']['group'])
        require(heel['group']=='hihat.heel','criterion A clearance receiver differs')
        whole_vertex_list(heel,criterion['heel']['vertices'])
        result=hinge_base_seating_criterion(child['vertices'],child['faces'],rings,caps,
                base['vertices'],base['faces'],top,under,local_vertices(child,criterion['seatedVertices']),
                local_vertices(child,criterion['deepestVertices']),heel['vertices'],heel['faces'])
    elif kind=='board_heel_captured_in_hinge_barrel':
        require((attachment['id'],child['group'],receiver['group'],attachment['relation'])==
                ('hihat.footboard_in_hinge','hihat.footboard','hihat.hinge','hinged'),'criterion B pair differs')
        fixed_metrics(criterion,{'axisToleranceM':.00005,'maxCornerOverhangM':.007})
        board=criterion['board'];require(board['group']==child['group'],'criterion B board differs')
        whole_vertex_list(child,board['vertices'])
        under=local_face(child,board['undersideFace']);top=local_face(child,board['topFace'])
        complete_side_faces(child,board['sideFaces'],[under,top])
        heel_face=face_correspondence(child,board['heelEndFace'],board['heelEndFaceVertices'])
        rings,caps=explicit_barrel(receiver,criterion['barrel'])
        base,base_top=declared_surface(parts,author,criterion['receivingBaseTop'])
        require(base['row']==row and base['group']=='hihat.base','criterion B base receiver differs')
        result=board_hinge_capture_criterion(child['vertices'],child['faces'],under,top,
                local_vertices(child,board['heelAxisVertices']),heel_face,receiver['vertices'],receiver['faces'],
                rings,caps,base['vertices'],base['faces'],base_top)
        require(criterion['barrel']['axisFrame']=='Blender world metres','barrel axis coordinate frame differs')
        for key,observed in [('axisStart',result['derivedAxisStart']),('axisEnd',result['derivedAxisEnd'])]:
            require(np.max(np.abs(np.asarray(criterion['barrel'][key])-observed))<=.00000051,
                    'rounded declared axis differs from actual ring centroids')
    elif kind=='board_rests_on_lip_separating_plane':
        require((attachment['id'],child['group'],receiver['group'],attachment['relation'])==
                ('hihat.footboard_on_housing','hihat.footboard','hihat.housing','rests_on'),'criterion C pair differs')
        fixed_metrics(attachment,{'gapM':.0003})
        fixed_metrics(criterion,{'gapM':.0003,'toleranceM':.00005,'minClearanceM':.00025,'minLipInsideBoardOutlineM':.005})
        board,housing=criterion['board'],criterion['housing']
        require(board['group']==child['group'] and housing['group']==receiver['group'],'criterion C group differs')
        under=face_correspondence(child,board['undersideFace'],board['undersideFaceVertices'])
        whole_vertex_list(receiver,housing['vertices'])
        housing_top=face_correspondence(receiver,housing['topFace'],housing['topFaceVertices'])
        result=toe_lip_rest_criterion(child['vertices'],child['faces'],under,receiver['vertices'],receiver['faces'],
                local_vertices(receiver,housing['lipVertices']),housing_top,local_vertices(child,board['toeTipUndersideVertices']))
    else:raise ValueError('unknown hi-hat criterion: '+kind)
    return {'id':attachment['id'],'row':row,'group':child['group'],'ontoRow':row,'ontoGroup':receiver['group'],
            'criterionKind':kind,'declaredMeaning':criterion['meaning'],'geometry':result,
            'authorObservedUsedAsEvidence':False,'candidateAcceptance':False}


def upper_receiving_plane(primitive):
    """Unique most-upward finite face of the explicitly named receiving solid.

    Pure geometric face selection within author-named panel/plate/bezel; the
    chosen face is reported. Ambiguous parallel upper faces fail closed.
    """
    planes=convex_solid_planes(primitive['vertices'],primitive['faces'])
    scores=np.asarray([p['normal'][2] for p in planes]);best=float(scores.max())
    winners=np.flatnonzero(np.abs(scores-best)<1e-9)
    require(best>.5 and len(winners)==1,'receiving upper plane is ambiguous')
    fi=int(winners[0]);return planes[fi],fi


def rest_on_diagnostic(parts,author,attachment):
    child=declared_primitive(parts,author,attachment['row'],attachment['group'])
    receiver=declared_primitive(parts,author,attachment['ontoRow'],attachment['ontoGroup'])
    require(attachment['relation']=='rests_on' and 'criterion' not in attachment,'plain resting pair required')
    plane,fi=upper_receiving_plane(receiver)
    signed=(child['vertices']-plane['point'])@plane['normal'];minimum=float(signed.min())
    contact_indices=np.flatnonzero(np.abs(signed-minimum)<1e-9)
    footprint=projected_face_clearance(child['vertices'][contact_indices],receiver['vertices'],receiver['faces'][fi],plane)
    valid=bool(abs(minimum-attachment['gapM'])<=1e-6 and all(p['inside'] for p in footprint))
    return {'id':attachment['id'],'row':child['row'],'group':child['group'],'ontoRow':receiver['row'],
            'ontoGroup':receiver['group'],'criterionKind':'declared_resting_gap_and_contact_footprint',
            'geometry':{'withinDeclaredGeometricCriterion':valid,'signedGapM':minimum,'declaredGapM':attachment['gapM'],
                        'receivingGlobalFace':receiver['faceRange'][0]+fi,'contactVertexCount':len(contact_indices),
                        'contactFootprint':footprint,'planeSelection':'unique most-upward face of declared receiver'},
            'candidateAcceptance':False}


def inlay_diagnostics(parts,author):
    require(len(author['seatings'])==4,'exact four I1 pairs required')
    expected={('ctl_body__indicators','ctl.indicator_strip#'+str(i),'ctl_body__shell','ctl.panel') for i in range(4)}
    observed={(s['row'],s['group'],s['intoRow'],s['intoGroup']) for s in author['seatings']}
    require(observed==expected,'I1 identities differ from four released pairs')
    results=[]
    for seating in author['seatings']:
        fixed_metrics(seating,{'seatDepthM':.001,'proudM':.0025})
        strip=declared_primitive(parts,author,seating['row'],seating['group'])
        panel=declared_primitive(parts,author,seating['intoRow'],seating['intoGroup'])
        plane,fi=upper_receiving_plane(panel)
        offsets=seating_offsets(strip['vertices'],plane['point'],plane['normal'])
        footprint=projected_face_clearance(strip['vertices'],panel['vertices'],panel['faces'][fi],plane)
        valid=(abs(offsets['minimumSignedOffsetM']+.001)<=1e-6 and
               abs(offsets['maximumSignedOffsetM']-.0025)<=1e-6 and all(p['inside'] for p in footprint))
        results.append({'id':seating['id'],'row':strip['row'],'group':strip['group'],'intoRow':panel['row'],
                        'intoGroup':panel['group'],'withinDeclaredGeometricCriterion':valid,**offsets,
                        'panelGlobalFace':panel['faceRange'][0]+fi,
                        'minimumProjectedFootprintMarginM':min(p['signedBoundaryClearanceM'] for p in footprint),
                        'scope':'only this exact strip/panel pair; no same-row/asset exemption'})
    return results


def normal_diagnostics(rows,author):
    """Independent oriented source-normal measurements, never a pinned audit."""
    output={};cos2=math.cos(math.radians(2))
    for name,row in rows.items():
        vertices=np.asarray(row['vertices']);bad_unit=[];degenerate=[];flat_fail=[]
        max_angle=0.;planar_triangles=0;count=0
        for fi,face in enumerate(row['faces']):
            normals=np.asarray(row['cornerNormals'][fi]);lengths=np.linalg.norm(normals,axis=1);count+=len(normals)
            if not np.isfinite(normals).all() or np.any(np.abs(lengths-1)>1e-6):bad_unit.append(fi)
            points=vertices[face]
            for k in range(1,len(face)-1):
                corner=[0,k,k+1];tri=points[corner]
                geometric=np.cross(tri[1]-tri[0],tri[2]-tri[0]);length=float(np.linalg.norm(geometric))
                if length<=1e-12:degenerate.append([fi,k-1]);continue
                geometric/=length
                if row['faceClasses'][fi]=='planar':
                    planar_triangles+=1
                    dots=np.clip(normals[corner]@geometric,-1,1)
                    max_angle=max(max_angle,float(np.degrees(np.arccos(dots)).max()))
                    if np.any(dots<cos2-1e-12) or np.max(np.abs((points-tri[0])@geometric))>1e-8:
                        flat_fail.append([fi,k-1])
        output[name]={'cornerCount':count,'planarTriangles':planar_triangles,'maxPlanarDeviationDeg':max_angle,
                      'nonUnitOrNonfiniteFaces':bad_unit,'degenerateFanTriangles':degenerate,'planarFailures':flat_fail,
                      'withinMeasuredNormalLimits':not (bad_unit or degenerate or flat_fail)}
    runs=[]
    for run in author['roundRuns']:
        row=rows[run['row']];group=next(g for g in row['groups'] if g['id']==run['group'])
        faces=run['faces'];require(len(faces)==len(set(faces)) and len(faces)>1,'invalid explicit round run')
        require(all(group['faceRange'][0]<=fi<group['faceRange'][1] for fi in faces),'round run outside authored group')
        require(all(row['faceClasses'][fi]=='round' for fi in faces),'declared round-run class differs')
        raw_ids={row['rawRoundRuns'][fi] for fi in faces};require(len(raw_ids)==1 and None not in raw_ids,'raw run correspondence differs')
        source_faces={fi for fi,value in enumerate(row['rawRoundRuns']) if value in raw_ids}
        require(source_faces==set(faces),'round-run declaration omits source faces')
        adjacency={}
        for fi in faces:
            face=row['faces'][fi]
            for a,b in zip(face,face[1:]+face[:1]):adjacency.setdefault(tuple(sorted((a,b))),[]).append(fi)
        errors=[];shared=0
        for edge,fs in adjacency.items():
            if len(fs)!=2:continue
            shared+=1
            for vertex in edge:
                n=[np.asarray(row['cornerNormals'][fi][row['faces'][fi].index(vertex)]) for fi in fs]
                if np.linalg.norm(n[0]-n[1])>1e-6:errors.append({'edge':list(edge),'vertex':vertex})
        runs.append({'id':run['id'],'faceCount':len(faces),'sharedRunEdges':shared,'discontinuousCorners':errors,
                     'sourceNormalsContinuous':not errors and shared>0})
    declared={(r['row'],fi) for r in author['roundRuns'] for fi in r['faces']}
    actual={(name,fi) for name,row in rows.items() for fi,value in enumerate(row['rawRoundRuns']) if value is not None}
    require(declared==actual,'round-run coverage omits or invents source run faces')
    return {'rows':output,'continuousRoundRuns':runs,'allWithinMeasuredLimits':all(r['withinMeasuredNormalLimits'] for r in output.values())
            and all(r['sourceNormalsContinuous'] for r in runs),
            'scope':'complete authored source corner field and declared runs; no exported NORMAL or candidate audit'}


def semantic_edge_diagnostics(rows,author):
    """Independent raw topology/angles with copied author role/edge-set intent."""
    result={};sets={};undeclared=[];seams={};round_edges_kept=0
    declared_runs={}
    for run in author['roundRuns']:
        for fi in run['faces']:declared_runs[(run['row'],fi)]=run['id']
    for name,row in rows.items():
        v=np.asarray(row['vertices']);faces=row['faces'];normals=[];centres=[];adj={};group_of={};sign={};closed={}
        for fi,face in enumerate(faces):
            p=v[face];centre=p.mean(0);normal=np.cross(p-centre,np.roll(p,-1,axis=0)-centre).sum(0)
            length=float(np.linalg.norm(normal));require(length>1e-14,'degenerate source face in edge measurement')
            normals.append(normal/length);centres.append(centre)
            for a,b in zip(face,face[1:]+face[:1]):adj.setdefault(tuple(sorted((a,b))),[]).append((fi,a,b))
        for group in row['groups']:
            f0,f1=group['faceRange'];v0,v1=group['vertexRange'];centre=v[v0:v1].mean(0);volume=0.;g_edges=Counter()
            for fi in range(f0,f1):
                group_of[fi]=group
                face=faces[fi];p=v[face]-centre
                for k in range(1,len(face)-1):volume+=float(np.dot(p[0],np.cross(p[k],p[k+1])))/6
                for a,b in zip(face,face[1:]+face[:1]):g_edges[tuple(sorted((a,b)))]+=1
            sign[group['id']]=1 if volume>=0 else -1;closed[group['id']]=all(n==2 for n in g_edges.values())
        records=[];row_seams={};topology=Counter();winding_bad=0
        for edge,uses in sorted(adj.items()):
            length=float(np.linalg.norm(v[edge[1]]-v[edge[0]]));fs=[u[0] for u in uses];group=group_of[fs[0]]
            require(all(group_of[fi]['id']==group['id'] for fi in fs),'edge crosses semantic primitives')
            angle=None;smooth=False
            if len(fs)!=2:
                kind=band='open';topology['boundaryEdges' if len(fs)==1 else 'nonManifoldEdges']+=1
            else:
                if uses[0][1:]!=uses[1][1:][::-1]:winding_bad+=1
                n0,n1=normals[fs[0]],normals[fs[1]]
                angle=math.degrees(math.acos(float(np.clip(np.dot(n0,n1),-1,1))))
                same_run=(name,fs[0]) in declared_runs and declared_runs.get((name,fs[0]))==declared_runs.get((name,fs[1]))
                smooth=angle<=40+1e-10 or same_run
                if same_run and angle>40+1e-10:round_edges_kept+=1
                roles=[row['rawFaceRoles'][fi] for fi in fs]
                kind='cap' if 'cap' in roles else 'block' if roles==['blk','blk'] else 'along' if roles[0]==roles[1] else 'ring'
                outward=n0*sign[group['id']]
                convex=float(np.dot(outward,centres[fs[1]]-(v[edge[0]]+v[edge[1]])/2))<0
                band='concave' if not convex else 'convex>=80' if angle>=80-1e-10 else 'convex40-80'
                c0,c1=[row['faceClasses'][fi] for fi in fs]
                if smooth and c0==c1 and c0.startswith('bevel:'):
                    seams[c0]=seams.get(c0,0.)+length;row_seams[c0]=row_seams.get(c0,0.)+length
            if smooth:continue
            roles=[row['rawFaceRoles'][fi] for fi in fs]
            match=match_authored_edge_set(group['label'],kind,band,roles,author['edgeSets'])
            record={'vertices':list(edge),'faces':fs,'group':group['id'],'label':group['label'],'lengthM':length,
                    'angleDeg':angle,'kind':kind,'band':band,'primitiveClosedByEdgeIncidence':closed[group['id']],**match}
            records.append(record)
            if match['setId'] is None:undeclared.append({'row':name,**record})
            key=match['setId'] or 'UNDECLARED'
            total=sets.setdefault(key,{'status':match['status'],'reason':match['reason'],'edgeCount':0,'lengthByBandM':{},'labels':set()})
            total['edgeCount']+=1;total['labels'].add(group['label'])
            total['lengthByBandM'][band]=total['lengthByBandM'].get(band,0.)+length
        result[name]={'hardEdges':records,'topology':dict(topology),'inconsistentlyWoundSharedEdges':winding_bad,
                      'bevelMiddleSeamLengthByClassM':row_seams,'openPrimitiveIds':[g for g,c in closed.items() if not c]}
    for value in sets.values():value['labels']=sorted(value['labels'])
    return {'rows':result,'sets':sets,'undeclaredHardEdges':undeclared,'bevelMiddleSeamLengthByClassM':seams,
            'over40EdgesKeptSmoothByDeclaredRun':round_edges_kept,
            'limits':['Convexity follows per-primitive signed-volume orientation convention; open primitives are flagged, not certified solids.',
                      'Band/role/set counts are source diagnostics, not material or image acceptance.',
                      'Only smooth shared same-class bevel seams counted; original treated-edge length not reconstructed.']}


def segment_triangle_contacts(start,end,triangles_):
    e1,e2=triangles_[:,1]-triangles_[:,0],triangles_[:,2]-triangles_[:,0]
    direction=end-start;h=np.cross(direction,e2);det=np.einsum('ij,ij->i',e1,h)
    usable=np.abs(det)>1e-14;inv=np.divide(1.,det,out=np.zeros_like(det),where=usable)
    delta=start-triangles_[:,0];u=inv*np.einsum('ij,ij->i',delta,h);q=np.cross(delta,e1)
    v=inv*np.einsum('ij,ij->i',direction,q);t=inv*np.einsum('ij,ij->i',e2,q)
    return usable&(u>=-1e-9)&(v>=-1e-9)&(u+v<=1+1e-9)&(t>=-1e-9)&(t<=1+1e-9)


def coplanar_triangles_touch(a,b,normal):
    axis=int(np.argmax(np.abs(normal)));a=np.delete(a,axis,axis=1);b=np.delete(b,axis,axis=1)
    for triangle in (a,b):
        for edge in np.roll(triangle,-1,axis=0)-triangle:
            n=np.array([-edge[1],edge[0]]);length=np.linalg.norm(n)
            if length<1e-14:continue
            n/=length;pa,pb=a@n,b@n
            if pa.max()<pb.min()-1e-9 or pb.max()<pa.min()-1e-9:return False
    return True


def triangle_contact_counts(a,b,pair_budget=32768):
    """Bounded surface contacts, including coplanar touches; no containment claim."""
    a=np.asarray(a,float);b=np.asarray(b,float)
    if not len(a) or not len(b):return {'noncoplanarPairs':0,'coplanarTouchOrOverlapPairs':0,'examplePairs':[]}
    low_a,high_a=a.min(1),a.max(1);low_b,high_b=b.min(1),b.max(1)
    indices=np.flatnonzero(np.all((low_b<=high_a.max(0)+1e-9)&(high_b>=low_a.min(0)-1e-9),axis=1))
    b=b[indices];low_b=low_b[indices];high_b=high_b[indices]
    noncoplanar=coplanar=0;examples=[]
    if not len(b):return {'noncoplanarPairs':0,'coplanarTouchOrOverlapPairs':0,'examplePairs':[]}
    for start in range(0,len(a),max(1,pair_budget//len(b))):
        size=max(1,pair_budget//len(b));aa=a[start:start+size]
        mask=np.all((low_a[start:start+size,None]<=high_b[None]+1e-9)&
                    (low_b[None]<=high_a[start:start+size,None]+1e-9),axis=2)
        ai,bi=np.nonzero(mask)
        if not len(ai):continue
        ta,tb=aa[ai],b[bi];hit=np.zeros(len(ai),bool)
        na=np.cross(ta[:,1]-ta[:,0],ta[:,2]-ta[:,0]);nb=np.cross(tb[:,1]-tb[:,0],tb[:,2]-tb[:,0])
        la,lb=np.linalg.norm(na,axis=1),np.linalg.norm(nb,axis=1)
        require(np.all(la>1e-14)&np.all(lb>1e-14),'degenerate triangle in surface contacts')
        na/=la[:,None];nb/=lb[:,None]
        cop=(np.linalg.norm(np.cross(na,nb),axis=1)<1e-8)&(np.abs(np.einsum('ij,ij->i',tb[:,0]-ta[:,0],na))<1e-9)
        for k in range(3):hit|=segment_triangle_contacts(ta[:,k],ta[:,(k+1)%3],tb)|segment_triangle_contacts(tb[:,k],tb[:,(k+1)%3],ta)
        hit&=~cop
        noncoplanar+=int(hit.sum())
        for index in np.flatnonzero(cop):
            if coplanar_triangles_touch(ta[index],tb[index],na[index]):
                coplanar+=1
                if len(examples)<8:examples.append([int(start+ai[index]),int(indices[bi[index]]),'coplanar_touch_or_overlap'])
        for index in np.flatnonzero(hit)[:max(0,8-len(examples))]:
            examples.append([int(start+ai[index]),int(indices[bi[index]]),'noncoplanar_surface_contact'])
    return {'noncoplanarPairs':noncoplanar,'coplanarTouchOrOverlapPairs':coplanar,'examplePairs':examples}


def full_surface_contacts(parts,author,retained,attachments,inlays):
    entries=[]
    for spec in author['rows']:
        for group in spec['groups']:
            primitive=declared_primitive(parts,author,spec['id'],group['id'])
            tris,_=triangles(primitive['vertices'],primitive['faces'])
            entries.append({'id':[spec['id'],group['id']],'triangles':tris,'transparent':False,'candidate':True})
    for item in retained:
        entries.append({'id':[item['name'],'retained-leaf'],'triangles':item['triangles'],
                        'transparent':item['metadata']['transparent'],'candidate':False})
    degenerate=[]
    for entry in entries:
        t=entry['triangles'];valid=np.linalg.norm(np.cross(t[:,1]-t[:,0],t[:,2]-t[:,0]),axis=1)>1e-14
        if not valid.all():
            degenerate.append({'id':entry['id'],'excludedDegenerateSourceTriangleIndices':np.flatnonzero(~valid).tolist()})
            entry['triangles']=t[valid]
        require(len(entry['triangles'])>0,'primitive has no nondegenerate surface triangles')
        entry['min']=entry['triangles'].min((0,1));entry['max']=entry['triangles'].max((0,1))
    scoped={}
    for record in attachments:
        key=frozenset(((record['row'],record['group']),(record['ontoRow'],record['ontoGroup'])))
        scoped[key]={'id':record['id'],'measuredCriterionSatisfied':record['geometry']['withinDeclaredGeometricCriterion']}
    for record in inlays:
        key=frozenset(((record['row'],record['group']),(record['intoRow'],record['intoGroup'])))
        scoped[key]={'id':record['id'],'measuredCriterionSatisfied':record['withinDeclaredGeometricCriterion']}
    results=[];considered=0;broadphase=0
    for i,a in enumerate(entries):
        if not a['candidate']:break
        for b in entries[i+1:]:
            considered+=1
            if not np.all((a['min']<=b['max']+1e-9)&(b['min']<=a['max']+1e-9)):continue
            broadphase+=1;counts=triangle_contact_counts(a['triangles'],b['triangles'])
            if not counts['noncoplanarPairs'] and not counts['coplanarTouchOrOverlapPairs']:continue
            scope=scoped.get(frozenset((tuple(a['id']),tuple(b['id']))))
            results.append({'a':a['id'],'b':b['id'],**counts,'transparentRetainedPair':b['transparent'],
                            'declaredPairCriterion':scope,'classification':'transparent retained contact diagnostic' if b['transparent'] else
                            'exact declared pair; inspect separate geometric criterion' if scope else 'unclassified surface contact; no exemption inferred'})
    return {'primitivePairsConsidered':considered,'boundingBoxCandidates':broadphase,'contactPairs':results,
            'degenerateSourceTrianglesExcluded':degenerate,
            'unclassifiedOpaqueContactPairCount':sum(not r['transparentRetainedPair'] and r['declaredPairCriterion'] is None for r in results),
            'limits':['All distinct source primitives, including within-row/same-asset pairs, are included against each other and retained leaves.',
                      'Surface contacts include touches and coplanar overlap; counts are triangle-pair/tessellation dependent.',
                      'Degenerate source triangles are separately disclosed and excluded; example indices refer to filtered primitive arrays.',
                      'No general solid containment or minimum-distance proof; a fully enclosed object may have no surface contact.',
                      'No self-intersection test within a single primitive; open lathe shells are surfaces.',
                      'Only exact named pairs receive criterion references; unclassified contacts remain unclassified, never auto-approved.']}


def cable_diagnostics(rows):
    result=[]
    for name,row in rows.items():
        for group in row['groups']:
            if not (group['label'].startswith('cable.') or group['label']=='sustain.cable'):continue
            v0,v1=group['vertexRange'];f0,f1=group['faceRange']
            cap_faces=[fi for fi in range(f0,f1) if row['rawFaceRoles'][fi]=='cap']
            require(len(cap_faces)==2,'cable needs two explicit source caps')
            sides=len(row['faces'][cap_faces[0]])
            require(sides in (5,6) and len(row['faces'][cap_faces[1]])==sides and (v1-v0)%sides==0,
                    'unsupported cable ring topology')
            v=np.asarray(row['vertices'][v0:v1]);rings=v.reshape(-1,sides,3);centres=rings.mean(1)
            radii=np.linalg.norm(rings-centres[:,None,:],axis=2)
            expected=.0035 if group['label']=='sustain.cable' else .003
            result.append({'row':name,'group':group['id'],'sourceRingSides':sides,'ringCount':len(rings),
                           'minimumDiameterM':float(radii.min()*2),'maximumDiameterM':float(radii.max()*2),
                           'expectedDiameterM':2*expected,'radiusWithin1Micrometre':bool(np.max(np.abs(radii-expected))<=1e-6),
                           'centrelineLengthM':float(np.linalg.norm(np.diff(centres,axis=0),axis=1).sum()),
                           'endpointCentres':centres[[0,-1]].tolist(),'minimumZ':float(v[:,2].min()),
                           'boundsMin':v.min(0).tolist(),'boundsMax':v.max(0).tolist(),
                           'scope':'authored cable/draped-run geometry; mixed rug/floor is not relabelled as one support surface'})
    require(sum(r['row']=='music_cables__runs' for r in result)==8 and len(result)==9,'complete eight music cables plus sustain lead required')
    return {'runs':result,'allCircumdiametersWithinTolerance':all(r['radiusWithin1Micrometre'] for r in result),
            'limits':['Drape/contact appearance and continuous clearance remain image/export gates.',
                      'Surface contacts against rug and other geometry are recorded in the full primitive-pair table, not hidden by cable labels.']}


def budget_diagnostics(parts,rows,mapping,retained):
    expected={r['leaf']:r for r in mapping['addedRows']};by_row={}
    for name,part in parts.items():
        count=sum(len(f)-2 for f,_ in part.f);record=expected[name]
        require(count==part.tris and part.asset==record['assetId'] and part.mat==record['material'] and part.casts==record['castShadow'],
                'row source/contract parity differs')
        by_row[name]={'triangles':count,'ceiling':record['placedTriangles'],'withinCeiling':count<=record['placedTriangles'],
                      'mainContributions':1,'shadowContributions':int(part.casts),'refreshContributions':1+int(part.casts),
                      'refreshWeightedTriangles':count*(1+int(part.casts)),
                      'boundsMin':np.asarray(part.v).min(0).tolist(),'boundsMax':np.asarray(part.v).max(0).tolist()}
    stage={'main':len(parts),'casters':sum(int(p.casts) for p in parts.values()),
           'refresh':sum(1+int(p.casts) for p in parts.values()),'placed':sum(p.tris for p in parts.values()),
           'refreshTriangles':sum(p.tris*(1+int(p.casts)) for p in parts.values())}
    retained_main=sum(1+int(e['metadata']['materialTransparent'] and e['metadata']['doubleSided']) for e in retained)
    retained_shadow=sum(int(e['rawExtras'].get('nocast') is False) for e in retained)
    retained_tri=sum(len(e['triangles']) for e in retained)
    shadow_tri=sum(len(e['triangles']) for e in retained if e['rawExtras'].get('nocast') is False)+sum(p.tris for p in parts.values() if p.casts)
    vertices=sum(len(r['vertices']) for r in rows.values());corners=sum(sum(len(f) for f in r['faces']) for r in rows.values())
    return {'rows':by_row,'stage':stage,'stageCeilings':mapping['stageCeilings'],
            'allRowCeilingsHold':all(r['withinCeiling'] for r in by_row.values()),
            'allStageCeilingsHold':all(stage[k]<=v for k,v in mapping['stageCeilings'].items()),
            'wholeSourceEstimates':{'meshLeaves':len(retained)+len(parts),'mainPassContributions':retained_main+stage['main'],
                                    'shadowContributions':retained_shadow+stage['casters'],
                                    'refreshContributions':retained_main+stage['main']+retained_shadow+stage['casters'],
                                    'placedTriangles':retained_tri+stage['placed'],'shadowTriangles':shadow_tri},
            'm4UncompressedGeometryRangeBytes':{'sharedVertexPositionNormalUvPlusUint32Indices':vertices*32+stage['placed']*12,
                                               'polygonCornerSplitPositionNormalUvPlusUint32Indices':corners*32+stage['placed']*12},
            'assumptions':['One primitive per leaf; transparent double-sided retained material estimated as two main passes.',
                           'One shadow contribution for each raw nocast=false retained leaf and each M4 caster; no renderer/GPU measurement.',
                           'Geometry byte estimates assume float32 POSITION/NORMAL/UV and uint32 indices; actual triangulation/seam splits may differ.',
                           'No new texture/export created; final compressed transfer, texture memory and renderer budgets remain unverified.']}


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


def attachment_diagnostics(parts,author):
    output=[]
    for attachment in author['attachments']:
        kind=attachment.get('criterion',{}).get('kind')
        if kind is None:result=rest_on_diagnostic(parts,author,attachment)
        elif kind in ('barrel_knuckle_seated_through_top_face','board_heel_captured_in_hinge_barrel',
                      'board_rests_on_lip_separating_plane'):
            result=hihat_metadata_diagnostic(parts,author,attachment)
        else:result=attachment_metadata_diagnostic(parts,author,attachment)
        output.append(result)
    return output


def selected_layout_preflight(parts,author,rows):
    """Locator/coverage validation only; no ray, contact or criterion measurement."""
    require(author['selectedPose']=={'cx':1.375,'cy':-.825,'yaw':-.95},'released P14 selection differs')
    require(len(rows)==18 and len(author['supports'])==25 and len(author['attachments'])==13
            and len(author['roundRuns'])==18 and len(author['edgeSets'])==44,'settled interface cardinality differs')
    supported={'rod_root_embedded_through_flat_face','rod_tip_inside_solid','board_end_seated_through_top_face',
               'barrel_knuckle_seated_through_top_face','board_heel_captured_in_hinge_barrel',
               'board_rests_on_lip_separating_plane'}
    kinds=Counter()
    for a in author['attachments']:
        child=declared_primitive(parts,author,a['row'],a['group'])
        receiver=declared_primitive(parts,author,a['ontoRow'],a['ontoGroup'])
        c=a.get('criterion')
        if c is None:
            require(a['relation']=='rests_on' and type(a.get('gapM')) in (int,float),'plain rest metadata missing')
            continue
        require(c.get('kind') in supported and c.get('meaning') and c.get('indexConvention'),
                'unsupported or incomplete final attachment criterion')
        kind=c['kind'];kinds[kind]+=1
        if kind=='rod_tip_inside_solid':
            face_correspondence(child,c['tipCapFace'],c['tipRingVertices'])
            whole_vertex_list(receiver,c['footVertices'])
        elif kind=='rod_root_embedded_through_flat_face':
            caps=[face_correspondence(child,c[key+'CapFace'],c[key+'RingVertices']) for key in ('root','tip')]
            complete_side_faces(child,c['armSideFaces'],caps)
            whole_vertex_list(child,c['rootRingVertices']+c['tipRingVertices'])
            face_correspondence(receiver,c['receivingFace']['face'],c['receivingFace']['faceVertices'])
            require(len(c['lengthwiseEdges'])==8,'eight explicit spur lengthwise edges required')
            for edge in c['lengthwiseEdges']:require(len(local_vertices(child,edge))==2,'invalid lengthwise edge')
        elif kind=='board_end_seated_through_top_face':
            whole_vertex_list(child,c['boardVertices']);whole_vertex_list(receiver,c['heelVertices'])
            caps=[local_face(child,c['boardFaces'][key]) for key in ('underside','top')]
            complete_side_faces(child,c['boardSideFaces'],caps)
            require(len(local_vertices(child,c['exposedUpperHeelEndCorners']))==2,'two proud corners required')
            require({local_face(receiver,c['receivingTopFace']),local_face(receiver,c['receivingUndersideFace']),
                     *[local_face(receiver,i) for i in c['forbiddenCrossingFaces'].values()]}==set(range(len(receiver['faces']))),
                    'heel face coverage differs')
        elif kind=='barrel_knuckle_seated_through_top_face':
            whole_vertex_list(receiver,c['baseVertices']);explicit_barrel(child,c['barrel'])
            face_correspondence(receiver,c['receivingTopFace']['face'],c['receivingTopFace']['faceVertices'])
            local_face(receiver,c['receivingUndersideFace'])
            require(len(local_vertices(child,c['seatedVertices']))==6 and c['deepestVertices']==[134,146],
                    'settled seated/deepest vertices differ')
            heel=declared_primitive(parts,author,a['row'],c['heel']['group']);whole_vertex_list(heel,c['heel']['vertices'])
        elif kind=='board_heel_captured_in_hinge_barrel':
            board=c['board'];whole_vertex_list(child,board['vertices'])
            caps=[local_face(child,board[key]) for key in ('undersideFace','topFace')]
            complete_side_faces(child,board['sideFaces'],caps)
            face_correspondence(child,board['heelEndFace'],board['heelEndFaceVertices'])
            local_vertices(child,board['heelAxisVertices']);explicit_barrel(receiver,c['barrel'])
            base=declared_primitive(parts,author,c['receivingBaseTop']['row'],c['receivingBaseTop']['group'])
            face_correspondence(base,c['receivingBaseTop']['face'],c['receivingBaseTop']['faceVertices'])
        else:
            board,housing=c['board'],c['housing']
            face_correspondence(child,board['undersideFace'],board['undersideFaceVertices'])
            local_face(child,board['topFace']);local_vertices(child,board['toeTipUndersideVertices'])
            whole_vertex_list(receiver,housing['vertices'])
            face_correspondence(receiver,housing['topFace'],housing['topFaceVertices'])
            local_vertices(receiver,housing['lipVertices'])
    for s in author['seatings']:
        declared_primitive(parts,author,s['row'],s['group']);declared_primitive(parts,author,s['intoRow'],s['intoGroup'])
    for run in author['roundRuns']:
        primitive=declared_primitive(parts,author,run['row'],run['group'])
        for fi in run['faces']:local_face(primitive,fi)
    require(sum(kinds.values())==8,'eight explicit attachment criteria required')
    return {'status':'exact layout and complete locators checked','criterionKinds':dict(kinds),
            'candidateNumericalMeasurementPerformed':False,'candidateAcceptance':False}


def selected_inputs(args):
    import ast
    import produce_fullkit_m4_v04 as producer
    helper_path=Path(__file__).with_name('build_fullkit_m4_geometry_v04.py')
    author_path=STUDIO/'asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json'
    helper,author,inputs=producer.ready_author(helper_path,args.helper_sha,author_path,args.author_sha)
    paths={'helper':helper_path,'authorDeclarations':author_path,
           'heldBuilder':helper_path.with_name('build_fullkit_m4_v04.py'),
           'authorReport':STUDIO/'scene-m4-v04-preparation-report.md',
           'measurement':Path(__file__),'producer':Path(producer.__file__),
           'writerTests':STUDIO/'scene-coordination/m4-v04-producer-tests.py'}
    for key,path in paths.items():inputs[key]=path.read_bytes()
    producer.check_source_pin(inputs['heldBuilder'],args.builder_sha)
    producer.check_source_pin(inputs['authorReport'],args.author_report_sha)
    tree=ast.parse(inputs['heldBuilder'])
    require(any(isinstance(node,ast.Raise) and isinstance(node.exc,ast.Call) and
                isinstance(node.exc.func,ast.Name) and node.exc.func.id=='SystemExit' and
                node.exc.args and isinstance(node.exc.args[0],ast.Constant) and
                'builder is HELD' in str(node.exc.args[0].value) for node in tree.body),
            'unconditional held-builder refusal missing')
    require(any(isinstance(node,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='HELPER_SHA' for t in node.targets)
                and isinstance(node.value,ast.Constant) and node.value.value==args.helper_sha for node in tree.body),
            'held builder helper pin differs')
    inputs.update(captured_static_inputs())
    for key,(relative,_) in STATIC_INPUTS.items():paths[key]=STUDIO/relative
    for name in ('bind-full-kit.ts','load-full-kit.ts','picking.ts'):
        key='runtime/'+name;paths[key]=STUDIO.parents[1]/'components/studio/scene'/name;inputs[key]=paths[key].read_bytes()
    parts,meta=helper.build_all(author['selectedPose'])
    require(meta['pose']==author['selectedPose'],'selected build returned different pose')
    rows=producer.snapshot_rows(parts,author['rows'],helper.corner_normals)
    layout=selected_layout_preflight(parts,author,rows)
    return producer,helper,author,inputs,paths,parts,rows,layout


def write_json(path,payload,exclusive=False):
    with path.open('x' if exclusive else 'w',encoding='utf-8',newline='\n') as file:
        json.dump(payload,file,indent=2,allow_nan=False);file.write('\n')


def selected_main(args):
    import sys
    producer,helper,author,inputs,paths,parts,rows,layout=selected_inputs(args)
    resources=windows_resources();estimate=384*1024**2;reserve=512*1024**2
    require(resources['availablePhysicalBytes']>=estimate+reserve,
            'insufficient free RAM for estimated 384 MiB process peak plus 512 MiB reserve')
    if args.preflight:
        print(json.dumps({'layout':layout,'sourceSha256':{k:producer.sha_bytes(v) for k,v in inputs.items()},
                          'resources':resources,'estimatedPeakBytes':estimate,'reservedHeadroomBytes':reserve,
                          'rowsCanonicalSha256':producer.payload_sha256(rows),'fullRunConsumed':False},indent=2))
        return
    folder=STUDIO/'asset-pipeline/full-kit/manifests'
    output=folder/'m4-v04-cpu-measurements.json'
    row_path=folder/'m4-v04-rows.json';declaration_path=folder/'m4-v04-verifier-declaration.json'
    require(not any(p.exists() for p in (output,row_path,declaration_path)),'full artifact exists; no implicit rerun or overwrite')
    fixture_path=STUDIO/'scene-coordination/m4-v04-producer-tests.json'
    fixture=json.loads(fixture_path.read_bytes())
    require(fixture.get('passed') is True,'fresh successful writer fixture receipt required')
    for key in ('measurement','producer','writerTests'):
        require(fixture['sourceHashes'][paths[key].name]==producer.sha_bytes(inputs[key]),'fixture source identity stale: '+key)
    paths['writerFixtureReceipt']=fixture_path;inputs['writerFixtureReceipt']=fixture_path.read_bytes()
    # This exclusive receipt creation marks the sole full run, including an interrupted/failed run.
    receipt={'schema':'m4-v04-selected-cpu-diagnostics/1','status':'running provisional selected-pose diagnostics',
             'candidateAcceptance':False,'independentExpectedDigestFreeze':False,'candidateAudit':False,
             'fullSelectedPoseRuns':1,'coarseComparisonRunsPreviouslyCompleted':1,
             'selectedPose':author['selectedPose'],'selectedPoseId':'P14','authorSelectionStatus':author['selectedPoseStatus'],
             'sourceSha256':{k:producer.sha_bytes(v) for k,v in inputs.items()},'layoutPreflight':layout,
             'invocation':{'entrypoint':'measure_fullkit_m4_v04.selected_main','argv':sys.argv,
                           'areaSamples':1536,'featureVertexCap':150,'controllerVertexCap':360},
             'resourceGate':{'before':resources,'estimatedProcessPeakBytes':estimate,'reservedHeadroomBytes':reserve,
                             'method':'sequential metrics; bounded contact batches; one ray at a time'},
             'completedModules':[],'limitations':['Writer measurements and source binding are not independent candidate acceptance.',
                 'No expected digest was independently frozen, and audit_m4_v3 was not called.',
                 'No Blender, export, browser, renderer or image validation performed.']}
    write_json(output,receipt,True);started=time.monotonic()
    def checkpoint(name,value):
        receipt[name]=value;receipt['completedModules'].append(name)
        receipt['resourcesLatest']=windows_resources();write_json(output,receipt)
        print(json.dumps({'completed':name,'seconds':round(time.monotonic()-started,2),
                          'workingSetMiB':receipt['resourcesLatest']['workingSetBytes']/1024**2}),flush=True)
        require(receipt['resourcesLatest']['availablePhysicalBytes']>=256*1024**2,'free RAM below 256 MiB stop reserve')
    try:
        product=producer.produce_selected(paths['helper'],args.helper_sha,paths['authorDeclarations'],args.author_sha)
        require(producer.canonical_bytes(product['rows'])==producer.canonical_bytes(rows),
                'named producer fails exact complete rows reproduction')
        reproduced=producer.produce_selected(paths['helper'],args.helper_sha,paths['authorDeclarations'],args.author_sha)
        require(producer.canonical_bytes(product)==producer.canonical_bytes(reproduced),'named producer is nondeterministic')
        del reproduced
        write_json(row_path,product['rows'],True);write_json(declaration_path,product['declaration'],True)
        checkpoint('producerReproduction',{'exactCompleteRowsMatch':True,'repeatedNamedProducerProductMatch':True,
                   'provenance':product['provenance'],'rowsFileSha256':producer.sha_bytes(row_path.read_bytes()),
                   'declarationFileSha256':producer.sha_bytes(declaration_path.read_bytes()),
                   'hashConvention':'canonical payload digests differ from indented artifact byte digests'})
        mapping=json.loads(inputs['mapping']);retained=retained_entries(inputs['parent'],mapping)
        utility=geometry_utilities(inputs['approvedGeometryUtilities'])
        checkpoint('supports',support_diagnostics(parts,author,utility))
        checkpoint('attachments',attachment_diagnostics(parts,author))
        checkpoint('inlays',inlay_diagnostics(parts,author))
        checkpoint('normals',normal_diagnostics(rows,author))
        checkpoint('edges',semantic_edge_diagnostics(rows,author))
        checkpoint('cables',cable_diagnostics(rows))
        checkpoint('budgets',budget_diagnostics(parts,rows,mapping,retained))
        checkpoint('views',coarse_views(helper,parts,author,author['selectedPose'],retained,mapping,area_count=1536))
        checkpoint('surfaceContacts',full_surface_contacts(parts,author,retained,receipt['attachments'],receipt['inlays']))
        checkpoint('runtimeEligibility',{'entries':[{'name':e['name'],'metadata':e['metadata'],
                    'eligibility':runtime_eligibility(e['name'],e['metadata'])} for e in retained+candidate_entries(parts,mapping)],
                    'assumptions':['Live ancestors visible, layers matching, material defaults from binder/loader.',
                                   'Project targets/borders excluded as blockers; no-hit is a separate category.',
                                   'Area samples measure uniform source surface area, not projected area or pixels.']})
        receipt['status']='complete provisional selected-pose writer diagnostics; independent disposition pending'
    except Exception as error:
        receipt['status']='incomplete selected-pose diagnostics; no rerun without coordinator disposition'
        receipt['failure']={'type':type(error).__name__,'message':str(error)}
        raise
    finally:
        receipt['sourcePinsUnchanged']={key:producer.sha_bytes(path.read_bytes())==producer.sha_bytes(inputs[key]) for key,path in paths.items()}
        receipt['elapsedSeconds']=time.monotonic()-started;receipt['resourceGate']['after']=windows_resources()
        if not all(receipt['sourcePinsUnchanged'].values()):receipt['status']='source drift; provisional evidence invalid for frozen handoff'
        write_json(output,receipt)
        print('cpuMeasurementsSha256='+producer.sha_bytes(output.read_bytes()),flush=True)


if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description='Bounded writer diagnostics only; no independent candidate audit.')
    mode=parser.add_mutually_exclusive_group(required=True)
    for flag in ('coarse','preflight','full'):mode.add_argument('--'+flag,action='store_true')
    for flag in ('helper-sha','author-sha','builder-sha','author-report-sha'):
        parser.add_argument('--'+flag,required=True)
    args=parser.parse_args()
    if args.coarse:coarse_main(args)
    else:selected_main(args)
