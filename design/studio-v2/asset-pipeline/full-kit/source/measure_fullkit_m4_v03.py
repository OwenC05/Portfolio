"""Studio v2 full kit, stage M4 v03: CPU-only author measurements of the v03 source preparation.

Owner: actual-Claude author, task_23314c669e03 (root: scene-coordination/m4-v03-preparation-task.md).
Pure CPython + numpy. It never imports bpy, never starts Blender or a renderer, never exports or writes an asset.
It reads only pinned inputs and writes at most one file, the author receipt manifests/m4-v03-cpu-preparation.json,
with an exclusive create that refuses to overwrite.

Run from any directory (bounded: about 10 minutes of one CPU core, under 0.5 GB):
  python measure_fullkit_m4_v03.py           # measure the authored v03 candidate and the C2 search grid; print, write nothing
  python measure_fullkit_m4_v03.py --write   # the same, then write the receipt (exclusive create)
  python measure_fullkit_m4_v03.py --print   # the same, and print the receipt JSON to stdout (writes nothing)

Method: every M4 row is rebuilt from the v03 helper (and from the frozen v01 helper for comparison). Sub-parts are
selected by the helper's own measurement labels (Part.groups). Retained geometry is the accepted M3 parent v03 GLB
minus the 23 retired M4 proxies named in the frozen mapping. Intersections are exact triangle-triangle tests after
bounding-box culling, in bounded chunks. Eye rays use the fixed eye (Blender -0.35, -1.70, 1.345) and take the
nearest hit (the M4 builder's Blender ray method). Projections use pinhole versions of the M1 builder cameras: they
are planning estimates, not rendered pixels or visual approval.
"""
import sys, os, json, math, struct, hashlib, importlib.util, platform, time
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
STUDIO = os.path.dirname(os.path.dirname(KIT))
PINS = {   # frozen inputs: (path relative to design/studio-v2, sha256)
    'helperV01': ('asset-pipeline/full-kit/source/build_fullkit_m4_geometry.py', 'c7ce9d8e1792273d6aeffdc5b536233413fdca6c6fd16abf344827d6433ab1c0'),
    'parentGlb': ('asset-pipeline/full-kit/exports/studio-full-kit-m3-proposal-v03.glb', 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf'),
    'mapping': ('scene-coordination/m4-model-contract.json', '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98'),
    'inventory': ('asset-pipeline/full-kit/asset-inventory.json', 'eddc33b5a1c4b05184745c70ac71d25cb37bef295638f0b3ecaaa440a4001c87'),
}
HELPER_V03 = 'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v03.py'
BUILDER_V03 = 'asset-pipeline/full-kit/source/build_fullkit_m4_v03.py'
RECEIPT = os.path.join(KIT, 'manifests', 'm4-v03-cpu-preparation.json')
EYE = np.array([-0.35, -1.70, 1.345])
T0 = time.time()


def sha(rel):
    return hashlib.sha256(open(os.path.join(STUDIO, rel), 'rb').read()).hexdigest()


for key, (rel, h) in PINS.items():
    assert sha(rel) == h, f'{key} {rel} differs from its pinned identity'


def load(rel, name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(STUDIO, rel))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


G3 = load(HELPER_V03, 'fk_m4_geometry_v03')
G1 = load(PINS['helperV01'][0], 'fk_m4_geometry_v01')
CONTRACT = json.load(open(os.path.join(STUDIO, PINS['mapping'][0]), encoding='utf-8'))
R2 = lambda x: round(float(x), 4)
R5 = lambda x: round(float(x), 5)


def pct(a, t):
    return round((a - t) / t * 100.0, 3)


# ------------------------------------------------------------------ retained geometry: parent v03 minus the retired proxies
def load_parent():
    raw = open(os.path.join(STUDIO, PINS['parentGlb'][0]), 'rb').read()
    jl = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20 + jl])
    bo = 28 + jl

    def acc(i):
        a = doc['accessors'][i]
        v = doc['bufferViews'][a['bufferView']]
        ct = {5126: 'f4', 5125: 'u4', 5123: 'u2', 5121: 'u1'}[a['componentType']]
        n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
        assert v.get('byteStride', 0) in (0, np.dtype(ct).itemsize * n)
        arr = np.frombuffer(raw, dtype='<' + ct, count=a['count'] * n, offset=bo + v.get('byteOffset', 0) + a.get('byteOffset', 0))
        return arr.reshape(-1, n) if n > 1 else arr

    def local(n):
        if 'matrix' in n:
            return np.array(n['matrix'], float).reshape(4, 4).T
        x, y, z, w = n.get('rotation', [0, 0, 0, 1])
        R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                      [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                      [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
        M = np.eye(4)
        M[:3, :3] = R @ np.diag(n.get('scale', [1, 1, 1]))
        M[:3, 3] = n.get('translation', [0, 0, 0])
        return M
    out = {}

    def walk(i, Mp):
        n = doc['nodes'][i]
        M = Mp @ local(n)
        if 'mesh' in n:
            tris = []
            for p in doc['meshes'][n['mesh']]['primitives']:
                pos = acc(p['attributes']['POSITION']).astype(np.float64)
                idx = acc(p['indices']).astype(np.int64).reshape(-1, 3)
                w = (M[:3, :3] @ pos.T).T + M[:3, 3]
                w = np.stack([w[:, 0], -w[:, 2], w[:, 1]], 1)          # glTF Y up -> Blender Z up
                tris.append(w[idx])
            out[n['name']] = (np.concatenate(tris), n.get('extras', {}).get('assetId'))
        for c in n.get('children', []):
            walk(c, M)
    for r in doc['scenes'][0]['nodes']:
        walk(r, np.eye(4))
    retired = {r['name'] for r in CONTRACT['retiredParentLeaves']}
    assert retired <= set(out) and len(retired) == 23
    return {k: v for k, v in out.items() if k not in retired}


KEPT = load_parent()


# ------------------------------------------------------------------ exact triangle tests, bounded
def seg_tri(P0, P1, T):
    e1, e2 = T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]
    d = P1 - P0
    h = np.cross(d, e2)
    a = np.einsum('ij,ij->i', e1, h)
    ok = np.abs(a) > 1e-15
    f = np.where(ok, 1 / np.where(ok, a, 1), 0)
    s = P0 - T[:, 0]
    u = f * np.einsum('ij,ij->i', s, h)
    q = np.cross(s, e1)
    v = f * np.einsum('ij,ij->i', d, q)
    t = f * np.einsum('ij,ij->i', e2, q)
    return ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t >= 0) & (t <= 1)


