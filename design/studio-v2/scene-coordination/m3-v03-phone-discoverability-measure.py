"""F8 phone addendum: read-only pixel measurements of the phone mid-right captures.

Reviewer evidence for task_d8237267e26c / ctx_735e5fbe050c. Reads root's v02
capture receipt and its four PNGs. Writes only
m3-v03-phone-discoverability-measurements.json and
m3-v03-phone-discoverability-crops.png beside this file.

Run from the repository root:
  python design/studio-v2/scene-coordination/m3-v03-phone-discoverability-measure.py
"""
import hashlib
import json
import os

import numpy as np
from PIL import Image

DIR = '.omx/artifacts/visual-ralph/portfolio-immersive-v2/full-kit-m3-v03-phone-mid-right-v02/'
RECEIPT = '.omx/context/full-kit-m3-v03-phone-mid-right-capture-v02.json'
RECEIPT_SHA = 'cb9524663b7e30e47d1e5529cd8f591a8d78cf6d8c02ddf8956fc17a2246ad4f'
OUT = 'design/studio-v2/scene-coordination/'
OUT_JSON = OUT + 'm3-v03-phone-discoverability-measurements.json'
OUT_PNG = OUT + 'm3-v03-phone-discoverability-crops.png'


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def rgb(path):
    return np.asarray(Image.open(path).convert('RGB')).astype(np.int32)


assert sha(RECEIPT) == RECEIPT_SHA
receipt = json.loads(open(RECEIPT, 'rb').read().decode('utf-8-sig'))
out = {'receiptSha256': RECEIPT_SHA, 'selected': receipt['selected'], 'browserVersion': receipt['browserVersion'],
       'failures': len(receipt['failures']), 'sourceDriftAfterCapture': len(receipt['sourceDriftAfterCapture']),
       'uniqueCheckedInputCount': receipt['uniqueCheckedInputCount'], 'images': {}, 'views': {}}
for entry in receipt['records'] + receipt['composites']:
    path = DIR + entry['filename']
    digest = sha(path)
    assert digest == entry['sha256'] and os.path.getsize(path) == entry['bytes'], entry['filename']
    out['images'][entry['filename']] = digest
assert len(out['images']) == 4


def extent(mask, x0, y0):
    ys, xs = np.nonzero(mask)
    return {'pixels': int(mask.sum()), 'x': [int(x0 + xs.min()), int(x0 + xs.max())], 'y': [int(y0 + ys.min()), int(y0 + ys.max())]}


def clip_box(m, W, H, pad=4):
    return (max(0, int(m['left']) - pad), max(0, int(m['top']) - pad), min(W, int(m['right']) + pad + 1), min(H, int(m['bottom']) + pad + 1))


