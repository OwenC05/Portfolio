"""Studio v2 full kit, stage M2, PC readability repair v04 (zero-count change, root scope m2-pc-repair-scope.md).

Run (one hidden process, never interactive):
  blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
      --python build_fullkit_m2_pc_v04.py -- [blend] [glb]
  Optional: environment FK_V04_PROBE_GLB=<path outside the repo> exports a probe there and writes nothing in the kit.

Base: build_fullkit_m2_material_v03.py (sha256 pinned) run in its dry mode, which runs the unchanged M2 and M1
builders. That is the exact editable v03 state, lib_glow v03 values included. Then exactly two edits:

1. pc_tower__case: the four loops of the one front-panel pocket floor quad (the face framed_box recoloured with the
   'black' swatch at y = yf + 0.008, normal -Y) move from the 'black' palette cell centre to the existing 'paper'
   cell centre (#e9e4d6, roughness 0.9, metallic 0): a pale matte mesh panel inside the white_pc frame, against
   which the metal fan rings and black_metal hubs/blades read. The pocket edges carry no bevel weight, so no bevelled
   face interpolates this UV. No palette pixel changes; positions, normals, indices, transforms are untouched.
2. pc_tower__glow: the same 8-vertex, 12-triangle bar (239 x 5 x 3.5 mm) is translated (no rotation) from the hidden
   PSU shroud front edge to lie on the shroud top against the inner back wall, starting at the glass-side inner wall.
   Seen through the glass from the fixed eye it is a thin warm line; the front panel hides its far (+X) end, which is
   the restraint. UVs (all 0.5, 0.5), material lib_glow (v03 values), nocast, flags, normals, indices and the identity
   object transform are unchanged; only its vertex positions move. (A rotated vertical bar was probed and rejected:
   rotation re-orders the exported index stream.)
"""
import bpy, sys, os, json, runpy, hashlib, struct, math
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index('--') + 1:]
FLAGS = set(ARGS)
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
EXPORTS, MANIFESTS = os.path.join(KIT, 'exports'), os.path.join(KIT, 'manifests')
V03_SCRIPT = os.path.join(HERE, 'build_fullkit_m2_material_v03.py')
V03_SCRIPT_SHA = 'b4218d03094766ee30de7874afe42a55273ef27b95e34ee9d6a8db6c9d49574a'
V03_GLB = os.path.join(EXPORTS, 'studio-full-kit-m2-proposal-v03.glb')
V03_GLB_SHA = '7c0d30428065d0024bb1c4a631a3b54504008edcccab91c75e7367a53fa57752'
BLEND_OUT = os.path.join(HERE, 'fk-20-workstation-pc-v04.blend')
GLB_OUT = os.path.join(EXPORTS, 'studio-full-kit-m2-proposal-v04.glb')
MEAS_OUT = os.path.join(MANIFESTS, 'm2-pc-v04-author-measurements.json')
PROBE = os.environ.get('FK_V04_PROBE_GLB')
if PROBE:
    FLAGS = {'glb'}
    GLB_OUT = PROBE
    if os.path.exists(PROBE):
        os.remove(PROBE)


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def fresh(path):
    if os.path.exists(path):
        raise RuntimeError('Refusing to overwrite existing deliverable: ' + path)
    return path


assert sha(V03_SCRIPT) == V03_SCRIPT_SHA, 'v03 script differs from the recorded version'
assert sha(V03_GLB) == V03_GLB_SHA, 'v03 GLB differs from the recorded candidate'
if not PROBE:
    if 'blend' in FLAGS:
        fresh(BLEND_OUT)
    if 'glb' in FLAGS:
        fresh(GLB_OUT)
    if FLAGS & {'blend', 'glb'}:
        fresh(MEAS_OUT)

# ------------------------------------------------------------------ v03 editable state (writes nothing)
_argv = sys.argv
sys.argv = [_argv[0], '--']
G3 = runpy.run_path(V03_SCRIPT, run_name='fk_v03_base')
sys.argv = _argv
G2, meas = G3['G'], G3['meas']
G1 = G2['G']
scene, MAT, SW, ROOT, OBJ, CABLES, grommet, leaf = (G2[k] for k in ('scene', 'MAT', 'SW', 'ROOT', 'OBJ', 'CABLES', 'grommet', 'leaf'))
EYE, PC = Vector(G1['EYE']), G2['PC']
scene['fk_tag'], scene['fk_m2_tag'] = 'm2base-v04', 'v04-pc'
meas.pop('exportReadback', None)
meas.pop('sourceBlend', None)
meas.pop('sourceBlendSha256', None)
x0, x1, yf, yb, zb, zt, t = (PC[k] for k in ('x0', 'x1', 'yf', 'yb', 'zb', 'zt', 't'))
IX0, IX1 = x0 + t, x1 - t
case, glow, glass = OBJ['pc_tower__case'], OBJ['pc_tower__glow'], OBJ['pc_tower__glass']

