"""Pure, bounded source verifier. No file I/O, imports of builders, or mutations.

See m4-v03-verifier-declaration-contract-v3.json. An externally frozen declaration
digest and its rowsSha256 are mandatory. The digest binds complete payload
identity, not source derivation: a later independent integration receipt must
name the pinned producing sources and entrypoint and reproduce the exact rows.
That prerequisite is not satisfied here; this is not final GLB acceptance.
"""
import hashlib
import json
import math
import re

import numpy as np

SCHEMA = 'm4-source-declaration/3'
CLASSES = {'planar', 'round', 'bevel:casing', 'bevel:white_key_lip', 'out_of_scope'}
GAP_M = 0.0003
CLEARANCE_M = 0.020
HEIGHT_TOLERANCE_M = 0.000001
UNIT_TOLERANCE = 0.000001
GEOMETRY_TOLERANCE_M = 1e-9
COS_TWO_DEGREES = math.cos(math.radians(2))


def declaration_sha256(declaration):
    encoded = json.dumps(declaration, sort_keys=True, separators=(',', ':'),
                         ensure_ascii=False, allow_nan=False).encode('utf-8')
    return hashlib.sha256(encoded).hexdigest()


def rows_sha256(rows):
    """Hash the complete finite JSON-native payload; no coercion or field filter.

    Encoding is CPython 3.11 json.dumps with sorted string keys, compact
    separators, ensure_ascii=False and allow_nan=False, then strict UTF-8.
    Lists retain order; integers/floats (including signed zero) retain the
    encoder's spelling. Non-JSON types and nonfinite floats reject.
    """
    def finite_json(value):
        kind = type(value)
        if value is None or kind in (str, bool, int):
            return
        if kind is float:
            if not math.isfinite(value):
                raise ValueError('nonfinite rows component')
            return
        if kind is list:
            for item in value:
                finite_json(item)
            return
        if kind is dict:
            for key, item in value.items():
                if type(key) is not str:
                    raise TypeError('rows object keys must be strings')
                finite_json(item)
            return
        raise TypeError('rows payload must use JSON-native types')
    finite_json(rows)
    return declaration_sha256(rows)


class CoverageError(ValueError):
    def __init__(self, code, location):
        self.code, self.location = code, location
        super().__init__(f'{code}: {location}')


def require(condition, code, location):
    if not condition:
        raise CoverageError(code, location)


def integer(value):
    return type(value) is int


def named_list(value, location):
    require(isinstance(value, list), 'invalidList', location)
    out = {}
    for item in value:
        require(isinstance(item, dict), 'invalidRecord', location)
        name = item.get('id')
        require(isinstance(name, str) and bool(name.strip()), 'invalidIdentity', location)
        require(name not in out, 'duplicateIdentity', f'{location}/{name}')
        out[name] = item
    return out


def cross2(a, b):
    return float(a[0]*b[1] - a[1]*b[0])


def convex_hull(points):
    """Full primitive projection: vertices, boundary edges and enclosed area."""
    pts = sorted(set(tuple(float(x) for x in p) for p in points))
    if len(pts) <= 2:
        return np.array(pts, dtype=float)
    def half(seq):
        out = []
        for p in seq:
            while len(out) > 1 and cross2(np.subtract(out[-1], out[-2]), np.subtract(p, out[-1])) <= 0:
                out.pop()
            out.append(p)
        return out
    return np.array(half(pts)[:-1] + half(reversed(pts))[:-1], dtype=float)


