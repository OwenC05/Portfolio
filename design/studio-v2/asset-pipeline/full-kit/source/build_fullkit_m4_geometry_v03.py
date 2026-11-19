"""Studio v2 full kit, stage M4 music equipment, v03 CPU preparation: pure geometry helper (no bpy).

Owner: actual-Claude author, task_23314c669e03. Root release: scene-coordination/m4-v03-preparation-task.md and
m4-correction-plan-root-disposition.md. New v03 namespace: started as a byte copy of the frozen v01 helper
build_fullkit_m4_geometry.py (c7ce9d8e...), which stays unchanged. Imported by build_fullkit_m4_v03.py inside
Blender (held) and by plain CPython (measure_fullkit_m4_v03.py). It writes nothing and imports only math and numpy.

v03 changes against v01, all in this file (see scene-m4-v03-preparation-report.md for the measured results):
  C1  controller envelope height 0.095: rear panel 0.080/0.092 -> 0.071/0.083, cheek rear profile point 0.099 -> 0.095
  C2  stand own height 0.68 (zb 0.573 -> 0.6889), controller placement and stool contact: see CTL / STOOL below
  C3  rack frame own height 0.75 (top 0.80 -> 0.7586); module stub and ride boom clamps 0.57
  C4  rack frame outer width 1.16 (uprights 0.82/1.98 -> 0.841/1.959); clamp wing bolts re-pointed; tom3 x 1.785
  C5  snare radius 0.16 -> 0.147
  C6/C7 crash and ride radius 0.20 -> 0.19; the ride stays at x 1.98 (root S3: rack target is frame + clamps, booms separate)
  C8/C9 hi-hat pedal w 0.11 -> 0.114, l 0.30 -> 0.33 (base footprint 0.130 x 0.330)
  C10 module case face height 0.13 -> 0.15
  C11 rug 1.655 x 2.25 at x 0.56..2.215, y -1.36..0.89 (root conditional allowance); rack back foot 0.78 -> 0.715 so its
      rubber end sits 155 mm inside the rug's back edge (root: >= 150 mm beyond the outermost rack foot on each side)
  C12 the eight music_cables runs 6.4 -> 6.0 mm (CABLE_R); the sustain lead is unchanged (7.0 mm, sustain row)
  C13 exposed casing edges carry explicit authored 2-segment bevels from the one table BEVEL_CLASSES (class 'casing',
      3.125 mm = 2.5 mm tier F x 1.25, art-direction section 5). Each bevel replaces one 90-degree edge by two faces whose
      normals step 30/30/30 degrees. Remaining hard edges carry a declared reason per label (SHARP_REASONS): root's named
      sharp details, contact/hidden casing edges, screen faces, or 'unnamed' items reported for a root decision.
  H1  each of the 29 white keys has a 2-segment front-top lip of 3.125 mm (class 'white_key_lip'); count, pitch, gaps
      and body fit unchanged; keys row 1168 of 1540 triangles.
  N1  every face of a casing primitive carries an authored surface class ('planar' / 'round' / 'bevel:<class>', in
      Part.cls, set by the primitive that makes it, never derived from normals). corner_normals() gives the custom split
      normals: in classified fans the highest-priority class wins (planar > round > bevel), so planar panels keep their
      geometric normal and the turn happens across the bevel faces. Unclassified faces keep the v01 default.
  K1  every floor-supported row stands on one surface: STOOL legs on the controller axes (leg phase 0), centred on the
      keys (local x 0.0), all four feet on the rug field >= 20 mm inside the binding; stool() refuses mixed support.
  C2  CTL placement (1.325, -0.825, yaw -0.85) and STOOL are the selection of the bounded search in
      measure_fullkit_m4_v03.py (rule recorded in its receipt).

Every M4 leaf is authored here as explicit vertices and convex polygon faces in Blender metres, Z up (the M3 rule: no
modifiers or curves, so each triangle count is exact: a face of n corners exports as n - 2 triangles). Each face
carries its UV rule: a lib_palette swatch name, or 'oak' / 'weave' / 'glow' for the planar library mappings that M2
defines (oak_uv, weave_uv, glow centre). The Blender builder resolves those rules with the chain's own functions.
Each Part.add call also records a measurement label (Part.groups) so the CPU measurement script can measure named
sub-parts (shell vs knobs, frame vs booms, base vs cable) without relying on source line numbers.

Rows, materials and flags are the frozen mapping scene-coordination/m4-model-contract.json (18 rows, root-adopted
ledger). Placement keeps the accepted right-side M1 proposal (controller tier F centred at the proxy, yaw -0.35 rad;
drum kit around the proxy rack at x 0.82..1.98, y 0.56), with small documented moves where a real part needs room.
"""
import math
import numpy as np

EPS = 0.0003                       # resting gap, as M2/M3
RUG = dict(x0=0.56, x1=2.215, y0=-1.36, y1=0.89, t=0.008, bind=0.0105, bw=0.026, r=0.04)
RT = EPS + RUG['t']                # rug inner top
ON_RUG = RT + EPS                  # resting height of everything standing on the rug
ON_FLOOR = EPS

# row: (assetId, material, placed-triangle ceiling, casts) -- copied from the frozen mapping, binding per row
ROWS = {
    'ctl_body__shell': ('ctl_body', 'lib_palette', 2500, True),
    'ctl_body__indicators': ('ctl_body', 'lib_glow', 60, False),
    'ctl_keys__keys': ('ctl_keys', 'lib_palette', 1540, False),
    'ctl_stand__frame': ('ctl_stand', 'lib_palette', 1300, True),
    'ctl_sustain_pedal__pedal': ('ctl_sustain_pedal', 'lib_palette', 500, False),
    'stool_keys__stool': ('stool_keys', 'lib_palette', 700, True),
    'drum_rack__rack': ('drum_rack', 'lib_palette', 2400, True),
    'drum_pads__shells': ('drum_pads', 'lib_palette', 2600, True),
    'drum_pads__heads': ('drum_pads', 'lib_weave', 900, False),
    'drum_cymbals__cymbals': ('drum_cymbals', 'lib_palette', 1950, True),
    'drum_hihat_pedal__pedal': ('drum_hihat_pedal', 'lib_palette', 600, False),
    'drum_kick__tower': ('drum_kick', 'lib_palette', 1500, True),
    'drum_module__body': ('drum_module', 'lib_palette', 640, True),
    'drum_module__display': ('drum_module', 'lib_glow', 60, False),
    'drum_sticks__pair': ('drum_sticks', 'lib_oak', 120, False),
    'drum_throne__throne': ('drum_throne', 'lib_palette', 700, True),
    'rug__rug': ('rug', 'lib_weave', 400, False),
    'music_cables__runs': ('music_cables', 'lib_palette', 800, False),
}
STAGE_LIMITS = dict(main=20, refresh=30, placed=22500)


# ------------------------------------------------------------------ matrices
def T(x, y, z):
    M = np.eye(4); M[:3, 3] = (x, y, z); return M


def Rz(a):
    c, s = math.cos(a), math.sin(a); M = np.eye(4); M[:2, :2] = [[c, -s], [s, c]]; return M


def Rx(a):
    c, s = math.cos(a), math.sin(a); M = np.eye(4); M[1:3, 1:3] = [[c, -s], [s, c]]; return M


def Ry(a):
    c, s = math.cos(a), math.sin(a); M = np.eye(4); M[0, 0], M[0, 2], M[2, 0], M[2, 2] = c, s, -s, c; return M


def unit(v):
    v = np.asarray(v, float); return v / np.linalg.norm(v)


def frame(origin, axis, hint=(1.0, 0.0, 0.0)):
    """Matrix whose local Z is `axis` at `origin`; local X is `hint` made orthogonal."""
    z = unit(axis)
    h = np.asarray(hint, float)
    if abs(np.dot(unit(h), z)) > 0.95:
        h = np.array([0.0, 1.0, 0.0]) if abs(z[1]) < 0.9 else np.array([1.0, 0.0, 0.0])
    x = unit(h - z * np.dot(h, z)); y = np.cross(z, x)
    M = np.eye(4); M[:3, 0], M[:3, 1], M[:3, 2], M[:3, 3] = x, y, z, origin
    return M


def tilt_toward(origin, target_xy, degrees):
    """Local Z tilted `degrees` from vertical toward a floor point (pads and cymbals face the player)."""
    d = np.array([target_xy[0] - origin[0], target_xy[1] - origin[1], 0.0])
    d = unit(d) if np.linalg.norm(d) > 1e-9 else np.array([0.0, -1.0, 0.0])
    a = math.radians(degrees)
    return frame(origin, np.array([0, 0, math.cos(a)]) + d * math.sin(a), hint=np.cross(np.array([0, 0, 1.0]), d))


def apply(M, p):
    return tuple(float(c) for c in (M @ np.array([p[0], p[1], p[2], 1.0]))[:3])


# ------------------------------------------------------------------ mesh accumulation
_LABEL = ['']                      # current measurement label (see label())


class label:
    """Context manager naming the sub-part being authored; recorded per Part.add call, never exported."""
    def __init__(self, name):
        self.name = name

    def __enter__(self):
        self.prev = _LABEL[0]
        _LABEL[0] = self.name

    def __exit__(self, *exc):
        _LABEL[0] = self.prev


class Part:
    def __init__(self, row):
        self.row = row
        self.asset, self.mat, self.ceiling, self.casts = ROWS[row]
        self.v, self.f = [], []           # f: (tuple of vertex indices, uv rule)
        self.groups = []                  # (label, v0, v1, f0, f1): one closed primitive per entry
        self.cls = []                     # per face: None (unclassified) or 'planar' / 'round' / 'bevel:<class>' (N1 surface classes)

    def add(self, verts, faces, uv, cls=None):
        base, f0 = len(self.v), len(self.f)
        self.v.extend(verts)
        for k, face in enumerate(faces):
            rule = uv[k] if isinstance(uv, (list, tuple)) else uv
            self.f.append((tuple(base + i for i in face), rule))
            self.cls.append(cls[k] if isinstance(cls, (list, tuple)) else cls)
        self.groups.append((_LABEL[0], base, len(self.v), f0, len(self.f)))

    @property
    def tris(self):
        return sum(len(face) - 2 for face, _ in self.f)

    def triangles(self):
        V = np.asarray(self.v, float)
        out = []
        for face, _ in self.f:
            for i in range(1, len(face) - 1):
                out.append((V[face[0]], V[face[i]], V[face[i + 1]]))
        return np.asarray(out)