# ------------------------------------------------------------------ 1. front panel UV: black -> paper (one face)
cme = case.data
uvl = cme.uv_layers.active.data
r6 = lambda v: tuple(round(c, 6) for c in v)
panel = [p for p in cme.polygons
         if {r6(uvl[i].uv) for i in p.loop_indices} == {r6(SW['black'])} and p.normal.y < -0.99 and abs(p.center.y - (yf + 0.008)) < 0.001]
assert len(panel) == 1 and len(panel[0].loop_indices) == 4, [p.index for p in panel]
panel = panel[0]
pverts = [list(map(lambda c: round(c, 5), cme.vertices[v].co)) for v in panel.vertices]
case_co_before = [v.co.copy() for v in cme.vertices]
for i in panel.loop_indices:
    uvl[i].uv = SW['paper']
assert [v.co for v in cme.vertices] == case_co_before
meas['pcV04'] = {'frontPanelUv': {
    'object': 'pc_tower__case', 'editablePolygonIndex': panel.index, 'loops': list(panel.loop_indices), 'vertices': pverts,
    'faceCentreBlenderM': [round(c, 5) for c in panel.center], 'faceAreaM2': round(panel.area, 6),
    'uvBefore': {'swatch': 'black', 'uv': list(SW['black'])}, 'uvAfter': {'swatch': 'paper', 'uv': list(SW['paper'])},
    'why': 'The only black-swatch face of pc_tower__case with normal -Y at the pocket floor depth (yf + 0.008); framed_box recoloured exactly this face. '
           'Fan rings, hubs and blades are separate faces proud of it and keep metal / black_metal.'}}

# ------------------------------------------------------------------ 2. glow bar: rigid move to the inner back wall
gme = glow.data
assert len(gme.vertices) == 8 and len(gme.polygons) == 6 and [list(r) for r in glow.matrix_world] == [list(r) for r in Matrix()]
g_before = [v.co.copy() for v in gme.vertices]
glo = Vector([min(v[i] for v in g_before) for i in range(3)]); ghi = Vector([max(v[i] for v in g_before) for i in range(3)])
EPS = 0.0003
size = ghi - glo                                    # 0.239 x 0.005 x 0.0035 m as built
# Pure translation: a rotation changes the face normals, and the exporter orders each vertex's split copies by normal,
# so any rotation re-orders the index stream (it un-shares accessor 3; probes 1 and 2 recorded this). A translation keeps
# normals, quad topology, the axis-aligned (exact) triangulation and therefore the index stream byte-identical.
# The bar keeps its orientation: 239 mm along X, 5 mm deep (Y), 3.5 mm tall (Z), lying on the PSU shroud top against
# the inner back wall, starting 0.3 mm from the glass-side inner wall.
target_centre = Vector((IX0 + EPS + size.x / 2, yb - t - EPS - size.y / 2, 0.14 + EPS + size.z / 2))
M = Matrix.Translation(target_centre - (glo + ghi) / 2)
for v, c in zip(gme.vertices, g_before):
    v.co = M @ c
gme.update()
bpy.context.view_layer.update()
g_after = [v.co.copy() for v in gme.vertices]
alo = [min(v[i] for v in g_after) for i in range(3)]; ahi = [max(v[i] for v in g_after) for i in range(3)]
interior = ([IX0, yf + 0.021 + t, zb + t], [IX1, yb - t, zt - t])
inside = all(interior[0][i] < alo[i] and ahi[i] < interior[1][i] for i in range(3))
assert inside, (alo, ahi, interior)
meas['pcV04']['glow'] = {
    'object': 'pc_tower__glow', 'vertices': 8, 'triangles': 12, 'objectTransform': 'identity (unchanged)',
    'boundsBeforeBlenderM': [[round(c, 5) for c in glo], [round(c, 5) for c in ghi]],
    'boundsAfterBlenderM': [[round(c, 5) for c in alo], [round(c, 5) for c in ahi]],
    'rigidTransform': 'translate(%s) (pure translation; no rotation, so normals are unchanged)' % [round(c, 6) for c in (target_centre - (glo + ghi) / 2)],
    'caseInteriorBlenderM': interior, 'insideCaseInterior': inside,
    'placement': 'horizontal bar (unchanged orientation) lying 0.3 mm above the PSU shroud top, 0.3 mm in front of the inner back wall, '
                 'starting 0.3 mm from the glass-side inner wall; no intersection with any other mesh (BVH-checked below)'}

