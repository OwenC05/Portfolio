import math, os, sys
from PIL import Image, ImageDraw, ImageFont
import project as P

CAP = sys.argv[1]   # captures dir
OUT = sys.argv[2]   # output dir
os.makedirs(OUT, exist_ok=True)
FD = 'C:/Windows/Fonts/'

def font(name, size):
    for n in (name, 'arial.ttf'):
        try:
            return ImageFont.truetype(FD + n, size)
        except OSError:
            pass
SANS = lambda s: font('arial.ttf', s)
BOLD = lambda s: font('arialbd.ttf', s)
SERIF = lambda s: font('georgia.ttf', s)
MONO = lambda s: font('cour.ttf', s)
MONOB = lambda s: font('courbd.ttf', s)

PAPER, DEEP, INK = (242, 234, 220), (233, 223, 205), (39, 35, 31)
RULE, LABEL, FOCUS = (205, 191, 168), (112, 81, 53), (133, 72, 25)
PLATE, CREAM, AMBER, MUTED = (24, 22, 19), (244, 234, 216), (233, 183, 125), (201, 191, 176)
CYAN, PINK = (90, 220, 255), (255, 120, 200)

ANCHOR = (0.80, 2.80, -0.20)
SCALE = 1.6

def cap(name):
    return Image.open(os.path.join(CAP, name)).convert('RGB')

def robot_box(d, view, label=True, off=(0, 0), s=SCALE, colour=CYAN):
    pts, _ = P.character(ANCHOR, s)
    r = P.rect(pts, view)
    x0, y0, x1, y1 = [round(v) for v in r]
    x0 += off[0]; x1 += off[0]; y0 += off[1]; y1 += off[1]
    for i in range(2):
        d.rectangle([x0 - i, y0 - i, x1 + i, y1 + i], outline=colour)
    if label:
        t = 'sweep box s=%.1f' % s
        f = BOLD(11)
        tw = d.textlength(t, font=f)
        d.rectangle([x0, y0 - 15, x0 + tw + 6, y0], fill=colour)
        d.text((x0 + 3, y0 - 14), t, font=f, fill=(0, 0, 0))
    return x0, y0, x1, y1

def wrap(d, text, f, width):
    lines, cur = [], ''
    for word in text.split():
        t = (cur + ' ' + word).strip()
        if d.textlength(t, font=f) <= width or not cur:
            cur = t
        else:
            lines.append(cur); cur = word
    if cur: lines.append(cur)
    return lines

def para(d, x, y, text, f, width, fill, lh):
    for line in wrap(d, text, f, width):
        d.text((x, y), line, font=f, fill=fill); y += lh
    return y

def greek(d, x, y, width, lines, lh=20, last=0.6):
    for i in range(lines):
        w = width * (last if i == lines - 1 else 1 - 0.04 * (i % 3))
        d.rounded_rectangle([x, y + 6, x + w, y + 12], 3, fill=(196, 184, 164))
        y += lh
    return y

def plate(d, box, r=12):
    d.rounded_rectangle(box, r, fill=PLATE, outline=(70, 64, 56))

