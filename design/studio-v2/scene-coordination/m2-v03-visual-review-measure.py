"""Independent M2 v03 material rereview measurements (read-only on the captures).

Reviewer: Claude, task_76847bdd1353 / ctx_a9e053890019. Run from the repository root:

    python design/studio-v2/scene-coordination/m2-v03-visual-review-measure.py

Reads the 18 root-supplied v03 PNGs, the 13 same-named v02 scene PNGs and both capture
records. Writes only
design/studio-v2/scene-coordination/m2-v03-visual-review-measurements.json and
design/studio-v2/scene-coordination/m2-v03-visual-review-crops.png.
No browser, server, build, Blender or capture is started.

The emitter() mask, clip definition and crop boxes are the ones used for v02 in
m2-visual-review-measure.py, so the before and after columns come from one method.
"""
import hashlib
import json
import os

import numpy as np
from PIL import Image

V02_CAPTURE = '.omx/context/full-kit-m2-runtime-capture-v01.json'
V03_CAPTURE = '.omx/context/full-kit-m2-v03-runtime-capture-v01.json'
V02_DIR = '.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m2-v02/'
V03_DIR = '.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m2-v03/'
OUT = 'design/studio-v2/scene-coordination/m2-v03-visual-review-measurements.json'
SHEET = 'design/studio-v2/scene-coordination/m2-v03-visual-review-crops.png'
EXPECTED_V02_CAPTURE_SHA = '1da664b90227c9869801f7f0b950b59c64c24cc52f84bb584e197a4a6add49b2'
EXPECTED_V03_CAPTURE_SHA = '6ba13644b5217383ff4bf70706f2d5468fe287ed92c40b9d7f324a510994bb8c'

# The single colour that fills every unlit lib_glow pixel in the v03 renders (read from pixels).
FLAT = np.array([237, 225, 201])


