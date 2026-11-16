"""Studio v2 full kit, stage M4 music equipment, v04 CPU preparation: pure geometry helper (no bpy).

Owner: actual-Claude author, task_23314c669e03 (v04 restart). Root release: scene-coordination/m4-v04-combined-repair-disposition.md
(msg_43aafdbe37c4); ownership boundary scene-coordination/m4-v04-internal-contract.md. New v04 namespace: started as a byte
copy of the frozen v03 helper build_fullkit_m4_geometry_v03.py (3b220b1d...), which stays unchanged. Imported by the held
builder build_fullkit_m4_v04.py and by Codex's v04 measurement/producer modules (plain CPython). It writes nothing and
imports only math, fnmatch and numpy.

v04 changes against v03 (scene-m4-v04-preparation-report.md has the reasons and the quick author checks):
  K1  kick(): each anti-creep spur ends in its own flat-bottomed dark rubber foot resting on the rug field (0.3 mm gap),
      the spur arm's tip buried in the foot and its root moved 6 mm inside the base frame side face (the 45-degree root
      disc no longer straddles the face); the pedal base plate is widened (half-width 0.045 -> 0.068) and lengthened at
      the heel (hy - 0.02 -> hy - 0.04) so the spring, both posts and the heel block stand flush and fully on it; the kick
      pad ring's outer front corner carries the shared 'casing' bevel (and N1 classes, like the rack pad rims).
  N1  every prism band face made from a run of consecutive round plan edges (rrect arcs, the cheek top chain) carries a
      round-run id (Part.runs). smooth_edges() keeps an edge between two faces of one run smooth whatever its angle; it is
      the single smoothing rule used by corner_normals() and by the held builder's edge marking. Genuine hard edges
      (profile corners, contact perimeters, flat panels) keep the 40-degree split.
  A1  measurement labels are split by kind of part and every hard edge belongs to exactly one EDGE_SETS entry (one status,
      one reason), matched by label, edge kind (edge_records(): cap / along / ring / block / open, from the authored face
      roles in Part.roles) and band; named, granted, contact, screen, faceted-round and proposed sets are separate;
      convex >= 80, convex 40-80 and concave edges are tallied separately (edge_tally(), with the bevel figure named as
      middle-seam length). SHARP_REASONS / sharp_reason() are retired.
  P1  build_all(pose=None): an explicit {cx, cy, yaw} controller pose, restored before returning; POSE_OPTIONS is the
      author's explicit bounded table, SELECTED_POSE the author's current choice.
  D   author_declaration(): semantic group ids, N1 scope/classes, receiving surface, supports, K1 attachment pairs, the
      four I1 indicator-strip seatings, round runs, edge sets and the pose table, serialised byte-exactly by
      `python -B build_fullkit_m4_geometry_v04.py --declaration > ../manifests/m4-v04-author-declarations.json`.
  No other geometry, placement, material, row, caster or triangle-ceiling change.

v03 changes against v01, all carried unchanged into v04 except where the v04 list above says otherwise:
  C1  controller envelope height 0.095: rear panel 0.080/0.092 -> 0.071/0.083, cheek rear profile point 0.099 -> 0.095
  C2  stand own height 0.68 (zb 0.573 -> 0.6889), controller placement and stool contact: see CTL / STOOL below
  C3  rack frame own height 0.75 (top 0.80 -> 0.7586); module stub and ride boom clamps 0.57
  C4  rack frame outer width 1.16 (uprights 0.82/1.98 -> 0.841/1.959); clamp wing bolts re-pointed; tom3 x 1.785
  C5  snare radius 0.16 -> 0.147
  C6/C7 crash and ride radius 0.20 -> 0.19; the ride stays at x 1.98 (root S3: rack target is frame + clamps, booms separate)
  C8/C9 hi-hat pedal w 0.11 -> 0.114, l 0.30 -> 0.33 (base footprint 0.130 x 0.330)
  C10 module case face height 0.13 -> 0.15
  C11 rug 1.655 x 2.25 at x 0.56..2.215, y -1.36..0.89 (root conditional allowance); rack back foot 0.78 -> 0.715 so its
      rubber end sits 155 mm inside the rug's back edge. v04 wording (root): the 150 mm rug margin beyond the outermost
      rack foot is required LEFT and RIGHT; the shortened back foot is accepted at source level under its image gate.
      Actual rug clearances: 20 mm to the lamp base, 70 mm to the desk-frame floor runner, 10 mm to the retained
      under-desk contact decal (the further 50 mm is width given up inside the 70 mm frame separation, not a decal gap).
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
import fnmatch
import math
import numpy as np

EPS = 0.0003                      # resting gap, as M2/M3
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
        self.roles = []                   # v04, per face: 'cap', 'b<k>' (side face of band / strip / segment k) or 'blk' (block face)
        self.runs = []                    # v04, per face: None or a continuous round-run id (unique in the row)
        self.ids = []                     # v04, per group: stable author identity, unique in the row ('<label>' or '<label>#<k>')

    def add(self, verts, faces, uv, cls=None, roles=None, runs=None):
        """roles/runs: one entry per face (authored by the primitive, never derived from positions or normals)."""
        base, f0 = len(self.v), len(self.f)
        self.v.extend(verts)
        for k, face in enumerate(faces):
            rule = uv[k] if isinstance(uv, (list, tuple)) else uv
            self.f.append((tuple(base + i for i in face), rule))
            self.cls.append(cls[k] if isinstance(cls, (list, tuple)) else cls)
            self.roles.append(roles[k] if roles is not None else 'blk')
        gi = len(self.groups)
        self.runs.extend(None if runs is None or runs[k] is None else f'g{gi}.{runs[k]}' for k in range(len(faces)))
        self.groups.append((_LABEL[0], base, len(self.v), f0, len(self.f)))
        n_same = sum(1 for g in self.groups if g[0] == _LABEL[0])
        self.ids.append(f'{_LABEL[0]}#{n_same - 1}')

    def finish(self):
        """Group ids: a label used by one primitive keeps the bare label; repeated labels are numbered in authoring order."""
        count = {}
        for g in self.groups:
            count[g[0]] = count.get(g[0], 0) + 1
        self.ids = [g[0] if count[g[0]] == 1 else i for g, i in zip(self.groups, self.ids)]
        assert len(set(self.ids)) == len(self.ids), self.row
        assert len(self.roles) == len(self.runs) == len(self.cls) == len(self.f)

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
    p.add(verts, faces, [cu, cu] + [uv] * n, roles=['cap', 'cap'] + ['b0'] * n)


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
    roles, runs = ['cap', 'cap'], [None, None]
    rnd = {i for i in rounds if i not in facets}

    def run_start(i):                                              # v04 N1: first edge of the consecutive round run holding i
        j = i
        for _ in range(n):
            if (j - 1) % n not in rnd:
                return j
            j = (j - 1) % n
        return min(rnd)                                            # a closed all-round loop is one run
    for k in range(len(rings) - 1):
        for i in range(n):
            faces.append((k * n + i, k * n + (i + 1) % n, (k + 1) * n + (i + 1) % n, (k + 1) * n + i))
            rules.append(edge_rule(i))
            c = f'bevel:{kind}' if (k in bands or i in facets) else ('round' if i in rounds else 'planar')
            cls.append(c)
            roles.append(f'b{k}')
            runs.append(f'b{k}.r{run_start(i)}' if c == 'round' else None)
    p.add(verts, faces, rules, cls, roles, runs)


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
    verts, faces, rules, idx, roles = [], [], [], [], []
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
        roles += [f'b{k}'] * n                                     # v04: strip k of the revolved profile
    if cap_start:
        faces.append(tuple(reversed(idx[0]))); rules.append(cap_start); roles.append('cap')
    if cap_end:
        faces.append(tuple(idx[-1])); rules.append(cap_end); roles.append('cap')
    p.add(verts, faces, rules, roles=roles)


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
    faces, roles = [], []
    for i in range(len(rings) - 1):
        a, c = i * sides, (i + 1) * sides
        faces += [(a + k, a + (k + 1) % sides, c + (k + 1) % sides, c + k) for k in range(sides)]
        roles += [f'b{i}'] * sides                                 # v04: segment i of the polyline tube
    if caps:
        faces += [tuple(reversed(range(sides))), tuple(range((len(rings) - 1) * sides, len(rings) * sides))]
        roles += ['cap', 'cap']
    p.add(verts, faces, uv, roles=roles)


def sag(a, b, drop, k=3):
    """Points on a sagging span between a and b (parabola, `drop` metres at mid), k interior points."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    return [tuple(a + (b - a) * t - np.array([0, 0, drop * 4 * t * (1 - t)])) for t in [i / (k + 1) for i in range(1, k + 1)]]


# ------------------------------------------------------------------ placements (Blender metres)
# v04 P1: the author's explicit bounded pose table (root ranges: cx 1.325-1.40, cy -0.825 or -0.80, yaw -0.95 to -0.85 rad;
# at most 24 = 4 x 2 x 3, the v03 pose included as reference P00). Codex compares exactly these; the author selects.
POSE_X, POSE_Y, POSE_YAW = (1.325, 1.35, 1.375, 1.40), (-0.825, -0.80), (-0.85, -0.90, -0.95)
POSE_OPTIONS = [dict(id=f'P{n:02d}', cx=x, cy=y, yaw=w) for n, (x, y, w) in
                enumerate((x, y, w) for x in POSE_X for y in POSE_Y for w in POSE_YAW)]
assert len(POSE_OPTIONS) == 24 and POSE_OPTIONS[0] == dict(id='P00', cx=1.325, cy=-0.825, yaw=-0.85)
SELECTED_POSE = dict(cx=1.375, cy=-0.825, yaw=-0.95)   # v04 author selection P14, from the single Codex coarse comparison
SELECTED_POSE_STATUS = ('selected P14 by the author from manifests/m4-v04-pose-comparison.json (fc4af9e7...): throne-top uniform '
                        'area 292/384 (0.760; P00 0.638), actual-hit azimuth envelope 30.70 deg, sustain 116/116, targets '
                        '243/243, 29/29 key tops, support clearance min 33.9 mm, music-320 key pitch 9.05 px. Alternatives '
                        'kept: P08 if the captured azimuth fails AZ1, P13 if yaw -0.95 reads too turned. Image gates T1 and '
                        'AZ1 decide; not image approval')