def ask_entry(d, right, bottom, h=44, focus=False):
    f = BOLD(14)
    t = 'Ask about Owen\u2019s work'
    w = int(d.textlength(t, font=f)) + 28
    box = [right - w, bottom - h, right, bottom]
    plate(d, box)
    d.text((box[0] + 14, box[1] + (h - 16) // 2), t, font=f, fill=CREAM)
    if focus:
        d.rounded_rectangle([box[0] - 5, box[1] - 5, box[2] + 5, box[3] + 5], 15, outline=(255, 210, 156), width=3)
    return box

def panel(W, H, state, compact=False, pad=36):
    """Return an RGB image of the Ask sheet at W x H."""
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    bar = 60
    d.rectangle([0, 0, W, bar], fill=DEEP)
    d.line([0, bar, W, bar], fill=RULE)
    d.text((pad, 23), 'ASK \u00b7 SOURCE SEARCH', font=MONO(12), fill=LABEL)
    d.rounded_rectangle([W - 108, 8, W - 10, 52], 22, fill=PAPER, outline=(138, 120, 98))
    d.text((W - 90, 21), 'Close  \u00d7', font=BOLD(14), fill=INK)
    x, y, cw = pad, bar + (20 if compact else 30), W - 2 * pad
    hs = 24 if compact else (26 if W <= 320 else 32)
    d.text((x, y), 'Ask about Owen\u2019s work', font=SERIF(hs), fill=INK)
    if state == 'open':
        d.rounded_rectangle([x - 8, y - 6, x + cw + 4, y + hs + 10], 8, outline=FOCUS, width=2)
    y += hs + 16
    note = 'Source search only. No generated answers.' if compact else 'This searches Owen\u2019s published portfolio sources and shows the matching passages. It does not write an answer.'
    y = para(d, x, y, note, SANS(14), cw, (80, 70, 60), 21) + 14
    d.text((x, y), 'YOUR QUESTION', font=MONO(12), fill=LABEL); y += 22
    th = 58 if compact else 78
    d.rounded_rectangle([x, y, x + cw, y + th], 6, fill=(250, 245, 236), outline=(138, 120, 98))
    q = '' if state in ('open', 'idle') else 'How was TypeForge evaluated?'
    if q: d.text((x + 12, y + 12), q, font=SANS(15), fill=INK)
    else: d.text((x + 12, y + 12), 'Ask about a project, role, paper or interest', font=SANS(14), fill=(140, 128, 112))
    y += th + 12
    running = state in ('zero-pending',)
    lab = 'Try again' if state == 'error' else 'Search sources'
    f = BOLD(14)
    bw = int(d.textlength(lab, font=f)) + 32
    d.rounded_rectangle([x, y, x + bw, y + 44], 22, fill=INK if q else (150, 140, 128))
    d.text((x + 16, y + 14), lab, font=f, fill=PAPER)
    if state == 'cancelled':
        d.rounded_rectangle([x - 5, y - 5, x + bw + 5, y + 49], 26, outline=FOCUS, width=3)
    cx = x + bw + 10
    d.rounded_rectangle([cx, y, cx + 84, y + 44], 22, fill=PAPER, outline=(138, 120, 98) if running else RULE)
    d.text((cx + 18, y + 14), 'Cancel', font=f, fill=INK if running else (170, 158, 140))
    cnt = '%d/600' % len(q)
    cf = MONO(12)
    if cw > 420:
        hint = 'Ctrl or Cmd + Enter \u00b7 ' + cnt
        d.text((x + cw - d.textlength(hint, font=cf), y + 16), hint, font=cf, fill=LABEL)
        y += 44 + 18
    else:
        y += 44 + 8
        d.text((x, y), cnt, font=cf, fill=LABEL); y += 22
    status = {
        'open': 'Ready. Ask a question to search Owen\u2019s portfolio sources.',
        'idle': 'Ready. Ask a question to search Owen\u2019s portfolio sources.',
        'zero-pending': 'Retrieved 0 passages in 1 ms. Waiting for the response to finish.',
        'no-match': 'Finished in 2 ms \u00b7 not supported.',
        'error': 'The search service returned an error (HTTP 500).',
        'cancelled': 'Cancelled. Your question is still in the box.',
        'sources4': 'Finished in 1 ms \u00b7 sources only.',
        'sources1': 'Finished in 1 ms \u00b7 sources only.',
    }[state]
    d.line([x, y, x + cw, y], fill=RULE); y += 12
    if state == 'error':
        d.rectangle([x, y, x + 3, y + 44], fill=(150, 40, 30))
        y = para(d, x + 14, y + 2, status, BOLD(14), cw - 14, (120, 30, 22), 21) + 4
        y = para(d, x + 14, y, 'Nothing is shown from the earlier search.', SANS(13), cw - 14, (80, 70, 60), 19) + 10
    else:
        y = para(d, x, y, status, MONOB(13), cw, INK, 19) + 12
    if state in ('open', 'idle'):
        d.text((x, y), 'TRY ASKING', font=MONO(12), fill=LABEL); y += 24
        for ex in ('What has Owen worked on at LexisNexis?', 'How was TypeForge evaluated?', 'What does Owen do outside work?'):
            f2 = SANS(13)
            w = min(cw, int(d.textlength(ex, font=f2)) + 28)
            d.rounded_rectangle([x, y, x + w, y + 44], 22, outline=(138, 120, 98))
            d.text((x + 14, y + 14), ex, font=f2, fill=INK); y += 52
    if state == 'no-match':
        d.rectangle([x, y, x + 3, y + 92], fill=FOCUS)
        d.text((x + 14, y), 'NO MATCHING SOURCES', font=MONO(12), fill=LABEL)
        yy = para(d, x + 14, y + 22, 'Owen\u2019s portfolio sources don\u2019t support an answer to this, so the assistant won\u2019t guess.', SANS(15), cw - 14, INK, 22)
        y = max(yy, y + 92) + 12
        y = para(d, x, y, 'For anything not covered here, email Owen (existing contact link).', SANS(14), cw, INK, 21)
    n = {'sources4': 4, 'sources1': 1}.get(state, 0)
    if n:
        sel = 2 if n == 4 else 0
        d.text((x, y + 14), 'SOURCES', font=MONO(12), fill=LABEL)
        chipx = x + 78
        for i in range(1, n + 1):
            on = i == sel
            d.rounded_rectangle([chipx, y, chipx + 44, y + 44], 22, fill=INK if on else PAPER, outline=FOCUS if on else (138, 120, 98), width=3 if on else 1)
            d.text((chipx + 17, y + 13), str(i), font=BOLD(15), fill=PAPER if on else INK)
            chipx += 52
        y += 58
        d.rounded_rectangle([x, y, x + cw, y + 62 if cw > 420 else y + 84], 6, fill=(246, 234, 214))
        d.rectangle([x, y, x + 3, y + (62 if cw > 420 else 84)], fill=FOCUS)
        para(d, x + 14, y + 8, 'These are matching published passages. They do not confirm a premise in your question; check what each source establishes.', SANS(13), cw - 26, INK, 19)
        y += (62 if cw > 420 else 84) + 14
        for i in range(1, n + 1):
            on = i == sel
            rows = 7 if on else 3
            hh = 34 + rows * 20 + 50
            if on:
                d.rectangle([x - 12, y - 6, x + cw + 12, y + hh - 8], fill=DEEP)
                d.rectangle([x - 12, y - 6, x - 9, y + hh - 8], fill=FOCUS)
            d.text((x, y + 2), '%02d' % i, font=MONO(13), fill=LABEL)
            d.text((x + 34, y), 'Source title %d (link)' % i, font=BOLD(15), fill=FOCUS if on else INK)
            tw = d.textlength('Source title %d (link)' % i, font=BOLD(15))
            d.line([x + 34, y + 19, x + 34 + tw, y + 19], fill=FOCUS if on else INK)
            yy = greek(d, x + 34, y + 28, cw - 34, rows)
            t = ('Hide passage %d' if on else 'Show passage %d') % i
            d.text((x + 34, yy + 14), t.upper(), font=MONO(12), fill=FOCUS)
            d.line([x + 34, yy + 28, x + 34 + d.textlength(t.upper(), font=MONO(12)), yy + 28], fill=FOCUS)
            y += hh
            d.line([x, y - 14, x + cw, y - 14], fill=RULE)
    return im

def rounded_paste(base, im, xy, r):
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], r, fill=255)
    base.paste(im, xy, m)

