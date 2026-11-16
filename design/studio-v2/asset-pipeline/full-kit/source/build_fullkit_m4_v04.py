"""Studio v2 full kit, stage M4 v04 source preparation (HELD, NOT EXECUTABLE): music equipment on the accepted corrected
M3 parent v03.

Owner: actual-Claude author, task_23314c669e03 (v04 restart). Root: scene-coordination/m4-v04-combined-repair-disposition.md
(msg_43aafdbe37c4); boundary scene-coordination/m4-v04-internal-contract.md. Derived from the frozen held v03 builder
build_fullkit_m4_v03.py (53fa310f...), which stays unchanged; everything is carried over except where marked "v04".

STATUS: prepared source only. HELD: this script refuses to execute at all (see the RELEASE block). No Blender run, dry run,
save or export is released for v04: root decides after the Codex selected-pose measurement, the independent verifier
verdict and a focused actual-Claude closure, and only with a v04 scene-provenance amendment (not the author's).

v04 changes against v03:
  - geometry from the v04 helper build_fullkit_m4_geometry_v04.py (pinned below): K1 spurs / plate / pad-ring bevel,
    N1 round runs, A1 edge sets, P1 pose (the helper's SELECTED_POSE), D declarations.
  - N1 edge marking: the builder no longer re-derives sharp edges from the 40-degree angle alone. Every M4 edge takes its
    smooth/sharp state from MG.smooth_edges(part), the same rule MG.corner_normals() uses, so an edge inside one declared
    continuous round run stays smooth whatever its angle and the custom normal fans match the authored ones. An assert
    checks that every other edge agrees with Blender's own 40-degree face angle (the rule is not silently changed there).
  - custom split normals: unchanged v03 method (MG.corner_normals per polygon/vertex, oriented to the recalculated
    winding, in-memory 2-degree readback on planar triangles). Source evidence only; exported NORMAL accessors decide.
  - Scene provenance values ('m4-v04') are a proposal only; no v04 amendment exists and none is the author's.

Run: none. Held. (When root releases a run, the release edits the RELEASE block under review; one hidden process,
  blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python build_fullkit_m4_v04.py -- [blend] [glb])
"""
import bpy, bmesh, sys, os, math, json, runpy, hashlib, struct
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
FLAGS = set(ARGS)
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
STUDIO = os.path.dirname(os.path.dirname(KIT))
EXPORTS, MANIFESTS = os.path.join(KIT, 'exports'), os.path.join(KIT, 'manifests')
TAG = 'v04'
M3_SCRIPT = os.path.join(HERE, 'build_fullkit_m3.py')
M3_SCRIPT_SHA = 'dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209'
HELPER = os.path.join(HERE, 'build_fullkit_m4_geometry_v04.py')
HELPER_SHA = '5d01ed7c094d2983d9a597a6b7271eedfa662cfdcfa435929fa258898caca20a'   # v04 helper, pinned at preparation
CONTRACT = os.path.join(STUDIO, 'scene-coordination', 'm4-model-contract.json')
CONTRACT_SHA = '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98'
PARENT_GLB = os.path.join(EXPORTS, 'studio-full-kit-m3-proposal-v03.glb')
PARENT_SHA = 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf'
BLEND_OUT = os.path.join(HERE, f'fk-40-music-proposal-{TAG}.blend')
RAW_OUT = os.path.join(EXPORTS, f'studio-full-kit-m4-proposal-{TAG}.raw-export.glb')
MEAS_OUT = os.path.join(MANIFESTS, f'm4-{TAG}-author-measurements.json')


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def fresh(path):
    if os.path.exists(path):
        raise RuntimeError('Refusing to overwrite existing deliverable: ' + path)
    return path


# ------------------------------------------------------------------ RELEASE: hold on save / export
# v04: HELD, NOT EXECUTABLE. No dry run, save or export is released for the v04 preparation. Root edits this line only
# under an explicit release reviewed with the source (and a v04 scene-provenance amendment for any save/export).
raise SystemExit('M4 v04 builder is HELD: source preparation only; no Blender execution is released.')
if FLAGS - {'blend', 'glb'}:
    raise SystemExit('unknown flags: ' + ' '.join(sorted(FLAGS - {'blend', 'glb'})))