CTL = dict(SELECTED_POSE, zb=0.6889, w=0.99, d=0.32, h=0.095)    # v03 C2: stand own height 0.68 (zb); v01: 1.2, -0.8, -0.6, zb 0.573
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
# v04 K1: spur arm (v03 rod) ending inside a flat-bottomed foot whose underside rests on the rug field; the arm's tip disc
# (r 7 mm) lies wholly inside the foot (r 8.5 mm, 22 mm tall). The arm leaves the base frame at 45 degrees in plan, so its
# root disc would straddle the frame's side face (half of it up to 4.9 mm proud, a visible wedge gap): the root is moved
# root_in = 6 mm inside the face so the whole root disc is buried in the frame. The foot is dark rubber (granted
# round-member ends: no free bright-metal end wider than 12 mm).
SPUR = dict(arm_r=0.007, arm_root_z=0.022, arm_tip_z=0.014, foot_r=0.0085, pad_h=0.006, foot_h=0.022, root_in=0.006)
# v04 K1: pedal base plate half-width 0.045 -> 0.068 (posts at +/-0.045 r 8 mm and the spring at +0.058 r 6 mm stand fully on
# it, 4 mm inside its edge) and heel extension 0.02 -> 0.04 (the heel block, y from heel_y - 0.04, no longer overhangs it).
PEDAL_PLATE = dict(hw=0.068, heel=0.04, t=0.006)
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
            back_top = (-prof[2][1], prof[2][0])                # the 90-degree back-top corner across the cheek thickness
            nose = (-prof[-1][1], prof[-1][0])                  # v04 root decision 3: the 51-degree cheek nose (top run meets the flat front)
            interior = {(-z, y) for y, z in prof[3:-1]}         # the sloped top's interior profile points
            pts = bevel_corners(pts, 'casing', which={pts.index(back_top), pts.index(nose)})
            # v04 declared round run (explicit, not old top_chain membership): the whole sloped top between the back-top bevel
            # and the nose bevel, i.e. every non-facet edge touching an interior top point (4 edges: the 140 mm rear segment,
            # two middle segments and the shortened front segment). The v01 intent was one smooth curved top.
            rounds = {i for i in range(len(pts)) if i not in pts.facets and (pts[i] in interior or pts[(i + 1) % len(pts)] in interior)}
            assert len(rounds) == 4, rounds
            prism(shell, pts, 0.0, x_b - x_a, 'oak_tone', M, top='casing' if s > 0 else None, bottom='casing' if s < 0 else None,
                  round_edges=rounds)
    # pitch and mod wheels in black slots on the wheel bay (v04: one label per kind of part)
    for wx in (-0.452, -0.424):
        _LABEL[0] = 'ctl.wheel_slot'
        box(shell, (wx - 0.009, -0.120, KEY['top'] - 0.001), (wx + 0.009, -0.050, KEY['top'] + 0.0012), 'black', MC)
        _LABEL[0] = 'ctl.wheel'
        cyl(shell, MC @ T(wx, -0.085, KEY['top'] - 0.008) @ Ry(math.pi / 2), 0.021, -0.006, 0.006, 16, 'rubber')
    # panel helpers: a frame lying on the sloped panel top at (x, y)
    slope = math.atan2(z_back - z_front, p1 - p0)

    def on_panel(x, y, dz=0.0):
        z = z_front + (y - p0) * math.tan(slope)
        return MC @ T(x, y, z + dz) @ Rx(slope)

    # eight pads, 2 x 4
    _LABEL[0] = 'ctl.pad'
    for i in range(4):
        for j, y in enumerate((0.062, 0.112)):
            x = -0.440 + 0.046 * i
            extrude(shell, rrect(0.038, 0.038, 0.006, 2), -0.002, 0.0055, 'fabric', on_panel(x, y))
    # eight knobs in a row, display bezel, four transport keys
    _LABEL[0] = 'ctl.knob'
    for i in range(8):
        cyl(shell, on_panel(-0.215 + 0.036 * i, 0.100), 0.0115, -0.002, 0.016, 16, 'black')
    _LABEL[0] = 'ctl.bezel'
    box(shell, (-0.06, -0.026, -0.002), (0.06, 0.026, 0.0025), 'black', on_panel(0.215, 0.090))
    _LABEL[0] = 'ctl.transport_key'
    for i in range(4):
        box(shell, (-0.014, -0.010, -0.002), (0.014, 0.010, 0.006), 'fabric', on_panel(0.320 + 0.034 * i, 0.100))
    # indicators (lib_glow): display face resting on the bezel (EPS gap) plus four pad-column strips. v04 I1 declaration:
    # each strip is seated 1.0 mm into ctl.panel and stands 2.5 mm proud of it (an inlay; root accepted this exact scope).
    glow_rule = 'glow'
    _LABEL[0] = 'ctl.display_face'
    box(glow, (-0.052, -0.019, 0.0025 + EPS), (0.052, 0.019, 0.0040), glow_rule, on_panel(0.215, 0.090))
    _LABEL[0] = 'ctl.indicator_strip'
    for i in range(4):
        box(glow, (-0.015, -0.0025, -0.001), (0.015, 0.0025, 0.0025), glow_rule, on_panel(-0.440 + 0.046 * i, 0.030))
    # keys: 29 white (front block + stem), 20 black (tapered); C to C, gaps show the black bed
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
        _LABEL[0] = 'ctl.white_front'
        prism(keys, front, x0, x1, 'ivory', yz_to_x(MC))                                           # front block, v03 H1 front-top lip
        s0 = max([x0] + [b + KEY['bw'] / 2 + g / 2 for b in blacks if x0 - P / 2 < b < x0 + g])
        s1 = min([x1] + [b - KEY['bw'] / 2 - g / 2 for b in blacks if x1 - g < b < x1 + P / 2])
        _LABEL[0] = 'ctl.white_stem'
        box(keys, (s0, by0 - 0.0027, bz0), (s1, KEY['yb'], KEY['top']), 'ivory', MC)                 # stem
    _LABEL[0] = 'ctl.black_key'
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
    arm_r, tube_r = 0.013, 0.012
    arm_z = CTL['zb'] - EPS - arm_r
    foot_z = ON_RUG + 0.013
    for s in (-1, 1):
        x = 0.30 * s
        _LABEL[0] = 'stand.arm'
        sweep(p, [apply(MCF, (x, -0.17, arm_z)), apply(MCF, (x, 0.17, arm_z))], arm_r, 8, 'black_metal', up=(0, 0, 1))
        _LABEL[0] = 'stand.arm_end'
        for y0, y1 in ((-0.19, -0.17), (0.17, 0.19)):
            rod(p, apply(MCF, (x, y0, arm_z)), apply(MCF, (x, y1, arm_z)), arm_r, 12, 'rubber')
        _LABEL[0] = 'stand.foot'
        sweep(p, [apply(MCF, (x * 1.033, -0.16, foot_z)), apply(MCF, (x * 1.033, 0.16, foot_z))], 0.013, 8, 'black_metal', up=(0, 0, 1))
        _LABEL[0] = 'stand.foot_end'
        for y0, y1 in ((-0.182, -0.16), (0.16, 0.182)):
            rod(p, apply(MCF, (x * 1.033, y0, foot_z)), apply(MCF, (x * 1.033, y1, foot_z)), 0.013, 12, 'rubber')
    for yf in (-0.055, 0.055):                               # two X frames (double braced)
        _LABEL[0] = 'stand.tube'
        for s in (-1, 1):
            a = apply(MCF, (-0.31 * s, yf, foot_z + 0.004))
            b = apply(MCF, (0.30 * s, yf, arm_z))
            sweep(p, [a, b], tube_r, 8, 'black_metal', phase=math.pi / 8)
        mid_z = (foot_z + arm_z) / 2
        _LABEL[0] = 'stand.pivot_plate'
        box(p, (-0.03, yf - 0.009, mid_z - 0.04), (0.03, yf + 0.009, mid_z + 0.04), 'black_metal', MCF)       # pivot plate
        _LABEL[0] = 'stand.tooth'
        for t in range(3):                                                                                     # height teeth
            box(p, (0.032 + 0.012 * t, yf - 0.006, mid_z - 0.05 + 0.012 * t), (0.040 + 0.012 * t, yf + 0.006, mid_z - 0.04 + 0.012 * t), 'metal', MCF)
    mid_z = (foot_z + arm_z) / 2
    _LABEL[0] = 'stand.pivot_bolt'
    rod(p, apply(MCF, (0, -0.066, mid_z)), apply(MCF, (0, 0.066, mid_z)), 0.006, 12, 'metal')                 # pivot bolt
    _LABEL[0] = 'stand.knob'
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
    (cx, cy), feet = stool_feet()
    support = {s for _, _, s in feet}
    if len(support) != 1 or 'binding' in support:
        # v01 left one foot 8.3 mm above the floor beyond the rug edge; v03 refuses any mixed or binding support
        raise ValueError('stool feet need one support surface (all on the rug inner top or all on the floor): ' +
                         ', '.join(f'({x:.3f}, {y:.3f}) {s}' for (x, y), _, s in feet))
    base = ON_RUG if support == {'rug'} else ON_FLOOR
    seat, R = STOOL['seat'], STOOL['r']
    M = T(cx, cy, 0)
    _LABEL[0] = 'stool.seat'
    lathe(p, M, [(0, seat - 0.060), (R - 0.012, seat - 0.060), (R, seat - 0.046), (R, seat - 0.014), (R - 0.016, seat), (0, seat)],
          24, ['black', 'fabric', 'fabric', 'fabric', 'fabric'])
    hub_z = 0.10
    _LABEL[0] = 'stool.column'
    cyl(p, M, 0.020, hub_z + 0.02, seat - 0.060, 12, 'metal')                                 # post
    cyl(p, M, 0.028, seat - 0.110, seat - 0.075, 12, 'black')                                 # height collar
    cyl(p, M, 0.032, hub_z - 0.025, hub_z + 0.025, 12, 'black_metal')                         # hub
    for (fx, fy), d, _ in feet:
        foot = np.array([fx, fy, base + 0.012])
        _LABEL[0] = 'stool.leg'
        sweep(p, [np.array([cx, cy, hub_z]) + d * 0.025, foot + np.array([0, 0, 0.010])], 0.011, 6, 'black_metal')
        _LABEL[0] = 'stool.foot'
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
    roles = []
    for k in range(len(rings) - 1):
        faces += [(k * n + i, k * n + (i + 1) % n, (k + 1) * n + (i + 1) % n, (k + 1) * n + i) for i in range(n)]
        roles += [f'b{k}'] * n
    faces += [tuple(reversed(range(n))), tuple(range(4 * n, 5 * n))]   # v04 note: face 4n is the underside, 4n + 1 the inner field
    p.add(verts, faces, 'weave', roles=roles + ['cap', 'cap'])
    return p


# ------------------------------------------------------------------ drum rack, booms, mounts
def clamp(p, centre, axis, hint=(1, 0, 0)):
    """Clamp block round a tube (same leaf as the tube) with a wing bolt; 68 triangles."""
    M = frame(centre, axis, hint)
    prev = _LABEL[0]
    _LABEL[0] = 'rack.clamp_body'
    extrude(p, [(0.026, -0.010), (0.026, 0.010), (0.010, 0.026), (-0.010, 0.026), (-0.026, 0.010), (-0.026, -0.010), (-0.010, -0.026), (0.010, -0.026)],
            -0.024, 0.024, 'black', M)
    _LABEL[0] = 'rack.clamp_bolt'
    cyl(p, M @ T(0.026, 0, 0) @ Ry(math.pi / 2), 0.005, 0.0, 0.016, 8, 'metal')
    _LABEL[0] = 'rack.clamp_wing'
    box(p, (0.040, -0.016, -0.004), (0.046, 0.016, 0.004), 'black', M)
    _LABEL[0] = prev


MOUNTS = {}   # name: (stub end point S, unit direction) shared by the rack (stub ends at S) and the mounted part (starts at S + EPS*dir)


