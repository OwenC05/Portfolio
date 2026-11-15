"""Studio v2 full kit, stage M3 nearfield: authored desk gear on the frozen M2 parent (PREPARED SOURCE, NOT YET RUN).

Status: prepared under task_d31f70e55a5d. It has not been executed. M3 export and saving the assembled blend are held
until root releases them: the parent v05 must first pass root delta, capture and independent review, and the export
handoff supplies the frozen parent identity. The script enforces that hold (see RELEASE below).

Run (one hidden process, never interactive):
  blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
      --python build_fullkit_m3.py -- [blend] [glb]
  - No flags: dry run. Builds and measures in memory and writes nothing. Allowed only when root allows a Blender run.
  - blend / glb: refused unless environment FK_M3_PARENT_RELEASE equals the pinned parent v05 GLB SHA-256, i.e. the
    export handoff has explicitly released this parent identity.

Base chain (all pinned by SHA-256; nothing is modified):
  build_fullkit.py (M1) -> build_fullkit_m2.py (M2) -> build_fullkit_m2_material_v03.py -> build_fullkit_m2_pc_v04.py, run
  dry. That is the editable state of v04, and also of v05: v05 is v04 with four exporter-noise words restored
  byte-for-byte (build_fullkit_m2_pc_v05.py), and has no editable change. The paired check after export compares
  every retained leaf with the frozen v05 GLB.

M3 removes the eleven grey proxies of the eight M3 assets and authors exactly the nine ledger rows (root-binding
per-row placed-triangle ceilings, export-ledger-v01 rows 64-72):
  kb_case__frost_shell 700 | kb_case__plate_cable 700 | kb_keycaps__caps 4700 | mouse_native__body 900 |
  mug_coaster__mug_coaster 800 | notebook_pen__set 400 | mic_boom__assembly 2600 | headphones__on_stand 2200 |
  speaker_nearfield__cabinet 1100
Stage limits: 10 main / 18 refresh / 15,500 placed (additional limits, not permission to overrun a row).

Every M3 mesh is authored explicitly, with no modifiers or curves, so its triangle count is exact and is asserted
against its row before anything is written. Units: Blender metres, Z up.

T2: two new palette cells, index 19 'oak_tone' and index 20 'dark_oak'. These are previously unused cells. Every
existing pixel, cell and UV meaning is preserved, and that is asserted on the in-memory image and again on the
decoded exported PNG.

Frost: lib_frost is first exported here. It is single-sided (backface culling), BLEND, non-occluder, nocast,
noreceive, with an explicit renderOrder of 1.5: after contacts (1) and before PC glass (2). The runtime loader disables
depth writing; no loader patch.
"""
import bpy, bmesh, sys, os, math, json, runpy, hashlib, struct, zlib
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
FLAGS = set(ARGS)
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
EXPORTS, MANIFESTS = os.path.join(KIT, 'exports'), os.path.join(KIT, 'manifests')
TAG = 'v01'
V04_SCRIPT = os.path.join(HERE, 'build_fullkit_m2_pc_v04.py')
V04_SCRIPT_SHA = '62d0733e46c8d7e91e7d91ae904ff20ac469850148ac207b8c953b8f334de551'
V05_STEP = os.path.join(HERE, 'build_fullkit_m2_pc_v05.py')
V05_STEP_SHA = '27a6112aca02015e5b1ee4a83193521d46378b0cf39e4b8a5148bb0f4e9fd888'
PARENT_GLB = os.path.join(EXPORTS, 'studio-full-kit-m2-proposal-v05.glb')
PARENT_SHA = '4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735'
BLEND_OUT = os.path.join(HERE, f'fk-30-nearfield-proposal-{TAG}.blend')
RAW_OUT = os.path.join(EXPORTS, f'studio-full-kit-m3-proposal-{TAG}.raw-export.glb')
GLB_OUT = os.path.join(EXPORTS, f'studio-full-kit-m3-proposal-{TAG}.glb')
MEAS_OUT = os.path.join(MANIFESTS, f'm3-{TAG}-author-measurements.json')

ROWS = {  # leaf: (assetId, placed-triangle ceiling, casts)
    'kb_case__frost_shell': ('kb_case', 700, False),
    'kb_case__plate_cable': ('kb_case', 700, True),
    'kb_keycaps__caps': ('kb_keycaps', 4700, False),
    'mouse_native__body': ('mouse_native', 900, True),
    'mug_coaster__mug_coaster': ('mug_coaster', 800, True),
    'notebook_pen__set': ('notebook_pen', 400, True),
    'mic_boom__assembly': ('mic_boom', 2600, True),
    'headphones__on_stand': ('headphones', 2200, True),
    'speaker_nearfield__cabinet': ('speaker_nearfield', 1100, True),
}
STAGE_LIMITS = dict(main=10, refresh=18, placed=15500)
M3_ASSETS = sorted({v[0] for v in ROWS.values()} | {'notebook_pen'})
FROST_RENDER_ORDER = 1.5


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def fresh(path):
    if os.path.exists(path):
        raise RuntimeError('Refusing to overwrite existing deliverable: ' + path)
    return path


# ------------------------------------------------------------------ RELEASE: hold on export / assembled save
if FLAGS & {'blend', 'glb'}:
    if os.environ.get('FK_M3_PARENT_RELEASE') != PARENT_SHA:
        raise SystemExit('M3 save/export is HELD: set FK_M3_PARENT_RELEASE to the released parent v05 SHA-256 '
                         '(supplied by the export handoff after root review of v05).')
    for p in ([BLEND_OUT] if 'blend' in FLAGS else []) + ([RAW_OUT, GLB_OUT] if 'glb' in FLAGS else []) + [MEAS_OUT]:
        fresh(p)
assert sha(V04_SCRIPT) == V04_SCRIPT_SHA, 'v04 builder differs from the pinned version'
assert sha(V05_STEP) == V05_STEP_SHA, 'v05 restoration step differs from the pinned version'
assert sha(PARENT_GLB) == PARENT_SHA, 'parent v05 GLB differs from the pinned identity'

# ------------------------------------------------------------------ editable parent state (writes nothing)
_argv = sys.argv
sys.argv = [_argv[0], '--']
G4 = runpy.run_path(V04_SCRIPT, run_name='fk_v04_base')
sys.argv = _argv
G3 = G4['G3']
G2 = G3['G']
G1 = G2['G']
scene, MAT, SW, ROOT, OBJ, CABLES, grommet, leaf = (G2[k] for k in ('scene', 'MAT', 'SW', 'ROOT', 'OBJ', 'CABLES', 'grommet', 'leaf'))
Build, cube, cylinder, ring, prism = (G2[k] for k in ('Build', 'cube', 'cylinder', 'ring', 'prism'))
EPS, DESK, MON, TRAY, GROMMET = G2['EPS'], G2['DESK'], G2['MON'], G2['TRAY'], G2['GROMMET']
EYE = Vector(G1['EYE'])
scene['fk_tag'], scene['fk_stage'], scene['fk_m3_tag'] = 'm3-' + TAG, 'M3', TAG

REMOVED = []
for obj in list(bpy.data.objects):
    if obj.get('assetId') in M3_ASSETS and '__proxy' in obj.name:
        REMOVED.append(obj.name)
        bpy.data.objects.remove(obj, do_unlink=True)
REMOVED.sort()
assert REMOVED == sorted(['headphones__proxy_on_stand', 'kb_case__proxy_case', 'kb_keycaps__proxy_accent_caps', 'kb_keycaps__proxy_cap_field',
                          'mic_boom__proxy_arm', 'mic_boom__proxy_capsule', 'mic_boom__proxy_clamp', 'mouse_native__proxy_body',
                          'mug_coaster__proxy_mug', 'notebook_pen__proxy_notebook', 'speaker_nearfield__proxy_cabinet']), REMOVED

