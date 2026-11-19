import math, json, sys

EYE = (-0.7, 2.8, 3.4)
VIEWS = {
    'desktop-home 1440x900': (1440, 900, 58, -4, -6),
    'phone-home 390x844': (390, 844, 64, -13, -8),
    'phone-home 320x844': (320, 844, 64, -13, -8),
    'phone-home 320x568': (320, 568, 64, -13, -8),
}

def cam(yaw, pitch):
    h, e = math.radians(yaw), math.radians(pitch)
    f = (math.sin(h) * math.cos(e), math.sin(e), -math.cos(h) * math.cos(e))
    r = (math.cos(h), 0.0, math.sin(h))
    u = (r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0])
    return f, r, u

def dot(a, b): return sum(x * y for x, y in zip(a, b))

def proj(p, view):
    W, H, fov, yaw, pitch = view
    f, r, u = cam(yaw, pitch)
    d = tuple(p[i] - EYE[i] for i in range(3))
    z = dot(d, f)
    F = (H / 2) / math.tan(math.radians(fov / 2))
    return (W / 2 + dot(d, r) / z * F, H / 2 - dot(d, u) / z * F, z)

def azel(p):
    d = tuple(p[i] - EYE[i] for i in range(3))
    return (math.degrees(math.atan2(d[0], -d[2])), math.degrees(math.atan2(d[1], math.hypot(d[0], d[2]))))

def rect(points, view):
    q = [proj(p, view) for p in points]
    return (min(a[0] for a in q), min(a[1] for a in q), max(a[0] for a in q), max(a[1] for a in q))

def azrect(points):
    q = [azel(p) for p in points]
    return (min(a[0] for a in q), max(a[0] for a in q), min(a[1] for a in q), max(a[1] for a in q))

def box(c, size, yaw=0.0):
    pts = []
    for sx in (-.5, .5):
        for sy in (-.5, .5):
            for sz in (-.5, .5):
                x, y, z = sx * size[0], sy * size[1], sz * size[2]
                pts.append((c[0] + x * math.cos(yaw) + z * math.sin(yaw), c[1] + y, c[2] - x * math.sin(yaw) + z * math.cos(yaw)))
    return pts

# Room objects, world units, from build-studio.ts
OBJ = {
    'typeforge face': box((-0.11 + 0.054 * math.sin(-0.3), 2.44, -0.13 + 0.054 * math.cos(-0.3)), (0.8, 1.34, 0.0), -0.3),
    'typeforge casing': box((-0.11, 2.44, -0.13), (0.93, 1.47, 0.1), -0.3),
    'speaker box': box((0.72, 1.94, -0.2), (0.44, 0.64, 0.42)),
    'wall lights': [(-0.15 - 0.3, 3.85 - 0.3, -2.01), (-0.15 + 4 * 0.34 + 0.3, 3.85 + 0.26 + 0.3, -2.01)],
    'acoustic panel 1': box((1.8, 2.85, -2.075), (0.87, 1.78, 0.07)),
    'left cymbal': box((1.74, 2.15, -1.30), (0.8, 0.1, 0.8)),
    'left tom pad': box((2.24, 1.7, -1.12), (0.58, 0.2, 0.58)),
    'studio monitor': box((-1.61, 3.52, -0.64), (1.42, 0.86, 0.1)),
    'dissertation face': box((-1.61, 2.38, -0.216), (1.88, 1.06, 0.0)),
    'pendant': box((-1.6, 4.02, 0.3), (1.9, 0.08, 0.17)),
}

# Character: build-v01 conservative five-pose sweep, Blender metres -> glTF (X, Z, -Y)
SW_MIN = (-0.1429218412182589, -0.24962987609126763, -0.13634890921333032)
SW_MAX = (0.14795153446414666, 0.3060847581169863, 0.1354826004050036)
NE_MIN = (-0.14062344492413104, -0.2358040977269411, -0.1354877119883895)
NE_MAX = (0.1372770096641034, 0.30068186298012733, 0.1254333845572546)

def character(anchor, s, mn=SW_MIN, mx=SW_MAX):
    th = math.atan2(EYE[0] - anchor[0], EYE[2] - anchor[2])
    pts = []
    for x in (mn[0], mx[0]):
        for y in (mn[1], mx[1]):
            for z in (mn[2], mx[2]):
                X, Y, Z = x * s, y * s, z * s
                pts.append((anchor[0] + X * math.cos(th) + Z * math.sin(th), anchor[1] + Y, anchor[2] - X * math.sin(th) + Z * math.cos(th)))
    return pts, th

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'check':
        v = VIEWS['desktop-home 1440x900']
        for n, pts in OBJ.items():
            print(n, 'px', [round(a) for a in rect(pts, v)], 'az/el', [round(a, 2) for a in azrect(pts)])
        v = VIEWS['phone-home 390x844']
        for n in ('dissertation face', 'studio monitor'):
            print('390', n, [round(a) for a in rect(OBJ[n], v)])
    else:
        ax, ay, az_, s = map(float, sys.argv[2:6])
        anchor = (ax, ay, az_)
        pts, th = character(anchor, s)
        npts, _ = character(anchor, s, NE_MIN, NE_MAX)
        dist = math.dist(anchor, EYE)
        print('anchor', anchor, 'scale', s, 'yaw deg', round(math.degrees(th), 3), 'quat xyzw', (0, round(math.sin(th / 2), 5), 0, round(math.cos(th / 2), 5)), 'dist', round(dist, 3))
        print('world sweep AABB', [round(min(p[i] for p in pts), 3) for i in range(3)], [round(max(p[i] for p in pts), 3) for i in range(3)])
        print('sweep az/el', [round(a, 2) for a in azrect(pts)], ' neutral az/el', [round(a, 2) for a in azrect(npts)])
        for n, pts2 in OBJ.items():
            print('   ', n, [round(a, 2) for a in azrect(pts2)])
        extra = {
            'desktop yaw+22 pitch 0': (1440, 900, 58, 22, 0),
            'phone390 yaw+22 pitch 0': (390, 844, 64, 22, 0),
            'phone320 yaw+22 pitch 0': (320, 844, 64, 22, 0),
            'short320 yaw+22 pitch 0': (320, 568, 64, 22, 0),
            'desktop right-up 58/12': (1440, 900, 58, 58, 12),
            'desktop left-down -38/-16': (1440, 900, 58, -38, -16),
            'phone390 one right press?': (390, 844, 64, 2, -8),
        }
        for n, v in list(VIEWS.items()) + list(extra.items()):
            r = rect(pts, v); rn = rect(npts, v)
            F = (v[1] / 2) / math.tan(math.radians(v[2] / 2))
            print(n, 'sweep px', [round(a) for a in r], 'neutral px', [round(a) for a in rn], 'w,h', round(rn[2] - rn[0]), round(rn[3] - rn[1]),
                  'eye disc px', round(2 * 0.052 * 0.6029863 * s / dist * F, 1), 'pupil px', round(2 * 0.022 * 0.6029863 * s / dist * F, 1))