# ------------------------------------------------------------------ primitives (convex faces only)
def hexa(p, c, uv, M=None):
    """Eight corners in box order: (x0y0z0, x1y0z0, x1y1z0, x0y1z0, x0y0z1, x1y0z1, x1y1z1, x0y1z1)."""
    M = np.eye(4) if M is None else M
    faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    keys = ['-z', '+z', '-y', '+x', '+y', '-x']
    rules = [uv.get(k, uv.get('*')) for k in keys] if isinstance(uv, dict) else uv
    p.add([apply(M, q) for q in c], faces, rules)


def box(p, lo, hi, uv, M=None):
    (x0, y0, z0), (x1, y1, z1) = lo, hi
    hexa(p, [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0), (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)], uv, M)


def extrude(p, pts, z0, z1, uv, M=None, cap_uv=None):
    """Convex polygon (CCW in local XY) extruded along local Z; caps are n-gons."""
    M = np.eye(4) if M is None else M
    n = len(pts)
    verts = [apply(M, (x, y, z)) for z in (z0, z1) for x, y in pts]
    faces = [tuple(reversed(range(n))), tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    cu = cap_uv or uv
    p.add(verts, faces, [cu, cu] + [uv] * n)


# A1: the one bevel table. Call sites name a class; no literal radii elsewhere. Every class is 2 segments (30/30/30 degree
# steps at a right angle), the only segment count the bevel primitives implement.
BEVEL_CLASSES = {
    'casing': dict(radius=0.003125, segments=2, source='art-direction.md section 5: equipment casings 2.5 mm / 2 segments, x tier F 1.25'),
    'white_key_lip': dict(radius=0.003125, segments=2, source='m4-v03-design-correction-disposition.md H1: front-top edge of each white key, about 3 mm or greater'),
}
K_BEV = 1.0 - math.sqrt(3.0) / 2.0 / (math.sqrt(3.0) / 2.0 + 0.5)   # 0.366: mid-point inset of a 30/60-degree 2-segment bevel


def bev(name):
    c = BEVEL_CLASSES[name]
    assert c['segments'] == 2, 'the bevel primitives author 2 segments only'
    return c['radius']


class BevelPoly(list):
    """Polygon points plus the indices of the edges that are bevel facets (and of edges that are round, for rrect)."""
    def __init__(self, pts, facets=(), kind=None, round_edges=()):
        super().__init__(pts)
        self.facets, self.kind, self.round_edges = frozenset(facets), kind, frozenset(round_edges)


def bevel_corners(pts, kind, which=None):
    """Replace convex polygon corners (all, or the indices in `which`) by a 2-segment bevel of leg b.

    Corner V with incoming direction e_in and outgoing e_out (turn angle phi) becomes A = V - b e_in, B, C = V + b e_out,
    where both segments turn phi/3 from their neighbours (30/30/30 degrees at a right angle), so the builder's 40-degree
    sharp split leaves the corner smooth-shaded."""
    b = bev(kind)
    n, out, facets = len(pts), [], set()
    for i, v in enumerate(pts):
        if which is not None and i not in which:
            out.append(tuple(v))
            continue
        V = np.asarray(v, float)
        e_in, e_out = unit(V - np.asarray(pts[i - 1], float)), unit(np.asarray(pts[(i + 1) % n], float) - V)
        phi = math.atan2(e_in[0] * e_out[1] - e_in[1] * e_out[0], float(np.dot(e_in, e_out)))
        assert phi > 0, 'bevel_corners expects a convex CCW polygon'
        L = b * math.cos(phi / 2) / math.cos(phi / 6)
        c, s = math.cos(phi / 3), math.sin(phi / 3)
        A = V - e_in * b
        B = A + L * np.array([c * e_in[0] - s * e_in[1], s * e_in[0] + c * e_in[1]])
        facets.update({len(out), len(out) + 1})            # edges A->B and B->C are bevel facets
        out += [tuple(A), tuple(B), tuple(V + e_out * b)]
    return BevelPoly(out, facets, kind)


def inset_poly(pts, d):
    """Convex CCW polygon with every edge moved inward by d (mitred corners keep edges parallel, so quads stay planar)."""
    n, out = len(pts), []
    P = [np.asarray(q, float) for q in pts]
    for i in range(n):
        e0, e1 = unit(P[i] - P[i - 1]), unit(P[(i + 1) % n] - P[i])
        n0, n1 = np.array([-e0[1], e0[0]]), np.array([-e1[1], e1[0]])          # inward normals of a CCW polygon
        out.append(tuple(P[i] + d * (n0 + n1) / (1.0 + float(np.dot(n0, n1)))))
    return out


def prism(p, pts, z0, z1, uv, M=None, cap_uv=None, top=None, bottom=None, round_edges=()):
    """Convex CCW polygon extruded along local Z, optionally with a 2-segment bevel (a BEVEL_CLASSES name) round the
    z1 (`top`) / z0 (`bottom`) cap perimeter. uv: one rule, or one rule per polygon edge (edge i runs pts[i] -> pts[i+1]).
    Every face gets its N1 surface class: caps and straight sides 'planar', bevel bands and bevel-corner facets
    'bevel:<class>', rounded-plan facets (rrect arcs) and the edges in `round_edges` 'round'."""
    M = np.eye(4) if M is None else M
    n = len(pts)
    kinds = {bottom, top, getattr(pts, 'kind', None)} - {None}
    assert len(kinds) <= 1, 'one bevel class per prism'
    kind = kinds.pop() if kinds else None
    top, bottom = (bev(top) if top else 0.0), (bev(bottom) if bottom else 0.0)
    rings = []                                                     # (z, inset)
    rings += [(z0, bottom), (z0 + K_BEV * bottom, K_BEV * bottom), (z0 + bottom, 0.0)] if bottom else [(z0, 0.0)]
    rings += [(z1 - top, 0.0), (z1 - K_BEV * top, K_BEV * top), (z1, top)] if top else [(z1, 0.0)]
    verts = []
    for z, d in rings:
        verts += [apply(M, (x, y, z)) for x, y in (inset_poly(pts, d) if d else pts)]
    edge_rule = (lambda i: uv[i]) if isinstance(uv, (list, tuple)) else (lambda i: uv)
    cu = cap_uv or (uv if isinstance(uv, str) else uv[0])
    faces, rules = [tuple(reversed(range(n))), tuple(range((len(rings) - 1) * n, len(rings) * n))], [cu, cu]
    facets = getattr(pts, 'facets', frozenset())
    rounds = set(round_edges) | set(getattr(pts, 'round_edges', ()))
    bands = set(range(2 if bottom else 0)) | ({len(rings) - 3, len(rings) - 2} if top else set())   # ring bands that are bevels
    cls = ['planar', 'planar']
    for k in range(len(rings) - 1):
        for i in range(n):
            faces.append((k * n + i, k * n + (i + 1) % n, (k + 1) * n + (i + 1) % n, (k + 1) * n + i))
            rules.append(edge_rule(i))
            cls.append(f'bevel:{kind}' if (k in bands or i in facets) else ('round' if i in rounds else 'planar'))
    p.add(verts, faces, rules, cls)


def yz_to_x(M):
    """Frame for a profile drawn in (y, z) and extruded along +x: local (u, v, w) -> (y, z, x). Proper rotation."""
    R = np.eye(4)
    R[:3, :3] = [[0, 0, 1], [1, 0, 0], [0, 1, 0]]
    return M @ R


def rrect(w, d, r, n):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, d / 2 - r, 0), (-w / 2 + r, d / 2 - r, 90), (-w / 2 + r, -d / 2 + r, 180), (w / 2 - r, -d / 2 + r, 270)):
        pts += [(cx + r * math.cos(math.radians(a0 + 90 * i / n)), cy + r * math.sin(math.radians(a0 + 90 * i / n))) for i in range(n + 1)]
    return BevelPoly(pts, round_edges={k * (n + 1) + i for k in range(4) for i in range(n)})   # arc edges round, sides planar


def lathe(p, M, profile, n, uv, phase=0.0, cap_start=None, cap_end=None):
    """Revolve [(r, z)] about local Z; r == 0 is a pole. uv: one rule or one per strip. Optional n-gon end caps."""
    rings = []
    for r, z in profile:
        rings.append([(0.0, 0.0, z)] if r == 0 else
                     [(r * math.cos(2 * math.pi * i / n + phase), r * math.sin(2 * math.pi * i / n + phase), z) for i in range(n)])
    verts, faces, rules, idx = [], [], [], []
    for ring in rings:
        idx.append(list(range(len(verts), len(verts) + len(ring))))
        verts += [apply(M, q) for q in ring]
    for k in range(len(rings) - 1):
        a, c = idx[k], idx[k + 1]
        rule = uv if isinstance(uv, str) else uv[k]
        if len(a) > 1 and len(c) > 1:
            faces += [(a[i], a[(i + 1) % n], c[(i + 1) % n], c[i]) for i in range(n)]
        elif len(a) == 1:
            faces += [(a[0], c[(i + 1) % n], c[i]) for i in range(n)]
        else:
            faces += [(a[i], a[(i + 1) % n], c[0]) for i in range(n)]
        rules += [rule] * n
    if cap_start:
        faces.append(tuple(reversed(idx[0]))); rules.append(cap_start)
    if cap_end:
        faces.append(tuple(idx[-1])); rules.append(cap_end)
    p.add(verts, faces, rules)


