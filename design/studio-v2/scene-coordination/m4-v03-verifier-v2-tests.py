"""Focused writer regressions; no placement search or artist-file writes.

python -B design/studio-v2/scene-coordination/m4-v03-verifier-v2-tests.py
python -B design/studio-v2/scene-coordination/m4-v03-verifier-v2-tests.py --write
--write exclusively creates the fresh receipt and refuses an existing receipt.
Fixture declarations are narrow test expectations, never an approved candidate
manifest. The unchanged actual v03 is deliberately rejected.
"""
import ast
import copy
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import platform
import sys
import time
import traceback

import numpy as np

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parent
OUT = HERE / 'm4-v03-verifier-v2-tests.json'
HELPER = STUDIO / 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v03.py'
OLD_PINS = {
    'scene-coordination/m4-v03-cpu-verification.py': '11b1356d5afcfe9260b2e28e22b498279d1c33450aa5f4a82e9319fa324f5dd6',
    'scene-coordination/m4-v03-cpu-verification.json': 'c0fcce453614ff08e0facb5517fb4ed6fc430217ac455a2bbcf1e6dd325b6927',
    'scene-m4-v03-cpu-verification.md': '815edfabfb41fde8c3cd21e4a9429c1cf8be6d33f1a16ae2e008a23f5f2af174',
}
INTERFACE_SHA = '71eb54107e54ae94856ea3461471a1afe3e3a27b7de97bfe5a331fe91c8e5293'
SUPPORT_GROUPS = {
    'ctl_stand__frame': [3, 4, 5, 9, 10, 11],
    'ctl_sustain_pedal__pedal': [0],
    'stool_keys__stool': [5, 7, 9, 11],
    'drum_rack__rack': [1, 2, 3, 16, 17, 18],
    'drum_kick__tower': [1, 6, 2, 3],  # confirmed support spurs are NOT omitted
    'drum_hihat_pedal__pedal': [0],
    'drum_throne__throne': [6, 9, 12],
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def protected_hashes():
    for rel, expected in OLD_PINS.items():
        assert digest(STUDIO / rel) == expected, rel
    # Read only the old probe's literal pins; never execute its measurement path.
    tree = ast.parse((STUDIO / 'scene-coordination/m4-v03-cpu-verification.py').read_text())
    pins = next(ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign) and
                any(isinstance(t, ast.Name) and t.id == 'PINS' for t in n.targets))
    for rel, expected in pins.items():
        assert digest(STUDIO / rel) == expected, rel
    paths = {STUDIO / rel for rel in pins | OLD_PINS}
    paths.update(p for p in STUDIO.rglob('*') if p.is_file() and
                 ('m4-v03-focused-art' in p.name or 'm4-v03-art-' in str(p.relative_to(STUDIO))))
    return {str(p.relative_to(STUDIO)).replace('\\', '/'): digest(p) for p in sorted(paths)}


def snapshot(part, indices, *, normal_scope=False, authored_normals=None):
    """Explicitly scoped primitive selection, preserving source class meaning.

    Position-only support fixtures explicitly make no N1 claim. Normal fixtures
    select a fully classified authored primitive, never convert unknown artistic
    surfaces to bevel/round or construct a complete candidate declaration.
    """
    V, F, classes, groups, normals = [], [], [], [], []
    for gi in indices:
        label, v0, v1, f0, f1 = part.groups[gi]
        vb, fb = len(V), len(F)
        V.extend([list(p) for p in part.v[v0:v1]])
        for fi in range(f0, f1):
            face = part.f[fi][0]
            F.append([v-v0+vb for v in face])
            classes.append(part.cls[fi] if normal_scope else 'out_of_scope')
            if normal_scope:
                assert part.cls[fi] is not None, 'Test scope must have actual authored classes'
                normals.append([list(authored_normals[(fi, v)]) for v in face])
        groups.append({'id': f'{part.row}/primitive/{gi}', 'vertexRange': [vb, len(V)], 'faceRange': [fb, len(F)],
                       'triangleCount': sum(len(face)-2 for face in F[fb:]),
                       'n1': 'in_scope' if normal_scope else 'out_of_scope',
                       'reason': f'Fixture only: actual authored {label} primitive {gi}; '+
                                 ('original explicit N1 classes' if normal_scope else 'support/receiver positions only; no N1 assertion')})
    row = {'vertices': V, 'faces': F, 'faceClasses': classes, 'groups': groups}
    if normal_scope:
        row['cornerNormals'] = normals
    return row


