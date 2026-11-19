"""Studio v2 full kit, stage M2: authored workstation family on the unchanged M1 proposal build.

Run (one hidden process, never interactive):
  blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
      --python build_fullkit_m2.py -- <tag> [blend] [glb]

Base: build_fullkit.py (M1, sha256 1a66c8be..., not modified) is executed with variant 'proposal' and no save or
export flags. That rebuilds the M1 library, architecture, pilot door and lamp, the seven exact binding planes and
every M1 proxy. This script then deletes only the M1 grey proxies whose assetId belongs to M2 and authors those
assets as editable native models:

  desk_top, desk_frame (legs, rails, levelling feet, cable tray), desk_mat, mon_central, mon_side (one mesh, two
  linked objects), mon_top (pole arm and desk clamp), mon_cables (Bezier curves + grommet), pc_tower (shell, mesh
  front, three fans, interior, glass side, glow bar), sub_woofer, under_desk_power (strip, loom, tray drop),
  fix_pendant (body, recessed lens, end caps, cables, canopies).

The target, border, display and dusk quads are the M1 objects, untouched. Nearfield (M3), music (M4) and wall (M5)
proxies stay, still named __proxy.

Editable state saved first: meshes carry live Bevel modifiers (weight-limited, hardened normals); cables are live
Bezier curves. Export state is made afterwards on the in-memory copy: modifiers and curves are baked, mon_side
keeps one shared mesh, cables and the grommet join into one mon_cables leaf, strip and loom into one
under_desk_power leaf. Units: Blender metres, Z up; prototype world (x, y, z) -> Blender (x/2, -z/2, (y-0.11)/2).
"""
import bpy, bmesh, sys, os, math, json, runpy, hashlib, struct
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index('--') + 1:]
TAG, FLAGS = ARGS[0], set(ARGS[1:])
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
EXPORTS, MANIFESTS = os.path.join(KIT, 'exports'), os.path.join(KIT, 'manifests')
M1_SCRIPT = os.path.join(HERE, 'build_fullkit.py')
M1_SHA = '1a66c8be156c8ef7208f8ccba8c0fee7130f962ba2ba280a98f8aa450404d3a5'


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def fresh(path):
    if os.path.exists(path):
        raise RuntimeError('Refusing to overwrite existing deliverable: ' + path)
    return path


assert sha(M1_SCRIPT) == M1_SHA, 'M1 base script differs from the recorded version'
_argv = sys.argv
sys.argv = [_argv[0], '--', 'proposal', 'm2base-' + TAG]
G = runpy.run_path(M1_SCRIPT, run_name='fk_m1_base')
sys.argv = _argv

scene, MAT, COL, ROOT, SW = G['scene'], G['MAT'], G['COL'], G['ROOT'], G['SWATCH_UV']
leaf, B, EYE = G['leaf'], G['B'], G['EYE']
assert G['P'] and abs(G['FACE_Z'] - 0.054) < 1e-9 and abs(G['BORDER_Z'] - 0.046) < 1e-9
assert abs(G['BORDER_GROW'] - 0.04) < 1e-9 and abs(G['BEZEL'] - 0.035) < 1e-9

M2_ASSETS = ['desk_top', 'desk_frame', 'desk_mat', 'mon_central', 'mon_side', 'mon_top', 'mon_cables', 'pc_tower',
             'sub_woofer', 'under_desk_power', 'fix_pendant']
REMOVED = []
for obj in list(bpy.data.objects):
    if obj.get('assetId') in M2_ASSETS and '__proxy' in obj.name:
        REMOVED.append(obj.name)
        bpy.data.objects.remove(obj, do_unlink=True)
REMOVED.sort()

# ------------------------------------------------------------------ fixed dimensions (Blender metres)
FACE_Y = -G['FACE_Z'] / 2            # face plane, monitor local (front = -Y): -0.027
BORDER_Y = -G['BORDER_Z'] / 2        # border plane: -0.023 (4 mm behind the face)
FLOOR_Y = BORDER_Y + 0.004           # recess floor: -0.019 (4 mm behind the border)
BEZ = G['BEZEL'] / 2                 # 17.5 mm bezel per side
OVERHANG = G['BORDER_GROW'] / 4      # 10 mm border overhang per side
SLAB_BACK = 0.003                    # panel slab is 30 mm deep at the bezel
EPS = 0.0003                         # resting gap: supported parts sit 0.3 mm above their support
DESK = dict(x0=-1.9, x1=0.55, y0=-0.5625, y1=0.3125, top=0.735, under=0.695)


def group(pid):
    g, w, h, yaw = G['SCREENS'][pid]
    if pid == 'dissertation':
        g = (g[0], g[1], -0.39)           # captured proposal: 60 mm setback
    return B(g), w / 4, h / 4, yaw       # half extents in metres (world units are 2 per metre)


# ------------------------------------------------------------------ mesh building
class Build:
    """One leaf: one material, explicit UVs (palette swatch centres or planar maps), bevel weights, sharp edges."""

    def __init__(self, name, mat):
        self.name, self.mat = name, mat
        self.bm = bmesh.new()
        self.uv = self.bm.loops.layers.uv.new('UVMap')
        self.bw = self.bm.edges.layers.float.new('bevel_weight_edge')

    def finish_faces(self, faces, swatch=None, uvmap=None, bevel='auto', corners=None):
        bmesh.ops.recalc_face_normals(self.bm, faces=faces)
        for f in faces:
            f.smooth = True
            for loop in f.loops:
                loop[self.uv].uv = SW[swatch] if swatch else uvmap(loop.vert.co, f.normal)
        for e in {e for f in faces for e in f.edges}:
            sharp = len(e.link_faces) == 2 and e.calc_face_angle(0.0) > math.radians(40)
            weight = sharp if bevel == 'auto' else (all(v in corners for v in e.verts) if bevel == 'corners' else False)
            e[self.bw] = 1.0 if weight else 0.0
            e.smooth = not (sharp and not weight)
        return faces


def faces_of(verts):
    return list({f for v in verts for f in v.link_faces})


def recolor(b, faces, swatch):
    for f in faces:
        for loop in f.loops:
            loop[b.uv].uv = SW[swatch]


AX = {'Z': Matrix(), 'X': Matrix.Rotation(math.pi / 2, 4, 'Y'), 'Y': Matrix.Rotation(math.pi / 2, 4, 'X')}


def cube(b, lo, hi, swatch=None, uvmap=None, bevel='auto', M=None):
    lo, hi = Vector(lo), Vector(hi)
    T = (M or Matrix()) @ Matrix.Translation((lo + hi) / 2) @ Matrix.Diagonal((*(hi - lo), 1))
    return b.finish_faces(faces_of(bmesh.ops.create_cube(b.bm, size=1.0, matrix=T)['verts']), swatch, uvmap, bevel)


def cylinder(b, c, r, h, axis='Z', n=16, swatch=None, bevel='auto', r2=None, M=None):
    T = (M or Matrix()) @ Matrix.Translation(c) @ AX[axis]
    verts = bmesh.ops.create_cone(b.bm, cap_ends=True, cap_tris=False, segments=n, radius1=r,
                                  radius2=r if r2 is None else r2, depth=h, matrix=T)['verts']
    return b.finish_faces(faces_of(verts), swatch, None, bevel)