# ------------------------------------------------------------------ T2: two new palette cells (existing pixels preserved)
GRID, CELL = G1['GRID'], G1['CELL']
assert len(G1['SWATCHES']) == 19 and 'oak_tone' not in SW and 'dark_oak' not in SW
T2 = [('oak_tone', 0xa47c55, 0.62, 0.0), ('dark_oak', 0x5e4130, 0.55, 0.0)]   # index 19, 20: row 2, columns 3 and 4
img_c, img_o = G1['IMG_PALETTE'], G1['IMG_ORM']
W_PX, H_PX = img_c.size
before_c, before_o = list(img_c.pixels), list(img_o.pixels)
new_c, new_o = list(before_c), list(before_o)
t2_cells = {}
for k, (name, colour, rough, metal) in enumerate(T2):
    index = len(G1['SWATCHES']) + k
    row, col = divmod(index, GRID)
    lin = G1['srgb'](colour)
    disp = [c * 12.92 if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055 for c in lin]
    for py in range(row * CELL, (row + 1) * CELL):            # py counted from the top, as M1 wrote rgba[::-1]
        for px in range(col * CELL, (col + 1) * CELL):
            i = ((H_PX - 1 - py) * W_PX + px) * 4
            new_c[i:i + 4] = [*disp, 1.0]
            new_o[i:i + 4] = [1.0, rough, metal, 1.0]
    SW[name] = ((col + 0.5) / GRID, 1 - (row + 0.5) / GRID)
    t2_cells[name] = {'index': index, 'row': row, 'col': col, 'srgb': '#%06x' % colour, 'roughness': rough, 'metallic': metal, 'uv': list(SW[name])}
img_c.pixels.foreach_set(new_c)
img_o.pixels.foreach_set(new_o)
img_c.update(); img_o.update()
img_c.pack(); img_o.pack()                                    # repack the edited buffers in memory; textures/ untouched
after_c, after_o = list(img_c.pixels), list(img_o.pixels)
new_px = {((H_PX - 1 - py) * W_PX + px) for k in range(len(T2)) for (row, col) in [divmod(len(G1['SWATCHES']) + k, GRID)]
          for py in range(row * CELL, (row + 1) * CELL) for px in range(col * CELL, (col + 1) * CELL)}
for arr_b, arr_a in ((before_c, after_c), (before_o, after_o)):
    for p in range(W_PX * H_PX):
        if p not in new_px:
            assert arr_a[4 * p:4 * p + 4] == arr_b[4 * p:4 * p + 4], 'T2 changed an existing palette pixel'

# ------------------------------------------------------------------ frost: first export of lib_frost
assert not [o.name for o in bpy.data.objects if o.type == 'MESH' and MAT['lib_frost'].name in [m.name for m in o.data.materials]], 'lib_frost already consumed'
MAT['lib_frost'].use_backface_culling = True                  # glTF doubleSided false: one main pass

# ------------------------------------------------------------------ geometry helpers (exact counts, no modifiers)
SHARP = math.radians(40)


def finalize(b, groups):
    """groups: [(faces, swatch)]. One normal recalculation over all faces, palette UVs per group, sharp edges > 40 deg."""
    faces = [f for fs, _ in groups for f in fs]
    bmesh.ops.recalc_face_normals(b.bm, faces=faces)
    for fs, swatch in groups:
        for f in fs:
            f.smooth = True
            for loop in f.loops:
                loop[b.uv].uv = SW[swatch]
    for e in {e for f in faces for e in f.edges}:
        sharp = len(e.link_faces) == 2 and e.calc_face_angle(0.0) > SHARP
        e[b.bw] = 0.0
        e.smooth = not sharp
    return faces


def loft(b, rings, swatches, cap_start=None, cap_end=None):
    """rings: list of [Vector] (closed loops, equal length) or a single Vector (pole). Quads between loops, fans to poles,
    optional n-gon caps (swatch names) on the first / last loop. swatches: one name or one per strip."""
    vr = [[b.bm.verts.new(p) for p in r] if isinstance(r, list) else [b.bm.verts.new(r)] for r in rings]
    groups = []
    for k in range(len(vr) - 1):
        a, c = vr[k], vr[k + 1]
        sw = swatches if isinstance(swatches, str) else swatches[k]
        if len(a) > 1 and len(c) > 1:
            n = len(a)
            fs = [b.bm.faces.new((a[i], a[(i + 1) % n], c[(i + 1) % n], c[i])) for i in range(n)]
        elif len(a) == 1:
            fs = [b.bm.faces.new((a[0], c[(i + 1) % len(c)], c[i])) for i in range(len(c))]
        else:
            fs = [b.bm.faces.new((a[i], a[(i + 1) % len(a)], c[0])) for i in range(len(a))]
        groups.append((fs, sw))
    if cap_start:
        groups.append(([b.bm.faces.new(list(reversed(vr[0])))], cap_start))
    if cap_end:
        groups.append(([b.bm.faces.new(vr[-1])], cap_end))
    finalize(b, groups)
    return groups


def frame(origin, axis, up=Vector((0, 0, 1))):
    """Matrix whose local Z is `axis` at `origin`."""
    q = Vector(axis).normalized().to_track_quat('Z', 'Y' if abs(Vector(axis).normalized().dot(up)) < 0.99 else 'X')
    return Matrix.Translation(origin) @ q.to_matrix().to_4x4()


def lathe(b, M, profile, n, swatches, phase=0.0):
    """Revolve [(r, z)] about local Z of M; r == 0 gives a pole."""
    rings = []
    for r, z in profile:
        if r == 0:
            rings.append(M @ Vector((0, 0, z)))
        else:
            rings.append([M @ Vector((r * math.cos(2 * math.pi * i / n + phase), r * math.sin(2 * math.pi * i / n + phase), z)) for i in range(n)])
    return loft(b, rings, swatches)


def sweep(b, pts, r1, sides, swatches, r2=None, up=None, caps=True, cap_swatch=None):
    """Tube along a polyline; section ellipse r1 (along `up` or a transported normal) x r2."""
    pts = [Vector(p) for p in pts]
    rings, prev = [], None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        ref = Vector(up) if up is not None else (prev if prev is not None else t.orthogonal())
        nrm = (ref - t * ref.dot(t)).normalized()
        prev = nrm
        bi = t.cross(nrm)
        rings.append([p + nrm * (r1 * math.cos(2 * math.pi * k / sides)) + bi * ((r2 or r1) * math.sin(2 * math.pi * k / sides)) for k in range(sides)])
    sw0 = swatches if isinstance(swatches, str) else swatches[0]
    return loft(b, rings, swatches, cap_start=(cap_swatch or sw0) if caps else None, cap_end=(cap_swatch or sw0) if caps else None)


def rrect(w, d, r, n):
    """Rounded rectangle, counter-clockwise, 4 * (n + 1) points."""
    pts = []
    for cx, cy, a0 in ((w / 2 - r, d / 2 - r, 0), (-w / 2 + r, d / 2 - r, 90), (-w / 2 + r, -d / 2 + r, 180), (w / 2 - r, -d / 2 + r, 270)):
        pts += [(cx + r * math.cos(math.radians(a0 + 90 * i / n)), cy + r * math.sin(math.radians(a0 + 90 * i / n))) for i in range(n + 1)]
    return pts


def octagon(cx, cy, w, d, c):
    return [(cx - w / 2 + c, cy - d / 2), (cx + w / 2 - c, cy - d / 2), (cx + w / 2, cy - d / 2 + c), (cx + w / 2, cy + d / 2 - c),
            (cx + w / 2 - c, cy + d / 2), (cx - w / 2 + c, cy + d / 2), (cx - w / 2, cy + d / 2 - c), (cx - w / 2, cy - d / 2 + c)]


def done(b, row, role='opaque', receive=True):
    asset, ceiling, casts = ROWS[row]
    mesh = bpy.data.meshes.new(row + '_mesh')
    b.bm.to_mesh(mesh)
    b.bm.free()
    mesh.materials.append(MAT[b.mat])
    obj = leaf(row, mesh, 'FK_NEARFIELD', asset, role=role, casts=casts, receive=receive)
    OBJ[row] = obj
    mesh.calc_loop_triangles()
    tris = len(mesh.loop_triangles)
    assert tris <= ceiling, f'{row}: {tris} triangles exceed the row ceiling {ceiling}'
    TRIS[row] = tris
    return obj


TRIS = {}
MAT_Z = DESK['top'] + EPS + 0.009 - 0.0006       # desk-mat pocket floor (M2 framed_box: 9 mm felt, 0.6 mm pocket, 10 mm frame)
MAT_POCKET = dict(x0=-1.19, x1=-0.31, y0=-0.50, y1=-0.12)
TOP = DESK['top'] + EPS                           # resting height on the bare desk top

# ------------------------------------------------------------------ keyboard: 65%-class compact, 67 caps, tier D
P_KEY = 0.0305                                    # 19.05 mm x 1.6
KB = dict(cx=-0.795, cy=-0.33, w=0.52, d=0.18, hf=0.020, hb=0.030, r=0.012, foot=0.003)
KZ0 = MAT_Z + EPS + KB['foot']                    # shell underside
SLOPE = (KB['hb'] - KB['hf']) / KB['d']           # typing angle 3.2 deg, applied as a shear