def rack():
    p = Part('drum_rack__rack')
    R = RACK['r']
    zf = ON_RUG + 0.012                                     # foot tube axis
    for x in (UPRIGHT_L, UPRIGHT_R):
        _LABEL[0] = 'rack.upright'
        rod(p, (x, RACK_Y, zf), (x, RACK_Y, RACK['top']), R, 16, 'metal')                                    # upright
        _LABEL[0] = 'rack.foot'
        rod(p, (x, RACK['foot_y'][0], zf), (x, RACK['foot_y'][1], zf), 0.012, 12, 'metal', hint=(1, 0, 0))   # foot
        _LABEL[0] = 'rack.foot_end'
        for y0, y1 in ((RACK['foot_y'][0] - 0.02, RACK['foot_y'][0]), (RACK['foot_y'][1], RACK['foot_y'][1] + 0.02)):
            rod(p, (x, y0, zf), (x, y1, zf), 0.012, 12, 'rubber', hint=(1, 0, 0))
        clamp(p, (x, RACK_Y, zf + 0.028), (0, 0, 1), hint=(0, 1, 0))
        _LABEL[0] = 'rack.side_bar'
        rod(p, (x, RACK_Y, RACK['side']), (x, RACK['side_y'], RACK['side']), R, 16, 'metal', hint=(1, 0, 0))   # side bar
        _LABEL[0] = 'rack.side_end'
        rod(p, (x, RACK['side_y'] - 0.012, RACK['side']), (x, RACK['side_y'], RACK['side']), R, 16, 'rubber', hint=(1, 0, 0))
        clamp(p, (x, RACK_Y, RACK['side']), (0, 0, 1), hint=(0, 1, 0))
        clamp(p, (x, RACK_Y, RACK['bar']), (0, 0, 1), hint=(0, 1, 0))
    _LABEL[0] = 'rack.crossbar'
    rod(p, (UPRIGHT_L, RACK_Y, RACK['bar']), (UPRIGHT_R, RACK_Y, RACK['bar']), R, 16, 'metal', hint=(0, 0, 1))   # crossbar

    def stub(name, centre, tube_axis, out, length=0.045, r=0.010, hint=None):
        out = unit(out)
        clamp(p, centre, tube_axis, hint=-out if hint is None else hint)   # wing bolt on the far side from the stub, or `hint`
        S = np.asarray(centre, float) + out * length
        _LABEL[0] = 'rack.stub'
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
        _LABEL[0] = 'rack.boom'
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
        _LABEL[0] = f'pad.{name}.lug'
        for k in range(6 if name == 'snare' else 4):                                   # lugs
            a = 2 * math.pi * (k + 0.5) / (6 if name == 'snare' else 4)
            box(sh, (r - 0.002, -0.009, z0 + 0.018), (r + 0.010, 0.009, z0 + 0.044), 'metal', M @ Rz(a))
        # mount: block under the shell, arm to the rack stub
        _LABEL[0] = f'pad.{name}.block'
        mount = M @ T(0, 0, z0)
        box(sh, (-0.024, -0.024, -0.020), (0.024, 0.024, 0.0005), 'black_metal', mount)
        S, out, rr = MOUNTS[name]
        a0 = S + out * EPS
        tip = np.asarray(apply(mount, (0, 0, -0.012)))
        mid = a0 + out * 0.03
        _LABEL[0] = f'pad.{name}.arm'
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
        M = tilt_toward(np.asarray(c, float), PLAYER, tilt)
        prof = [(0, 0.030), (0.020, 0.029), (0.042, 0.022), (0.056, 0.008), (0.120, 0.002), (R - 0.022, -0.004), (R - 0.004, -0.002),
                (R, -0.010), (R - 0.022, -0.013), (0.120, -0.007), (0.052, 0.000), (0, 0.006)]
        _LABEL[0] = f'cymbal.{name}.disc'
        lathe(p, M, prof, 24, ['fabric', 'fabric', 'fabric', 'black_metal', 'black_metal', 'fabric', 'fabric', 'fabric', 'black_metal',
                               'black_metal', 'black_metal'])
        _LABEL[0] = f'cymbal.{name}.rod'
        cyl(p, M, 0.006, -CYM_UNDER - TILTER + EPS, 0.050, 8, 'metal')                  # rod through the bell
        _LABEL[0] = f'cymbal.{name}.felt'
        cyl(p, M, 0.014, -CYM_UNDER - 0.012, -0.0005, 8, 'rubber')                      # under felt / sleeve stop
        _LABEL[0] = f'cymbal.{name}.nut'
        cyl(p, M, 0.012, 0.030, 0.042, 8, 'black')                                     # wing nut body
        box(p, (-0.026, -0.004, 0.031), (0.026, 0.004, 0.047), 'black', M)             # wings
        _LABEL[0] = f'cymbal.{name}.tilter'
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
    for sx, side in ((-1, 'L'), (1, 'R')):                                                                      # spurs (v04 K1)
        tip = np.array([k['cx'] + sx * (k['tw'] / 2 + 0.07), y1 + 0.05, ON_RUG + SPUR['arm_tip_z']])
        _LABEL[0] = f'kick.spur_arm.{side}'                                                                     # root seated in the base frame
        rod(p, (k['cx'] + sx * (k['tw'] / 2 + 0.02 - SPUR['root_in']), y1, ON_RUG + SPUR['arm_root_z']), tip, SPUR['arm_r'], 8, 'metal')
        _LABEL[0] = f'kick.spur_foot.{side}'                                                                    # flat-bottomed dark foot on the rug field
        lathe(p, T(tip[0], tip[1], ON_RUG), [(SPUR['foot_r'], 0.0), (SPUR['foot_r'], SPUR['pad_h']), (SPUR['foot_r'], SPUR['foot_h'])], 8,
              ['rubber', 'rubber'], cap_start='rubber', cap_end='rubber')
    padM = frame(np.array([k['cx'], y0, ON_RUG + k['pad_z']]), (0, -1, 0), hint=(1, 0, 0))
    _LABEL[0] = 'kick.head'
    cyl(p, padM, k['pad_r'], -0.002, 0.012, 24, 'fabric')                                                       # fabric head
    _LABEL[0] = 'kick.pad_ring'                                                                                 # v04: outer front corner bevelled ('casing')
    b, ro = bev('casing'), k['pad_r'] + 0.010
    lathe(p, padM, [(k['pad_r'] + 0.002, -0.002), (ro, 0.004), (ro, 0.016 - b), (ro - K_BEV * b, 0.016 - K_BEV * b), (ro - b, 0.016),
                    (k['pad_r'] - 0.004, 0.016)], 24, 'black')
    ring_cls = ['round', 'round', 'bevel:casing', 'bevel:casing', 'planar']                                     # back cone, outer wall, bevel, front annulus
    p.cls[-24 * len(ring_cls):] = [c for c in ring_cls for _ in range(24)]
    # pedal: base plate, footboard, heel, posts, axle, cam, chain, beater, spring
    hy, ty = k['heel_y'], k['toe_y']
    _LABEL[0] = 'kick.pedal_plate'                                                                              # v04: carries posts, spring and heel block
    box(p, (k['cx'] - PEDAL_PLATE['hw'], hy - PEDAL_PLATE['heel'], ON_RUG), (k['cx'] + PEDAL_PLATE['hw'], ty + 0.03, ON_RUG + PEDAL_PLATE['t']), 'black')
    rise = math.atan2(0.05, ty - hy)
    fb = T(k['cx'], hy, ON_RUG + 0.022) @ Rx(rise)
    _LABEL[0] = 'kick.footboard'
    extrude(p, rrect(0.075, (ty - hy) / math.cos(rise), 0.012, 2), 0.0, 0.008, 'black_metal', fb @ T(0, (ty - hy) / math.cos(rise) / 2, 0))
    _LABEL[0] = 'kick.heel'
    box(p, (k['cx'] - 0.038, hy - 0.04, ON_RUG + 0.006), (k['cx'] + 0.038, hy + 0.02, ON_RUG + 0.026), 'rubber')
    post_y = ty + 0.012
    _LABEL[0] = 'kick.post'
    for sx in (-1, 1):
        rod(p, (k['cx'] + sx * 0.045, post_y, ON_RUG + 0.006), (k['cx'] + sx * 0.045, post_y, ON_RUG + 0.16), 0.008, 8, 'black_metal')
    _LABEL[0] = 'kick.axle'
    rod(p, (k['cx'] - 0.053, post_y, ON_RUG + 0.15), (k['cx'] + 0.053, post_y, ON_RUG + 0.15), 0.005, 8, 'metal')       # axle
    _LABEL[0] = 'kick.cam'
    cyl(p, frame(np.array([k['cx'], post_y, ON_RUG + 0.15]), (1, 0, 0), (0, 1, 0)), 0.022, -0.012, 0.012, 12, 'black_metal')  # cam
    toe = np.array([k['cx'], ty - 0.01, ON_RUG + 0.022 + 0.05 + 0.008])
    _LABEL[0] = 'kick.chain'
    sweep(p, [toe, toe + np.array([0, 0.012, 0.05]), np.array([k['cx'], post_y - 0.02, ON_RUG + 0.135])], 0.004, 6, 'metal')   # chain
    beater_top = np.array([k['cx'], y0 - 0.032, ON_RUG + k['pad_z']])
    _LABEL[0] = 'kick.shaft'
    rod(p, (k['cx'], post_y - 0.005, ON_RUG + 0.15), beater_top, 0.004, 8, 'metal')                             # shaft
    _LABEL[0] = 'kick.beater'
    lathe(p, frame(beater_top, (0, 1, 0)), [(0, -0.018), (0.016, -0.016), (0.022, -0.006), (0.022, 0.010), (0.016, 0.018), (0, 0.020)],
          12, 'cream')                                                                                         # beater head
    _LABEL[0] = 'kick.spring'
    rod(p, (k['cx'] + 0.058, post_y, ON_RUG + PEDAL_PLATE['t']), (k['cx'] + 0.058, post_y, ON_RUG + 0.12), 0.006, 8, 'metal')   # spring
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
    rise = math.atan2(0.050, h['l'] - 0.10)
    fb = M @ T(0, -h['l'] / 2 + 0.03, 0.022) @ Rx(rise)
    _LABEL[0] = 'hihat.footboard'
    extrude(p, rrect(h['w'] - 0.01, (h['l'] - 0.10) / math.cos(rise), 0.012, 3), 0.0, 0.008, 'black_metal', fb @ T(0, (h['l'] - 0.10) / math.cos(rise) / 2, 0))
    _LABEL[0] = 'hihat.hinge'
    rod(p, apply(M, (-0.045, -h['l'] / 2 + 0.03, 0.022)), apply(M, (0.045, -h['l'] / 2 + 0.03, 0.022)), 0.009, 12, 'black_metal')  # heel hinge
    _LABEL[0] = 'hihat.heel'
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
    _LABEL[0] = 'module.knob'
    cyl(body, M @ T(0.060, 0.022, m['d'] / 2), 0.016, -0.002, 0.014, 16, 'metal')                       # volume knob
    _LABEL[0] = 'module.button'
    for i in range(6):
        box(body, (-0.070 + 0.022 * i, -0.040, m['d'] / 2 - 0.002), (-0.056 + 0.022 * i, -0.028, m['d'] / 2 + 0.004), 'fabric', M)
    # holder plate on the back, arm to the rack stub
    _LABEL[0] = 'module.plate'
    back = M @ T(0, 0, -m['d'] / 2)
    box(body, (-0.045, -0.035, -0.006), (0.045, 0.035, 0.0005), 'black_metal', back)
    S, out, rr = MOUNTS['module']
    tip = np.asarray(apply(back, (0, 0, -0.012)))
    _LABEL[0] = 'module.arm'
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
    t = THRONE
    M = T(t['cx'], t['cy'], 0)
    s, R = t['seat'], t['r']
    _LABEL[0] = 'throne.seat'
    lathe(p, M, [(0, s - 0.085), (R - 0.02, s - 0.085), (R, s - 0.060), (R, s - 0.020), (R - 0.03, s), (0, s + 0.002)], 24,
          ['black', 'fabric', 'fabric', 'fabric', 'fabric'])
    hub = 0.17
    _LABEL[0] = 'throne.column'
    cyl(p, M, 0.022, hub + 0.03, s - 0.085, 12, 'metal')                                # post
    cyl(p, M, 0.030, s - 0.15, s - 0.11, 12, 'black')                                   # memory lock
    cyl(p, M, 0.032, hub - 0.03, hub + 0.03, 12, 'black_metal')                         # hub
    for k in range(3):
        a = math.radians(270 + 120 * k)
        d = np.array([math.cos(a), math.sin(a), 0])
        foot = np.array([t['cx'], t['cy'], ON_RUG + 0.012]) + d * t['legs']
        top = np.array([t['cx'], t['cy'], hub]) + d * 0.028
        _LABEL[0] = 'throne.leg'
        sweep(p, [top, foot + np.array([0, 0, 0.012])], 0.012, 6, 'black_metal')
        mid = (top + foot) / 2
        _LABEL[0] = 'throne.brace'
        sweep(p, [np.array([t['cx'], t['cy'], hub - 0.08]) + d * 0.022, mid + np.array([0, 0, -0.01])], 0.008, 6, 'black_metal')   # brace
        _LABEL[0] = 'throne.foot'
        cyl(p, T(*foot) @ T(0, 0, -0.012), 0.018, 0.0, 0.016, 10, 'rubber')
    _LABEL[0] = 'throne.column'
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