def poly(b, verts, loops, swatch=None, uvmap=None, bevel='auto', corners_idx=None):
    vs = [b.bm.verts.new(v) for v in verts]
    fs = [b.bm.faces.new([vs[i] for i in loop]) for loop in loops]
    if corners_idx is not None:
        return b.finish_faces(fs, swatch, uvmap, 'corners', {vs[i] for i in corners_idx})
    return b.finish_faces(fs, swatch, uvmap, bevel)


def ring(b, c, r_in, r_out, h, axis='Z', n=24, swatch=None, M=None):
    """Closed annular tube (fan frame, grommet, cable tie). Never bevelled."""
    T = (M or Matrix()) @ Matrix.Translation(c) @ AX[axis]
    verts = [T @ Vector((r * math.cos(2 * math.pi * i / n), r * math.sin(2 * math.pi * i / n), z))
             for z in (-h / 2, h / 2) for r in (r_in, r_out) for i in range(n)]
    k = lambda zi, ri, i: zi * 2 * n + ri * n + i % n
    loops = []
    for i in range(n):
        loops += [(k(0, 1, i), k(0, 1, i + 1), k(1, 1, i + 1), k(1, 1, i)), (k(0, 0, i), k(1, 0, i), k(1, 0, i + 1), k(0, 0, i + 1)),
                  (k(1, 0, i), k(1, 1, i), k(1, 1, i + 1), k(1, 0, i + 1)), (k(0, 0, i), k(0, 0, i + 1), k(0, 1, i + 1), k(0, 1, i))]
    return poly(b, verts, loops, swatch, bevel='none')


def prism(b, c, w, d, h, r, n=3, swatch=None, M=None):
    """Rounded-rectangle plate in XY, thickness h along Z."""
    pts = []
    for cx, cy, a0 in ((w / 2 - r, d / 2 - r, 0), (-w / 2 + r, d / 2 - r, 90), (-w / 2 + r, -d / 2 + r, 180), (w / 2 - r, -d / 2 + r, 270)):
        pts += [(cx + r * math.cos(math.radians(a0 + 90 * i / n)), cy + r * math.sin(math.radians(a0 + 90 * i / n))) for i in range(n + 1)]
    T = (M or Matrix()) @ Matrix.Translation(c)
    k = len(pts)
    verts = [T @ Vector((x, y, z)) for z in (-h / 2, h / 2) for x, y in pts]
    loops = [tuple(range(k)), tuple(range(k, 2 * k))] + [(i, (i + 1) % k, k + (i + 1) % k, k + i) for i in range(k)]
    return poly(b, verts, loops, swatch)


def frustum(b, y0, y1, w0, h0, w1, h1, dz=0.0, swatch='black', M=None):
    """Tapered rear housing: front rectangle at y0, smaller back rectangle at y1."""
    T = M or Matrix()
    verts = [T @ Vector((sx * w / 2, y, dz + sz * h / 2)) for y, w, h in ((y0, w0, h0), (y1, w1, h1))
             for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    return poly(b, verts, [(0, 1, 2, 3), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)], swatch)


def framed_box(b, lo, hi, axis, sign, inset, depth, swatch=None, floor_swatch=None, uvmap=None, M=None):
    """Closed box whose face (axis, sign) carries a rectangular pocket `depth` deep inside an `inset` frame.
    Only the twelve outer box edges carry bevel weight; pocket edges stay crisp."""
    T = M or Matrix()
    a = 'xyz'.index(axis)
    u, v = [i for i in range(3) if i != a]
    p, q = (hi[a], lo[a]) if sign > 0 else (lo[a], hi[a])

    def P(av, uu, vv):
        co = [0.0, 0.0, 0.0]
        co[a], co[u], co[v] = av, uu, vv
        return T @ Vector(co)

    rect = lambda av, d: [P(av, lo[u] + d, lo[v] + d), P(av, hi[u] - d, lo[v] + d), P(av, hi[u] - d, hi[v] - d), P(av, lo[u] + d, hi[v] - d)]
    verts = rect(q, 0) + rect(p, 0) + rect(p, inset) + rect(p - sign * depth, inset)
    loops = ([(0, 1, 2, 3)] + [(i, (i + 1) % 4, 4 + (i + 1) % 4, 4 + i) for i in range(4)]
             + [(4 + i, 4 + (i + 1) % 4, 8 + (i + 1) % 4, 8 + i) for i in range(4)]
             + [(8 + i, 8 + (i + 1) % 4, 12 + (i + 1) % 4, 12 + i) for i in range(4)] + [(12, 13, 14, 15)])
    faces = poly(b, verts, loops, swatch, uvmap, corners_idx=range(8))
    if floor_swatch:
        recolor(b, [faces[-1]], floor_swatch)
    return faces


def hollow_box(b, lo, hi, t, frame, swatch, liner_swatch):
    """Closed shell open on its -X face (window `frame` in from the edges), wall thickness t, lined inside."""
    (x0, y0, z0), (x1, y1, z1) = lo, hi
    O = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
    hole = lambda x: [(x, y0 + frame, z0 + frame), (x, y1 - frame, z0 + frame), (x, y1 - frame, z1 - frame), (x, y0 + frame, z1 - frame)]
    I = [(x0 + t, y0 + t, z0 + t), (x1 - t, y0 + t, z0 + t), (x1 - t, y1 - t, z0 + t), (x0 + t, y1 - t, z0 + t),
         (x0 + t, y0 + t, z1 - t), (x1 - t, y0 + t, z1 - t), (x1 - t, y1 - t, z1 - t), (x0 + t, y1 - t, z1 - t)]
    verts = O + hole(x0) + hole(x0 + t) + I          # 0-7 outer, 8-11 window, 12-15 window inner, 16-23 liner
    outer = [(0, 1, 2, 3), (4, 5, 6, 7), (1, 2, 6, 5), (0, 1, 5, 4), (2, 3, 7, 6),
             (0, 3, 9, 8), (3, 7, 10, 9), (7, 4, 11, 10), (4, 0, 8, 11)]
    tunnel = [(8, 9, 13, 12), (9, 10, 14, 13), (10, 11, 15, 14), (11, 8, 12, 15)]
    liner = [(16, 19, 13, 12), (19, 23, 14, 13), (23, 20, 15, 14), (20, 16, 12, 15),
             (16, 17, 18, 19), (20, 21, 22, 23), (17, 18, 22, 21), (16, 17, 21, 20), (18, 19, 23, 22)]
    faces = poly(b, [Vector(v) for v in verts], outer + tunnel + liner, swatch, corners_idx=range(8))
    recolor(b, faces[len(outer) + len(tunnel):], liner_swatch)
    return faces


def oak_uv(co, n):
    """Grain along X (one tile per 2 m, as the pilot), faces and edges share it; X-facing ends get compressed end grain."""
    a = max(range(3), key=lambda i: abs(n[i]))
    if a == 0:
        return (0.37 + co.y * 0.04, co.z * 14.0)
    if a == 2:
        return (co.x * 0.5, co.y * 1.2)
    return (co.x * 0.5, co.z * 1.2 + 0.3)


def weave_uv(co, n):
    a = max(range(3), key=lambda i: abs(n[i]))
    u, v = [co[i] for i in range(3) if i != a]
    return (u * 4, v * 4)


OBJ = {}