def sha(path):
    with open(path, 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def load(directory, name):
    return np.array(Image.open(directory + name).convert('RGB')).astype(int)


def lum(px):
    return px.sum(axis=-1) / 3


def read_record(path):
    with open(path, 'rb') as fh:
        raw = fh.read()
    return hashlib.sha256(raw).hexdigest(), json.loads(raw.decode('utf-8-sig'))


v02_sha, v02_record = read_record(V02_CAPTURE)
v03_sha, v03_record = read_record(V03_CAPTURE)
v02_hashes = {r['filename']: r['sha256'] for r in v02_record['records'] + v02_record['composites']}

# ---------------------------------------------------------------- hash binding
binding = []
for kind, items in (('scene', v03_record['records']), ('composite', v03_record['composites'])):
    for item in items:
        path = V03_DIR + item['filename']
        actual = sha(path)
        with Image.open(path) as im:
            size = list(im.size)
        warnings = item.get('warnings', [])
        entry = {
            'file': item['filename'], 'kind': kind, 'sha256': actual,
            'matchesCaptureRecord': actual == item['sha256'], 'bytes': os.path.getsize(path), 'pixels': size,
            'pose': item.get('pose'), 'fov': item.get('fov'), 'sceneImage': item.get('sceneImage'),
            'errors': len(item.get('errors', [])), 'consoleWarnings': len(warnings),
            'consoleWarningUrls': sorted({w.get('location', {}).get('url', '') for w in warnings}),
        }
        if kind == 'scene':
            before = V02_DIR + item['filename']
            entry['v02BaselineSha256'] = sha(before)
            entry['v02BaselineMatchesV02CaptureRecord'] = entry['v02BaselineSha256'] == v02_hashes.get(item['filename'])
            entry['byteIdenticalToV02'] = entry['v02BaselineSha256'] == actual
        binding.append(entry)
scenes = [b['file'] for b in binding if b['kind'] == 'scene']


# ------------------------------------------------------------------- emitters
def emitter(im, box):
    """Same mask and clip rule as the v02 review: lit = luminance > 150 and R >= B; clipped = all channels >= 250."""
    x0, y0, x1, y1 = box
    crop = im[y0:y1, x0:x1]
    level = lum(crop)
    lit = (level > 150) & (crop[..., 0] >= crop[..., 2])
    count = int(lit.sum())
    if not count:
        return {'emitterPx': 0}
    clipped = lit & (crop.min(axis=2) >= 250)
    ys, xs = np.nonzero(lit)
    cols = np.unique(xs)
    fifths = [round(float(level[:, part][lit[:, part]].mean()), 1) for part in np.array_split(cols, 5)]
    flat = lit & np.all(crop == FLAT, axis=-1)
    return {
        'emitterPx': count,
        'clippedPx': int(clipped.sum()),
        'clippedPct': round(100 * float(clipped.sum()) / count, 2),
        'clippedPctOfWholeCropBox': round(100 * float(clipped.sum()) / level.size, 3),
        'anyChannelGe250Pct': round(100 * float((lit & (crop.max(axis=2) >= 250)).sum()) / count, 1),
        'allChannelsGe240Pct': round(100 * float((lit & (crop.min(axis=2) >= 240)).sum()) / count, 2),
        'maxRgb': [int(v) for v in crop[lit].max(axis=0)],
        'luminanceP10P50P90': [int(np.percentile(level[lit], q)) for q in (10, 50, 90)],
        'meanLuminanceByFifthAlongX': fifths,
        'exactFlatEmissionPct': round(100 * float(flat.sum()) / count, 1),
        'brighterThanFlatPx': int((lit & (level > FLAT.sum() / 3 + 2)).sum()),
        'emitterBox': [int(x0 + xs.min()), int(y0 + ys.min()), int(x0 + xs.max()), int(y0 + ys.max())],
        'surroundMedianLuminance': round(float(np.median(level[~lit])), 1),
    }


def edge(im, box):
    """Body-to-lens and lens-to-below contrast, column by column inside one emitter crop."""
    x0, y0, x1, y1 = box
    crop = im[y0:y1, x0:x1]
    level = lum(crop)
    lit = (level > 150) & (crop[..., 0] >= crop[..., 2])
    above, inside, below, ramp_top, thickness = [], [], [], [], []
    for x in range(lit.shape[1]):
        ys = np.nonzero(lit[:, x])[0]
        if len(ys) < 4:
            continue
        top, bottom = ys.min(), ys.max()
        if top - 3 < 0 or bottom + 3 >= lit.shape[0]:
            continue
        above.append(level[top - 3, x])
        inside.append(level[(top + bottom) // 2, x])
        below.append(level[bottom + 3, x])
        thickness.append(bottom - top + 1)
        # rows between "dark body" (< 60) and "lens" (> 180) on the upper edge
        y = top
        while y > 0 and level[y, x] >= 60:
            y -= 1
        first_full = top
        while first_full < bottom and level[first_full, x] <= 180:
            first_full += 1
        ramp_top.append(first_full - y - 1)
    if not inside:
        return None
    return {
        'columns': len(inside),
        'bodyAboveLensMedianLuminance': round(float(np.median(above)), 1),
        'lensMidMedianLuminance': round(float(np.median(inside)), 1),
        'belowLensMedianLuminance': round(float(np.median(below)), 1),
        'upperEdgeTransitionPxMedian': int(np.median(ramp_top)),
        'lensThicknessPxMedian': int(np.median(thickness)),
        'lensLengthPx': len(inside),
    }


REQUIRED = 'required view'
EXTRA = 'additional view'
PENDANT = [
    ('scene-home-1440x900-f58.png', (270, 20, 805, 65), REQUIRED),
    ('scene-home-1024x768-f58.png', (125, 5, 585, 55), REQUIRED),
    ('scene-mid-left-1440x900-f58.png', (540, 0, 1055, 95), REQUIRED),
    ('scene-left-up-1440x900-f58.png', (800, 205, 1340, 375), REQUIRED),
    ('scene-home-320x844-f74.png', (0, 95, 320, 160), REQUIRED),
    ('scene-home-390x844-f74.png', (0, 95, 355, 160), REQUIRED),
    ('scene-home-320x568-f74.png', (25, 60, 270, 110), REQUIRED),
    ('scene-left-up-390x844-f74.png', (250, 310, 390, 370), EXTRA + ', left part of the lens only in frame'),
]
WALL = [
    ('scene-home-1440x900-f58.png', (830, 125, 1115, 230), 'v02 crop'),
    ('scene-music-1440x900-f58.png', (0, 40, 370, 200), 'v02 crop'),
    ('scene-mid-right-1440x900-f58.png', (300, 110, 600, 245), 'new crop for this rereview'),
    ('scene-mid-left-1440x900-f58.png', (1080, 80, 1440, 225), 'new crop for this rereview'),
    ('scene-home-1024x768-f58.png', (600, 100, 855, 205), 'new crop for this rereview'),
]
LAMP_SHADE = [
    ('scene-right-down-1440x900-f58.png', (660, 50, 775, 160), 'v02 crop'),
    ('scene-music-1440x900-f58.png', (865, 180, 985, 280), 'v02 crop'),
    ('scene-mid-right-1440x900-f58.png', (1085, 195, 1225, 305), 'new crop for this rereview'),
    ('scene-right-up-1440x900-f58.png', (660, 475, 775, 570), 'new crop for this rereview'),
    ('scene-music-390x844-f74.png', (295, 235, 375, 305), 'new crop for this rereview'),
]
# PC regions: the v02 review's boxes, plus the visible front in mid-right and music.
PC = [
    ('scene-right-down-1440x900-f58.png', (5, 640, 355, 900)),
    ('scene-mid-right-1440x900-f58.png', (489, 700, 708, 900)),
    ('scene-music-1440x900-f58.png', (267, 745, 527, 900)),
    ('scene-home-1440x900-f58.png', (960, 818, 1220, 900)),
    ('scene-home-1024x768-f58.png', (715, 690, 945, 768)),
    ('scene-music-390x844-f74.png', (0, 625, 62, 844)),
]

images = {}
for name in scenes:
    images[name] = (load(V02_DIR, name), load(V03_DIR, name))


def both(name, box):
    before, after = images[name]
    return emitter(before, box), emitter(after, box)


def split_by_change(name, box):
    """Split the v03 emitter mask into pixels that changed from v02 (lib_glow) and pixels that did not.

    Only lib_glow changed between the candidates and the renders are deterministic, so a masked pixel
    that is identical in both versions carries no lib_glow coverage: it is a neighbouring bright surface.
    """
    before, after = images[name]
    x0, y0, x1, y1 = box
    a, b = before[y0:y1, x0:x1], after[y0:y1, x0:x1]
    level = lum(b)
    lit = (level > 150) & (b[..., 0] >= b[..., 2])
    changed = np.abs(a - b).max(axis=2) > 0
    clipped = lit & (b.min(axis=2) >= 250)
    lens, other = lit & changed, lit & ~changed
    out = {
        'lensMaterialPx': int(lens.sum()),
        'lensMaterialClippedPx': int((clipped & lens).sum()),
        'lensMaterialMaxRgb': [int(v) for v in b[lens].max(axis=0)],
        'lensMaterialBrighterThanFlatPx': int((lens & (level > FLAT.sum() / 3 + 2)).sum()),
        'lensMaterialMaxRgbAtLeastTwoPxInsideMask': None,
        'unchangedNeighbourPx': int(other.sum()),
        'unchangedNeighbourClippedPx': int((clipped & other).sum()),
        'unchangedNeighbourMaxRgb': [int(v) for v in b[other].max(axis=0)],
        'unchangedNeighbourClippedInV02Too': int((other & (a.min(axis=2) >= 250)).sum()),
    }
    # Lens pixels whose 5x5 neighbourhood is all lens: no anti-aliasing against another surface.
    core = lens.copy()
    for dy in (-2, -1, 0, 1, 2):
        for dx in (-2, -1, 0, 1, 2):
            core &= np.roll(np.roll(lens, dy, axis=0), dx, axis=1)
    if core.any():
        out['lensMaterialMaxRgbAtLeastTwoPxInsideMask'] = [int(v) for v in b[core].max(axis=0)]
    bright = other & (level > 240)
    if bright.any():
        ys, xs = np.nonzero(bright)
        out['unchangedNeighbourAbove240'] = {'px': int(bright.sum()),
                                             'box': [int(x0 + xs.min()), int(y0 + ys.min()), int(x0 + xs.max()), int(y0 + ys.max())]}
    return out


pendant_cases = []
for name, box, role in PENDANT:
    before, after = both(name, box)
    pendant_cases.append({
        'emitter': 'fix_pendant__lens', 'file': name, 'crop': list(box), 'role': role,
        'v02': before, 'v03': after,
        'v03UnderTwoPercent': after['clippedPct'] < 2,
        'v03SplitByChangeFromV02': split_by_change(name, box),
        'v02Edge': edge(images[name][0], box), 'v03Edge': edge(images[name][1], box),
    })

wall_cases = []
for name, box, note in WALL:
    before, after = both(name, box)
    wall_cases.append({'emitter': 'fix_wall_triangles__proxy_light_1..5', 'file': name, 'crop': list(box),
                       'cropOrigin': note, 'v02': before, 'v03': after})


def unchanged_region(name, box):
    before, after = images[name]
    x0, y0, x1, y1 = box
    a, b = before[y0:y1, x0:x1], after[y0:y1, x0:x1]
    near_flat = np.all(np.abs(b - FLAT) <= 3, axis=-1)
    return {
        'file': name, 'crop': list(box), 'px': int(a.shape[0] * a.shape[1]),
        'changedPxV02ToV03': int((np.abs(a - b).max(axis=2) > 0).sum()),
        'v03PxWithinThreeOfFlatEmission': int(near_flat.sum()),
        'v03MaxLuminance': round(float(lum(b).max()), 1),
    }


lamp_cases = []
for name, box, note in LAMP_SHADE:
    item = unchanged_region(name, box)
    item['cropOrigin'] = note
    item['shadeV03'] = emitter(images[name][1], box)
    lamp_cases.append(item)
pc_cases = [unchanged_region(name, box) for name, box in PC]

home_before, home_after = images['scene-home-1440x900-f58.png']
lens_line = [{'x': x, 'v02': [int(v) for v in home_before[44, x]], 'v03': [int(v) for v in home_after[44, x]]}
             for x in range(330, 771, 40)]
lens_columns = {str(x): [{'y': y, 'v02': [int(v) for v in home_before[y, x]], 'v03': [int(v) for v in home_after[y, x]]}
                         for y in range(30, 60, 2)] for x in (330, 530, 730)}


# ---------------------------------------------------- whole-frame v02 -> v03 diff
def clusters(mask, cell=12):
    """Group changed pixels into regions by flood fill over a coarse grid."""
    height, width = mask.shape
    gh, gw = (height + cell - 1) // cell, (width + cell - 1) // cell
    grid = np.zeros((gh, gw), bool)
    ys, xs = np.nonzero(mask)
    grid[ys // cell, xs // cell] = True
    seen = np.zeros_like(grid)
    found = []
    for cy, cx in zip(*np.nonzero(grid)):
        if seen[cy, cx]:
            continue
        stack, cells = [(cy, cx)], []
        seen[cy, cx] = True
        while stack:
            y, x = stack.pop()
            cells.append((y, x))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < gh and 0 <= nx < gw and grid[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
        arr = np.array(cells)
        y0, y1 = arr[:, 0].min() * cell, min(height, (arr[:, 0].max() + 1) * cell)
        x0, x1 = arr[:, 1].min() * cell, min(width, (arr[:, 1].max() + 1) * cell)
        yy, xx = np.nonzero(mask[y0:y1, x0:x1])
        found.append([int(x0 + xx.min()), int(y0 + yy.min()), int(x0 + xx.max()), int(y0 + yy.max())])
    return found


def inside(box, outer):
    return box[0] >= outer[0] and box[1] >= outer[1] and box[2] <= outer[2] and box[3] <= outer[3]


pendant_boxes = {name: box for name, box, _ in PENDANT}
frame_diff = []
for name in scenes:
    before, after = images[name]
    delta = np.abs(before - after).max(axis=2)
    changed = delta > 0
    regions = []
    for box in clusters(changed):
        x0, y0, x1, y1 = box
        sub = changed[y0:y1 + 1, x0:x1 + 1]
        a = before[y0:y1 + 1, x0:x1 + 1][sub]
        b = after[y0:y1 + 1, x0:x1 + 1][sub]
        if name in pendant_boxes and inside(box, pendant_boxes[name]):
            consumer = 'fix_pendant__lens'
        elif [int(v) for v in b.max(axis=0)] == [int(v) for v in FLAT]:
            # every changed pixel is at or below the flat emission colour: an unlit lib_glow face
            consumer = 'fix_wall_triangles__proxy_light (position checked by eye in the image)'
        else:
            consumer = 'UNASSIGNED'
        regions.append({'box': box, 'changedPx': int(sub.sum()), 'consumer': consumer,
                        'v02MeanRgb': [round(float(v)) for v in a.mean(axis=0)],
                        'v03MeanRgb': [round(float(v)) for v in b.mean(axis=0)],
                        'v03MaxRgb': [int(v) for v in b.max(axis=0)]})
    regions.sort(key=lambda r: -r['changedPx'])
    frame_diff.append({'file': name, 'changedPx': int(changed.sum()), 'maxChannelDelta': int(delta.max()),
                       'regions': regions})

# ------------------------------------------------------------------ composites
composites = []
for item in v03_record['composites']:
    comp = np.array(Image.open(V03_DIR + item['filename']).convert('RGB')).astype(int)
    scene = images[item['sceneImage']][1]
    same = np.all(comp == scene, axis=-1)
    entry = {'file': item['filename'], 'sceneImage': item['sceneImage'],
             'pxIdenticalToSceneImagePct': round(100 * float(same.mean()), 1)}
    if item['sceneImage'] in pendant_boxes:
        x0, y0, x1, y1 = pendant_boxes[item['sceneImage']]
        lit_scene = emitter(scene, (x0, y0, x1, y1))
        crop_same = same[y0:y1, x0:x1]
        level = lum(scene[y0:y1, x0:x1])
        lit = (level > 150) & (scene[y0:y1, x0:x1, 0] >= scene[y0:y1, x0:x1, 2])
        entry['pendantLensPxLeftUncoveredByChromePct'] = round(100 * float((lit & crop_same).sum()) / lit_scene['emitterPx'], 1)
    composites.append(entry)

# --------------------------------------------------------------- contact sheet
tiles = [
    ('Pendant home-1440 x2', 'scene-home-1440x900-f58.png', (250, 0, 830, 110), 2),
    ('Pendant home-1024 x2', 'scene-home-1024x768-f58.png', (100, 0, 620, 90), 2),
    ('Pendant mid-left-1440 x2', 'scene-mid-left-1440x900-f58.png', (520, 0, 1100, 130), 2),
    ('Pendant left-up-1440 x2', 'scene-left-up-1440x900-f58.png', (780, 190, 1360, 400), 2),
    ('Pendant home-320x844 x3', 'scene-home-320x844-f74.png', (0, 70, 320, 190), 3),
    ('Pendant home-390x844 x3', 'scene-home-390x844-f74.png', (0, 70, 390, 190), 3),
    ('Pendant home-320x568 x3', 'scene-home-320x568-f74.png', (0, 40, 320, 140), 3),
    ('Pendant left-up-390 x4', 'scene-left-up-390x844-f74.png', (190, 280, 390, 400), 4),
    ('Wall proxies home-1440 x3', 'scene-home-1440x900-f58.png', (800, 90, 1150, 270), 3),
    ('Wall proxies music-1440 x2', 'scene-music-1440x900-f58.png', (0, 20, 400, 230), 2),
    ('Floor lamp right-down-1440 x3', 'scene-right-down-1440x900-f58.png', (640, 40, 800, 180), 3),
    ('PC mid-right-1440 x2', 'scene-mid-right-1440x900-f58.png', (440, 620, 800, 900), 2),
    ('PC music-1440 x2', 'scene-music-1440x900-f58.png', (240, 700, 600, 900), 2),
]
rendered, layout = [], []
for _title, name, box, scale in tiles:
    pair = []
    for directory in (V02_DIR, V03_DIR):
        crop = Image.open(directory + name).convert('RGB').crop(box)
        pair.append(crop.resize((crop.width * scale, crop.height * scale), Image.NEAREST))
    rendered.append(pair)
sheet_width = max(p[0].width for p in rendered)
sheet_height = sum(p[0].height * 2 + 4 + 12 for p in rendered)
sheet = Image.new('RGB', (sheet_width, sheet_height), (32, 32, 32))
offset = 0
for (title, name, box, scale), pair in zip(tiles, rendered):
    height = pair[0].height
    sheet.paste(pair[0], (0, offset))
    sheet.paste(pair[1], (0, offset + height + 4))
    layout.append({'title': title, 'source': name, 'sourceBox': list(box), 'scale': scale,
                   'v02SheetY': [offset, offset + height], 'v03SheetY': [offset + height + 4, offset + 2 * height + 4]})
    offset += height * 2 + 4 + 12
sheet.save(SHEET, optimize=True)

result = {
    'reviewer': 'Claude (actual), task_76847bdd1353, dispatch ctx_a9e053890019',
    'scope': 'Read-only pixel measurements on root-supplied v03 captures against the same-named v02 captures. '
             'Not a capture, not interaction, picking, performance or budget evidence.',
    'captureRecords': {
        'v03': {'path': V03_CAPTURE, 'sha256': v03_sha, 'matchesTaskBrief': v03_sha == EXPECTED_V03_CAPTURE_SHA,
                'capturedAt': v03_record['capturedAt'], 'failures': len(v03_record['failures']),
                'sourceDriftAfterCapture': len(v03_record['sourceDriftAfterCapture'])},
        'v02Baseline': {'path': V02_CAPTURE, 'sha256': v02_sha, 'matchesPriorReview': v02_sha == EXPECTED_V02_CAPTURE_SHA},
    },
    'images': {'count': len(binding), 'allMatchCaptureRecord': all(b['matchesCaptureRecord'] for b in binding),
               'allV02BaselinesMatchV02Record': all(b.get('v02BaselineMatchesV02CaptureRecord', True) for b in binding),
               'binding': binding},
    'method': {'emitterMask': 'luminance (mean of RGB) > 150 and R >= B inside a fixed crop box',
               'clipDefinition': 'all three channels >= 250, as in render-gates.md',
               'gate': 'under 2% of each emitter crop',
               'flatEmissionRgb': [int(v) for v in FLAT],
               'sameAsV02Review': 'mask, clip rule and the eight pendant, two wall and two lamp crop boxes are unchanged'},
    'pendant': {'cases': pendant_cases, 'centreLineHome1440_y44': lens_line, 'columnsHome1440': lens_columns},
    'wallTriangleProxies': wall_cases,
    'floorLamp': {'note': 'Crops cover the shade (lib_linen_shade). The lib_glow bulb is inside it.', 'cases': lamp_cases},
    'pcRegions': pc_cases,
    'frameDiffV02ToV03': frame_diff,
    'composites': composites,
    'contactSheet': {'path': SHEET, 'resampling': 'nearest-neighbour, no smoothing',
                     'layout': 'each tile is v02 above v03', 'tiles': layout},
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
    json.dump(result, fh, indent=1)
    fh.write('\n')

print('v03 capture sha ok:', result['captureRecords']['v03']['matchesTaskBrief'], '| v02 capture sha ok:',
      result['captureRecords']['v02Baseline']['matchesPriorReview'], '| images:', len(binding),
      'all match:', result['images']['allMatchCaptureRecord'],
      '| v02 baselines match:', result['images']['allV02BaselinesMatchV02Record'])
for case in pendant_cases:
    print('pendant', case['file'], 'v02', case['v02']['clippedPct'], case['v02']['luminanceP10P50P90'],
          '-> v03', case['v03']['clippedPct'], case['v03']['clippedPx'], 'px', case['v03']['luminanceP10P50P90'],
          case['v03']['meanLuminanceByFifthAlongX'], 'max', case['v03']['maxRgb'],
          'flat%', case['v03']['exactFlatEmissionPct'], 'edge', case['v03Edge'])
for case in wall_cases:
    print('wall', case['file'], 'v02', case['v02']['clippedPct'], case['v02']['luminanceP10P50P90'], case['v02']['anyChannelGe250Pct'],
          '-> v03', case['v03']['clippedPct'], case['v03']['luminanceP10P50P90'], case['v03']['maxRgb'],
          'surround', case['v03']['surroundMedianLuminance'])
for case in lamp_cases:
    print('lamp', case['file'], 'changed', case['changedPxV02ToV03'], 'nearFlat', case['v03PxWithinThreeOfFlatEmission'],
          'shade clip', case['shadeV03'].get('clippedPct'), case['shadeV03'].get('luminanceP10P50P90'))
for case in pc_cases:
    print('pc', case['file'], case['crop'], 'changed', case['changedPxV02ToV03'], 'nearFlat', case['v03PxWithinThreeOfFlatEmission'],
          'max lum', case['v03MaxLuminance'])
for item in frame_diff:
    print('diff', item['file'], item['changedPx'], [(r['consumer'][:22], r['box'], r['changedPx']) for r in item['regions']])
for item in composites:
    print('composite', item)