def convex_boundary(points, location):
    p = np.asarray(points, dtype=float)
    require(p.ndim == 2 and p.shape[1] == 2 and len(p) >= 3 and np.isfinite(p).all(), 'invalidBoundary', location)
    hull = convex_hull(p)
    require(len(hull) >= 3 and len({tuple(x) for x in p}) == len(p), 'degenerateBoundary', location)
    # Comparing the actual boundary to its hull rejects concavity and crossed
    # vertex order. Collinear intermediate vertices are allowed in either winding.
    area = sum(cross2(p[i], p[(i+1) % len(p)]) for i in range(len(p))) / 2
    require(abs(area) > 0, 'degenerateBoundary', location)
    if area < 0:
        p = p[::-1]
    turns = [cross2(p[(i+1) % len(p)]-p[i], p[(i+2) % len(p)]-p[(i+1) % len(p)]) for i in range(len(p))]
    hull_area = sum(cross2(hull[i], hull[(i+1) % len(hull)]) for i in range(len(hull))) / 2
    require(min(turns) >= -1e-14 and abs(abs(area)-hull_area) <= 1e-12,
            'nonConvexOrCrossedBoundary', location)
    require(all(np.linalg.norm(p[(i+1) % len(p)]-p[i]) > 0 for i in range(len(p))), 'degenerateBoundary', location)
    return p


def point_inside(p, polygon):
    return all(cross2(b-a, p-a) >= -1e-14 for a, b in polygon_edges(polygon))


def polygon_edges(p):
    if len(p) == 1:
        return [(p[0], p[0])]
    if len(p) == 2:
        return [(p[0], p[1])]
    return [(p[i], p[(i+1) % len(p)]) for i in range(len(p))]


def point_segment_distance(p, a, b):
    d = b-a
    length2 = float(np.dot(d, d))
    t = min(1., max(0., float(np.dot(p-a, d))/length2)) if length2 else 0.
    return float(np.linalg.norm(p-(a+t*d)))


def segment_distance(a, b, c, d):
    # Intersecting, touching and collinear segments all have distance zero.
    ab, cd = b-a, d-c
    denominator = cross2(ab, cd)
    if denominator:
        t, u = cross2(c-a, cd)/denominator, cross2(c-a, ab)/denominator
        if 0 <= t <= 1 and 0 <= u <= 1:
            return 0.
    return min(point_segment_distance(a, c, d), point_segment_distance(b, c, d),
               point_segment_distance(c, a, b), point_segment_distance(d, a, b))


def footprint_clearance(footprint, boundary, side):
    """Signed polygon clearance, including edge crossings and enclosure.

    Positive means wholly on the requested side, zero means touching/crossing,
    negative means wholly/partly on the wrong side without a boundary crossing.
    Input footprint is reduced to its conservative convex hull, not just points.
    """
    require(side in ('inside', 'outside'), 'invalidClearanceSide', 'footprint')
    p = np.asarray(footprint, dtype=float)
    require(p.ndim == 2 and p.shape[1] == 2 and len(p) > 0 and np.isfinite(p).all(), 'invalidFootprint', 'footprint')
    hull = convex_hull(p)
    boundary = convex_boundary(boundary, 'boundary')
    distance = min(segment_distance(a, b, c, d) for a, b in polygon_edges(hull) for c, d in polygon_edges(boundary))
    inside = [point_inside(p, boundary) for p in hull]
    encloses = len(hull) >= 3 and any(point_inside(p, hull) for p in boundary)
    if distance <= 1e-14:
        return {'signedClearanceM': 0., 'relation': 'touching_or_crossing'}
    if all(inside):
        return {'signedClearanceM': distance if side == 'inside' else -distance, 'relation': 'inside'}
    if any(inside) or encloses:
        return {'signedClearanceM': -distance, 'relation': 'overlapping_or_enclosing'}
    return {'signedClearanceM': distance if side == 'outside' else -distance, 'relation': 'outside'}