def kb(x, y, z):
    """Keyboard local (x, y, z above the underside at the front edge) -> world, with the typing-angle shear."""
    return Vector((KB['cx'] + x, KB['cy'] + y, KZ0 + z + SLOPE * (y + KB['d'] / 2)))


b = Build('kb_case__frost_shell', 'lib_frost')
w, d, r = KB['w'], KB['d'], KB['r']
rings = [[kb(x, y, 0.0) for x, y in rrect(w - 0.004, d - 0.004, r - 0.002, 5)],
         [kb(x, y, 0.002) for x, y in rrect(w, d, r, 5)],
         [kb(x, y, KB['hf'] - 0.002) for x, y in rrect(w, d, r, 5)],
         [kb(x, y, KB['hf']) for x, y in rrect(w - 0.004, d - 0.004, r - 0.002, 5)],
         [kb(x, y, KB['hf']) for x, y in rrect(w - 0.024, d - 0.024, 0.004, 5)],
         [kb(x, y, KB['hf'] - 0.010) for x, y in rrect(w - 0.024, d - 0.024, 0.004, 5)]]
loft(b, rings, 'ivory', cap_start='ivory', cap_end='ivory')   # UV is inert on lib_frost (no texture)
frost = done(b, 'kb_case__frost_shell', role='transparent', receive=False)
frost['renderOrder'] = FROST_RENDER_ORDER

b = Build('kb_case__plate_cable', 'lib_palette')
PLATE_TOP = KB['hf'] - 0.006
loft(b, [[kb(x, y, PLATE_TOP - 0.0024) for x, y in rrect(w - 0.025, d - 0.025, 0.0035, 3)],
         [kb(x, y, PLATE_TOP) for x, y in rrect(w - 0.025, d - 0.025, 0.0035, 3)]], 'ivory', cap_start='ivory', cap_end='ivory')
for fx in (-0.21, 0.21):
    for fy in (-0.06, 0.06):
        c = Vector((KB['cx'] + fx, KB['cy'] + fy, MAT_Z + EPS + KB['foot'] / 2))
        lathe(b, Matrix.Translation(c), [(0, -KB['foot'] / 2), (0.007, -KB['foot'] / 2), (0.007, KB['foot'] / 2), (0, KB['foot'] / 2)], 6, 'rubber')
# USB-C plug on the back wall, coiled lead on the mat, run over the mat edge to the grommet and into the tray
RW = 0.0024
PX, YB = KB['cx'] - 0.17, KB['cy'] + KB['d'] / 2
COIL_R = 0.0095
ZC = MAT_Z + EPS + COIL_R + RW
cube(b, (PX - 0.006, YB, ZC - 0.003), (PX + 0.006, YB + 0.012, ZC + 0.003), 'black', bevel='none')
cube(b, (PX - 0.0045, YB + 0.012, ZC - 0.0045), (PX + 0.0045, YB + 0.026, ZC + 0.0045), 'cream', bevel='none')
y_a, y_b, turns, seg = YB + 0.026, -0.129, 6, 7
path = [Vector((PX, y_a, ZC))]
for i in range(1, turns * seg + 1):
    t = i / (turns * seg)
    a = 2 * math.pi * turns * t + math.pi / 2
    path.append(Vector((PX + COIL_R * math.cos(a), y_a + t * (y_b - y_a), ZC + COIL_R * math.sin(a))))
MAT_RIM = DESK['top'] + EPS + 0.009
on_desk = TOP + RW
path += [Vector(p) for p in [(PX, -0.124, MAT_RIM + EPS + RW), (PX, -0.112, MAT_RIM + EPS + RW), (PX, -0.104, on_desk + 0.004), (PX, -0.094, on_desk),
                             (-0.93, -0.06, on_desk), (-0.70, -0.02, on_desk), (-0.625, 0.04, on_desk), (-0.605, 0.12, on_desk),
                             (GROMMET.x, 0.17, on_desk), (GROMMET.x, 0.188, DESK['top'] + EPS + 0.003 + EPS + RW), (GROMMET.x, 0.200, DESK['top'] - 0.01),
                             (GROMMET.x, 0.200, DESK['under'] - 0.035), (GROMMET.x, 0.190, TRAY['floor'] + 0.03),
                             (GROMMET.x, 0.170, TRAY['floor'] + EPS + RW), (GROMMET.x, 0.140, TRAY['floor'] + EPS + RW)]]
sweep(b, path, RW, 4, 'cream', up=Vector((0, 0, 1)))
done(b, 'kb_case__plate_cable')

# keycaps: 67 caps in five rows (16 u each), sculpted rows, dished octagonal tops, pastel accents by palette UV
LAYOUT = [  # (width in units, swatch)
    [(1, 'yellow')] + [(1, 'cream')] * 12 + [(2, 'sage'), (1, 'sage')],
    [(1.5, 'sage')] + [(1, 'cream')] * 12 + [(1.5, 'cream'), (1, 'sage')],
    [(1.75, 'sage')] + [(1, 'cream')] * 11 + [(2.25, 'pink'), (1, 'sage')],
    [(2.25, 'sage')] + [(1, 'cream')] * 10 + [(1.75, 'sage'), (1, 'blue'), (1, 'sage')],
    [(1.25, 'sage')] * 3 + [(6.25, 'cream'), (1.5, 'sage'), (1.5, 'sage')] + [(1, 'blue')] * 3,
]
ROW_H = [0.0150, 0.0130, 0.0122, 0.0128, 0.0128]              # cap height above the skirt (x 1.6)
ROW_TILT = [10, 5, 0, -3, -7]                                 # top tilt in degrees (sculpted profile)
assert [sum(u for u, _ in row) for row in LAYOUT] == [16] * 5 and sum(len(row) for row in LAYOUT) == 67
GAP, SHRINK, CB, CT = 0.0027, 0.0037, 0.0018, 0.0024
SKIRT = PLATE_TOP + 0.0045
b = Build('kb_keycaps__caps', 'lib_palette')
CAPS = []
for ri, row in enumerate(LAYOUT):
    yk = (2 - ri) * P_KEY                                     # row 0 at the back
    x = -8 * P_KEY
    for u, swatch in row:
        xk = x + u * P_KEY / 2
        x += u * P_KEY
        bw, bd = u * P_KEY - GAP, P_KEY - GAP
        tw, td = bw - 2 * SHRINK, bd - 2 * SHRINK
        tan = math.tan(math.radians(ROW_TILT[ri]))
        top = lambda yy: SKIRT + ROW_H[ri] + tan * (yy - yk)
        bottom = [kb(px, py, SKIRT) for px, py in octagon(xk, yk, bw, bd, CB)]
        upper = [kb(px, py, top(py)) for px, py in octagon(xk, yk, tw, td, CT)]
        dish = [kb(px, py, top(py) - 0.0009) for px, py in octagon(xk, yk, tw - 0.0032, td - 0.0032, CT - 0.0008)]
        centre = kb(xk, yk, top(yk) - 0.0014)
        loft(b, [bottom, upper, dish, centre], swatch)
        CAPS.append({'row': ri, 'units': u, 'swatch': swatch, 'centreWorld': [round(c, 4) for c in kb(xk, yk, top(yk))]})
done(b, 'kb_keycaps__caps')

# ------------------------------------------------------------------ native mouse: symmetric pebble, two buttons, wheel, feet
MS = dict(cx=KB['cx'] + 0.40, cy=-0.34, L=0.16, W=0.099, H=0.056)       # 40 cm right of the keyboard centre line
assert MS['cx'] + MS['W'] / 2 < MAT_POCKET['x1'] and MAT_POCKET['y0'] < MS['cy'] - MS['L'] / 2
MZ = MAT_Z + EPS + 0.0008                                     # on two 0.8 mm glide feet
ANG = sorted(({(90 + 15 * j) % 360 for j in range(24)} - {90}) | {88.5, 91.5})   # 25 section angles in [0, 360); split strip 88.5..91.5
assert len(ANG) == 25
T_SECT = [0.0, 0.035, 0.09, 0.17, 0.26, 0.36, 0.46, 0.53, 0.542, 0.62, 0.72, 0.82, 0.91, 0.965, 1.0]  # back -> front
SEAM = (7, 8)                                                 # rings 7..8: transverse seam at the buttons' rear edge