if FLAGS:
    # v04: save/export additionally HELD until root releases it and a v04 provenance amendment exists.
    raise SystemExit('M4 v04 save/export is HELD: source preparation only (no root release, no v04 provenance amendment).')
    if os.environ.get('FK_M4_PARENT_RELEASE') != PARENT_SHA:
        raise SystemExit('M4 save/export is HELD: set FK_M4_PARENT_RELEASE to the accepted parent v03 SHA-256.')
    for p in ([BLEND_OUT] if 'blend' in FLAGS else []) + ([RAW_OUT] if 'glb' in FLAGS else []) + [MEAS_OUT]:
        fresh(p)
assert sha(M3_SCRIPT) == M3_SCRIPT_SHA, 'M3 builder differs from the frozen version'
assert sha(HELPER) == HELPER_SHA, 'M4 geometry helper differs from the pinned version'
assert sha(CONTRACT) == CONTRACT_SHA, 'M4 mapping differs from the frozen version'
assert sha(PARENT_GLB) == PARENT_SHA, 'parent v03 GLB differs from the accepted identity'
CONTRACT_DOC = json.load(open(CONTRACT, encoding='utf-8'))

# ------------------------------------------------------------------ editable parent state (frozen M3 chain, dry; writes nothing)
_argv = sys.argv
sys.argv = [_argv[0], '--']
G3M = runpy.run_path(M3_SCRIPT, run_name='fk_m3_base')
sys.argv = _argv
G2, G1 = G3M['G2'], G3M['G1']
scene, MAT, SW, ROOT, OBJ, CABLES, grommet, leaf = (G3M[k] for k in ('scene', 'MAT', 'SW', 'ROOT', 'OBJ', 'CABLES', 'grommet', 'leaf'))
EPS, DESK = G3M['EPS'], G3M['DESK']
EYE = Vector(G1['EYE'])

# scene provenance: exactly the approved three-key delta (two values changed, one key appended)
scene['fk_tag'], scene['fk_stage'] = 'm4-' + TAG, 'M4'
scene['fk_m4_tag'] = TAG

sys.path.insert(0, HERE)
import build_fullkit_m4_geometry_v04 as MG                   # noqa: E402  (pinned above by hash)
assert MG.EPS == EPS and max(abs(a - b) for a, b in zip(EYE, (-0.35, -1.70, 1.345))) < 1e-6, 'helper constants disagree with the chain'   # EYE is float32

M4_ASSETS = set(CONTRACT_DOC['assetIds'])
RETIRE = sorted(r['name'] for r in CONTRACT_DOC['retiredParentLeaves'])
REMOVED = []
for obj in list(bpy.data.objects):
    if obj.get('assetId') in M4_ASSETS and '__proxy' in obj.name:
        REMOVED.append(obj.name)
        bpy.data.objects.remove(obj, do_unlink=True)
REMOVED.sort()
assert REMOVED == RETIRE, REMOVED
ADDED = {r['leaf']: r for r in CONTRACT_DOC['addedRows']}
assert set(ADDED) == set(MG.ROWS)
for row, (asset, mat, ceiling, casts) in MG.ROWS.items():
    r = ADDED[row]
    assert (r['assetId'], r['material'], r['placedTriangles'], r['castShadow'], r['receiveShadow'], r['doubleSided'], r['alphaMode']) == \
           (asset, mat, ceiling, casts, True, True, 'OPAQUE'), row

# ------------------------------------------------------------------ M4 leaves from the helper
PARTS, HMETA = MG.build_all()
SHARP = math.radians(40)
assert abs(MG.SHARP_DEG - 40.0) < 1e-12
OBJ4, TRIS, NORMALS = {}, {}, {}


