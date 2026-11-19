"""Independent M4 v03 CPU evidence; writes only its own JSON, never artist inputs.

python -B design/studio-v2/scene-coordination/m4-v03-cpu-verification.py --reproduce
python -B design/studio-v2/scene-coordination/m4-v03-cpu-verification.py --checks
python -B design/studio-v2/scene-coordination/m4-v03-cpu-verification.py --adequacy
python -B design/studio-v2/scene-coordination/m4-v03-cpu-verification.py --edge-reasons
python -B design/studio-v2/scene-coordination/m4-v03-cpu-verification.py --finalize
Run reproduction only once; checks reuse that receipt and do not rerun the grid.
"""
import contextlib
import copy
import hashlib
import importlib.util
import io
import json
import math
from pathlib import Path
import sys
import time
import traceback

import numpy as np

STUDIO = Path(__file__).resolve().parents[1]
KIT = STUDIO / 'asset-pipeline/full-kit'
OUT = Path(__file__).with_suffix('.json')
PINS = {
    'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v03.py': '3b220b1d4614a8111247270b21771c5f2280493c16e3ab986603a24efcffaf37',
    'asset-pipeline/full-kit/source/build_fullkit_m4_v03.py': '53fa310f1144c46916b0ce63f05188818861e63fe9c32abbf4fb3f1596872b84',
    'asset-pipeline/full-kit/source/measure_fullkit_m4_v03.py': '9a3a098195e99b889ecee8b2213c9acc6a9dc50af68e1ae35e507e09b1b0bff5',
    'asset-pipeline/full-kit/manifests/m4-v03-cpu-preparation.json': 'd7196145a8665abefdf41b3235f3be8ec91aa7474b3c71fed2186d7537e20253',
    'scene-m4-v03-preparation-report.md': 'b21b6f2b7b6b97786b4da8a34d59b114e2daf6fe5ffb5ae7d49c4117ecc3abc3',
    'scene-coordination/m4-v03-normal-check-contract-review.md': 'cc7812bd57027365bb6e61064eabea6564c7c20aa7eec8c2f9d3b8e07312a3fc',
    'scene-coordination/m4-model-contract.json': '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98',
    'asset-pipeline/full-kit/source/build_fullkit_m4.py': 'aa9724dcd14dbc428ca5c2ba84cffdcbb469fa14c53cf3866ac46164ec04dc22',
    'asset-pipeline/full-kit/source/build_fullkit_m4_geometry.py': 'c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0',
    'asset-pipeline/full-kit/source/fk-40-music-proposal-v01.blend': '0ae40460b9a2cb578fc35a96497a9016e5f116a1efe98cac4809568fd68c4665',
    'asset-pipeline/full-kit/exports/studio-full-kit-m4-proposal-v01.raw-export.glb': 'c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906',
    'asset-pipeline/full-kit/exports/studio-full-kit-m4-proposal-v02.glb': 'baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f',
    'asset-pipeline/full-kit/manifests/studio-full-kit-m4-proposal-v02.manifest.json': '42597f1b859fdae354063e09ee925d4d2dc9be8ae0ac8556663e391db6906b82',
    'asset-pipeline/full-kit/manifests/m4-v01-tier-ledger.json': '63848642fde09d4d5762c9c5054129c22df51f0838bcc8f1b7c450fd80ffae63',
    'asset-pipeline/full-kit/source/render_m4_v01_evidence.py': 'bfa6fc9bf22707dc08f44f0bd4a7033e3817d54d2d142d5dea7a969fca161e18',
    'asset-pipeline/full-kit/m4-author-report.md': '93d7c5c124a846240173b0a04fed1dffd4fb9743e15971d3ea41a966feb3ee79',
    'scene-coordination/m4-transition-guard.py': 'ad62627f0683806ace2c8ebbb133ba83e72c7d95f1df8adc291a3706aa40da6b',
    'asset-pipeline/full-kit/asset-inventory.json': 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87',
    'asset-pipeline/full-kit/full-kit-profile-v1.json': '7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052',
    'asset-pipeline/full-kit/exports/studio-full-kit-m3-proposal-v03.glb': 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf',
    'asset-pipeline/full-kit/manifests/studio-full-kit-m3-proposal-v03.manifest.json': '060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405',
    'asset-pipeline/full-kit/export-ledger-v01.json': '26b4c143f64f6880f012c316e81f124fe899b69312b61866531e6bf884320775',
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def hashes():
    result = {p: sha(STUDIO / p) for p in PINS}
    assert result == PINS, {p: h for p, h in result.items() if h != PINS[p]}
    return result


def load_measure():
    path = KIT / 'source/measure_fullkit_m4_v03.py'
    spec = importlib.util.spec_from_file_location('independent_m4_author_measure', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def differences(a, b, path=''):
    if type(a) is not type(b):
        return [path]
    if isinstance(a, dict):
        return ([path + '/keys'] if a.keys() != b.keys() else []) + [p for k in a.keys() & b.keys() for p in differences(a[k], b[k], path + '/' + k)]
    if isinstance(a, list):
        return ([path + '/length'] if len(a) != len(b) else []) + [p for i, (x, y) in enumerate(zip(a, b)) for p in differences(x, y, f'{path}/{i}')]
    return [] if a == b else [path]


def save(rec):
    OUT.write_text(json.dumps(rec, indent=2, allow_nan=False) + '\n', encoding='utf-8')


def reproduce():
    if OUT.exists():
        raise RuntimeError('Existing evidence: refuse to repeat full reproduction')
    rec = {'schema': 'm4-v03-independent-cpu-verification/v1', 'task': 'task_570136a24c70',
           'scope': 'Source CPU verification only; no Blender/export/render/runtime acceptance',
           'hashesBefore': hashes(), 'reproductionRunnerSha256': sha(Path(__file__))}
    save(rec)
    class Capture(io.StringIO):
        json_started = False
        def write(self, value):
            if 'JSON-BEGIN' in value:
                self.json_started = True
            if not self.json_started:
                sys.__stdout__.write(value)
                sys.__stdout__.flush()
            return super().write(value)
    captured = Capture()
    old_argv = sys.argv
    started = time.monotonic()
    try:
        m = load_measure()
        sys.argv = [str(KIT / 'source/measure_fullkit_m4_v03.py'), '--print']
        with contextlib.redirect_stdout(captured):
            m.main()
        preamble, text = captured.getvalue().split('JSON-BEGIN\n', 1)
        actual = json.loads(text)
        expected = json.loads((KIT / 'manifests/m4-v03-cpu-preparation.json').read_text())
        a, b = copy.deepcopy(actual), copy.deepcopy(expected)
        a.pop('elapsedSeconds'); b.pop('elapsedSeconds')
        delta = differences(a, b)
        rec['reproduction'] = {'passed': not delta, 'differencesExceptElapsedSeconds': delta,
                               'elapsedSeconds': time.monotonic() - started, 'stdoutPreamble': preamble,
                               'actualReceipt': actual}
    except BaseException:
        rec['reproduction'] = {'passed': False, 'error': traceback.format_exc(), 'stdout': captured.getvalue()}
        raise
    finally:
        sys.argv = old_argv
        rec['hashesAfterReproduction'] = hashes()
        save(rec)
    print(json.dumps({'receiptMatchedExceptElapsed': not delta, 'differences': delta, 'seconds': time.monotonic() - started}))


# Primitive ordinals follow inspected construction, never a row-minimum selection.
# Entire projected primitive is conservative for cylindrical supports.
SUPPORTS = {
    'ctl_stand__frame': [3, 4, 5, 9, 10, 11],
    'ctl_sustain_pedal__pedal': [0],
    'stool_keys__stool': [5, 7, 9, 11],
    'drum_rack__rack': [1, 2, 3, 16, 17, 18],
    'drum_kick__tower': [1, 6],
    'drum_hihat_pedal__pedal': [0],
    'drum_throne__throne': [6, 9, 12],
}


def vertices(part, gi):
    _, v0, v1, _, _ = part.groups[gi]
    return np.asarray(part.v[v0:v1], float)


def polygon_margin(points, polygon):
    """Signed distance to every inward edge of a convex CCW field polygon.

    Requiring >=20mm for every footprint vertex keeps the whole convex hull
    inside the field eroded by 20mm, including the authored rounded corners.
    """
    a, b = polygon, np.roll(polygon, -1, axis=0)
    d = b - a
    return np.min((d[:, 0] * (points[:, None, 1] - a[:, 1]) -
                   d[:, 1] * (points[:, None, 0] - a[:, 0])) / np.linalg.norm(d, axis=1), axis=1)


def support_audit(G, parts, extra=None):
    rug = parts['rug__rug']
    field_face = rug.f[-1][0]
    field = np.asarray(rug.v)[list(field_face)]
    field_z = float(field[:, 2].mean())
    assert np.ptp(field[:, 2]) == 0
    specs = SUPPORTS | (extra or {})
    out = {}
    for row, groups in specs.items():
        records = []
        for gi in groups:
            points = vertices(parts[row], gi)
            clearance = float(polygon_margin(points[:, :2], field[:, :2]).min())
            gap = float(points[:, 2].min() - field_z)
            error = gap - 0.0003
            records.append({'primitive': gi, 'label': parts[row].groups[gi][0],
                            'xyMin': points[:, :2].min(0).tolist(), 'xyMax': points[:, :2].max(0).tolist(),
                            'fieldClearanceM': clearance, 'gapM': gap, 'signedGapErrorM': error,
                            'pass': clearance >= .020 and abs(error) < 1e-9})
        out[row] = {'supports': records, 'allPass': all(r['pass'] for r in records)}
    return {'fieldZ': field_z, 'fieldPolygon': field.tolist(), 'rows': out,
            'allPass': all(r['allPass'] for r in out.values())}


def expected_scope(part, gi):
    lab, _, _, _, _ = part.groups[gi]
    return (lab in {'ctl.slab', 'ctl.panel', 'ctl.bays', 'ctl.cheeks', 'sustain.base', 'sustain.plate',
                    'kick.tower', 'kick.base', 'hihat.base', 'hihat.housing', 'module.case'} or
            (lab.startswith('pad.') and lab.endswith('.shell')) or
            (part.row == 'ctl_keys__keys' and gi < 58 and gi % 2 == 0))


def class_audit(part):
    coverage = [[] for _ in part.f]
    errors = []
    for gi, (lab, v0, v1, f0, f1) in enumerate(part.groups):
        if not (0 <= f0 < f1 <= len(part.f) and 0 <= v0 < v1 <= len(part.v)):
            errors.append(['range', gi]); continue
        for fi in range(f0, f1):
            coverage[fi].append(gi)
            if not all(v0 <= v < v1 for v in part.f[fi][0]):
                errors.append(['vertexGroupMismatch', fi])
            cls = part.cls[fi] if fi < len(part.cls) else None
            if expected_scope(part, gi) and cls not in ('planar', 'round', 'bevel:casing', 'bevel:white_key_lip'):
                errors.append(['missingOrInvalidClass', fi])
    errors += [['ambiguousOrMissingGroup', fi, len(g)] for fi, g in enumerate(coverage) if len(g) != 1]
    if len(part.cls) != len(part.f):
        errors.append(['classArrayLength'])
    return errors


def normal_audit(part, normals):
    errors = class_audit(part)
    V = np.asarray(part.v, float)
    planar_tris = 0
    all_tris = 0
    maximum = 0.0
    minimum_area = math.inf
    for fi, (f, _) in enumerate(part.f):
        for v in f:
            n = np.asarray(normals.get((fi, v), (math.nan,) * 3))
            if not np.isfinite(n).all() or abs(np.linalg.norm(n) - 1) > 1e-9:
                errors.append(['invalidNormal', fi, v])
        for i in range(1, len(f) - 1):
            inds = [f[0], f[i], f[i+1]]
            p = V[inds]
            cross = np.cross(p[1] - p[0], p[2] - p[0])
            length = float(np.linalg.norm(cross))
            all_tris += 1
            if not math.isfinite(length) or length == 0:
                errors.append(['degenerateTriangle', fi, i]); continue
            if part.cls[fi] != 'planar':
                continue
            planar_tris += 1
            minimum_area = min(minimum_area, length / 2)
            g = cross / length
            for v in inds:
                n = np.asarray(normals[(fi, v)])
                dot = float(np.dot(n / np.linalg.norm(n), g))
                maximum = max(maximum, math.degrees(math.acos(np.clip(dot, -1, 1))))
                if dot < math.cos(math.radians(2)):
                    errors.append(['planarCorner', fi, i, v, dot])
    return {'errors': errors, 'planarTriangles': planar_tris, 'allTriangles': all_tris,
            'maximumPlanarCornerDegrees': maximum,
            'minimumPlanarTriangleAreaM2': minimum_area if planar_tris else None}


def local_points(G, P, M):
    return (np.linalg.inv(M) @ np.c_[P, np.ones(len(P))].T).T[:, :3]


def counts_dimensions(G, parts, contract):
    mapping = {r['leaf']: r for r in contract['addedRows']}
    assert set(mapping) == set(parts) and len(parts) == 18
    rows = {}
    for row, p in parts.items():
        r = mapping[row]
        triangles = sum(len(face) - 2 for face, _ in p.f)
        assert (p.asset, p.mat, p.ceiling, p.casts) == (r['assetId'], r['material'], r['placedTriangles'], r['castShadow'])
        assert r['receiveShadow'] and r['doubleSided'] and r['alphaMode'] == 'OPAQUE'
        assert triangles <= r['placedTriangles']
        rows[row] = {'triangles': triangles, 'ceiling': r['placedTriangles'], 'casts': p.casts,
                     'material': p.mat, 'boundsMin': np.min(p.v, axis=0).tolist(), 'boundsMax': np.max(p.v, axis=0).tolist()}
    totals = {'main': len(parts), 'casters': sum(p.casts for p in parts.values()),
              'refresh': sum(1 + p.casts for p in parts.values()), 'placed': sum(r['triangles'] for r in rows.values()),
              'refreshTriangles': sum(r['triangles'] * (1 + r['casts']) for r in rows.values())}
    assert totals == dict(main=18, casters=9, refresh=27, placed=13752, refreshTriangles=24404)
    keys = parts['ctl_keys__keys']
    assert len(keys.groups) == 78  # 29 independent front/stem pairs plus 20 black keys
    fronts = [local_points(G, vertices(keys, 2 * i), G.MC) for i in range(29)]
    widths = [np.ptp(p[:, 0]) for p in fronts]
    centers = [(p[:, 0].min() + p[:, 0].max()) / 2 for p in fronts]
    gaps = [fronts[i + 1][:, 0].min() - fronts[i][:, 0].max() for i in range(28)]
    lips = []
    for i, p in enumerate(fronts):
        yf, top = p[:, 1].min(), p[:, 2].max()
        lip_z = top - p[np.isclose(p[:, 1], yf, atol=1e-10), 2].max()
        lip_y = p[np.isclose(p[:, 2], top, atol=1e-10), 1].min() - yf
        f0, f1 = keys.groups[2*i][3:]
        assert keys.cls[f0:f1].count('bevel:white_key_lip') == 2
        assert lip_z >= .003 and lip_y >= .003
        lips.append([float(lip_y), float(lip_z)])
    assert np.allclose(widths, .026) and np.allclose(np.diff(centers), .0294) and np.allclose(gaps, .0034)
    kv = local_points(G, np.asarray(keys.v), G.MC)
    assert kv[:, 0].min() > -.473 and kv[:, 0].max() < .473
    assert abs(kv[:, 2].min() - .0303) < 1e-9
    shell = local_points(G, np.asarray(parts['ctl_body__shell'].v), G.MC)
    rack = parts['drum_rack__rack']
    frame = np.concatenate([vertices(rack, i) for i, g in enumerate(rack.groups) if g[0] == 'rack.frame'])
    booms = np.concatenate([vertices(rack, i) for i, g in enumerate(rack.groups) if g[0] == 'rack.frame' or g[0].startswith('rack.boom.')])
    supports = np.concatenate([vertices(rack, i) for i in SUPPORTS[rack.row]])
    margins = [supports[:, 0].min()-G.RUG['x0'], G.RUG['x1']-supports[:, 0].max(),
               supports[:, 1].min()-G.RUG['y0'], G.RUG['y1']-supports[:, 1].max()]
    assert min(margins) >= .150
    h = G.HIHAT_PEDAL
    hbase = local_points(G, vertices(parts['drum_hihat_pedal__pedal'], 0), G.T(h['cx'], h['cy'], G.ON_RUG) @ G.Rz(h['yaw']))
    cable_diameters = []
    for i in range(len(parts['music_cables__runs'].groups)):
        ring = vertices(parts['music_cables__runs'], i)[:5]
        cable_diameters.append(float(2*np.linalg.norm(ring - ring.mean(0), axis=1).mean()))
    assert len(cable_diameters) == 8 and np.allclose(cable_diameters, .006)
    return {'rows': rows, 'weightedStage': totals, 'dimensions': {
        'controllerEnvelope': np.ptp(shell, axis=0).tolist(), 'standOwnHeight': float(np.ptp(np.asarray(parts['ctl_stand__frame'].v)[:, 2])),
        'whiteKeys': 29, 'blackKeys': 20, 'pitchRange': [float(x) for x in (min(np.diff(centers)), max(np.diff(centers)))],
        'widthRange': [float(min(widths)), float(max(widths))], 'gapRange': [float(min(gaps)), float(max(gaps))],
        'whiteKeyLipsXY': lips, 'keysLocalMin': kv.min(0).tolist(), 'keysLocalMax': kv.max(0).tolist(),
        'rackFrameIncludingClamps': np.ptp(frame, axis=0).tolist(), 'rackFrameAndBooms': np.ptp(booms, axis=0).tolist(),
        'rackWholeRow': np.ptp(np.asarray(rack.v), axis=0).tolist(), 'rackMarginsLeftRightFrontBack': margins,
        'hihatBaseLocalDimensions': np.ptp(hbase, axis=0).tolist(), 'musicCableDiameters': cable_diameters}}


def adequacy_checks():
    """Additional small controls, no search/grid and no writer imports."""
    rec = json.loads(OUT.read_text())
    hashes()
    m = load_measure(); G = m.G3
    parts, _ = G.build_all()
    rays = m.Rays(parts)
    out = {'features': {}, 'targets': {}, 'sameAssetSkippedRowPairs': {}}
    for name, (row, cond) in m.FEATURES.items():
        points = [v for v in parts[row].v if cond(v)]
        sample = points[::max(1, len(points)//150)]
        hits = rays.first(sample)
        out['features'][name] = {'samples': len(sample), 'strictOwnRowHits': hits.count(row),
            'noHitCountedUnobstructed': hits.count(None), 'authorFraction': (hits.count(row)+hits.count(None))/len(sample)}
        expected = rec['reproduction']['actualReceipt']['v03Candidate']['views']['featureVisibility'][name]
        assert expected['unobstructed'] == hits.count(row)+hits.count(None) and expected['of'] == len(sample)
    for row in ('target_dissertation', 'target_copilot', 'target_typeforge'):
        triangles = m.KEPT[row][0]
        unique = np.unique(triangles.reshape(-1, 3), axis=0)
        assert len(triangles) == 2 and len(unique) == 4
        a, b, c = triangles[0]
        u, v = b-a, c-b
        fourth = a+c-b
        assert min(np.linalg.norm(unique-fourth, axis=1)) < 1e-6
        assert abs(np.dot(u, v)) < 1e-6
        normal = np.cross(u, v); normal /= np.linalg.norm(normal)
        assert max(abs((unique-a) @ normal)) < 1e-6
        # Independent sample rectangle construction from orthogonal edge vectors;
        # area equality establishes complete two-triangle coverage here.
        area = sum(np.linalg.norm(np.cross(t[1]-t[0], t[2]-t[0]))/2 for t in triangles)
        assert abs(area - np.linalg.norm(u)*np.linalg.norm(v)) < 1e-6
        sample = [a+x*u+y*v for x in np.linspace(.03, .97, 9) for y in np.linspace(.03, .97, 9)]
        own = rays.first(sample, slack=.002).count(row)
        facing = float(np.dot(normal, m.EYE-a))
        assert own == 81 and facing > 0
        out['targets'][row] = {'vertices': 4, 'triangles': 2, 'frontFacesEye': True, 'planeErrorM': float(max(abs((unique-a)@normal))),
                               'rectangleAreaM2': float(area), 'ownRowFirstHits': own, 'sampleCount': len(sample)}
    for a, b in (('ctl_body__shell', 'ctl_body__indicators'), ('drum_pads__shells', 'drum_pads__heads'),
                 ('drum_module__body', 'drum_module__display')):
        out['sameAssetSkippedRowPairs'][a+' | '+b] = m.tri_pairs(parts[a].triangles(), parts[b].triangles())
    # Count edges independently of the author's normal/edge-reason implementation.
    topology = {}
    for row, p in parts.items():
        edges = {}
        for f, _ in p.f:
            for a, b in zip(f, f[1:]+f[:1]):
                edges[tuple(sorted((a, b)))] = edges.get(tuple(sorted((a, b))), 0)+1
        topology[row] = {'boundaryEdges': sum(n == 1 for n in edges.values()), 'nonManifoldEdges': sum(n > 2 for n in edges.values())}
        expected = rec['reproduction']['actualReceipt']['v03Candidate']['topology'][row]
        assert all(expected[k] == v for k, v in topology[row].items())
    out['independentTopology'] = topology
    pads, cymbals = {}, {}
    for name, (c, r, depth, tilt) in G.PADS.items():
        p = parts['drum_pads__shells']; gi = next(i for i, x in enumerate(p.groups) if x[0] == f'pad.{name}.shell')
        local = local_points(G, vertices(p, gi), G.tilt_toward(np.asarray(c), G.PLAYER, tilt))
        pads[name] = float(2*np.linalg.norm(local[:, :2], axis=1).max())
        assert .25 <= pads[name] <= .31
    for name, (c, r, tilt) in G.CYMBALS.items():
        p = parts['drum_cymbals__cymbals']; gi = next(i for i, x in enumerate(p.groups) if x[0] == f'cymbal.{name}')
        local = local_points(G, vertices(p, gi), G.tilt_toward(np.asarray(c), G.PLAYER, tilt))
        cymbals[name] = float(2*np.linalg.norm(local[:, :2], axis=1).max())
    mm = G.MODULE; az, up = math.radians(mm['az']), math.radians(mm['up'])
    n = np.array([math.sin(az)*math.cos(up), math.cos(az)*math.cos(up), math.sin(up)])
    matrix = G.frame(np.asarray(mm['c']), n, hint=np.cross([0, 0, 1], n))
    module = np.ptp(local_points(G, vertices(parts['drum_module__body'], 0), matrix), axis=0)
    assert np.allclose(module, [.20, .15, mm['d']])
    out['otherDimensions'] = {'padOuterDiameters': pads, 'cymbalOuterDiameters': cymbals, 'moduleCaseLocal': module.tolist(),
                               'rugUndersideFloorGapM': float(np.min(parts['rug__rug'].v, axis=0)[2])}
    assert abs(out['otherDimensions']['rugUndersideFloorGapM'] - .0003) < 1e-9
    # A deliberately collinear actual planar triangle must fail, not disappear.
    shell = copy.deepcopy(parts['ctl_body__shell'])
    fi = next(i for i, c in enumerate(shell.cls) if c == 'planar')
    face = shell.f[fi][0]
    normal = G.corner_normals(shell)
    shell.v[face[2]] = shell.v[face[1]]
    degenerate = normal_audit(shell, normal)
    assert any(e[0] == 'degenerateTriangle' for e in degenerate['errors'])
    out['degenerateActualPlanarNegative'] = degenerate
    # Preserve root's unknown hard-edge decisions; statuses do not grant exemptions.
    topo = rec['reproduction']['actualReceipt']['v03Candidate']['topology']
    out['unapprovedHardEdgeGroups'] = {row: {label: e for label, e in r['hardConvexEdgesByLabel'].items()
         if label.startswith('unnamed') or 'ALSO' in e['reason']} for row, r in topo.items()}
    out['unapprovedHardEdgeGroups'] = {row: v for row, v in out['unapprovedHardEdgeGroups'].items() if v}
    rec['adequacyChecks'] = out
    rec['hashesAfterAdequacy'] = hashes()
    rec['finalRunnerSha256'] = sha(Path(__file__))
    save(rec)
    print(json.dumps(out, indent=1))


def focused_checks():
    started = time.monotonic()
    rec = json.loads(OUT.read_text())
    assert rec['reproduction']['passed'], 'Reproduction must have completed first'
    rec['hashesBeforeChecks'] = hashes()
    m = load_measure()
    G = m.G3
    parts, _ = G.build_all()
    result = {'countsAndDimensions': counts_dimensions(G, parts, m.CONTRACT),
              'verificationDevelopmentNote': 'Initial focused attempt stopped at reviewer cable-ring assumption: six vertices instead of authored five; corrected to measured circumdiameter, not a product failure.'}
    result['supportPositive'] = support_audit(G, parts)
    assert result['supportPositive']['allPass']
    # Kick spurs are separately named hardware: do not silently assume they are
    # decorative or functional ground supports; report their actual lower extent.
    result['kickSpursRequiringSemanticDecision'] = support_audit(G, parts, {'drum_kick__tower': [2, 3]})['rows']['drum_kick__tower']
    lifted = copy.deepcopy(parts)
    row = 'drum_rack__rack'
    _, v0, v1, _, _ = lifted[row].groups[2]
    lifted[row].v[v0:v1] = [(x, y, z+.005) for x, y, z in lifted[row].v[v0:v1]]
    ours = support_audit(G, lifted)['rows'][row]
    author = m.supports(G, lifted)[row]
    result['liftedRackRubberFootNegative'] = {'liftM': .005, 'author': author, 'independent': ours}
    assert not ours['allPass']
    field = np.asarray(result['supportPositive']['fieldPolygon'])[:, :2]
    p = np.array([[G.RUG['x0']+G.RUG['bw']+.020, G.RUG['y0']+G.RUG['bw']+.020]])
    result['roundedFieldCornerCheck'] = {'pointXY': p.tolist(), 'rectangleClearanceM': .020,
                                         'actualPolygonClearanceM': float(polygon_margin(p, field)[0])}
    audits = {}
    normals = {}
    for row, part in parts.items():
        normals[row] = G.corner_normals(part)
        audits[row] = normal_audit(part, normals[row])
    result['normalPositive'] = audits
    assert not any(a['errors'] for a in audits.values())
    shell = parts['ctl_body__shell']
    fi = next(i for i, c in enumerate(shell.cls) if c == 'planar')
    vi = shell.f[fi][0][0]
    base = np.asarray(normals[shell.row][(fi, vi)])
    axis = np.array([1., 0, 0]) if abs(base[0]) < .9 else np.array([0., 1, 0])
    tangent = np.cross(base, axis); tangent /= np.linalg.norm(tangent)
    tilted_normals = normals[shell.row].copy()
    tilted_normals[(fi, vi)] = tuple(base * math.cos(math.radians(3)) + tangent * math.sin(math.radians(3)))
    tilted = normal_audit(shell, tilted_normals)
    assert any(e[0] == 'planarCorner' for e in tilted['errors'])
    missing = copy.deepcopy(shell); missing.cls[fi] = None
    ambiguous = copy.deepcopy(shell); ambiguous.groups.append(ambiguous.groups[0])
    reclassified = copy.deepcopy(shell); reclassified.cls[fi] = 'bevel:casing'
    missing_result = class_audit(missing)
    ambiguous_result = class_audit(ambiguous)
    assert missing_result and ambiguous_result
    result['normalNegatives'] = {'tiltedActualPlanarCorner': tilted, 'missingClass': missing_result,
        'ambiguousGroup': ambiguous_result, 'authorMissingClassResult': m.normal_check(G, {shell.row: missing}),
        'authorAmbiguousGroupResult': m.normal_check(G, {shell.row: ambiguous}),
        'reclassificationRequiresPinnedClassComparison': shell.cls != reclassified.cls}
    strip = G.Part('ctl_body__shell')
    strip.add([(0, 0, 0), (.85, 0, 0), (.85, .0015, 0), (0, .0015, 0)], [(0, 1, 2, 3)], 'black', 'bevel:casing')
    n = (0, math.sin(math.radians(15)), math.cos(math.radians(15)))
    bevel = normal_audit(strip, {(0, i): n for i in range(4)})
    assert not bevel['errors'] and bevel['planarTriangles'] == 0
    strip.cls[0] = 'planar'
    forced = normal_audit(strip, {(0, i): n for i in range(4)})
    assert any(e[0] == 'planarCorner' for e in forced['errors'])
    result['longBevelControl'] = {'triangleAreaM2': .85*.0015/2, 'correctClass': bevel, 'incorrectPlanarClass': forced}
    # Triangle tests: crossing and separated controls plus concrete limitations.
    A = np.array([[[0., 0, 0], [1, 0, 0], [0, 1, 0]]])
    C = np.array([[[.2, .2, -1], [.2, .2, 1], [.5, .2, 0]]])
    small = A * .1 + [.1, .1, 0]
    tetra = np.array([[[0., 0, 0], [0, 1, 0], [1, 0, 0]], [[0, 0, 0], [1, 0, 0], [0, 0, 1]],
                      [[0, 0, 0], [0, 0, 1], [0, 1, 0]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]]])
    inner = tetra * .1 + .1
    fixtures = {'crossingPositive': m.tri_pairs(A, C), 'separatedNegative': m.tri_pairs(A, C+[2, 0, 0]),
                'coplanarOverlapMiss': m.tri_pairs(A, small), 'enclosedSolidMiss': m.tri_pairs(tetra, inner)}
    assert fixtures == dict(crossingPositive=1, separatedNegative=0, coplanarOverlapMiss=0, enclosedSolidMiss=0)
    result['intersectionAdequacy'] = fixtures
    result['elapsedSeconds'] = time.monotonic() - started
    rec['focusedChecks'] = result
    rec['hashesAfterChecks'] = hashes()
    rec['focusedChecksRunnerSha256'] = sha(Path(__file__))
    save(rec)
    print(json.dumps({'focusedChecks': 'completed', 'seconds': result['elapsedSeconds'], 'liftedAuthorResult': author,
                      'kickSpurs': result['kickSpursRequiringSemanticDecision'], 'roundedCorner': result['roundedFieldCornerCheck']}))


def edge_reason_check():
    """Resolve the observed cable length/reason discrepancy, without other reruns."""
    rec = json.loads(OUT.read_text()); hashes()
    m = load_measure(); parts, _ = m.G3.build_all()
    p = parts['music_cables__runs']; V = np.asarray(p.v)
    gi = next(i for i, g in enumerate(p.groups) if g[0] == 'cable.controller')
    label, v0, v1, f0, f1 = p.groups[gi]
    edges = {}; normals = {}
    for fi in range(f0, f1):
        f = p.f[fi][0]; P = V[list(f)]
        n = sum((np.cross(P[i]-P[0], P[i+1]-P[0]) for i in range(1, len(P)-1)), np.zeros(3))
        normals[fi] = n / np.linalg.norm(n)
        for a, b in zip(f, f[1:]+f[:1]):
            edges.setdefault(tuple(sorted((a, b))), []).append(fi)
    offenders = []
    for (a, b), fs in edges.items():
        if len(fs) != 2 or any(fi >= f1-2 for fi in fs):
            continue  # explicitly exclude both authored end-cap polygons
        angle = math.degrees(math.acos(np.clip(np.dot(normals[fs[0]], normals[fs[1]]), -1, 1)))
        c0, c1 = [V[list(p.f[fi][0])].mean(0) for fi in fs]
        if angle >= 80 and np.dot(normals[fs[0]], c1-c0) < 1e-9:
            offenders.append({'vertices': [a, b], 'faces': fs, 'lengthM': float(np.linalg.norm(V[a]-V[b])),
                              'angleDegrees': angle, 'sameRing': (a-v0)//5 == (b-v0)//5,
                              'endpoints': [V[a].tolist(), V[b].tolist()]})
    assert offenders
    result = {'row': p.row, 'label': label, 'declaredReason': m.G3.sharp_reason(label),
              'hardEdgesNotIncidentToEndCap': offenders, 'nonCapHardLengthM': sum(x['lengthM'] for x in offenders)}
    rec['edgeReasonCheck'] = result
    rec['hashesFinal'] = hashes(); rec['finalRunnerSha256'] = sha(Path(__file__))
    save(rec)
    print(json.dumps(result, indent=1))


def finalize():
    rec = json.loads(OUT.read_text())
    assert rec['reproduction']['passed'] and rec['focusedChecks'] and rec['adequacyChecks'] and rec['edgeReasonCheck']
    rec['verdict'] = 'REQUEST CHANGES: bounded CPU review complete; no export or image acceptance'
    rec['findingCategories'] = {
        'verificationCoverageFailures': ['K1 global row minimum misses a lifted rack foot',
            'K1 rectangular field test overstates rounded-corner clearance',
            'N1 missing and duplicate authored coverage are not rejected',
            'A1 controller cable side edges receive an end-cap-only reason'],
        'actualGeometryFailures': ['Both kick spurs are author-confirmed anti-creep support contacts: 5.325064731 mm rug gap, 5.025064731 mm excess above the intended gap'],
        'actualGeometryObservationsRequiringDisposition': ['32 shell/indicator triangle intersections are skipped by the same-asset exclusion',
            'Under-desk decal clearance is 10 mm; root allowance wording needs reconciliation'],
        'positiveSourceEvidence': ['All 18 rows match frozen mapping and ceilings', '23 inspected support primitives on seven rows pass',
            '1060 planar triangles pass oriented per-corner 2-degree check', 'All actual source triangles nondegenerate and normals finite/unit',
            'All three target rectangles independently satisfy geometric preconditions and 81 own-row ray hits'],
        'futureGates': ['Owner repair release and independent rereview', 'Hash-bound source-to-export semantic correspondence and actual GLB NORMAL checks',
            'Unchanged retained-data/profile/material/texture guards', 'Root actual images and production/runtime/resource budgets']}
    clarification = STUDIO / 'scene-coordination/m4-v03-author-clarifications.md'
    rec['authorClarification'] = {'path': str(clarification.relative_to(STUDIO)).replace('\\', '/'), 'sha256': sha(clarification),
         'sourceMessage': 'msg_b4e298729fac', 'coordinatorMessage': 'msg_918ac13adbfe',
         'kickSpursAreIntendedSupportContacts': True, 'actualK1AllSupportsPass': False,
         'scope': 'Intent confirmation and acknowledged defects only; no source repair or relabel-to-pass'}
    rec['commands'] = [
        {'mode': '--reproduce', 'exitCode': 0, 'fullGridRuns': 1, 'seconds': rec['reproduction']['elapsedSeconds']},
        {'mode': '--checks (first attempt)', 'exitCode': 1,
         'failure': 'AssertionError at initial cable diameter check: reviewer assumed six-vertex rings; source uses five. Corrected to five-vertex circumdiameter; no artist defect inferred.'},
        {'mode': '--checks (corrected focused probe)', 'exitCode': 0, 'fullGridRuns': 0},
        {'mode': '--adequacy', 'exitCode': 0, 'fullGridRuns': 0},
        {'mode': '--edge-reasons', 'exitCode': 0, 'fullGridRuns': 0}]
    rec['hashesFinal'] = hashes(); rec['finalRunnerSha256'] = sha(Path(__file__))
    save(rec)
    print(json.dumps({'verdict': rec['verdict'], 'inputPinsVerified': len(PINS), 'runnerSha256': rec['finalRunnerSha256'], 'receiptSha256': sha(OUT)}))


if __name__ == '__main__':
    if sys.argv[1:] == ['--reproduce']:
        reproduce()
    elif sys.argv[1:] == ['--checks']:
        try:
            focused_checks()
        except BaseException:
            rec = json.loads(OUT.read_text())
            rec.setdefault('focusedAttemptFailures', []).append(traceback.format_exc())
            save(rec)
            raise
    elif sys.argv[1:] == ['--adequacy']:
        try:
            adequacy_checks()
        except BaseException:
            rec = json.loads(OUT.read_text())
            rec.setdefault('adequacyAttemptFailures', []).append(traceback.format_exc())
            save(rec)
            raise
    elif sys.argv[1:] == ['--edge-reasons']:
        edge_reason_check()
    elif sys.argv[1:] == ['--finalize']:
        finalize()
    else:
        raise SystemExit('Expected --reproduce (once), --checks, --adequacy, --edge-reasons or --finalize')