def ms_section(t):
    s = (1 - abs(2 * t - 1) ** 6) ** (1 / 6)
    a = MS['W'] / 2 * (1 - 0.18 * ((t - 0.45) / 0.55) ** 2) * s
    h = MS['H'] * (1 - ((t - 0.40) / 0.75) ** 2)
    y = MS['cy'] - MS['L'] / 2 + t * MS['L']
    pts = []
    for ang in ANG:
        c, si = math.cos(math.radians(ang)), math.sin(math.radians(ang))
        x = a * math.copysign(abs(c) ** (2 / 2.6), c)
        z = 0.004 + (h - 0.004) * s ** 0.3 * abs(si) ** (2 / 2.6) if si > 0 else 0.004 - 0.004 * abs(si) ** (2 / 2.6)
        if t >= 0.53 and ang in (88.5, 91.5):
            z -= 0.0007                                      # button split groove
        pts.append(Vector((MS['cx'] + x, y, MZ + z)))
    return pts


rings = [Vector((MS['cx'], MS['cy'] - MS['L'] / 2, MZ + 0.35 * MS['H']))] + [ms_section(t) for t in T_SECT[1:-1]] + \
        [Vector((MS['cx'], MS['cy'] + MS['L'] / 2, MZ + 0.012))]
b = Build('mouse_native__body', 'lib_palette')
vr = [[b.bm.verts.new(p) for p in r] if isinstance(r, list) else [b.bm.verts.new(r)] for r in rings]
shell, seams = [], []
split_i = ANG.index(88.5)
for k in range(len(vr) - 1):
    a, c = vr[k], vr[k + 1]
    if len(a) == 1:
        shell += [b.bm.faces.new((a[0], c[(i + 1) % len(c)], c[i])) for i in range(len(c))]
    elif len(c) == 1:
        shell += [b.bm.faces.new((a[i], a[(i + 1) % len(a)], c[0])) for i in range(len(a))]
    else:
        n = len(a)
        for i in range(n):
            f = b.bm.faces.new((a[i], a[(i + 1) % n], c[(i + 1) % n], c[i]))
            top_arc = 30 <= ANG[i] <= 150 and 30 <= ANG[(i + 1) % n] <= 150
            if (k, k + 1) == SEAM and top_arc or (i == split_i and T_SECT[k] >= 0.53):
                seams.append(f)
            else:
                shell.append(f)
groups = [(shell, 'ivory'), (seams, 'black')]
finalize(b, groups)
t_w = 0.80
y_w = MS['cy'] - MS['L'] / 2 + t_w * MS['L']
z_w = MZ + MS['H'] * (1 - ((t_w - 0.40) / 0.75) ** 2) * ((1 - abs(2 * t_w - 1) ** 6) ** (1 / 6)) ** 0.3
lathe(b, frame(Vector((MS['cx'], y_w, z_w - 0.0105)), (1, 0, 0)),
      [(0, -0.0045), (0.0125, -0.0045), (0.0125, 0.0045), (0, 0.0045)], 12, ['rubber', 'black_metal', 'rubber'])
for fy, fw in ((0.05, 0.06), (-0.055, 0.07)):
    loft(b, [[Vector((MS['cx'] + x, MS['cy'] + fy + y, MAT_Z + EPS)) for x, y in rrect(fw, 0.012, 0.004, 1)],
             [Vector((MS['cx'] + x, MS['cy'] + fy + y, MZ)) for x, y in rrect(fw, 0.012, 0.004, 1)]], 'rubber', cap_start='rubber', cap_end='rubber')
done(b, 'mouse_native__body')

# ------------------------------------------------------------------ mug on oak coaster, clear of the TypeForge stand foot
MUG = dict(cx=0.04, cy=-0.44, r=0.0656, h=0.152, rc=0.072, handle_deg=-35)
b = Build('mug_coaster__mug_coaster', 'lib_palette')
lathe(b, Matrix.Translation((MUG['cx'], MUG['cy'], TOP)),
      [(0, 0), (MUG['rc'] - 0.002, 0), (MUG['rc'], 0.002), (MUG['rc'], 0.006), (MUG['rc'] - 0.002, 0.008), (0, 0.008)], 24, 'oak_tone')
m0 = TOP + 0.008 + EPS
r_, h_ = MUG['r'], MUG['h']
lathe(b, Matrix.Translation((MUG['cx'], MUG['cy'], m0)),
      [(0, 0), (r_ - 0.005, 0), (r_, 0.005), (r_, h_ - 0.003), (r_ - 0.0032, h_), (r_ - 0.0064, h_ - 0.003), (r_ - 0.0064, h_ - 0.028), (0, h_ - 0.028)],
      32, ['blue', 'blue', 'blue', 'blue', 'cream', 'cream', 'coffee'])
ha = math.radians(MUG['handle_deg'])
hd = Vector((math.cos(ha), math.sin(ha), 0))
hp = []
for i in range(13):
    s = math.pi * i / 12
    reach = 0.006 + 0.034 * math.sin(s) ** 0.7
    hp.append(Vector((MUG['cx'], MUG['cy'], m0)) + hd * (r_ - 0.003 + reach) + Vector((0, 0, h_ * (0.80 - 0.56 * i / 12))))
sweep(b, hp, 0.0072, 6, 'blue', r2=0.0048, up=Vector((0, 0, 1)).cross(hd), caps=False)
done(b, 'mug_coaster__mug_coaster')

# ------------------------------------------------------------------ notebook with elastic band and pen, left of the keyboard
NB = dict(cx=-1.45, cy=-0.30, yaw=math.radians(6), w=0.237, d=0.336, t=0.024)
Mn = Matrix.Translation((NB['cx'], NB['cy'], TOP)) @ Matrix.Rotation(NB['yaw'], 4, 'Z')
b = Build('notebook_pen__set', 'lib_palette')
for z0, z1 in ((0.0, 0.003), (NB['t'] - 0.003, NB['t'])):
    loft(b, [[Mn @ Vector((x, y, z0)) for x, y in rrect(NB['w'], NB['d'], 0.004, 1)], [Mn @ Vector((x, y, z1)) for x, y in rrect(NB['w'], NB['d'], 0.004, 1)]],
         'linen_trim', cap_start='linen_trim', cap_end='linen_trim')
cube(b, (-0.112, -0.164, 0.003), (0.1145, 0.164, NB['t'] - 0.003), 'paper', bevel='none', M=Mn)
cube(b, (-0.1185, -0.168, 0.003), (-0.112, 0.168, NB['t'] - 0.003), 'linen_trim', bevel='none', M=Mn)
cube(b, (0.085, -0.1685, NB['t']), (0.091, 0.1685, NB['t'] + 0.0008), 'black', bevel='none', M=Mn)
for sy in (-1, 1):
    cube(b, (0.085, sy * 0.168 - (0.0008 if sy > 0 else 0), 0.0), (0.091, sy * 0.168 + (0.0008 if sy < 0 else 0), NB['t'] + 0.0008), 'black', bevel='none', M=Mn)
pen_r = 0.0058
Mp = Mn @ Matrix.Translation((0.050, -0.112, NB['t'] + EPS + pen_r)) @ Matrix.Rotation(-math.pi / 2, 4, 'X')   # local Z -> +y (lying along the cover)
lathe(b, Mp, [(0, 0), (0.0025, 0.012), (pen_r, 0.03), (pen_r, 0.20), (0.0045, 0.218), (0, 0.222)], 10, ['black', 'ivory', 'ivory', 'ivory', 'ivory'])
cube(b, (0.050 - 0.0015, -0.112 + 0.150, NB['t'] + EPS + 2 * pen_r), (0.050 + 0.0015, -0.112 + 0.205, NB['t'] + EPS + 2 * pen_r + 0.002), 'metal', bevel='none', M=Mn)
done(b, 'notebook_pen__set')

# ------------------------------------------------------------------ microphone on a sprung boom from a rear-left end clamp
b = Build('mic_boom__assembly', 'lib_palette')
CL = Vector((-1.875, 0.17))
x_edge = DESK['x0']
cube(b, (x_edge - 0.005, CL.y - 0.03, TOP), (-1.842, CL.y + 0.03, TOP + 0.012), 'black_metal', bevel='none')               # top plate
cube(b, (-1.917, CL.y - 0.03, 0.655), (x_edge - EPS, CL.y + 0.03, TOP + 0.012), 'black_metal', bevel='none')                # spine
cube(b, (-1.917, CL.y - 0.02, 0.655), (-1.850, CL.y + 0.02, 0.667), 'black_metal', bevel='none')                            # lower jaw
cylinder(b, (CL.x, CL.y, (0.667 + DESK['under'] - 0.003) / 2), 0.005, DESK['under'] - 0.003 - 0.667, n=8, swatch='metal', bevel='none')     # screw
cylinder(b, (CL.x, CL.y, DESK['under'] - EPS - 0.0015), 0.012, 0.003, n=12, swatch='rubber', bevel='none')                                  # pressure pad
cylinder(b, (CL.x, CL.y, 0.655 - 0.008), 0.016, 0.016, n=12, swatch='black_metal', bevel='none')                                            # knob
P0 = Vector((CL.x, CL.y, 0.835))
cylinder(b, (CL.x, CL.y, (TOP + 0.012 + P0.z - 0.016) / 2), 0.010, P0.z - 0.016 - TOP - 0.012, n=12, swatch='black_metal', bevel='none')     # riser
E = Vector((-1.95, -0.02, 1.38))
CC = Vector((-1.60, -0.36, 1.10))                                       # capsule centre: left of the copilot screen at home-1440
AX = Vector((0.55, -0.40, 0.55)).normalized()                          # grille end up and toward the seat
side = ((E - CC) - AX * (E - CC).dot(AX)).normalized()
AM = CC + side * 0.075                                                  # arm end / mount pivot