def _restore(saved):
    CTL.update(saved)
    globals()['MC'] = T(CTL['cx'], CTL['cy'], CTL['zb']) @ Rz(CTL['yaw'])
    globals()['MCF'] = T(CTL['cx'], CTL['cy'], 0.0) @ Rz(CTL['yaw'])


# ------------------------------------------------------------------ everything
def build_all(pose=None):
    """v04: build the 18 rows with the controller at `pose` ({'cx', 'cy', 'yaw'} exactly, Blender metres / radians) or, when
    None, at the author's SELECTED_POSE. Controller globals (CTL, MC, MCF) and MOUNTS are restored before returning, so
    repeated calls reproduce the same geometry whatever was built before."""
    use = dict(SELECTED_POSE) if pose is None else dict(pose)
    if set(use) != {'cx', 'cy', 'yaw'} or not all(isinstance(v, (int, float)) and math.isfinite(v) for v in use.values()):
        raise ValueError(f'pose must hold exactly finite cx, cy, yaw: {pose!r}')
    saved, saved_mounts = {k: CTL[k] for k in ('cx', 'cy', 'yaw')}, dict(MOUNTS)
    try:
        _restore({k: float(v) for k, v in use.items()})
        parts, meta = _build()
    finally:
        _restore(saved)
        MOUNTS.clear()
        MOUNTS.update(saved_mounts)
        _LABEL[0] = ''
    meta['pose'] = {k: float(v) for k, v in use.items()}
    return parts, meta


def _build():
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
        part.finish()
        assert part.tris <= part.ceiling, f'{row}: {part.tris} > {part.ceiling}'
    meta = {'whiteKeys': 29, 'blackKeys': len(blacks), 'mounts': {k: [list(map(float, v[0])), list(map(float, v[1]))] for k, v in MOUNTS.items()}}
    return parts, meta


SHARP_DEG = 40.0                    # the builder's split rule: an edge whose face normals differ by more than this is sharp
# v04 A1 / E1: edge sets. Every hard edge (smooth_edges() False) belongs to exactly one set: one status, one reason.
# Matching: first entry whose (label glob, kinds, bands[, rolePairs]) all match the edge (see edge_records() for kind, band
# and roles). rolePairs, when present, is a set of sorted face-role pairs: the edge's two face roles must be one of them.
# Statuses:
#   'named'          root C13 named sharp details (m4-v03-design-correction-disposition.md); knobs and pedal hinges read by
#                    kind of part for the module / stand knobs and pedal axle / heel-hinge ends (v04 disposition); and the
#                    three sets root accepted sharp by name in m4-v04-bounded-art-disposition.md decisions 5-7 (their
#                    'source' field says so; each is pinned to exact profile strips by rolePairs)
#   'granted'        one of root's four section-5d sets granted in m4-v04-combined-repair-disposition.md, exactly as
#                    enumerated in scene-m4-v03-focused-art-closure.md 5d (round-member ends, thin plates, small dark
#                    blocks, controller wheels), with that table's reasons and reconsider conditions
#   'contact'        hidden or contact edges: a reason, not an exception
#   'screen'         art direction: screen / glow faces may be sharp
#   'faceted-round'  lengthwise facet edges and bends of low-sided round members, and profile facets of curved lathed
#                    parts, declared with the side / profile count (art direction: 8-16 sides at this distance)
#   'proposed'       not covered by any root decision: reported for root, no exemption assumed
_ANY = ('cap', 'along', 'ring', 'block', 'open')
_B = ('convex>=80', 'convex40-80', 'concave', 'open')
_GR = 'scene-m4-v03-focused-art-closure.md 5d, granted by m4-v04-combined-repair-disposition.md'
_RME = 'a free bright-metal end wider than 12 mm reads as a cut-off stub'
_BD = 'm4-v04-bounded-art-disposition.md (7705f590...)'
EDGE_SETS = [
    # ---- controller shell: casing remainders (contact); v04 decision 3 bevelled the cheek nose (no proposed set remains)
    dict(id='ctl.slab.contact', status='contact', match=[('ctl.slab', _ANY, _B)],
         reason='slab ends hidden inside the cheeks; underside corners above the stand arms (never seen from the planned eyes); '
                'back-top corner covered by the panel. The exposed top-front edge is bevelled (casing)'),
    dict(id='ctl.panel.contact', status='contact', match=[('ctl.panel', _ANY, _B)],
         reason='bottom corners rest on the slab; ends meet the cheek inner faces. Front-top and back-top edges are bevelled'),
    dict(id='ctl.bays.contact', status='contact', match=[('ctl.bays', _ANY, _B)],
         reason='bottom corners rest on the slab; ends meet the cheeks and the outer keys; back meets the panel wall. Top-front bevelled'),
    dict(id='ctl.cheeks.contact', status='contact', match=[('ctl.cheeks', _ANY, _B)],
         reason='inner face perimeter meets the slab, panel and bays; bottom profile corners at the underside on the stand arms; '
                'and (v04 decision 4) the eight bevel-band mitre edges at the two unbevelled 90-degree underside corners of each '
                'cheek (4 at 75.5 and 4 at 41.4 degrees, all within 2.2 mm of the cheek underside, facing down onto the stand '
                'arms). Outer face perimeter, back-top corner and (v04 decision 3) the cheek nose are bevelled (casing); no '
                'exposed cheek edge is in this set (author_declaration asserts it)'),
    # ---- controller details
    dict(id='ctl.panel_pads', status='named', match=[('ctl.pad', _ANY, _B)], reason='panel pads (C13), incl. their 2-step plan corners'),
    dict(id='ctl.knobs', status='named', match=[('ctl.knob', _ANY, _B)], reason='knobs (C13)'),
    dict(id='ctl.transport_keys', status='named', match=[('ctl.transport_key', _ANY, _B)], reason='transport keys (C13)'),
    dict(id='granted.thin_plates', status='granted', source=_GR,
         match=[('ctl.wheel_slot', _ANY, _B), ('ctl.bezel', _ANY, _B), ('kick.pedal_plate', _ANY, _B), ('kick.footboard', _ANY, _B),
                ('hihat.footboard', _ANY, _B), ('module.plate', _ANY, _B)],
         reason='thin plates: kick pedal base plate (6 mm), kick and hi-hat footboards (8 mm, rounded in plan), module holder '
                'plate (6.5 mm), two wheel slots (2 mm), display bezel (9 mm). Under the 12 mm floor; black or black metal',
         reconsider='a footboard reads as a flat card'),
    dict(id='granted.controller_wheels', status='granted', source=_GR, match=[('ctl.wheel', _ANY, _B)],
         reason='two pitch/mod wheels, about 40 mm, dark rubber, recessed in slots', reconsider='the wheels do not read as wheels at music-1440'),
    dict(id='ctl.glow', status='screen', match=[('ctl.display_face', _ANY, _B), ('ctl.indicator_strip', _ANY, _B)],
         reason='lib_glow display face (rests on the bezel) and four pad-column indicator strips (I1 inlays: seated 1.0 mm into '
                'ctl.panel, 2.5 mm proud)'),
    dict(id='keys.white', status='named', match=[('ctl.white_front', _ANY, _B), ('ctl.white_stem', _ANY, _B)],
         reason='other white-key edges (C13); each white key front-top lip is bevelled (white_key_lip, H1)'),
    dict(id='keys.black', status='named', match=[('ctl.black_key', _ANY, _B)], reason='black-key edges (C13)'),
    # ---- stand, sustain pedal
    dict(id='stand.pivot', status='named', match=[('stand.pivot_plate', _ANY, _B), ('stand.tooth', _ANY, _B)],
         reason='stand pivot plates and teeth (C13)'),
    dict(id='stand.knob', status='named', match=[('stand.knob', _ANY, _B)], reason='knobs (C13): the stand pivot knob, read by kind of part (5a)'),
    dict(id='sustain.base.contact', status='contact', match=[('sustain.base', _ANY, _B)], reason='underside perimeter rests on the rug; top perimeter bevelled'),
    dict(id='sustain.plate.contact', status='contact', match=[('sustain.plate', _ANY, _B)], reason='underside perimeter hidden under the plate; top perimeter bevelled'),
    dict(id='pedal.hinges', status='named', match=[('sustain.hinge', _ANY, _B), ('hihat.hinge', _ANY, _B), ('kick.axle', ('cap',), _B)],
         reason='pedal hinges (C13): sustain hinge, hi-hat heel hinge ends, kick pedal axle ends (read by kind of part, 5a)'),
    # ---- rug
    dict(id='rug.inner_step', status='named', match=[('rug', ('ring',), ('convex>=80',)), ('rug', ('cap',), ('concave',))],
         reason="rug's inner binding step (C13): the 2.5 mm step from the binding top down to the field, both corners"),
    dict(id='rug.underside.contact', status='contact', match=[('rug', ('cap',), ('convex>=80',))], reason='underside perimeter on the floor'),
    dict(id='rug.binding_shoulder', status='named', source=_BD + ' decision 7',
         match=[('rug', ('ring',), ('convex40-80',), (('b0', 'b1'),))],
         reason='accepted sharp by name (decision 7): the outer binding shoulder at the foot of its one chamfer facet (62.3 '
                'degrees on the four straight runs, 61.5 at the twelve corner edges), 8.2 mm above the floor, on the current '
                'matte, already-chamfered 10.5 mm woven binding only. Rug size and position unchanged',
         reconsider='image gates RUG1 / E1b: the rug edge reads as a hard slab or shows a bright outline'),
    # ---- rack
    dict(id='rack.clamps', status='named', match=[('rack.clamp_body', _ANY, _B), ('rack.clamp_bolt', _ANY, _B), ('rack.clamp_wing', _ANY, _B)],
         reason='clamp caps and wing bolts (C13), incl. the octagonal clamp-block plan corners'),
    # ---- pads, heads
    dict(id='pad.rim_inner', status='named', match=[('pad.*.shell', ('ring',), ('convex>=80', 'concave'))],
         reason='pad-rim inner corners (C13): rim inner top corner and the inner corner under the rim step; outer top corner bevelled'),
    dict(id='pad.rim_skirt.contact', status='contact', match=[('pad.*.shell', ('open',), ('open',))],
         reason='open end of the rim inner skirt, 0.5 mm below the mesh head top and 0.6 mm outside its edge: hidden by the head'),
    dict(id='pad.rim_lower_outer', status='named', source=_BD + ' decision 6',
         match=[('pad.*.shell', ('ring',), ('convex40-80',), (('b4', 'b5'),))],
         reason='accepted sharp by name (decision 6): the bright-metal rim lower outer corner, 71.4 degrees, where the 8.9 mm rim '
                'wall meets the 6.3 mm step under it, on the four pads. The rim outer top corner stays bevelled. The obvious '
                'fallback (a casing bevel, about 384 triangles for four pads) does not fit the 2,600 row ceiling and is not '
                'authorised: an image failure goes back to root for a bounded profile / budget decision',
         reconsider='image gate E1b: the lower boundary of any rim shows a bright line, or the rim reads as a flat cut strip '
                    'beside its bevelled top'),
    dict(id='pad.shell_bottom.contact', status='contact', match=[('pad.*.shell', ('ring',), ('convex40-80',), (('b1', 'b2'),))],
         reason='hidden edge, not an exemption (decision 6): the black shell bottom corner, 52.8 degrees, 4 mm above the shell '
                'underside, where the visible black shell facet meets the shell bottom ring. That ring faces at least 63 degrees '
                'below horizontal at every authored tilt, and every planned eye is above every pad (pads 0.44-0.85 m)',
         reconsider='any planned eye drops below the pad bottoms'),
    dict(id='pad.lugs', status='named', match=[('pad.*.lug', _ANY, _B)], reason='pad lugs (C13)'),
    dict(id='pad.blocks', status='named', match=[('pad.*.block', _ANY, _B)], reason='mount blocks (C13)'),
    dict(id='pad.head.contact', status='contact', match=[('pad.*.head', _ANY, _B)],
         reason='3 mm mesh-head disc edge inside the rim, 0.3 mm clear of the inner skirt and 9.5 mm below the rim top: hidden by the rim'),
    # ---- cymbals
    dict(id='cymbal.nuts', status='named', match=[('cymbal.*.nut', ('block', 'cap'), _B)], reason='cymbal wing nuts (C13): wings and nut body'),
    dict(id='cymbal.edge', status='named', source=_BD + ' decision 5',
         match=[('cymbal.*.disc', ('ring',), ('convex>=80', 'convex40-80'), (('b5', 'b6'), ('b6', 'b7')))],
         reason='accepted sharp by name (decision 5): both corners of the 8.9 mm outer edge band of the three authored cymbals: '
                'the 70.0-degree upper corner (bow strip into the band) and the 108.5-degree lower corner (band into the '
                'underside), radius about 0.19 m. Dark matte e-cymbal pad surface (material rule fabric, the rubber pad), '
                'source profile, scale and identity as authored. No allowance for any other profile or later geometry',
         reconsider='image gate E1b: a cymbal reads as a slab, or the band shows a bright line'),
    # ---- kick
    dict(id='kick.base.contact', status='contact', match=[('kick.base', _ANY, _B)], reason='bottom perimeter rests on the rug; top perimeter and plan corners bevelled'),
    dict(id='kick.tower.contact', status='contact', match=[('kick.tower', _ANY, _B)], reason='bottom perimeter rests on the base frame; top perimeter and plan corners bevelled'),
    dict(id='kick.head.contact', status='contact', match=[('kick.head', _ANY, _B)],
         reason="fabric head rims: front rim under the pad ring's 4 mm lip, back rim against the tower face (5c)"),
    dict(id='kick.pad_ring.seat', status='contact', match=[('kick.pad_ring', ('ring',), ('convex40-80',))],
         reason='pad ring back corner (53 degrees) 4 mm in front of the tower face it is seated on; the outer front corner is now bevelled (casing)'),
    dict(id='kick.pad_ring.open', status='contact', match=[('kick.pad_ring', ('open',), ('open',))],
         reason='open lathe ends of the ring: the back loop is buried 2 mm in the tower face; the front loop is the inner edge of the '
                '4 mm lip lying over the fabric head (double-sided material)'),
    dict(id='granted.small_dark_blocks', status='granted', source=_GR,
         match=[('kick.heel', _ANY, _B), ('hihat.heel', _ANY, _B), ('module.button', _ANY, _B)],
         reason='kick heel block, hi-hat heel rubber, six module buttons: rubber or fabric, dark, 6-20 mm',
         reconsider='any reads as an unfinished block'),
    # ---- hi-hat pedal, module
    dict(id='hihat.base.contact', status='contact', match=[('hihat.base', _ANY, _B)], reason='underside perimeter rests on the rug; top perimeter bevelled'),
    dict(id='hihat.housing.contact', status='contact', match=[('hihat.housing', _ANY, _B)], reason='bottom perimeter rests on the base; top perimeter and plan corners bevelled'),
    dict(id='module.knob', status='named', match=[('module.knob', _ANY, _B)], reason='knobs (C13): the module volume knob, read by kind of part (5a)'),
    dict(id='module.glow', status='screen', match=[('module.display', _ANY, _B)], reason='lib_glow display face'),
    # ---- round members: ends (granted) and lengthwise facets (faceted-round)
    dict(id='granted.round_member_ends', status='granted', source=_GR, reconsider=_RME,
         match=[(g, ('cap',), _B) for g in ('stand.arm', 'stand.arm_end', 'stand.foot', 'stand.foot_end', 'stand.tube', 'stand.pivot_bolt',
                                           'rack.upright', 'rack.foot', 'rack.foot_end', 'rack.side_bar', 'rack.side_end', 'rack.crossbar',
                                           'rack.stub', 'rack.boom', 'pad.*.arm', 'cymbal.*.rod', 'cymbal.*.felt', 'cymbal.*.tilter',
                                           'kick.post', 'kick.spur_arm.*', 'kick.spur_foot.*', 'kick.spring', 'kick.shaft', 'kick.chain',
                                           'kick.cam', 'stool.*', 'throne.*', 'module.arm', 'module.snake', 'sustain.cable', 'cable.*')],
         reason='round-member ends: stand tube, rubber-end and pivot-bolt ends; rack tube, foot, stub and boom ends; pad mount-arm '
                'ends; cymbal rod, felt and tilter rims; kick posts, spurs (v04: arm ends and the dark rubber spur feet), spring, '
                'shaft, chain and cam; stool; throne; module mount-arm ends; snake and cable end caps. Ends of round sections '
                'reduced to 5-16 sides; most butt another part'),
    dict(id='faceted_round.members', status='faceted-round',
         match=[(g, ('along', 'ring'), _B) for g in ('stand.*', 'rack.boom', 'pad.*.arm', 'cymbal.*.rod', 'cymbal.*.felt', 'cymbal.*.tilter',
                                                    'cymbal.*.nut', 'kick.post', 'kick.spur_arm.*', 'kick.spur_foot.*', 'kick.spring',
                                                    'kick.shaft', 'kick.chain', 'kick.axle', 'kick.cam', 'stool.leg', 'throne.leg',
                                                    'throne.brace', 'module.arm', 'module.snake', 'sticks')],
         reason='lengthwise facet edges and bends of low-sided round members, flat-shaded by the 40-degree split: stand arms, feet '
                'and X tubes (8 sides), booms and mount arms (10), cymbal rods, felts, tilters and nut bodies (8), kick posts, '
                'spurs, spring, shaft and axle (8), chain (6), stool and throne legs and braces (6), module snake (8), sticks (6 '
                'sides, plus tip profile facets). Side counts follow the art direction (8-16 sides under 12 px)',
         reconsider='image gate F1: stand tubes and sticks read as faceted'),
    dict(id='faceted_round.cables', status='faceted-round', match=[('cable.*', ('along', 'ring'), _B), ('sustain.cable', ('along', 'ring'), _B)],
         reason='lengthwise facet edges of the 5-sided music cables (6-sided sustain lead), incl. the edges that exceed 80 degrees '
                'where a run is skewed at a bend, and the bend rings. These are lengthwise cable facets, not end caps',
         reconsider='image gate F1: cables sparkle'),
    dict(id='faceted_round.profiles', status='faceted-round',
         match=[('stool.seat', ('ring',), ('convex40-80',)), ('throne.seat', ('ring',), ('convex40-80',)),
                ('kick.beater', ('ring',), ('convex40-80',))],
         reason='profile facets of curved lathed surfaces (24-step seat cushions with 4-5 profile points, 12-step beater head): '
                'turns of 40-80 degrees between profile points. (v04: no cymbal edge here; the bell-to-bow turn is 39.6 degrees '
                'and smooth, and the band corners are cymbal.edge)',
         reconsider='a seat cushion or the beater head reads as a stepped solid'),
]