def dim(im, a):
    return Image.blend(im, Image.new('RGB', im.size, (15, 13, 11)), a)

def titled(images, titles, name, gap=24, top=44):
    W = sum(i.size[0] for i in images) + gap * (len(images) + 1)
    H = max(i.size[1] for i in images) + top + gap
    sheet = Image.new('RGB', (W, H), (16, 16, 16))
    d = ImageDraw.Draw(sheet)
    x = gap
    for im, t in zip(images, titles):
        y = top
        for k, line in enumerate(t.split('\n')):
            d.text((x, 8 + k * 16), line, font=BOLD(13) if k == 0 else SANS(12), fill=(240, 240, 240) if k == 0 else (190, 190, 190))
        sheet.paste(im, (x, y)); x += im.size[0] + gap
    sheet.save(os.path.join(OUT, name))
    print(name, sheet.size)

V = {
    'd': (1440, 900, 58, -4, -6), 'dru': (1440, 900, 58, 58, 12), 'drd': (1440, 900, 58, 58, -16),
    'p390': (390, 844, 64, -13, -8), 'p320': (320, 844, 64, -13, -8), 'ps': (320, 568, 64, -13, -8),
}

# 1. Placement overlays on real desktop captures
ims = []
for key, f in (('d', '1440x900-dpr1-home.png'), ('dru', '1440x900-dpr1-right-up.png'), ('drd', '1440x900-dpr1-right-down.png')):
    im = cap(f); d = ImageDraw.Draw(im)
    robot_box(d, V[key], s=1.8, colour=PINK, label=False)
    robot_box(d, V[key])
    ims.append(im.resize((960, 600), Image.LANCZOS))
