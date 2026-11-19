"""Independent M2 / P1 actual-image review measurements (read-only on the captures).

Reviewer: Claude, task_5437cd5dfec3 / ctx_a9a533c5bf49. Run from the repository root:

    python design/studio-v2/scene-coordination/m2-visual-review-measure.py

Reads the 33 root-supplied PNGs and the capture record, writes only
design/studio-v2/scene-coordination/m2-visual-review-measurements.json and
design/studio-v2/scene-coordination/m2-visual-review-crops.png.
No browser, server, build, Blender or capture is started.
"""
import hashlib
import json
import os

import numpy as np
from PIL import Image

ROOT = os.getcwd()
CAPTURE = '.omx/context/full-kit-m2-runtime-capture-v01.json'
DIR = '.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m2-v02/'
OUT = 'design/studio-v2/scene-coordination/m2-visual-review-measurements.json'
SHEET = 'design/studio-v2/scene-coordination/m2-visual-review-crops.png'
EXPECTED_CAPTURE_SHA = '1da664b90227c9869801f7f0b950b59c64c24cc52f84bb584e197a4a6add49b2'

TAN = np.array([108, 89, 66])  # border highlight colour as rendered


def sha(path):
    with open(path, 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def load(name):
    return np.array(Image.open(DIR + name).convert('RGB')).astype(int)


def lum(px):
    return px.sum(axis=-1) / 3


def is_tan(px, tol=16):
    return np.all(np.abs(px - TAN) <= tol, axis=-1)


# ---------------------------------------------------------------- hash binding
with open(CAPTURE, 'rb') as fh:
    raw = fh.read()
capture_sha = hashlib.sha256(raw).hexdigest()
record = json.loads(raw.decode('utf-8-sig'))
binding = []
for kind, items in (('scene', record['records']), ('composite', record['composites'])):
    for item in items:
        path = DIR + item['filename']
        actual = sha(path)
        with Image.open(path) as im:
            size = list(im.size)
        binding.append({
            'file': item['filename'], 'kind': kind, 'sha256': actual,
            'matchesCaptureRecord': actual == item['sha256'], 'bytes': os.path.getsize(path),
            'pixels': size,
            'pose': item.get('pose'), 'fov': item.get('fov'),
            'sceneImage': item.get('sceneImage'),
            'projectsOpen': item.get('ui', {}).get('projectsOpen'),
            'consoleWarnings': len(item.get('warnings', [])), 'errors': len(item.get('errors', [])),
        })


# ------------------------------------------------- P1: central bezel and screen
def classify(px):
    r, g, b = px
    level = (r + g + b) / 3
    if abs(r - 108) <= 12 and abs(g - 89) <= 12 and abs(b - 66) <= 12:
        return 'T'  # tan border
    if b >= r - 3 and level < 70:
        return 'f'  # screen face
    if level < 40:
        return '#'  # dark: bezel or shadow
    if level < 50:
        return '+'  # anti-aliased dark edge
    return '.'      # lit wall or other


def bezel_row(im, y, proj_left, proj_right):
    """Outer bezel edge of the central monitor on one row, read from pixels."""
    width = im.shape[1]
    row = im[y]
    tan = is_tan(row)
    level = lum(row)
    left = [x for x in range(max(0, int(proj_left) - 10), min(width, int(proj_left) + 8)) if tan[x]]
    right = [x for x in range(max(0, int(proj_right) - 8), min(width, int(proj_right) + 10)) if tan[x]]
    if not left or not right:
        return None
    lb0, lb1, rb0, rb1 = min(left), max(left), min(right), max(right)
    # Bezel is the dark run directly outside the border. It is only separable from the wall
    # where the wall beside it is lit, so rows with a shadowed wall are reported as unreliable.
    x = lb0 - 1
    while x >= 0 and level[x] < 50:
        x -= 1
    bezel_left = x + 1
    x = rb1 + 1
    while x < width and level[x] < 50:
        x += 1
    bezel_right = x - 1
    reliable = (lb0 - bezel_left) <= 5 and (bezel_right - rb1) <= 5
    return {
        'y': y, 'bezelOuterLeftX': bezel_left, 'bezelOuterRightX': bezel_right,
        'leftMarginPx': bezel_left, 'rightMarginPx': width - 1 - bezel_right,
        'bezelThicknessLeftPx': lb0 - bezel_left, 'bezelThicknessRightPx': bezel_right - rb1,
        'screenRunBetweenBordersPx': rb0 - lb1 - 1, 'reliable': reliable,
    }


def p1_case(name, rows):
    im = load(name)
    rec = next(r for r in record['records'] if r['filename'] == name)
    face = rec['projections']['dissertation']
    top, bottom = int(np.ceil(face['top'])) + 2, int(np.floor(face['bottom'])) - 16
    measured = [m for m in (bezel_row(im, y, face['left'], face['right']) for y in range(top, bottom)) if m]
    reliable = [m for m in measured if m['reliable']]
    runs = [m['screenRunBetweenBordersPx'] for m in measured]
    width = im.shape[1]
    # Every row that crosses both side borders, including the corner rows the margin pass skips.
    every = {}
    for y in range(int(np.floor(face['top'])), int(np.ceil(face['bottom'])) + 1):
        m = bezel_row(im, y, face['left'], face['right'])
        if m:
            every[y] = m['screenRunBetweenBordersPx']
    ordered = sorted(every)
    below = [y for y in ordered if every[y] < 265]
    by_row = {
        'rows': [ordered[0], ordered[-1]], 'rowCount': len(ordered),
        'min': min(every.values()), 'median': int(np.median(list(every.values()))), 'max': max(every.values()),
        'rowsAtOrAbove265': len(ordered) - len(below), 'rowsBelow265': len(below),
        'every8thRow': [[y, every[y]] for y in ordered[::8]],
    }
    return {
        'file': name, 'pose': rec['pose'], 'fov': rec['fov'], 'viewport': rec['viewport'],
        'faceProjection': {k: round(face[k], 1) for k in ('left', 'right', 'top', 'bottom')},
        'rowsMeasured': len(measured), 'rowsReliable': len(reliable),
        'leftMarginPx': [min(m['leftMarginPx'] for m in reliable), max(m['leftMarginPx'] for m in reliable)],
        'rightMarginPx': [min(m['rightMarginPx'] for m in reliable), max(m['rightMarginPx'] for m in reliable)],
        'screenRunPx': {'min': min(runs), 'median': int(np.median(runs)), 'max': max(runs)},
        'screenRunAllRows': by_row,
        'rowProfiles': [{
            'y': y,
            'left': ''.join(classify(im[y, x]) for x in range(0, min(84, width))),
            'right': ''.join(classify(im[y, x]) for x in range(max(0, width - 84), width)),
        } for y in rows],
        'note': 'Margins are frame edge to the outer BEZEL edge on rows where the wall beside the bezel is lit. '
                'screenRunPx is pixels strictly between the two border lines on a row; it narrows toward the '
                'bottom because the face is a keystoned trapezoid. Profile legend: T border, f face, # dark, '
                '+ anti-aliased dark, . lit wall/other; left string starts at x=0, right string ends at the last column.',
    }


p1 = [
    p1_case('scene-home-320x844-f74.png', [340, 415, 475, 490]),
    p1_case('scene-home-previous-yaw-320x844-f74.png', [340, 415, 475, 490]),
    p1_case('scene-home-390x844-f74.png', [340, 415, 475, 490]),
    p1_case('scene-home-320x568-f74.png', [229, 280, 322]),
    p1_case('scene-home-1440x900-f58.png', [345, 454, 540]),
    p1_case('scene-home-1024x768-f58.png', [295, 388, 470]),
]


def edge_sliver(name):
    """Dark pixels of the TypeForge monitor on the right frame edge of a 320x844 frame."""
    im = load(name)
    level = lum(im)
    rows = [y for y in range(250, 640) if (level[y, 316:320] < 40).any() and level[y, 310] > 45]
    widths = [int((level[y, 312:320] < 40).sum()) for y in rows]
    return {'file': name, 'rows': [min(rows), max(rows)] if rows else None, 'rowCount': len(rows),
            'maxWidthPx': max(widths) if widths else 0}


slivers = [edge_sliver('scene-home-320x844-f74.png'), edge_sliver('scene-home-previous-yaw-320x844-f74.png')]


# ------------------------------------------------------------------- emitters
def emitter(name, box, label):
    im = load(name)
    x0, y0, x1, y1 = box
    crop = im[y0:y1, x0:x1]
    level = lum(crop)
    lit = (level > 150) & (crop[..., 0] >= crop[..., 2])
    count = int(lit.sum())
    if not count:
        return {'emitter': label, 'file': name, 'crop': box, 'emitterPx': 0}
    clipped = lit & (crop.min(axis=2) >= 250)
    ys, xs = np.nonzero(lit)
    cols = np.unique(xs)
    fifths = [round(float(level[:, part][lit[:, part]].mean()), 1) for part in np.array_split(cols, 5)]
    return {
        'emitter': label, 'file': name, 'crop': box, 'emitterPx': count,
        'clippedPct': round(100 * float(clipped.sum()) / count, 1),
        'luminanceP10P50P90': [int(np.percentile(level[lit], q)) for q in (10, 50, 90)],
        'meanLuminanceByFifthAlongX': fifths,
        'emitterBox': [int(x0 + xs.min()), int(y0 + ys.min()), int(x0 + xs.max()), int(y0 + ys.max())],
    }


emitters = [
    emitter('scene-home-1440x900-f58.png', (270, 20, 805, 65), 'fix_pendant__lens'),
    emitter('scene-home-1024x768-f58.png', (125, 5, 585, 55), 'fix_pendant__lens'),
    emitter('scene-mid-left-1440x900-f58.png', (540, 0, 1055, 95), 'fix_pendant__lens'),
    emitter('scene-left-up-1440x900-f58.png', (800, 205, 1340, 375), 'fix_pendant__lens'),
    emitter('scene-home-320x844-f74.png', (0, 95, 320, 160), 'fix_pendant__lens'),
    emitter('scene-home-390x844-f74.png', (0, 95, 355, 160), 'fix_pendant__lens'),
    emitter('scene-home-320x568-f74.png', (25, 60, 270, 110), 'fix_pendant__lens'),
    emitter('scene-left-up-390x844-f74.png', (250, 310, 390, 370), 'fix_pendant__lens (left part only in frame)'),
    emitter('scene-left-up-320x844-f74.png', (215, 310, 320, 370), 'fix_pendant__lens (left end only in frame)'),
    emitter('scene-left-down-390x844-f74.png', (260, 0, 390, 50), 'fix_pendant__lens (left end only in frame)'),
    emitter('scene-home-1440x900-f58.png', (830, 125, 1115, 230), 'fix_wall_triangles proxies (reference, not M2)'),
    emitter('scene-music-1440x900-f58.png', (0, 40, 370, 200), 'fix_wall_triangles proxies (reference, not M2)'),
    emitter('scene-right-down-1440x900-f58.png', (660, 50, 775, 160), 'fix_floor_lamp shade (reference, not M2)'),
    emitter('scene-music-1440x900-f58.png', (865, 180, 985, 280), 'fix_floor_lamp shade (reference, not M2)'),
]
home = load('scene-home-1440x900-f58.png')
lens_line = [{'x': x, 'rgb': [int(v) for v in home[44, x]]} for x in range(330, 771, 40)]


# ------------------------------------------------------------------------- PC
def tone_split(crop):
    level = lum(crop)
    return {'px': int(level.size), 'lightPct_ge140': round(100 * float((level >= 140).mean()), 1),
            'midPct_60to140': round(100 * float(((level >= 60) & (level < 140)).mean()), 1),
            'darkPct_lt60': round(100 * float((level < 60).mean()), 1)}


def overlap(a, b):
    w = max(0, min(a[2], b[2]) - max(a[0], b[0]))
    h = max(0, min(a[3], b[3]) - max(a[1], b[1]))
    return w * h


def chrome_rects(composite):
    item = next(c for c in record['composites'] if c['filename'] == composite)
    out = {}
    for key, r in item['ui']['rectangles'].items():
        if r['display'] != 'none' and r['width'] > 2:
            out[key] = [round(r['x']), round(r['y']), round(r['x'] + r['width']), round(r['y'] + r['height'])]
    return out


# Front rectangles are HAND-READ from the rendered pixels (white stiles, dark panel, desk underside,
# frame bottom). They are axis-aligned approximations of the visible front, not root's projected
# bounding boxes and not a silhouette.
pc_fronts = {
    'home-1440': ('scene-home-1440x900-f58.png', 'chrome-home-default-1440x900.png', [1040, 818, 1219, 900]),
    'home-1024': ('scene-home-1024x768-f58.png', 'chrome-home-default-1024x768.png', [785, 697, 940, 768]),
    'music-1440': ('scene-music-1440x900-f58.png', 'chrome-music-default-1440x900.png', [380, 745, 522, 900]),
    'right-down-1440': ('scene-right-down-1440x900-f58.png', 'chrome-right-down-default-1440x900.png', [150, 660, 352, 900]),
}
pc = {}
for key, (scene, composite, rect) in pc_fronts.items():
    im = load(scene)
    rects = chrome_rects(composite)
    area = (rect[2] - rect[0]) * (rect[3] - rect[1])
    covered = {name: round(100 * overlap(rect, r) / area, 1) for name, r in rects.items() if overlap(rect, r)}
    pc[key] = {
        'sceneImage': scene, 'composite': composite, 'handReadFrontRect': rect,
        'frontToneSplit': tone_split(im[rect[1]:rect[3], rect[0]:rect[2]]),
        'chromeRects': rects, 'frontRectCoveredPctByChrome': covered,
        'frontRectCoveredPctTotal': round(sum(covered.values()), 1),
    }
pc['home-1440']['columnReadings'] = {
    'glassSideX': [963, 1038], 'leftStileX': [1040, 1058], 'darkPanelX': [1059, 1201], 'rightStileX': [1202, 1218],
    'topRailRows': [820, 845], 'stileRgb': [216, 202, 176], 'panelRgb': [18, 17, 9], 'topRailRgbInShadow': [116, 112, 100],
    'fanRingRgb': [90, 77, 52], 'fanRingThicknessPx': '4-5', 'note': 'read from row y=850/870 and columns x=1045..1212',
}

# --------------------------------------------------------------- contact sheet
tiles = [
    ('PC home-1440 raw x3', 'scene-home-1440x900-f58.png', (930, 780, 1440, 900), 3),
    ('PC home-1440 + chrome x3', 'chrome-home-default-1440x900.png', (930, 780, 1440, 900), 3),
    ('PC home-1024 + chrome x3', 'chrome-home-default-1024x768.png', (690, 670, 1024, 768), 3),
    ('PC mid-right-1440 raw x2', 'scene-mid-right-1440x900-f58.png', (440, 620, 800, 900), 2),
    ('PC right-down-1440 + chrome x2', 'chrome-right-down-default-1440x900.png', (0, 560, 460, 900), 2),
    ('Pendant lens home-1440 x2', 'scene-home-1440x900-f58.png', (260, 0, 810, 70), 2),
    ('Pendant lens left-up-1440 x2', 'scene-left-up-1440x900-f58.png', (790, 190, 1340, 380), 2),
    ('320x844 yaw -13.5 monitor band x3', 'scene-home-320x844-f74.png', (0, 320, 320, 520), 3),
    ('320x844 yaw -14 monitor band x3', 'scene-home-previous-yaw-320x844-f74.png', (0, 320, 320, 520), 3),
    ('Central stand, cables, grommet home-1440 x3', 'scene-home-1440x900-f58.png', (500, 540, 790, 660), 3),
    ('Desk end and edge left-down-1440 x3', 'scene-left-down-1440x900-f58.png', (480, 440, 800, 620), 3),
    ('Subwoofer left-down-1440 x3', 'scene-left-down-1440x900-f58.png', (690, 560, 950, 800), 3),
]
rendered = []
for _title, name, box, scale in tiles:
    crop = Image.open(DIR + name).convert('RGB').crop(box)
    rendered.append(crop.resize((crop.width * scale, crop.height * scale), Image.NEAREST))
sheet_width = max(t.width for t in rendered)
sheet = Image.new('RGB', (sheet_width, sum(t.height + 8 for t in rendered)), (32, 32, 32))
offset, layout = 0, []
for (title, name, box, scale), tile in zip(tiles, rendered):
    sheet.paste(tile, (0, offset))
    layout.append({'title': title, 'source': name, 'sourceBox': list(box), 'scale': scale,
                   'sheetY': [offset, offset + tile.height]})
    offset += tile.height + 8
sheet.save(SHEET, optimize=True)

result = {
    'reviewer': 'Claude (actual), task_5437cd5dfec3, dispatch ctx_a9a533c5bf49',
    'scope': 'Read-only pixel measurements on root-supplied captures. Not a capture, not interaction, '
             'picking, performance or budget evidence.',
    'captureRecord': {'path': CAPTURE, 'sha256': capture_sha, 'matchesTaskBrief': capture_sha == EXPECTED_CAPTURE_SHA,
                      'capturedAt': record['capturedAt'], 'failures': len(record['failures']),
                      'sourceDriftAfterCapture': len(record['sourceDriftAfterCapture'])},
    'images': {'count': len(binding), 'allMatchCaptureRecord': all(b['matchesCaptureRecord'] for b in binding),
               'binding': binding},
    'p1': {'cases': p1, 'typeforgeEdgeSliver320x844': slivers},
    'emitters': {'clipDefinition': 'all three channels >= 250, as in render-gates.md', 'gate': 'under 2% of each emitter crop',
                 'cases': emitters, 'pendantLensCentreLineHome1440_y44': lens_line},
    'pc': pc,
    'contactSheet': {'path': SHEET, 'resampling': 'nearest-neighbour, no smoothing', 'tiles': layout},
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
    json.dump(result, fh, indent=1)
    fh.write('\n')
print('capture sha ok:', result['captureRecord']['matchesTaskBrief'], '| images:', len(binding),
      'all match:', result['images']['allMatchCaptureRecord'])
for case in p1:
    print(case['file'], 'left', case['leftMarginPx'], 'right', case['rightMarginPx'], 'screen', case['screenRunPx'],
          'reliable rows', case['rowsReliable'], '/', case['rowsMeasured'])
for s in slivers:
    print('sliver', s)
for e in emitters:
    print(e['emitter'], e['file'], e.get('clippedPct'), e.get('luminanceP10P50P90'))
for key, value in pc.items():
    print('pc', key, value['frontToneSplit'], value['frontRectCoveredPctByChrome'])