def declaration(rows, sources, supports=None, surfaces=None):
    return {'schema': 'm4-source-declaration/2', 'scope': 'fixture',
            'sources': {k: hashlib.sha256(v).hexdigest() for k, v in sources.items()},
            'rows': [{'id': row, 'vertexCount': len(r['vertices']), 'faceCount': len(r['faces']),
                      'normalsRequired': 'cornerNormals' in r, 'groups': copy.deepcopy(r['groups']),
                      'faceClasses': list(r['faceClasses'])} for row, r in rows.items()],
            'surfaces': copy.deepcopy(surfaces or []), 'supports': copy.deepcopy(supports or [])}


def call(V, rows, decl, sources, pin=None):
    return V.audit_m4_v2(rows, decl, expected_declaration_sha256=pin or V.declaration_sha256(decl), source_bytes=sources)


def check_result(result, valid, section=None, code=None):
    assert result['valid'] is valid, result
    assert result['candidateAcceptance'] is False
    if section:
        assert result[section]['valid'] is False, result
    if code:
        assert any(e['code'] == code for e in result[section]['errors']), result
    json.dumps(result, allow_nan=False)
    return result


def summary(result):
    if 'coverage' not in result:
        return result
    return {'valid': result['valid'], 'scope': result['scope'], 'candidateAcceptance': result['candidateAcceptance'],
            'coverage': result['coverage'], 'supportErrors': result['supportGeometry']['errors'],
            'normalErrors': result['normalValidity']['errors'],
            'supportCount': len(result['supportGeometry']['supports']), 'normalRows': result['normalValidity']['rows']}


def synthetic_row(vertices, faces, classes, normals=None):
    group = {'id': 'synthetic-primitive', 'vertexRange': [0, len(vertices)], 'faceRange': [0, len(faces)],
             'triangleCount': sum(len(f)-2 for f in faces), 'n1': 'in_scope' if normals is not None else 'out_of_scope',
             'reason': 'Synthetic verifier fixture only, not an artistic candidate declaration'}
    row = {'vertices': vertices, 'faces': faces, 'groups': [group], 'faceClasses': classes}
    if normals is not None:
        row['cornerNormals'] = normals
    return row