titled(ims, ['Desktop home 1440x900 (yaw -4, pitch -6)\nCyan = primary s=1.6; pink = fallback s=1.8. Projected box, not a render.',
             'Desktop right-up limit (yaw 58, pitch 12)\nRobot stays in frame at the left edge.',
             'Desktop right-down limit (yaw 58, pitch -16)\nRobot stays in frame at the upper left.'], 'sketch-placement-desktop.png', top=48)

# 2. Entry, closed state, four sizes + short phone Projects open
ims, tt = [], []
im = cap('1440x900-dpr1-home.png'); d = ImageDraw.Draw(im)
robot_box(d, V['d'])
ask_entry(d, 1416, 720, 48, focus=True)
ims.append(im.resize((960, 600), Image.LANCZOS)); tt.append('Desktop 1440x900 home: entry above the hint pill (shown with focus ring)\nRobot box in frame beside TypeForge.')
for key, f, bottom, hh, t in (
        ('p390', '390x844-dpr1-home.png', 768, 44, '390x844 home\nRobot is off-frame to the right.'),
        ('p320', '320x844-dpr1-home.png', 0, 48, '320x844 home'),
        ('ps', '320x568-dpr1-home.png', 0, 48, '320x568 home'),
        ('ps', '320x568-dpr1-projects-open.png', 0, 48, '320x568 Projects open')):
    im = cap(f); d = ImageDraw.Draw(im)
    W, H = im.size
    if key == 'p390':
        # existing: hint pill row ~742-770 moves up one row; entry takes the row above toggle/look
        im2 = cap(f)
        pill = im2.crop((98, 738, 292, 774)); patch = im2.crop((98, 690, 292, 726))
        im.paste(im2.crop((0, 700, 390, 736)).resize((390, 36)), (0, 738))  # rough clean of old pill row
        im.paste(pill, (98, 684))
        ask_entry(d, 382, 770, 44)
    else:
        # existing rows (toggle|hint, look) stay; the entry takes a new row above them, and Projects sits above it
        rowtop = 442 if H == 568 else 718
        if 'projects-open' in f:
            im2 = cap(f)
            block = im2.crop((0, 228, 320, rowtop))
            im.paste(cap('320x568-dpr1-home.png').crop((0, 228 - 56, 320, rowtop)), (0, 228 - 56))
            d = ImageDraw.Draw(im)
            im.paste(block, (0, 228 - 56))
        ask_entry(d, 312, rowtop - 6, 48)
    for n in ('dissertation face', 'typeforge face'):
        r = P.rect(P.OBJ[n], V[key])
    ims.append(im); tt.append(t)
titled(ims, tt, 'sketch-entry.png', top=48)

# 3. Panel open with four sources, source 2 selected
ims, tt = [], []
im = dim(cap('1440x900-dpr1-home.png'), 0.32); d = ImageDraw.Draw(im)
robot_box(d, V['d'])
rounded_paste(im, panel(608, 852, 'sources4'), (272, 24), 14)
ims.append(im.resize((960, 600), Image.LANCZOS)); tt.append('Desktop 1440x900: 38rem sheet, left of centre, lighter backdrop\nRobot box stays clear to the right of the sheet (183 px gap).')
for f, size, t in (('390x844-dpr1-home.png', (390, 824), '390x844: bottom sheet\nScene and robot hidden.'),
                   ('320x844-dpr1-home.png', (320, 824), '320x844'),
                   ('320x568-dpr1-home.png', (320, 548), '320x568 (compact note)')):
    im = dim(cap(f), 0.32)
    compact = size[1] < 600
    rounded_paste(im, panel(size[0], size[1], 'sources4', compact=compact, pad=20), (0, im.size[1] - size[1]), 16)
    ims.append(im); tt.append(t)
titled(ims, tt, 'sketch-panel-open.png', top=48)

# 4. Panel content states at 390 wide
ims, tt = [], []
for st, t in (('open', 'Just opened\nFocus on the heading; no keyboard.'), ('zero-pending', 'Zero retrieved, pending\nNot a no-match yet. Cancel active.'),
              ('no-match', 'No match\nValid abstained answer only.'), ('sources1', 'One source\nOne chip, one row.'),
              ('cancelled', 'Cancelled\nFocus moved to Search sources.'), ('error', 'Error\nAll results cleared; button reads Try again.')):
    ims.append(panel(390, 640, st, pad=20)); tt.append(t)
titled(ims, tt, 'sketch-panel-states.png', top=48)