def tri_pairs(A, B, budget=2_000_000):
    """Number of intersecting (a, b) triangle pairs; pairwise boxes are evaluated in chunks of at most `budget` pairs."""
    if not len(A) or not len(B):
        return 0
    la, ha = A.min(1), A.max(1)
    lb, hb = B.min(1), B.max(1)
    keep = np.all((lb <= ha.max(0)) & (hb >= la.min(0)), 1)
    B, lb, hb = B[keep], lb[keep], hb[keep]
    if not len(B):
        return 0
    step = max(1, budget // len(B))
    n = 0
    for s in range(0, len(A), step):
        m = np.all((la[s:s + step, None] <= hb[None]) & (lb[None] <= ha[s:s + step, None]), 2)
        i, j = np.nonzero(m)
        if not len(i):
            continue
        TA, TB = A[s:s + step][i], B[j]
        hit = np.zeros(len(i), bool)
        for k in range(3):
            hit |= seg_tri(TA[:, k], TA[:, (k + 1) % 3], TB) | seg_tri(TB[:, k], TB[:, (k + 1) % 3], TA)
        n += int(hit.sum())
    return n


def intersections(parts):
    inter, decals = {}, {}
    mine = {k: (p.triangles(), p.asset) for k, p in parts.items()}
    rows = sorted(mine)
    for a in rows:
        A, asset_a = mine[a]
        others = list(KEPT.items()) + [(b, mine[b]) for b in rows if b > a]
        for b, (B, asset_b) in others:
            if asset_a == asset_b:
                continue
            h = tri_pairs(A, B)
            if h:
                (decals if b.startswith('contact_decals') else inter)[f'{a} x {b}'] = h
    return inter, decals


def point_tri_dist(P, T):
    """Minimum distance from points P (n x 3) to triangles T (m x 3 x 3), chunked."""
    best = np.full(len(P), np.inf)
    for s in range(0, len(T), max(1, 400_000 // max(1, len(P)))):
        Tc = T[s:s + max(1, 400_000 // max(1, len(P)))]
        a, b, c = Tc[:, 0][None], Tc[:, 1][None], Tc[:, 2][None]
        p = P[:, None]
        ab, ac, ap = b - a, c - a, p - a
        n = np.cross(ab, ac)
        nn = np.einsum('...i,...i', n, n)
        nn = np.where(nn == 0, 1e-30, nn)
        w = np.einsum('...i,...i', np.cross(ab, ap), n) / nn
        v = np.einsum('...i,...i', np.cross(ap, ac), n) / nn
        u = 1 - v - w
        inside = (u >= 0) & (v >= 0) & (w >= 0)
        dplane = np.abs(np.einsum('...i,...i', ap, n)) / np.sqrt(nn)

        def seg(q0, q1):
            d = q1 - q0
            t = np.clip(np.einsum('...i,...i', p - q0, d) / np.maximum(np.einsum('...i,...i', d, d), 1e-30), 0, 1)
            return np.linalg.norm(p - (q0 + d * t[..., None]), axis=-1)
        dedge = np.minimum(np.minimum(seg(a, b), seg(b, c)), seg(c, a))
        best = np.minimum(best, np.where(inside, dplane, dedge).min(1))
    return best


def gap(A, B):
    """Smallest vertex-to-triangle distance either way between two triangle sets (a resting gap estimate)."""
    VA, VB = np.unique(A.reshape(-1, 3), axis=0), np.unique(B.reshape(-1, 3), axis=0)
    lo, hi = np.minimum(A.min((0, 1)), B.min((0, 1))) - 0.05, np.maximum(A.max((0, 1)), B.max((0, 1))) + 0.05
    near = lambda V, T: V[np.all((V >= T.min((0, 1)) - 0.02) & (V <= T.max((0, 1)) + 0.02), 1)]
    a, b = near(VA, B), near(VB, A)
    d = [point_tri_dist(a, B).min() if len(a) else np.inf, point_tri_dist(b, A).min() if len(b) else np.inf]
    return R5(min(d))


# ------------------------------------------------------------------ eye rays and cameras
class Rays:
    def __init__(self, parts):
        items = [(k, t) for k, (t, _) in KEPT.items()] + [(k, p.triangles()) for k, p in parts.items()]
        T = np.concatenate([t for _, t in items])
        self.owner = np.concatenate([[k] * len(t) for k, t in items])
        self.E1, self.E2 = T[:, 1] - T[:, 0], T[:, 2] - T[:, 0]
        self.S0 = EYE - T[:, 0]
        self.Q = np.cross(self.S0, self.E1)
        self.tq = np.einsum('ij,ij->i', self.E2, self.Q)

    def first(self, pts, slack=0.004):
        out = []
        for P in np.asarray(pts, float):
            d = P - EYE
            h = np.cross(d, self.E2)
            a = np.einsum('ij,ij->i', self.E1, h)
            ok = np.abs(a) > 1e-15
            f = np.where(ok, 1 / np.where(ok, a, 1), 0)
            u = f * np.einsum('ij,ij->i', self.S0, h)
            v = f * (self.Q @ d)
            t = f * self.tq
            m = ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 1e-6) & (t < 1 + slack / np.linalg.norm(d))
            out.append(str(self.owner[m][np.argmin(t[m])]) if m.any() else None)
        return out


def cam(yaw, pitch, fov, W, H):
    y, p = math.radians(yaw), math.radians(pitch)
    f = np.array([math.sin(y) * math.cos(p), math.cos(y) * math.cos(p), math.sin(p)])
    r = np.cross(f, [0, 0, 1])
    r /= np.linalg.norm(r)
    u = np.cross(r, f)
    k = (H / 2) / math.tan(math.radians(fov) / 2)

    def proj(P):
        d = np.asarray(P) - EYE
        z = d @ f
        return np.stack([W / 2 + k * (d @ r) / z, H / 2 - k * (d @ u) / z], -1)
    return proj, W, H


CAMS = {'music-1440': cam(44, -8, 58, 1440, 900), 'right-down': cam(58, -16, 58, 1440, 900), 'music-320-f74': cam(44, -8, 74, 320, 844)}
FEATURES = {   # the M4 builder's feature definitions (Blender z up, metres), sampled at most 150 vertices each
    'kickPedal': ('drum_kick__tower', lambda v: v[2] < 0.2 and v[1] < 0.40),
    'kickTowerUpper': ('drum_kick__tower', lambda v: v[2] > 0.2),
    'hihatPedal': ('drum_hihat_pedal__pedal', lambda v: True),
    'sustainPedal': ('ctl_sustain_pedal__pedal', lambda v: v[2] < 0.04),
    'throneSeat': ('drum_throne__throne', lambda v: v[2] > 0.40),
    'stoolSeat': ('stool_keys__stool', lambda v: v[2] > 0.43),
    'moduleDisplay': ('drum_module__display', lambda v: True),
}


def view_metrics(G, parts, full=True):
    R = Rays(parts)
    out = {}
    feats = {}
    for name, (row, cond) in FEATURES.items():
        V = [v for v in parts[row].v if cond(v)]
        samp = V[::max(1, len(V) // 150)]
        hits = R.first(samp)
        bl = {}
        for h in hits:
            if h not in (row, None):
                bl[h] = bl.get(h, 0) + 1
        feats[name] = {'unobstructed': sum(h in (row, None) for h in hits), 'of': len(samp),
                       'blockers': dict(sorted(bl.items(), key=lambda kv: -kv[1])[:4])}
    out['featureVisibility'] = feats
    ctl = np.concatenate([np.asarray(parts['ctl_body__shell'].v), np.asarray(parts['ctl_keys__keys'].v)])
    samp = ctl[::4]
    hits = R.first(samp)
    vis = samp[[h in ('ctl_body__shell', 'ctl_keys__keys', None) for h in hits]]
    az = lambda P: np.degrees(np.arctan2(P[:, 0] - EYE[0], P[:, 1] - EYE[1]))
    out['controllerAzimuth'] = {'unobstructedSpanDeg': R2(az(vis).max() - az(vis).min()), 'allVerticesSpanDeg': R2(az(ctl).max() - az(ctl).min()),
                                'unobstructedSamples': f'{len(vis)}/{len(samp)}', 'builderAssert': '>= 30.0 deg (unobstructed)'}
    tg = {}
    for t in ('target_dissertation', 'target_copilot', 'target_typeforge'):
        T3 = KEPT[t][0][0]
        g = np.linspace(0.03, 0.97, 9)
        pts = [T3[0] + (T3[1] - T3[0]) * u + (T3[2] - T3[1]) * w for u in g for w in g]
        hh = R.first(pts, slack=0.002)
        tg[t] = {'clear': sum(h == t for h in hh), 'of': len(pts)}
    out['targetRays'] = tg
    if not full:
        return out
    wk = np.array([G.apply(G.MC, (G.KEY['x0'] + (k + 0.5) * G.KEY['pitch'], G.KEY['yf'] + 0.03, G.KEY['top'] + 0.0005)) for k in range(29)])
    hk = R.first(wk, slack=0.002)
    pitch = {}
    for c, (pr, W, H) in CAMS.items():
        q = pr(wk)
        dd = np.linalg.norm(np.diff(q, axis=0), axis=1)
        pitch[c] = {'minPx': R2(dd.min()), 'maxPx': R2(dd.max()), 'keysInFrame': int(((q[:, 0] >= 0) & (q[:, 0] <= W) & (q[:, 1] >= 0) & (q[:, 1] <= H)).sum())}
    out['whiteKeys'] = {'topsFirstHitKeys': sum(h == 'ctl_keys__keys' for h in hk), 'of': 29, 'pitchPx (pinhole estimate)': pitch}
    cy = {}
    for name, (c, Rr, tilt) in G.CYMBALS.items():
        M = G.tilt_toward(np.asarray(c, float), G.PLAYER, tilt)
        bell = [G.apply(M, (0.035 * math.cos(a), 0.035 * math.sin(a), 0.026)) for a in np.linspace(0, 2 * math.pi, 16, endpoint=False)]
        edge = [G.apply(M, ((Rr - 0.003) * math.cos(a), (Rr - 0.003) * math.sin(a), -0.004)) for a in np.linspace(0, 2 * math.pi, 32, endpoint=False)]
        e = {}
        for lab, pts in (('bell', bell), ('edge', edge)):
            hh = R.first(pts)
            bl = {}
            for h in hh:
                if h not in ('drum_cymbals__cymbals', None):
                    bl[h] = bl.get(h, 0) + 1
            e[lab] = {'unobstructed': sum(h in ('drum_cymbals__cymbals', None) for h in hh), 'of': len(pts), 'blockers': bl}
        cy[name] = e
    out['cymbals'] = cy
    return out


# ------------------------------------------------------------------ geometry helpers
def sel(part, pred):
    idx = [i for lab, v0, v1, f0, f1 in part.groups if pred(lab) for i in range(v0, v1)]
    return np.asarray(part.v, float)[idx]


def sel_tris(part, pred):
    V = np.asarray(part.v, float)
    out = []
    for lab, v0, v1, f0, f1 in part.groups:
        if pred(lab):
            for face, _ in part.f[f0:f1]:
                out += [(V[face[0]], V[face[i]], V[face[i + 1]]) for i in range(1, len(face) - 1)]
    return np.asarray(out)


def local(M, P):
    P = np.asarray(P, float)
    return (np.c_[P, np.ones(len(P))] @ np.linalg.inv(np.asarray(M, float)).T)[:, :3]


def ext(P):
    return [R5(x) for x in (P.max(0) - P.min(0))]


def set_placement(G, cx=None, cy=None, yaw=None, stool_x=None, leg_phase=None):
    for k, v in (('cx', cx), ('cy', cy), ('yaw', yaw)):
        if v is not None:
            G.CTL[k] = v
    if stool_x is not None:
        G.STOOL['local'] = (stool_x, G.STOOL['local'][1])
    if leg_phase is not None:
        G.STOOL['leg_phase'] = leg_phase
    G.MC = G.T(G.CTL['cx'], G.CTL['cy'], G.CTL['zb']) @ G.Rz(G.CTL['yaw'])
    G.MCF = G.T(G.CTL['cx'], G.CTL['cy'], 0.0) @ G.Rz(G.CTL['yaw'])


# ------------------------------------------------------------------ dimensions (semantics: scene-m4-correction-plan.md / matrix 59FA954F)
def dimensions(G, parts):
    d = {}
    shell = parts['ctl_body__shell']
    L = local(G.MC, shell.v)
    lab = lambda name: local(G.MC, sel(shell, lambda l: l == name))
    d['C1 ctl_body'] = {'semantics': 'whole-asset envelope W x D x H in the controller frame incl. knobs/pads/keys-free shell',
                        'envelopeWDH': ext(L), 'knobTop': R5(lab('ctl.knobs')[:, 2].max()), 'cheekTop': R5(lab('ctl.cheeks')[:, 2].max()),
                        'panelTop': R5(lab('ctl.panel')[:, 2].max()), 'target': [0.99, 0.32, 0.095]}
    d['C1 ctl_body']['devPct'] = [pct(a, t) for a, t in zip(d['C1 ctl_body']['envelopeWDH'], [0.99, 0.32, 0.095])]
    st = np.asarray(parts['ctl_stand__frame'].v)
    stool_v = np.asarray(parts['stool_keys__stool'].v)
    d['C2 ctl_stand'] = {'semantics': 'stand own height, foot underside to arm top', 'ownHeight': R5(st[:, 2].max() - st[:, 2].min()),
                         'topAboveFloor': R5(st[:, 2].max()), 'target': 0.68, 'devPct': pct(st[:, 2].max() - st[:, 2].min(), 0.68),
                         'controllerUndersideZ': G.CTL['zb'], 'whiteKeyTopZ': R5(G.CTL['zb'] + G.KEY['top']),
                         'stoolSeatTopZ': R5(stool_v[:, 2].max()), 'keyTopAboveSeat': R5(G.CTL['zb'] + G.KEY['top'] - stool_v[:, 2].max())}
    rk = parts['drum_rack__rack']
    fr = sel(rk, lambda l: l == 'rack.frame')
    booms = sel(rk, lambda l: l.startswith('rack.boom.'))
    up_x = [G.UPRIGHT_L - G.RACK['r'], G.UPRIGHT_R + G.RACK['r']]
    allr = np.asarray(rk.v)
    d['C3/C4 drum_rack'] = {
        'semantics': 'frame = uprights, feet, side bars, crossbar and frame clamps; booms (drum_cymbals boom arms) and stubs separate',
        'uprightTubeOuterWidth': R5(up_x[1] - up_x[0]), 'frameWidthInclClamps': R5(fr[:, 0].max() - fr[:, 0].min()),
        'frameXRange': [R5(fr[:, 0].min()), R5(fr[:, 0].max())], 'frameOwnHeight': R5(fr[:, 2].max() - fr[:, 2].min()),
        'frameTopAboveFloor': R5(fr[:, 2].max()),
        'boomInclusiveWidth (frame + booms)': R5(np.r_[fr[:, 0], booms[:, 0]].max() - np.r_[fr[:, 0], booms[:, 0]].min()),
        'rowInclusiveWidth (frame + booms + stubs)': R5(allr[:, 0].max() - allr[:, 0].min()),
        'rowInclusiveXRange': [R5(allr[:, 0].min()), R5(allr[:, 0].max())], 'boomsTopZ': R5(booms[:, 2].max()), 'target': [1.16, 0.75]}
    r = d['C3/C4 drum_rack']
    r['devPct'] = {'tubeWidth': pct(r['uprightTubeOuterWidth'], 1.16), 'frameWidth': pct(r['frameWidthInclClamps'], 1.16),
                   'boomInclusiveWidth': pct(r['boomInclusiveWidth (frame + booms)'], 1.16), 'rowInclusiveWidth': pct(r['rowInclusiveWidth (frame + booms + stubs)'], 1.16),
                   'frameOwnHeight': pct(r['frameOwnHeight'], 0.75)}
    pads = {}
    sh, hd = parts['drum_pads__shells'], parts['drum_pads__heads']
    for name, (c, rr, depth, tilt) in G.PADS.items():
        M = G.tilt_toward(np.asarray(c, float), G.PLAYER, tilt)
        S = local(M, sel(sh, lambda l: l == f'pad.{name}.shell'))
        Lg = local(M, sel(sh, lambda l: l == f'pad.{name}.lugs'))
        H = local(M, sel(hd, lambda l: l == f'pad.{name}.head'))
        rad = lambda P: np.hypot(P[:, 0], P[:, 1])
        pads[name] = {'headDia': R5(2 * rad(H).max()), 'rimOuterDia': R5(2 * rad(S).max()), 'lugOuterDia': R5(2 * rad(Lg).max()),
                      'rimDevPct (0.25..0.31)': pct(2 * rad(S).max(), 0.31) if 2 * rad(S).max() > 0.31 else (pct(2 * rad(S).max(), 0.25) if 2 * rad(S).max() < 0.25 else 0.0)}
    d['C5 drum_pads'] = pads
    cy = {}
    for name, (c, Rr, tilt) in G.CYMBALS.items():
        M = G.tilt_toward(np.asarray(c, float), G.PLAYER, tilt)
        P = local(M, sel(parts['drum_cymbals__cymbals'], lambda l: l == f'cymbal.{name}'))
        dia = 2 * np.hypot(P[:, 0], P[:, 1]).max()
        cy[name] = {'dia': R5(dia), 'devPct': pct(dia, 0.38), 'centre': list(c)}
    d['C6/C7 drum_cymbals'] = cy
    h = G.HIHAT_PEDAL
    Mh = G.T(h['cx'], h['cy'], G.ON_RUG) @ G.Rz(h['yaw'])
    hb = local(Mh, sel(parts['drum_hihat_pedal__pedal'], lambda l: l == 'hihat.base'))
    d['C8/C9 drum_hihat_pedal'] = {'baseWL': ext(hb)[:2], 'inclusiveWL': ext(local(Mh, parts['drum_hihat_pedal__pedal'].v))[:2],
                                   'devPct': [pct(ext(hb)[0], 0.13), pct(ext(hb)[1], 0.33)]}
    m = G.MODULE
    az, upd = math.radians(m['az']), math.radians(m['up'])
    nrm = np.array([math.sin(az) * math.cos(upd), math.cos(az) * math.cos(upd), math.sin(upd)])
    Mm = G.frame(np.asarray(m['c'], float), nrm, hint=np.cross(np.array([0, 0, 1.0]), nrm))
    mc = local(Mm, sel(parts['drum_module__body'], lambda l: l == 'module.case'))
    d['C10 drum_module'] = {'caseFaceWHD': ext(mc), 'devPct': [pct(ext(mc)[0], 0.20), pct(ext(mc)[1], 0.15)]}
    rg = np.asarray(parts['rug__rug'].v)
    d['C11 rug (root conditional allowance 1.655 x 2.25)'] = {'outlineWD': ext(rg)[:2], 'devPctVsArt1.85x2.25': [pct(ext(rg)[0], 1.85), pct(ext(rg)[1], 2.25)],
                                                            'devPctVsAllowance1.655x2.25': [pct(ext(rg)[0], 1.655), pct(ext(rg)[1], 2.25)]}
    d['H1 keys'] = keys_check(G, parts)
    cab = {}
    for prt, pred, sides in ((parts['music_cables__runs'], lambda l: l.startswith('cable.'), 5), (parts['ctl_sustain_pedal__pedal'], lambda l: l == 'sustain.cable', 6),
                             (parts['drum_module__body'], lambda l: l == 'module.snake', 8)):
        for lab_, v0, v1, f0, f1 in prt.groups:
            if pred(lab_):
                ring = np.asarray(prt.v[v0:v0 + sides], float)
                cab[lab_] = R5(2 * np.linalg.norm(ring - ring.mean(0), axis=1).mean() * 1000)
    d['C12 cable diameters mm'] = cab
    d['C12 cable diameters mm']['musicCablesDevPct'] = sorted({pct(v / 1000, 0.006) for k, v in cab.items() if k.startswith('cable.')})
    sus = local(G.MCF @ G.T(*G.SUSTAIN['local'], G.ON_RUG), sel(parts['ctl_sustain_pedal__pedal'], lambda l: l == 'sustain.base'))
    d['sustain base (unchanged)'] = {'baseXY': ext(sus)[:2], 'devPct': [pct(ext(sus)[0], 0.10), pct(ext(sus)[1], 0.26)]}
    return d


def keys_check(G, parts):
    """H1: 29 white keys keep count, pitch, gaps and body fit; each white front block has a bevelled front-top lip."""
    K = G.KEY
    L = local(G.MC, parts['ctl_keys__keys'].v)
    front = L[np.abs(L[:, 1] - K['yf']) < 1e-7]                      # vertices on the white-key front faces
    xs = np.unique(np.round(front[:, 0], 6))                         # each front block contributes its two side planes x0 < x1
    assert len(xs) % 2 == 0
    blocks = list(zip(xs[0::2], xs[1::2]))
    cen = np.array([(a + b) / 2 for a, b in blocks])
    gaps = np.array([blocks[i + 1][0] - blocks[i][1] for i in range(len(blocks) - 1)])
    lip_z = K['top'] - front[:, 2].max()                              # vertical extent of the lip on the front face
    topv = L[np.abs(L[:, 2] - K['top']) < 1e-7]
    lip_y = topv[topv[:, 1] < K['yf'] + 0.02][:, 1].min() - K['yf']   # horizontal extent of the lip on the top face
    sh = local(G.MC, parts['ctl_body__shell'].v)
    ci = G.CTL['w'] / 2 - 0.022
    return {'whiteFrontBlocks': len(blocks), 'blockWidthMinMax': [R5(min(b - a for a, b in blocks)), R5(max(b - a for a, b in blocks))], 'pitchMinMax': [R5(np.diff(cen).min()), R5(np.diff(cen).max())], 'pitchTarget': K['pitch'],
            'gapMinMax': [R5(gaps.min()), R5(gaps.max())], 'gapTarget': K['gap'],
            'lipVerticalM': R5(lip_z), 'lipHorizontalM': R5(lip_y), 'lipRule': '>= 0.003 (root H1)', 'lipSegments': G.BEVEL_CLASSES['white_key_lip']['segments'],
            'keysXRange': [R5(L[:, 0].min()), R5(L[:, 0].max())], 'cheekInnerFacesX': [R5(-ci), R5(ci)],
            'keysInsideCheeks': bool(L[:, 0].min() > -ci and L[:, 0].max() < ci),
            'keysFrontY': R5(L[:, 1].min()), 'shellFrontY': R5(sh[:, 1].min()), 'keyBottomZ': R5(L[:, 2].min()), 'bedTopZ': K['bed'],
            'keysTriangles': parts['ctl_keys__keys'].tris, 'keysCeiling': parts['ctl_keys__keys'].ceiling}


# ------------------------------------------------------------------ K1 supports: every floor-supported row, every footprint vertex
FLOOR_ROWS = ('ctl_stand__frame', 'ctl_sustain_pedal__pedal', 'stool_keys__stool', 'drum_rack__rack', 'drum_kick__tower',
              'drum_hihat_pedal__pedal', 'drum_throne__throne')


def classify_point(R, x, y, margin):
    """('rug' | 'floor' | 'binding', signed clearance m): clearance inside the binding's inner edge, or beyond the rug's outer edge."""
    inner = min(x - (R['x0'] + R['bw']), (R['x1'] - R['bw']) - x, y - (R['y0'] + R['bw']), (R['y1'] - R['bw']) - y)
    outer = max(R['x0'] - x, x - R['x1'], R['y0'] - y, y - R['y1'])
    if inner >= margin:
        return 'rug', inner
    if outer >= margin:
        return 'floor', outer
    return 'binding', max(inner, outer)


def supports(G, parts, margin=0.020):
    """Footprint = every vertex within 0.5 mm of the row's lowest point. Rule (root K1): all footprint vertices on one
    surface (rug flat field or bare floor), at least `margin` from the binding on that side, resting 0.3 mm above it.
    The rug outline is treated as its rectangle (its 40 mm corner rounding only adds clearance near the corners)."""
    R = G.RUG
    rt = G.EPS + R['t']
    out = {}
    for row in FLOOR_ROWS:
        V = np.asarray(parts[row].v, float)
        low = V[V[:, 2] < V[:, 2].min() + 0.0005]
        cls = [classify_point(R, x, y, margin) for x, y, _ in low]
        surf = {c for c, _ in cls}
        z_surface = rt if surf == {'rug'} else (0.0 if surf == {'floor'} else None)
        err = None if z_surface is None else float(low[:, 2].min() - (z_surface + G.EPS))
        out[row] = {'footprintVertices': len(low), 'surfaces': sorted(surf), 'minClearanceFromBindingM': R5(min(c for _, c in cls)),
                    'footprintZ': [R5(low[:, 2].min()), R5(low[:, 2].max())],
                    'signedRestingHeightErrorM': None if err is None else R5(err),
                    'pass': len(surf) == 1 and 'binding' not in surf and err is not None and abs(err) < 1e-6}
    (cx, cy), feet = G.stool_feet()
    sv = np.asarray(parts['stool_keys__stool'].v, float)
    rows = []
    for (x, y), _, s_ in feet:
        near = sv[np.hypot(sv[:, 0] - x, sv[:, 1] - y) <= G.FOOT_R + 1e-6]
        c, clr = classify_point(R, x, y, margin + G.FOOT_R)
        zsurf = rt if s_ == 'rug' else 0.0
        rows.append({'centreXY': [R5(x), R5(y)], 'support': s_, 'footUndersideZ': R5(near[:, 2].min()), 'surfaceZ': R5(zsurf),
                     'signedRestingHeightErrorM': R5(near[:, 2].min() - zsurf - G.EPS), 'discClearanceFromBindingM': R5(clr - G.FOOT_R)})
    out['stoolFeet'] = {'seatCentre': [R5(cx), R5(cy)], 'footRadius': G.FOOT_R, 'feet': rows}
    rk = np.asarray(parts['drum_rack__rack'].v, float)
    feet_r = rk[rk[:, 2] < rk[:, 2].min() + 0.03]
    out['rackFootRugMarginsM (root: >= 0.150 each side)'] = {'left': R5(feet_r[:, 0].min() - R['x0']), 'right': R5(R['x1'] - feet_r[:, 0].max()),
                                                            'front': R5(feet_r[:, 1].min() - R['y0']), 'back': R5(R['y1'] - feet_r[:, 1].max())}
    cab = np.asarray(parts['music_cables__runs'].v, float)
    out['music_cables (draped, not footprints)'] = {'minZ': R5(cab[:, 2].min()), 'note': 'runs lie on the rug, cross the bound edge and reach the wall on the floor by design'}
    return out


def rug_record():
    """Root C11 allowance record: physical span between the retained obstacles, separate from the chosen clearances."""
    R = G3.RUG
    lamp = KEPT['fix_floor_lamp__base'][0].reshape(-1, 3)
    desk = KEPT['desk_frame__steel'][0].reshape(-1, 3)
    desk = desk[(desk[:, 2] < 0.06) & (desk[:, 1] > R['y0']) & (desk[:, 1] < R['y1']) & (desk[:, 0] < 1.0)]
    decal = KEPT['contact_decals__under_desk'][0].reshape(-1, 3)
    span = lamp[:, 0].min() - desk[:, 0].max()
    rec = {'outline': {'x': [R['x0'], R['x1']], 'y': [R['y0'], R['y1']], 'widthM': R5(R['x1'] - R['x0']), 'depthM': R5(R['y1'] - R['y0'])},
           'lampBaseMinX': R5(lamp[:, 0].min()), 'deskFrameFloorRunnerMaxX': R5(desk[:, 0].max()), 'underDeskDecalMaxX': R5(decal[:, 0].max()),
           'physicalSpanLampToDeskM': R5(span), 'chosenClearancesM': {'lamp': R5(lamp[:, 0].min() - R['x1']), 'deskFrame': R5(R['x0'] - desk[:, 0].max()),
                                                                     'underDeskDecal': R5(R['x0'] - decal[:, 0].max())}}
    mc = [k for k in KEPT if k.startswith('contact_decals__music')]
    for k in mc:
        P = KEPT[k][0].reshape(-1, 3)
        rec[k + ' (M6 dependency, not edited)'] = {'overhangBeyondRugM': {'left': R5(R['x0'] - P[:, 0].min()), 'right': R5(P[:, 0].max() - R['x1']),
                                                                          'front': R5(R['y0'] - P[:, 1].min()), 'back': R5(P[:, 1].max() - R['y1'])},
                                                   'zRange': [R5(P[:, 2].min()), R5(P[:, 2].max())], 'rugFieldTopZ': R5(G3.RT)}
    return rec


# ------------------------------------------------------------------ topology, classes, edges, normals
def face_normals(V, F):
    nrm, area = [], []
    for f in F:
        P = V[list(f)]
        n = np.cross(P - P.mean(0), np.roll(P, -1, 0) - P.mean(0)).sum(0)
        a = float(np.linalg.norm(n))
        nrm.append(n / a if a > 0 else n)
        area.append(a / 2)
    return nrm, area


def topology(G, parts):
    out = {}
    for row, part in parts.items():
        V = np.asarray(part.v, float)
        F = [f for f, _ in part.f]
        nrm, area = face_normals(V, F)
        nonplanar = max((float(np.abs((V[list(f)] - V[list(f)].mean(0)) @ nrm[i]).max()) for i, f in enumerate(F) if len(f) > 3), default=0.0)
        directed, edges = {}, {}
        for fi, f in enumerate(F):
            for i in range(len(f)):
                a, b = f[i - 1], f[i]
                directed[(a, b)] = directed.get((a, b), 0) + 1
                edges.setdefault((min(a, b), max(a, b)), []).append(fi)
        signed = []
        lab_of = {}
        for gi, (lab, v0, v1, f0, f1) in enumerate(part.groups):
            s_ = 0.0
            for fi in range(f0, f1):
                lab_of[fi] = lab
                f = F[fi]
                for i in range(1, len(f) - 1):
                    s_ += float(np.dot(V[f[0]], np.cross(V[f[i]], V[f[i + 1]]))) / 6.0
            signed.append(s_)
        hard = {}
        seams = {}
        sharp_n = 0
        for (a, b), fs in edges.items():
            if len(fs) != 2:
                continue
            ang = math.degrees(math.acos(max(-1.0, min(1.0, float(np.dot(nrm[fs[0]], nrm[fs[1]]))))))
            L = float(np.linalg.norm(V[a] - V[b]))
            sharp_n += ang > G.SHARP_DEG
            c0, c1 = part.cls[fs[0]], part.cls[fs[1]]
            if c0 and c1 and c0.startswith('bevel:') and c0 == c1:
                seams[c0[6:]] = seams.get(c0[6:], 0.0) + L
            C0, C1 = V[list(F[fs[0]])].mean(0), V[list(F[fs[1]])].mean(0)
            if ang >= 80 and float(np.dot(nrm[fs[0]], C1 - C0)) < 1e-9:
                lab = lab_of[fs[0]]
                status, why = G.sharp_reason(lab)
                k = f'{status} | {lab}'
                hard.setdefault(k, {'lengthM': 0.0, 'edges': 0, 'reason': why})
                hard[k]['lengthM'] += L
                hard[k]['edges'] += 1
        by_status = {}
        for k, v in hard.items():
            by_status[k.split(' | ')[0]] = by_status.get(k.split(' | ')[0], 0.0) + v['lengthM']
        out[row] = {'triangles': part.tris, 'faces': len(F), 'vertices': len(V), 'groups': len(part.groups),
                    'boundsMin': [R5(x) for x in V.min(0)], 'boundsMax': [R5(x) for x in V.max(0)],
                    'boundaryEdges': sum(1 for fs in edges.values() if len(fs) == 1), 'nonManifoldEdges': sum(1 for fs in edges.values() if len(fs) > 2),
                    'inconsistentlyWoundEdges': sum(1 for (a, b), c in directed.items() if c > 1 or (b, a) not in directed),
                    'invertedGroups': sum(1 for x in signed if x < 0), 'degenerateFaces': sum(1 for a in area if a < 1e-10),
                    'maxNonPlanarityM': R5(nonplanar), 'sharpEdgesOver40deg': sharp_n,
                    'bevelMiddleSeamLengthByClassM': {k: R2(v) for k, v in seams.items()},
                    'hardConvexEdgeLengthByStatusM': {k: R2(v) for k, v in sorted(by_status.items())},
                    'hardConvexEdgesByLabel': {k: {'lengthM': R2(v['lengthM']), 'edges': v['edges'], 'reason': v['reason']} for k, v in sorted(hard.items())}}
    return out


def classes_repr(G, parts):
    """The N1 face-class representation for S: per row, per group (label, face range) the class run-lengths, triangle counts and
    areas per class, plus sha256 of the canonical class array and of the authored corner normals (rounded 1e-6)."""
    out = {}
    for row, part in parts.items():
        V = np.asarray(part.v, float)
        F = [f for f, _ in part.f]
        _, area = face_normals(V, F)
        groups, totals = [], {}
        for lab, v0, v1, f0, f1 in part.groups:
            rle = []
            for c in part.cls[f0:f1]:
                c = c or 'unclassified'
                if rle and rle[-1][0] == c:
                    rle[-1][1] += 1
                else:
                    rle.append([c, 1])
            if any(c != 'unclassified' for c, _ in rle):
                groups.append({'label': lab, 'faces': [f0, f1], 'classRuns': rle})
            for fi in range(f0, f1):
                c = part.cls[fi] or 'unclassified'
                t = totals.setdefault(c, {'faces': 0, 'triangles': 0, 'areaM2': 0.0})
                t['faces'] += 1
                t['triangles'] += len(F[fi]) - 2
                t['areaM2'] += area[fi]
        cn = G.corner_normals(part)
        canon = json.dumps([[fi, v] + [round(c, 6) for c in cn[(fi, v)]] for fi, f in enumerate(F) for v in f], separators=(',', ':'))
        out[row] = {'classTotals': {k: {'faces': v['faces'], 'triangles': v['triangles'], 'areaM2': R5(v['areaM2'])} for k, v in sorted(totals.items())},
                    'classifiedGroups': groups,
                    'classArraySha256': hashlib.sha256(json.dumps([c or 'unclassified' for c in part.cls]).encode()).hexdigest(),
                    'authoredCornerNormalsSha256': hashlib.sha256(canon.encode()).hexdigest(), 'corners': sum(len(f) for f in F)}
    return out


def normal_check(G, parts):
    """N1 on CPU source data (root-adopted predicate, m4-v03-normal-check-contract-review.md): on EVERY triangle of an
    author-declared planar casing face, regardless of area, each authored corner normal within 2 deg of the triangle's
    oriented geometric normal (dot >= cos 2 deg, no abs). Round and bevel faces are excluded from that assertion; all
    corner normals must be finite and unit. The builder's v01 default (no custom normals) is reported for comparison.
    This cannot claim an export pass: the final glTF NORMAL accessors decide."""
    cos2 = math.cos(math.radians(2.0))
    out, fails = {}, []
    for row, part in parts.items():
        if not any(part.cls):
            continue
        auth, dflt = G.corner_normals(part), G.corner_normals(part, bevel_aware=False)
        bad_unit = sum(1 for n in auth.values() if not np.all(np.isfinite(n)) or abs(np.linalg.norm(n) - 1) > 1e-9)
        V = np.asarray(part.v, float)
        r = {'planarTriangles': 0, 'degeneratePlanarTriangles': 0, 'authoredMaxDeg': 0.0, 'authoredFailCorners': 0,
             'v01DefaultMaxDeg': 0.0, 'v01DefaultFailCorners': 0, 'nonUnitOrNonFiniteNormals': bad_unit}
        for fi, (face, _) in enumerate(part.f):
            if part.cls[fi] != 'planar':
                continue
            for i in range(1, len(face) - 1):
                tri = (face[0], face[i], face[i + 1])
                P = V[list(tri)]
                g = np.cross(P[1] - P[0], P[2] - P[0])
                if np.linalg.norm(g) < 1e-12:
                    r['degeneratePlanarTriangles'] += 1
                    continue
                g = g / np.linalg.norm(g)
                r['planarTriangles'] += 1
                for key, src in (('authored', auth), ('v01Default', dflt)):
                    for v in tri:
                        d = float(np.dot(src[(fi, v)], g))
                        deg = math.degrees(math.acos(max(-1.0, min(1.0, d))))
                        r[key + 'MaxDeg'] = R2(max(r[key + 'MaxDeg'], deg))
                        if d < cos2:
                            r[key + 'FailCorners'] += 1
                            if key == 'authored' and len(fails) < 50:
                                lab = next(l for l, v0, v1, f0, f1 in part.groups if f0 <= fi < f1)
                                fails.append({'row': row, 'label': lab, 'face': fi, 'vertex': v, 'deg': R2(deg)})
        out[row] = r
    return {'rows': out, 'authoredFailures (first 50)': fails}


def ledger_and_contract(G, parts):
    rows, tot = G.ledger(parts)
    added = {r['leaf']: r for r in CONTRACT['addedRows']}
    contract = {}
    for row, part in parts.items():
        a = added[row]
        contract[row] = {'assetId': a['assetId'] == part.asset, 'material': a['material'] == part.mat, 'castShadow': a['castShadow'] == part.casts,
                         'placed<=ceiling': part.tris <= a['placedTriangles'], 'refreshTriangles<=ceiling': rows[row]['refreshTriangles'] <= a['refreshTriangles']}
    return rows, tot, all(all(v.values()) for v in contract.values()), contract


# ------------------------------------------------------------------ the bounded C2 placement search (fixed grid, then a fixed refinement)
SEARCH = dict(cx=(1.25, 1.30, 1.35), cy=(-0.90, -0.85, -0.80, -0.75, -0.70), yaw=(-0.60, -0.70, -0.80), stool_x=(0.0, 0.10, 0.25), leg_phase=(0.0, 45.0))
REFINE = dict(dcx=(-0.025, 0.0, 0.025), dcy=(-0.025, 0.0, 0.025), dyaw=(-0.05, 0.0, 0.05))
SELECT = ('targets 81/81 each; unobstructed controller azimuth >= 30.5 deg (0.5 deg author margin over the builder assert); '
          'kick-pedal unobstructed fraction not below the v01 reference fraction (sample sets differ in size); then maximise the smaller of '
          'the throne-seat and sustain-pedal unobstructed fractions (both root recheck items); ties: the larger of the two, then nearest placement D '
          '(cx 1.30, cy -0.90, yaw -0.70). Revised once by the author after the first dry run, whose throne-first rule chose a sustain pedal at 59/116.')


def placement_ok(G):
    """Prefilter (root K1): stool feet, stand rubber ends and the sustain base all on the rug flat field, 20 mm clear of the binding."""
    _, feet = G.stool_feet()
    if {s_ for _, _, s_ in feet} != {'rug'}:
        return False
    pts = []
    for sx in (-1, 1):
        for y in (-0.195, 0.195):
            pts.append(G.apply(G.MCF, (0.30 * 1.033 * sx, y, 0)))
    for x in (-0.05, 0.05):
        for y in (-0.13, 0.13):
            pts.append(G.apply(G.MCF @ G.T(*G.SUSTAIN['local'], 0), (x, y, 0)))
    return all(classify_point(G.RUG, p[0], p[1], 0.020)[0] == 'rug' for p in pts)


def evaluate(G, c):
    set_placement(G, c['cx'], c['cy'], c['yaw'], c['stool_x'], c['leg_phase'])
    parts, _ = G.build_all()
    vm = view_metrics(G, parts, full=False)
    f = vm['featureVisibility']
    return dict(c, unobstructedAzimuthSpan=vm['controllerAzimuth']['unobstructedSpanDeg'],
                **{k: [f[k]['unobstructed'], f[k]['of']] for k in ('throneSeat', 'kickPedal', 'stoolSeat', 'hihatPedal', 'sustainPedal')},
                targetsMin=min(v['clear'] for v in vm['targetRays'].values()))


def search(kick_ref):
    G = load(HELPER_V03, 'fk_m4_geometry_v03_search')
    base = dict(G.CTL), dict(G.STOOL)
    cands, tried = [], 0
    for cx in SEARCH['cx']:
        for cy in SEARCH['cy']:
            for yaw in SEARCH['yaw']:
                for sx in SEARCH['stool_x']:
                    for lp in SEARCH['leg_phase']:
                        tried += 1
                        set_placement(G, cx, cy, yaw, sx, lp)
                        if not placement_ok(G):
                            continue
                        shell, glow, keys, _ = G.controller()
                        P = np.r_[np.asarray(shell.v), np.asarray(keys.v)]
                        if float(np.ptp(np.degrees(np.arctan2(P[:, 0] - EYE[0], P[:, 1] - EYE[1])))) < 30.5:
                            continue
                        cands.append(dict(cx=cx, cy=cy, yaw=yaw, stool_x=sx, leg_phase=lp))
    stage1 = [evaluate(G, c) for c in cands]

    def ok(r):
        return r['targetsMin'] == 81 and r['unobstructedAzimuthSpan'] >= 30.5 and r['kickPedal'][0] / r['kickPedal'][1] >= kick_ref[0] / kick_ref[1]

    def key(r):
        fr = (r['throneSeat'][0] / r['throneSeat'][1], r['sustainPedal'][0] / r['sustainPedal'][1])
        return (-round(min(fr), 6), -round(max(fr), 6), round(abs(r['cx'] - 1.30) + abs(r['cy'] + 0.90) + abs(r['yaw'] + 0.70), 6))
    best1 = sorted([r for r in stage1 if ok(r)], key=key)[0]
    stage2, tried2 = [], 0
    for dx in REFINE['dcx']:
        for dy in REFINE['dcy']:
            for dw in REFINE['dyaw']:
                tried2 += 1
                c = dict(cx=round(best1['cx'] + dx, 4), cy=round(best1['cy'] + dy, 4), yaw=round(best1['yaw'] + dw, 4),
                         stool_x=best1['stool_x'], leg_phase=best1['leg_phase'])
                set_placement(G, c['cx'], c['cy'], c['yaw'], c['stool_x'], c['leg_phase'])
                if placement_ok(G):
                    stage2.append(evaluate(G, c))
    allr = stage1 + [r for r in stage2 if r not in stage1]
    best = sorted([r for r in allr if ok(r)], key=key)[0]
    # stand height inside the size tolerance (own height 0.68 nominal vs 0.665): throne visibility only, same placement
    heights = {}
    for own in (0.68, 0.665, 0.65):
        G.CTL['zb'] = round(own + G.ON_RUG + G.EPS, 5)               # stand top = zb - EPS; foot underside = ON_RUG
        r = evaluate(G, {k: best[k] for k in ('cx', 'cy', 'yaw', 'stool_x', 'leg_phase')})
        heights[f'{own}'] = {'zb': G.CTL['zb'], 'throneSeat': r['throneSeat'], 'kickPedal': r['kickPedal'], 'sustainPedal': r['sustainPedal'],
                             'unobstructedAzimuthSpan': r['unobstructedAzimuthSpan'], 'withinSizeTolerance': 0.6596 <= own <= 0.7004}
    G.CTL.clear(); G.CTL.update(base[0]); G.STOOL.clear(); G.STOOL.update(base[1])
    return {'grid': SEARCH, 'combinations': tried, 'prefilter': 'root K1 support on the rug flat field (20 mm) for stool feet, stand ends and sustain base; '
            'all-vertex controller azimuth span >= 30.5 deg (an upper bound of the unobstructed span)', 'stage1Evaluated': len(stage1),
            'refinement': {'around': {k: best1[k] for k in ('cx', 'cy', 'yaw')}, 'deltas': REFINE, 'combinations': tried2, 'evaluated': len(stage2)},
            'selectionRule': SELECT, 'kickPedalReferenceV01': kick_ref, 'selected': best, 'standHeightVariants': heights,
            'results': sorted(allr, key=key)}


# ------------------------------------------------------------------ main
def builder_pin_ok():
    """The held builder must pin exactly the helper measured here (text check; the builder is never run here)."""
    p = os.path.join(STUDIO, BUILDER_V03)
    if not os.path.exists(p):
        return None
    import re
    m = re.search(r"^HELPER_SHA = '([0-9a-f]{64})'", open(p, encoding='utf-8').read(), re.M)
    return bool(m) and m.group(1) == sha(HELPER_V03)


def main():
    write = '--write' in sys.argv[1:]
    if write and os.path.exists(RECEIPT):
        raise SystemExit('Refusing to overwrite existing receipt: ' + RECEIPT)
    rec = {'schema': 'm4-v03-cpu-preparation/v1',
           'status': 'Author CPU measurements of the v03 source preparation. Not a paired GLB manifest, not an export, not visual approval. '
                     'S/Codex verifies numerically; root decides before any freeze, provenance/guard amendment, Blender run or export.',
           'command': 'python asset-pipeline/full-kit/source/measure_fullkit_m4_v03.py --write   (cwd design/studio-v2; any cwd works)',
           'environment': {'python': platform.python_version(), 'numpy': np.__version__, 'platform': platform.platform()},
           'inputs': {k: {'path': p, 'sha256': h} for k, (p, h) in PINS.items()} | {
               'helperV03': {'path': HELPER_V03, 'sha256': sha(HELPER_V03)},
               'builderV03 (held, not run)': {'path': BUILDER_V03, 'sha256': sha(BUILDER_V03) if os.path.exists(os.path.join(STUDIO, BUILDER_V03)) else None},
               'measureScript': {'path': 'asset-pipeline/full-kit/source/measure_fullkit_m4_v03.py', 'sha256': sha('asset-pipeline/full-kit/source/measure_fullkit_m4_v03.py')}},
           'builderPinsMeasuredHelper': builder_pin_ok(),
           'retainedGeometry': f'{len(KEPT)} parent v03 mesh nodes after removing the 23 retired M4 proxies; {sum(len(t) for t, _ in KEPT.values())} triangles',
           'bevelClasses': G3.BEVEL_CLASSES, 'sharpReasons': [list(x) for x in G3.SHARP_REASONS]}
    # v01 frozen reference (same methods)
    p1, _ = G1.build_all()
    r1 = {'placement': {'controller': {k: G1.CTL[k] for k in ('cx', 'cy', 'yaw', 'zb')}, 'stoolLocal': list(G1.STOOL['local'])},
          'trianglesPerRow': {k: p.tris for k, p in p1.items()}, 'stage': G1.ledger(p1)[1], 'supports': supports_v01(G1, p1)}
    r1['views'] = view_metrics(G1, p1)
    print('v01 reference', json.dumps(r1['views']['featureVisibility']['kickPedal']), f'{time.time() - T0:.0f}s', flush=True)
    rec['v01FrozenReference'] = r1
    # the authored v03 candidate
    parts, meta = G3.build_all()
    rows, tot, contract_ok, contract = ledger_and_contract(G3, parts)
    r = {'placement': {'controller': {k: G3.CTL[k] for k in ('cx', 'cy', 'yaw', 'zb')}, 'stoolLocal': list(G3.STOOL['local']),
                       'stoolLegPhaseDeg': G3.STOOL['leg_phase'], 'rideX': G3.RIDE_X},
         'keys': {'white': meta['whiteKeys'], 'black': meta['blackKeys']},
         'trianglesPerRow': {k: p.tris for k, p in parts.items()}, 'stage': tot, 'contractRowsHold': contract_ok, 'rowLedger': rows,
         'dimensions': dimensions(G3, parts), 'supportsK1': supports(G3, parts), 'rugC11': rug_record()}
    print('v03 ledger', json.dumps(tot), f'{time.time() - T0:.0f}s', flush=True)
    r['topology'] = topology(G3, parts)
    r['normalsN1'] = normal_check(G3, parts)
    r['faceClassesN1'] = classes_repr(G3, parts)
    print('v03 topology/normals', f'{time.time() - T0:.0f}s', flush=True)
    T = {k: p.triangles() for k, p in parts.items()}
    r['restingGapsM'] = {
        'stool | rug': gap(T['stool_keys__stool'], T['rug__rug']), 'stand | rug': gap(T['ctl_stand__frame'], T['rug__rug']),
        'shell | stand': gap(T['ctl_body__shell'], T['ctl_stand__frame']), 'keys | shell': gap(T['ctl_keys__keys'], T['ctl_body__shell']),
        'sustain | rug': gap(T['ctl_sustain_pedal__pedal'], T['rug__rug']), 'rack | rug': gap(T['drum_rack__rack'], T['rug__rug']),
        'kick | rug': gap(T['drum_kick__tower'], T['rug__rug']), 'hihat pedal | rug': gap(T['drum_hihat_pedal__pedal'], T['rug__rug']),
        'throne | rug': gap(T['drum_throne__throne'], T['rug__rug']), 'pad shells | rack': gap(T['drum_pads__shells'], T['drum_rack__rack']),
        'cymbals | rack': gap(T['drum_cymbals__cymbals'], T['drum_rack__rack']), 'module | rack': gap(T['drum_module__body'], T['drum_rack__rack']),
        'sticks | pad shells': gap(T['drum_sticks__pair'], T['drum_pads__shells']), 'cables | rug': gap(T['music_cables__runs'], T['rug__rug']),
        'cables | module': gap(T['music_cables__runs'], T['drum_module__body']), 'cables | pad shells': gap(T['music_cables__runs'], T['drum_pads__shells']),
        'cables | kick': gap(T['music_cables__runs'], T['drum_kick__tower']), 'cables | hihat pedal': gap(T['music_cables__runs'], T['drum_hihat_pedal__pedal']),
        'cables | shell': gap(T['music_cables__runs'], T['ctl_body__shell'])}
    inter, decals = intersections(parts)
    r['intersections'] = {'m4VersusRetainedOrOtherM4Asset': inter, 'm4VersusContactDecalsRecordedOnly': decals}
    print('v03 intersections', json.dumps(inter), json.dumps(decals), f'{time.time() - T0:.0f}s', flush=True)
    r['views'] = view_metrics(G3, parts)
    print('v03 views', json.dumps({k: r['views'][k] for k in ('controllerAzimuth', 'targetRays')}), f'{time.time() - T0:.0f}s', flush=True)
    rec['v03Candidate'] = r
    kick_ref = (r1['views']['featureVisibility']['kickPedal']['unobstructed'], r1['views']['featureVisibility']['kickPedal']['of'])
    rec['c2Search'] = search(kick_ref)
    sel_ = rec['c2Search']['selected']
    rec['v03Candidate']['matchesSearchSelection'] = all(abs(G3.CTL[k] - sel_[k]) < 1e-9 for k in ('cx', 'cy', 'yaw')) and \
        abs(G3.STOOL['local'][0] - sel_['stool_x']) < 1e-9 and abs(G3.STOOL['leg_phase'] - sel_['leg_phase']) < 1e-9
    print('search selected', json.dumps(sel_), 'matches helper', rec['v03Candidate']['matchesSearchSelection'], f'{time.time() - T0:.0f}s', flush=True)
    rec['elapsedSeconds'] = round(time.time() - T0, 1)
    text = json.dumps(rec, indent=1, default=str)
    if write:
        with open(RECEIPT, 'x', encoding='utf-8', newline='\n') as f:
            f.write(text + '\n')
        print('written', RECEIPT, hashlib.sha256((text + '\n').encode('utf-8')).hexdigest())
    else:
        print('summary only (use --write for the receipt):', len(text), 'bytes of JSON')
    if '--print' in sys.argv[1:]:
        print('JSON-BEGIN')
        print(text)


def supports_v01(G, parts):
    """The same K1 classification for the frozen v01 reference (v01 has no rug_support helper)."""
    R = G.RUG
    out = {}
    for row in FLOOR_ROWS:
        V = np.asarray(parts[row].v, float)
        low = V[V[:, 2] < V[:, 2].min() + 0.0005]
        cls = [classify_point(R, x, y, 0.020) for x, y, _ in low]
        out[row] = {'surfaces': sorted({c for c, _ in cls}), 'minClearanceFromBindingM': R5(min(c for _, c in cls)), 'footprintZ': R5(low[:, 2].min())}
    sv = np.asarray(parts['stool_keys__stool'].v, float)
    feet = []
    for k in range(4):
        cx, cy, _ = G.m_ctl(G.STOOL['local'])
        a = math.radians(45 + 90 * k) + G.CTL['yaw']
        x, y = cx + math.cos(a) * G.STOOL['legs'], cy + math.sin(a) * G.STOOL['legs']
        near = sv[np.hypot(sv[:, 0] - x, sv[:, 1] - y) <= 0.016 + 1e-6]
        c, clr = classify_point(R, x, y, 0.036)
        feet.append({'centreXY': [R5(x), R5(y)], 'support': c, 'footUndersideZ': R5(near[:, 2].min()),
                     'heightAboveSurfaceM': R5(near[:, 2].min() - (G.EPS + R['t'] if c == 'rug' else 0.0))})
    out['stoolFeet'] = feet
    return out


if __name__ == '__main__':
    main()