def finish(b, asset, coll='FK_WORKSTATION', casts=True, bevel=0.0025, segs=2, role='opaque', receive=True, mesh=None):
    if mesh is None:
        mesh = bpy.data.meshes.new(b.name + '_mesh')
        b.bm.to_mesh(mesh)
        b.bm.free()
        mesh.materials.append(MAT[b.mat])
    obj = leaf(b.name, mesh, coll, asset, role=role, casts=casts, receive=receive)
    if bevel:
        mod = obj.modifiers.new('fk_bevel', 'BEVEL')
        mod.width, mod.segments, mod.limit_method = bevel, segs, 'WEIGHT'
        mod.harden_normals, mod.use_clamp_overlap = True, True
    OBJ[b.name] = obj
    return obj


def mat_at(origin, yaw):
    return Matrix.Translation(origin) @ Matrix.Rotation(yaw, 4, 'Z')


# ------------------------------------------------------------------ desk top (lib_oak), grommet hole
GROMMET = Vector((-0.60, 0.22))
b = Build('desk_top__top', 'lib_oak')
cube(b, (DESK['x0'], DESK['y0'], DESK['under']), (DESK['x1'], DESK['y1'], DESK['top']), uvmap=oak_uv)
desk = finish(b, 'desk_top', bevel=0.005, segs=3)
desk.modifiers.remove(desk.modifiers['fk_bevel'])
cutter_mesh = bpy.data.meshes.new('fk_grommet_cutter')
cbm = bmesh.new()
bmesh.ops.create_cone(cbm, cap_ends=True, segments=24, radius1=0.0325, radius2=0.0325, depth=0.12,
                      matrix=Matrix.Translation((GROMMET.x, GROMMET.y, 0.715)))