def validate_coverage(rows, decl, expected_digest, sources):
    require(isinstance(decl, dict), 'missingDeclaration', 'declaration')
    require(decl.get('schema') == SCHEMA and decl.get('scope') in ('fixture', 'candidate'), 'invalidDeclarationSchema', 'declaration')
    require(isinstance(expected_digest, str) and re.fullmatch('[0-9a-f]{64}', expected_digest), 'missingDeclarationPin', 'declaration')
    require(declaration_sha256(decl) == expected_digest, 'declarationPinMismatch', 'declaration')
    required_sources = decl.get('sources')
    require(isinstance(required_sources, dict) and bool(required_sources) and isinstance(sources, dict), 'missingSources', 'sources')
    require(required_sources.keys() == sources.keys(), 'sourceSetMismatch', 'sources')
    for name, digest in required_sources.items():
        require(isinstance(name, str) and bool(name) and isinstance(digest, str) and re.fullmatch('[0-9a-f]{64}', digest), 'invalidSourcePin', 'sources')
        require(isinstance(sources[name], bytes) and hashlib.sha256(sources[name]).hexdigest() == digest, 'sourcePinMismatch', name)
    rows_pin = decl.get('rowsSha256')
    require(isinstance(rows_pin, str) and re.fullmatch('[0-9a-f]{64}', rows_pin), 'missingOrInvalidRowsPin', 'rowsSha256')
    try:
        actual_rows_pin = rows_sha256(rows)
    except (TypeError, ValueError, OverflowError, RecursionError):
        raise CoverageError('invalidRowsEncoding', 'rows') from None
    require(actual_rows_pin == rows_pin, 'rowsPinMismatch', 'rows')
    expected_rows = named_list(decl.get('rows'), 'rows')
    require(bool(expected_rows) and isinstance(rows, dict) and rows.keys() == expected_rows.keys(), 'rowSetMismatch', 'rows')
    group_maps = {}
    arrays = {}
    for row, spec in expected_rows.items():
        data = rows[row]
        require(isinstance(data, dict), 'invalidRow', row)
        n, f = spec.get('vertexCount'), spec.get('faceCount')
        require(integer(n) and n > 0 and integer(f) and f > 0, 'invalidCounts', row)
        V = np.asarray(data.get('vertices'), dtype=float)
        F = data.get('faces')
        require(V.shape == (n, 3) and np.isfinite(V).all(), 'invalidVertices', row)
        require(isinstance(F, list) and len(F) == f, 'faceCountMismatch', row)
        for fi, face in enumerate(F):
            require(isinstance(face, list) and len(face) >= 3 and all(integer(v) and 0 <= v < n for v in face), 'invalidFace', f'{row}/{fi}')
        expected_groups = named_list(spec.get('groups'), row+'/expectedGroups')
        live_groups = named_list(data.get('groups'), row+'/groups')
        require(expected_groups.keys() == live_groups.keys(), 'groupSetMismatch', row)
        require(bool(expected_groups), 'missingGroups', row)
        classes = spec.get('faceClasses')
        live_classes = data.get('faceClasses')
        require(isinstance(classes, list) and len(classes) == f and all(isinstance(c, str) and c in CLASSES for c in classes), 'invalidExpectedClasses', row)
        require(isinstance(live_classes, list) and len(live_classes) == f and all(isinstance(c, str) and c in CLASSES for c in live_classes), 'invalidClasses', row)
        require(classes == live_classes, 'classMismatch', row)
        require(type(spec.get('normalsRequired')) is bool, 'missingNormalScope', row)
        vc, fc = np.zeros(n, dtype=int), np.zeros(f, dtype=int)
        for name, g in expected_groups.items():
            live = live_groups[name]
            require(g == live, 'groupDeclarationMismatch', row+'/'+name)
            vr, fr = g.get('vertexRange'), g.get('faceRange')
            require(isinstance(vr, list) and len(vr) == 2 and all(integer(v) for v in vr) and 0 <= vr[0] < vr[1] <= n,
                    'invalidVertexRange', row+'/'+name)
            require(isinstance(fr, list) and len(fr) == 2 and all(integer(v) for v in fr) and 0 <= fr[0] < fr[1] <= f,
                    'invalidFaceRange', row+'/'+name)
            require(g.get('n1') in ('in_scope', 'out_of_scope') and isinstance(g.get('reason'), str) and bool(g['reason'].strip()),
                    'missingGroupMeaning', row+'/'+name)
            require(integer(g.get('triangleCount')) and g['triangleCount'] == sum(len(face)-2 for face in F[fr[0]:fr[1]]),
                    'groupTriangleCountMismatch', row+'/'+name)
            vc[vr[0]:vr[1]] += 1; fc[fr[0]:fr[1]] += 1
            for fi in range(*fr):
                require(all(vr[0] <= v < vr[1] for v in F[fi]), 'faceOutsideGroupVertices', f'{row}/{fi}')
                inside = g['n1'] == 'in_scope'
                require((classes[fi] != 'out_of_scope') == inside, 'classScopeMismatch', f'{row}/{fi}')
                require(not inside or spec['normalsRequired'], 'unverifiedNormalScope', row+'/'+name)
        require(bool(np.all(vc == 1)) and bool(np.all(fc == 1)), 'incompleteOrOverlappingGroupCoverage', row)
        group_maps[row], arrays[row] = expected_groups, (V, F)
    surfaces = named_list(decl.get('surfaces'), 'surfaces')
    surface_data = {}
    for name, s in surfaces.items():
        kind, row, fi = s.get('kind'), s.get('boundaryRow'), s.get('boundaryFace')
        require(kind in ('rug_field', 'bare_floor') and isinstance(row, str) and row in arrays, 'invalidSurfaceReference', name)
        V, F = arrays[row]
        require(integer(fi) and 0 <= fi < len(F), 'invalidSurfaceFace', name)
        P = V[F[fi]]
        require(float(np.ptp(P[:, 2])) <= GEOMETRY_TOLERANCE_M, 'nonHorizontalReceivingBoundary', name)
        polygon = convex_boundary(P[:, :2], name)
        surface_data[name] = (kind, polygon, float(P[0, 2]) if kind == 'rug_field' else 0.)
    supports = named_list(decl.get('supports'), 'supports')
    used_groups, row_surfaces = set(), {}
    for name, s in supports.items():
        row, group, surface = s.get('row'), s.get('group'), s.get('surface')
        require(isinstance(row, str) and row in group_maps and isinstance(group, str) and group in group_maps[row], 'unknownSupportPrimitive', name)
        require(isinstance(surface, str) and surface in surface_data, 'missingOrUnknownReceivingSurface', name)
        require((row, group) not in used_groups, 'duplicateSupportPrimitive', name)
        used_groups.add((row, group))
        row_surfaces.setdefault(row, set()).add(surface)
    require(all(len(s) == 1 for s in row_surfaces.values()), 'mixedReceivingSurfaces', 'supports')
    return expected_rows, group_maps, arrays, supports, surface_data