def set_custom_normals(row, mesh, part):
    """v03 N1: authored corner normals as custom split normals. Polygons keep the helper's face order (bmesh.to_mesh
    preserves it); recalc_face_normals may reverse a face's winding, so each authored normal is oriented to the
    recalculated polygon normal (inherited lathe windings, e.g. the pad shells, are reversed by recalc)."""
    auth = MG.corner_normals(part)
    flipped = 0
    loops = [None] * len(mesh.loops)
    for p in mesh.polygons:
        face = part.f[p.index][0]
        assert sorted(face) == sorted(mesh.loops[i].vertex_index for i in p.loop_indices), (row, p.index)
        P = [Vector(part.v[i]) for i in face]
        newell = Vector((0.0, 0.0, 0.0))
        for i in range(2, len(P)):
            newell += (P[i - 1] - P[0]).cross(P[i] - P[0])
        s_ = 1.0 if newell.dot(p.normal) >= 0 else -1.0
        flipped += s_ < 0
        for i in p.loop_indices:
            loops[i] = tuple(s_ * c for c in auth[(p.index, mesh.loops[i].vertex_index)])
    mesh.normals_split_custom_set(loops)
    # readback (root N1 predicate on the in-memory mesh): every corner of every planar triangle within 2 degrees
    mesh.calc_loop_triangles()
    cos2, worst, n = math.cos(math.radians(2.0)), 0.0, 0
    for lt in mesh.loop_triangles:
        if part.cls[lt.polygon_index] != 'planar':
            continue
        a, b, c = (mesh.vertices[v].co for v in lt.vertices)
        g = (b - a).cross(c - a).normalized()
        if g.dot(mesh.polygons[lt.polygon_index].normal) < 0:
            g = -g
        for li in lt.loops:
            d = mesh.corner_normals[li].vector.dot(g)
            worst = max(worst, math.degrees(math.acos(max(-1.0, min(1.0, d)))))
            n += 1
            assert d >= cos2, (row, lt.polygon_index, d)
    NORMALS[row] = {'planarCorners': n, 'maxDeg': round(worst, 4), 'windingFlippedByRecalc': flipped}

for row, part in PARTS.items():
    asset, mat, ceiling, casts = MG.ROWS[row]
    assert MAT[mat].use_backface_culling is False, (row, mat)            # doubleSided in the mapping; library unchanged
    bm = bmesh.new()
    uvl = bm.loops.layers.uv.new('UVMap')
    verts = [bm.verts.new(co) for co in part.v]
    faces = [(bm.faces.new([verts[i] for i in face]), rule) for face, rule in part.f]
    bmesh.ops.recalc_face_normals(bm, faces=[f for f, _ in faces])
    for f, rule in faces:
        f.smooth = True
        for loop in f.loops:
            if rule == 'oak':
                loop[uvl].uv = G2['oak_uv'](loop.vert.co, f.normal)
            elif rule == 'weave':
                loop[uvl].uv = G2['weave_uv'](loop.vert.co, f.normal)
            elif rule == 'glow':
                loop[uvl].uv = (0.5, 0.5)
            else:
                loop[uvl].uv = SW[rule]
    # v04 N1: one smoothing rule for normals and edge marking (MG.smooth_edges); round-run edges stay smooth, every other
    # edge must agree with Blender's own 40-degree face angle
    auth_smooth = MG.smooth_edges(part)
    bm.verts.index_update()
    bm.faces.index_update()                                     # creation order = helper vertex / face order
    for e in bm.edges:
        key = tuple(sorted(v.index for v in e.verts))
        angle_smooth = len(e.link_faces) == 2 and e.calc_face_angle(0.0) <= SHARP
        fs = [f.index for f in e.link_faces]
        in_run = len(fs) == 2 and part.runs[fs[0]] is not None and part.runs[fs[0]] == part.runs[fs[1]]
        assert auth_smooth[key] == angle_smooth or (in_run and auth_smooth[key]), (row, key)
        e.smooth = auth_smooth[key]
    mesh = bpy.data.meshes.new(row + '_mesh')
    bm.to_mesh(mesh)
    bm.free()
    if any(part.cls):
        set_custom_normals(row, mesh, part)                               # v03 N1 (v04 fans from MG.smooth_edges)
    mesh.materials.append(MAT[mat])
    obj = leaf(row, mesh, 'FK_MUSIC', asset, role='opaque', casts=casts, receive=True)
    assert (obj['occluder'], obj['transparent'], obj['nocast'], obj['receiveShadow']) == (True, False, not casts, True), row
    mesh.calc_loop_triangles()
    TRIS[row] = len(mesh.loop_triangles)
    assert TRIS[row] == part.tris <= ceiling, (row, TRIS[row], part.tris, ceiling)
    OBJ4[row] = obj

bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()