cbm.to_mesh(cutter_mesh)
cbm.free()
cutter = bpy.data.objects.new('fk_grommet_cutter', cutter_mesh)
scene.collection.objects.link(cutter)
boolean = desk.modifiers.new('fk_grommet_hole', 'BOOLEAN')
boolean.operation, boolean.object, boolean.solver = 'DIFFERENCE', cutter, 'EXACT'
dg = bpy.context.evaluated_depsgraph_get()
holed = bpy.data.meshes.new_from_object(desk.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
desk.modifiers.remove(boolean)
old = desk.data
desk.data = holed
holed.name = 'desk_top__top_mesh'
bpy.data.meshes.remove(old)
bpy.data.objects.remove(cutter, do_unlink=True)
bpy.data.meshes.remove(cutter_mesh)
mod = desk.modifiers.new('fk_bevel', 'BEVEL')
mod.width, mod.segments, mod.limit_method, mod.harden_normals, mod.use_clamp_overlap = 0.005, 3, 'WEIGHT', True, True

# ------------------------------------------------------------------ desk frame (legs, rails, feet, tray)
LEGS = [(x, y) for x in (-1.82, 0.47) for y in (-0.49, 0.2425)]
TRAY = dict(x0=-1.45, x1=-0.25, y0=0.11, y1=0.25, z0=0.555, floor=0.558, lip=0.60)
b = Build('desk_frame__steel', 'lib_palette')
for x, y in LEGS:
    cube(b, (x - 0.02, y - 0.02, 0.0123), (x + 0.02, y + 0.02, DESK['under'] - EPS), 'black_metal')
    cylinder(b, (x, y, 0.0093), 0.008, 0.006, n=10, swatch='metal')
    cylinder(b, (x, y, 0.0033), 0.019, 0.006, n=16, swatch='rubber')
for x in (-1.82, 0.47):
    cube(b, (x - 0.015, -0.51, 0.645), (x + 0.015, 0.2625, DESK['under'] - EPS), 'black_metal')
cube(b, (-1.84, 0.2275, 0.645), (0.49, 0.2575, DESK['under'] - EPS), 'black_metal')
cube(b, (TRAY['x0'], TRAY['y0'], TRAY['z0']), (TRAY['x1'], TRAY['y1'], TRAY['floor']), 'black_metal')
cube(b, (TRAY['x0'], TRAY['y0'], TRAY['floor']), (TRAY['x1'], TRAY['y0'] + 0.003, TRAY['lip']), 'black_metal')
cube(b, (TRAY['x0'], TRAY['y1'] - 0.003, TRAY['floor']), (TRAY['x1'], TRAY['y1'], TRAY['lip']), 'black_metal')
for x in (-1.30, -0.40):
    cube(b, (x - 0.01, TRAY['y1'] - 0.003, TRAY['lip']), (x + 0.01, TRAY['y1'], 0.645), 'black_metal')
finish(b, 'desk_frame', bevel=0.002)

# ------------------------------------------------------------------ desk mat (lib_weave), raised stitched border
b = Build('desk_mat__felt', 'lib_weave')
framed_box(b, (-1.2, -0.51, DESK['top'] + EPS), (-0.3, -0.11, DESK['top'] + EPS + 0.009), 'z', 1, 0.010, 0.0006, uvmap=weave_uv)
finish(b, 'desk_mat', casts=False, bevel=0.003)

# ------------------------------------------------------------------ monitors
MON = {pid: group(pid) for pid in ('dissertation', 'copilot', 'typeforge', 'studio')}


def monitor_body(b, hw, hh, bulge):
    """Slab with a 17.5 mm bezel; the lip is flush with the face plane and surrounds the border exactly."""
    ow, oh = 2 * hw + 2 * BEZ, 2 * hh + 2 * BEZ
    lip = (ow - (2 * hw + 2 * OVERHANG)) / 2 - 0.0005    # 0.5 mm clearance round the border edge
    framed_box(b, (-ow / 2, FACE_Y, -oh / 2), (ow / 2, SLAB_BACK, oh / 2), 'y', -1, lip, FLOOR_Y - FACE_Y, 'black', 'black')
    (w0, h0), (w1, h1), depth, dz = bulge
    frustum(b, SLAB_BACK - 0.001, SLAB_BACK + depth, w0, h0, w1, h1, dz, 'black')
    return SLAB_BACK + depth, lip, ow, oh


def desk_stand(b, desk_z, back_y, foot_w):
    hz = -0.03
    cube(b, (-0.055, back_y - 0.001, hz - 0.05), (0.055, back_y + 0.025, hz + 0.05), 'black_metal')      # hinge
    ny0, ny1 = back_y + 0.016, back_y + 0.044
    foot_top = desk_z + EPS + 0.0027 + 0.012
    cube(b, (-0.035, ny0, foot_top - 0.002), (0.035, ny1, hz + 0.02), 'black_metal')                    # neck
    fy = (ny0 + ny1) / 2 - 0.063
    prism(b, (0, fy, foot_top - 0.006), foot_w, 0.19, 0.012, 0.035, n=3, swatch='black_metal')           # foot
    for sx in (-1, 1):
        for sy in (-1, 1):
            cylinder(b, (sx * (foot_w / 2 - 0.03), fy + sy * 0.065, desk_z + EPS + 0.00135), 0.011, 0.0027, n=10, swatch='rubber')
    return dict(neckY=[ny0, ny1], footY=[fy - 0.095, fy + 0.095], footW=foot_w, footTop=foot_top)


MONITOR_FACTS = {}
origin, hw, hh, yaw = MON['dissertation']
b = Build('mon_central__body', 'lib_palette')
back, lip, ow, oh = monitor_body(b, hw, hh, ((0.70, 0.40), (0.46, 0.26), 0.045, -0.02))
stand = desk_stand(b, DESK['top'] - origin.z, back, 0.30)
o = finish(b, 'mon_central')
o.location, o.rotation_euler = origin, (0, 0, yaw)
MONITOR_FACTS['mon_central'] = dict(outer=[ow, oh], lip=lip, rearY=back, **stand)

origin_c, hw, hh, yaw_c = MON['copilot']
b = Build('mon_side__copilot', 'lib_palette')
back, lip, ow, oh = monitor_body(b, hw, hh, ((0.30, 0.44), (0.18, 0.28), 0.025, -0.03))
stand = desk_stand(b, DESK['top'] - origin_c.z, back, 0.24)
side = finish(b, 'mon_side')
side.location, side.rotation_euler = origin_c, (0, 0, yaw_c)
origin_t, _, _, yaw_t = MON['typeforge']
assert abs(origin_t.z - origin_c.z) < 1e-9
side2 = leaf('mon_side__typeforge', side.data, 'FK_WORKSTATION', 'mon_side')
m2 = side2.modifiers.new('fk_bevel', 'BEVEL')
m2.width, m2.segments, m2.limit_method, m2.harden_normals, m2.use_clamp_overlap = 0.0025, 2, 'WEIGHT', True, True
side2.location, side2.rotation_euler = origin_t, (0, 0, yaw_t)
OBJ['mon_side__typeforge'] = side2
MONITOR_FACTS['mon_side'] = dict(outer=[ow, oh], lip=lip, rearY=back, linkedObjects=2, **stand)

origin_s, hw, hh, yaw_s = MON['studio']
POLE = Vector((0.30, 0.025))                       # local to the top display
DZ = DESK['top'] - origin_s.z                       # desk top in local z (-0.970)
UZ = DESK['under'] - origin_s.z                     # desk underside (-1.010)
b = Build('mon_top__body', 'lib_palette')
back, lip, ow, oh = monitor_body(b, hw, hh, ((0.46, 0.26), (0.28, 0.15), 0.025, 0.0))
cube(b, (-0.05, back - 0.001, -0.05), (0.05, back + 0.008, 0.05), 'black_metal')                       # VESA plate
cube(b, (0.0, back + 0.008, -0.015), (POLE.x, back + 0.026, 0.015), 'black_metal')                    # arm
cylinder(b, (POLE.x, POLE.y, 0.0), 0.022, 0.04, n=16, swatch='black_metal')                          # collar
pole_bottom = DZ + EPS + 0.012
cylinder(b, (POLE.x, POLE.y, (pole_bottom + 0.03) / 2), 0.016, 0.03 - pole_bottom, n=16, swatch='metal', bevel='none')
cube(b, (POLE.x - 0.035, -0.05, DZ + EPS), (POLE.x + 0.035, 0.05, DZ + EPS + 0.012), 'black_metal')    # clamp top plate
edge_y = DESK['y1'] - origin_s.y                    # desk back edge, local (-0.0075)
cube(b, (POLE.x - 0.035, edge_y + 0.0015, UZ - 0.04), (POLE.x + 0.035, edge_y + 0.0195, DZ + EPS + 0.001), 'black_metal')  # jaw
cube(b, (POLE.x - 0.035, -0.055, UZ - 0.052), (POLE.x + 0.035, edge_y + 0.0195, UZ - 0.04), 'black_metal')  # lower jaw
cylinder(b, (POLE.x, -0.035, (UZ - 0.04 + UZ - 0.0015) / 2), 0.006, 0.0385, n=10, swatch='metal')      # screw
cylinder(b, (POLE.x, -0.035, UZ - EPS - 0.0015), 0.016, 0.003, n=16, swatch='rubber')                  # pressure pad
cylinder(b, (POLE.x, -0.035, UZ - 0.062), 0.02, 0.02, n=16, swatch='black_metal')                       # knob
o = finish(b, 'mon_top')
o.location, o.rotation_euler = origin_s, (0, 0, yaw_s)
MONITOR_FACTS['mon_top'] = dict(outer=[ow, oh], lip=lip, rearY=back, poleWorld=list((mat_at(origin_s, yaw_s) @ Vector((POLE.x, POLE.y, 0)))[:2]))

# ------------------------------------------------------------------ PC tower (tier F: 0.275 x 0.59 x 0.56), set back under the right bay
PC = dict(x0=0.10, x1=0.375, yf=-0.395, yb=0.165, zb=0.015, zt=0.605, t=0.006)
x0, x1, yf, yb, zb, zt, t = (PC[k] for k in ('x0', 'x1', 'yf', 'yb', 'zb', 'zt', 't'))
xc = (x0 + x1) / 2
b = Build('pc_tower__case', 'lib_palette')
hollow_box(b, (x0, yf + 0.021, zb), (x1, yb, zt), t, 0.014, 'white_pc', 'ivory')
framed_box(b, (x0, yf, zb), (x1, yf + 0.022, zt), 'y', -1, 0.022, 0.008, 'white_pc', 'black')            # mesh front
FANS = [0.505, 0.335, 0.165]
for zc in FANS:
    ring(b, (xc, yf + 0.006, zc), 0.058, 0.068, 0.004, 'Y', n=24, swatch='metal')
    cylinder(b, (xc, yf + 0.0065, zc), 0.022, 0.003, axis='Y', n=16, swatch='black_metal', bevel='none')
    for k in range(5):
        M = Matrix.Translation((xc, yf + 0.0065, zc)) @ Matrix.Rotation(math.radians(72 * k + 10), 4, 'Y') @ Matrix.Rotation(0.45, 4, 'X')
        cube(b, (0.02, -0.001, -0.009), (0.056, 0.001, 0.009), 'black_metal', bevel='none', M=M)
for fx in (x0 + 0.04, x1 - 0.04):
    for fy in (yf + 0.05, yb - 0.05):
        cylinder(b, (fx, fy, zb / 2 + EPS / 2), 0.022, zb - EPS, n=12, swatch='rubber')
cube(b, (0.18, yf + 0.03, zt - 0.001), (0.30, yf + 0.045, zt + 0.0015), 'black', bevel='none')             # top I/O
cylinder(b, (0.14, yf + 0.0375, zt + 0.0005), 0.009, 0.003, n=12, swatch='metal', bevel='none')         # power button
IX0, IX1 = x0 + t, x1 - t
cube(b, (IX1 - 0.003, yf + 0.07, 0.20), (IX1, yb - 0.04, zt - 0.03), 'proxy_dark', bevel='none')           # motherboard
cube(b, (IX0 + 0.05, yf + 0.05, 0.27), (IX1 - 0.003, yf + 0.36, 0.31), 'black')                            # graphics card
cube(b, (IX0 + 0.05, yf + 0.05, 0.31), (IX1 - 0.003, yf + 0.36, 0.313), 'metal', bevel='none')             # its backplate
cube(b, (IX1 - 0.083, -0.08, 0.40), (IX1 - 0.003, 0.04, 0.53), 'metal')                                    # CPU cooler
cylinder(b, (IX1 - 0.043, -0.082, 0.465), 0.05, 0.004, axis='Y', n=16, swatch='black', bevel='none')
for ry in (0.07, 0.085):
    cube(b, (IX1 - 0.035, ry, 0.42), (IX1 - 0.003, ry + 0.007, 0.55), 'black_metal', bevel='none')        # memory
cube(b, (IX0, yf + 0.03, zb + t), (IX1, yb - t, 0.14), 'white_pc')                                          # PSU shroud
ring(b, (xc, yb - t - 0.003, 0.47), 0.05, 0.058, 0.004, 'Y', n=24, swatch='metal')                         # rear fan
finish(b, 'pc_tower', bevel=0.003)
b = Build('pc_tower__glow', 'lib_glow')
cube(b, (IX0 + 0.012, yf + 0.032, 0.14), (IX1 - 0.012, yf + 0.037, 0.1435), uvmap=lambda co, n: (0.5, 0.5), bevel='none')
finish(b, 'pc_tower', casts=False, bevel=0)
# glass: one quad over the -X window, overlapping the frame by 4 mm; blended, never a blocker or caster
gl = [(x0 - 0.0015, yf + 0.021 + 0.010, zb + 0.010), (x0 - 0.0015, yf + 0.021 + 0.010, zt - 0.010),
      (x0 - 0.0015, yb - 0.010, zt - 0.010), (x0 - 0.0015, yb - 0.010, zb + 0.010)]
glass_mesh = bpy.data.meshes.new('pc_tower__glass_mesh')
glass_mesh.from_pydata(gl, [], [(0, 1, 2, 3)])
layer = glass_mesh.uv_layers.new(name='UVMap')
for loop, uv in zip(layer.data, [(0, 0), (0, 1), (1, 1), (1, 0)]):
    loop.uv = uv
glass_mesh.materials.append(MAT['lib_glass'])
assert glass_mesh.polygons[0].normal.x < -0.99
glass = leaf('pc_tower__glass', glass_mesh, 'FK_WORKSTATION', 'pc_tower', role='transparent', casts=False, receive=False)
glass['renderOrder'] = 2
OBJ['pc_tower__glass'] = glass

# ------------------------------------------------------------------ subwoofer (tier F 0.37 x 0.39 x 0.36) under the left bay
SUB = dict(x0=-1.535, x1=-1.165, y0=-0.155, y1=0.205, z0=0.0123, z1=0.4023)
b = Build('sub_woofer__cabinet', 'lib_palette')
framed_box(b, (SUB['x0'], SUB['y0'], SUB['z0']), (SUB['x1'], SUB['y1'], SUB['z1']), 'y', -1, 0.022, 0.008, 'black', 'black')
for fx in (SUB['x0'] + 0.045, SUB['x1'] - 0.045):
    for fy in (SUB['y0'] + 0.045, SUB['y1'] - 0.045):
        cylinder(b, (fx, fy, (SUB['z0'] + EPS) / 2), 0.02, SUB['z0'] - EPS, n=12, swatch='rubber')
cube(b, (-1.45, SUB['y1'] - 0.001, 0.08), (-1.25, SUB['y1'] + 0.004, 0.30), 'black_metal')                   # amplifier plate
cylinder(b, (-1.30, SUB['y1'] + 0.008, 0.25), 0.012, 0.008, axis='Y', n=12, swatch='metal')                  # gain knob
finish(b, 'sub_woofer', bevel=0.004)
b = Build('sub_woofer__grille', 'lib_weave')
cube(b, (SUB['x0'] + 0.023, SUB['y0'] + 0.006, SUB['z0'] + 0.023), (SUB['x1'] - 0.023, SUB['y0'] + 0.010, SUB['z1'] - 0.023), uvmap=weave_uv)
finish(b, 'sub_woofer', bevel=0.002)

# ------------------------------------------------------------------ pendant (body, recessed lens, end caps, two cables, canopies)
PEND = dict(x0=-1.275, x1=-0.325, y0=-0.1925, y1=-0.1075, z0=1.935, z1=1.975, ceiling=G['Z1'])
b = Build('fix_pendant__body', 'lib_palette')
framed_box(b, (PEND['x0'], PEND['y0'], PEND['z0']), (PEND['x1'], PEND['y1'], PEND['z1']), 'z', -1, 0.010, 0.006, 'black_metal', 'black')
for xe in (PEND['x0'] - 0.002, PEND['x1'] + 0.002):
    cube(b, (xe - 0.0025, PEND['y0'] - 0.001, PEND['z0'] - 0.001), (xe + 0.0025, PEND['y1'] + 0.001, PEND['z1'] + 0.001), 'metal')
for xh in (-1.10, -0.50):
    cylinder(b, (xh, -0.15, PEND['z1'] + 0.006), 0.007, 0.012, n=12, swatch='metal')
    top = PEND['ceiling'] - EPS - 0.018
    cylinder(b, (xh, -0.15, (PEND['z1'] + 0.012 + top) / 2), 0.0022, top - PEND['z1'] - 0.012, n=6, swatch='black', bevel='none')
    cylinder(b, (xh, -0.15, top + 0.009), 0.045, 0.018, n=24, swatch='black_metal')
finish(b, 'fix_pendant', casts=False, bevel=0.003)
b = Build('fix_pendant__lens', 'lib_glow')
cube(b, (PEND['x0'] + 0.012, PEND['y0'] + 0.012, PEND['z0'] + 0.0015), (PEND['x1'] - 0.012, PEND['y1'] - 0.012, PEND['z0'] + 0.0055),
     uvmap=lambda co, n: (0.5, 0.5), bevel='none')
finish(b, 'fix_pendant', casts=False, bevel=0)

# ------------------------------------------------------------------ cables: live Bezier curves, 8 mm (monitor) / 7 mm / 16 mm loom
CABLES = []


def cable(name, asset, pts, radius, rest=()):
    """Bezier cable through pts. Points in `rest` lie on a support: their handles are horizontal so the tube cannot dip
    through the desk, tray or floor (convex hull of the control polygon stays above the support)."""
    cu = bpy.data.curves.new(name + '_curve', 'CURVE')
    cu.dimensions, cu.bevel_depth, cu.bevel_resolution, cu.resolution_u, cu.use_fill_caps = '3D', radius, 1, 3, True
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts) - 1)
    for p, co in zip(sp.bezier_points, pts):
        p.co = co
        p.handle_left_type = p.handle_right_type = 'AUTO'
    n = len(pts)
    for i in [r % n for r in rest]:
        prev, nxt = (pts[i - 1] if i > 0 else None), (pts[i + 1] if i < n - 1 else None)
        d = (nxt if nxt is not None else pts[i]) - (prev if prev is not None else pts[i])
        d.z = 0
        if d.length < 1e-6:
            continue
        d.normalize()
        p = sp.bezier_points[i]
        p.handle_left_type = p.handle_right_type = 'FREE'
        p.handle_left = pts[i] - d * ((pts[i] - prev).length / 3 if prev is not None else 0.01)
        p.handle_right = pts[i] + d * ((nxt - pts[i]).length / 3 if nxt is not None else 0.01)
    cu.materials.append(MAT['lib_palette'])
    obj = leaf(name, cu, 'FK_WORKSTATION', asset, casts=False)
    OBJ[name] = obj
    CABLES.append(obj)
    return obj


