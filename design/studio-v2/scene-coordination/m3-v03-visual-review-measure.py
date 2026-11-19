"""Independent M3 v03 visual review: read-only pixel measurements.

Reviewer evidence for task_3921b5029044 / ctx_c6e8f878d9d4. Reads root's capture
receipt and the 26 captured PNGs, plus the earlier M2 captures as baselines.
Writes only m3-v03-visual-review-measurements.json and
m3-v03-visual-review-crops.png beside this file. No source, asset, camera or
threshold is touched; nothing is rendered or captured.

Run from the repository root:  python design/studio-v2/scene-coordination/m3-v03-visual-review-measure.py
"""
import hashlib
import json
import os
from collections import Counter

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.getcwd()
ART = '.omx/artifacts/visual-ralph/portfolio-immersive-v2/'
M3 = ART + 'full-kit-m3-v03/'
RECEIPT = '.omx/context/full-kit-m3-v03-runtime-capture-v01.json'
RECEIPT_SHA = '641328d42c029b00979d41324df213190e168526af5447689cb50713652098b0'
OUT_DIR = 'design/studio-v2/scene-coordination/'
OUT_JSON = OUT_DIR + 'm3-v03-visual-review-measurements.json'
OUT_PNG = OUT_DIR + 'm3-v03-visual-review-crops.png'

# Same-pose earlier captures used as "before" images. v05 is the accepted M2
# parent; where v05 has no capture of a pose, the newest earlier one is used and
# the known M2 repairs between them (v03 lens, v05 PC front/glow) are expected.
PARENT = {
    'scene-home-1440x900-f58.png': 'full-kit-m2-v05',
    'scene-home-1024x768-f58.png': 'full-kit-m2-v05',
    'scene-mid-right-1440x900-f58.png': 'full-kit-m2-v05',
    'scene-music-1440x900-f58.png': 'full-kit-m2-v05',
    'scene-music-390x844-f74.png': 'full-kit-m2-v05',
    'scene-home-390x844-f74.png': 'full-kit-m2-v03',
    'scene-home-320x844-f74.png': 'full-kit-m2-v03',
    'scene-right-down-1440x900-f58.png': 'full-kit-m2-v03',
    'scene-left-down-1440x900-f58.png': 'full-kit-m2-v02',
    'scene-left-down-390x844-f74.png': 'full-kit-m2-v02',
    'scene-left-down-320x844-f74.png': 'full-kit-m2-v02',
    'scene-music-320x844-f74.png': 'full-kit-m2-v02',
}


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def rgb(path):
    return np.asarray(Image.open(path).convert('RGB')).astype(np.int32)


receipt_sha = sha(RECEIPT)
assert receipt_sha == RECEIPT_SHA, receipt_sha
receipt = json.loads(open(RECEIPT, 'rb').read().decode('utf-8-sig'))
REC = {r['filename']: r for r in receipt['records']}
COMP = {c['filename']: c for c in receipt['composites']}
out = {'receiptSha256': receipt_sha, 'selected': receipt['selected'], 'images': {}, 'parents': {}}
for entry in receipt['records'] + receipt['composites']:
    h = sha(M3 + entry['filename'])
    assert h == entry['sha256'] and os.path.getsize(M3 + entry['filename']) == entry['bytes'], entry['filename']
    out['images'][entry['filename']] = h
assert len(out['images']) == 26 and len(os.listdir(M3)) == 26
for name, folder in PARENT.items():
    out['parents'][name] = {'folder': folder, 'sha256': sha(ART + folder + '/' + name)}

def target_mask(proj, W, H):
    """Mask of a project target's quad, or None when any corner is behind the camera."""
    if any(not (0 < v[2] < 1) for v in proj['pixelVertices']):
        return None
    mask_img = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask_img).polygon([tuple(v[:2]) for v in proj['pixelVertices']], fill=1)
    return np.asarray(mask_img).astype(bool)