def audit_supports(groups, arrays, supports, surfaces):
    records, errors = {}, []
    for name, support in supports.items():
        row, group, surface = support['row'], support['group'], support['surface']
        lo, hi = groups[row][group]['vertexRange']
        V = arrays[row][0][lo:hi]
        kind, boundary, height = surfaces[surface]
        hull = convex_hull(V[:, :2])
        clearance = footprint_clearance(hull, boundary, 'inside' if kind == 'rug_field' else 'outside')
        gap = float(V[:, 2].min())-height
        error = gap-GAP_M
        valid_height = abs(error) <= HEIGHT_TOLERANCE_M
        valid_clearance = clearance['signedClearanceM'] >= CLEARANCE_M-GEOMETRY_TOLERANCE_M
        if not valid_height:
            errors.append({'code': 'liftedSupport' if error > 0 else 'penetratingSupport', 'location': name, 'signedGapErrorM': error})
        if not valid_clearance:
            errors.append({'code': 'insufficientFootprintClearance', 'location': name, **clearance})
        records[name] = {'row': row, 'group': group, 'surface': surface, 'footprintHullXY': hull.tolist(),
                         'surfaceZ': height, 'gapM': gap, 'signedGapErrorM': error, **clearance,
                         'valid': valid_height and valid_clearance}
    return {'status': 'checked', 'valid': not errors, 'errors': errors, 'supports': records}