# ------------------------------------------------------------------ measurements on the in-memory state
rows_l, tot = MG.ledger(PARTS)
meas = {'statement': 'M4 author measurements from the in-memory Blender state. Exact Blender ray casts from the fixed eye and '
                     'projections with the M1 builder cameras (music-1440 yaw 44/pitch -8/FOV 58, right-down 58/-16/58, music-320-f74, '
                     'home-1440). Geometry evidence only: builder cameras are planning estimates, not runtime captures or image approval.',
        'parent': {'glb': 'exports/studio-full-kit-m3-proposal-v03.glb', 'sha256': PARENT_SHA,
                   'editableChain': 'build_fullkit_m3.py (frozen DCCFA288, dry) = editable M3 v02; v03 = raw v02 + root exact restoration'},
        'mapping': {'path': 'scene-coordination/m4-model-contract.json', 'sha256': CONTRACT_SHA},
        'helper': {'path': 'source/build_fullkit_m4_geometry_v04.py', 'sha256': HELPER_SHA},
        'customNormalsN1 (in-memory readback, not an export check)': NORMALS,
        'removedM4Proxies': REMOVED, 'trianglesPerRow': TRIS, 'ledger': {'rows': rows_l, 'stage': tot, 'stageLimits': MG.STAGE_LIMITS},
        'sceneExtras': {k: scene[k] for k in ('fk_variant', 'fk_tag', 'fk_profile', 'fk_stage', 'fk_m2_tag', 'fk_m3_tag', 'fk_m4_tag')},
        'keys': {'white': HMETA['whiteKeys'], 'black': HMETA['blackKeys']}}
print('FK M4 ledger', json.dumps(tot), json.dumps(TRIS))


def cast(target, slack=0.004):
    d_ = target - EYE
    hit, loc, nrm, idx, obj, mtx = scene.ray_cast(dg, EYE, d_.normalized(), distance=d_.length + slack)
    return obj.name if hit else None


def project(cam_name, co):
    cam = bpy.data.objects[cam_name]
    scene.render.resolution_x, scene.render.resolution_y = cam['res_x'], cam['res_y']
    p = world_to_camera_view(scene, cam, co)
    return (round(p.x * cam['res_x'], 1), round((1 - p.y) * cam['res_y'], 1), p.z > 0 and 0 <= p.x <= 1 and 0 <= p.y <= 1)


def grid(f, nu, nv):
    return [f(i / (nu - 1), j / (nv - 1)) for i in range(nu) for j in range(nv)]


VIEWS = ['music-1440', 'right-down', 'music-320-f74', 'home-1440']

# targets stay truthful: 81 rays each, first hit the target
meas['targetRays'] = {}
for pid in ('dissertation', 'copilot', 'typeforge'):
    obj = bpy.data.objects['target_' + pid]
    c = [obj.matrix_world @ v.co for v in obj.data.vertices]
    pts = grid(lambda u, v: c[0].lerp(c[1], 0.03 + 0.94 * u).lerp(c[3].lerp(c[2], 0.03 + 0.94 * u), 0.03 + 0.94 * v), 9, 9)
    hits = [cast(p, 0.002) for p in pts]
    meas['targetRays'][pid] = {'clear': sum(1 for h in hits if h == obj.name), 'of': len(pts), 'blockers': sorted(set(h for h in hits if h != obj.name and h))}
    assert meas['targetRays'][pid]['clear'] == 81, meas['targetRays'][pid]