def edge_set(label, kind, band, roles=None):
    """The EDGE_SETS entry holding a hard edge, or None (undeclared: a failure to report, never an exemption).
    roles: the sorted pair of the edge's two face roles (edge_records()['roles']); a match with rolePairs needs it."""
    for s in EDGE_SETS:
        for m in s['match']:
            pat, kinds, bands = m[:3]
            if fnmatch.fnmatchcase(label, pat) and kind in kinds and band in bands and (len(m) == 3 or roles in m[3]):
                return s
    return None


def edge_tally(parts):
    """Author tally of hard edges by set and band (metres), plus bevel middle-seam length by class. Author evidence only;
    Codex's measurement is the independent figure. 'bevelMiddleSeamM' is the length of smooth edges joining two faces of the
    same bevel class (the seam inside a 2-segment bevel), NOT the treated original edge length."""
    out, undeclared, seam = {}, {}, {}
    for row, part in parts.items():
        for rec in edge_records(part):
            lab = part.groups[rec['group']][0]
            s = edge_set(lab, rec['kind'], rec['band'], rec['roles'])
            key = s['id'] if s else 'UNDECLARED'
            t = out.setdefault(key, dict(status=s['status'] if s else 'undeclared', lengthM={}, edges=0, labels=set()))
            t['lengthM'][rec['band']] = t['lengthM'].get(rec['band'], 0.0) + rec['length']
            t['edges'] += 1
            t['labels'].add(lab)
            if s is None:
                undeclared.setdefault(f'{row}/{part.ids[rec["group"]]}', []).append((rec['kind'], rec['band']))
        smooth = smooth_edges(part)
        V = np.asarray(part.v, float)
        for e, fs in _edge_faces(part).items():
            c0 = part.cls[fs[0]] or ''
            if smooth[e] and len(fs) == 2 and c0.startswith('bevel:') and part.cls[fs[1]] == c0:
                seam[c0] = seam.get(c0, 0.0) + float(np.linalg.norm(V[e[1]] - V[e[0]]))
    for t in out.values():
        t['labels'] = sorted(t['labels'])
        t['lengthM'] = {k: round(v, 4) for k, v in sorted(t['lengthM'].items())}
    return dict(sets=out, undeclared=undeclared, bevelMiddleSeamM={k: round(v, 4) for k, v in sorted(seam.items())})


def _face_normals(part):
    """Unit Newell normals in the authored winding (no orientation fix)."""
    V = np.asarray(part.v, float)
    out = []
    for f, _ in part.f:
        P = V[list(f)]
        n = np.cross(P - P.mean(0), np.roll(P, -1, 0) - P.mean(0)).sum(0)   # Newell (2 x area x normal)
        a = float(np.linalg.norm(n))
        out.append(n / a if a > 0 else n)
    return out


def _edge_faces(part):
    edges = {}
    for fi, (f, _) in enumerate(part.f):
        for i in range(len(f)):
            edges.setdefault((min(f[i], f[i - 1]), max(f[i], f[i - 1])), []).append(fi)
    return edges