def audit_normals(rows, specs, arrays):
    records, errors = {}, []
    for row, spec in specs.items():
        if not spec['normalsRequired']:
            records[row] = {'status': 'explicitly_out_of_scope'}
            continue
        V, F = arrays[row]
        normals = rows[row].get('cornerNormals')
        local_errors = []
        planar = 0
        triangles = 0
        max_angle = 0.
        if not isinstance(normals, list) or len(normals) != len(F):
            errors.append({'code': 'missingOrInvalidCornerNormals', 'location': row})
            records[row] = {'status': 'invalid_normal_array'}
            continue
        for fi, face in enumerate(F):
            try:
                N = np.asarray(normals[fi], dtype=float)
            except (TypeError, ValueError, OverflowError):
                N = np.empty((0, 3))
            valid = N.shape == (len(face), 3)
            lengths = np.linalg.norm(N, axis=1) if valid else np.array([])
            valid = bool(valid and np.isfinite(N).all() and np.all(np.abs(lengths-1) <= UNIT_TOLERANCE))
            if not valid:
                local_errors.append({'code': 'invalidCornerNormal', 'location': f'{row}/{fi}'})
            P = V[face]
            is_planar = spec['faceClasses'][fi] == 'planar'
            reference = None
            for i in range(1, len(face)-1):
                triangles += 1
                cross = np.cross(P[i]-P[0], P[i+1]-P[0])
                length = float(np.linalg.norm(cross))
                if not math.isfinite(length) or length == 0:
                    local_errors.append({'code': 'degenerateTriangle', 'location': f'{row}/{fi}/{i-1}'})
                    continue
                g = cross/length
                if not is_planar:
                    continue
                planar += 1
                if reference is None:
                    reference = g
                    if np.max(np.abs((P-P[0]) @ g)) > GEOMETRY_TOLERANCE_M:
                        local_errors.append({'code': 'nonPlanarDeclaredPanel', 'location': f'{row}/{fi}'})
                if not valid:
                    continue
                for corner in (0, i, i+1):
                    dot = float(np.dot(N[corner]/lengths[corner], g))
                    angle = math.degrees(math.acos(max(-1., min(1., dot))))
                    max_angle = max(max_angle, angle)
                    if dot < COS_TWO_DEGREES:
                        local_errors.append({'code': 'planarCornerAngle', 'location': f'{row}/{fi}/{i-1}/{corner}', 'degrees': angle})
        records[row] = {'status': 'checked', 'valid': not local_errors, 'triangles': triangles,
                        'planarTriangles': planar, 'maxPlanarCornerDegrees': max_angle, 'errorCount': len(local_errors)}
        errors.extend(local_errors)
    return {'status': 'checked', 'valid': not errors, 'errors': errors, 'rows': records}


def audit_m4_v3(rows, declaration, *, expected_declaration_sha256, source_bytes):
    """Check one externally pinned scope; return JSON-safe evidence, never approve it."""
    result = {'valid': False, 'scope': declaration.get('scope', 'unknown') if isinstance(declaration, dict) else 'unknown',
              'candidateAcceptance': False, 'coverage': {'valid': False, 'errors': []},
              'supportGeometry': {'status': 'not_run', 'valid': False, 'errors': [], 'supports': {}},
              'normalValidity': {'status': 'not_run', 'valid': False, 'errors': [], 'rows': {}}}
    # Do not echo arbitrary malformed values into a nominally JSON-safe result.
    if result['scope'] not in ('fixture', 'candidate'):
        result['scope'] = 'unknown'
    try:
        specs, groups, arrays, supports, surfaces = validate_coverage(rows, declaration, expected_declaration_sha256, source_bytes)
    except CoverageError as error:
        result['coverage']['errors'].append({'code': error.code, 'location': error.location})
        return result
    except (TypeError, ValueError, KeyError, IndexError, OverflowError):
        result['coverage']['errors'].append({'code': 'malformedInput', 'location': 'declaration_or_rows'})
        return result
    result['coverage']['valid'] = True
    result['supportGeometry'] = audit_supports(groups, arrays, supports, surfaces)
    result['normalValidity'] = audit_normals(rows, specs, arrays)
    # Finite input components can still overflow derived distances. Keep that
    # failure in its own section and never emit non-JSON Infinity/NaN evidence.
    for section, detail_key in (('supportGeometry', 'supports'), ('normalValidity', 'rows')):
        try:
            json.dumps(result[section], allow_nan=False)
        except (ValueError, OverflowError):
            result[section] = {'status': 'checked', 'valid': False,
                               'errors': [{'code': 'nonFiniteDerivedMeasurement', 'location': section}], detail_key: {}}
    result['valid'] = result['supportGeometry']['valid'] and result['normalValidity']['valid']
    return result