# ------------------------------------------------------------------ save the editable source first
if 'blend' in FLAGS and not PROBE:
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT, check_existing=False, copy=True)
    meas['sourceBlend'] = os.path.relpath(BLEND_OUT, KIT).replace('\\', '/')
    meas['sourceBlendSha256'] = sha(BLEND_OUT)
    print('FK saved', BLEND_OUT)
meas['sourceScript'] = 'source/build_fullkit_m2_pc_v04.py'
meas['sourceScriptSha256'] = sha(os.path.abspath(__file__))
meas['baseScript'] = 'source/build_fullkit_m2_material_v03.py'
meas['baseScriptSha256'] = V03_SCRIPT_SHA

# ------------------------------------------------------------------ measurements (evaluated editable state)
dg = bpy.context.evaluated_depsgraph_get()


def tree(obj):
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    vs = [obj.matrix_world @ v.co for v in me.vertices]
    tr = BVHTree.FromPolygons(vs, [list(p.vertices) for p in me.polygons])
    ev.to_mesh_clear()
    return tr, vs


g_tree, g_vs = tree(glow)
others = [o for o in bpy.data.objects if o.type == 'MESH' and o.parent == ROOT and o is not glow and o.visible_get()]
hits = []
for o in others:
    tr, vs = tree(o)
    if tr.overlap(g_tree):
        hits.append(o.name)
case_tree, case_vs = tree(case)
gap = min((case_tree.find_nearest(v)[3] for v in g_vs))
meas['pcV04']['glowIntersections'] = hits
meas['pcV04']['glowMinimumGapToCaseM'] = round(gap, 5)
assert not hits, hits


def visible(pt):
    origin, d = EYE.copy(), pt - EYE
    dist = d.length
    d.normalize()
    travelled = 0.0
    for _ in range(6):
        hit, loc, nrm, idx, obj, mtx = scene.ray_cast(dg, origin, d, distance=dist - travelled + 0.002)
        if not hit:
            return None
        if obj.name == 'pc_tower__glass':
            travelled += (loc - origin).length + 1e-4
            origin = loc + d * 1e-4
            continue
        return obj.name
    return None


def first_hit(pt, slack=0.02):
    d = pt - EYE
    hit, loc, nrm, idx, obj, mtx = scene.ray_cast(dg, EYE, d.normalized(), distance=d.length + slack)
    return obj.name if hit else None


def grid(f, nu, nv):
    return [f(i / (nu - 1), j / (nv - 1)) for i in range(nu) for j in range(nv)]


top = grid(lambda u, v: Vector((x0 + 0.004 + u * (x1 - x0 - 0.008), yf + 0.004 + v * (yb - yf - 0.008), zt + 0.0025)), 11, 11)
front = grid(lambda u, v: Vector((x0 + 0.005 + u * (x1 - x0 - 0.01), yf - 0.001, zb + 0.005 + v * (zt - zb - 0.01))), 7, 15)
gsamples = []
gme.calc_loop_triangles()
for p in gme.loop_triangles:
    a_, b_, c_ = [gme.vertices[i].co for i in p.vertices]
    for i in range(12):
        for j in range(12 - i):
            u, w = (i + 1 / 3) / 12, (j + 1 / 3) / 12
            gsamples.append(a_ + (b_ - a_) * u + (c_ - a_) * w + p.normal * 0.0002)
gvis = [s for s in gsamples if visible(s) == 'pc_tower__glow']
cams = {}
for name, yaw, pitch, fov, rx, ry in [('home-1440', -4, -6, 58, 1440, 900), ('home-1024', -4, -6, 58, 1024, 768), ('music-1440', 44, -8, 58, 1440, 900),
                                      ('v04-mid-right-1440', 30, -6, 58, 1440, 900), ('v04-music-390-f74', 44, -8, 74, 390, 844)]:
    cams[name] = bpy.data.objects[name] if name in bpy.data.objects else G1['camera'](name, yaw, pitch, fov, rx, ry)