def smooth_edges(part, sharp_deg=SHARP_DEG):
    """v04 N1: the single smoothing rule shared by corner_normals() and the held builder's edge marking.

    {(v_lo, v_hi): bool} for every edge. An edge is smooth when it joins exactly two faces and either (a) both faces carry
    the same continuous round-run id (Part.runs, authored by prism() for consecutive round plan edges: rrect arcs and the
    cheek top chain), whatever their angle, or (b) their face normals differ by no more than sharp_deg. Everything else is
    a hard edge (profile corners, contact perimeters, flat panels, open or non-manifold edges)."""
    nrm, cos_s = _face_normals(part), math.cos(math.radians(sharp_deg))
    out = {}
    for e, fs in _edge_faces(part).items():
        if len(fs) != 2:
            out[e] = False
            continue
        r0, r1 = part.runs[fs[0]], part.runs[fs[1]]
        out[e] = (r0 is not None and r0 == r1) or float(np.dot(nrm[fs[0]], nrm[fs[1]])) >= cos_s
    return out


def corner_normals(part, sharp_deg=SHARP_DEG, bevel_aware=True):
    """Authored per-corner normals {(face index, vertex index): unit normal} for one row (pure numpy).

    Corners are grouped into smooth fans exactly as the builder splits them: smooth_edges() (v04 N1: edges inside one
    declared round run never split; otherwise edges sharper than sharp_deg split).
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
    nrm = _face_normals(part)
    edges = _edge_faces(part)
    smooth = smooth_edges(part, sharp_deg)                         # v04 N1: round-run edges stay inside one fan
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


def _group_of_faces(part):
    out = [None] * len(part.f)
    for gi, (_, _, _, f0, f1) in enumerate(part.groups):
        out[f0:f1] = [gi] * (f1 - f0)
    return out


def _outward_sign(part):
    """Per group: +1 if the authored winding of that closed primitive points outward (positive signed volume), else -1."""
    V = np.asarray(part.v, float)
    out = []
    for _, v0, v1, f0, f1 in part.groups:
        c = V[v0:v1].mean(0)
        vol = 0.0
        for f, _ in part.f[f0:f1]:
            P = V[list(f)] - c
            for i in range(1, len(f) - 1):
                vol += float(np.dot(P[0], np.cross(P[i], P[i + 1])))
        out.append(1.0 if vol >= 0 else -1.0)
    return out


def edge_records(part, sharp_deg=SHARP_DEG):
    """v04 A1: one record per hard edge (smooth_edges() False), for the edge-set tally. Pure geometry plus authored roles.

    kind (from the authored face roles, never from normals): 'cap' (an end-cap / prism-cap perimeter), 'along' (between two
    side faces of the same band, strip or tube segment: the lengthwise facet edges of a round member, the plan corners of a
    prism), 'ring' (between adjacent bands / strips / segments: a profile corner or a tube bend), 'block' (a box edge),
    'open' (not two faces). band: 'convex>=80', 'convex40-80' or 'concave' (outward-oriented dihedral turn), 'open'.
    roles (v04 bounded pass): the sorted pair of the two faces' authored roles (e.g. lathe strips 'b4', 'b5'), None if open."""
    V = np.asarray(part.v, float)
    nrm, grp, sign = _face_normals(part), _group_of_faces(part), _outward_sign(part)
    cent = [V[list(f)].mean(0) for f, _ in part.f]
    smooth = smooth_edges(part, sharp_deg)
    recs = []
    for e, fs in _edge_faces(part).items():
        if smooth[e]:
            continue
        g = grp[fs[0]]
        L = float(np.linalg.norm(V[e[1]] - V[e[0]]))
        if len(fs) != 2:
            recs.append(dict(edge=e, group=g, kind='open', band='open', angle=None, length=L, roles=None))
            continue
        r0, r1 = part.roles[fs[0]], part.roles[fs[1]]
        kind = 'cap' if 'cap' in (r0, r1) else 'block' if r0 == r1 == 'blk' else 'along' if r0 == r1 else 'ring'
        n0, n1 = nrm[fs[0]] * sign[g], nrm[fs[1]] * sign[g]
        ang = math.degrees(math.acos(max(-1.0, min(1.0, float(np.dot(n0, n1))))))
        convex = float(np.dot(n0, cent[fs[1]] - (V[e[0]] + V[e[1]]) / 2)) < 0
        band = 'concave' if not convex else 'convex>=80' if ang >= 80.0 else 'convex40-80'
        recs.append(dict(edge=e, group=g, kind=kind, band=band, angle=ang, length=L, roles=tuple(sorted((r0, r1)))))
    return recs


# ------------------------------------------------------------------ v04 D: author semantic declaration
# Out-of-scope purpose per group label (fnmatch, first match). In-scope groups are the ones whose primitive authored N1
# classes (prism / bevel_corners / rrect, the pad-shell and kick-ring lathes); never derived from geometry or normals.
GROUP_PURPOSE = [
    ('ctl.slab', 'N1 casing: controller base slab, bevelled top-front edge'),
    ('ctl.panel', 'N1 casing: rear control panel, bevelled front-top and back-top edges'),
    ('ctl.bays', 'N1 casing: wheel bay / right margin block, bevelled top-front edge'),
    ('ctl.cheeks', 'N1 casing: oak-tone cheek, bevelled outer perimeter and back-top corner, round top run'),
    ('ctl.white_front', 'N1: white key front block with the H1 white_key_lip front-top bevel'),
    ('sustain.base', 'N1 casing: sustain pedal base, rounded plan, bevelled top perimeter'),
    ('sustain.plate', 'N1 casing: sustain pedal plate, rounded plan, bevelled top perimeter'),
    ('pad.*.shell', 'N1 casing: pad shell and rim, bevelled rim outer top corner'),
    ('kick.tower', 'N1 casing: kick tower, bevelled plan corners and top perimeter'),
    ('kick.base', 'N1 casing: kick base frame, bevelled plan corners and top perimeter'),
    ('kick.pad_ring', 'N1 casing (v04): kick pad ring, bevelled outer front corner'),
    ('hihat.base', 'N1 casing: hi-hat pedal base, rounded plan, bevelled top perimeter'),
    ('hihat.housing', 'N1 casing: hi-hat sensor housing, bevelled plan corners and top perimeter'),
    ('module.case', 'N1 casing: drum module case, rounded plan, bevelled front and back perimeters'),
    ('ctl.display_face', 'out of N1 scope: lib_glow display face (screen)'),
    ('ctl.indicator_strip', 'out of N1 scope: lib_glow pad-column indicator strip (I1 inlay, screen)'),
    ('module.display', 'out of N1 scope: lib_glow display face (screen)'),
    ('ctl.white_stem', 'out of N1 scope: white key stem behind the front block (named white-key edges)'),
    ('ctl.black_key', 'out of N1 scope: black key (named black-key edges)'),
    ('rug', 'out of N1 scope: woven rug with binding (soft goods, v01 angle-weighted shading)'),
    ('cable.*', 'out of N1 scope: 5-sided cable run (faceted-round)'),
    ('sustain.cable', 'out of N1 scope: 6-sided pedal lead (faceted-round)'),
    ('sticks', 'out of N1 scope: lathed drumstick (faceted-round)'),
    ('*.seat', 'out of N1 scope: lathed seat cushion (faceted-round profile)'),
    ('cymbal.*.disc', 'out of N1 scope: lathed e-cymbal pad (bell, bow and edge profile)'),
    ('pad.*.head', 'out of N1 scope: mesh head disc inside the rim'),
    ('kick.head', 'out of N1 scope: fabric kick head'),
    ('kick.beater', 'out of N1 scope: lathed beater head'),
    ('*', 'out of N1 scope: small round member, hardware or detail part (no casing bevel; named/granted/faceted-round edges)'),
]

SUPPORTS = [  # (row, group id): every primitive that independently stands on the rug field (v3 supportMeaning); intent, not search
    ('ctl_stand__frame', g) for g in ('stand.foot#0', 'stand.foot#1', 'stand.foot_end#0', 'stand.foot_end#1', 'stand.foot_end#2', 'stand.foot_end#3')
] + [('ctl_sustain_pedal__pedal', 'sustain.base')] + [('stool_keys__stool', f'stool.foot#{i}') for i in range(4)] + [
    ('drum_rack__rack', g) for g in ('rack.foot#0', 'rack.foot#1', 'rack.foot_end#0', 'rack.foot_end#1', 'rack.foot_end#2', 'rack.foot_end#3')
] + [('drum_kick__tower', g) for g in ('kick.base', 'kick.spur_foot.L', 'kick.spur_foot.R', 'kick.pedal_plate')] + [
    ('drum_hihat_pedal__pedal', 'hihat.base')] + [('drum_throne__throne', f'throne.foot#{i}') for i in range(3)]

ATTACHMENTS = [  # K1 attachment intent, separate from floor support (root v04 K1); (id, row, group, onto group, relation, gap/depth m, intent)
    ('kick.spring_on_plate', 'drum_kick__tower', 'kick.spring', 'kick.pedal_plate', 'rests_on', 0.0,
     'spring foot disc stands flush on the plate top, wholly inside the plate outline (v04 plate half-width 0.068)'),
    ('kick.post0_on_plate', 'drum_kick__tower', 'kick.post#0', 'kick.pedal_plate', 'rests_on', 0.0,
     'left post foot disc flush on the plate top, wholly inside its outline'),
    ('kick.post1_on_plate', 'drum_kick__tower', 'kick.post#1', 'kick.pedal_plate', 'rests_on', 0.0,
     'right post foot disc flush on the plate top, wholly inside its outline'),
    ('kick.heel_on_plate', 'drum_kick__tower', 'kick.heel', 'kick.pedal_plate', 'rests_on', 0.0,
     'heel block underside flush on the plate top, wholly inside its outline (v04 heel extension 0.04)'),
    ('kick.spur_arm_L_in_foot', 'drum_kick__tower', 'kick.spur_arm.L', 'kick.spur_foot.L', 'embedded', None,
     'arm tip disc wholly inside the foot; the arm enters through the foot side wall (an attached part, not a support)'),
    ('kick.spur_arm_R_in_foot', 'drum_kick__tower', 'kick.spur_arm.R', 'kick.spur_foot.R', 'embedded', None,
     'arm tip disc wholly inside the foot; the arm enters through the foot side wall'),
    ('kick.spur_arm_L_in_base', 'drum_kick__tower', 'kick.spur_arm.L', 'kick.base', 'embedded', None,
     'root decision 1: the arm grows out of the base frame; its whole root ring is buried in the frame, entering through the '
     'flat own-side face only (criterion)'),
    ('kick.spur_arm_R_in_base', 'drum_kick__tower', 'kick.spur_arm.R', 'kick.base', 'embedded', None,
     'root decision 1: the arm grows out of the base frame; its whole root ring is buried in the frame, entering through the '
     'flat own-side face only (criterion)'),
    ('kick.footboard_on_heel', 'drum_kick__tower', 'kick.footboard', 'kick.heel', 'embedded', None,
     'root decision 8: intended seat. The inclined footboard heel end is seated up to 4 mm (half its 8 mm thickness) into '
     'the heel block top, entering and leaving only through that top, so it reads as a board hinged at a heel plate with no '
     'open wedge beneath (criterion)'),
    ('hihat.footboard_in_hinge', 'drum_hihat_pedal__pedal', 'hihat.footboard', 'hihat.hinge', 'hinged', None,
     'author intent for the existing hi-hat heel hinge (bounded disposition, hi-hat coverage): the footboard pivots on the '
     'hinge barrel, its heel edge on the barrel axis and its heel end inside the barrel (criterion). No geometry change'),
    ('ctl.display_face_on_bezel', 'ctl_body__indicators', 'ctl.display_face', 'ctl.bezel', 'rests_on', EPS,
     'display glow face rests on the bezel top with the usual 0.3 mm gap (I1 wording); no overlap'),
]
ATTACH_ROWS = {'ctl.bezel': 'ctl_body__shell'}