def joint(c, axis):
    lathe(b, frame(c, axis), [(0, -0.015), (0.016, -0.015), (0.016, 0.015), (0, 0.015)], 16, 'black_metal')


def arm(p, q):
    d_ = (q - p).normalized()
    lat = d_.cross(Vector((0, 0, 1))).normalized()
    below = lat.cross(d_).normalized() * -1
    for s in (-1, 1):
        sweep(b, [p + lat * 0.012 * s, q + lat * 0.012 * s], 0.005, 8, 'black_metal')
    a0, a1 = p + (q - p) * 0.2 + below * 0.016, p + (q - p) * 0.8 + below * 0.016
    hel = [a0 + (a1 - a0) * (i / 60) + lat * 0.006 * math.cos(2 * math.pi * 10 * i / 60) + below * 0.006 * math.sin(2 * math.pi * 10 * i / 60) for i in range(61)]
    sweep(b, hel, 0.0015, 3, 'metal')
    return lat


lat0 = arm(P0, E)
joint(P0, lat0)
lat1 = arm(E, AM)
joint(E, lat1)
joint(AM, side)
Mcap = frame(CC, AX)
lathe(b, Mcap, [(0, -0.137), (0.030, -0.137), (0.040, -0.125), (0.040, 0.030), (0.041, 0.035), (0.041, 0.125), (0.034, 0.135), (0, 0.137)], 20,
      ['black', 'black', 'black', 'black', 'metal', 'metal', 'metal'])                                                       # body + pale grille band
ring(b, (0, 0, 0), 0.046, 0.052, 0.010, n=20, swatch='black_metal', M=Mcap)                                                   # shock-mount ring
for s in (-1, 1):
    u = (side.cross(AX)).normalized() * 0.02 * s
    sweep(b, [AM + u * 0.5, CC + side * 0.052 + u], 0.003, 4, 'black_metal')
cab = [CC - AX * 0.137, CC - AX * 0.17 + side * 0.01, AM - AX * 0.02, E + (AM - E) * 0.5 - Vector((0, 0, 0.03)), E - Vector((0, 0, 0.03)),
       P0 + (E - P0) * 0.5 - lat0 * 0.03, P0 - lat0 * 0.03 + Vector((0, 0, 0.0)), Vector((CL.x - 0.02, CL.y - 0.035, TOP + 0.02)),
       Vector((x_edge - 0.025, CL.y - 0.035, TOP - 0.02)), Vector((x_edge - 0.025, CL.y - 0.035, 0.62))]
sweep(b, cab, 0.0025, 4, 'black')
done(b, 'mic_boom__assembly')

# ------------------------------------------------------------------ headphones on a stand, right of the TypeForge stand
HP = dict(cx=0.30, cy=-0.22, yaw=math.radians(45), half=0.108, zc=0.94)
Mh = Matrix.Translation((HP['cx'], HP['cy'], 0.0)) @ Matrix.Rotation(HP['yaw'], 4, 'Z')
b = Build('headphones__on_stand', 'lib_palette')
lathe(b, Mh @ Matrix.Translation((0, 0, TOP)), [(0, 0), (0.070, 0), (0.072, 0.002), (0.072, 0.010), (0.070, 0.012), (0, 0.012)], 32, 'dark_oak')
post_top = HP['zc'] + HP['half'] - 0.004 - 0.008
lathe(b, Mh @ Matrix.Translation((0, 0, TOP + 0.012)), [(0, 0), (0.008, 0), (0.008, post_top - TOP - 0.012), (0, post_top - TOP - 0.012)], 12, 'black_metal')
cube(b, (-0.016, -0.03, post_top), (0.016, 0.03, post_top + 0.008 - EPS), 'rubber', bevel='none', M=Mh)
band = [Mh @ Vector((0, HP['half'] * math.cos(math.pi * i / 20), HP['zc'] + HP['half'] * math.sin(math.pi * i / 20))) for i in range(21)]
band = [Mh @ Vector((0, HP['half'], HP['zc'] - 0.004))] + band + [Mh @ Vector((0, -HP['half'], HP['zc'] - 0.004))]
band_sw = ['black'] * 7 + ['fabric'] * 8 + ['black'] * 7
sweep(b, band, 0.004, 6, band_sw, r2=0.015)
for s in (-1, 1):
    zcup = HP['zc'] - 0.09
    yoke = [Mh @ Vector((0.082 * math.cos(math.pi * i / 12), s * HP['half'], zcup + 0.082 * math.sin(math.pi * i / 12))) for i in range(13)]
    sweep(b, yoke, 0.004, 6, 'metal')
    Mc_ = Mh @ Matrix.Translation((0, s * HP['half'], zcup)) @ Matrix.Rotation(-s * math.pi / 2, 4, 'X')   # local Z -> outward
    lathe(b, Mc_, [(0, -0.022), (0.074, -0.022), (0.076, -0.016), (0.076, 0.012), (0.066, 0.024), (0.046, 0.028), (0, 0.028)], 24,
          ['black', 'black', 'black', 'black', 'sage', 'sage'])
    ring(b, (0, 0, -0.034), 0.036, 0.070, 0.024, n=24, swatch='fabric', M=Mc_)
done(b, 'headphones__on_stand')

# ------------------------------------------------------------------ nearfield speaker: tier F (x1.25, M1 C1 exception), toed in
SPK = dict(cx=0.36, cy=0.12, yaw=math.radians(-22), w=0.231, d=0.263, h=0.356, pad=0.019)
Ms = Matrix.Translation((SPK['cx'], SPK['cy'], TOP)) @ Matrix.Rotation(SPK['yaw'], 4, 'Z')
b = Build('speaker_nearfield__cabinet', 'lib_palette')
loft(b, [[Ms @ Vector((x, y, 0.0)) for x, y in rrect(0.21, 0.24, 0.006, 1)], [Ms @ Vector((x, y, SPK['pad'])) for x, y in rrect(0.21, 0.24, 0.006, 1)]],
     'fabric', cap_start='fabric', cap_end='fabric')
c0 = SPK['pad'] + EPS
loft(b, [[Ms @ Vector((x, y, c0)) for x, y in rrect(SPK['w'], SPK['d'], 0.010, 3)], [Ms @ Vector((x, y, c0 + SPK['h'])) for x, y in rrect(SPK['w'], SPK['d'], 0.010, 3)]],
     'white_pc', cap_start='white_pc', cap_end='white_pc')
FRONT = -SPK['d'] / 2
for zc_, r_in, r_out, depth, n, prof, sws in (
        (0.13, 0.070, 0.080, 0.008, 24, [(0.070, 0), (0.067, 0.003), (0.063, 0), (0.026, -0.0065), (0.022, -0.006), (0.012, -0.003), (0, -0.002)],
         ['rubber', 'rubber', 'black', 'black', 'black_metal', 'black_metal']),
        (0.285, 0.040, 0.046, 0.006, 20, [(0.040, 0), (0.030, -0.003), (0.016, -0.005), (0.014, -0.004), (0.008, -0.0005), (0, 0.001)],
         ['black', 'black', 'black', 'metal', 'metal'])):
    face = Ms @ Matrix.Translation((0, FRONT - depth, c0 + zc_)) @ Matrix.Rotation(math.pi / 2, 4, 'X')   # local Z -> -y (out of the baffle)
    ring(b, (0, 0, -depth / 2), r_in, r_out, depth, n=n, swatch='black_metal', M=face)
    lathe(b, face, prof, n, sws)
done(b, 'speaker_nearfield__cabinet')

bpy.context.view_layer.update()

