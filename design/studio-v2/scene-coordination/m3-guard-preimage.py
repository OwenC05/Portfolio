"""Reverse S's exact guard edit; write a preimage only if the frozen hash matches."""
import hashlib
from pathlib import Path

here = Path(__file__).resolve().parent
source = here.parent / 'asset-pipeline' / 'full-kit' / 'source' / 'build_fullkit_m3.py'
raw = source.read_bytes()
assert hashlib.sha256(raw).hexdigest() == '8829c741ee25bbb32da8328e4d56eb43fcd40ad9eac931a49bc0bb7192d22954'
text = raw.decode('utf-8').replace('\r\n', '\n')
start = text.index('def retained_hierarchy_problems(')
end = text.index('def png_rgba(', start)
text = text[:start] + text[end:]
for line in (
    '    problems.extend(retained_hierarchy_problems(dp, dm, removed, set(ROWS)))\n',
    '    problems.extend(retained_texture_problems(dp, dm, raw3, rawp, bop, bom))\n',
):
    assert text.count(line) == 1
    text = text.replace(line, '')
needle = "        a_, b_ = pn[name], mn[name]\n        if 'mesh' not in a_:\n"
original = """        a_, b_ = pn[name], mn[name]
        if {k: v for k, v in a_.items() if k != 'mesh'} != {k: v for k, v in b_.items() if k != 'mesh'}:
            problems.append(('node', name))
            continue
        if 'mesh' not in a_:
"""
assert text.count(needle) == 1
text = text.replace(needle, original)
needle = """        problems.extend(palette_pixel_problems(png_rgba(img_bytes(dp, raw3, bop)),
                                              png_rgba(img_bytes(dm, rawp, bom)), img_name, t2_cells, GRID, CELL))
"""
original = """        wp, hp_, bp, rows_p = png_rgba(img_bytes(dp, raw3, bop))
        wm, hm, bm_, rows_m = png_rgba(img_bytes(dm, rawp, bom))
        assert (wp, hp_) == (wm, hm)
        t2_rect = [(len(G1['SWATCHES']) + k) for k in range(len(T2))]
        for y in range(hp_):
            for x in range(wp):
                cell = (y // CELL) * GRID + x // CELL
                if cell in t2_rect:
                    continue
                if rows_p[y][x * bp:x * bp + 3] != rows_m[y][x * bm_:x * bm_ + 3]:
                    problems.append(('palettePixel', img_name, x, y)); break
"""
assert text.count(needle) == 1
text = text.replace(needle, original)
expected = '7138fed965bb145febec3865d704a3cce80d394a23687972ff9cd1c536814ec2'
candidates = [text.encode('utf-8'), text.replace('\n', '\r\n').encode('utf-8')]
matches = [candidate for candidate in candidates if hashlib.sha256(candidate).hexdigest() == expected]
if len(matches) != 1:
    raise RuntimeError('No exact frozen preimage: ' + repr([(len(candidate), hashlib.sha256(candidate).hexdigest()) for candidate in candidates]))
out = here / 'm3-source-preimage-7138fed9.py'
with out.open('xb') as stream:
    stream.write(matches[0])
assert hashlib.sha256(source.read_bytes()).hexdigest() == hashlib.sha256(raw).hexdigest()
print(f'{out}: {len(matches[0])} bytes, sha256 {expected}; current source unchanged')