# --------------------------------------------------------------------------
# 1. Keycap pitch. Scan lines run parallel to the keyboard rows; the direction
#    is interpolated between the back and front top edges of the keycap leaf's
#    projected box in root's receipt (direction only). Positions come from the
#    pixels: each dark gap between two neighbouring caps is a luminance minimum,
#    refined to sub-pixel by a parabola. Pitch = least-squares slope of gap
#    position against gap index over one run of consecutive 1u caps, measured
#    along the row line (Euclidean, not just x).
# --------------------------------------------------------------------------
STEP = 0.25


def bilinear(L, x, y):
    x0 = np.floor(x).astype(int)
    y0 = np.floor(y).astype(int)
    fx, fy = x - x0, y - y0
    return (L[y0, x0] * (1 - fx) * (1 - fy) + L[y0, x0 + 1] * fx * (1 - fy)
            + L[y0 + 1, x0] * (1 - fx) * fy + L[y0 + 1, x0 + 1] * fx * fy)


def profile(L, p0, p1, half):
    d = p1 - p0
    n = float(np.hypot(*d))
    u = d / n
    v = np.array([-u[1], u[0]])
    s = np.arange(0, n, STEP)
    offs = np.arange(-half, half + 1e-9, 0.5)
    acc = np.zeros(len(s))
    for o in offs:
        p = p0[None, :] + s[:, None] * u[None, :] + o * v[None, :]
        acc += bilinear(L, p[:, 0], p[:, 1])
    return s, acc / len(offs), u


def gaps(s, p, prom):
    k = int(round(1 / STEP))
    q = np.convolve(p, np.ones(k) / k, mode='same')
    w = int(round(2.5 / STEP))
    found = []
    for i in range(2 * w, len(q) - 2 * w - 1):
        if (q[i] == q[i - w:i + w + 1].min() and q[i - 2 * w:i].max() - q[i] >= prom
                and q[i + 1:i + 2 * w + 1].max() - q[i] >= prom):
            if found and s[i] - found[-1] < 1.5:
                continue
            a, b, c = q[i - 1], q[i], q[i + 1]
            den = a - 2 * b + c
            found.append(float(s[i] + (0.5 * (a - c) / den if den else 0) * STEP))
    return found


def longest_run(pos, lo, hi):
    best, i = [], 0
    while i < len(pos) - 1:
        j = i
        while j < len(pos) - 1 and lo <= pos[j + 1] - pos[j] <= hi:
            j += 1
        if j - i + 1 > len(best):
            best = pos[i:j + 1]
        i = j + 1
    return best


def tight_run(pos, expect):
    run = longest_run(pos, 0.8 * expect, 1.25 * expect)
    for _ in range(3):
        if len(run) < 4:
            break
        m = float(np.median(np.diff(run)))
        run = longest_run(pos, 0.92 * m, 1.08 * m)
    return run


