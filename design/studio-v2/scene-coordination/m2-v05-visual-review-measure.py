"""Independent corrected PC v05 actual-image review measurements (read-only on the captures).

Reviewer: Claude, task_69d2bdabad59 / ctx_a8a774ce3d8a. Run from the repository root:

    python design/studio-v2/scene-coordination/m2-v05-visual-review-measure.py

Reads the 10 root-supplied v05 PNGs, the 10 same-named v03 PNGs and both capture receipts.
Writes only
design/studio-v2/scene-coordination/m2-v05-visual-review-measurements.json and
design/studio-v2/scene-coordination/m2-v05-visual-review-crops.png.
No browser, server, build, Blender or capture is started.

Method: v03 and v05 were captured at identical poses through the same builder, and the renders are
deterministic. The v03 -> v05 pixel difference therefore locates what the PC repair changed on screen.
Changed regions are assigned to the front panel or the glow strip by position, checked by eye.
"""
import hashlib
import json
import os

import numpy as np
from PIL import Image

V03_CAPTURE = '.omx/context/full-kit-m2-v03-runtime-capture-v01.json'
V05_CAPTURE = '.omx/context/full-kit-m2-v05-runtime-capture-v01.json'
V03_DIR = '.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m2-v03/'
V05_DIR = '.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m2-v05/'
OUT = 'design/studio-v2/scene-coordination/m2-v05-visual-review-measurements.json'
SHEET = 'design/studio-v2/scene-coordination/m2-v05-visual-review-crops.png'
EXPECTED_V03_CAPTURE_SHA = '6ba13644b5217383ff4bf70706f2d5468fe287ed92c40b9d7f324a510994bb8c'
EXPECTED_V05_CAPTURE_SHA = 'c490cef460a505b3cd64a41e905ffa12b69757f254d36cfd19c44ced67feb77b'
FLAT = [237, 225, 201]  # unlit lib_glow colour measured in the v03 review


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


v03_sha, v03_record = read_record(V03_CAPTURE)
v05_sha, v05_record = read_record(V05_CAPTURE)
v03_items = {r['filename']: r for r in v03_record['records'] + v03_record['composites']}

# ---------------------------------------------------------------- hash binding
binding = []
for kind, items in (('scene', v05_record['records']), ('composite', v05_record['composites'])):
    for item in items:
        path = V05_DIR + item['filename']
        actual = sha(path)
        with Image.open(path) as im:
            size = list(im.size)
        before = v03_items[item['filename']]
        before_sha = sha(V03_DIR + item['filename'])
        warnings = item.get('warnings', [])
        entry = {
            'file': item['filename'], 'kind': kind, 'sha256': actual,
            'matchesCaptureRecord': actual == item['sha256'], 'bytes': os.path.getsize(path), 'pixels': size,
            'pose': item.get('pose'), 'fov': item.get('fov'), 'eye': item.get('eye'), 'sceneImage': item.get('sceneImage'),
            'errors': len(item.get('errors', [])), 'consoleWarnings': len(warnings),
            'consoleWarningUrls': sorted({w.get('location', {}).get('url', '') for w in warnings}),
            'requestFailures': [{'url': f.get('url'), 'errorText': f.get('failure', {}).get('errorText')}
                                for f in item.get('requestFailures', [])],
            'v03BaselineSha256': before_sha, 'v03BaselineMatchesV03CaptureRecord': before_sha == before['sha256'],
        }
        if kind == 'scene':
            entry['samePoseFovEyeViewportAsV03'] = all(item.get(k) == before.get(k) for k in ('pose', 'fov', 'eye', 'viewport', 'dpr'))
        binding.append(entry)

provenance = v05_record['provenance'][0]['sources']
inputs = {key: provenance[key]['sha256'] for key in provenance
          if key.endswith(('proposal-v05.glb', 'proposal-v05.manifest.json', 'build-full-studio.ts', 'view-config.ts'))}


# ------------------------------------------------------------------ regions
def clusters(mask, cell=6):
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


