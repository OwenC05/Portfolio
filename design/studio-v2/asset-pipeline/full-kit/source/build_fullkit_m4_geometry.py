"""Studio v2 full kit, stage M4 music equipment: pure geometry helper (no bpy).

Owner: actual-Claude author, task_23314c669e03. M4-only helper imported by build_fullkit_m4.py inside Blender and by
plain CPython for offline planning checks. It writes nothing and imports only math and numpy.

Every M4 leaf is authored here as explicit vertices and convex polygon faces in Blender metres, Z up (the M3 rule: no
modifiers or curves, so each triangle count is exact: a face of n corners exports as n - 2 triangles). Each face
carries its UV rule: a lib_palette swatch name, or 'oak' / 'weave' / 'glow' for the planar library mappings that M2
defines (oak_uv, weave_uv, glow centre). The Blender builder resolves those rules with the chain's own functions.

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
class Part:
    def __init__(self, row):
        self.row = row
        self.asset, self.mat, self.ceiling, self.casts = ROWS[row]
        self.v, self.f = [], []           # f: (tuple of vertex indices, uv rule)

    def add(self, verts, faces, uv):
        base = len(self.v)
        self.v.extend(verts)
        for k, face in enumerate(faces):
            rule = uv[k] if isinstance(uv, (list, tuple)) else uv
            self.f.append((tuple(base + i for i in face), rule))

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


def rrect(w, d, r, n):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, d / 2 - r, 0), (-w / 2 + r, d / 2 - r, 90), (-w / 2 + r, -d / 2 + r, 180), (w / 2 - r, -d / 2 + r, 270)):
        pts += [(cx + r * math.cos(math.radians(a0 + 90 * i / n)), cy + r * math.sin(math.radians(a0 + 90 * i / n))) for i in range(n + 1)]
    return pts


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
CTL = dict(cx=1.2, cy=-0.8, yaw=-0.6, zb=0.573, w=0.99, d=0.32, h=0.095)        # proxy (1.0, -0.675, yaw -0.35) moved 0.24 m right/forward, turned 14 deg more to the seat: the kick pedal and throne read past its left end
MC = T(CTL['cx'], CTL['cy'], CTL['zb']) @ Rz(CTL['yaw'])                       # controller local: z from the underside
MCF = T(CTL['cx'], CTL['cy'], 0.0) @ Rz(CTL['yaw'])                            # controller local, z from the floor
KEY = dict(pitch=0.0294, gap=0.0034, x0=-0.398, yf=-0.157, yb=0.013, bed=0.030, top=0.0535, bw=0.0145, bwt=0.011,
           bl=0.105, btop=0.0648, front=0.0672)
STOOL = dict(local=(0.25, -0.40), seat=0.50, r=0.165, legs=0.17)
SUSTAIN = dict(local=(0.42, -0.04))
THRONE = dict(cx=1.425, cy=0.0, seat=0.48, r=0.175, legs=0.20)
UPRIGHT_L, UPRIGHT_R, RACK_Y = 0.82, 1.98, 0.56
RACK = dict(r=0.021, top=0.80, bar=0.66, side=0.48, side_y=0.20, foot_y=(0.40, 0.78))
PADS = {  # name: centre, radius, shell depth, tilt degrees toward the throne
    'tom1': ((1.18, 0.47, 0.79), 0.135, 0.075, 16),
    'tom2': ((1.60, 0.47, 0.80), 0.135, 0.075, 16),
    'snare': ((1.06, 0.25, 0.555), 0.16, 0.095, 6),
    'tom3': ((1.80, 0.27, 0.56), 0.135, 0.075, 9),
}
CYMBALS = {  # name: centre (bow plane), radius, tilt degrees toward the throne
    'hihat': ((0.85, 0.62, 1.00), 0.19, 3),
    'crash': ((1.68, 0.67, 1.06), 0.20, 12),
    'ride': ((1.98, 0.445, 0.95), 0.20, 9),
}
KICK = dict(cx=1.42, ty=0.455, tw=0.21, td=0.11, th=0.45, pad_r=0.078, pad_z=0.235, heel_y=0.10, toe_y=0.33)
HIHAT_PEDAL = dict(cx=1.00, cy=0.10, w=0.11, l=0.30, yaw=0.12)    # proxy (0.875, 0.185): out from behind the desk leg
MODULE = dict(c=(0.85, 0.40, 0.78), w=0.20, h=0.13, d=0.05, az=165.0, up=35.0)
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
    # base slab: key bed top (black) shows through the key gaps
    box(shell, (-ci + 0.0002, -hd, 0.0), (ci - 0.0002, hd, KEY['bed']), {'+z': 'black', '*': 'white_pc'}, MC)
    # rear panel: front wall is the key-well back, top slopes up 12 mm toward the back
    p0, p1 = KEY['yb'] + 0.0035, hd
    z_front, z_back = 0.080, 0.092
    hexa(shell, [(-ci, p0, KEY['bed']), (ci, p0, KEY['bed']), (ci, p1, KEY['bed']), (-ci, p1, KEY['bed']),
                 (-ci, p0, z_front), (ci, p0, z_front), (ci, p1, z_back), (-ci, p1, z_back)], 'white_pc', MC)
    # wheel bay (left of the keys) and right margin block, flush with the white key tops
    box(shell, (-ci, KEY['yf'], KEY['bed']), (KEY['x0'] - KEY['gap'] / 2 - 0.0003, p0 + 0.0002, KEY['top']), 'white_pc', MC)
    box(shell, (kx1 - KEY['gap'] / 2 + 0.0023, KEY['yf'], KEY['bed']), (ci, p0 + 0.0002, KEY['top']), 'white_pc', MC)
    # cheeks: convex rounded profile in (y, z), oak-tone palette cell
    prof = [(-hd, 0.0), (hd, 0.0), (hd, 0.099), (0.02, 0.091), (-0.11, 0.072), (-0.145, 0.062), (-hd, 0.050)]
    for s in (-1, 1):
        x_a, x_b = (s * ci, s * hw) if s > 0 else (s * hw, s * ci)
        M = MC @ T(x_a, 0, 0) @ Ry(math.pi / 2)            # local Z -> controller +X; profile (y, z) -> (-z?, y)
        pts = [(-z, y) for y, z in prof]                   # Ry(90): local x maps to -z, local y to y
        pts = pts if _ccw(pts) else list(reversed(pts))
        extrude(shell, pts, 0.0, x_b - x_a, 'oak_tone', M)
    # pitch and mod wheels in black slots on the wheel bay
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
    for i in range(8):
        cyl(shell, on_panel(-0.215 + 0.036 * i, 0.100), 0.0115, -0.002, 0.016, 16, 'black')
    box(shell, (-0.06, -0.026, -0.002), (0.06, 0.026, 0.0025), 'black', on_panel(0.215, 0.090))
    for i in range(4):
        box(shell, (-0.014, -0.010, -0.002), (0.014, 0.010, 0.006), 'fabric', on_panel(0.320 + 0.034 * i, 0.100))
    # indicators (lib_glow): display face plus four pad-column strips
    glow_rule = 'glow'
    box(glow, (-0.052, -0.019, 0.0025 + EPS), (0.052, 0.019, 0.0040), glow_rule, on_panel(0.215, 0.090))
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
        box(keys, (x0, KEY['yf'], bz0), (x1, by0 - 0.0025, KEY['top']), 'ivory', MC)               # front block
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
    extrude(p, rrect(0.100, 0.260, 0.015, 2), 0.0, 0.018, 'black', M)                           # base
    top = M @ T(0, 0.10, 0.018) @ Rx(math.radians(-7))                                          # pedal plate hinged at the back
    extrude(p, rrect(0.080, 0.200, 0.012, 2), 0.0015, 0.010, 'metal', top @ T(0, -0.100, 0))
    rod(p, apply(M, (-0.04, 0.10, 0.022)), apply(M, (0.04, 0.10, 0.022)), 0.006, 10, 'black')    # hinge
    # cable: out of the back, along the rug, up behind the stand to the rear jack
    zc = ON_RUG + 0.004
    pts = [apply(M, (0.0, 0.131, 0.010)), apply(M, (0.0, 0.16, zc)), apply(MCF, (lx - 0.02, 0.26, zc)), apply(MCF, (0.40, 0.29, zc)),
           apply(MCF, (0.37, 0.25, 0.20)), apply(MCF, (0.36, 0.215, 0.45)), apply(MCF, (0.355, 0.195, CTL['zb'] + 0.040)),
           apply(MCF, (0.355, CTL['d'] / 2 + EPS + 0.0005, CTL['zb'] + 0.040))]
    sweep(p, pts, 0.0035, 6, 'black')
    return p


def stool():
    p = Part('stool_keys__stool')
    cx, cy, _ = m_ctl(STOOL['local'])
    seat, R = STOOL['seat'], STOOL['r']
    M = T(cx, cy, 0)
    lathe(p, M, [(0, seat - 0.060), (R - 0.012, seat - 0.060), (R, seat - 0.046), (R, seat - 0.014), (R - 0.016, seat), (0, seat)],
          24, ['black', 'fabric', 'fabric', 'fabric', 'fabric'])
    hub_z = 0.10
    cyl(p, M, 0.020, hub_z + 0.02, seat - 0.060, 12, 'metal')                                 # post
    cyl(p, M, 0.028, seat - 0.110, seat - 0.075, 12, 'black')                                 # height collar
    cyl(p, M, 0.032, hub_z - 0.025, hub_z + 0.025, 12, 'black_metal')                         # hub
    for k in range(4):
        a = math.radians(45 + 90 * k) + CTL['yaw']
        d = np.array([math.cos(a), math.sin(a), 0])
        foot = np.array([cx, cy, ON_RUG + 0.012]) + d * STOOL['legs']
        sweep(p, [np.array([cx, cy, hub_z]) + d * 0.025, foot + np.array([0, 0, 0.010])], 0.011, 6, 'black_metal')
        cyl(p, T(*foot) @ T(0, 0, -0.012), 0.016, 0.0, 0.016, 10, 'rubber')
    return p


# ------------------------------------------------------------------ rug
def rug():
    p = Part('rug__rug')
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
    R = RACK['r']
    zf = ON_RUG + 0.012                                     # foot tube axis
    for x in (UPRIGHT_L, UPRIGHT_R):
        rod(p, (x, RACK_Y, zf), (x, RACK_Y, RACK['top']), R, 16, 'metal')                                    # upright
        rod(p, (x, RACK['foot_y'][0], zf), (x, RACK['foot_y'][1], zf), 0.012, 12, 'metal', hint=(1, 0, 0))   # foot
        for y0, y1 in ((RACK['foot_y'][0] - 0.02, RACK['foot_y'][0]), (RACK['foot_y'][1], RACK['foot_y'][1] + 0.02)):
            rod(p, (x, y0, zf), (x, y1, zf), 0.012, 12, 'rubber', hint=(1, 0, 0))
        clamp(p, (x, RACK_Y, zf + 0.028), (0, 0, 1))
        rod(p, (x, RACK_Y, RACK['side']), (x, RACK['side_y'], RACK['side']), R, 16, 'metal', hint=(1, 0, 0))   # side bar
        rod(p, (x, RACK['side_y'] - 0.012, RACK['side']), (x, RACK['side_y'], RACK['side']), R, 16, 'rubber', hint=(1, 0, 0))
        clamp(p, (x, RACK_Y, RACK['side']), (0, 0, 1))
        clamp(p, (x, RACK_Y, RACK['bar']), (0, 0, 1))
    rod(p, (UPRIGHT_L, RACK_Y, RACK['bar']), (UPRIGHT_R, RACK_Y, RACK['bar']), R, 16, 'metal', hint=(0, 0, 1))   # crossbar

    def stub(name, centre, tube_axis, out, length=0.045, r=0.010):
        out = unit(out)
        clamp(p, centre, tube_axis, hint=-out)          # wing bolt on the far side from the stub
        S = np.asarray(centre, float) + out * length
        rod(p, centre, S, r, 12, 'metal')
        MOUNTS[name] = (S, out, r)

    for name in ('tom1', 'tom2'):
        c = PADS[name][0]
        stub(name, (c[0], RACK_Y, RACK['bar']), (1, 0, 0), (0, -0.35, 1))
    stub('snare', (UPRIGHT_L, 0.30, RACK['side']), (0, 1, 0), (1, 0, 0.25))
    stub('tom3', (UPRIGHT_R, 0.30, RACK['side']), (0, 1, 0), (-1, 0, 0.35))
    stub('module', (UPRIGHT_L, RACK_Y, 0.72), (0, 0, 1), (-0.55, -0.75, 0.15))
    # cymbal booms: clamp on the upright, boom tube rising to just under the cymbal's tilter
    for name, (x, z) in (('hihat', (UPRIGHT_L, RACK['top'] - 0.035)), ('crash', (UPRIGHT_R, RACK['top'] - 0.035)), ('ride', (UPRIGHT_R, 0.715))):
        c, r_c, tilt = CYMBALS[name]
        M = tilt_toward(np.asarray(c, float), PLAYER, tilt)
        axis = M[:3, 2]
        S = np.asarray(c, float) - axis * (CYM_UNDER + TILTER)
        base = np.array([x, RACK_Y, z])
        out = unit(np.array([S[0] - x, S[1] - RACK_Y, 0.0]) if np.linalg.norm(S[:2] - base[:2]) > 0.03 else np.array([0.0, 1.0, 0.0]))
        clamp(p, base, (0, 0, 1), hint=-out)
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
        lathe(sh, M, [(0, z0), (r - 0.025, z0), (r - 0.004, z0 + 0.004), (r, z0 + 0.012), (r, -0.006), (r + 0.006, -0.004),
                      (r + 0.006, 0.008), (r - 0.010, 0.008), (r - 0.010, -0.002)],
              24, ['black', 'black', 'black', 'black', 'metal', 'metal', 'metal', 'metal'])
        for k in range(6 if name == 'snare' else 4):                                   # lugs
            a = 2 * math.pi * (k + 0.5) / (6 if name == 'snare' else 4)
            box(sh, (r - 0.002, -0.009, z0 + 0.018), (r + 0.010, 0.009, z0 + 0.044), 'metal', M @ Rz(a))
        # mount: block under the shell, arm to the rack stub
        mount = M @ T(0, 0, z0)
        box(sh, (-0.024, -0.024, -0.020), (0.024, 0.024, 0.0005), 'black_metal', mount)
        S, out, rr = MOUNTS[name]
        a0 = S + out * EPS
        tip = np.asarray(apply(mount, (0, 0, -0.012)))
        mid = a0 + out * 0.03
        sweep(sh, [a0, mid, tip], rr, 10, 'black_metal')
        # mesh head (lib_weave): thin disc just inside the rim, 0.3 mm clear of it
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
    box(p, (x0, y0, ON_RUG + 0.035), (x1, y1, ON_RUG + k['th']), 'black')                                      # tower
    box(p, (x0 - 0.02, y0 - 0.06, ON_RUG), (x1 + 0.02, y1 + 0.03, ON_RUG + 0.035), 'black_metal')              # base frame
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
    extrude(p, rrect(h['w'] + 0.016, h['l'], 0.014, 2), 0.0, 0.010, 'black', M)                                # base
    box(p, (-0.05, h['l'] / 2 - 0.085, 0.010), (0.05, h['l'] / 2 - 0.005, 0.070), 'black', M)                   # sensor housing
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
    extrude(body, rrect(m['w'], m['h'], 0.012, 2), -m['d'] / 2, m['d'] / 2, 'black', M)
    box(disp, (-0.055, 0.010, m['d'] / 2 + EPS), (0.025, 0.045, m['d'] / 2 + 0.0015), 'glow', M)
    cyl(body, M @ T(0.060, 0.022, m['d'] / 2), 0.016, -0.002, 0.014, 16, 'metal')                       # volume knob
    for i in range(6):
        box(body, (-0.070 + 0.022 * i, -0.040, m['d'] / 2 - 0.002), (-0.056 + 0.022 * i, -0.028, m['d'] / 2 + 0.004), 'fabric', M)
    # holder plate on the back, arm to the rack stub
    back = M @ T(0, 0, -m['d'] / 2)
    box(body, (-0.045, -0.035, -0.006), (0.045, 0.035, 0.0005), 'black_metal', back)
    S, out, rr = MOUNTS['module']
    tip = np.asarray(apply(back, (0, 0, -0.012)))
    sweep(body, [S + out * EPS, S + out * 0.03, tip], rr, 10, 'black_metal')
    # cable snake from the module's lower edge down toward the crossbar (pad cables continue from its end)
    lo = np.asarray(apply(M, (0.035, -m['h'] / 2 + 0.004, -0.010)))
    snake = [lo, lo + np.array([0.0, 0.0, -0.05]), np.array([0.90, 0.47, 0.60]), np.array([0.96, 0.50, 0.585]), np.array([0.99, 0.51, 0.585])]
    sweep(body, snake, 0.009, 8, 'black')
    MOUNTS['snake'] = (np.asarray(snake[-1]), unit(snake[-1] - snake[-2]), 0.009)
    down = unit(np.asarray(apply(M, (-0.05, -1.0, 0.0))) - np.asarray(apply(M, (-0.05, 0.0, 0.0))))
    MOUNTS['module_power'] = (np.asarray(apply(M, (-0.05, -m['h'] / 2, -0.008))), down, 0.0032)
    return body, disp


# ------------------------------------------------------------------ sticks
def sticks():
    p = Part('drum_sticks__pair')
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
CABLE_R = 0.0032


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
        sweep(p, pts, cr, 5, 'black')
    return p


# ------------------------------------------------------------------ everything
def build_all():
    MOUNTS.clear()
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