def cyl(p, M, r, z0, z1, n, uv, cap=None):
    """Closed cylinder along local Z: 4n - 4 triangles."""
    lathe(p, M, [(r, z0), (r, z1)], n, uv, cap_start=cap or uv, cap_end=cap or uv)


def rod(p, a, b, r, n, uv, hint=(0, 0, 1)):
    a, b = np.asarray(a, float), np.asarray(b, float)
    L = float(np.linalg.norm(b - a))
    cyl(p, frame(a, b - a, hint), r, 0.0, L, n, uv)


def sweep(p, pts, r, sides, uv, caps=True, up=None, phase=0.0):
    """Tube along a polyline (ring normal transported from `up` or the previous ring). (k-1)*2*sides + caps tris."""
    pts = [np.asarray(q, float) for q in pts]
    rings, prev = [], None
    for i, q in enumerate(pts):
        t = unit(pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)])
        ref = np.asarray(up, float) if up is not None else (prev if prev is not None else
                                                             (np.array([0, 0, 1.0]) if abs(t[2]) < 0.9 else np.array([1.0, 0, 0])))
        nrm = unit(ref - t * np.dot(ref, t)); prev = nrm
        bi = np.cross(t, nrm)
        rings.append([tuple(q + nrm * r * math.cos(2 * math.pi * k / sides + phase) + bi * r * math.sin(2 * math.pi * k / sides + phase))
                      for k in range(sides)])
    verts = [v for ring in rings for v in ring]
    faces = []
    for i in range(len(rings) - 1):
        a, c = i * sides, (i + 1) * sides
        faces += [(a + k, a + (k + 1) % sides, c + (k + 1) % sides, c + k) for k in range(sides)]
    if caps:
        faces += [tuple(reversed(range(sides))), tuple(range((len(rings) - 1) * sides, len(rings) * sides))]
    p.add(verts, faces, uv)