R = 0.004
TOPZ = DESK['top'] + EPS + R                       # centre height of a cable lying on the desk
TRAYZ = TRAY['floor'] + EPS + R                    # centre height of a cable lying in the tray
Mc = mat_at(MON['dissertation'][0], MON['dissertation'][3])
hole_local = Mc.inverted() @ Vector((GROMMET.x, GROMMET.y, DESK['top']))
for i, dx in enumerate((-0.0045, 0.0045)):
    pts = [Mc @ Vector(p) for p in [(dx - 0.07, 0.048 + R + 0.002, -0.12), (dx - 0.06, 0.078, -0.20), (dx - 0.047, 0.103, -0.26), (dx, 0.100, -0.30), (dx + 0.08, 0.108, -0.352),
                                    (hole_local.x + dx - 0.04, 0.075, -0.376), (hole_local.x + dx, hole_local.y + 0.002, -0.392)]]
    pts += [Vector((GROMMET.x + dx, GROMMET.y, z)) for z in (DESK['top'] - 0.03, DESK['under'] - 0.05, TRAYZ)]
    cable(f'mon_cables__central_{"ab"[i]}', 'mon_cables', pts, R)
for pid, sgn in (('copilot', 1), ('typeforge', -1)):
    origin, _, _, yaw = MON[pid]
    Ms = mat_at(origin, yaw)
    for i, dx in enumerate((-0.0045, 0.0045)):
        pts = [Ms @ Vector(p) for p in [(dx - 0.065, 0.028 + R + 0.002, -0.14), (dx - 0.055, 0.058, -0.22), (dx - 0.042, 0.085, -0.28), (dx, 0.082, -0.33), (dx, 0.135, DESK['top'] - origin.z + 0.015),
                                        (dx, 0.16, TOPZ - origin.z)]]
        ex = pts[-1].x
        if sgn > 0:
            tail = [(ex, 0.290, TOPZ), (ex, 0.3185, 0.7385), (ex, 0.3265, 0.722), (ex + 0.01, 0.335, 0.655), (-1.55, 0.285, 0.613),
                    (-1.47 - dx, 0.222 + dx, 0.58), (-1.38, 0.215 + dx, TRAYZ), (-1.25, 0.21 + dx, TRAYZ)]
        else:
            tail = [(ex, 0.290, TOPZ), (ex, 0.3185, 0.7385), (ex, 0.3265, 0.722), (ex - 0.01, 0.335, 0.655), (-0.08, 0.29, 0.62),
                    (-0.20, 0.23 + dx, 0.578), (-0.30, 0.205 + dx, TRAYZ), (-0.42, 0.20 + dx, TRAYZ)]
        cable(f'mon_cables__{pid}_{"ab"[i]}', 'mon_cables', pts + [Vector(p) for p in tail], R, rest=(5, 6, 12, 13))
