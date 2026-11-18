"""Studio apprentice robot: isolated primitive blockout v02 (authoring script).

Design lane A repair, task_a15de6eea874, 15 November 2026. PROPOSAL GEOMETRY, not a final asset.
v02 answers review/blockout-v01/review.md. v01 stays untouched in ../blockout/.
Changes from v01: no upper lid (idle keeps whole rings); eyes set closer and no sideways eye-rig gaze;
wider visor; tray is carried flat while waiting and only presented (lower, forward, tilted) for a result;
no-match points with fin R (viewer left); all cards appear and clear in one frame; oblique proxy cameras.
The cards in every render are static illustrations placed by this script, not live retrieval output.

What it builds, in a NEW robot-only .blend (never a shared scene):
  * APR_master    one articulated robot at the origin with a keyed 30 fps blocking timeline
  * APR_sheet_*   static posed copies (five states plus two extras) for the state sheet
  * stand-in backdrops, two sun lights, and review cameras (including Studio scale proxies)

Run headless (root-executable, no add-ons, no network, no paid generation):
  blender -b --factory-startup -P build_apprentice_blockout_v02.py -- --out <dir> [--no-render]

Or from a dedicated background Blender session that is still on its untitled startup file:
  APR_OUT_DIR = r"<dir>"; exec(open(r"<this file>").read()); stage_build(); stage_render_all(); stage_save()

Conventions: metres, Z up, the character faces -Y. L/R are the character's own sides:
L = +X = the viewer's right. Hover root (APR_root) is at the centre of the head/body gap.
All dimensions and angles below are tunable proposals from design-spec.md.
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

rad = math.radians

# --------------------------------------------------------------------------- output paths
if "APR_OUT_DIR" not in globals():
    APR_OUT_DIR = None
    if "--" in sys.argv:
        _a = sys.argv[sys.argv.index("--") + 1:]
        if "--out" in _a:
            APR_OUT_DIR = _a[_a.index("--out") + 1]
    if APR_OUT_DIR is None:
        APR_OUT_DIR = os.path.dirname(os.path.abspath(globals().get("__file__", "apprentice")))
APR_OUT_DIR = os.path.abspath(APR_OUT_DIR)
BLEND_PATH = os.path.join(APR_OUT_DIR, "apprentice-blockout-v02.blend")
RENDER_DIR = os.path.join(APR_OUT_DIR, "renders")

# --------------------------------------------------------------------------- dimensions (m)
HEAD_RX, HEAD_RY, HEAD_RZ = 0.105, 0.080, 0.080      # head spheroid: 0.21 W, 0.16 D, 0.16 H. RY == RZ on purpose:
#   the head is a surface of revolution about the ear axis, so lids rotating about X stay on the surface
GAP_HALF = 0.018                                      # head base at +0.018, body top at -0.018
VIS_A, VIS_B, VIS_ZC, VIS_N = 0.84, 0.62, -0.05, 4    # visor superellipse in unit-sphere coords
VIS_S, EYE_S, LID_S = 1.012, 1.018, 1.034              # shell offsets: visor, eye ring, lids
EYE_XU, EYE_ZU = 0.32, 0.0                            # eye centre in unit coords; see readback for spacing
EYE_RO, EYE_RI, EYE_T = 0.023, 0.013, 0.010           # ring outer/inner radius, shell-scale thickness
EYE_ZR = EYE_RO / HEAD_RZ                             # eye radius in unit z
LID_LEVEL_DEG, LID_LEVEL_ZU = 11.5, 0.135             # idle lid angle and the level it settles at (unit z)
LID_SLOPE = 0.12                                      # lid edge rise toward the nose, seen from below
EAR_R, EAR_IN, EAR_OUT = 0.026, 0.004, 0.012
BODY_RX, BODY_RY, BODY_H = 0.075, 0.060, 0.150
BADGE_R = 0.011
FIN_LEN, FIN_W, FIN_T = 0.090, 0.019, 0.0065          # length, half width, half thickness
FIN_X, FIN_Z = 0.102, -0.028                          # hinge in body space
TRAY_RO, TRAY_RI, TRAY_T = 0.118, 0.086, 0.008
TRAY_Z = -0.228                                       # tray centre in root space
CARD_R = 0.106                                        # slot radius on the tray band (outer half)
GLOW_R = 0.092                                        # glow strip radius (inner half, clear of the cards)
CARD_ANGLES = (-56.0, -18.0, 18.0, 56.0)              # rank 1..4, viewer left to right
CARD_SIZE = {1: (0.034, 0.046), 2: (0.030, 0.036), 3: (0.030, 0.036), 4: (0.030, 0.036)}
CARD_T, CARD_LEAN = 0.005, 10.0

PALETTE = {  # sRGB hex, proposals
    "shell": "#EFE7D6", "ink": "#151B26", "accent": "#2F66D0",
    "eye": "#7FE3FF", "card": "#F4E8CC", "backdrop": "#7C7350",
}

# --------------------------------------------------------------------------- poses (degrees, m)
# head = (pitch+ nods down, roll+ tips the crown toward the character's left, yaw- turns to viewer left)
# eyes = (pitch+ looks down, yaw- looks to viewer left); lid_l raises the lower lid (v02 has no upper lid and no sideways eye-rig gaze)
# fin  = (forward, outward splay); tray = (tilt toward viewer, dz, dy); cards = number of real hits shown
REST = (6, 0.0, 0.0)            # tray carried: flat and high. Used for idle, waiting, stopped
PRESENT = (20, -0.014, -0.03)   # tray presented: lower, forward, tilted to the viewer. Results only
NEUTRAL = dict(root_dz=0.0, head=(0, 0, 0), eyes=(0, 0), lid_l=0, body=(0, 0),
               fin_L=(0, 8), fin_R=(0, 8), tray=REST, glow="dim", cards=0)


def _pose(**kw):
    p = dict(NEUTRAL)
    p.update(kw)
    return p


POSES = {
    "neutral": _pose(),
    "idle": _pose(head=(2, 0, -12), eyes=(2, 0), body=(0, -5), fin_L=(0, 6), fin_R=(0, 6)),
    "attention_greet": _pose(root_dz=0.012, head=(-4, -10, 0), lid_l=15, fin_L=(0, 26), fin_R=(0, 26),
                             glow="lit"),
    # attention is also the waiting and resubmit pose: tray carried flat, no cards
    "attention": _pose(root_dz=0.008, head=(-3, -10, 0), fin_L=(0, 22), fin_R=(0, 22), glow="lit"),
    "sources_glance": _pose(root_dz=0.004, head=(14, -3, 0), eyes=(7, 0), fin_L=(0, 24), fin_R=(0, 24),
                            tray=PRESENT, glow="lit", cards=4),
    "sources": _pose(root_dz=0.006, head=(5, -4, 0), fin_L=(0, 28), fin_R=(0, 28),
                     tray=PRESENT, glow="lit", cards=4),
    "sources_1": _pose(root_dz=0.006, head=(5, -4, 0), fin_L=(0, 28), fin_R=(0, 28),
                       tray=PRESENT, glow="lit", cards=1),
    "no_match_glance": _pose(root_dz=0.004, head=(14, -3, 0), eyes=(7, 0), fin_L=(0, 24), fin_R=(0, 24),
                             tray=PRESENT, glow="lit"),
    "no_match_shrug": _pose(head=(0, 8, 0), fin_L=(0, 40), fin_R=(0, 40), tray=PRESENT, glow="lit"),
    # fin R is the character's right = the viewer's left = the side of the proposed desktop panel
    "no_match": _pose(head=(0, 8, 0), fin_L=(0, 20), fin_R=(10, 70), tray=PRESENT, glow="lit"),
    "dismissal": _pose(head=(10, 0, 0), lid_l=15, fin_L=(0, 12), fin_R=(0, 12)),
}

SHEET = ["idle", "attention", "sources", "no_match", "dismissal", "sources_1", "sources_glance"]
SHEET_Y, SHEET_DX = -20.0, 0.46      # sheet row sits behind the master cameras, with its own backdrop

# 30 fps blocking timeline for APR_master: (frame, pose, cards shown, marker or None)
FPS = 30
TIMELINE = [
    (0, "neutral", "neutral_turnaround"),
    (1, "idle", "idle"), (10, "idle", None),
    (20, "attention_greet", "attention_greet"), (29, "attention_greet", None),
    (35, "attention", "attention_waiting"), (50, "attention", "retrieval_event"),
    (56, "sources_glance", "sources_glance"), (58, "sources_glance", None),
    (64, "sources", "sources"), (100, "sources", "close_event"),
    (108, "dismissal", "dismissal"), (114, "dismissal", None),
    (126, "idle", "idle_return"), (140, "idle", None),
    (150, "attention", "attention_b"), (156, "no_match_glance", "empty_glance"),
    (158, "no_match_glance", None), (166, "no_match_shrug", None),
    (172, "no_match_shrug", "no_match_shrug"), (184, "no_match", "no_match"), (230, "no_match", None),
]
CARDS_ON, CARDS_OFF = 51, 101     # all cards exist from the frame after the event to the frame after close
LIT_RANGES = ((20, 100), (150, 230))


# --------------------------------------------------------------------------- helpers
def srgb(hex_):
    h = hex_.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (out[0], out[1], out[2], 1.0)


def material(name, color, rough=0.5, emit=None, strength=0.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = srgb(color)
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = srgb(emit)
        b.inputs["Emission Strength"].default_value = strength
    m.diffuse_color = srgb(color)
    return m


def collection(name):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
    return c


def mesh_obj(name, verts, faces, mat, coll, parent=None, loc=(0, 0, 0), sharp=40.0):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(v) for v in verts], [], faces)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    try:
        me.set_sharp_from_angle(angle=rad(sharp))
    except Exception:
        pass
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    ob.parent = parent
    ob.location = loc
    return ob


def empty(name, coll, parent=None, loc=(0, 0, 0), size=0.03):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_size = size
    coll.objects.link(ob)
    ob.parent = parent
    ob.location = loc
    return ob


def lathe(profile, sx, sy, segs=48):
    verts, rings, faces = [], [], []
    for r, z in profile:
        if r < 1e-9:
            rings.append([len(verts)])
            verts.append((0.0, 0.0, z))
        else:
            ring = []
            for j in range(segs):
                a = 2 * math.pi * j / segs
                ring.append(len(verts))
                verts.append((r * sx * math.cos(a), r * sy * math.sin(a), z))
            rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for j in range(segs):
            k = (j + 1) % segs
            if len(a) == 1 and len(b) > 1:
                faces.append((a[0], b[j], b[k]))
            elif len(b) == 1 and len(a) > 1:
                faces.append((a[j], b[0], a[k]))
            elif len(a) > 1 and len(b) > 1:
                faces.append((a[j], b[j], b[k], a[k]))
    return verts, faces


def annulus_z(ro, ri, z0, z1, segs=64):
    verts, faces = [], []
    for r, z in ((ro, z0), (ro, z1), (ri, z1), (ri, z0)):
        for j in range(segs):
            a = 2 * math.pi * j / segs
            verts.append((r * math.cos(a), r * math.sin(a), z))
    for q in range(4):
        q2 = (q + 1) % 4
        for j in range(segs):
            k = (j + 1) % segs
            faces.append((q * segs + j, q * segs + k, q2 * segs + k, q2 * segs + j))
    return verts, faces


def cylinder(radius, depth, matrix, segs=40):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=radius, radius2=radius,
                          depth=depth, matrix=matrix)
    verts = [tuple(v.co) for v in bm.verts]
    faces = [tuple(v.index for v in f.verts) for f in bm.faces]
    bm.free()
    return verts, faces


def shell_point(xu, zu, s):
    """Point on the head ellipsoid front (-Y), relative to the head centre, offset by scale s."""
    yu = -math.sqrt(max(0.0, 1.0 - xu * xu - zu * zu))
    return (xu * HEAD_RX * s, yu * HEAD_RY * s, zu * HEAD_RZ * s)


def visor_edge(xu):
    """Half height of the visor superellipse at unit x."""
    return VIS_B * max(0.0, 1.0 - (abs(xu) / VIS_A) ** VIS_N) ** (1.0 / VIS_N)


def visor_patch(rings=10, segs=72):
    verts, faces = [shell_point(0.0, VIS_ZC, VIS_S)], []
    for k in range(1, rings + 1):
        for j in range(segs):
            phi = 2 * math.pi * j / segs
            c, s = math.cos(phi), math.sin(phi)
            rho = (abs(c / VIS_A) ** VIS_N + abs(s / VIS_B) ** VIS_N) ** (-1.0 / VIS_N) * k / rings
            verts.append(shell_point(rho * c, VIS_ZC + rho * s, VIS_S))
    for j in range(segs):
        faces.append((0, 1 + j, 1 + (j + 1) % segs))
    for k in range(1, rings):
        a, b = 1 + (k - 1) * segs, 1 + k * segs
        for j in range(segs):
            n = (j + 1) % segs
            faces.append((a + j, b + j, b + n, a + n))
    return verts, faces


def eye_ring(cxu, czu, origin, segs=48):
    """Ring that conforms to the head curve so the lids can pass in front of it."""
    verts, faces = [], []
    for r, s in ((EYE_RO, EYE_S), (EYE_RO, EYE_S + EYE_T), (EYE_RI, EYE_S + EYE_T), (EYE_RI, EYE_S)):
        for j in range(segs):
            a = 2 * math.pi * j / segs
            q = shell_point(cxu + r * math.cos(a) / HEAD_RX, czu + r * math.sin(a) / HEAD_RZ, s)
            verts.append((q[0] - origin[0], q[1] - origin[1], q[2] - origin[2]))
    for q in range(4):
        q2 = (q + 1) % 4
        for j in range(segs):
            k = (j + 1) % segs
            faces.append((q * segs + j, q * segs + k, q2 * segs + k, q2 * segs + j))
    return verts, faces


def lid_patch(upper, cols=28, rows=5, xmax=0.60):
    verts, faces = [], []
    for i in range(cols + 1):
        xu = -xmax + 2 * xmax * i / cols
        edge = 0.90 * visor_edge(xu)
        if upper:
            # lower edge is shaped for the lowered position: a plain constant-height edge reads as a frown
            rho = math.sqrt(max(1e-6, 1.0 - xu * xu))
            zf = LID_LEVEL_ZU + LID_SLOPE * (EYE_XU - max(0.1, abs(xu)))   # inner corners sit higher: soft, not stern
            z0 = rho * math.sin(rad(LID_LEVEL_DEG) + math.asin(min(1.0, zf / rho)))
            z1 = max(z0 + 0.02, VIS_ZC + edge)
        else:
            z0, z1 = VIS_ZC - edge, EYE_ZU - EYE_ZR - 0.02
        for r in range(rows + 1):
            verts.append(shell_point(xu, z0 + (z1 - z0) * r / rows, LID_S))
    for i in range(cols):
        for r in range(rows):
            a = i * (rows + 1) + r
            b = a + rows + 1
            faces.append((a, b, b + 1, a + 1))
    return verts, faces


def body_profile(n=44):
    pts = []
    for i in range(n + 1):
        t = (i / n) ** 1.6                              # denser stations across the shoulder dome
        if i == 0 or i == n:
            r = 0.0
        elif t < 0.18:
            r = math.sqrt(max(0.0, 1.0 - ((0.18 - t) / 0.18) ** 2))
        else:
            r = math.cos((t - 0.18) / 0.82 * math.pi / 2) ** 0.8
        pts.append((r, -BODY_H * t))
    return pts


def fin_mesh():
    prof = [(math.sin(math.pi * i / 16), math.cos(math.pi * i / 16)) for i in range(17)]
    prof[0], prof[-1] = (0.0, 1.0), (0.0, -1.0)
    verts, faces = lathe(prof, 1.0, 1.0, segs=24)
    out = []
    for x, y, z in verts:
        f = 0.45 + 0.75 * ((z + 1.0) / 2.0) ** 0.8     # widest in the upper third, pointed below
        out.append((x * FIN_W * f, y * FIN_T, (z - 1.0) * FIN_LEN / 2.0))
    return out, faces


def card_mesh(w, h, r=0.006, n=4):
    pts = []
    for cx, cz, a0 in ((w / 2 - r, r, -90), (w / 2 - r, h - r, 0), (-w / 2 + r, h - r, 90), (-w / 2 + r, r, 180)):
        for k in range(n + 1):
            a = rad(a0 + 90.0 * k / n)
            pts.append((cx + r * math.cos(a), cz + r * math.sin(a)))
    m = len(pts)
    verts = [(x, -CARD_T / 2, z) for x, z in pts] + [(x, CARD_T / 2, z) for x, z in pts]
    faces = [tuple(range(m)), tuple(range(2 * m - 1, m - 1, -1))]
    for j in range(m):
        k = (j + 1) % m
        faces.append((j, k, m + k, m + j))
    return verts, faces


# --------------------------------------------------------------------------- robot
def build_robot(tag, origin, coll, mats):
    """Build one articulated robot. tag '' names the master parts exactly as in design-spec.md."""
    sfx = ("." + tag) if tag else ""
    P = {}
    P["root"] = empty("APR_root" + sfx, coll, loc=origin, size=0.05)

    # body: lofted shield, origin at its top centre so it hangs from the gap
    v, f = lathe(body_profile(), BODY_RX, BODY_RY, segs=48)
    P["body"] = mesh_obj("APR_body" + sfx, v, f, mats["shell"], coll, P["root"], (0, 0, -GAP_HALF))
    zb = -BODY_H * 0.26
    rb = math.cos((0.26 - 0.18) / 0.82 * math.pi / 2) ** 0.8
    v, f = cylinder(BADGE_R, 0.004, Matrix.Rotation(rad(90), 4, "X"))
    P["badge"] = mesh_obj("APR_badge" + sfx, v, f, mats["accent"], coll, P["body"],
                          (0, -BODY_RY * rb, zb))
    P["badge"].rotation_euler = (rad(-5), 0, 0)
    for side, sx in (("L", 1.0), ("R", -1.0)):
        v, f = fin_mesh()
        P["fin_" + side] = mesh_obj("APR_fin_%s%s" % (side, sfx), v, f, mats["shell"], coll, P["body"],
                                    (sx * FIN_X, 0, FIN_Z))

    # head: ellipsoid, origin at its base pole so a roll reads as a cocked head
    prof = [(math.sin(math.pi * i / 24), HEAD_RZ + HEAD_RZ * math.cos(math.pi * i / 24)) for i in range(25)]
    prof[0], prof[-1] = (0.0, 2 * HEAD_RZ), (0.0, 0.0)
    v, f = lathe(prof, HEAD_RX, HEAD_RY, segs=64)
    P["head"] = mesh_obj("APR_head" + sfx, v, f, mats["shell"], coll, P["root"], (0, 0, GAP_HALF))
    centre = (0, 0, HEAD_RZ)
    v, f = visor_patch()
    P["visor"] = mesh_obj("APR_visor" + sfx, v, f, mats["ink"], coll, P["head"], centre)
    for side, sx in (("L", 1.0), ("R", -1.0)):
        mid = sx * (HEAD_RX + (EAR_OUT - EAR_IN) / 2)
        v, f = cylinder(EAR_R, EAR_IN + EAR_OUT, Matrix.Translation((mid, 0, -0.005)) @ Matrix.Rotation(rad(90), 4, "Y"))
        P["ear_" + side] = mesh_obj("APR_ear_%s%s" % (side, sfx), v, f, mats["accent"], coll, P["head"], centre)

    # eye rig: empty at the head centre; rotating it slides rings and lids together over the visor
    P["eyes"] = empty("APR_eyes" + sfx, coll, P["head"], centre)
    for side, sx in (("L", 1.0), ("R", -1.0)):
        p = Vector(shell_point(sx * EYE_XU, EYE_ZU, EYE_S))     # origin at the ring centre on the visor
        v, f = eye_ring(sx * EYE_XU, EYE_ZU, p)
        P["eye_" + side] = mesh_obj("APR_eye_%s%s" % (side, sfx), v, f, mats["eye"], coll, P["eyes"], p)
    v, f = lid_patch(False)
    P["lid_l"] = mesh_obj("APR_lid_lower" + sfx, v, f, mats["ink"], coll, P["eyes"])

    # tray: the reference ring as a flat band, origin at its centre
    v, f = annulus_z(TRAY_RO, TRAY_RI, -TRAY_T / 2, TRAY_T / 2, segs=72)
    P["tray"] = mesh_obj("APR_tray" + sfx, v, f, mats["ink"], coll, P["root"], (0, 0, TRAY_Z))
    v, f = annulus_z(GLOW_R + 0.004, GLOW_R - 0.004, TRAY_T / 2, TRAY_T / 2 + 0.0008, segs=72)
    P["glow"] = mesh_obj("APR_tray_glow" + sfx, v, f, mats["glow_dim"], coll, P["tray"])
    # source cards: blockout stand-ins for runtime-generated marks, one slot per rank
    for rank, ang in zip((1, 2, 3, 4), CARD_ANGLES):
        w, h = CARD_SIZE[rank]
        v, f = card_mesh(w, h)
        P["card_%d" % rank] = mesh_obj("APR_card_%d%s" % (rank, sfx), v, f, mats["card"], coll, P["tray"],
                                       (CARD_R * math.sin(rad(ang)), -CARD_R * math.cos(rad(ang)), TRAY_T / 2),
                                       sharp=60.0)
    P["_origin"] = Vector(origin)
    return P


def apply_pose(P, name, mats, cards=None):
    p = POSES[name]
    o = P["_origin"]
    P["root"].location = (o.x, o.y, o.z + p["root_dz"])
    hp, hr, hy = p["head"]
    P["head"].rotation_euler = (rad(hp), rad(hr), rad(hy))
    P["eyes"].rotation_euler = (rad(p["eyes"][0]), 0, rad(p["eyes"][1]))
    P["lid_l"].rotation_euler = (rad(-p["lid_l"]), 0, 0)
    P["body"].rotation_euler = (rad(p["body"][0]), 0, rad(p["body"][1]))
    P["fin_L"].rotation_euler = (rad(-p["fin_L"][0]), rad(-p["fin_L"][1]), 0)
    P["fin_R"].rotation_euler = (rad(-p["fin_R"][0]), rad(p["fin_R"][1]), 0)
    tilt, dz, dy = p["tray"]
    P["tray"].location = (0, dy, TRAY_Z + dz)
    P["tray"].rotation_euler = (rad(tilt), 0, 0)
    P["glow"].data.materials[0] = mats["glow_lit" if p["glow"] == "lit" else "glow_dim"]
    shown = p["cards"] if cards is None else cards
    for rank in (1, 2, 3, 4):
        c = P["card_%d" % rank]
        c.rotation_euler = (rad(-(tilt + CARD_LEAN)), 0, 0)
        s = 1.0 if rank <= shown else 0.0
        c.scale = (s, s, s)


KEYED = {"root": ("location",), "head": ("rotation_euler",), "eyes": ("rotation_euler",),
         "lid_l": ("rotation_euler",), "body": ("rotation_euler",),
         "fin_L": ("rotation_euler",), "fin_R": ("rotation_euler",), "tray": ("location", "rotation_euler")}


def key_timeline(P, mats):
    sc = bpy.context.scene
    for frame, pose, marker in TIMELINE:
        apply_pose(P, pose, mats, cards=0)
        for part, paths in KEYED.items():
            for path in paths:
                P[part].keyframe_insert(path, frame=frame)
        for rank in (1, 2, 3, 4):
            P["card_%d" % rank].keyframe_insert("rotation_euler", frame=frame)
        if marker:
            sc.timeline_markers.new(marker, frame=frame)
    # cards: no stagger and no exit tween. Absent up to the event frame, all present on the next frame.
    for rank in (1, 2, 3, 4):
        c = P["card_%d" % rank]
        for frame, s_ in ((0, 0.0), (CARDS_ON - 1, 0.0), (CARDS_ON, 1.0), (CARDS_OFF - 1, 1.0), (CARDS_OFF, 0.0),
                          (230, 0.0)):
            c.scale = (s_, s_, s_)
            c.keyframe_insert("scale", frame=frame)
    # glow material is assigned, not keyed: render() sets it from LIT_RANGES


# --------------------------------------------------------------------------- scene
def aim(ob, target):
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()


def camera(name, coll, loc, target, fov_y=None, ortho=None):
    cd = bpy.data.cameras.new(name)
    cd.sensor_fit = "VERTICAL"
    cd.clip_start, cd.clip_end = 0.05, 50.0
    if ortho:
        cd.type = "ORTHO"
        cd.ortho_scale = ortho
    else:
        cd.angle_y = rad(fov_y)
    ob = bpy.data.objects.new(name, cd)
    coll.objects.link(ob)
    ob.location = loc
    aim(ob, target)
    return ob


def prepare_file():
    """Start a robot-only file. Refuses to touch any other saved project."""
    fp = bpy.data.filepath
    if fp and os.path.normcase(os.path.abspath(fp)) != os.path.normcase(BLEND_PATH):
        raise RuntimeError("Refusing to build: another project is open: %s" % fp)
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for coll_ in list(bpy.data.collections):
        bpy.data.collections.remove(coll_)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights, bpy.data.actions):
        for item in list(block):
            if item.users == 0:
                block.remove(item)
    sc = bpy.context.scene
    sc.name = "APR_blockout"
    for m in list(sc.timeline_markers):
        sc.timeline_markers.remove(m)
    return sc


def stage_build():
    sc = prepare_file()
    sc.unit_settings.system = "METRIC"
    sc.unit_settings.scale_length = 1.0
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 0, 230
    sc.render.engine = "BLENDER_EEVEE"
    try:
        sc.eevee.taa_render_samples = 32
    except Exception:
        pass
    sc.view_settings.view_transform = "Standard"
    sc.render.image_settings.file_format = "PNG"
    sc.render.film_transparent = False

    mats = {
        "shell": material("MAT_APR_shell", PALETTE["shell"], 0.5),
        "ink": material("MAT_APR_ink", PALETTE["ink"], 0.3),
        "accent": material("MAT_APR_accent", PALETTE["accent"], 0.45),
        "eye": material("MAT_APR_eye_emit", "#0E2A33", 0.4, PALETTE["eye"], 3.0),
        "glow_dim": material("MAT_APR_tray_glow_dim", "#0E2A33", 0.4, PALETTE["eye"], 0.5),
        "glow_lit": material("MAT_APR_tray_glow_lit", "#0E2A33", 0.4, PALETTE["eye"], 2.5),
        "card": material("MAT_APR_card", PALETTE["card"], 0.6, "#FFE9B8", 0.1),
        "backdrop": material("MAT_ENV_backdrop_standin", PALETTE["backdrop"], 0.9),
    }

    world = bpy.data.worlds.get("APR_world") or bpy.data.worlds.new("APR_world")
    try:
        world.use_nodes = True
    except Exception:
        pass
    bg = next(n for n in world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = srgb("#B8AE9A")
    bg.inputs["Strength"].default_value = 0.45
    sc.world = world

    env = collection("APR_env_standin")
    for name, y in (("ENV_backdrop_master", 2.0), ("ENV_backdrop_sheet", SHEET_Y + 2.0)):
        v = [(-6, y, -3), (6, y, -3), (6, y, 3), (-6, y, 3)]
        mesh_obj(name, v, [(0, 1, 2, 3)], mats["backdrop"], env)
    for name, energy, color, rot in (("LGT_key", 2.6, (1.0, 0.93, 0.82), (rad(58), 0, rad(-32))),
                                     ("LGT_fill", 0.6, (0.86, 0.90, 1.0), (rad(75), 0, rad(48)))):
        ld = bpy.data.lights.new(name, "SUN")
        ld.energy, ld.color, ld.angle = energy, color, rad(12)
        ld.use_shadow = name == "LGT_key"
        lo = bpy.data.objects.new(name, ld)
        env.objects.link(lo)
        lo.rotation_euler = rot

    master = build_robot("", (0, 0, 0), collection("APR_master"), mats)
    key_timeline(master, mats)

    copies = {}
    for i, pose in enumerate(SHEET):
        P = build_robot(pose, ((i - 2) * SHEET_DX, SHEET_Y, 0), collection("APR_sheet_" + pose), mats)
        apply_pose(P, pose, mats)
        copies[pose] = P

    cams = collection("APR_cameras")
    c = Vector((0, 0, -0.025))
    camera("CAM_turn_front", cams, (0, -4, -0.025), c, ortho=0.56)
    camera("CAM_turn_side", cams, (4, 0, -0.025), c, ortho=0.56)
    camera("CAM_turn_34", cams, (0.62, -1.25, 0.24), c, fov_y=22.0)
    # Studio scale proxies: eye 2.44 m away and 0.125 m below the hover root, production FOVs.
    camera("CAM_proxy_desktop_58", cams, (0, -2.441, -0.125), c, fov_y=58.0)
    camera("CAM_proxy_phone_64", cams, (0, -2.441, -0.125), c, fov_y=64.0)
    # Unturned-root case: the fixed eye sees the robot from about 35 degrees toward the character's right.
    ox, oy = -2.441 * math.sin(rad(35)), -2.441 * math.cos(rad(35))
    camera("CAM_oblique35_phone_64", cams, (ox, oy, -0.125), c, fov_y=64.0)
    camera("CAM_oblique35_close", cams, (ox * 0.66, oy * 0.66, -0.125), c, fov_y=20.0)
    camera("CAM_sheet", cams, (0, SHEET_Y - 7.0, -0.10), (0, SHEET_Y, -0.03), fov_y=6.2)
    camera("CAM_pose", cams, (0.2, SHEET_Y - 1.6, -0.10), (0, SHEET_Y, -0.03), fov_y=20.0)
    sc.camera = bpy.data.objects["CAM_turn_34"]
    sc.frame_set(0)
    return {"objects": len(bpy.data.objects), "master_parts": sorted(k for k in master if not k.startswith("_"))}


def _mats():
    g = bpy.data.materials
    return {"glow_dim": g["MAT_APR_tray_glow_dim"], "glow_lit": g["MAT_APR_tray_glow_lit"]}


def render(cam_name, filename, res, frame=None, border=None):
    """Render one still. border = (xmin, xmax, ymin, ymax) fractions gives a native-resolution crop."""
    sc = bpy.context.scene
    r = sc.render
    saved = (sc.camera, r.resolution_x, r.resolution_y, r.resolution_percentage, r.filepath,
             r.use_border, r.use_crop_to_border, sc.frame_current)
    path = os.path.join(RENDER_DIR, filename)
    try:
        os.makedirs(RENDER_DIR, exist_ok=True)
        sc.camera = bpy.data.objects[cam_name]
        r.resolution_x, r.resolution_y, r.resolution_percentage = res[0], res[1], 100
        if frame is not None:
            sc.frame_set(frame)
            glow = bpy.data.objects["APR_tray_glow"].data.materials
            lit = any(a_ <= frame <= b_ for a_, b_ in LIT_RANGES)
            glow[0] = _mats()["glow_lit" if lit else "glow_dim"]
        if border:
            r.use_border, r.use_crop_to_border = True, True
            r.border_min_x, r.border_max_x, r.border_min_y, r.border_max_y = border
        r.filepath = path
        bpy.ops.render.render(write_still=True)
    finally:
        (sc.camera, r.resolution_x, r.resolution_y, r.resolution_percentage, r.filepath,
         r.use_border, r.use_crop_to_border) = saved[:7]
        sc.frame_set(saved[7])
    return path


def render_pose_stills():
    out = []
    cam = bpy.data.objects["CAM_pose"]
    for i, pose in enumerate(SHEET):
        x = (i - 2) * SHEET_DX
        cam.location = (x + 0.2, SHEET_Y - 1.6, -0.10)
        aim(cam, (x, SHEET_Y, -0.03))
        out.append(render("CAM_pose", "pose-%s.png" % pose.replace("_", "-"), (800, 1000)))
    return out


def crop(res, size):
    hx, hy = size / 2.0 / res[0], size / 2.0 / res[1]
    return (0.5 - hx, 0.5 + hx, 0.5 - hy, 0.5 + hy)


STATE_FRAMES = (("idle", 5), ("attention", 45), ("sources", 90), ("dismissal", 111), ("no-match", 200))


def render_scale_proxies():
    out = []
    for label, frame in STATE_FRAMES:
        out.append(render("CAM_proxy_desktop_58", "proxy-desktop-1440x900-fov58-%s-crop240.png" % label,
                          (1440, 900), frame, crop((1440, 900), 240)))
        out.append(render("CAM_proxy_phone_64", "proxy-phone-390x844-fov64-%s-crop240.png" % label,
                          (390, 844), frame, crop((390, 844), 240)))
        out.append(render("CAM_oblique35_phone_64", "oblique35-phone-390x844-fov64-%s-crop240.png" % label,
                          (390, 844), frame, crop((390, 844), 240)))
    return out


def render_fins_hidden():
    """Diagnostic for review finding 5: waiting and no-match with both fins hidden, phone scale."""
    fins = [bpy.data.objects["APR_fin_L"], bpy.data.objects["APR_fin_R"]]
    out = []
    try:
        for f_ in fins:
            f_.hide_render = True
        for label, frame in (("attention", 45), ("no-match", 200)):
            out.append(render("CAM_proxy_phone_64", "diag-fins-hidden-phone-%s-crop240.png" % label,
                              (390, 844), frame, crop((390, 844), 240)))
    finally:
        for f_ in fins:
            f_.hide_render = False
    return out


def stage_render_all():
    out = [render("CAM_turn_front", "turnaround-front.png", (900, 900), 0),
           render("CAM_turn_side", "turnaround-side.png", (900, 900), 0),
           render("CAM_turn_34", "turnaround-three-quarter.png", (900, 900), 0),
           render("CAM_sheet", "state-sheet-five-poses.png", (2400, 760))]
    out += render_pose_stills()
    out += render_scale_proxies()
    out += render_fins_hidden()
    for label, frame in STATE_FRAMES:
        out.append(render("CAM_turn_front", "front-%s.png" % label, (700, 700), frame))
        out.append(render("CAM_turn_34", "three-quarter-%s.png" % label, (700, 700), frame))
        out.append(render("CAM_oblique35_close", "oblique35-close-%s.png" % label, (700, 800), frame))
    out += [render("CAM_turn_34", "timeline-f%03d.png" % f_, (500, 500), f_) for f_ in (15, 25, 51, 57, 101, 176)]
    return out


def stage_save():
    os.makedirs(APR_OUT_DIR, exist_ok=True)
    bpy.context.scene.frame_set(0)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
    return BLEND_PATH


if __name__ == "__main__" and "--" in sys.argv:
    print(stage_build())
    if "--no-render" not in sys.argv:
        for p_ in stage_render_all():
            print("rendered", p_)
    print("saved", stage_save())