def sag(a, b, drop, k=3):
    """Points on a sagging span between a and b (parabola, `drop` metres at mid), k interior points."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    return [tuple(a + (b - a) * t - np.array([0, 0, drop * 4 * t * (1 - t)])) for t in [i / (k + 1) for i in range(1, k + 1)]]


# ------------------------------------------------------------------ placements (Blender metres)
CTL = dict(cx=1.325, cy=-0.825, yaw=-0.85, zb=0.6889, w=0.99, d=0.32, h=0.095)    # v03 C2: stand own height 0.68 (zb); placement from the measure script's bounded K1 + visibility search (v01: 1.2, -0.8, -0.6, zb 0.573)
MC = T(CTL['cx'], CTL['cy'], CTL['zb']) @ Rz(CTL['yaw'])                       # controller local: z from the underside
MCF = T(CTL['cx'], CTL['cy'], 0.0) @ Rz(CTL['yaw'])                            # controller local, z from the floor
KEY = dict(pitch=0.0294, gap=0.0034, x0=-0.398, yf=-0.157, yb=0.013, bed=0.030, top=0.0535, bw=0.0145, bwt=0.011,
           bl=0.105, btop=0.0648, front=0.0672)
STOOL = dict(local=(0.0, -0.40), seat=0.50, r=0.165, legs=0.17, leg_phase=0.0)     # v03 K1: centred on the keys, legs on the controller axes; all feet on the rug field (v01 local (0.25, -0.40), leg phase 45)
SUSTAIN = dict(local=(0.42, -0.04))
THRONE = dict(cx=1.425, cy=0.0, seat=0.48, r=0.175, legs=0.20)
UPRIGHT_L, UPRIGHT_R, RACK_Y = 0.841, 1.959, 0.56                 # v03 C4: tube outer width 1.160 (v01 0.82 / 1.98)
RACK = dict(r=0.021, top=0.7586, bar=0.66, side=0.48, side_y=0.20, foot_y=(0.40, 0.715))  # v03 C11: back foot shortened, rubber end 155 mm inside the rug back edge (root >= 150 mm; v01 foot_y (0.40, 0.78))
PADS = {  # name: centre, radius, shell depth, tilt degrees toward the throne
    'tom1': ((1.18, 0.47, 0.79), 0.135, 0.075, 16),
    'tom2': ((1.60, 0.47, 0.80), 0.135, 0.075, 16),
    'snare': ((1.06, 0.25, 0.555), 0.147, 0.095, 6),            # v03 C5 (v01 r 0.16)
    'tom3': ((1.785, 0.27, 0.56), 0.135, 0.075, 9),             # v03 C4: clear of the moved right upright (v01 x 1.80)
}
RIDE_X = 1.98                       # unchanged from v01: root S3, the rack target is frame + clamps; booms are reported separately
CYMBALS = {  # name: centre (bow plane), radius, tilt degrees toward the throne
    'hihat': ((0.85, 0.62, 1.00), 0.19, 3),
    'crash': ((1.68, 0.67, 1.06), 0.19, 12),                    # v03 C6 (v01 R 0.20)
    'ride': ((RIDE_X, 0.445, 0.95), 0.19, 9),                   # v03 C7 (v01 R 0.20)
}
KICK = dict(cx=1.42, ty=0.455, tw=0.21, td=0.11, th=0.45, pad_r=0.078, pad_z=0.235, heel_y=0.10, toe_y=0.33)
HIHAT_PEDAL = dict(cx=1.00, cy=0.10, w=0.114, l=0.33, yaw=0.12)  # v03 C8/C9 base 0.130 x 0.330 (v01 w 0.11, l 0.30)    # proxy (0.875, 0.185): out from behind the desk leg
MODULE = dict(c=(0.85, 0.40, 0.78), w=0.20, h=0.15, d=0.05, az=165.0, up=35.0)
WALL_Y = 1.035 - EPS                # front face of the back skirting

PLAYER = (THRONE['cx'], THRONE['cy'])


def m_ctl(local_xy, z=0.0):
    return apply(MCF, (local_xy[0], local_xy[1], z))


# ------------------------------------------------------------------ controller body, indicators, keys
def controller():
    shell, glow, keys = Part('ctl_body__shell'), Part('ctl_body__indicators'), Part('ctl_keys__keys')
    hw, hd = CTL['w'] / 2, CTL['d'] / 2
    ci = hw - 0.022                                        # cheek inner face
    kx1 = KEY['x0'] + 29 * KEY['pitch']                    # 0.4546
    # base slab: key bed top (black) shows through the key gaps; v03: 2-segment bevel on the exposed top-front edge
    # profile in (y, z), extruded along x: (-hd,0) (hd,0) (hd,bed) (-hd,bed); edge 2 is the top (black)
    with label('ctl.slab'):
        slab = bevel_corners([(-hd, 0.0), (hd, 0.0), (hd, KEY['bed']), (-hd, KEY['bed'])], 'casing', which={3})
        prism(shell, slab, -ci + 0.0002, ci - 0.0002, ['white_pc', 'white_pc', 'black', 'white_pc', 'white_pc', 'white_pc'], yz_to_x(MC),
              cap_uv='white_pc')
    # rear panel: front wall is the key-well back, top slopes up 12 mm toward the back; v03: bevelled front-top and back-top edges
    p0, p1 = KEY['yb'] + 0.0035, hd
    z_front, z_back = 0.071, 0.083                         # v03 C1 (v01 0.080 / 0.092): knob tops 0.094
    with label('ctl.panel'):
        prism(shell, bevel_corners([(p0, KEY['bed']), (p1, KEY['bed']), (p1, z_back), (p0, z_front)], 'casing', which={2, 3}),
              -ci, ci, 'white_pc', yz_to_x(MC))
    # wheel bay (left of the keys) and right margin block, flush with the white key tops; v03: bevelled top-front edge
    with label('ctl.bays'):
        bay = bevel_corners([(KEY['yf'], KEY['bed']), (p0 + 0.0002, KEY['bed']), (p0 + 0.0002, KEY['top']), (KEY['yf'], KEY['top'])], 'casing', which={3})
        prism(shell, bay, -ci, KEY['x0'] - KEY['gap'] / 2 - 0.0003, 'white_pc', yz_to_x(MC))
        prism(shell, bay, kx1 - KEY['gap'] / 2 + 0.0023, ci, 'white_pc', yz_to_x(MC))
    # cheeks: convex rounded profile in (y, z), oak-tone palette cell; v03: 2-segment bevel round the outer face perimeter
    prof = [(-hd, 0.0), (hd, 0.0), (hd, 0.095), (0.02, 0.091), (-0.11, 0.072), (-0.145, 0.062), (-hd, 0.050)]
    with label('ctl.cheeks'):
        for s in (-1, 1):
            x_a, x_b = (s * ci, s * hw) if s > 0 else (s * hw, s * ci)
            M = MC @ T(x_a, 0, 0) @ Ry(math.pi / 2)            # local Z -> controller +X; profile (y, z) -> (-z?, y)
            pts = [(-z, y) for y, z in prof]                   # Ry(90): local x maps to -z, local y to y
            pts = pts if _ccw(pts) else list(reversed(pts))
            top_chain = {(-z, y) for y, z in prof[2:]}          # the sloped top profile (v01 smooth curve) is a round surface
            back_top = (-prof[2][1], prof[2][0])                # the 90-degree back-top corner across the cheek thickness
            pts = bevel_corners(pts, 'casing', which={pts.index(back_top)})
            rounds = {i for i in range(len(pts)) if pts[i] in top_chain and pts[(i + 1) % len(pts)] in top_chain}
            prism(shell, pts, 0.0, x_b - x_a, 'oak_tone', M, top='casing' if s > 0 else None, bottom='casing' if s < 0 else None,
                  round_edges=rounds)
    # pitch and mod wheels in black slots on the wheel bay
    _LABEL[0] = 'ctl.controls'
    for wx in (-0.452, -0.424):
        box(shell, (wx - 0.009, -0.120, KEY['top'] - 0.001), (wx + 0.009, -0.050, KEY['top'] + 0.0012), 'black', MC)
        cyl(shell, MC @ T(wx, -0.085, KEY['top'] - 0.008) @ Ry(math.pi / 2), 0.021, -0.006, 0.006, 16, 'rubber')
    # panel helpers: a frame lying on the sloped panel top at (x, y)
    slope = math.atan2(z_back - z_front, p1 - p0)

    def on_panel(x, y, dz=0.0):
        z = z_front + (y - p0) * math.tan(slope)
        return MC @ T(x, y, z + dz) @ Rx(slope)

    # eight pads, 2 x 4
    for i in range(4):
        for j, y in enumerate((0.062, 0.112)):
            x = -0.440 + 0.046 * i
            extrude(shell, rrect(0.038, 0.038, 0.006, 2), -0.002, 0.0055, 'fabric', on_panel(x, y))
    # eight knobs in a row, display bezel, four transport keys
    _LABEL[0] = 'ctl.knobs'
    for i in range(8):
        cyl(shell, on_panel(-0.215 + 0.036 * i, 0.100), 0.0115, -0.002, 0.016, 16, 'black')
    _LABEL[0] = 'ctl.controls'
    box(shell, (-0.06, -0.026, -0.002), (0.06, 0.026, 0.0025), 'black', on_panel(0.215, 0.090))
    for i in range(4):
        box(shell, (-0.014, -0.010, -0.002), (0.014, 0.010, 0.006), 'fabric', on_panel(0.320 + 0.034 * i, 0.100))
    # indicators (lib_glow): display face plus four pad-column strips
    _LABEL[0] = 'ctl.indicators'
    glow_rule = 'glow'
    box(glow, (-0.052, -0.019, 0.0025 + EPS), (0.052, 0.019, 0.0040), glow_rule, on_panel(0.215, 0.090))
    for i in range(4):
        box(glow, (-0.015, -0.0025, -0.001), (0.015, 0.0025, 0.0025), glow_rule, on_panel(-0.440 + 0.046 * i, 0.030))
    # keys: 29 white (front block + stem), 20 black (tapered); C to C, gaps show the black bed
    _LABEL[0] = 'ctl.keys'
    P, g = KEY['pitch'], KEY['gap']
    bz0 = KEY['bed'] + EPS
    blacks = []
    for octave in range(4):
        for off in (1 - 0.10, 2 + 0.10, 4 - 0.14, 5.0, 6 + 0.14):
            blacks.append(KEY['x0'] + (7 * octave + off) * P)
    assert len(blacks) == 20
    by0 = KEY['yb'] - KEY['bl']
    for k in range(29):
        x0, x1 = KEY['x0'] + k * P + g / 2, KEY['x0'] + (k + 1) * P - g / 2
        front = bevel_corners([(KEY['yf'], bz0), (by0 - 0.0025, bz0), (by0 - 0.0025, KEY['top']), (KEY['yf'], KEY['top'])], 'white_key_lip', which={3})
        prism(keys, front, x0, x1, 'ivory', yz_to_x(MC))                                           # front block, v03 H1 front-top lip
        s0 = max([x0] + [b + KEY['bw'] / 2 + g / 2 for b in blacks if x0 - P / 2 < b < x0 + g])
        s1 = min([x1] + [b - KEY['bw'] / 2 - g / 2 for b in blacks if x1 - g < b < x1 + P / 2])
        box(keys, (s0, by0 - 0.0027, bz0), (s1, KEY['yb'], KEY['top']), 'ivory', MC)                 # stem
    for b in blacks:
        w0, w1 = KEY['bw'] / 2, KEY['bwt'] / 2
        hexa(keys, [(b - w0, by0, bz0), (b + w0, by0, bz0), (b + w0, KEY['yb'], bz0), (b - w0, KEY['yb'], bz0),
                    (b - w1, by0 + 0.008, KEY['btop']), (b + w1, by0 + 0.008, KEY['btop']), (b + w1, KEY['yb'], KEY['btop']),
                    (b - w1, KEY['yb'], KEY['btop'])], 'black', MC)
    return shell, glow, keys, blacks


def _ccw(pts):
    return sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts))) > 0


# ------------------------------------------------------------------ stand, sustain pedal, stool
def stand():
    p = Part('ctl_stand__frame')
    _LABEL[0] = 'stand'
    arm_r, tube_r = 0.013, 0.012
    arm_z = CTL['zb'] - EPS - arm_r
    foot_z = ON_RUG + 0.013
    for s in (-1, 1):
        x = 0.30 * s
        sweep(p, [apply(MCF, (x, -0.17, arm_z)), apply(MCF, (x, 0.17, arm_z))], arm_r, 8, 'black_metal', up=(0, 0, 1))
        for y0, y1 in ((-0.19, -0.17), (0.17, 0.19)):
            rod(p, apply(MCF, (x, y0, arm_z)), apply(MCF, (x, y1, arm_z)), arm_r, 12, 'rubber')
        sweep(p, [apply(MCF, (x * 1.033, -0.16, foot_z)), apply(MCF, (x * 1.033, 0.16, foot_z))], 0.013, 8, 'black_metal', up=(0, 0, 1))
        for y0, y1 in ((-0.182, -0.16), (0.16, 0.182)):
            rod(p, apply(MCF, (x * 1.033, y0, foot_z)), apply(MCF, (x * 1.033, y1, foot_z)), 0.013, 12, 'rubber')
    for yf in (-0.055, 0.055):                               # two X frames (double braced)
        for s in (-1, 1):
            a = apply(MCF, (-0.31 * s, yf, foot_z + 0.004))
            b = apply(MCF, (0.30 * s, yf, arm_z))
            sweep(p, [a, b], tube_r, 8, 'black_metal', phase=math.pi / 8)
        mid_z = (foot_z + arm_z) / 2
        box(p, (-0.03, yf - 0.009, mid_z - 0.04), (0.03, yf + 0.009, mid_z + 0.04), 'black_metal', MCF)       # pivot plate
        for t in range(3):                                                                                     # height teeth
            box(p, (0.032 + 0.012 * t, yf - 0.006, mid_z - 0.05 + 0.012 * t), (0.040 + 0.012 * t, yf + 0.006, mid_z - 0.04 + 0.012 * t), 'metal', MCF)
    mid_z = (foot_z + arm_z) / 2
    rod(p, apply(MCF, (0, -0.066, mid_z)), apply(MCF, (0, 0.066, mid_z)), 0.006, 12, 'metal')                 # pivot bolt
    rod(p, apply(MCF, (0, -0.090, mid_z)), apply(MCF, (0, -0.066, mid_z)), 0.022, 16, 'black')               # pivot knob
    return p


def sustain_pedal():
    p = Part('ctl_sustain_pedal__pedal')
    lx, ly = SUSTAIN['local']
    M = MCF @ T(lx, ly, ON_RUG)
    with label('sustain.base'):                                                                 # v03: bevelled top perimeter
        prism(p, rrect(0.100, 0.260, 0.015, 2), 0.0, 0.018, 'black', M, top='casing')
    top = M @ T(0, 0.10, 0.018) @ Rx(math.radians(-7))                                          # pedal plate hinged at the back
    with label('sustain.plate'):                                                                # v03: bevelled top perimeter
        prism(p, rrect(0.080, 0.200, 0.012, 2), 0.0015, 0.010, 'metal', top @ T(0, -0.100, 0), top='casing')
    with label('sustain.hinge'):
        rod(p, apply(M, (-0.04, 0.10, 0.022)), apply(M, (0.04, 0.10, 0.022)), 0.006, 10, 'black')    # hinge
    _LABEL[0] = 'sustain.cable'
    # cable: out of the back, along the rug, up behind the stand to the rear jack (v03: unchanged 7.0 mm lead)
    zc = ON_RUG + 0.004
    pts = [apply(M, (0.0, 0.131, 0.010)), apply(M, (0.0, 0.16, zc)), apply(MCF, (lx - 0.02, 0.26, zc)), apply(MCF, (0.40, 0.29, zc)),
           apply(MCF, (0.37, 0.25, 0.20)), apply(MCF, (0.36, 0.215, 0.45)), apply(MCF, (0.355, 0.195, CTL['zb'] + 0.040)),
           apply(MCF, (0.355, CTL['d'] / 2 + EPS + 0.0005, CTL['zb'] + 0.040))]
    sweep(p, pts, 0.0035, 6, 'black')
    return p


FOOT_R = 0.016                      # stool rubber foot radius
RUG_INNER_MARGIN = 0.020            # a foot on the rug sits at least this far inside the binding's inner step (critique K1 proposal)


def rug_support(xy, r):
    """'rug' if a disc of radius r at xy lies on the rug's inner top, 'floor' if it is clear of the rug, else 'binding'."""
    x, y = xy
    ix0, ix1 = RUG['x0'] + RUG['bw'] + RUG_INNER_MARGIN, RUG['x1'] - RUG['bw'] - RUG_INNER_MARGIN
    iy0, iy1 = RUG['y0'] + RUG['bw'] + RUG_INNER_MARGIN, RUG['y1'] - RUG['bw'] - RUG_INNER_MARGIN
    if ix0 + r <= x <= ix1 - r and iy0 + r <= y <= iy1 - r:
        return 'rug'
    if x + r < RUG['x0'] - RUG_INNER_MARGIN or x - r > RUG['x1'] + RUG_INNER_MARGIN or \
            y + r < RUG['y0'] - RUG_INNER_MARGIN or y - r > RUG['y1'] + RUG_INNER_MARGIN:
        return 'floor'
    return 'binding'


def stool_feet():
    """World (x, y) of the four stool feet, their leg directions and their support (v03: every foot is checked)."""
    cx, cy, _ = m_ctl(STOOL['local'])
    out = []
    for k in range(4):
        a = math.radians(STOOL['leg_phase'] + 90 * k) + CTL['yaw']
        d = np.array([math.cos(a), math.sin(a), 0])
        xy = (cx + d[0] * STOOL['legs'], cy + d[1] * STOOL['legs'])
        out.append((xy, d, rug_support(xy, FOOT_R)))
    return (cx, cy), out