# Hand-read search boxes (generous, checked by eye in the images). FRONT is the visible front of the tower,
# GLOW is the area on the PSU shroud seen through the glass side. They only route changed regions to a label.
VIEWS = {
    'scene-home-1440x900-f58.png': {'composite': 'chrome-home-default-1440x900.png', 'front': [1040, 815, 1222, 900],
                                    'glow': [958, 862, 1022, 884], 'authorGlowPrediction': [968, 871, 1011, 875],
                                    'firstReviewFrontRect': [1040, 818, 1219, 900]},
    'scene-home-1024x768-f58.png': {'composite': 'chrome-home-default-1024x768.png', 'front': [785, 695, 942, 768],
                                    'glow': [714, 736, 770, 754], 'authorGlowPrediction': [723, 743, 760, 747],
                                    'firstReviewFrontRect': [785, 697, 940, 768]},
    'scene-mid-right-1440x900-f58.png': {'composite': 'chrome-mid-right-default-1440x900.png', 'front': [566, 755, 710, 900],
                                         'glow': [490, 844, 552, 876], 'authorGlowPrediction': None,
                                         'firstReviewFrontRect': None},
    'scene-music-1440x900-f58.png': {'composite': 'chrome-music-default-1440x900.png', 'front': [370, 736, 527, 900],
                                     'glow': [279, 850, 348, 892], 'authorGlowPrediction': [290, 860, 338, 883],
                                     'firstReviewFrontRect': [380, 745, 522, 900]},
    'scene-music-390x844-f74.png': {'composite': 'chrome-music-closed-390x844.png', 'front': [0, 615, 64, 844],
                                    'glow': None, 'authorGlowPrediction': None, 'firstReviewFrontRect': None},
}


def tone(px):
    level = lum(px)
    return {
        'px': int(level.size),
        'meanRgb': [round(float(v)) for v in px.mean(axis=0)],
        'maxRgb': [int(v) for v in px.max(axis=0)],
        'luminanceP10P50P90': [int(np.percentile(level, q)) for q in (10, 50, 90)],
        'darkPct_lt60': round(100 * float((level < 60).mean()), 1),
        'midPct_60to140': round(100 * float(((level >= 60) & (level < 140)).mean()), 1),
        'lightPct_ge140': round(100 * float((level >= 140).mean()), 1),
        'clippedPx_allChannelsGe250': int((px.min(axis=1) >= 250).sum()),
        'anyChannelGe250Px': int((px.max(axis=1) >= 250).sum()),
    }


def rect_tone(im, rect):
    x0, y0, x1, y1 = rect
    return tone(im[y0:y1, x0:x1].reshape(-1, 3))