def run():
    if '--write' in sys.argv and OUT.exists():
        raise SystemExit('Refusing to overwrite existing exclusive receipt')
    start = time.monotonic()
    before = protected_hashes()
    interface = HERE / 'm4-v03-verifier-declaration-contract.json'
    assert digest(interface) == INTERFACE_SHA
    V = load(HERE / 'm4-v03-verifier-v2.py', 'm4_verifier_v2')
    G = load(HELPER, 'm4_source_geometry_fixture')
    parts, _ = G.build_all()  # One cheap geometry build; no measurement/search import.
    sources = {'frozen-helper': HELPER.read_bytes()}
    tests, failures, evidence = [], [], {}

    def test(name, action):
        try:
            result = action()
            tests.append({'name': name, 'passed': True, 'evidence': summary(result)})
            return result
        except Exception:
            failure = {'name': name, 'passed': False, 'traceback': traceback.format_exc()}
            failures.append(failure); tests.append(failure)
            return None

    support_rows = {row: snapshot(parts[row], groups) for row, groups in SUPPORT_GROUPS.items()}
    support_rows['rug__rug'] = snapshot(parts['rug__rug'], [0])
    surfaces = [{'id': 'rug-field', 'kind': 'rug_field', 'boundaryRow': 'rug__rug', 'boundaryFace': len(parts['rug__rug'].f)-1},
                {'id': 'bare-floor', 'kind': 'bare_floor', 'boundaryRow': 'rug__rug', 'boundaryFace': len(parts['rug__rug'].f)-2}]
    supports = [{'id': f'{row}/support/{gi}', 'row': row, 'group': f'{row}/primitive/{gi}', 'surface': 'rug-field'}
                for row, groups in SUPPORT_GROUPS.items() for gi in groups]
    full_support_decl = declaration(support_rows, sources, supports, surfaces)
    base = test('actual_frozen_v03_support_scope_rejects_both_confirmed_spurs', lambda:
                check_result(call(V, support_rows, full_support_decl, sources), False, 'supportGeometry', 'liftedSupport'))
    if base:
        errors = base['supportGeometry']['errors']
        assert len(errors) == 2 and {e['location'] for e in errors} == {'drum_kick__tower/support/2', 'drum_kick__tower/support/3'}
        assert all(abs(e['signedGapErrorM']-.005025064731369289) < 1e-12 for e in errors)
        evidence['actualSupportFailure'] = base
    test('actual_v03_without_author_declaration_fails_closed', lambda:
         check_result(V.audit_m4_v2(support_rows, None, expected_declaration_sha256=None, source_bytes=sources),
                      False, 'coverage', 'missingDeclaration'))
    # A separate explicitly narrow positive fixture contains only the 23 known
    # ordinary primitives; the two confirmed defects remain in the test above.
    good_groups = copy.deepcopy(SUPPORT_GROUPS); good_groups['drum_kick__tower'] = [1, 6]
    good_rows = {row: snapshot(parts[row], gs) for row, gs in good_groups.items()}
    good_rows['rug__rug'] = support_rows['rug__rug']
    good_supports = [s for s in supports if s['id'] not in ('drum_kick__tower/support/2', 'drum_kick__tower/support/3')]
    good_decl = declaration(good_rows, sources, good_supports, surfaces)
    evidence['ordinarySupportPositive'] = test('narrow_actual_23_ordinary_supports_positive', lambda:
         check_result(call(V, good_rows, good_decl, sources), True))
    baseline_copy = copy.deepcopy(good_rows)
    baseline_decl = copy.deepcopy(good_decl)

    def move_rack(dz):
        rows = copy.deepcopy(good_rows)
        g = next(g for g in rows['drum_rack__rack']['groups'] if g['id'].endswith('/2'))
        for vi in range(*g['vertexRange']):
            rows['drum_rack__rack']['vertices'][vi][2] += dz
        return check_result(call(V, rows, good_decl, sources), False, 'supportGeometry', 'liftedSupport' if dz > 0 else 'penetratingSupport')
    test('actual_rack_foot_lift_5mm_cannot_hide_behind_row_minimum', lambda: move_rack(.005))
    test('actual_rack_foot_penetration_1mm_rejects', lambda: move_rack(-.001))

    def mutate_decl(fn, *, repin=False, code='declarationPinMismatch'):
        d = copy.deepcopy(good_decl); fn(d)
        return check_result(call(V, good_rows, d, sources, None if repin else V.declaration_sha256(good_decl)), False, 'coverage', code)
    test('missing_expected_support_identity_rejects', lambda: mutate_decl(lambda d: d['supports'].pop()))
    test('unknown_support_identity_rejects', lambda: mutate_decl(lambda d: d['supports'][0].update(id='unknown-contact')))
    test('duplicate_support_id_even_in_pinned_fixture_rejects', lambda:
         mutate_decl(lambda d: d['supports'].append(copy.deepcopy(d['supports'][0])), repin=True, code='duplicateIdentity'))
    test('different_ids_cannot_cover_same_primitive_twice', lambda:
         mutate_decl(lambda d: d['supports'].append(d['supports'][0] | {'id': 'second-name-same-foot'}), repin=True, code='duplicateSupportPrimitive'))
    test('unknown_support_primitive_rejects', lambda:
         mutate_decl(lambda d: d['supports'][0].update(group='unknown-primitive'), repin=True, code='unknownSupportPrimitive'))
    test('missing_explicit_surface_rejects', lambda:
         mutate_decl(lambda d: d['supports'][0].pop('surface'), repin=True, code='missingOrUnknownReceivingSurface'))
    test('mixed_rug_floor_supports_in_one_row_reject', lambda:
         mutate_decl(lambda d: d['supports'][0].update(surface='bare-floor'), repin=True, code='mixedReceivingSurfaces'))
    test('missing_external_manifest_pin_rejects', lambda:
         check_result(V.audit_m4_v2(good_rows, good_decl, expected_declaration_sha256=None, source_bytes=sources), False, 'coverage', 'missingDeclarationPin'))
    test('actual_source_byte_mismatch_rejects', lambda:
         check_result(call(V, good_rows, good_decl, {'frozen-helper': sources['frozen-helper']+b'changed'}), False, 'coverage', 'sourcePinMismatch'))

    rug = parts['rug__rug']
    field = np.array(rug.v)[list(rug.f[-1][0])][:, :2]
    outline = np.array(rug.v)[list(rug.f[-2][0])][:, :2]
    def rounded():
        r = V.footprint_clearance([[.606, -1.314]], field, 'inside')
        assert abs(r['signedClearanceM']-.019318516525781364) < 1e-12 and r['signedClearanceM'] < .020
        return r | {'rectangleClaimM': .020, 'rejectedAtRequiredClearance': True}
    test('preserved_rounded_corner_20mm_false_positive_rejects', rounded)
    def clearance(points, side, valid):
        r = V.footprint_clearance(points, outline if side == 'outside' else field, side)
        assert (r['signedClearanceM'] >= .020) is valid
        return r
    test('bare_floor_disjoint_complete_footprint_positive', lambda: clearance([[2.25, .2], [2.30, .2], [2.30, .3], [2.25, .3]], 'outside', True))
    test('bare_floor_vertices_outside_but_edge_crosses_rug_rejects', lambda:
         clearance([[.3, -.1], [2.5, -.1], [2.5, .1], [.3, .1]], 'outside', False))
    test('bare_floor_footprint_enclosing_whole_rug_rejects', lambda:
         clearance([[.3, -1.6], [2.5, -1.6], [2.5, 1.1], [.3, 1.1]], 'outside', False))
    test('bare_floor_footprint_on_rug_rejects', lambda: clearance([[1, 0], [1.1, 0], [1.1, .1], [1, .1]], 'outside', False))
    test('rug_footprint_crosses_field_edge_rejects', lambda:
         clearance([[.3, -.1], [1, -.1], [1, .1], [.3, .1]], 'inside', False))

    # Whole API bare-floor control; footprint is clear of the actual outer rug.
    floor_rows = {'rug__rug': support_rows['rug__rug'], 'floor-fixture': synthetic_row(
        [[2.25,.2,.0003], [2.30,.2,.0003], [2.30,.3,.0003], [2.25,.3,.0003]], [[0,1,2,3]], ['out_of_scope'])}
    floor_decl = declaration(floor_rows, sources, [{'id':'floor-contact','row':'floor-fixture','group':'synthetic-primitive','surface':'bare-floor'}], surfaces)
    test('bare_floor_actual_outline_and_signed_height_api_positive', lambda: check_result(call(V, floor_rows, floor_decl, sources), True))
    def derived_overflow():
        rows = copy.deepcopy(floor_rows)
        # Use a rug receiver at a huge finite Z and a huge negative support Z.
        # This exercises receipt safety, not an admissible M4 placement.
        for vertex in rows['rug__rug']['vertices']:
            vertex[2] = 1e308
        for vertex in rows['floor-fixture']['vertices']:
            vertex[2] = -1e308
        d = copy.deepcopy(floor_decl); d['supports'][0]['surface'] = 'rug-field'
        return check_result(call(V, rows, d, sources), False, 'supportGeometry', 'nonFiniteDerivedMeasurement')
    test('finite_input_derived_overflow_rejects_JSON_safely', derived_overflow)
    def bad_boundary(kind):
        rows = copy.deepcopy(floor_rows)
        fi = surfaces[1]['boundaryFace']; vertex = rows['rug__rug']['faces'][fi][0]
        if kind == 'height':
            rows['rug__rug']['vertices'][vertex][2] += .01
        else:
            rows['rug__rug']['faces'][fi][1], rows['rug__rug']['faces'][fi][8] = rows['rug__rug']['faces'][fi][8], rows['rug__rug']['faces'][fi][1]
        return check_result(call(V, rows, floor_decl, sources), False, 'coverage')
    test('nonhorizontal_receiver_rejects', lambda: bad_boundary('height'))
    test('crossed_receiver_boundary_rejects', lambda: bad_boundary('cross'))

    shell = parts['ctl_body__shell']; auth = G.corner_normals(shell)
    normal_rows = {'shell-slab-fixture': snapshot(shell, [0], normal_scope=True, authored_normals=auth)}
    normal_decl = declaration(normal_rows, sources)
    evidence['actualSlabNormalPositive'] = test('actual_authored_slab_classes_and_normals_positive', lambda:
         check_result(call(V, normal_rows, normal_decl, sources), True))
    def normal_mutation(fn, section, code):
        rows = copy.deepcopy(normal_rows); fn(rows['shell-slab-fixture'])
        return check_result(call(V, rows, normal_decl, sources), False, section, code)
    def tilt(r, angle):
        n = np.array(r['cornerNormals'][0][0]); axis = np.array([1.,0,0]) if abs(n[0]) < .9 else np.array([0.,1,0])
        t = np.cross(n,axis); t /= np.linalg.norm(t)
        r['cornerNormals'][0][0] = (n*math.cos(math.radians(angle))+t*math.sin(math.radians(angle))).tolist()
    test('actual_planar_corner_tilt_3deg_rejects', lambda: normal_mutation(lambda r: tilt(r,3), 'normalValidity','planarCornerAngle'))
    def angle_positive():
        rows = copy.deepcopy(normal_rows); tilt(rows['shell-slab-fixture'], 1.99)
        return check_result(call(V, rows, normal_decl, sources), True)
    test('actual_planar_corner_tilt_below_2deg_positive', angle_positive)
    test('flipped_planar_normal_rejects_without_abs_dot', lambda:
         normal_mutation(lambda r: r['cornerNormals'][0].__setitem__(0, (-np.array(r['cornerNormals'][0][0])).tolist()), 'normalValidity','planarCornerAngle'))
    test('actual_degenerate_planar_triangle_rejects', lambda:
         normal_mutation(lambda r: r['vertices'].__setitem__(r['faces'][0][2], r['vertices'][r['faces'][0][1]]), 'normalValidity','degenerateTriangle'))
    test('nonfinite_normal_rejects_JSON_safely', lambda:
         normal_mutation(lambda r: r['cornerNormals'][0].__setitem__(0, [math.nan,0,1]), 'normalValidity','invalidCornerNormal'))
    test('nonunit_normal_rejects', lambda:
         normal_mutation(lambda r: r['cornerNormals'][0].__setitem__(0, [0,0,2]), 'normalValidity','invalidCornerNormal'))
    test('zero_normal_rejects', lambda:
         normal_mutation(lambda r: r['cornerNormals'][0].__setitem__(0, [0,0,0]), 'normalValidity','invalidCornerNormal'))
    test('missing_corner_normals_rejects', lambda:
         normal_mutation(lambda r: r.pop('cornerNormals'), 'normalValidity','missingOrInvalidCornerNormals'))
    test('null_face_class_rejects', lambda: normal_mutation(lambda r: r['faceClasses'].__setitem__(0,None), 'coverage','invalidClasses'))
    test('missing_face_class_rejects', lambda: normal_mutation(lambda r: r['faceClasses'].pop(), 'coverage','invalidClasses'))
    test('unknown_face_class_rejects', lambda: normal_mutation(lambda r: r['faceClasses'].__setitem__(0,'unknown'), 'coverage','invalidClasses'))
    test('planar_to_bevel_reclassification_rejects', lambda: normal_mutation(lambda r: r['faceClasses'].__setitem__(0,'bevel:casing'), 'coverage','classMismatch'))
    test('missing_group_rejects', lambda: normal_mutation(lambda r: r['groups'].pop(), 'coverage','groupSetMismatch'))
    test('duplicate_group_identity_rejects', lambda: normal_mutation(lambda r: r['groups'].append(copy.deepcopy(r['groups'][0])), 'coverage','duplicateIdentity'))
    test('unknown_group_rejects', lambda: normal_mutation(lambda r: r['groups'][0].update(id='unknown'), 'coverage','groupSetMismatch'))
    test('changed_group_range_rejects', lambda: normal_mutation(lambda r: r['groups'][0]['faceRange'].__setitem__(1,1), 'coverage','groupDeclarationMismatch'))
    def bad_expected_group(overlap):
        rows = copy.deepcopy(normal_rows); d = copy.deepcopy(normal_decl)
        if overlap:
            duplicate = copy.deepcopy(d['rows'][0]['groups'][0]); duplicate['id'] = 'other-id-overlapping-range'
            d['rows'][0]['groups'].append(duplicate); rows['shell-slab-fixture']['groups'].append(copy.deepcopy(duplicate))
            code = 'incompleteOrOverlappingGroupCoverage'
        else:
            d['rows'][0]['groups'][0]['triangleCount'] += 1
            rows['shell-slab-fixture']['groups'][0]['triangleCount'] += 1
            code = 'groupTriangleCountMismatch'
        return check_result(call(V, rows, d, sources), False, 'coverage', code)
    test('overlapping_group_ranges_even_in_pinned_fixture_reject', lambda: bad_expected_group(True))
    test('inconsistent_expected_triangle_count_rejects', lambda: bad_expected_group(False))

    # The long bevel is deliberately above the obsolete area threshold.
    normal = [0, math.sin(math.radians(15)), math.cos(math.radians(15))]
    strip = {'bevel-fixture': synthetic_row([[0,0,0],[.85,0,0],[.85,.0015,0],[0,.0015,0]], [[0,1,2,3]], ['bevel:casing'], [[normal]*4])}
    strip_decl = declaration(strip, sources)
    test('long_smooth_bevel_positive_despite_large_area', lambda: check_result(call(V, strip, strip_decl, sources), True))
    def flat_strip():
        rows = copy.deepcopy(strip); rows['bevel-fixture']['faceClasses'] = ['planar']
        d = declaration(rows, sources)
        return check_result(call(V, rows, d, sources), False, 'normalValidity', 'planarCornerAngle')
    test('same_long_strip_forced_planar_is_negative_control', flat_strip)
    def tiny_panel():
        tiny = {'tiny-planar': synthetic_row([[0,0,0],[.000001,0,0],[0,.000001,0]], [[0,1,2]], ['planar'], [[normal]*3])}
        return check_result(call(V, tiny, declaration(tiny,sources), sources), False, 'normalValidity', 'planarCornerAngle')
    test('tiny_planar_triangle_is_tested_regardless_of_area', tiny_panel)
    for key in ('groups', 'faces', 'vertices', 'faceClasses'):
        test('malformed_null_'+key+'_fails_closed', lambda key=key:
             normal_mutation(lambda r: r.__setitem__(key,None), 'coverage', None))
    assert good_rows == baseline_copy and good_decl == baseline_decl, 'Verifier mutated inputs'
    after = protected_hashes()
    assert before == after, 'Protected inputs changed during focused checks'
    receipt = {'schema': 'm4-verifier-v2-writer-regressions/1', 'task': 'task_3085b11eda21', 'dispatch': 'ctx_ad552ec9aaf5',
               'status': 'writer implementation evidence; independent review required; author integration held',
               'candidateAcceptance': False, 'fixtureDeclarationWarning': 'No complete approved candidate declaration was supplied or invented; fixture pins are test-only expectations.',
               'command': 'python -B design/studio-v2/scene-coordination/m4-v03-verifier-v2-tests.py'+(' --write' if '--write' in sys.argv else ''),
               'environment': {'python': platform.python_version(), 'numpy': np.__version__, 'platform': platform.platform()},
               'fullPlacementSearchRuns': 0, 'elapsedSeconds': time.monotonic()-start,
               'passed': not failures, 'testCount': len(tests), 'failures': failures, 'tests': tests, 'evidence': evidence,
               'hashesBefore': before, 'hashesAfter': after,
               'implementationHashes': {'module': digest(HERE/'m4-v03-verifier-v2.py'), 'tests': digest(Path(__file__)), 'interface': digest(interface)}}
    print(json.dumps({'passed': not failures, 'testCount': len(tests), 'seconds': receipt['elapsedSeconds'], 'failures': failures}, indent=2))
    if '--write' in sys.argv:
        with OUT.open('x', encoding='utf-8', newline='\n') as f:
            json.dump(receipt, f, indent=2, allow_nan=False); f.write('\n')
        print('exclusiveReceiptSha256='+digest(OUT))
    return 0 if not failures else 1


if __name__ == '__main__':
    if sys.argv[1:] not in ([], ['--write']):
        raise SystemExit('Only --write is supported; it never overwrites an existing receipt')
    raise SystemExit(run())