def visibility(row, cond=lambda co: True, cap=150):
    obj = OBJ4[row]
    vs = [obj.matrix_world @ v.co for v in obj.data.vertices]
    vs = [v for v in vs if cond(v)]
    samp = vs[::max(1, len(vs) // cap)]
    hits = [cast(p) for p in samp]
    vis = [p for p, h in zip(samp, hits) if h in (row, None)]   # None: the ray reached the vertex unobstructed
    entry = {'samples': len(samp), 'unobstructedFromEye': len(vis),
             'blockers': {h: hits.count(h) for h in sorted(set(h for h in hits if h not in (row, None)))}}
    for cam in VIEWS:
        pr = [project(cam, p) for p in vis]
        inn = [q for q in pr if q[2]]
        entry[cam] = {'inFrame': len(inn), 'px': [min(q[0] for q in inn), max(q[0] for q in inn), min(q[1] for q in inn), max(q[1] for q in inn)] if inn else None}
    return entry


meas['visibility'] = {row: visibility(row) for row in MG.ROWS}
meas['featureVisibility'] = {
    'kickPedal': visibility('drum_kick__tower', lambda v: v.z < 0.2 and v.y < 0.40),
    'kickTowerUpper': visibility('drum_kick__tower', lambda v: v.z > 0.2),
    'hihatPedal': visibility('drum_hihat_pedal__pedal'),
    'sustainPedal': visibility('ctl_sustain_pedal__pedal', lambda v: v.z < 0.04),
    'throneSeat': visibility('drum_throne__throne', lambda v: v.z > 0.40),
    'stoolSeat': visibility('stool_keys__stool', lambda v: v.z > 0.43),
    'moduleDisplay': visibility('drum_module__display'),
}
print('FK M4 visibility', json.dumps({k: (v['unobstructedFromEye'], v['samples']) for k, v in meas['featureVisibility'].items()}))

# controller: azimuth span from the eye, key counts and key-top rays, projected white-key pitch
ctl_pts = [o.matrix_world @ v.co for r in ('ctl_body__shell', 'ctl_keys__keys') for o in [OBJ4[r]] for v in o.data.vertices]
az = lambda p: math.degrees(math.atan2(p.x - EYE.x, p.y - EYE.y))
ctl_vis = [p for p in ctl_pts[::4] if cast(p) in ('ctl_body__shell', 'ctl_keys__keys', None)]
A_all, A_vis = [az(p) for p in ctl_pts], [az(p) for p in ctl_vis]
MC = MG.MC
white_tops = [Vector(MG.apply(MC, (MG.KEY['x0'] + (k + 0.5) * MG.KEY['pitch'], MG.KEY['yf'] + 0.03, MG.KEY['top'] + 0.0005))) for k in range(29)]
meas['controller'] = {
    'placementBlenderM': {k: MG.CTL[k] for k in ('cx', 'cy', 'zb', 'w', 'd', 'h')} | {'yawDeg': round(math.degrees(MG.CTL['yaw']), 2)},
    'eyeDistanceM': round((Vector((MG.CTL['cx'], MG.CTL['cy'], MG.CTL['zb'] + 0.05)) - EYE).length, 3),
    'azimuthAllVerticesDeg': [round(min(A_all), 2), round(max(A_all), 2), round(max(A_all) - min(A_all), 2)],
    'azimuthUnobstructedSamplesDeg': [round(min(A_vis), 2), round(max(A_vis), 2), round(max(A_vis) - min(A_vis), 2)],
    'whiteKeyTopsFirstHitKeys': sum(1 for p in white_tops if cast(p, 0.002) == 'ctl_keys__keys'),
    'whiteKeyPitchPx': {cam: [round(min(d_), 1), round(max(d_), 1)] for cam in ('music-1440', 'right-down', 'music-320-f74')
                        for d_ in [[math.dist(project(cam, a)[:2], project(cam, b)[:2]) for a, b in zip(white_tops, white_tops[1:])]]},
}
assert meas['controller']['azimuthUnobstructedSamplesDeg'][2] >= 30.0, meas['controller']
assert meas['keys'] == {'white': 29, 'black': 20}
print('FK M4 controller', json.dumps(meas['controller']))

# cymbals: bell and edge-lip samples from the eye (speaker is the accepted nearfield blocker to watch)
meas['cymbals'] = {}
for name, (c, R, tilt) in MG.CYMBALS.items():
    M = MG.tilt_toward(c, MG.PLAYER, tilt)
    bell = [Vector(MG.apply(M, (0.035 * math.cos(a), 0.035 * math.sin(a), 0.026))) for a in [2 * math.pi * k / 16 for k in range(16)]]
    edge = [Vector(MG.apply(M, ((R - 0.003) * math.cos(a), (R - 0.003) * math.sin(a), -0.004))) for a in [2 * math.pi * k / 32 for k in range(32)]]
    e = {'centre': list(c), 'radius': R, 'tiltDeg': tilt}
    for lab, pts in (('bell', bell), ('edge', edge)):
        hits = [cast(p) for p in pts]
        e[lab] = {'unobstructed': sum(1 for h in hits if h in ('drum_cymbals__cymbals', None)), 'of': len(pts),
                  'blockers': {h: hits.count(h) for h in sorted(set(h for h in hits if h not in ('drum_cymbals__cymbals', None)))},
                  'music-1440px': [project('music-1440', p)[:2] for p in pts[::4]]}
    meas['cymbals'][name] = e

# intersections: M4 leaves against every other leaf of a different asset; retained and cross-M4 geometry must be clear
TREES = {}
for obj in [o for o in scene.objects if o.parent == ROOT and o.type in ('MESH', 'CURVE')]:
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.transform(obj.matrix_world)
    ev.to_mesh_clear()
    TREES[obj.name] = (BVHTree.FromBMesh(bm), [v.co.copy() for v in bm.verts], obj.get('assetId'))
    bm.free()
accepted, decals = {}, {}
for a in MG.ROWS:
    for name, (tree, _, asset) in TREES.items():
        if name == a or asset == TREES[a][2] or (name in MG.ROWS and name < a):
            continue
        hits = TREES[a][0].overlap(tree)
        if hits:
            (decals if name.startswith('contact_decals') else accepted)[f'{a} x {name}'] = len(hits)
meas['intersections'] = {'m4VersusRetainedOrOtherM4Asset': accepted, 'm4VersusContactDecalsRecordedOnly': decals}
assert not accepted, accepted


def gap(a, b):
    ta, va = TREES[a][:2]
    tb, vb = TREES[b][:2]
    d_ = [tb.find_nearest(v)[3] for v in va] + [ta.find_nearest(v)[3] for v in vb]
    return round(min(x for x in d_ if x is not None), 4)


meas['restingGapsM'] = {f'{a} | {s}': gap(a, s) for a, s in (
    ('rug__rug', 'arch_floor__boards'), ('ctl_stand__frame', 'rug__rug'), ('ctl_body__shell', 'ctl_stand__frame'), ('ctl_keys__keys', 'ctl_body__shell'),
    ('ctl_sustain_pedal__pedal', 'rug__rug'), ('stool_keys__stool', 'rug__rug'), ('drum_rack__rack', 'rug__rug'), ('drum_kick__tower', 'rug__rug'),
    ('drum_hihat_pedal__pedal', 'rug__rug'), ('drum_throne__throne', 'rug__rug'), ('drum_pads__shells', 'drum_rack__rack'),
    ('drum_cymbals__cymbals', 'drum_rack__rack'), ('drum_module__body', 'drum_rack__rack'), ('drum_sticks__pair', 'drum_pads__shells'),
    ('music_cables__runs', 'rug__rug'), ('music_cables__runs', 'drum_module__body'), ('rug__rug', 'desk_frame__steel'), ('rug__rug', 'contact_decals__under_desk'),
    ('rug__rug', 'fix_floor_lamp__base'), ('ctl_body__shell', 'desk_top__top'), ('drum_cymbals__cymbals', 'speaker_nearfield__cabinet'))}
meas['placementsBlenderM'] = {'controller': meas['controller']['placementBlenderM'], 'stoolLocal': MG.STOOL, 'sustainLocal': MG.SUSTAIN,
                              'throne': MG.THRONE, 'rack': dict(MG.RACK, uprightX=[MG.UPRIGHT_L, MG.UPRIGHT_R], y=MG.RACK_Y),
                              'pads': MG.PADS, 'cymbals': MG.CYMBALS, 'kick': MG.KICK, 'hihatPedal': MG.HIHAT_PEDAL, 'module': MG.MODULE, 'rug': MG.RUG,
                              'mounts': HMETA['mounts']}
print('FK M4 measurements', json.dumps({k: meas[k] for k in ('targetRays', 'intersections', 'restingGapsM')}, default=str))
meas['sourceScript'] = 'source/build_fullkit_m4_v04.py'
meas['sourceScriptSha256'] = sha(os.path.abspath(__file__))

# ------------------------------------------------------------------ save the assembled editable source (held)
if 'blend' in FLAGS:
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT, check_existing=False, copy=True)
    meas['sourceBlend'] = os.path.relpath(BLEND_OUT, KIT).replace('\\', '/')
    meas['sourceBlendSha256'] = sha(BLEND_OUT)
    print('FK M4 saved', BLEND_OUT, meas['sourceBlendSha256'])

# ------------------------------------------------------------------ bake, join (verbatim M3 lines 909-951), raw export (held)
if 'glb' in FLAGS:
    def bake(obj, shared=None):
        me = shared or bpy.data.meshes.new_from_object(obj.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
        obj.data = me
        obj.modifiers.clear()
        return me

    side_mesh = bake(OBJ['mon_side__copilot'])
    side_mesh.name = 'mon_side_mesh'
    bake(OBJ['mon_side__typeforge'], side_mesh)
    for name in ('desk_top__top', 'desk_frame__steel', 'desk_mat__felt', 'mon_central__body', 'mon_top__body', 'pc_tower__case',
                 'sub_woofer__cabinet', 'sub_woofer__grille', 'fix_pendant__body'):
        bake(OBJ[name])

    def join(name, asset, parts):
        verts, polys, uvs = [], [], []
        for obj, swatch in parts:
            me = bpy.data.meshes.new_from_object(obj.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
            base = len(verts)
            verts += [obj.matrix_world @ v.co for v in me.vertices]
            layer = me.uv_layers.active
            for p in me.polygons:
                polys.append([base + me.loops[i].vertex_index for i in p.loop_indices])
                uvs += [SW[swatch] if swatch else tuple(layer.data[i].uv) for i in p.loop_indices]
            bpy.data.meshes.remove(me)
        out = bpy.data.meshes.new(name + '_mesh')
        out.from_pydata([tuple(v) for v in verts], [], polys)
        layer = out.uv_layers.new(name='UVMap')
        for loop, uv in zip(layer.data, uvs):
            loop.uv = uv
        for p in out.polygons:
            p.use_smooth = True
        out.set_sharp_from_angle(angle=math.radians(40))
        out.materials.append(MAT['lib_palette'])
        for obj, _ in parts:
            bpy.data.objects.remove(obj, do_unlink=True)
        return leaf(name, out, 'FK_WORKSTATION', asset, casts=False)

    mon_parts = [(o, 'black') for o in CABLES if o.get('assetId') == 'mon_cables'] + [(grommet, None)]
    power_parts = [(o, 'black') for o in CABLES if o.get('assetId') == 'under_desk_power'] + [(OBJ['under_desk_power__strip'], None)]
    join('mon_cables__runs', 'mon_cables', mon_parts)
    join('under_desk_power__strip_loom', 'under_desk_power', power_parts)
    for obj in bpy.data.objects:
        if obj.parent == ROOT:
            assert obj.type == 'MESH', obj.name
    exported = {ROOT} | {o for o in bpy.data.objects if o.parent == ROOT}
    for obj in bpy.data.objects:
        obj.select_set(obj in exported)
    props = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
    wanted = dict(filepath=RAW_OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
                  export_cameras=False, export_lights=False, export_extras=True, export_animations=False,
                  export_draco_mesh_compression_enable=False, export_image_format='AUTO', export_tangents=False,
                  export_vertex_color='NONE', export_skins=False, export_morph=False)
    bpy.ops.export_scene.gltf(**{k: v for k, v in wanted.items() if k == 'filepath' or k in props})

    # author readback only (identity, names, new-row counts); the exact retained comparison is the Codex guard's job
    raw = open(RAW_OUT, 'rb').read()
    jlen = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20 + jlen])
    names = {n['name']: n for n in doc['nodes']}
    readback = {}
    for row in MG.ROWS:
        n = names[row]
        prims = doc['meshes'][n['mesh']]['primitives']
        readback[row] = {'primitives': len(prims), 'triangles': sum(doc['accessors'][p['indices']]['count'] // 3 for p in prims),
                         'material': [doc['materials'][p['material']]['name'] for p in prims], 'extras': n.get('extras', {})}
    meas['exportReadback'] = {'rawExport': os.path.relpath(RAW_OUT, KIT).replace('\\', '/'), 'rawSha256': hashlib.sha256(raw).hexdigest(),
                              'rawBytes': len(raw), 'nodes': len(doc['nodes']), 'meshNodes': sum(1 for n in doc['nodes'] if 'mesh' in n),
                              'sceneExtras': doc['scenes'][0].get('extras'), 'newRows': readback,
                              'note': 'Raw export only. Retained-byte parity, final candidate and paired manifest wait for the frozen transition guard.'}
    print('FK M4 raw exported', RAW_OUT, len(raw), meas['exportReadback']['rawSha256'])

if FLAGS:
    with open(MEAS_OUT, 'x', encoding='utf-8') as f:
        json.dump(meas, f, indent=1, default=str)
    print('FK M4 measurements written', MEAS_OUT)
else:
    print('FK M4 dry run: nothing written')
print('FK M4 done', TAG)