Mt = mat_at(MON['studio'][0], MON['studio'][3])
for i, dx in enumerate((-0.0045, 0.0045)):
    local_pts = [(0.03 + dx, back + R + 0.002, -0.065), (0.15 + dx, back + 0.03, -0.07), (POLE.x + dx, POLE.y + 0.023, -0.12),
                 (POLE.x + dx, POLE.y + 0.023, -0.50), (POLE.x + dx, POLE.y + 0.023, -0.90), (POLE.x + 0.05 + dx, POLE.y + 0.03, DZ + 0.03),
                 (POLE.x + 0.06 + dx, POLE.y + 0.035, DZ - 0.03), (POLE.x + 0.06 + dx, POLE.y + 0.015, UZ - 0.055),
                 (POLE.x + 0.03 + dx, -0.07, UZ - 0.075), (POLE.x + 0.02 + dx, -0.13, TRAYZ - MON['studio'][0].z)]
    cable(f'mon_cables__studio_{"ab"[i]}', 'mon_cables', [Mt @ Vector(p) for p in local_pts], R, rest=(-1,))

b = Build('mon_cables__grommet', 'lib_palette')
ring(b, (GROMMET.x, GROMMET.y, DESK['top'] + EPS + 0.0015), 0.026, 0.040, 0.003, n=24, swatch='black')
ring(b, (GROMMET.x, GROMMET.y, (DESK['under'] + DESK['top'] + 0.002) / 2), 0.026, 0.032, DESK['top'] + 0.002 - DESK['under'], n=24, swatch='black')
neck_c = MONITOR_FACTS['mon_central']['neckY']
cube(b, (-0.016, neck_c[1] + EPS, -0.306), (0.016, neck_c[1] + 0.016, -0.294), 'black', bevel='none', M=Mc)                # neck clip
for pid in ('copilot', 'typeforge'):
    ny = MONITOR_FACTS['mon_side']['neckY']
    cube(b, (-0.016, ny[1] + EPS, -0.336), (0.016, ny[1] + 0.016, -0.324), 'black', bevel='none', M=mat_at(MON[pid][0], MON[pid][3]))
for zt_ in (-0.40, -0.75):
    ring(b, (POLE.x, POLE.y, zt_), 0.0285, 0.031, 0.012, n=16, swatch='black', M=Mt)                                   # pole ties
grommet = finish(b, 'mon_cables', casts=False, bevel=0)

# ------------------------------------------------------------------ under-desk power: strip in the tray, plugs, loom drop, device leads
b = Build('under_desk_power__strip', 'lib_palette')
cube(b, (-1.10, 0.155, TRAY['floor'] + EPS), (-0.70, 0.205, TRAY['floor'] + EPS + 0.04), 'ivory')
for sx in (-1.03, -0.95, -0.87, -0.79):
    cube(b, (sx - 0.016, 0.168, TRAY['floor'] + EPS + 0.04), (sx + 0.016, 0.192, TRAY['floor'] + EPS + 0.041), 'black', bevel='none')
for sx in (-1.03, -0.95, -0.87):
    cube(b, (sx - 0.018, 0.165, TRAY['floor'] + EPS + 0.041), (sx + 0.018, 0.195, TRAY['floor'] + EPS + 0.073), 'black')
cube(b, (-0.735, 0.17, TRAY['floor'] + EPS + 0.04), (-0.715, 0.19, TRAY['floor'] + EPS + 0.046), 'pink', bevel='none')   # switch
ring(b, (-1.58, 0.15, 0.42), 0.0105, 0.013, 0.008, 'Z', n=12, swatch='black')                                         # loom tie on the drop
finish(b, 'under_desk_power', casts=False, bevel=0.002)
LOOMZ = TRAY['floor'] + EPS + 0.008
for i, sx in enumerate((-1.03, -0.95, -0.87)):
    cable(f'under_desk_power__lead_{i + 1}', 'under_desk_power',
          [Vector(p) for p in [(sx, 0.18, TRAY['floor'] + 0.07), (sx - 0.03, 0.18 + 0.004 * i, TRAY['floor'] + 0.085), (-1.13, 0.19 + 0.004 * i, 0.60), (-1.20, 0.15, LOOMZ + 0.004)]], 0.0035, rest=(-1,))
cable('under_desk_power__loom', 'under_desk_power',
      [Vector(p) for p in [(-1.18, 0.14, LOOMZ), (-1.40, 0.13, LOOMZ), (-1.49, 0.13, LOOMZ - 0.002), (-1.58, 0.15, 0.42), (-1.66, 0.22, 0.20),
                           (-1.70, 0.33, 0.035), (-1.77, 0.37, EPS + 0.008), (-1.98, 0.48, EPS + 0.008)]], 0.008, rest=(0, 1, 6, 7))
cable('under_desk_power__pc_lead', 'under_desk_power',
      [Vector(p) for p in [(0.30, yb + 0.0035, 0.09), (0.30, 0.215, 0.065), (0.20, 0.27, EPS + 0.0035), (-0.05, 0.29, EPS + 0.0035),
                           (-0.19, 0.25, 0.25), (-0.22, 0.165, 0.50), (-0.24, 0.15, 0.57), (-0.32, 0.145, TRAY['floor'] + EPS + 0.0035)]], 0.0035, rest=(2, 3, 7))