# v04 bounded pass (root 7705f590 decisions 1, 2, 8 and hi-hat coverage; S msg_404c585797e4 / msg_63a12bb6ae48): explicit
# attachment criteria with row-level vertex / face locators. Additive author metadata only (the public v3 verifier schema is
# unchanged). Locators come from the authored primitive topology (rod = 2 rings + side quads + root cap + tip cap; extrude =
# bottom cap, top cap, sides; box = -z, +z, -y, +x, +y, -x); nothing is inferred from coincident coordinates. 'authorObserved'
# values are the author's own source figures, not measurement of record; Codex measures every criterion independently.
def _grp(part, gid):
    i = part.ids.index(gid)
    _, v0, v1, f0, f1 = part.groups[i]
    return v0, v1, f0, f1


def _rod_topology(part, gid, n):
    v0, v1, f0, f1 = _grp(part, gid)
    assert v1 - v0 == 2 * n and f1 - f0 == n + 2, gid
    return dict(rootRing=list(range(v0, v0 + n)), tipRing=list(range(v0 + n, v0 + 2 * n)),
                lengthwiseEdges=[[v0 + i, v0 + n + i] for i in range(n)], sideFaces=[f0, f0 + n - 1],
                rootCapFace=f0 + n, tipCapFace=f0 + n + 1)


def _plane(part, fi):
    V = np.asarray(part.v, float)
    P = V[list(part.f[fi][0])]
    nrm = np.cross(P[1] - P[0], P[2] - P[0])
    return P, nrm / np.linalg.norm(nrm)


def _r(x, k=5):
    return round(float(x), k)


def _crit_spur_base(parts, side):
    p = parts['drum_kick__tower']
    V = np.asarray(p.v, float)
    sx = -1 if side == 'L' else 1
    arm = _rod_topology(p, f'kick.spur_arm.{side}', 8)
    b0, b1, bf0, bf1 = _grp(p, 'kick.base')
    sign = _outward_sign(p)[p.ids.index('kick.base')]
    nrm = _face_normals(p)
    own = [fi for fi in range(bf0, bf1) if float(np.dot(nrm[fi] * sign, (sx, 0, 0))) > 0.9999]
    assert len(own) == 1, own
    P, _ = _plane(p, own[0])
    face_x = float(P[:, 0].mean())
    burial = [sx * (face_x - V[i][0]) for i in arm['rootRing']]
    cross = []
    for a, b in arm['lengthwiseEdges']:
        t = (face_x - V[a][0]) / (V[b][0] - V[a][0])
        assert 0 < t < 1
        cross.append(V[a] + t * (V[b] - V[a]))
    cross = np.asarray(cross)
    margin = min(min(c[1] - P[:, 1].min(), P[:, 1].max() - c[1], c[2] - P[:, 2].min(), P[:, 2].max() - c[2]) for c in cross)
    root_c, tip_c = V[arm['rootRing']].mean(0), V[arm['tipRing']].mean(0)
    return dict(
        kind='rod_root_embedded_through_flat_face',
        meaning='every root-ring vertex lies inside the kick.base solid, at least minRingBurialM inside the receiving own-side '
                'flat face; each lengthwise arm edge crosses the base boundary exactly once and only through that flat face '
                '(never a bevel band, the top or the back). rootCentreInsetM is the authored inset of the root-disc CENTRE from '
                'that face plane and is NOT a penetration depth: the oblique ring is buried 1.3-10.7 mm. Root and tip heights '
                'are centre heights of the root and tip cap discs above the resting height. Not a same-row overlap allowance',
        rootRingVertices=arm['rootRing'], lengthwiseEdges=arm['lengthwiseEdges'], rootCapFace=arm['rootCapFace'],
        tipRingVertices=arm['tipRing'], tipCapFace=arm['tipCapFace'], armSideFaceRange=arm['sideFaces'],
        receivingFace=dict(row='drum_kick__tower', group='kick.base', face=own[0], outwardNormal=[sx, 0, 0]),
        minRingBurialM=0.001, rootCentreInsetM=SPUR['root_in'], restingHeightM=_r(ON_RUG, 6),
        rootCentreHeightM=SPUR['arm_root_z'], tipCentreHeightM=SPUR['arm_tip_z'],
        heightChange='v03 root 18 mm -> v04 22 mm; v03 tip 12 mm -> v04 14 mm (tip plan position unchanged)',
        authorObserved=dict(ringBurialMinM=_r(min(burial)), ringBurialMaxM=_r(max(burial)),
                            crossingMinMarginToFaceBoundaryM=_r(margin),
                            rootCentreHeightM=_r(root_c[2] - ON_RUG), tipCentreHeightM=_r(tip_c[2] - ON_RUG)))


def _crit_spur_foot(parts, side):
    p = parts['drum_kick__tower']
    V = np.asarray(p.v, float)
    arm = _rod_topology(p, f'kick.spur_arm.{side}', 8)
    f0v, f1v, _, _ = _grp(p, f'kick.spur_foot.{side}')
    F = V[f0v:f1v]
    c = F[:, :2].mean(0)
    wall = min(SPUR['foot_r'] * math.cos(math.pi / 8) - float(np.linalg.norm(V[i][:2] - c)) for i in arm['tipRing'])
    top = min(float(F[:, 2].max() - V[i][2]) for i in arm['tipRing'])
    return dict(kind='rod_tip_inside_solid',
                meaning='every tip-ring vertex lies inside the spur foot solid (8-sided lathe): inside its wall and below its top',
                tipRingVertices=arm['tipRing'], tipCapFace=arm['tipCapFace'],
                authorObserved=dict(minInsideWallM=_r(wall), minBelowTopM=_r(top)))


def _crit_kick_heel(parts):
    p = parts['drum_kick__tower']
    V = np.asarray(p.v, float)
    fv0, fv1, ff0, ff1 = _grp(p, 'kick.footboard')
    n = (fv1 - fv0) // 2
    hv0, hv1, hf0, hf1 = _grp(p, 'kick.heel')
    assert hv1 - hv0 == 8 and hf1 - hf0 == 6
    under, top = hf0, hf0 + 1                                       # hexa order: -z, +z, -y, +x, +y, -x
    top_z, under_z = float(V[hv0:hv1, 2].max()), float(V[hv0:hv1, 2].min())
    Pb, nb = _plane(p, ff0)
    Pt, _ = _plane(p, ff0 + 1)
    thick = abs(float(np.dot(Pt[0] - Pb[0], nb)))
    # heel-end edge of the top cap: the two top-cap vertices nearest the heel along the board's run (local board y)
    run = np.array([0.0, math.cos(math.atan2(0.05, KICK['toe_y'] - KICK['heel_y'])), math.sin(math.atan2(0.05, KICK['toe_y'] - KICK['heel_y']))])
    tops = list(range(fv0 + n, fv1))
    tmin = min(float(np.dot(V[i], run)) for i in tops)
    heel_top = [i for i in tops if float(np.dot(V[i], run)) < tmin + 1e-9]
    assert len(heel_top) == 2
    below = [i for i in range(fv0, fv1) if V[i][2] < top_z - 1e-12]
    return dict(
        kind='board_end_seated_through_top_face',
        meaning='intended seat (decision 8), exactly kick.footboard into kick.heel: (1) every footboard vertex below the heel '
                'top plane lies inside the heel plan outline; (2) the board crosses the heel boundary only through the heel '
                'top face, never a side, the back or the toe-side face; (3) the greatest depth below the top plane is at most '
                'maxDepthM and at most half the board thickness measured between the two parallel board faces, and the '
                'exposed upper heel-end corners stand at least minProudM above the heel top; (4) no footboard vertex is below '
                'the heel underside. Checked over ALL footboard vertices and source edges, separately from support height. '
                'Not a same-row overlap allowance',
        receivingTopFace=top, receivingUndersideFace=under,
        forbiddenCrossingFaces=dict(minusY=hf0 + 2, plusX=hf0 + 3, plusY=hf0 + 4, minusX=hf0 + 5),
        boardFaces=dict(underside=ff0, top=ff0 + 1, meaning='the two parallel extrude caps; board thickness is the distance between their planes'),
        boardVertexRange=[fv0, fv1], boardSideFaceRange=[ff0 + 2, ff1 - 1],
        exposedUpperHeelEndCorners=heel_top,
        maxDepthM=0.004, boardThicknessM=0.008, minProudM=0.0038,
        authorObserved=dict(belowTopVertices=below, maxDepthM=_r(max(top_z - V[i][2] for i in below)),
                            boardThicknessM=_r(thick, 6), heelEndCornerProudM=[_r(V[i][2] - top_z) for i in heel_top],
                            minAboveUndersideM=_r(min(V[i][2] for i in range(fv0, fv1)) - under_z)))


def _crit_hihat_hinge(parts):
    p = parts['drum_hihat_pedal__pedal']
    V = np.asarray(p.v, float)
    h = HIHAT_PEDAL
    M = T(h['cx'], h['cy'], ON_RUG) @ Rz(h['yaw'])
    Mi = np.linalg.inv(M)
    L = lambda i: (Mi @ np.append(V[i], 1.0))[:3]
    hinge = _rod_topology(p, 'hihat.hinge', 12)
    a, b = V[hinge['rootRing']].mean(0), V[hinge['tipRing']].mean(0)
    ax_y, ax_z, half, R = -h['l'] / 2 + 0.03, 0.022, 0.045, 0.009
    r_in = R * math.cos(math.pi / 12)
    fv0, fv1, ff0, ff1 = _grp(p, 'hihat.footboard')
    n = (fv1 - fv0) // 2
    loc = {i: L(i) for i in range(fv0, fv1)}
    rad = {i: math.hypot(q[1] - ax_y, q[2] - ax_z) for i, q in loc.items()}
    on_axis = [i for i in range(fv0, fv0 + n) if rad[i] < 1e-6]
    assert len(on_axis) == 2
    end_face = [fi for fi in range(ff0 + 2, ff1) if set(on_axis) <= set(p.f[fi][0])]
    assert len(end_face) == 1
    ring_c = [L(i) for i in hinge['rootRing']]

    def inside_barrel(q):                                           # exact 12-gon test in the barrel's local (y, z) section
        if abs(q[0]) > half:
            return False
        d = np.array([q[1] - ax_y, q[2] - ax_z])
        for k in range(12):
            u0, u1 = ring_c[k][1:] - (ax_y, ax_z), ring_c[(k + 1) % 12][1:] - (ax_y, ax_z)
            m = (u0 + u1) / 2
            if float(np.dot(d, m / np.linalg.norm(m))) > float(np.linalg.norm(m)) + 1e-12:
                return False
        return True

    within = [i for i in range(fv0, fv1) if abs(loc[i][0]) <= half and rad[i] < R]
    outside_ends = [i for i in range(fv0, fv1) if abs(loc[i][0]) > half and rad[i] < R]
    base_top = max(L(i)[2] for i in range(*_grp(p, 'hihat.base')[:2]))
    heel_v = list(range(*_grp(p, 'hihat.heel')[:2]))
    heel_front = max(L(i)[1] for i in heel_v)
    return dict(
        kind='board_heel_captured_in_hinge_barrel',
        meaning='author intent for the EXISTING hi-hat heel hinge (inherited v01 geometry, no change): the footboard pivots on '
                'the 12-sided hinge barrel. (1) The two heel-axis vertices of the board underside lie on the barrel axis '
                '(within 0.05 mm) and axially between the barrel end discs; (2) every footboard vertex that is axially '
                'between the end discs and radially within the barrel radius lies inside the 12-gon barrel solid, so the '
                'board heel-end face is wholly inside the barrel; (3) the board is wider (104 mm) than the barrel (90 mm): '
                'its rounded heel corners pass out through the end discs, and no footboard vertex lies axially more than '
                'maxCornerOverhangM (the authored width difference, not a tolerance) beyond an end disc; (4) no footboard vertex is below the base top. This is a cylindrical capture, not the '
                'kick heel planar seat; it covers the footboard / barrel pair only, not the barrel mounting',
        barrel=dict(row='drum_hihat_pedal__pedal', group='hihat.hinge', axisStart=[_r(c, 6) for c in a],
                    axisEnd=[_r(c, 6) for c in b], radiusM=R, sides=12, inscribedRadiusM=_r(r_in, 6),
                    ringVertices=[hinge['rootRing'], hinge['tipRing']], sideFaceRange=hinge['sideFaces'],
                    endDiscFaces=[hinge['rootCapFace'], hinge['tipCapFace']]),
        board=dict(group='hihat.footboard', vertexRange=[fv0, fv1], undersideFace=ff0, topFace=ff0 + 1,
                   heelAxisVertices=on_axis, heelEndFace=end_face[0], heelEndFaceVertices=list(p.f[end_face[0]][0])),
        axisToleranceM=0.00005, maxCornerOverhangM=_r((h['w'] - 0.01) / 2 - half, 6),   # board half-width 0.052 less barrel half-length 0.045
        authorObserved=dict(
            heelAxisVertexRadialM=[_r(rad[i], 6) for i in on_axis],
            verticesBetweenEndDiscsWithinRadius=within,
            allThoseInsideBarrel=all(inside_barrel(loc[i]) for i in within),
            maxRadialOfThoseM=_r(max(rad[i] for i in within)),
            cornerVerticesBeyondEndDiscs=outside_ends,
            maxBoardOverhangBeyondEndDiscM=_r(max(abs(q[0]) - half for q in loc.values())),
            maxOverhangOfCornerVerticesWithinRadiusM=_r(max(abs(loc[i][0]) - half for i in outside_ends)),
            boardMinAboveBaseTopM=_r(min(q[2] for q in loc.values()) - base_top),
            barrelMountingNote=('NOT part of this pair, reported for root: the barrel touches nothing but the board. Its '
                                f'underside is {_r(1000 * (ax_z - R - base_top), 2)} mm above the base top and its back '
                                f'{_r(1000 * (ax_y - R - heel_front), 2)} mm in front of the heel rubber (inherited v01 '
                                'geometry; no hi-hat geometry change is released)')))