views = []
for item in v05_record['records']:
    name = item['filename']
    spec = VIEWS[name]
    before, after = load(V03_DIR, name), load(V05_DIR, name)
    comp = load(V05_DIR, spec['composite'])
    delta = np.abs(before - after).max(axis=2)
    changed = delta > 0
    uncovered = np.all(comp == after, axis=-1)  # composite pixel equals the scene pixel: no UI drawn over it

    front_mask = np.zeros_like(changed)
    glow_mask = np.zeros_like(changed)
    regions = []
    for box in clusters(changed):
        x0, y0, x1, y1 = box
        sub = np.zeros_like(changed)
        sub[y0:y1 + 1, x0:x1 + 1] = changed[y0:y1 + 1, x0:x1 + 1]
        if inside(box, spec['front']):
            label = 'pc_tower__case front panel'
            front_mask |= sub
        elif spec['glow'] and inside(box, spec['glow']):
            label = 'pc_tower__glow'
            glow_mask |= sub
        else:
            label = 'UNASSIGNED'
        regions.append({'box': box, 'changedPx': int(sub.sum()), 'label': label})
    regions.sort(key=lambda r: -r['changedPx'])

    entry = {
        'file': name, 'composite': spec['composite'], 'changedPx': int(changed.sum()),
        'maxChannelDelta': int(delta.max()), 'regions': regions,
        'unassignedChangedPx': int(sum(r['changedPx'] for r in regions if r['label'] == 'UNASSIGNED')),
        'receiptProjectedBoxes': {key: [round(float(value[q]), 1) for q in ('left', 'top', 'right', 'bottom')]
                                  for key, value in item['meshBounds'].items() if key.startswith('pc_tower')},
        'uiRectangles': {key: [round(r['x']), round(r['y']), round(r['x'] + r['width']), round(r['y'] + r['height'])]
                         for key, r in next(c for c in v05_record['composites'] if c['filename'] == spec['composite'])['ui']['rectangles'].items()
                         if r['display'] != 'none' and r['width'] > 2},
    }

    # Front panel: the pixels the UV change touched.
    ys, xs = np.nonzero(front_mask)
    entry['frontPanel'] = {
        'changedBox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
        'v03': tone(before[front_mask]), 'v05': tone(after[front_mask]),
        'uncoveredByUiPct': round(100 * float((front_mask & uncovered).sum()) / int(front_mask.sum()), 1),
    }
    fx0, fy0, fx1, fy1 = spec['front']
    entry['frontSearchBox'] = {'box': spec['front'], 'v03': rect_tone(before, spec['front']), 'v05': rect_tone(after, spec['front']),
                               'uncoveredByUiPct': round(100 * float(uncovered[fy0:fy1, fx0:fx1].mean()), 1)}
    if spec['firstReviewFrontRect']:
        rect = spec['firstReviewFrontRect']
        entry['firstReviewFrontRect'] = {'box': rect, 'v03': rect_tone(before, rect), 'v05': rect_tone(after, rect)}

    # Glow strip.
    if glow_mask.any():
        ys, xs = np.nonzero(glow_mask)
        px = after[glow_mask]
        colours, counts = np.unique(px, axis=0, return_counts=True)
        order = np.argsort(-counts)[:3]
        above, below = [], []
        for x in np.unique(xs):
            col = np.nonzero(glow_mask[:, x])[0]
            above.append(lum(after[col.min() - 3, x]))
            below.append(lum(after[col.max() + 3, x]))
        per_col = glow_mask.sum(axis=0)
        glow = {
            'visibleBox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
            'v05': tone(px), 'v03AtSamePixels': tone(before[glow_mask]),
            'mostCommonRgb': [[int(v) for v in colours[i]] for i in order],
            'lengthPxColumns': int((per_col > 0).sum()),
            'thicknessPxMedianPerColumn': int(np.median(per_col[per_col > 0])),
            'luminanceThreePxAboveMedian': round(float(np.median(above)), 1),
            'luminanceThreePxBelowMedian': round(float(np.median(below)), 1),
            'belowUnlitLibGlowFlatRgb': bool((px.max(axis=0) < np.array(FLAT)).all()),
            'uncoveredByUiPct': round(100 * float((glow_mask & uncovered).sum()) / int(glow_mask.sum()), 1),
            'authorPredictedBox': spec['authorGlowPrediction'],
        }
        # Brightest part of the white case frame in the same crop, for scale.
        gx0, gy0, gx1, gy1 = spec['glow']
        glow['searchBox'] = spec['glow']
        entry['glow'] = glow
    else:
        entry['glow'] = {'visibleBox': None, 'changedPx': 0,
                         'note': 'No changed pixel outside the front panel in this frame.'}
    views.append(entry)

# --------------------------------------------------------------- contact sheet
tiles = [
    ('PC home-1440 x3', 'scene-home-1440x900-f58.png', (930, 770, 1240, 900), 3),
    ('PC home-1024 x3', 'scene-home-1024x768-f58.png', (690, 660, 960, 768), 3),
    ('PC mid-right-1440 x2', 'scene-mid-right-1440x900-f58.png', (460, 640, 740, 900), 2),
    ('PC music-1440 x2', 'scene-music-1440x900-f58.png', (240, 640, 560, 900), 2),
    ('PC music-390 x3', 'scene-music-390x844-f74.png', (0, 560, 160, 844), 3),
    ('Glow home-1440 x8', 'scene-home-1440x900-f58.png', (950, 850, 1060, 892), 8),
    ('Glow mid-right-1440 x8', 'scene-mid-right-1440x900-f58.png', (485, 835, 600, 880), 8),
    ('Glow music-1440 x8', 'scene-music-1440x900-f58.png', (275, 845, 395, 895), 8),
]
rows, layout = [], []
for title, name, box, scale in tiles:
    sources = [(V03_DIR, name), (V05_DIR, name), (V05_DIR, VIEWS[name]['composite'])]
    row = []
    for directory, source in sources:
        crop = Image.open(directory + source).convert('RGB').crop(box)
        row.append(crop.resize((crop.width * scale, crop.height * scale), Image.NEAREST))
    rows.append(row)
sheet_width = max(sum(t.width for t in row) + 8 for row in rows)
sheet = Image.new('RGB', (sheet_width, sum(row[0].height + 12 for row in rows)), (32, 32, 32))
offset = 0
for (title, name, box, scale), row in zip(tiles, rows):
    x = 0
    for tile in row:
        sheet.paste(tile, (x, offset))
        x += tile.width + 4
    layout.append({'title': title, 'source': name, 'sourceBox': list(box), 'scale': scale,
                   'sheetY': [offset, offset + row[0].height], 'tileWidth': row[0].width})
    offset += row[0].height + 12