def stool():
    p = Part('stool_keys__stool')
    _LABEL[0] = 'stool'
    (cx, cy), feet = stool_feet()
    support = {s for _, _, s in feet}
    if len(support) != 1 or 'binding' in support:
        # v01 left one foot 8.3 mm above the floor beyond the rug edge; v03 refuses any mixed or binding support
        raise ValueError('stool feet need one support surface (all on the rug inner top or all on the floor): ' +
                         ', '.join(f'({x:.3f}, {y:.3f}) {s}' for (x, y), _, s in feet))
    base = ON_RUG if support == {'rug'} else ON_FLOOR
    seat, R = STOOL['seat'], STOOL['r']
    M = T(cx, cy, 0)
    lathe(p, M, [(0, seat - 0.060), (R - 0.012, seat - 0.060), (R, seat - 0.046), (R, seat - 0.014), (R - 0.016, seat), (0, seat)],
          24, ['black', 'fabric', 'fabric', 'fabric', 'fabric'])
    hub_z = 0.10
    cyl(p, M, 0.020, hub_z + 0.02, seat - 0.060, 12, 'metal')                                 # post
    cyl(p, M, 0.028, seat - 0.110, seat - 0.075, 12, 'black')                                 # height collar
    cyl(p, M, 0.032, hub_z - 0.025, hub_z + 0.025, 12, 'black_metal')                         # hub
    for (fx, fy), d, _ in feet:
        foot = np.array([fx, fy, base + 0.012])
        sweep(p, [np.array([cx, cy, hub_z]) + d * 0.025, foot + np.array([0, 0, 0.010])], 0.011, 6, 'black_metal')
        cyl(p, T(*foot) @ T(0, 0, -0.012), FOOT_R, 0.0, 0.016, 10, 'rubber')
    return p


# ------------------------------------------------------------------ rug
def rug():
    p = Part('rug__rug')
    _LABEL[0] = 'rug'
    cx, cy = (RUG['x0'] + RUG['x1']) / 2, (RUG['y0'] + RUG['y1']) / 2
    w, d = RUG['x1'] - RUG['x0'], RUG['y1'] - RUG['y0']
    M = T(cx, cy, 0)
    outer, inner = rrect(w, d, RUG['r'], 3), rrect(w - 2 * RUG['bw'], d - 2 * RUG['bw'], RUG['r'] * 0.5, 3)
    n = len(outer)
    mid = rrect(w - 0.010, d - 0.010, RUG['r'] - 0.005, 3)
    rings = [[(x, y, EPS) for x, y in outer], [(x, y, EPS + RUG['bind'] * 0.75) for x, y in outer],
             [(x, y, EPS + RUG['bind']) for x, y in mid], [(x, y, EPS + RUG['bind']) for x, y in inner], [(x, y, RT) for x, y in inner]]
    verts, faces = [], []
    for ring in rings:
        verts += [apply(M, q) for q in ring]
    for k in range(len(rings) - 1):
        faces += [(k * n + i, k * n + (i + 1) % n, (k + 1) * n + (i + 1) % n, (k + 1) * n + i) for i in range(n)]
    faces += [tuple(reversed(range(n))), tuple(range(4 * n, 5 * n))]
    p.add(verts, faces, 'weave')
    return p


# ------------------------------------------------------------------ drum rack, booms, mounts
def clamp(p, centre, axis, hint=(1, 0, 0)):
    """Clamp block round a tube (same leaf as the tube) with a wing bolt; 68 triangles."""
    M = frame(centre, axis, hint)
    extrude(p, [(0.026, -0.010), (0.026, 0.010), (0.010, 0.026), (-0.010, 0.026), (-0.026, 0.010), (-0.026, -0.010), (-0.010, -0.026), (0.010, -0.026)],
            -0.024, 0.024, 'black', M)
    cyl(p, M @ T(0.026, 0, 0) @ Ry(math.pi / 2), 0.005, 0.0, 0.016, 8, 'metal')
    box(p, (0.040, -0.016, -0.004), (0.046, 0.016, 0.004), 'black', M)


MOUNTS = {}   # name: (stub end point S, unit direction) shared by the rack (stub ends at S) and the mounted part (starts at S + EPS*dir)


def rack():
    p = Part('drum_rack__rack')
    _LABEL[0] = 'rack.frame'
    R = RACK['r']
    zf = ON_RUG + 0.012                                     # foot tube axis
    for x in (UPRIGHT_L, UPRIGHT_R):
        rod(p, (x, RACK_Y, zf), (x, RACK_Y, RACK['top']), R, 16, 'metal')                                    # upright
        rod(p, (x, RACK['foot_y'][0], zf), (x, RACK['foot_y'][1], zf), 0.012, 12, 'metal', hint=(1, 0, 0))   # foot
        for y0, y1 in ((RACK['foot_y'][0] - 0.02, RACK['foot_y'][0]), (RACK['foot_y'][1], RACK['foot_y'][1] + 0.02)):
            rod(p, (x, y0, zf), (x, y1, zf), 0.012, 12, 'rubber', hint=(1, 0, 0))
        clamp(p, (x, RACK_Y, zf + 0.028), (0, 0, 1), hint=(0, 1, 0))
        rod(p, (x, RACK_Y, RACK['side']), (x, RACK['side_y'], RACK['side']), R, 16, 'metal', hint=(1, 0, 0))   # side bar
        rod(p, (x, RACK['side_y'] - 0.012, RACK['side']), (x, RACK['side_y'], RACK['side']), R, 16, 'rubber', hint=(1, 0, 0))
        clamp(p, (x, RACK_Y, RACK['side']), (0, 0, 1), hint=(0, 1, 0))
        clamp(p, (x, RACK_Y, RACK['bar']), (0, 0, 1), hint=(0, 1, 0))
    rod(p, (UPRIGHT_L, RACK_Y, RACK['bar']), (UPRIGHT_R, RACK_Y, RACK['bar']), R, 16, 'metal', hint=(0, 0, 1))   # crossbar

    def stub(name, centre, tube_axis, out, length=0.045, r=0.010, hint=None):
        _LABEL[0] = 'rack.stub.' + name
        out = unit(out)
        clamp(p, centre, tube_axis, hint=-out if hint is None else hint)   # wing bolt on the far side from the stub, or `hint`
        S = np.asarray(centre, float) + out * length
        rod(p, centre, S, r, 12, 'metal')
        MOUNTS[name] = (S, out, r)

    for name in ('tom1', 'tom2'):
        c = PADS[name][0]
        stub(name, (c[0], RACK_Y, RACK['bar']), (1, 0, 0), (0, -0.35, 1))
    stub('snare', (UPRIGHT_L, 0.30, RACK['side']), (0, 1, 0), (1, 0, 0.25), hint=(0, 0, -1))
    stub('tom3', (UPRIGHT_R, 0.30, RACK['side']), (0, 1, 0), (-1, 0, 0.35), hint=(0, 0, -1))
    stub('module', (UPRIGHT_L, RACK_Y, 0.57), (0, 0, 1), (-0.55, -0.75, 0.15))
    # cymbal booms: clamp on the upright, boom tube rising to just under the cymbal's tilter
    for name, (x, z) in (('hihat', (UPRIGHT_L, RACK['top'] - 0.035)), ('crash', (UPRIGHT_R, RACK['top'] - 0.035)), ('ride', (UPRIGHT_R, 0.57))):
        _LABEL[0] = 'rack.boom.' + name
        c, r_c, tilt = CYMBALS[name]
        M = tilt_toward(np.asarray(c, float), PLAYER, tilt)
        axis = M[:3, 2]
        S = np.asarray(c, float) - axis * (CYM_UNDER + TILTER)
        base = np.array([x, RACK_Y, z])
        out = unit(np.array([S[0] - x, S[1] - RACK_Y, 0.0]) if np.linalg.norm(S[:2] - base[:2]) > 0.03 else np.array([0.0, 1.0, 0.0]))
        perp = np.array([-out[1], out[0], 0.0])
        perp = perp if perp[0] * ((UPRIGHT_L + UPRIGHT_R) / 2 - x) >= 0 else -perp
        clamp(p, base, (0, 0, 1), hint=perp)               # wing bolt across the boom, toward the rack centre
        start = base + out * 0.026
        bend = S - axis * 0.06
        pts = [start, start + out * 0.02 + np.array([0, 0, 0.01])]
        if np.linalg.norm(bend - pts[-1]) > 0.04:
            pts.append(bend)
        pts.append(S)
        sweep(p, pts, 0.010, 10, 'metal')
        MOUNTS[name] = (S, axis, 0.010)
    return p