# ------------------------------------------------------------------ measurements on the in-memory state
dg = bpy.context.evaluated_depsgraph_get()
meas = {'statement': 'M3 author measurements from the in-memory Blender state. Exact geometry ray tests from the fixed eye; '
                     'projections use the builder cameras (home-1440, home-1024, music-1440, phone home f74, left-down, right-down). '
                     'They are builder-camera planning estimates, not runtime proof: the v04 reconstructed mid-right / music-390 '
                     'projections were wrong against root capture, so no mid-right or music-390 claim is made here. '
                     'Root captures the true views after export.',
        'parent': {'glb': 'exports/studio-full-kit-m2-proposal-v05.glb', 'sha256': PARENT_SHA, 'editableChain': 'build_fullkit_m2_pc_v04.py (dry) + v05 byte step'},
        'removedM3Proxies': REMOVED, 't2Cells': t2_cells, 'trianglesPerRow': TRIS,
        'frost': {'leaf': 'kb_case__frost_shell', 'renderOrder': FROST_RENDER_ORDER, 'doubleSided': not MAT['lib_frost'].use_backface_culling,
                  'transparent': bool(frost['transparent']), 'occluder': bool(frost['occluder']), 'nocast': bool(frost['nocast']), 'receiveShadow': bool(frost['receiveShadow'])}}
assert meas['frost'] == dict(meas['frost'], doubleSided=False, transparent=True, occluder=False, nocast=True, receiveShadow=False)

ledger = {}
for row, (asset, ceiling, casts) in ROWS.items():
    p = 1
    s = 1 if casts else 0
    ledger[row] = dict(assetId=asset, placed=TRIS[row], ceiling=ceiling, main=p, shadow=s, refresh=p + s, refreshTriangles=TRIS[row] * (p + s))
tot = dict(main=sum(v['main'] for v in ledger.values()), casters=sum(v['shadow'] for v in ledger.values()),
           refresh=sum(v['refresh'] for v in ledger.values()), placed=sum(v['placed'] for v in ledger.values()),
           refreshTriangles=sum(v['refreshTriangles'] for v in ledger.values()))
assert tot['main'] <= STAGE_LIMITS['main'] and tot['refresh'] <= STAGE_LIMITS['refresh'] and tot['placed'] <= STAGE_LIMITS['placed'], tot
meas['ledger'] = {'rows': ledger, 'stage': tot, 'stageLimits': STAGE_LIMITS}
print('FK M3 ledger', json.dumps(tot), json.dumps(TRIS))


def cast(target, slack=0.02):
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


CHROME_1440 = G2['CHROME_1440']
VIEWS = ['home-1440', 'home-1024', 'music-1440', 'home-390-f74', 'home-320-f74', 'left-down', 'right-down']   # M1 builder cameras only

# targets must stay truthful: 81 rays each, first hit the target plane
meas['targetRays'] = {}
for pid in ('dissertation', 'copilot', 'typeforge'):
    obj = bpy.data.objects['target_' + pid]
    c = [obj.matrix_world @ v.co for v in obj.data.vertices]
    pts = grid(lambda u, v: c[0].lerp(c[1], 0.03 + 0.94 * u).lerp(c[3].lerp(c[2], 0.03 + 0.94 * u), 0.03 + 0.94 * v), 9, 9)
    hits = [cast(p, 0.002) for p in pts]
    meas['targetRays'][pid] = {'clear': sum(1 for h in hits if h == obj.name), 'of': len(pts), 'blockers': sorted(set(h for h in hits if h != obj.name and h))}
    assert meas['targetRays'][pid]['clear'] == 81, meas['targetRays'][pid]

# per-leaf visibility: vertex samples whose first hit is the leaf, projected per view, with chrome flags at 1440
meas['visibility'] = {}
for row in ROWS:
    obj = OBJ[row]
    vs = [obj.matrix_world @ v.co for v in obj.data.vertices]
    step = max(1, len(vs) // 300)
    samp = vs[::step]
    vis = [p for p in samp if cast(p, 0.004) == row]
    entry = {'samples': len(samp), 'visibleFromEye': len(vis)}
    for cam in VIEWS:
        pr = [project(cam, p) for p in vis]
        inn = [q for q in pr if q[2]]
        e = {'inFrame': len(inn), 'px': [min(q[0] for q in inn), max(q[0] for q in inn), min(q[1] for q in inn), max(q[1] for q in inn)] if inn else None}
        if cam in ('home-1440', 'music-1440'):
            e['outsideChrome'] = sum(1 for q in inn if not [k for k, (xa, xb, ya, yb_) in CHROME_1440.items() if xa <= q[0] <= xb and ya <= q[1] <= yb_])
        entry[cam] = e
    meas['visibility'][row] = entry
print('FK M3 visibility', json.dumps({k: (v['visibleFromEye'], v['home-1440']) for k, v in meas['visibility'].items()}))

# keycap pitch (gate R5: >= 16 px at 1440, >= 11 px at 320) and mouse span in key pitches
f_cap = next(c for c in CAPS if c['row'] == 2 and c['units'] == 1)
i_f = CAPS.index(f_cap)
a_, b_ = Vector(CAPS[i_f + 3]['centreWorld']), Vector(CAPS[i_f + 4]['centreWorld'])
meas['keycapPitchPx'] = {cam: round(math.dist(project(cam, a_)[:2], project(cam, b_)[:2]), 1) for cam in ('home-1440', 'home-320-f74', 'home-390-f74')}
mfront, mback = Vector((MS['cx'], MS['cy'] + MS['L'] / 2, MZ + 0.01)), Vector((MS['cx'], MS['cy'] - MS['L'] / 2, MZ + 0.01))
mleft, mright = Vector((MS['cx'] - MS['W'] / 2, MS['cy'], MZ + 0.01)), Vector((MS['cx'] + MS['W'] / 2, MS['cy'], MZ + 0.01))
meas['mouseSpanKeyPitches'] = {'lengthWorld': round(MS['L'] / P_KEY, 2), 'widthWorld': round(MS['W'] / P_KEY, 2),
                               'home-1440WidthPx': round(math.dist(project('home-1440', mleft)[:2], project('home-1440', mright)[:2]), 1)}

# cymbal reveal (music-1440): rays to the left cymbal proxy's top face
cym = bpy.data.objects.get('drum_cymbals__proxy_cymbal_1')
if cym:
    cv = [cym.matrix_world @ v.co for v in cym.data.vertices]
    ztop = max(v.z for v in cv)
    ring_pts = [v for v in cv if abs(v.z - ztop) < 1e-6]
    cen = sum(ring_pts, Vector()) / len(ring_pts)
    samples = [cen.lerp(p, f) for p in ring_pts for f in (0.25, 0.5, 0.75, 0.95)]
    hits = [cast(p, 0.004) for p in samples]
    meas['leftCymbal'] = {'object': cym.name, 'note': 'fixed-eye rays only; music-1440 framing is a builder-camera estimate', 'samples': len(samples), 'firstHitCymbal': sum(1 for h in hits if h == cym.name),
                          'blockers': {h: hits.count(h) for h in set(hits) if h and h != cym.name}}

# mug against the TypeForge stand foot at home-1440 (projected rectangles)
tf = OBJ['mon_side__typeforge']
tf_eval = tf.evaluated_get(dg).to_mesh()
foot_pts = [tf.matrix_world @ v.co for v in tf_eval.vertices if (tf.matrix_world @ v.co).z < DESK['top'] + 0.02]
tf.evaluated_get(dg).to_mesh_clear()
mug_pts = [OBJ['mug_coaster__mug_coaster'].matrix_world @ v.co for v in OBJ['mug_coaster__mug_coaster'].data.vertices]


def prect(cam, pts):
    pr = [project(cam, p) for p in pts]
    return [min(q[0] for q in pr), max(q[0] for q in pr), min(q[1] for q in pr), max(q[1] for q in pr)]


fr, mr = prect('home-1440', foot_pts), prect('home-1440', mug_pts)
meas['mugVersusTypeforgeFootHome1440'] = {'footPx': fr, 'mugPx': mr,
                                          'overlapPx2': max(0, min(fr[1], mr[1]) - max(fr[0], mr[0])) * max(0, min(fr[3], mr[3]) - max(fr[2], mr[2]))}

# intersections: M3 leaves against everything else (same-asset pairs excluded); accepted geometry must be clear
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
accepted, later = {}, {}
for a in ROWS:
    for name, (tree, _, asset) in TREES.items():
        if name == a or asset == TREES[a][2] or (name in ROWS and name < a):
            continue
        hits = TREES[a][0].overlap(tree)
        if hits:
            (later if '__proxy' in name or name.startswith('contact_decals') else accepted)[f'{a} x {name}'] = len(hits)
meas['intersections'] = {'m3VersusAcceptedOrM3': accepted, 'm3VersusLaterStageProxiesOrContacts': later}
assert not accepted, accepted


def gap(a, b):
    ta, va = TREES[a][:2]
    tb, vb = TREES[b][:2]
    d_ = [tb.find_nearest(v)[3] for v in va] + [ta.find_nearest(v)[3] for v in vb]
    return round(min(x for x in d_ if x is not None), 4)


meas['restingGapsM'] = {f'{a} | {s}': gap(a, s) for a, s in (
    ('kb_case__plate_cable', 'desk_mat__felt'), ('mouse_native__body', 'desk_mat__felt'), ('mug_coaster__mug_coaster', 'desk_top__top'),
    ('notebook_pen__set', 'desk_top__top'), ('mic_boom__assembly', 'desk_top__top'), ('mic_boom__assembly', 'desk_frame__steel'),
    ('headphones__on_stand', 'desk_top__top'), ('speaker_nearfield__cabinet', 'desk_top__top'), ('speaker_nearfield__cabinet', 'mon_side__typeforge'),
    ('headphones__on_stand', 'mon_side__typeforge'), ('mug_coaster__mug_coaster', 'headphones__on_stand'), ('kb_case__plate_cable', 'mon_cables__grommet'),
    ('kb_case__plate_cable', 'mon_central__body'))}
meas['placementsBlenderM'] = {'keyboard': KB, 'mouse': MS, 'mug': MUG, 'notebook': {k: (round(math.degrees(v), 2) if k == 'yaw' else v) for k, v in NB.items()},
                              'micCapsuleCentre': list(CC), 'micAxis': list(AX), 'micClamp': list(CL), 'micElbow': list(E),
                              'headphones': {k: (round(math.degrees(v), 2) if k == 'yaw' else v) for k, v in HP.items()},
                              'speaker': {k: (round(math.degrees(v), 2) if k == 'yaw' else v) for k, v in SPK.items()}}
print('FK M3 measurements', json.dumps({k: meas[k] for k in ('targetRays', 'keycapPitchPx', 'mugVersusTypeforgeFootHome1440', 'intersections')}, default=str))
meas['sourceScript'] = 'source/build_fullkit_m3.py'
meas['sourceScriptSha256'] = sha(os.path.abspath(__file__))

# ------------------------------------------------------------------ save the assembled editable source (held)
if 'blend' in FLAGS:
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT, check_existing=False, copy=True)
    meas['sourceBlend'] = os.path.relpath(BLEND_OUT, KIT).replace('\\', '/')
    meas['sourceBlendSha256'] = sha(BLEND_OUT)