# name -> (expected pitch for the gap search, half band, prominence,
#          per-row window of the scan line's y at the keyboard's left edge)
# Row 1 is the number row (furthest), row 4 the lower letter row. The bottom
# row has only three 1u caps and is not measurable this way.
PITCH_VIEWS = {
    'scene-home-1440x900-f58.png': (16.6, 0.5, 2.5, [(660.9, 663.4), (668.7, 671.2), (677.5, 678.7), (683.1, 685.0)]),
    'scene-home-1024x768-f58.png': (14.2, 0.25, 2.0, [(564.1, 566.0), (570.1, 572.0), (578.2, 578.9), (583.5, 584.8)]),
    'scene-home-390x844-f74.png': (10.9, 0.25, 1.2, [(547.4, 549.2), (552.0, 554.1), (557.5, 558.4), (561.2, 562.1)]),
    'scene-home-320x844-f74.png': (10.9, 0.25, 1.2, [(547.4, 549.2), (552.0, 554.1), (557.5, 558.4), (561.2, 562.1)]),
}
out['keyPitch'] = {}
for name, (expect, half, prom, windows) in PITCH_VIEWS.items():
    L = rgb(M3 + name).mean(axis=2)
    c = REC[name]['meshBounds']['kb_keycaps__caps']['pixelBoxCorners']
    B0, F0, B1, F1 = [np.array(c[i][:2]) for i in (2, 3, 6, 7)]
    depth = float(np.hypot(*(F0 - B0)))
    lines = []
    for t in np.arange(-0.1, 1.5, 0.5 / depth):
        p0, p1 = B0 + (F0 - B0) * t, B1 + (F1 - B1) * t
        s, p, u = profile(L, p0, p1, half)
        run = tight_run(gaps(s, p, prom), expect)
        if len(run) >= 5:
            k = np.arange(len(run))
            fit = np.polyfit(k, run, 1)
            resid = np.array(run) - np.polyval(fit, k)
            se = float(np.sqrt((resid ** 2).sum() / (len(run) - 2) / ((k - k.mean()) ** 2).sum()))
            a, b = p0 + run[0] * u, p0 + run[-1] * u
            lines.append({'yLeft': float(p0[1]), 'gaps': len(run), 'pitch': float(fit[0]), 'se': se,
                          'endToEnd': (run[-1] - run[0]) / (len(run) - 1),
                          'minSpacing': float(np.diff(run).min()), 'maxSpacing': float(np.diff(run).max()),
                          'from': [float(a[0]), float(a[1])], 'to': [float(b[0]), float(b[1])]})
    rows = []
    for index, (lo, hi) in enumerate(windows, 1):
        cand = [l for l in lines if lo - 0.05 <= l['yLeft'] <= hi + 0.05]
        most = max(l['gaps'] for l in cand)
        cand = [l for l in cand if l['gaps'] == most]
        best = min(cand, key=lambda l: l['se'])
        pitches = [l['pitch'] for l in cand]
        rows.append({'row': index, 'scanLines': len(cand), 'gaps': most, 'intervals': most - 1,
                     'pitchBest': best['pitch'], 'seBest': best['se'], 'endToEndBest': best['endToEnd'],
                     'pitchMinOverLines': min(pitches), 'pitchMaxOverLines': max(pitches),
                     'pitchMeanOverLines': float(np.mean(pitches)),
                     'minSpacing': best['minSpacing'], 'maxSpacing': best['maxSpacing'],
                     'from': best['from'], 'to': best['to']})
    out['keyPitch'][name] = {
        'rowDirectionSlopeBackFront': [float((B1 - B0)[1] / (B1 - B0)[0]), float((F1 - F0)[1] / (F1 - F0)[0])],
        'rows': rows, 'meanOfRows1to4': float(np.mean([r['pitchMeanOverLines'] for r in rows]))}

# --------------------------------------------------------------------------
# 2. Mouse silhouette (ivory on the olive mat), from pixels.
# --------------------------------------------------------------------------
out['mouse'] = {}
for name in PITCH_VIEWS:
    im = rgb(M3 + name)
    b = REC[name]['meshBounds']['mouse_native__body']
    x0, x1 = int(b['left']) - 6, int(b['right']) + 7
    y0, y1 = int(b['top']) - 6, int(b['bottom']) + 7
    sub = im[y0:y1, x0:x1]
    mask = sub.mean(axis=2) > 165
    ys, xs = np.nonzero(mask)
    runs = mask.sum(axis=1)
    rows = out['keyPitch'][name]['rows']
    width = int(xs.max() - xs.min() + 1)
    out['mouse'][name] = {
        'silhouetteX': [int(x0 + xs.min()), int(x0 + xs.max())], 'silhouetteY': [int(y0 + ys.min()), int(y0 + ys.max())],
        'widthPx': width, 'widestRowPx': int(runs.max()), 'heightPx': int(ys.max() - ys.min() + 1),
        'pixels': int(mask.sum()),
        'widthInRow3Pitches': width / rows[2]['pitchMeanOverLines'],
        'widthInMeanPitches': width / out['keyPitch'][name]['meanOfRows1to4'],
        'receiptBoxWidthPx': b['right'] - b['left']}
out['mouse']['authoredWorld'] = {'widthMm': 99, 'lengthMm': 160, 'heightMm': 56, 'keyPitchMm': 30.5,
                                 'widthInPitches': 99 / 30.5, 'lengthInPitches': 160 / 30.5}