cable('under_desk_power__sub_lead', 'under_desk_power',
      [Vector(p) for p in [(-1.30, SUB['y1'] + 0.004 + 0.0038, 0.12), (-1.30, 0.26, 0.10), (-1.36, 0.30, 0.30), (-1.47, 0.20, 0.50), (-1.50, 0.16, 0.57),
                           (-1.40, 0.16, TRAY['floor'] + EPS + 0.0035)]], 0.0035, rest=(-1,))

# phone confirmation candidate camera (root candidate only, not a production change)
G['camera']('home-320-f74-y135', -13.5, -7, 74, 320, 844)
scene['fk_stage'], scene['fk_m2_tag'] = 'M2', TAG
bpy.context.view_layer.update()

# ------------------------------------------------------------------ measurements on the editable state (evaluated modifiers and curves)
dg = bpy.context.evaluated_depsgraph_get()
CHROME_1440 = {'topLeft': (24, 307, 24, 82), 'topRight': (1184, 1416, 24, 78), 'bottomLeft': (24, 390, 682, 876), 'bottomRight': (1125, 1416, 730, 876)}


def cast(target, slack=0.02):
    d = target - EYE
    hit, loc, nrm, idx, obj, mtx = scene.ray_cast(dg, EYE, d.normalized(), distance=d.length + slack)
    return obj.name if hit else None


def project(cam_name, co):
    cam = bpy.data.objects[cam_name]
    scene.render.resolution_x, scene.render.resolution_y = cam['res_x'], cam['res_y']
    p = world_to_camera_view(scene, cam, co)
    return (round(p.x * cam['res_x'], 1), round((1 - p.y) * cam['res_y'], 1), p.z > 0 and 0 <= p.x <= 1 and 0 <= p.y <= 1)


def in_chrome(px):
    return [k for k, (xa, xb, ya, yb_) in CHROME_1440.items() if xa <= px[0] <= xb and ya <= px[1] <= yb_]


def grid(f, nu, nv):
    return [f(i / (nu - 1), j / (nv - 1)) for i in range(nu) for j in range(nv)]


meas = {'statement': 'Author measurements from the evaluated editable Blender state (modifiers and curves evaluated). '
                     'Ray tests are exact geometry from the fixed eye; they do not prove UI visibility, which needs product chrome.',
        'eyeBlenderM': list(EYE), 'removedM1Proxies': REMOVED}
# PC top must be hidden from the fixed eye; front and glass side should read
top = grid(lambda u, v: Vector((x0 + 0.004 + u * (x1 - x0 - 0.008), yf + 0.004 + v * (yb - yf - 0.008), zt + 0.0025)), 11, 11)
top_hits = [cast(p) for p in top]
front = grid(lambda u, v: Vector((x0 + 0.005 + u * (x1 - x0 - 0.01), yf - 0.001, zb + 0.005 + v * (zt - zb - 0.01))), 7, 15)
front_vis = [p for p in front if cast(p) == 'pc_tower__case']
side_pts = grid(lambda u, v: Vector((x0 - 0.003, yf + 0.04 + u * (yb - yf - 0.08), zb + 0.03 + v * (zt - zb - 0.06))), 9, 7)
side_vis = [p for p in side_pts if cast(p) == 'pc_tower__glass']
line_slope = (EYE.z - DESK['under']) / (DESK['y0'] - EYE.y)
meas['pcTower'] = {
    'boxBlenderM': {'x': [x0, x1], 'y': [yf, yb], 'z': [0.0, zt], 'bodyBottom': zb}, 'sizeM': [round(x1 - x0, 4), round(zt - zb, 4), round(yb - yf, 4)],
    'frontSetbackFromDeskFrontEdgeM': round(yf - DESK['y0'], 4), 'topToDeskUndersideM': round(DESK['under'] - zt, 4),
    'topIOMaxHeightM': round(zt + 0.0015, 4), 'clearanceToRightLegInnerFaceM': round(0.47 - 0.02 - x1, 4),
    'clearanceBackToBackBeamYM': round(0.2275 - yb, 4),
    'analyticMinimumFrontSetbackForHiddenTopM': round(EYE.y + (EYE.z - (zt + 0.0015)) / line_slope - DESK['y0'], 4),
    'topSamples': len(top), 'topSamplesVisibleFromEye': sum(1 for h in top_hits if h and h.startswith('pc_tower')),
    'topSampleFirstHits': sorted(set(h or 'none' for h in top_hits)),
    'frontSamples': len(front), 'frontSamplesVisible': len(front_vis),
    'frontVisibleHeightRangeM': [round(min(p.z for p in front_vis), 3), round(max(p.z for p in front_vis), 3)] if front_vis else None,
    'glassSideSamples': len(side_pts), 'glassSideSamplesVisible': len(side_vis),
}
for cam in ('home-1440', 'right-down', 'music-1440', 'left-down'):
    pf = [project(cam, p) for p in front_vis]
    ps = [project(cam, p) for p in side_vis]
    entry = {'frontInFrame': sum(1 for p in pf if p[2]), 'glassSideInFrame': sum(1 for p in ps if p[2])}
    if cam == 'home-1440':
        inside = [p for p in pf if p[2]]
        entry.update(frontOutsideChrome=sum(1 for p in inside if not in_chrome(p)),
                     frontPxBounds=[min(p[0] for p in inside), max(p[0] for p in inside), min(p[1] for p in inside), max(p[1] for p in inside)] if inside else None,
                     glassOutsideChrome=sum(1 for p in ps if p[2] and not in_chrome(p)),
                     fanCentresPx=[project(cam, Vector((xc, yf, zc))) for zc in FANS])
    meas['pcTower'][cam] = entry

# three truthful targets: 9 x 9 rays from the eye must reach each face first
meas['targetRays'] = {}
for pid in ('dissertation', 'copilot', 'typeforge'):
    obj = bpy.data.objects['target_' + pid]
    c = [obj.matrix_world @ v.co for v in obj.data.vertices]
    pts = grid(lambda u, v: c[0].lerp(c[1], 0.03 + 0.94 * u).lerp(c[3].lerp(c[2], 0.03 + 0.94 * u), 0.03 + 0.94 * v), 9, 9)
    hits = [cast(p, 0.002) for p in pts]
    meas['targetRays'][pid] = {'clear': sum(1 for h in hits if h == obj.name), 'of': len(pts), 'blockers': sorted(set(h for h in hits if h != obj.name and h))}

# intersections between authored M2 parts and everything else (same-asset pairs excluded)
TREES = {}
for obj in [o for o in scene.objects if o.parent == ROOT and o.type in ('MESH', 'CURVE')]:
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.transform(obj.matrix_world)
    ev.to_mesh_clear()
    TREES[obj.name] = (BVHTree.FromBMesh(bm), [v.co.copy() for v in bm.verts], obj.get('assetId'), [f.calc_center_median().copy() for f in bm.faces])
    bm.free()
m2_names = [n for n, v in TREES.items() if v[2] in M2_ASSETS]
meas['m2BoundsBlenderM'] = {n: [[round(min(v[i] for v in TREES[n][1]), 4) for i in range(3)], [round(max(v[i] for v in TREES[n][1]), 4) for i in range(3)]]
                            for n in sorted(m2_names)}