ITEMS = {'mug': 'mug_coaster__mug_coaster', 'headphones': 'headphones__on_stand', 'speaker': 'speaker_nearfield__cabinet'}
sheet_rows = []
for comp in receipt['composites']:
    scene_name = comp['sceneImage']
    rec = next(r for r in receipt['records'] if r['filename'] == scene_name)
    scene, composite = rgb(DIR + scene_name), rgb(DIR + comp['filename'])
    H, W, _ = scene.shape
    covered = np.abs(scene - composite).max(axis=2) > 0  # pixels the UI changes
    view = {'composite': comp['filename'], 'pose': rec['pose'], 'fov': rec['fov'], 'eye': rec['eye'], 'viewport': rec['viewport'],
            'alignment': comp['alignment'], 'projectsOpen': comp['ui']['projectsOpen'],
            'uiRectangles': {k: [v['x'], v['y'], v['width'], v['height']] for k, v in comp['ui']['rectangles'].items()
                             if v['display'] != 'none' and v['width'] > 0},
            'uiCoveredShareOfFrame': float(covered.mean()),
            # Rows between the header and the lower controls where not one pixel differs: the 1:1 alignment check.
            'identicalRows': [int(np.nonzero(~covered.any(axis=1))[0].min()), int(np.nonzero(~covered.any(axis=1))[0].max())],
            'identicalRowCount': int((~covered.any(axis=1)).sum()),
            'firstUiRowBelowMiddle': int(np.nonzero(covered.any(axis=1) & (np.arange(H) > H // 2))[0].min()),
            'items': {}}
    lum = scene.mean(axis=2)
    r, g, b = scene[..., 0], scene[..., 1], scene[..., 2]
    for label, key in ITEMS.items():
        box = rec['meshBounds'][key]
        x0, y0, x1, y1 = clip_box(box, W, H)
        item = {'receiptBox': [box['left'], box['top'], box['right'], box['bottom']],
                'receiptBoxInFrameShare': max(0, min(W, box['right']) - max(0, box['left'])) * max(0, min(H, box['bottom']) - max(0, box['top']))
                / ((box['right'] - box['left']) * (box['bottom'] - box['top'])),
                'uiCoveredPixelsInBox': int(covered[y0:y1, x0:x1].sum())}
        # Silhouette checks that colour can settle without guessing. The receipt box contains the whole
        # silhouette, so zero UI-changed pixels in the box already means zero on the silhouette.
        if label == 'mug':
            # Mug wall is grey-sage (R-B under 45, mid luminance); the desk around it is orange. Rows 565-615
            # cross only the wall and handle.
            runs = []
            for yy in range(565, 616):
                wall = np.nonzero((r[yy, x0:x1] - b[yy, x0:x1] < 45) & (lum[yy, x0:x1] > 95) & (lum[yy, x0:x1] < 185))[0]
                runs.append((int(x0 + wall.min()), int(x0 + wall.max())))
            item['wallAndHandleX'] = [min(a for a, _ in runs), max(b for _, b in runs)]
            item['clearOfLeftFrameEdgePx'] = item['wallAndHandleX'][0]
            item['coasterBoxLeft'] = box['left']
            # The coaster's shaded rim is the first pixel darker than lit desk (R under 170) on rows 623-631,
            # below the cast shadow that reaches the frame edge higher up.
            rim = [int(np.nonzero(r[yy, :x1] < 170)[0].min()) for yy in range(623, 632)]
            item['coasterRimLeftmostX'] = min(rim)
        elif label == 'speaker':
            # The cabinet's white top band, above the tweeter and the headphone band (row 432).
            white = np.nonzero((lum[432, x0:x1] > 175) & (r[432, x0:x1] - b[432, x0:x1] < 60))[0]
            item['cabinetTopBandX'] = [int(x0 + white.min()), int(x0 + white.max())]
            col = int(x0 + white.min() + 3)
            down = np.nonzero((lum[y0:y1, col] > 175) & (r[y0:y1, col] - b[y0:y1, col] < 60))[0]
            item['cabinetLeftEdgeY'] = [int(y0 + down.min()), int(y0 + down.max())]
        else:
            # The right ear cup's pale outer plate: a sage-cream ellipse unlike anything near it.
            hx0 = int(box['left'] + 0.6 * (box['right'] - box['left']))
            px = scene[y0:y1, hx0:x1]
            plate = (px[..., 0] > 150) & (px[..., 1] > 150) & (px[..., 2] > 95) & (px[..., 0] - px[..., 2] > 25) & (px[..., 0] - px[..., 2] < 80)
            item['rightEarCupPlate'] = extent(plate, hx0, y0)
        item['gapFromBoxBottomToFirstUiRowPx'] = view['firstUiRowBelowMiddle'] - min(H, box['bottom'])
        view['items'][label] = item
    out['views'][scene_name] = view
    crop = (0, 380, min(W, 300), 680)
    sheet_rows.append([Image.open(DIR + n).convert('RGB').crop(crop).resize(((crop[2] - crop[0]) * 2, 600), Image.NEAREST)
                       for n in (scene_name, comp['filename'])])
    sheet_rows.append([Image.open(DIR + comp['filename']).convert('RGB')])

# The two raw frames share one camera: the 320 frame should be the middle 320 columns of the 390 frame.
narrow, wide = (rgb(DIR + n) for n in ('scene-mid-right-320x844-f74.png', 'scene-mid-right-390x844-f74.png'))
delta = np.abs(narrow - wide[:, 35:355]).max(axis=2)
out['narrowVersusWideMiddleColumns'] = {'offsetPx': 35, 'shareOfPixelsDiffering': float((delta > 0).mean()),
                                        'shareDifferingByMoreThan8': float((delta > 8).mean()), 'maxDifference': int(delta.max())}

PAD = 10
width = max(sum(i.width for i in row) + PAD * (len(row) - 1) for row in sheet_rows)
height = sum(max(i.height for i in row) for row in sheet_rows) + PAD * (len(sheet_rows) - 1)
sheet = Image.new('RGB', (width, height), (255, 0, 255))
y = 0
for row in sheet_rows:
    x = 0
    for image in row:
        sheet.paste(image, (x, y))
        x += image.width + PAD
    y += max(i.height for i in row) + PAD
sheet.save(OUT_PNG)
out['contactSheet'] = {'path': OUT_PNG, 'size': list(sheet.size),
                       'rows': ['320: raw then composite, x 0-300 y 380-680, x2', '320 composite, whole frame 1:1',
                                '390: raw then composite, x 0-300 y 380-680, x2', '390 composite, whole frame 1:1']}
json.dump(out, open(OUT_JSON, 'w'), indent=1)
print(json.dumps(out['views'], indent=1))