# --------------------------------------------------------------------------
# 3. Left cymbal (still a proxy disc). Its lit top face has one flat colour
#    (about RGB 46-52, 35-38, 20-21), distinct from its darker rim, the wall,
#    the speaker and the old dark speaker proxy. Per column, the count of
#    top-face pixels is the face's thickness there. Where the speaker cuts the
#    left end, the hidden length is estimated by mirror symmetry: the number of
#    columns at the free right end that are thinner than the face is at the
#    cut. The parent's hidden share uses the M3 full-width estimate (same
#    proxy, same pose). An estimate from visible pixels, not a silhouette proof.
# --------------------------------------------------------------------------
CYMBAL = {  # search box (x0, y0, x1, y1) around cymbal 1
    'scene-home-1440x900-f58.png': (1060, 462, 1345, 500),
    'scene-home-1024x768-f58.png': (800, 394, 1024, 428),
    'scene-music-1440x900-f58.png': (360, 422, 580, 460),
    'scene-mid-right-1440x900-f58.png': (580, 447, 780, 483),
    'scene-music-390x844-f74.png': (0, 401, 100, 430),
    'scene-music-320x844-f74.png': (0, 401, 65, 430),
}


def top_face(sub):
    r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
    return (r >= 40) & (r <= 58) & (g >= 29) & (g <= 43) & (b >= 14) & (b <= 26) & (r - b >= 20)


def face_columns(path, box):
    x0, y0, x1, y1 = box
    cols = top_face(rgb(path)[y0:y1, x0:x1]).sum(axis=0)
    keep = np.nonzero(cols >= 2)[0]
    seg = max(np.split(keep, np.nonzero(np.diff(keep) > 2)[0] + 1), key=len)
    return cols, int(seg[0]), int(seg[-1])


out['cymbal'] = {}
for name, box in CYMBAL.items():
    x0 = box[0]
    cols, xa, xb = face_columns(M3 + name, box)
    seg = cols[xa:xb + 1]
    cut = float(np.median(seg[:3]))
    frame_cut = bool(x0 + xa == 0)
    hidden = int((seg[::-1] < cut).argmin()) if cut > 2 else 0  # columns at the right end thinner than the cut
    full = (xb - xa + 1) + hidden
    pcols, pa, pb = face_columns(ART + PARENT[name] + '/' + name, box)
    out['cymbal'][name] = {
        'm3': {'topFacePixels': int(seg.sum()), 'visibleX': [x0 + xa, x0 + xb], 'visibleWidthPx': xb - xa + 1,
               'maxThicknessPx': int(seg.max()), 'thicknessAtLeftCutPx': cut, 'leftCutBy': 'frame edge' if frame_cut else 'speaker',
               'mirrorEstimateHiddenPx': hidden, 'estimatedFullWidthPx': full, 'estimatedHiddenWidthShare': hidden / full},
        'parent': {'folder': PARENT[name], 'topFacePixels': int(pcols[pa:pb + 1].sum()), 'visibleX': [x0 + pa, x0 + pb],
                   'visibleWidthPx': pb - pa + 1, 'hiddenWidthShareAgainstM3FullWidth': 1 - (pb - pa + 1) / full},
        'visibleTopFacePixelsRatioM3OverParent': float(seg.sum() / max(1, pcols[pa:pb + 1].sum()))}

# The same lens and pose give music-320 the same disc as music-390, shifted 35 px
# left; there the cut is past the disc's middle, so the mirror estimate does not
# apply and the 390 full width is used instead.
_c390 = out['cymbal']['scene-music-390x844-f74.png']['m3']
_c320 = out['cymbal']['scene-music-320x844-f74.png']
_c320['m3'].update({'estimatedFullWidthPx': _c390['estimatedFullWidthPx'], 'mirrorEstimateHiddenPx': None,
                    'estimatedHiddenWidthShare': 1 - _c320['m3']['visibleWidthPx'] / _c390['estimatedFullWidthPx']})
_c320['parent']['hiddenWidthShareAgainstM3FullWidth'] = 1 - _c320['parent']['visibleWidthPx'] / _c390['estimatedFullWidthPx']