def project(cam, co):
    scene.render.resolution_x, scene.render.resolution_y = cam['res_x'], cam['res_y']
    p = world_to_camera_view(scene, cam, co)
    return (round(p.x * cam['res_x'], 1), round((1 - p.y) * cam['res_y'], 1), p.z > 0 and 0 <= p.x <= 1 and 0 <= p.y <= 1)


views = {}
for cn, cam in cams.items():
    pg = [p for p in (project(cam, s) for s in gvis) if p[2]]
    pf = [p for p in (project(cam, s) for s in front if first_hit(s) == 'pc_tower__case') if p[2]]
    views[cn] = {'glowVisibleSamplesInFrame': len(pg),
                 'glowPx': ({'x': [min(p[0] for p in pg), max(p[0] for p in pg)], 'y': [min(p[1] for p in pg), max(p[1] for p in pg)]} if pg else None),
                 'frontPanelVisibleSamplesInFrame': len(pf),
                 'frontPx': ({'x': [min(p[0] for p in pf), max(p[0] for p in pf)], 'y': [min(p[1] for p in pf), max(p[1] for p in pf)]} if pf else None)}
meas['pcV04']['fixedEye'] = {
    'topSamples': len(top), 'topSamplesVisibleFromEye': sum(1 for p in top if (first_hit(p) or '').startswith('pc_tower')),
    'frontSamples': len(front), 'frontSamplesVisible': sum(1 for p in front if first_hit(p) == 'pc_tower__case'),
    'glowSamples': len(gsamples), 'glowSamplesVisibleThroughGlass': len(gvis),
    'views': views,
    'note': 'Exact Blender ray casts and projections with the runtime-matched yaw/pitch/FOV cameras; no UI chrome. Glow visibility skips only the BLEND glass quad.'}
assert meas['pcV04']['fixedEye']['topSamplesVisibleFromEye'] == 0
print('FK v04 fixed eye', json.dumps(meas['pcV04']['fixedEye']))


def chunks(raw):
    jlen = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20 + jlen])
    blen = struct.unpack_from('<I', raw, 20 + jlen)[0]
    return doc, raw[28 + jlen:28 + jlen + blen]