def chunks(raw):
    jlen = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20 + jlen])
    blen = struct.unpack_from('<I', raw, 20 + jlen)[0]
    return doc, 28 + jlen, blen


def retained_hierarchy_problems(parent, candidate, removed, added):
    """Validate only the named root-child substitution; glTF indices may move."""
    root = 'studio_full_kit'

    def named(doc):
        nodes = doc['nodes']
        names = [node['name'] for node in nodes]
        if len(set(names)) != len(names):
            raise ValueError('duplicate node name')
        children, parents = {}, {}
        for node in nodes:
            refs = node.get('children', [])
            if any(type(i) is not int or not 0 <= i < len(nodes) for i in refs) or len(set(refs)) != len(refs):
                raise ValueError('invalid or duplicate child reference')
            children[node['name']] = {names[i] for i in refs}
            for child in children[node['name']]:
                if child in parents:
                    raise ValueError('multiple parents')
                parents[child] = node['name']
        if root not in names or root in parents:
            raise ValueError('missing or parented root')
        seen, pending = set(), [root]
        while pending:
            name = pending.pop()
            if name in seen:
                raise ValueError('cyclic hierarchy')
            seen.add(name)
            pending.extend(children[name])
        if seen != set(names):
            raise ValueError('unreachable node')
        roots = []
        for scene_entry in doc['scenes']:
            refs = scene_entry.get('nodes', [])
            if any(type(i) is not int or not 0 <= i < len(nodes) for i in refs):
                raise ValueError('invalid scene root')
            roots.append([names[i] for i in refs])
        if roots != [[root]]:
            raise ValueError('unexpected scene roots')
        return dict(zip(names, nodes)), children, parents, doc.get('scene', 0)

    try:
        pn, pc, pp, ps = named(parent)
        mn, mc, mp, ms = named(candidate)
        removed, added = set(removed), set(added)
        if set(pn) - set(mn) != removed or set(mn) - set(pn) != added:
            return [('hierarchy', 'wrong named substitution')]
        if not removed <= pc[root] or any(pc[name] for name in removed):
            return [('hierarchy', 'removed nodes are not direct root leaves')]
        if mc[root] != (pc[root] - removed) | added:
            return [('hierarchy', 'wrong root child substitution')]
        if any(mp.get(name) != root or mc[name] for name in added):
            return [('hierarchy', 'added nodes are not direct root leaves')]
        problems = []
        if ps != ms:
            problems.append(('hierarchy', 'default scene changed'))
        for name in sorted(set(pn) & set(mn)):
            if pp.get(name) != mp.get(name) or (name != root and pc[name] != mc[name]):
                problems.append(('hierarchy', name))
            a = {k: v for k, v in pn[name].items() if k not in ('mesh', 'children')}
            b = {k: v for k, v in mn[name].items() if k not in ('mesh', 'children')}
            if a != b or ('mesh' in pn[name]) != ('mesh' in mn[name]):
                problems.append(('node', name))
        return problems
    except (KeyError, IndexError, TypeError, ValueError) as error:
        return [('hierarchy', str(error))]


def retained_texture_problems(parent, candidate, parent_raw, candidate_raw, parent_bin, candidate_bin):
    """Keep image identity and texture/sampler wiring, allowing only T2 pixels."""
    palettes = {'fk_palette_colour', 'fk_palette_orm'}

    def images(doc, raw, start):
        result = {}
        for item in doc.get('images', []):
            name = item['name']
            if name in result:
                raise ValueError('duplicate image name')
            view = doc['bufferViews'][item['bufferView']]
            offset = start + view.get('byteOffset', 0)
            result[name] = ({k: v for k, v in item.items() if k != 'bufferView'}, raw[offset:offset + view['byteLength']])
        return result

    def textures(doc):
        result = []
        for item in doc.get('textures', []):
            normalized = {k: v for k, v in item.items() if k not in ('source', 'sampler')}
            normalized['sourceName'] = doc['images'][item['source']]['name']
            normalized['samplerDefinition'] = doc['samplers'][item['sampler']] if 'sampler' in item else None
            result.append(normalized)
        return result

    try:
        pi = images(parent, parent_raw, parent_bin)
        mi = images(candidate, candidate_raw, candidate_bin)
        problems = []
        if set(pi) != set(mi):
            return [('images', 'image identity set changed')]
        for name in pi:
            if pi[name][0] != mi[name][0]:
                problems.append(('imageMetadata', name))
            if name not in palettes and pi[name][1] != mi[name][1]:
                problems.append(('imageBytes', name))
        if parent.get('samplers', []) != candidate.get('samplers', []):
            problems.append(('samplers', 'definitions changed'))
        if textures(parent) != textures(candidate):
            problems.append(('textures', 'image or sampler references changed'))
        return problems
    except (KeyError, IndexError, TypeError, ValueError) as error:
        return [('textures', str(error))]