print('FK M2 bounds', json.dumps(meas['m2BoundsBlenderM']))
overlaps, later_stage = {}, {}
for a in m2_names:
    for bname, (tree, _, asset, _f) in TREES.items():
        if bname == a or asset == TREES[a][2] or (bname in m2_names and bname < a):
            continue
        hits = TREES[a][0].overlap(tree)
        if hits:
            key = f'{a} x {bname}'
            at = [round(c, 3) for c in TREES[a][3][hits[0][0]]]
            (overlaps if asset in M2_ASSETS or bname.startswith(('target_', 'border_', 'display_', 'arch_')) else later_stage)[key] = [len(hits), at]
meas['intersections'] = {'m2VersusM2OrArchitecture': overlaps, 'm2VersusLaterStageProxiesOrContacts': later_stage}


def gap(a, b):
    ta, va = TREES[a][:2]
    tb, vb = TREES[b][:2]
    d = [tb.find_nearest(v)[3] for v in va] + [ta.find_nearest(v)[3] for v in vb]
    return round(min(x for x in d if x is not None), 4)


pairs = [('pc_tower__case', 'desk_top__top'), ('pc_tower__case', 'desk_frame__steel'), ('sub_woofer__cabinet', 'desk_frame__steel'),
         ('mon_central__body', 'mon_top__body'), ('mon_central__body', 'desk_top__top'), ('mon_top__body', 'desk_top__top'),
         ('mon_top__body', 'desk_frame__steel'), ('mon_side__copilot', 'desk_top__top'), ('mon_side__typeforge', 'desk_top__top'),
         ('desk_mat__felt', 'desk_top__top'), ('desk_frame__steel', 'desk_top__top'), ('under_desk_power__strip', 'desk_frame__steel')]
for c in CABLES:
    for other in ('desk_top__top', 'desk_frame__steel', 'mon_central__body', 'mon_side__copilot', 'mon_side__typeforge', 'mon_top__body',
                  'pc_tower__case', 'sub_woofer__cabinet'):
        if TREES[c.name][2] != TREES[other][2]:
            pairs.append((c.name, other))
meas['minimumGapsM'] = {f'{a} | {b}': gap(a, b) for a, b in pairs}
meas['cableMinimumGapsM'] = {c.name: min(v for k, v in meas['minimumGapsM'].items() if k.startswith(c.name + ' |')) for c in CABLES}
meas['monitors'] = {k: {kk: (round(vv, 4) if isinstance(vv, float) else ([round(x, 4) for x in vv] if isinstance(vv, list) else vv)) for kk, vv in v.items()}
                    for k, v in MONITOR_FACTS.items()}
meas['monitorPlanesLocalY'] = {'facePlane': FACE_Y, 'bezelLipFront': FACE_Y, 'border': BORDER_Y, 'recessFloor': FLOOR_Y, 'slabBack': SLAB_BACK,
                               'bezelPerSide': BEZ, 'borderOverhangPerSide': OVERHANG}
meas['fixtureCentresRuntimeWorld'] = {'fix_pendant_lens_centre': [round(-0.8 * 2, 4), round((PEND['z0'] + 0.0015) * 2 + 0.11, 4), round(0.15 * 2, 4)],
                                      'note': 'Pendant kept at the M1 position; ref_pendant light at world (-1.6, 3.85, 0.3) unchanged, so no runtime light move is required.'}
print('FK M2 measurements', json.dumps({k: meas[k] for k in ('pcTower', 'targetRays', 'intersections')}, default=str))
print('FK M2 cable gaps', json.dumps(meas['cableMinimumGapsM']))

# ------------------------------------------------------------------ save the editable source, then bake and export
blend_path = os.path.join(HERE, f'fk-20-workstation-proposal-{TAG}.blend')
meas_path = os.path.join(MANIFESTS, f'studio-full-kit-m2-proposal-{TAG}.author-measurements.json')
if 'blend' in FLAGS:
    bpy.ops.wm.save_as_mainfile(filepath=fresh(blend_path), check_existing=False, copy=True)
    meas['sourceBlend'] = os.path.relpath(blend_path, KIT).replace('\\', '/')
    meas['sourceBlendSha256'] = sha(blend_path)
    print('FK saved', blend_path)
meas['sourceScript'] = 'source/build_fullkit_m2.py'
meas['sourceScriptSha256'] = sha(os.path.abspath(__file__))
meas['baseScript'] = 'source/build_fullkit.py'
meas['baseScriptSha256'] = M1_SHA

if 'glb' in FLAGS:
    dg = bpy.context.evaluated_depsgraph_get()

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
    glb_path = fresh(os.path.join(EXPORTS, f'studio-full-kit-m2-proposal-{TAG}.glb'))
    exported = {ROOT} | {o for o in bpy.data.objects if o.parent == ROOT}
    for obj in bpy.data.objects:
        obj.select_set(obj in exported)
    props = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
    wanted = dict(filepath=glb_path, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
                  export_cameras=False, export_lights=False, export_extras=True, export_animations=False,
                  export_draco_mesh_compression_enable=False, export_image_format='AUTO', export_tangents=False,
                  export_vertex_color='NONE', export_skins=False, export_morph=False)
    bpy.ops.export_scene.gltf(**{k: v for k, v in wanted.items() if k == 'filepath' or k in props})
    raw = open(glb_path, 'rb').read()
    jlen = struct.unpack_from('<I', raw, 12)[0]
    gltf = json.loads(raw[20:20 + jlen])
    tri = {}
    for node in gltf['nodes']:
        if 'mesh' in node:
            prim = gltf['meshes'][node['mesh']]['primitives'][0]
            count = gltf['accessors'][prim['indices']]['count'] if 'indices' in prim else gltf['accessors'][prim['attributes']['POSITION']]['count']
            tri[node['name']] = (node['mesh'], count // 3, gltf['materials'][prim['material']]['name'], node.get('extras', {}).get('nocast'))
    m2_nodes = {k: v for k, v in tri.items() if k.split('__')[0] in M2_ASSETS}
    meas['exportReadback'] = {
        'glb': os.path.relpath(glb_path, KIT).replace('\\', '/'), 'glbBytes': len(raw), 'glbSha256': hashlib.sha256(raw).hexdigest(),
        'nodes': len(gltf['nodes']), 'meshes': len(gltf['meshes']), 'materials': [m['name'] for m in gltf['materials']],
        'm2Leaves': {k: {'mesh': v[0], 'triangles': v[1], 'material': v[2], 'nocast': v[3]} for k, v in sorted(m2_nodes.items())},
        'm2PlacedTriangles': sum(v[1] for v in m2_nodes.values()),
        'm2UniqueTriangles': sum(v[1] for v in {v[0]: v for v in m2_nodes.values()}.values()),
        'm2CastingTriangles': sum(v[1] for v in m2_nodes.values() if v[3] is False),
        'm2LeafCount': len(m2_nodes),
        'allPlacedTriangles': sum(v[1] for v in tri.values()),
        'proxyLeavesRemaining': sorted(k for k in tri if '__proxy' in k),
    }
    print('FK exported', glb_path, len(raw), meas['exportReadback']['m2PlacedTriangles'], meas['exportReadback']['m2LeafCount'])

if FLAGS & {'blend', 'glb'}:
    json.dump(meas, open(fresh(meas_path), 'w', encoding='utf-8'), indent=1, default=str)
    print('FK M2 measurements written', meas_path)
else:
    print('FK M2 dry run: nothing written', json.dumps(meas['minimumGapsM']))
print('FK M2 done', TAG)