# ------------------------------------------------------------------ pads (shells + arms) and heads
def pads():
    sh, hd = Part('drum_pads__shells'), Part('drum_pads__heads')
    for name, (c, r, depth, tilt) in PADS.items():
        M = tilt_toward(np.asarray(c, float), PLAYER, tilt)
        z0 = -depth                                           # local z: rim top at 0.008, head at 0.0
        b, ro = bev('casing'), r + 0.006                      # v03 C13: 2-segment bevel on the rim's outer top corner
        _LABEL[0] = f'pad.{name}.shell'
        lathe(sh, M, [(0, z0), (r - 0.025, z0), (r - 0.004, z0 + 0.004), (r, z0 + 0.012), (r, -0.006), (ro, -0.004),
                      (ro, 0.008 - b), (ro - K_BEV * b, 0.008 - K_BEV * b), (ro - b, 0.008), (r - 0.010, 0.008), (r - 0.010, -0.002)],
              24, ['black', 'black', 'black', 'black', 'metal', 'metal', 'metal', 'metal', 'metal', 'metal'])
        strip_cls = ['planar', 'round', 'round', 'round', 'round', 'round', 'bevel:casing', 'bevel:casing', 'planar', 'round']
        sh.cls[-24 * len(strip_cls):] = [c for c in strip_cls for _ in range(24)]          # N1 classes: bottom disc, shell, rim, bevel, top ring
        _LABEL[0] = f'pad.{name}.lugs'
        for k in range(6 if name == 'snare' else 4):                                   # lugs
            a = 2 * math.pi * (k + 0.5) / (6 if name == 'snare' else 4)
            box(sh, (r - 0.002, -0.009, z0 + 0.018), (r + 0.010, 0.009, z0 + 0.044), 'metal', M @ Rz(a))
        # mount: block under the shell, arm to the rack stub
        _LABEL[0] = f'pad.{name}.mount'
        mount = M @ T(0, 0, z0)
        box(sh, (-0.024, -0.024, -0.020), (0.024, 0.024, 0.0005), 'black_metal', mount)
        S, out, rr = MOUNTS[name]
        a0 = S + out * EPS
        tip = np.asarray(apply(mount, (0, 0, -0.012)))
        mid = a0 + out * 0.03
        sweep(sh, [a0, mid, tip], rr, 10, 'black_metal')
        # mesh head (lib_weave): thin disc just inside the rim, 0.3 mm clear of it
        _LABEL[0] = f'pad.{name}.head'
        lathe(hd, M, [(0, -0.0015), (r - 0.0103 - EPS, -0.0015), (r - 0.0103 - EPS, -0.0045), (0, -0.0045)], 24, 'weave')
    return sh, hd


# ------------------------------------------------------------------ cymbals
CYM_UNDER, TILTER = 0.016, 0.045


def cymbals():
    p = Part('drum_cymbals__cymbals')
    for name, (c, R, tilt) in CYMBALS.items():
        _LABEL[0] = 'cymbal.' + name
        M = tilt_toward(np.asarray(c, float), PLAYER, tilt)
        prof = [(0, 0.030), (0.020, 0.029), (0.042, 0.022), (0.056, 0.008), (0.120, 0.002), (R - 0.022, -0.004), (R - 0.004, -0.002),
                (R, -0.010), (R - 0.022, -0.013), (0.120, -0.007), (0.052, 0.000), (0, 0.006)]
        lathe(p, M, prof, 24, ['fabric', 'fabric', 'fabric', 'black_metal', 'black_metal', 'fabric', 'fabric', 'fabric', 'black_metal',
                               'black_metal', 'black_metal'])
        cyl(p, M, 0.006, -CYM_UNDER - TILTER + EPS, 0.050, 8, 'metal')                  # rod through the bell
        cyl(p, M, 0.014, -CYM_UNDER - 0.012, -0.0005, 8, 'rubber')                      # under felt / sleeve stop
        cyl(p, M, 0.012, 0.030, 0.042, 8, 'black')                                     # wing nut body
        box(p, (-0.026, -0.004, 0.031), (0.026, 0.004, 0.047), 'black', M)             # wings
        cyl(p, M, 0.011, -CYM_UNDER - TILTER + EPS, -CYM_UNDER - 0.012, 8, 'metal')     # tilter end
    return p


# ------------------------------------------------------------------ kick tower and pedal, hi-hat pedal
def kick():
    p = Part('drum_kick__tower')
    k = KICK
    x0, x1, y0, y1 = k['cx'] - k['tw'] / 2, k['cx'] + k['tw'] / 2, k['ty'] - k['td'] / 2, k['ty'] + k['td'] / 2
    with label('kick.tower'):                                                                                   # tower (v03: bevelled)
        prism(p, bevel_corners([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], 'casing'), ON_RUG + 0.035, ON_RUG + k['th'], 'black', top='casing')
    with label('kick.base'):                                                                                    # base frame (v03: bevelled)
        prism(p, bevel_corners([(x0 - 0.02, y0 - 0.06), (x1 + 0.02, y0 - 0.06), (x1 + 0.02, y1 + 0.03), (x0 - 0.02, y1 + 0.03)], 'casing'),
              ON_RUG, ON_RUG + 0.035, 'black_metal', top='casing')
    _LABEL[0] = 'kick.hardware'
    for sx in (-1, 1):                                                                                          # spurs
        rod(p, (k['cx'] + sx * (k['tw'] / 2 + 0.02), y1, ON_RUG + 0.018), (k['cx'] + sx * (k['tw'] / 2 + 0.07), y1 + 0.05, ON_RUG + 0.012),
            0.007, 8, 'metal')
    padM = frame(np.array([k['cx'], y0, ON_RUG + k['pad_z']]), (0, -1, 0), hint=(1, 0, 0))
    cyl(p, padM, k['pad_r'], -0.002, 0.012, 24, 'fabric')                                                       # fabric head
    lathe(p, padM, [(k['pad_r'] + 0.002, -0.002), (k['pad_r'] + 0.010, 0.004), (k['pad_r'] + 0.010, 0.016), (k['pad_r'] - 0.004, 0.016)], 24, 'black')
    # pedal: base plate, footboard, heel, posts, axle, cam, chain, beater, spring
    hy, ty = k['heel_y'], k['toe_y']
    box(p, (k['cx'] - 0.045, hy - 0.02, ON_RUG), (k['cx'] + 0.045, ty + 0.03, ON_RUG + 0.006), 'black')
    rise = math.atan2(0.05, ty - hy)
    fb = T(k['cx'], hy, ON_RUG + 0.022) @ Rx(rise)
    extrude(p, rrect(0.075, (ty - hy) / math.cos(rise), 0.012, 2), 0.0, 0.008, 'black_metal', fb @ T(0, (ty - hy) / math.cos(rise) / 2, 0))
    box(p, (k['cx'] - 0.038, hy - 0.04, ON_RUG + 0.006), (k['cx'] + 0.038, hy + 0.02, ON_RUG + 0.026), 'rubber')
    post_y = ty + 0.012
    for sx in (-1, 1):
        rod(p, (k['cx'] + sx * 0.045, post_y, ON_RUG + 0.006), (k['cx'] + sx * 0.045, post_y, ON_RUG + 0.16), 0.008, 8, 'black_metal')
    rod(p, (k['cx'] - 0.053, post_y, ON_RUG + 0.15), (k['cx'] + 0.053, post_y, ON_RUG + 0.15), 0.005, 8, 'metal')       # axle
    cyl(p, frame(np.array([k['cx'], post_y, ON_RUG + 0.15]), (1, 0, 0), (0, 1, 0)), 0.022, -0.012, 0.012, 12, 'black_metal')  # cam
    toe = np.array([k['cx'], ty - 0.01, ON_RUG + 0.022 + 0.05 + 0.008])
    sweep(p, [toe, toe + np.array([0, 0.012, 0.05]), np.array([k['cx'], post_y - 0.02, ON_RUG + 0.135])], 0.004, 6, 'metal')   # chain
    beater_top = np.array([k['cx'], y0 - 0.032, ON_RUG + k['pad_z']])
    rod(p, (k['cx'], post_y - 0.005, ON_RUG + 0.15), beater_top, 0.004, 8, 'metal')                             # shaft
    lathe(p, frame(beater_top, (0, 1, 0)), [(0, -0.018), (0.016, -0.016), (0.022, -0.006), (0.022, 0.010), (0.016, 0.018), (0, 0.020)],
          12, 'cream')                                                                                         # beater head
    rod(p, (k['cx'] + 0.058, post_y, ON_RUG + 0.006), (k['cx'] + 0.058, post_y, ON_RUG + 0.12), 0.006, 8, 'metal')   # spring
    return p


def hihat_pedal():
    p = Part('drum_hihat_pedal__pedal')
    h = HIHAT_PEDAL
    M = T(h['cx'], h['cy'], ON_RUG) @ Rz(h['yaw'])
    with label('hihat.base'):                                                                                   # base (v03: bevelled top)
        prism(p, rrect(h['w'] + 0.016, h['l'], 0.014, 2), 0.0, 0.010, 'black', M, top='casing')
    with label('hihat.housing'):                                                                                # sensor housing (v03: bevelled)
        prism(p, bevel_corners([(-0.05, h['l'] / 2 - 0.085), (0.05, h['l'] / 2 - 0.085), (0.05, h['l'] / 2 - 0.005), (-0.05, h['l'] / 2 - 0.005)], 'casing'),
              0.010, 0.070, 'black', M, top='casing')
    _LABEL[0] = 'hihat.hardware'
    rise = math.atan2(0.050, h['l'] - 0.10)
    fb = M @ T(0, -h['l'] / 2 + 0.03, 0.022) @ Rx(rise)
    extrude(p, rrect(h['w'] - 0.01, (h['l'] - 0.10) / math.cos(rise), 0.012, 3), 0.0, 0.008, 'black_metal', fb @ T(0, (h['l'] - 0.10) / math.cos(rise) / 2, 0))
    rod(p, apply(M, (-0.045, -h['l'] / 2 + 0.03, 0.022)), apply(M, (0.045, -h['l'] / 2 + 0.03, 0.022)), 0.009, 12, 'black_metal')  # heel hinge
    box(p, (-0.045, -h['l'] / 2 + 0.005, 0.010), (0.045, -h['l'] / 2 + 0.018, 0.018), 'rubber', M)
    return p