def palette_pixel_problems(parent_png, candidate_png, image_name, cells, grid, cell_size):
    wp, hp, bp, rows_p = parent_png
    wm, hm, bm, rows_m = candidate_png
    if (wp, hp) != (wm, hm) or bp not in (3, 4) or bm not in (3, 4):
        return [('paletteDimensions', image_name)]
    expected = {}
    for cell in cells.values():
        if image_name == 'fk_palette_colour':
            value = int(cell['srgb'].lstrip('#'), 16)
            rgba = ((value >> 16) & 255, (value >> 8) & 255, value & 255, 255)
        else:
            rgba = (255, int(cell['roughness'] * 255 + 0.5), int(cell['metallic'] * 255 + 0.5), 255)
        expected[cell['index']] = bytes(rgba)

    def rgba(row, x, channels):
        value = row[x * channels:(x + 1) * channels]
        return value if channels == 4 else value + b'\xff'

    seen = set()
    for y in range(hp):
        for x in range(wp):
            cell_index = (y // cell_size) * grid + x // cell_size
            actual = rgba(rows_m[y], x, bm)
            if cell_index in expected:
                seen.add(cell_index)
                if actual != expected[cell_index]:
                    return [('paletteT2Value', image_name, x, y, tuple(actual), tuple(expected[cell_index]))]
            elif actual != rgba(rows_p[y], x, bp):
                return [('paletteRgba', image_name, x, y)]
    return [] if seen == set(expected) else [('paletteT2Missing', image_name)]


def png_rgba(data):
    """Minimal PNG decoder (8-bit RGB/RGBA, non-interlaced) for the palette parity check."""
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    pos, idat, w_, h_, ct = 8, b'', 0, 0, 0
    while pos < len(data):
        ln, typ = struct.unpack_from('>I4s', data, pos)
        body = data[pos + 8:pos + 8 + ln]
        if typ == b'IHDR':
            w_, h_, depth, ct, _, _, inter = struct.unpack('>IIBBBBB', body)
            assert depth == 8 and ct in (2, 6) and inter == 0
        elif typ == b'IDAT':
            idat += body
        pos += 12 + ln
    bpp = 4 if ct == 6 else 3
    raw, out, prev = zlib.decompress(idat), [], bytearray(w_ * bpp)
    stride = w_ * bpp
    for y in range(h_):
        ft, line = raw[y * (stride + 1)], bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for i in range(stride):
            a = line[i - bpp] if i >= bpp else 0
            b_, c = prev[i], prev[i - bpp] if i >= bpp else 0
            if ft == 1: line[i] = (line[i] + a) & 255
            elif ft == 2: line[i] = (line[i] + b_) & 255
            elif ft == 3: line[i] = (line[i] + (a + b_) // 2) & 255
            elif ft == 4:
                p_ = a + b_ - c; pa, pb, pc = abs(p_ - a), abs(p_ - b_), abs(p_ - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b_ if pb <= pc else c)) & 255
        out.append(bytes(line)); prev = line
    return w_, h_, bpp, out


# ------------------------------------------------------------------ bake, export, paired check (held; verbatim v02-v04 path)
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

    join('mon_cables__runs', 'mon_cables', [(o, 'black') for o in CABLES if o.get('assetId') == 'mon_cables'] + [(grommet, None)])
    join('under_desk_power__strip_loom', 'under_desk_power', [(o, 'black') for o in CABLES if o.get('assetId') == 'under_desk_power'] + [(OBJ['under_desk_power__strip'], None)])
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

    # paired check against the frozen parent v05, by node name; the raw export is kept as evidence either way
    rawp, raw3 = open(RAW_OUT, 'rb').read(), open(PARENT_GLB, 'rb').read()
    dm, bom, blm = chunks(rawp)
    dp, bop, blp = chunks(raw3)

    def acc_bytes(doc, raw, boff, i):
        a = doc['accessors'][i]; v = doc['bufferViews'][a['bufferView']]
        comp = {5126: 4, 5125: 4, 5123: 2, 5121: 1}[a['componentType']] * {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
        stride = v.get('byteStride', comp)
        o = boff + v.get('byteOffset', 0) + a.get('byteOffset', 0)
        return b''.join(raw[o + k * stride:o + k * stride + comp] for k in range(a['count'])), o, stride, comp

    pn = {n['name']: n for n in dp['nodes']}
    mn = {n['name']: n for n in dm['nodes']}
    removed = set(REMOVED)
    assert set(pn) - set(mn) == removed, sorted(set(pn) - set(mn))
    assert set(mn) - set(pn) == set(ROWS), sorted(set(mn) - set(pn))
    # Named exporter-noise locations (the same four words v05 restored); any other difference fails, no tolerance.
    NOISE = {('desk_top__top_mesh.002', 'TEXCOORD_0', 197, 1): 0.6280039548873901, ('desk_top__top_mesh.002', 'TEXCOORD_0', 199, 0): -0.9475000500679016,
             ('desk_top__top_mesh.002', 'TEXCOORD_0', 274, 1): 0.6309999823570251, ('sub_woofer__cabinet_mesh.001', 'TEXCOORD_0', 85, 1): 0.062499940395355225}
    patches, problems = [], []
    problems.extend(retained_hierarchy_problems(dp, dm, removed, set(ROWS)))
    problems.extend(retained_texture_problems(dp, dm, raw3, rawp, bop, bom))
    for name in sorted(set(pn) & set(mn)):
        a_, b_ = pn[name], mn[name]
        if 'mesh' not in a_:
            continue
        mp, mm = dp['meshes'][a_['mesh']], dm['meshes'][b_['mesh']]
        if mp['name'] != mm['name'] or len(mp['primitives']) != len(mm['primitives']):
            problems.append(('mesh', name)); continue
        for pp, pm in zip(mp['primitives'], mm['primitives']):
            if dp['materials'][pp['material']] != dm['materials'][pm['material']]:
                problems.append(('material', name))
            for key in list(pp['attributes']) + ['indices']:
                ip, im = (pp.get('indices'), pm.get('indices')) if key == 'indices' else (pp['attributes'][key], pm['attributes'].get(key))
                if im is None:
                    problems.append(('attribute', name, key)); continue
                xp, _, _, _ = acc_bytes(dp, raw3, bop, ip)
                xm, om, sm, cm = acc_bytes(dm, rawp, bom, im)
                ap, am = dict(dp['accessors'][ip]), dict(dm['accessors'][im])
                ap.pop('bufferView'); am.pop('bufferView')
                if ap != am:
                    problems.append(('accessorJson', name, key))
                if xp == xm:
                    continue
                for w_ in range(0, len(xp), 4):
                    if xp[w_:w_ + 4] != xm[w_:w_ + 4]:
                        vtx, comp = divmod(w_ // 4, {'VEC2': 2, 'VEC3': 3}.get(dm['accessors'][im]['type'], 1))
                        keyn = (mm['name'], key, vtx, comp)
                        if keyn in NOISE and struct.unpack('<f', xm[w_:w_ + 4])[0] == struct.unpack('<f', struct.pack('<f', NOISE[keyn]))[0]:
                            patches.append((om + vtx * sm + comp * 4, xp[w_:w_ + 4], keyn))
                        else:
                            problems.append(('bytes', name, key, vtx, comp))
    frost_mat = next(m for m in dm['materials'] if m['name'] == 'lib_frost')
    if not (frost_mat.get('alphaMode') == 'BLEND' and not frost_mat.get('doubleSided', False)):
        problems.append(('frostMaterial', frost_mat))
    fnode = mn['kb_case__frost_shell'].get('extras', {})
    if not (fnode.get('renderOrder') == FROST_RENDER_ORDER and fnode.get('nocast') and fnode.get('receiveShadow') is False and fnode.get('occluder') is False):
        problems.append(('frostExtras', fnode))
    # palette images: decode both; every existing cell's pixels identical, the two T2 cells as authored
    for img_name in ('fk_palette_colour', 'fk_palette_orm'):
        def img_bytes(doc, raw, boff):
            im = next(i for i in doc['images'] if i.get('name') == img_name)
            v = doc['bufferViews'][im['bufferView']]
            return raw[boff + v.get('byteOffset', 0):boff + v.get('byteOffset', 0) + v['byteLength']]
        problems.extend(palette_pixel_problems(png_rgba(img_bytes(dp, raw3, bop)),
                                              png_rgba(img_bytes(dm, rawp, bom)), img_name, t2_cells, GRID, CELL))
    out = bytearray(rawp)
    for off, word, _ in patches:
        out[off:off + 4] = word
    meas['exportReadback'] = {'rawExport': os.path.relpath(RAW_OUT, KIT).replace('\\', '/'), 'rawSha256': hashlib.sha256(rawp).hexdigest(),
                              'parent': PARENT_SHA, 'problems': [list(map(str, p)) for p in problems],
                              'namedNoiseRestorations': [{'binOffset': o, 'location': list(k)} for o, _, k in patches]}
    if problems:
        json.dump(meas, open(MEAS_OUT, 'w', encoding='utf-8'), indent=1, default=str)
        raise SystemExit('M3 paired check FAILED against v05; raw export kept, no candidate written: ' + json.dumps(meas['exportReadback']['problems'][:20]))
    with open(GLB_OUT, 'xb') as f:
        f.write(bytes(out))
    meas['exportReadback'].update(glb=os.path.relpath(GLB_OUT, KIT).replace('\\', '/'), glbSha256=hashlib.sha256(bytes(out)).hexdigest(), glbBytes=len(out))
    print('FK M3 exported', GLB_OUT, len(out), meas['exportReadback']['glbSha256'], 'noise restorations', len(patches))

if FLAGS & {'blend', 'glb'}:
    json.dump(meas, open(MEAS_OUT, 'w', encoding='utf-8'), indent=1, default=str)
    print('FK M3 measurements written', MEAS_OUT)
else:
    print('FK M3 dry run: nothing written')
print('FK M3 done', TAG)