# ------------------------------------------------------------------ bake and export (verbatim v02/v03 path)
if 'glb' in FLAGS:
    for cam in cams.values():
        cam.select_set(False)

    def bake(obj, shared=None):
        me = shared or bpy.data.meshes.new_from_object(obj.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
        old = obj.data
        obj.data = me
        obj.modifiers.clear()
        return me, old

    side_mesh, side_old = bake(OBJ['mon_side__copilot'])
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
    wanted = dict(filepath=GLB_OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
                  export_cameras=False, export_lights=False, export_extras=True, export_animations=False,
                  export_draco_mesh_compression_enable=False, export_image_format='AUTO', export_tangents=False,
                  export_vertex_color='NONE', export_skins=False, export_morph=False)
    bpy.ops.export_scene.gltf(**{k: v for k, v in wanted.items() if k == 'filepath' or k in props})

    # ---------------------------------------------------------------- paired comparison with v03
    raw4, raw3 = open(GLB_OUT, 'rb').read(), open(V03_GLB, 'rb').read()
    d4, bin4 = chunks(raw4)
    d3, bin3 = chunks(raw3)
    node_mesh = {n['name']: n['mesh'] for n in d3['nodes'] if 'mesh' in n}
    case_prim, glow_prim = d3['meshes'][node_mesh['pc_tower__case']]['primitives'][0], d3['meshes'][node_mesh['pc_tower__glow']]['primitives'][0]
    allowed = {case_prim['attributes']['TEXCOORD_0']: 'pc_tower__case TEXCOORD_0', glow_prim['attributes']['POSITION']: 'pc_tower__glow POSITION',
               glow_prim['attributes']['NORMAL']: 'pc_tower__glow NORMAL'}
    attr_of = {}
    for m in d3['meshes']:
        for p in m['primitives']:
            for key, acc in list(p['attributes'].items()) + [('indices', p.get('indices'))]:
                if acc is not None:
                    attr_of.setdefault(acc, []).append(f"{m['name']} {key}")
    acc_by_view = {}
    for i, a in enumerate(d3['accessors']):
        acc_by_view.setdefault(a.get('bufferView'), []).append(i)
    word_diffs, changed_acc = [], {}
    for vi, view in enumerate(d3['bufferViews']):
        o, n = view.get('byteOffset', 0), view['byteLength']
        if bin4[o:o + n] == bin3[o:o + n]:
            continue
        accs = acc_by_view.get(vi, [])
        for j in range(0, n - n % 4, 4):
            if bin4[o + j:o + j + 4] != bin3[o + j:o + j + 4]:
                acc = accs[0] if len(accs) == 1 else None
                changed_acc[acc] = changed_acc.get(acc, 0) + 1
                word_diffs.append({'bufferView': vi, 'byteOffsetInView': j, 'accessor': acc, 'attribute': attr_of.get(acc, ['?']),
                                   'v03': struct.unpack('<f', bin3[o + j:o + j + 4])[0], 'v04': struct.unpack('<f', bin4[o + j:o + j + 4])[0]})
    acc_json_diff = [i for i, (a4, a3) in enumerate(zip(d4['accessors'], d3['accessors'])) if a4 != a3]
    same = {k: d4.get(k) == d3.get(k) for k in ('nodes', 'meshes', 'bufferViews', 'images', 'textures', 'samplers', 'materials', 'extensionsUsed')}
    same['accessorCount'] = len(d4['accessors']) == len(d3['accessors'])
    same['scenesExceptTagExtras'] = [dict(s, extras=None) for s in d4['scenes']] == [dict(s, extras=None) for s in d3['scenes']]
    uv_changes = [w for w in word_diffs if w['accessor'] == case_prim['attributes']['TEXCOORD_0']]
    # Same bounded rule as v03 (recorded there): outside the authorised accessors, only TEXCOORD_0 float32 evaluation
    # noise of at most 2^-20 is accepted, and every such word is recorded and reported as an exporter dependency.
    noise = [dict(w, absDelta=abs(w['v04'] - w['v03'])) for w in word_diffs if w['accessor'] not in allowed]
    noise_ok = all(len(w['attribute']) >= 1 and all(a.endswith(' TEXCOORD_0') for a in w['attribute']) and w['absDelta'] <= 2 ** -20 for w in noise)
    meas['exportReadback'] = {
        'glb': os.path.relpath(GLB_OUT, KIT).replace('\\', '/'), 'glbBytes': len(raw4), 'glbSha256': hashlib.sha256(raw4).hexdigest(),
        'pairedWith': {'glb': 'exports/studio-full-kit-m2-proposal-v03.glb', 'glbBytes': len(raw3), 'glbSha256': V03_GLB_SHA},
        'binChunkBytes': [len(bin4), len(bin3)], 'jsonSectionsIdentical': same,
        'accessorsWithChangedBytes': {str(k): {'words': v, 'is': allowed.get(k, attr_of.get(k, '?'))} for k, v in changed_acc.items()},
        'accessorsWithChangedJson': [{'accessor': i, 'is': allowed.get(i, attr_of.get(i)), 'v03': d3['accessors'][i], 'v04': d4['accessors'][i]} for i in acc_json_diff],
        'caseUvWordChanges': uv_changes,
        'glowWordChanges': len([w for w in word_diffs if w['accessor'] in (glow_prim['attributes']['POSITION'], glow_prim['attributes']['NORMAL'])]),
        'exporterNoiseWords': noise,
        'exporterNoiseRule': 'Outside the authorised accessors only TEXCOORD_0 words with |delta| <= 2^-20 (float32 evaluation noise of the unchanged builders, as recorded for v03) are accepted; all are listed here.',
    }
    ok = (len(bin4) == len(bin3) and all(same.values()) and noise_ok and set(acc_json_diff) <= {glow_prim['attributes']['POSITION']}
          and case_prim['attributes']['TEXCOORD_0'] in changed_acc and len(uv_changes) <= 8)
    meas['exportReadback']['pairedCheckPassed'] = ok
    print('FK v04 exported', GLB_OUT, len(raw4), json.dumps({k: v for k, v in meas['exportReadback'].items() if k not in ('caseUvWordChanges', 'accessorsWithChangedJson')}))
    print('FK v04 uv changes', json.dumps(uv_changes))
    assert ok, 'v04 differs from v03 beyond the authorised case UV and glow positions/normals'

if FLAGS & {'blend', 'glb'} and not PROBE:
    json.dump(meas, open(MEAS_OUT, 'w', encoding='utf-8'), indent=1, default=str)
    print('FK v04 measurements written', MEAS_OUT)
print('FK v04 done')