# --------------------------------------------------------------------------
# 4. UI overlap in the static composites: share of each receipt box (clipped to
#    the frame) whose pixels differ between the raw render and the composite.
#    Boxes are projected bounding boxes, not silhouettes.
# --------------------------------------------------------------------------
GEAR = ['kb_keycaps__caps', 'kb_case__frost_shell', 'mouse_native__body', 'mug_coaster__mug_coaster',
        'notebook_pen__set', 'mic_boom__assembly', 'headphones__on_stand', 'speaker_nearfield__cabinet',
        'drum_cymbals__proxy_cymbal_1']
out['uiOverlap'] = {}
for cname, comp in COMP.items():
    scene = comp['sceneImage']
    a, b = rgb(M3 + scene), rgb(M3 + cname)
    covered = np.abs(a - b).max(axis=2) > 0
    H, W = covered.shape
    entry = {'scene': scene, 'projectsOpen': comp['ui']['projectsOpen'], 'coveredShareOfFrame': float(covered.mean()), 'boxes': {}}
    for key in GEAR:
        m = REC[scene]['meshBounds'][key]
        bx0, bx1 = max(0, int(round(m['left']))), min(W, int(round(m['right'])))
        by0, by1 = max(0, int(round(m['top']))), min(H, int(round(m['bottom'])))
        full_area = (m['right'] - m['left']) * (m['bottom'] - m['top'])
        if bx1 <= bx0 or by1 <= by0 or full_area > 4 * W * H:
            entry['boxes'][key] = {'inFrameShareOfBox': 0.0}
            continue
        entry['boxes'][key] = {'inFrameShareOfBox': (bx1 - bx0) * (by1 - by0) / full_area,
                               'uiCoveredShareOfInFramePart': float(covered[by0:by1, bx0:bx1].mean())}
    entry['targets'] = {}
    for key, proj in REC[scene]['projections'].items():
        mask = target_mask(proj, W, H)
        if mask is None or not mask.any():
            entry['targets'][key] = {'inFramePixels': 0}
            continue
        entry['targets'][key] = {'inFramePixels': int(mask.sum()), 'uiCoveredShare': float(covered[mask].mean())}
    out['uiOverlap'][cname] = entry