ATTACH_CRITERIA = {
    'kick.spur_arm_L_in_base': lambda parts: _crit_spur_base(parts, 'L'),
    'kick.spur_arm_R_in_base': lambda parts: _crit_spur_base(parts, 'R'),
    'kick.spur_arm_L_in_foot': lambda parts: _crit_spur_foot(parts, 'L'),
    'kick.spur_arm_R_in_foot': lambda parts: _crit_spur_foot(parts, 'R'),
    'kick.footboard_on_heel': _crit_kick_heel,
    'hihat.footboard_in_hinge': _crit_hihat_hinge,
}


def _assert_cheek_nose(parts):
    """v04 decisions 3/4: after the nose bevel no hard 'along' 40-80 edge remains on a cheek except the eight underside mitres."""
    p = parts['ctl_body__shell']
    mitres = [r for r in edge_records(p) if p.groups[r['group']][0] == 'ctl.cheeks' and r['kind'] == 'along' and r['band'] == 'convex40-80']
    assert len(mitres) == 8 and abs(sum(r['length'] for r in mitres) - 0.0223) < 0.0005, (len(mitres), sum(r['length'] for r in mitres))
    return len(mitres)


def author_declaration(helper_sha256=None):
    """The author's semantic declaration (JSON-native), compatible with m4-v03-verifier-declaration-contract-v3.json
    (schema m4-source-declaration/3: rows / groups / faceClasses / surfaces / supports) plus v04 author sections. Pose
    independent except selectedPose. rowsSha256 is left to the producer and root/S freeze (never self-pinned here)."""
    parts, _ = build_all()
    rows = []
    for row, part in parts.items():
        groups = []
        for gi, (lab, v0, v1, f0, f1) in enumerate(part.groups):
            inside = any(c is not None for c in part.cls[f0:f1])
            assert all((c is not None) == inside for c in part.cls[f0:f1]), (row, part.ids[gi])
            why = next(w for pat, w in GROUP_PURPOSE if fnmatch.fnmatchcase(lab, pat))
            assert why.startswith('N1') == inside, (row, lab, why)
            groups.append(dict(id=part.ids[gi], label=lab, vertexRange=[v0, v1], faceRange=[f0, f1],
                               triangleCount=sum(len(f) - 2 for f, _ in part.f[f0:f1]),
                               n1='in_scope' if inside else 'out_of_scope', reason=why))
        rows.append(dict(id=row, vertexCount=len(part.v), faceCount=len(part.f),
                         normalsRequired=any(g['n1'] == 'in_scope' for g in groups), groups=groups,
                         faceClasses=['out_of_scope' if c is None else c for c in part.cls]))
    rug_part = parts['rug__rug']
    field = len(rug_part.f) - 1                                    # rug(): last face = inner field top at RT
    supports = [dict(id=f'{row}/{g}', row=row, group=g, surface='rug_field') for row, g in SUPPORTS]
    for row, g in SUPPORTS:
        assert g in parts[row].ids, (row, g)
    attachments = []
    for aid, row, g, onto, rel, d, intent in ATTACHMENTS:
        orow = ATTACH_ROWS.get(onto, row)
        assert g in parts[row].ids and onto in parts[orow].ids, aid
        a = dict(id=aid, row=row, group=g, ontoRow=orow, ontoGroup=onto, relation=rel, intent=intent)
        if rel == 'rests_on':
            a['gapM'] = d
        else:                                                      # v04 decision 2: no ambiguous depthM; explicit criterion
            assert d is None and aid in ATTACH_CRITERIA, aid
        if aid in ATTACH_CRITERIA:
            a['criterion'] = ATTACH_CRITERIA[aid](parts)
        attachments.append(a)
    _assert_cheek_nose(parts)
    strips = [i for i in parts['ctl_body__indicators'].ids if i.startswith('ctl.indicator_strip#')]
    assert len(strips) == 4
    seatings = [dict(id=f'I1.{s}', row='ctl_body__indicators', group=s, intoRow='ctl_body__shell', intoGroup='ctl.panel',
                     seatDepthM=0.001, proudM=0.0025, intent='lit inlay seated 1.0 mm into the panel, 2.5 mm proud (root I1, exactly these four)')
                for s in strips]
    round_runs = []
    for row, part in parts.items():
        runs = {}
        for fi, r in enumerate(part.runs):
            if r is not None:
                runs.setdefault(r, []).append(fi)
        for r, fs in runs.items():
            gi = int(r.split('.')[0][1:])
            round_runs.append(dict(id=f'{row}/{part.ids[gi]}/{r.split(".", 1)[1]}', row=row, group=part.ids[gi], faces=fs))
    edge_sets = []
    for s in EDGE_SETS:
        e = dict(id=s['id'], status=s['status'], reason=s['reason'],
                 match=[dict(label=m[0], kinds=list(m[1]), bands=list(m[2]), **({'rolePairs': [list(r) for r in m[3]]} if len(m) > 3 else {}))
                        for m in s['match']])
        for opt in ('reconsider', 'source'):
            if opt in s:
                e[opt] = s[opt]
        edge_sets.append(e)
    return {
        'schema': 'm4-source-declaration/3',
        'scope': 'candidate',
        'status': 'actual-Claude author semantic declaration for M4 v04 source preparation; NOT frozen, NOT verified, NOT '
                  'candidate acceptance. rowsSha256 and the expected declaration digest are for the producer and root/S freeze.',
        'author': 'actual Claude Opus 5.5 (claude-opus-5-5, effort high), task_23314c669e03',
        'sources': {'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py': helper_sha256} if helper_sha256 else {},
        'interface': {'helper': 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py',
                      'buildAll': 'build_all(pose=None) -> (parts, meta)', 'cornerNormals': 'corner_normals(part)',
                      'smoothEdges': 'smooth_edges(part)', 'edgeRecords': 'edge_records(part)', 'ledger': 'ledger(parts)',
                      'coordinates': 'Blender metres, +Z up; runtime scale 2, +Y 0.11; planning eye [-0.35, -1.70, 1.345]'},
        'rows': rows,
        'surfaces': [dict(id='rug_field', kind='rug_field', boundaryRow='rug__rug', boundaryFace=field)],
        'supports': supports,
        'attachments': attachments,
        'seatings': seatings,
        'roundRuns': round_runs,
        'edgeClassification': {
            'hard': 'an edge is hard when smooth_edges() is False: not exactly two faces, or the two faces are not in one '
                    'declared round run and their normals differ by more than 40 degrees',
            'kinds': 'cap, along, ring, block, open: from authored face roles (Part.roles), see edge_records()',
            'rolePairs': "optional per match: the sorted pair of the edge's two face roles must be one of these (lathe strip "
                         "bK is profile segment K; rug ring bK is binding strip K); pins a set to exact profile corners",
            'bands': 'convex>=80, convex40-80, concave (outward-oriented per primitive), open',
            'statuses': 'named (root C13, or accepted by name in the v04 bounded disposition: see source), granted, contact, '
                        'screen, faceted-round, proposed; first matching set wins; an unmatched hard edge is undeclared (a failure)',
            'bevelLength': 'bevelMiddleSeamM in edge_tally(): the seam between the two faces of a 2-segment bevel, not the treated original edge length'},
        'attachmentCriteria': 'v04 bounded pass: an attachment with relation embedded or hinged carries criterion {kind, meaning, '
                              'row-level vertex / edge / face locators, named metric fields with explicit meaning, authorObserved}. '
                              'Indices are row-level (rows[].vertexCount / faceCount space). rests_on keeps gapM. authorObserved is '
                              'author evidence, not measurement of record',
        'edgeSets': edge_sets,
        'poseOptionIds': [p['id'] for p in POSE_OPTIONS],
        'poseOptions': [dict(cx=p['cx'], cy=p['cy'], yaw=p['yaw']) for p in POSE_OPTIONS],
        'selectedPose': dict(SELECTED_POSE),
        'selectedPoseStatus': SELECTED_POSE_STATUS,
        'restingRuns': 'cables (music_cables__runs, sustain.cable) lie on the rug and the bare floor; they are not supports and are '
                       'checked as cable runs, not by supportMeaning',
    }


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


def declaration_bytes():
    """Exact bytes of manifests/m4-v04-author-declarations.json: UTF-8, 1-space indent, insertion order, LF, final newline.
    The helper's own SHA-256 is read from this file's bytes; nothing is written."""
    import hashlib, json
    with open(__file__, 'rb') as fh:
        own = hashlib.sha256(fh.read()).hexdigest()
    return (json.dumps(author_declaration(own), indent=1, ensure_ascii=False, allow_nan=False) + '\n').encode('utf-8')


if __name__ == '__main__':
    import sys
    if sys.argv[1:] == ['--declaration']:                         # python -B <helper> --declaration > manifests/...json
        sys.stdout.buffer.write(declaration_bytes())
        raise SystemExit(0)
    parts, meta = build_all()
    rows, tot = ledger(parts)
    for k, v in rows.items():
        print(f'{k:28s} {v["placed"]:5d} / {v["ceiling"]:5d}')
    print(tot, meta['whiteKeys'], meta['blackKeys'])