# ------------------------------------------------------------------ module, display, snake
def module():
    body, disp = Part('drum_module__body'), Part('drum_module__display')
    m = MODULE
    az, up = math.radians(m['az']), math.radians(m['up'])
    n = np.array([math.sin(az) * math.cos(up), math.cos(az) * math.cos(up), math.sin(up)])
    c = np.asarray(m['c'], float)
    M = frame(c, n, hint=np.cross(np.array([0, 0, 1.0]), n))               # local Z = face normal, X horizontal
    with label('module.case'):                                                     # v03: bevelled front and back perimeters
        prism(body, rrect(m['w'], m['h'], 0.012, 2), -m['d'] / 2, m['d'] / 2, 'black', M, top='casing', bottom='casing')
    _LABEL[0] = 'module.display'
    box(disp, (-0.055, 0.010, m['d'] / 2 + EPS), (0.025, 0.045, m['d'] / 2 + 0.0015), 'glow', M)
    _LABEL[0] = 'module.controls'
    cyl(body, M @ T(0.060, 0.022, m['d'] / 2), 0.016, -0.002, 0.014, 16, 'metal')                       # volume knob
    for i in range(6):
        box(body, (-0.070 + 0.022 * i, -0.040, m['d'] / 2 - 0.002), (-0.056 + 0.022 * i, -0.028, m['d'] / 2 + 0.004), 'fabric', M)
    # holder plate on the back, arm to the rack stub
    _LABEL[0] = 'module.mount'
    back = M @ T(0, 0, -m['d'] / 2)
    box(body, (-0.045, -0.035, -0.006), (0.045, 0.035, 0.0005), 'black_metal', back)
    S, out, rr = MOUNTS['module']
    tip = np.asarray(apply(back, (0, 0, -0.012)))
    sweep(body, [S + out * EPS, S + out * 0.03, tip], rr, 10, 'black_metal')
    # cable snake from the module's lower edge down toward the crossbar (pad cables continue from its end)
    _LABEL[0] = 'module.snake'
    lo = np.asarray(apply(M, (0.035, -m['h'] / 2 + 0.004, -0.010)))
    snake = [lo, lo + np.array([0.0, 0.0, -0.05]), np.array([0.90, 0.47, 0.60]), np.array([0.96, 0.50, 0.585]), np.array([0.99, 0.51, 0.585])]
    sweep(body, snake, 0.009, 8, 'black')
    MOUNTS['snake'] = (np.asarray(snake[-1]), unit(snake[-1] - snake[-2]), 0.009)
    down = unit(np.asarray(apply(M, (-0.05, -1.0, 0.0))) - np.asarray(apply(M, (-0.05, 0.0, 0.0))))
    MOUNTS['module_power'] = (np.asarray(apply(M, (-0.05, -m['h'] / 2, -0.008))), down, CABLE_R)
    return body, disp


# ------------------------------------------------------------------ sticks
def sticks():
    p = Part('drum_sticks__pair')
    _LABEL[0] = 'sticks'
    c, r, depth, tilt = PADS['snare']
    M = tilt_toward(np.asarray(c, float), PLAYER, tilt)
    rs, L = 0.0095, 0.51
    for k, (dy, yaw) in enumerate(((-0.035, 0.10), (0.030, -0.06))):
        SM = M @ T(-0.02, dy, 0.008 + EPS + rs) @ Rz(yaw) @ Ry(math.pi / 2)
        lathe(p, SM, [(0, -L / 2), (rs * 0.9, -L / 2 + 0.006), (rs, -L / 2 + 0.03), (rs, L / 2 - 0.12), (rs * 0.55, L / 2 - 0.02),
                      (rs * 0.75, L / 2 - 0.008), (0, L / 2)], 6, 'oak', phase=math.pi / 6)
    return p


# ------------------------------------------------------------------ throne
def throne():
    p = Part('drum_throne__throne')
    _LABEL[0] = 'throne'
    t = THRONE
    M = T(t['cx'], t['cy'], 0)
    s, R = t['seat'], t['r']
    lathe(p, M, [(0, s - 0.085), (R - 0.02, s - 0.085), (R, s - 0.060), (R, s - 0.020), (R - 0.03, s), (0, s + 0.002)], 24,
          ['black', 'fabric', 'fabric', 'fabric', 'fabric'])
    hub = 0.17
    cyl(p, M, 0.022, hub + 0.03, s - 0.085, 12, 'metal')                                # post
    cyl(p, M, 0.030, s - 0.15, s - 0.11, 12, 'black')                                   # memory lock
    cyl(p, M, 0.032, hub - 0.03, hub + 0.03, 12, 'black_metal')                         # hub
    for k in range(3):
        a = math.radians(270 + 120 * k)
        d = np.array([math.cos(a), math.sin(a), 0])
        foot = np.array([t['cx'], t['cy'], ON_RUG + 0.012]) + d * t['legs']
        top = np.array([t['cx'], t['cy'], hub]) + d * 0.028
        sweep(p, [top, foot + np.array([0, 0, 0.012])], 0.012, 6, 'black_metal')
        mid = (top + foot) / 2
        sweep(p, [np.array([t['cx'], t['cy'], hub - 0.08]) + d * 0.022, mid + np.array([0, 0, -0.01])], 0.008, 6, 'black_metal')   # brace
        cyl(p, T(*foot) @ T(0, 0, -0.012), 0.018, 0.0, 0.016, 10, 'rubber')
    cyl(p, M, 0.026, hub - 0.11, hub - 0.06, 10, 'black_metal')                         # brace collar
    return p


# ------------------------------------------------------------------ cables (pads and pedals to the module; controller and module to the wall)
CABLE_R = 0.0030                    # v03 C12: 6.0 mm round (v01 0.0032)


def pad_jack(name):
    """Jack on the shell side, beside the pad's rack stub and midway between lugs, 30 mm above the shell bottom; returns (point, outward)."""
    c, r, depth, tilt = PADS[name]
    M = tilt_toward(np.asarray(c, float), PLAYER, tilt)
    S = MOUNTS[name][0]
    loc = np.linalg.inv(M) @ np.array([S[0], S[1], S[2], 1.0])
    spacing = 2 * math.pi / (6 if name == 'snare' else 4)                    # lugs sit at (k + 0.5) * spacing
    ang = round((math.atan2(loc[1], loc[0]) + math.radians({'tom1': 100, 'tom2': 100, 'snare': -90, 'tom3': 35}[name])) / spacing) * spacing
    rad = (math.cos(ang), math.sin(ang), 0.0)
    p = np.asarray(apply(M, (rad[0] * (r + EPS + CABLE_R + 0.0005), rad[1] * (r + EPS + CABLE_R + 0.0005), -depth + 0.030)))
    o = unit(np.asarray(apply(M, (rad[0], rad[1], 0.0))) - np.asarray(apply(M, (0, 0, 0))))
    return p, o


def cables():
    p = Part('music_cables__runs')
    S, d, _ = MOUNTS['snake']
    start = S + d * EPS
    lead = start + d * 0.025
    cr = CABLE_R
    z_floor = ON_RUG + cr
    zh = EPS + RUG['bind'] + EPS + cr + 0.002                                # over the bound edge, then down past it

    def to_wall(x):
        return [np.array([x, RUG['y1'] - 0.05, z_floor]), np.array([x, RUG['y1'] - 0.02, zh]), np.array([x, RUG['y1'] + 0.008, zh]),
                np.array([x, RUG['y1'] + 0.035, EPS + cr]), np.array([x, WALL_Y - cr - EPS, EPS + cr])]
    runs = {}
    for name in ('tom1', 'tom2'):
        j, o = pad_jack(name)
        runs[name] = [start, lead, np.array([lead[0] + 0.04, RACK_Y - 0.065, RACK['bar'] - 0.075]),
                      np.array([j[0], RACK_Y - 0.065, RACK['bar'] - 0.075]), j + o * 0.035 + np.array([0, 0, -0.02]), j + o * 0.010, j]
    j, o = pad_jack('snare')
    runs['snare'] = [start, lead, np.array([1.02, 0.50, 0.52]), np.array([1.14, 0.45, 0.47]), j + o * 0.035 + np.array([0, 0, -0.02]), j + o * 0.010, j]
    j, o = pad_jack('tom3')
    runs['tom3'] = [start, lead, np.array([1.10, RACK_Y - 0.065, RACK['bar'] - 0.085]), np.array([1.88, RACK_Y - 0.065, RACK['bar'] - 0.085]),
                    np.array([1.93, 0.44, 0.47]), j + o * 0.035 + np.array([0, 0, -0.02]), j + o * 0.010, j]
    jk = np.array([KICK['cx'] - KICK['tw'] / 2 - EPS - cr - 0.0005, KICK['ty'] + 0.02, ON_RUG + 0.30])
    runs['kick'] = [start, lead, np.array([1.12, 0.50, 0.50]), np.array([1.26, jk[1], 0.33]), jk + np.array([-0.025, 0, 0]), jk]
    h = HIHAT_PEDAL
    Mh = T(h['cx'], h['cy'], ON_RUG) @ Rz(h['yaw'])
    jh = np.asarray(apply(Mh, (0.0, h['l'] / 2 - 0.005 + EPS + cr + 0.0005, 0.045)))
    oh = unit(np.asarray(apply(Mh, (0, 1, 0))) - np.asarray(apply(Mh, (0, 0, 0))))
    runs['hihat_pedal'] = [start, lead, np.array([0.95, 0.53, 0.50]), np.array([0.90, 0.50, 0.25]), np.array([jh[0], jh[1] + 0.07, z_floor + 0.004]),
                           jh + oh * 0.025, jh]
    jc = np.asarray(apply(MCF, (-0.30, CTL['d'] / 2 + EPS + cr + 0.0005, CTL['zb'] + 0.040)))
    runs['controller'] = [jc, np.asarray(apply(MCF, (-0.30, 0.19, CTL['zb'] + 0.040))), np.asarray(apply(MCF, (-0.33, 0.22, CTL['zb'] - 0.06))),
                          np.asarray(apply(MCF, (-0.37, 0.24, 0.25))), np.asarray(apply(MCF, (-0.40, 0.25, z_floor + 0.01))),
                          np.array([0.62, -0.20, z_floor])] + to_wall(0.62)
    P0, dn, _ = MOUNTS['module_power']
    q = P0 + dn * EPS
    runs['module_power'] = [q, q + dn * 0.03, np.array([0.70, 0.47, 0.45]), np.array([0.70, 0.50, z_floor + 0.02])] + to_wall(0.70)
    for name, pts in runs.items():
        _LABEL[0] = 'cable.' + name
        sweep(p, pts, cr, 5, 'black')
    return p