# --------------------------------------------------------------------------
# 5. Regression against the M2 captures: every pixel that differs from the
#    same-pose earlier capture, and whether any lie in the three project
#    target quads, the pendant strip or the PC.
# --------------------------------------------------------------------------
PENDANT = {  # lens crop boxes from the v02/v03 reviews
    'scene-home-1440x900-f58.png': (270, 20, 805, 65), 'scene-home-1024x768-f58.png': (125, 5, 585, 55),
    'scene-home-320x844-f74.png': (0, 95, 320, 160), 'scene-home-390x844-f74.png': (0, 95, 355, 160),
}
out['regression'] = {}
for name, folder in PARENT.items():
    a, b = rgb(ART + folder + '/' + name), rgb(M3 + name)
    changed = np.abs(a - b).max(axis=2) > 0
    H, W = changed.shape
    ys, xs = np.nonzero(changed)
    entry = {'parent': folder, 'changedPixels': int(changed.sum()),
             'changedBox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]}
    entry['targets'] = {}
    for key, proj in REC[name]['projections'].items():
        mask = target_mask(proj, W, H)
        if mask is None or not mask.any():
            entry['targets'][key] = {'inFramePixels': 0}
            continue
        entry['targets'][key] = {'inFramePixels': int(mask.sum()), 'changedPixels': int((changed & mask).sum())}
    if name in PENDANT:
        x0, y0, x1, y1 = PENDANT[name]
        crop = b[y0:y1, x0:x1]
        lit = (crop.mean(axis=2) > 150) & (crop[..., 0] >= crop[..., 2])
        entry['pendant'] = {'changedPixels': int(changed[y0:y1, x0:x1].sum()), 'litPixels': int(lit.sum()),
                            'clippedPixels': int((lit & (crop.min(axis=2) >= 250)).sum()),
                            'commonestLitRgb': [int(v) for v in Counter(map(tuple, crop[lit])).most_common(1)[0][0]]}
    # Exact material masks from the earlier repairs: the pixels that changed v02 -> v03 inside the
    # pendant crop are the lens; the pixels that changed v03 -> v05 are the PC front panel and glow.
    v02p, v03p, v05p = (ART + f + '/' + name for f in ('full-kit-m2-v02', 'full-kit-m2-v03', 'full-kit-m2-v05'))
    if name in PENDANT and folder in ('full-kit-m2-v03', 'full-kit-m2-v05') and os.path.exists(v02p) and os.path.exists(v03p):
        x0, y0, x1, y1 = PENDANT[name]
        lens = np.zeros_like(changed)
        lens[y0:y1, x0:x1] = (np.abs(rgb(v02p) - rgb(v03p)).max(axis=2) > 0)[y0:y1, x0:x1]
        entry['pendant'].update({'lensMaterialPixels': int(lens.sum()), 'lensMaterialPixelsChangedInM3': int((lens & changed).sum())})
    if folder == 'full-kit-m2-v05' and os.path.exists(v03p):
        pc = np.abs(rgb(v03p) - rgb(v05p)).max(axis=2) > 0
        entry['pcFrontAndGlow'] = {'pixelsChangedV03toV05': int(pc.sum()), 'ofThoseChangedInM3': int((pc & changed).sum())}
    entry['lowestChangedRow'] = int(ys.max())
    out['regression'][name] = entry

# Pendant in the two phone left-down frames (no v03/v05 capture of this pose exists).
for name, box in {'scene-left-down-390x844-f74.png': (240, 0, 390, 60), 'scene-left-down-320x844-f74.png': (200, 0, 320, 70)}.items():
    x0, y0, x1, y1 = box
    crop_px = rgb(M3 + name)[y0:y1, x0:x1]
    lit = (crop_px.mean(axis=2) > 150) & (crop_px[..., 0] >= crop_px[..., 2])
    out['regression'][name]['pendant'] = {
        'box': list(box), 'litPixels': int(lit.sum()), 'clippedPixels': int((lit & (crop_px.min(axis=2) >= 250)).sum()),
        'commonestLitRgb': [int(v) for v in Counter(map(tuple, crop_px[lit])).most_common(1)[0][0]]}

# Tall-320 central screen. The first review measured 266 px between the two
# border lines on the mid-height row of the M2 v02 home-320 capture. If no
# pixel of the central monitor differs from that capture, the figure carries.
name = 'scene-home-320x844-f74.png'
im = rgb(M3 + name)
quad = np.array([v[:2] for v in REC[name]['projections']['dissertation']['pixelVertices']])
order = quad[np.argsort(quad[:, 1])]
top, bottom = order[:2], order[2:]
border = REC[name]['meshBounds']['border_dissertation']
body = REC[name]['meshBounds']['mon_central__body']
bx0, bx1 = max(0, int(body['left']) - 2), min(im.shape[1], int(body['right']) + 3)
by0, by1 = max(0, int(body['top']) - 2), int(border['bottom']) + 3
diff_v02 = np.abs(rgb(ART + 'full-kit-m2-v02/' + name) - im).max(axis=2) > 0
diff_v03 = np.abs(rgb(ART + 'full-kit-m2-v03/' + name) - im).max(axis=2) > 0
out['tall320CentralScreen'] = {
    'firstReviewMidHeightRunPx': 266, 'firstReviewSource': 'm2-visual-review-measurements.json, M2 v02 home-320x844',
    'm2v02HomeSha256': sha(ART + 'full-kit-m2-v02/' + name),
    'checkedBox': [bx0, by0, bx1, by1],
    'changedPixelsInCentralMonitorBoxVsM2v02': int(diff_v02[by0:by1, bx0:bx1].sum()),
    'changedPixelsInCentralMonitorBoxVsM2v03': int(diff_v03[by0:by1, bx0:bx1].sum()),
    'firstChangedRowVsM2v03': int(np.nonzero(diff_v03.any(axis=1))[0].min()),
    'projectedLowerEdgeSpanPx': float(abs(bottom[0][0] - bottom[1][0])),
    'projectedUpperEdgeSpanPx': float(abs(top[0][0] - top[1][0])),
    'borderBoxMarginsLeftRightPx': [border['left'], im.shape[1] - border['right']]}

# --------------------------------------------------------------------------
# 6. Contact sheet of the crops the report cites (nearest-neighbour enlarged).
# --------------------------------------------------------------------------
def crop(path, box, zoom):
    im = Image.open(path).convert('RGB').crop(box)
    return im.resize((im.width * zoom, im.height * zoom), Image.NEAREST)


m2v05 = ART + 'full-kit-m2-v05/'
ROWS = [
    [crop(M3 + 'scene-home-1440x900-f58.png', (340, 620, 820, 750), 3)],
    [crop(M3 + 'scene-home-320x844-f74.png', (0, 520, 320, 640), 4)],
    [crop(M3 + 'scene-left-down-1440x900-f58.png', (820, 470, 1340, 690), 2),
     crop(M3 + 'scene-home-1440x900-f58.png', (700, 650, 800, 745), 4)],
    [crop(M3 + 'scene-home-1440x900-f58.png', (950, 430, 1340, 790), 2),
     crop(M3 + 'scene-right-down-1440x900-f58.png', (0, 310, 330, 720), 2)],
    [crop(M3 + 'scene-home-1440x900-f58.png', (0, 320, 200, 620), 2),
     crop(M3 + 'scene-left-down-1440x900-f58.png', (590, 180, 860, 480), 2),
     crop(M3 + 'scene-home-1440x900-f58.png', (40, 630, 320, 740), 2)],
    [crop(m2v05 + 'scene-home-1440x900-f58.png', (980, 430, 1360, 560), 2),
     crop(M3 + 'scene-home-1440x900-f58.png', (980, 430, 1360, 560), 2)],
    [crop(m2v05 + 'scene-music-1440x900-f58.png', (250, 390, 620, 500), 2),
     crop(M3 + 'scene-music-1440x900-f58.png', (250, 390, 620, 500), 2)],
    [crop(M3 + 'chrome-home-default-1440x900.png', (0, 600, 820, 900), 1),
     crop(M3 + 'chrome-home-default-1024x768.png', (0, 500, 700, 768), 1)],
    [crop(M3 + 'chrome-home-closed-390x844.png', (0, 480, 390, 844), 1),
     crop(M3 + 'chrome-home-open-390x844.png', (0, 480, 390, 844), 1),
     crop(M3 + 'chrome-home-closed-320x844.png', (0, 480, 320, 844), 1),
     crop(M3 + 'chrome-home-open-320x844.png', (0, 480, 320, 844), 1)],
]
PAD = 10
width = max(sum(i.width for i in r) + PAD * (len(r) - 1) for r in ROWS)
height = sum(max(i.height for i in r) for r in ROWS) + PAD * (len(ROWS) - 1)
sheet = Image.new('RGB', (width, height), (255, 0, 255))
y = 0
for r in ROWS:
    x = 0
    for i in r:
        sheet.paste(i, (x, y))
        x += i.width + PAD
    y += max(i.height for i in r) + PAD
sheet.save(OUT_PNG)
out['contactSheet'] = {'path': OUT_PNG, 'size': list(sheet.size), 'rows': [
    'keyboard, home-1440, x3', 'keyboard and mouse, home-320, x4', 'keyboard and mouse, left-down-1440 x2; mouse, home-1440 x4',
    'speaker, headphones, mug: home-1440 x2; right-down-1440 x2', 'microphone home-1440 x2 and left-down-1440 x2; notebook home-1440 x2',
    'left cymbal at home-1440: M2 v05 parent, then M3', 'left cymbal at music-1440: M2 v05 parent, then M3',
    'static UI composites, home-1440 and home-1024, 1:1', 'static UI composites, phone home closed/open at 390 and 320, 1:1']}

json.dump(out, open(OUT_JSON, 'w'), indent=1)
print('wrote', OUT_JSON, OUT_PNG, sheet.size)