sheet.save(SHEET, optimize=True)

result = {
    'reviewer': 'Claude (actual), task_69d2bdabad59, dispatch ctx_a8a774ce3d8a',
    'scope': 'Read-only pixel measurements on root-supplied v05 captures against the same-named v03 captures. '
             'Not a capture, not interaction, picking, performance or budget evidence.',
    'captureRecords': {
        'v05': {'path': V05_CAPTURE, 'sha256': v05_sha, 'matchesTaskBrief': v05_sha == EXPECTED_V05_CAPTURE_SHA,
                'capturedAt': v05_record['capturedAt'], 'selected': v05_record['selected'],
                'failures': len(v05_record['failures']), 'sourceDriftAfterCapture': len(v05_record['sourceDriftAfterCapture']),
                'sourceFilesChecked': v05_record.get('sourceFilesChecked')},
        'v03Baseline': {'path': V03_CAPTURE, 'sha256': v03_sha, 'matchesPriorReview': v03_sha == EXPECTED_V03_CAPTURE_SHA},
    },
    'provenanceInputs': inputs,
    'images': {'count': len(binding), 'allMatchCaptureRecord': all(b['matchesCaptureRecord'] for b in binding),
               'allV03BaselinesMatchV03Record': all(b['v03BaselineMatchesV03CaptureRecord'] for b in binding),
               'allScenePosesEqualV03': all(b.get('samePoseFovEyeViewportAsV03', True) for b in binding),
               'binding': binding},
    'method': {'clipDefinition': 'all three channels >= 250, as in render-gates.md', 'gate': 'under 2% of the emitter pixels',
               'uncoveredByUi': 'a composite pixel identical to the scene pixel has no UI drawn over it; translucent UI counts as covered',
               'regions': 'changed pixels v03 -> v05, grouped and routed by hand-read search boxes'},
    'views': views,
    'contactSheet': {'path': SHEET, 'resampling': 'nearest-neighbour, no smoothing',
                     'layout': 'each row is v03, v05, v05 beneath the product UI, left to right', 'tiles': layout},
}
with open(OUT, 'w', encoding='utf-8', newline='\n') as fh:
    json.dump(result, fh, indent=1)
    fh.write('\n')

print('v05 capture sha ok:', result['captureRecords']['v05']['matchesTaskBrief'], '| v03 ok:',
      result['captureRecords']['v03Baseline']['matchesPriorReview'], '| images', len(binding), 'match',
      result['images']['allMatchCaptureRecord'], '| v03 baselines', result['images']['allV03BaselinesMatchV03Record'],
      '| poses equal', result['images']['allScenePosesEqualV03'])
print(inputs)
for v in views:
    print(v['file'], 'changed', v['changedPx'], 'unassigned', v['unassignedChangedPx'])
    print('  proj', v['receiptProjectedBoxes'])
    print('  ui', v['uiRectangles'])
    f = v['frontPanel']
    print('  front', f['changedBox'], 'v03', f['v03']['meanRgb'], f['v03']['darkPct_lt60'], '-> v05', f['v05']['meanRgb'],
          f['v05']['luminanceP10P50P90'], 'dark', f['v05']['darkPct_lt60'], 'max', f['v05']['maxRgb'], 'clip',
          f['v05']['clippedPx_allChannelsGe250'], 'uncovered', f['uncoveredByUiPct'])
    s = v['frontSearchBox']
    print('  frontbox', s['box'], 'v03 dark/mid/light', s['v03']['darkPct_lt60'], s['v03']['midPct_60to140'], s['v03']['lightPct_ge140'],
          '-> v05', s['v05']['darkPct_lt60'], s['v05']['midPct_60to140'], s['v05']['lightPct_ge140'], 'uncovered', s['uncoveredByUiPct'])
    if 'firstReviewFrontRect' in v:
        r = v['firstReviewFrontRect']
        print('  firstReviewRect', r['box'], 'v03 dark', r['v03']['darkPct_lt60'], 'light', r['v03']['lightPct_ge140'],
              '-> v05 dark', r['v05']['darkPct_lt60'], 'light', r['v05']['lightPct_ge140'])
    print('  glow', {k: v['glow'][k] for k in v['glow'] if k not in ('v05', 'v03AtSamePixels')})
    if 'v05' in v['glow']:
        print('     v05', v['glow']['v05'], '\n     v03', v['glow']['v03AtSamePixels']['meanRgb'])