# ------------------------------------------------------------------ everything
def build_all():
    MOUNTS.clear()
    _LABEL[0] = ''
    parts = {}
    shell, glow, keys, blacks = controller()
    parts.update({'ctl_body__shell': shell, 'ctl_body__indicators': glow, 'ctl_keys__keys': keys})
    parts['ctl_stand__frame'] = stand()
    parts['ctl_sustain_pedal__pedal'] = sustain_pedal()
    parts['stool_keys__stool'] = stool()
    parts['rug__rug'] = rug()
    parts['drum_rack__rack'] = rack()
    sh, hd = pads()
    parts['drum_pads__shells'], parts['drum_pads__heads'] = sh, hd
    parts['drum_cymbals__cymbals'] = cymbals()
    parts['drum_kick__tower'] = kick()
    parts['drum_hihat_pedal__pedal'] = hihat_pedal()
    body, disp = module()
    parts['drum_module__body'], parts['drum_module__display'] = body, disp
    parts['drum_sticks__pair'] = sticks()
    parts['drum_throne__throne'] = throne()
    parts['music_cables__runs'] = cables()
    assert set(parts) == set(ROWS)
    for row, part in parts.items():
        assert part.tris <= part.ceiling, f'{row}: {part.tris} > {part.ceiling}'
    meta = {'whiteKeys': 29, 'blackKeys': len(blacks), 'mounts': {k: [list(map(float, v[0])), list(map(float, v[1]))] for k, v in MOUNTS.items()}}
    return parts, meta


SHARP_DEG = 40.0                    # the builder's split rule: an edge whose face normals differ by more than this is sharp
# A1 / C13: declared reasons for every hard (unbevelled) edge, by measurement label (fnmatch pattern, first match wins).
#   'casing'   : bevelled casing primitive; the reason covers its remaining sharp edges (contact or hidden faces)
#   'named'    : root's named sharp-detail allowance (m4-v03-design-correction-disposition.md, C13)
#   'screen'   : art-direction: only screen faces and paper have sharp edges
#   'unnamed'  : not in root's named list; reported for a root decision, no exemption assumed
SHARP_REASONS = [
    ('ctl.slab', 'casing', 'underside rests on the stand arms; ends hidden inside the cheeks; back-bottom edge hidden'),
    ('ctl.panel', 'casing', 'bottom edges rest on the slab; ends meet the cheek inner faces'),
    ('ctl.bays', 'casing', 'bottom edges rest on the slab; ends meet the cheeks and the keys; back meets the panel wall'),
    ('ctl.cheeks', 'casing', 'inner face meets the shell; bottom profile corners rest on the stand arms'),
    ('ctl.keys', 'named', 'other white-key edges and black-key edges (white-key front-top lips are bevelled, H1)'),
    ('ctl.knobs', 'named', 'knobs'),
    ('ctl.controls', 'named', 'panel pads and transport keys; ALSO pitch/mod wheels, wheel slots and display bezel, which root did not name'),
    ('ctl.indicators', 'screen', 'indicator and display glow faces'),
    ('module.display', 'screen', 'display glow face'),
    ('stand', 'named', 'stand pivot plates and teeth; ALSO tube, rubber-end and pivot-knob cylinder caps, which root did not name'),
    ('sustain.base', 'casing', 'underside rests on the rug'),
    ('sustain.plate', 'casing', 'underside perimeter, hidden below the plate'),
    ('sustain.hinge', 'named', 'pedal hinges'),
    ('sustain.cable', 'unnamed', 'cable end caps at the pedal and the jack'),
    ('stool', 'unnamed', 'post, collar, hub and rubber-foot cylinder caps; leg tube end caps'),
    ('throne', 'unnamed', 'post, lock, hub, collar and rubber-foot cylinder caps; leg and brace tube end caps'),
    ('rug', 'named', 'rug inner binding step'),
    ('rack.*', 'named', 'clamp caps and wing bolts; ALSO tube, rubber-end and stub cylinder caps, which root did not name'),
    ('pad.*.shell', 'named', 'pad-rim inner corners (outer top corner bevelled)'),
    ('pad.*.lugs', 'named', 'pad lugs'),
    ('pad.*.mount', 'named', 'mount blocks; ALSO the mount arm tube end caps, which root did not name'),
    ('pad.*.head', 'casing', 'none expected (thin mesh-head disc edge, 3 mm)'),
    ('cymbal.*', 'named', 'cymbal wing nuts; ALSO the rod, felt and tilter cylinder caps, which root did not name'),
    ('kick.tower', 'casing', 'bottom perimeter rests on the base frame'),
    ('kick.base', 'casing', 'bottom perimeter rests on the rug'),
    ('kick.hardware', 'unnamed', 'pedal base plate, footboard, heel block, posts, cam, beater and pad ring (pedal hinges/axle are named)'),
    ('hihat.base', 'casing', 'underside rests on the rug'),
    ('hihat.housing', 'casing', 'bottom perimeter rests on the base'),
    ('hihat.hardware', 'unnamed', 'footboard and heel rubber (the heel hinge is a named pedal hinge)'),
    ('module.case', 'casing', 'none expected (front and back perimeters bevelled; plan corners rounded)'),
    ('module.controls', 'unnamed', 'module knob and pad buttons'),
    ('module.mount', 'unnamed', 'holder plate and arm tube end caps'),
    ('module.snake', 'unnamed', 'snake end caps'),
    ('cable.*', 'unnamed', 'cable end caps at the jacks and the wall'),
    ('sticks', 'casing', 'none expected (lathed tips)'),
]


def sharp_reason(lab):
    import fnmatch
    for pat, status, why in SHARP_REASONS:
        if fnmatch.fnmatchcase(lab, pat):
            return status, why
    return 'undeclared', 'no reason declared'


def corner_normals(part, sharp_deg=SHARP_DEG, bevel_aware=True):
    """Authored per-corner normals {(face index, vertex index): unit normal} for one row (pure numpy).

    Corners are grouped into smooth fans exactly as the builder splits them (edges sharper than sharp_deg split).
    Unclassified faces (part.cls None: everything outside the N1 casing scope) get the corner-angle-weighted average
    of their fan, which is how Blender computes split normals by default, so those parts keep the v01 shading.
    In classified casing primitives (critique N1, root disposition N1, the art direction's weighted normals) a fan takes
    the angle-weighted average of only its highest-priority faces: 'planar' over 'round' over 'bevel:*'. So a planar
    panel keeps its own geometric normal at every vertex it shares with a bevel or round facet, a round surface keeps its
    own smooth field next to a bevel, and the turn happens across the bevel faces. The classes are authored with the
    geometry (prism, rrect, the pad lathe); they are never derived from normals. bevel_aware=False gives the builder's
    v01 default (all corners angle-weighted) for comparison."""
    V = np.asarray(part.v, float)
    F = [f for f, _ in part.f]
    nrm = []
    for f in F:
        P = V[list(f)]
        n = np.cross(P - P.mean(0), np.roll(P, -1, 0) - P.mean(0)).sum(0)   # Newell (2 x area x normal)
        a = float(np.linalg.norm(n))
        nrm.append(n / a if a > 0 else n)
    edges = {}
    for fi, f in enumerate(F):
        for i in range(len(f)):
            edges.setdefault((min(f[i], f[i - 1]), max(f[i], f[i - 1])), []).append(fi)
    cos_s = math.cos(math.radians(sharp_deg))
    smooth = {e: len(fs) == 2 and float(np.dot(nrm[fs[0]], nrm[fs[1]])) >= cos_s for e, fs in edges.items()}
    vert_edges = {}
    for e in edges:
        vert_edges.setdefault(e[0], []).append(e)
        vert_edges.setdefault(e[1], []).append(e)
    around = {}
    for fi, f in enumerate(F):
        for i, v in enumerate(f):
            a, b = V[f[i - 1]] - V[v], V[f[(i + 1) % len(f)]] - V[v]
            ang = math.acos(max(-1.0, min(1.0, float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))))))
            around.setdefault(v, []).append((fi, ang))
    rank = {'planar': 0, 'round': 1}
    cls = [None if c is None else rank.get(c, 2) for c in part.cls]
    out = {}
    for v, corners in around.items():
        parent = {fi: fi for fi, _ in corners}

        def root(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x
        for e in vert_edges[v]:
            if smooth[e]:
                fs = edges[e]
                parent[root(fs[0])] = root(fs[1])
        fans = {}
        for fi, ang in corners:
            fans.setdefault(root(fi), []).append((fi, ang))
        for members in fans.values():
            ranks = [cls[fi] for fi, _ in members if cls[fi] is not None]
            use = [(fi, ang) for fi, ang in members if cls[fi] == min(ranks)] if (bevel_aware and ranks) else members
            s_ = sum(nrm[fi] * ang for fi, ang in use)
            s_ = s_ / np.linalg.norm(s_)
            for fi, _ in members:
                out[(fi, v)] = tuple(float(c) for c in s_)
    return out


def ledger(parts):
    rows = {}
    for row, part in parts.items():
        s = 1 if part.casts else 0
        rows[row] = dict(assetId=part.asset, material=part.mat, placed=part.tris, ceiling=part.ceiling, main=1, shadow=s, refresh=1 + s,
                         refreshTriangles=part.tris * (1 + s))
    tot = dict(main=sum(r['main'] for r in rows.values()), casters=sum(r['shadow'] for r in rows.values()),
               refresh=sum(r['refresh'] for r in rows.values()), placed=sum(r['placed'] for r in rows.values()),
               refreshTriangles=sum(r['refreshTriangles'] for r in rows.values()))
    assert tot['main'] <= STAGE_LIMITS['main'] and tot['refresh'] <= STAGE_LIMITS['refresh'] and tot['placed'] <= STAGE_LIMITS['placed'], tot
    return rows, tot


if __name__ == '__main__':
    parts, meta = build_all()
    rows, tot = ledger(parts)
    for k, v in rows.items():
        print(f'{k:28s} {v["placed"]:5d} / {v["ceiling"]:5d}')
    print(tot, meta['whiteKeys'], meta['blackKeys'])
