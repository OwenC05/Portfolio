"""Right-limit pilot: timber panel door and linen floor lamp in a plain room shell.

Authoring source for design/studio-v2/asset-pipeline/pilot-right-limit. Run only as
  blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
          --python build_pilot.py -- <tag> <width> <height> <samples> [iso] [glb] [blend]
Everything is rebuilt from this script inside a fresh factory scene; nothing outside this
directory is read or written. Blender metres, Z up. Prototype world (two units per metre,
Y up, floor top y 0.11) maps to Blender as (x/2, -z/2, (y-0.11)/2).
"""
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
TAG = ARGS[0] if ARGS else 'early'
WIDTH = int(ARGS[1]) if len(ARGS) > 1 else 720
HEIGHT = int(ARGS[2]) if len(ARGS) > 2 else 450
SAMPLES = int(ARGS[3]) if len(ARGS) > 3 else 48
FLAGS = set(ARGS[4:])
RENDERS = os.path.join(HERE, 'renders')
TEXTURES = os.path.join(HERE, 'textures')
EXPORTS = os.path.join(HERE, 'exports')
for folder in (RENDERS, TEXTURES, EXPORTS):
    os.makedirs(folder, exist_ok=True)


def fresh(path):
    """Never overwrite an earlier deliverable; a new tag is required instead."""
    if os.path.exists(path):
        raise RuntimeError('Refusing to overwrite existing deliverable: ' + path)
    return path


def lin(hex_colour, alpha=1.0):
    def channel(value):
        value /= 255
        return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4
    return (channel(hex_colour >> 16 & 255), channel(hex_colour >> 8 & 255), channel(hex_colour & 255), alpha)


# ---------------------------------------------------------------- textures (local, original)
def save_image(name, pixels, colourspace='sRGB'):
    height, width = pixels.shape[:2]
    rgba = np.ones((height, width, 4), dtype=np.float32)
    rgba[..., :3] = np.clip(pixels, 0, 1)
    image = bpy.data.images.new(name, width, height, alpha=False)
    image.pixels.foreach_set(rgba[::-1].ravel())  # Blender rows run bottom-up
    image.filepath_raw = os.path.join(TEXTURES, name + '.png')
    image.file_format = 'PNG'
    image.save()
    image.colorspace_settings.name = colourspace
    return image


def timber_texture():
    """Mid oak, grain along U. One tile covers two metres of length."""
    rng = np.random.default_rng(7)
    width, height = 1024, 256
    v = np.linspace(0, 1, height)[:, None]
    u = np.linspace(0, 1, width)[None, :]
    tone = np.zeros((height, width))
    for _ in range(46):  # broad growth bands
        centre, spread, gain = rng.random(), 0.004 + rng.random() * 0.03, (rng.random() - 0.5) * 0.08
        wave = 0.012 * np.sin(u * 2 * math.pi * rng.integers(1, 4) + rng.random() * 6.28)
        tone += gain * np.exp(-((v - centre - wave) ** 2) / (2 * spread ** 2))
    fine = np.sin((v * 190 + 1.8 * np.sin(u * 2 * math.pi * 2)) * 2 * math.pi) * 0.018
    pores = (rng.random((height, width // 16)) > 0.93).repeat(16, axis=1)[:, :width] * -0.05
    value = 1 + tone + fine + pores
    base = np.array([0.60, 0.43, 0.27])
    return save_image('pilot_timber_albedo', value[..., None] * base[None, None, :])


def linen_textures():
    """Shade albedo with weave, and an emissive map: warm core, darker head and foot."""
    rng = np.random.default_rng(13)
    width, height = 256, 256
    y = np.arange(height)[:, None]
    x = np.arange(width)[None, :]
    weave = 0.93 + 0.045 * np.sin(x * math.pi / 2) * np.sin(y * math.pi / 2) + rng.normal(0, 0.012, (height, width))
    slub = 1 - 0.05 * (rng.random((height, 1)) > 0.9)
    albedo = (weave * slub)[..., None] * np.array([0.90, 0.84, 0.70])[None, None, :]
    v = 1 - y / (height - 1)  # 0 at the foot of the shade, 1 at the head
    core = 0.30 + 0.70 * np.exp(-((v - 0.42) ** 2) / (2 * 0.26 ** 2))
    emissive = (core * weave * slub)[..., None] * np.array([1.0, 0.72, 0.42])[None, None, :]
    return save_image('pilot_linen_albedo', albedo), save_image('pilot_linen_emissive', emissive)


# ---------------------------------------------------------------- materials (shared library)
def material(name, colour, roughness=0.6, metallic=0.0, image=None, emission=None, emission_strength=0.0, emission_image=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    shader = next(node for node in nodes if node.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = colour
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    if image is not None:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = image
        links.new(tex.outputs['Color'], shader.inputs['Base Color'])
    if emission is not None:
        shader.inputs['Emission Color'].default_value = emission
        shader.inputs['Emission Strength'].default_value = emission_strength
    if emission_image is not None:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = emission_image
        links.new(tex.outputs['Color'], shader.inputs['Emission Color'])
        shader.inputs['Emission Strength'].default_value = emission_strength
    return mat


# ---------------------------------------------------------------- mesh builder
class Builder:
    """Accumulates primitives with explicit UVs into one editable mesh object."""

    def __init__(self):
        self.verts, self.faces, self.uvs, self.smooth = [], [], [], []
        self.weld = {}

    def begin(self):
        """Start a new weld group: vertices are shared inside one primitive surface only,
        so smooth shading and bevels work without fusing separate parts together."""
        self.weld = {}

    def quad(self, points, uvs, smooth=False):
        face = []
        for point in points:
            key = (round(point[0], 6), round(point[1], 6), round(point[2], 6))
            if key not in self.weld:
                self.weld[key] = len(self.verts)
                self.verts.append(point)
            face.append(self.weld[key])
        if len(set(face)) < 3:
            return
        self.faces.append(tuple(face))
        self.uvs.extend(uvs)
        self.smooth.append(smooth)

    def box(self, lo, hi, grain='z', offset=0.0):
        """Axis-aligned box. Timber UVs: U runs along the grain axis, two metres per tile."""
        self.begin()
        lo, hi = Vector(lo), Vector(hi)
        axes = 'xyz'
        g = axes.index(grain)
        for axis in range(3):
            a, b = [i for i in range(3) if i != axis]
            for side, value in ((0, lo[axis]), (1, hi[axis])):
                corners = [(lo[a], lo[b]), (hi[a], lo[b]), (hi[a], hi[b]), (lo[a], hi[b])]
                # Outward winding: flip so the normal follows +axis on the far side.
                if (side == 1) != (axis != 1):
                    corners.reverse()
                points, uvs = [], []
                for ca, cb in corners:
                    p = [0.0, 0.0, 0.0]
                    p[axis], p[a], p[b] = value, ca, cb
                    points.append(tuple(p))
                    if axis == g:  # end grain
                        uvs.append((ca * 2 + offset, cb * 2 + offset))
                    else:
                        other = a if b == g else b
                        uvs.append((p[g] * 0.5 + offset, p[other] * 2 + offset * 3))
                self.quad(points, uvs)

    def tube(self, centre, radius_bottom, radius_top, z0, z1, segments=32, caps=True, axis='z', v_range=(0, 1), inside=False, arc=(0.0, 2 * math.pi)):
        self.begin()
        cx, cy = centre
        def place(r, angle, h):
            c, s = math.cos(angle) * r, math.sin(angle) * r
            return (cx + c, cy + s, h) if axis == 'z' else (h, cx + c, cy + s)
        for i in range(segments):
            a0 = arc[0] + (arc[1] - arc[0]) * i / segments
            a1 = arc[0] + (arc[1] - arc[0]) * (i + 1) / segments
            pts = [place(radius_bottom, a0, z0), place(radius_bottom, a1, z0), place(radius_top, a1, z1), place(radius_top, a0, z1)]
            uv = [(i / segments, v_range[0]), ((i + 1) / segments, v_range[0]), ((i + 1) / segments, v_range[1]), (i / segments, v_range[1])]
            if inside != (axis == 'x'):
                pts.reverse(); uv.reverse()
            self.quad(pts, uv, smooth=True)
        if caps:
            for h, r, flip in ((z0, radius_bottom, True), (z1, radius_top, False)):
                self.begin()
                ring = [place(r, 2 * math.pi * i / segments, h) for i in range(segments)]
                if flip != (axis == 'x'):
                    ring.reverse()
                self.quad(ring, [(0.5, 0.5)] * segments)

    def sphere(self, centre, radius, segments=20, rings=12, squash=1.0):
        self.begin()
        cx, cy, cz = centre
        def point(i, j):
            theta, phi = math.pi * j / rings, 2 * math.pi * i / segments
            return (cx + radius * math.sin(theta) * math.cos(phi), cy + radius * math.sin(theta) * math.sin(phi), cz - radius * squash * math.cos(theta))
        for j in range(rings):
            for i in range(segments):
                pts = [point(i, j), point(i + 1, j), point(i + 1, j + 1), point(i, j + 1)]
                if j == 0:
                    pts = [pts[0], pts[2], pts[3]]
                elif j == rings - 1:
                    pts = pts[:3]
                self.quad(pts, [(0.5, 0.5)] * len(pts), smooth=True)

    def build(self, name, mat, collection, bevel=0.0, solidify=0.0):
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata(self.verts, [], self.faces)
        layer = mesh.uv_layers.new(name='UVMap')
        assert len(layer.data) == len(self.uvs), name
        for loop, uv in zip(layer.data, self.uvs):
            loop.uv = uv
        mesh.polygons.foreach_set('use_smooth', self.smooth)
        mesh.materials.append(mat)
        mesh.update()
        mesh.validate()
        obj = bpy.data.objects.new(name, mesh)
        collection.objects.link(obj)
        # Modifiers stay live in the .blend; the exporter applies them on a copy.
        if solidify:
            mod = obj.modifiers.new('Shell thickness', 'SOLIDIFY')
            mod.thickness = solidify
            mod.offset = -1
        if bevel:
            mod = obj.modifiers.new('Soft edge', 'BEVEL')
            mod.width, mod.segments, mod.limit_method, mod.angle_limit = bevel, 2, 'ANGLE', math.radians(40)
        return obj


def collection(name):
    result = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(result)
    return result


# ---------------------------------------------------------------- scene
scene = bpy.context.scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
SHELL, CONTEXT, PILOT, LIGHTS, CAMERAS = (collection(n) for n in ('SHELL', 'CONTEXT_WINDOW', 'PILOT_RIGHT_LIMIT', 'LIGHTS', 'CAMERAS'))

timber_image = timber_texture()
linen_albedo, linen_emissive = linen_textures()
M = {
    'plaster': material('lib_plaster', lin(0x545a4d), 0.95),
    'ceiling': material('lib_ceiling', lin(0x3a3d36), 0.97),
    'floor': material('lib_floorboard', lin(0x4f4338), 0.7),
    'dark_oak': material('lib_dark_oak', lin(0x5a4634), 0.68),
    'skirting': material('lib_skirting', lin(0x202725), 0.55),
    'oak': material('lib_oak', (1, 1, 1, 1), 0.55, image=timber_image),
    'brass': material('lib_brass', lin(0xb69b68), 0.34, 1.0),
    'metal': material('lib_brushed_metal', lin(0xa3a69d), 0.36, 1.0),
    'black': material('lib_black_metal', lin(0x242a28), 0.5, 0.4),
    'linen': material('lib_linen_shade', (1, 1, 1, 1), 0.92, image=linen_albedo, emission=(1, 1, 1, 1), emission_strength=2.2, emission_image=linen_emissive),
    'trim': material('lib_linen_trim', lin(0xb9a887), 0.9, emission=lin(0xffb866), emission_strength=0.25),
    'bulb': material('lib_bulb', lin(0xfff0d0), 0.4, emission=lin(0xffd9a0), emission_strength=6.0),
    'ivory': material('lib_ivory', lin(0xe3e1d2), 0.45),
    'dusk': material('lib_dusk', lin(0x101822), 0.3, emission=lin(0x33465f), emission_strength=0.4),
}

# Room interior: X -2.25..2.55, Y -3.30..1.06 (back wall at +Y), Z 0..2.595.
X0, X1, Y0, Y1, ZC = -2.25, 2.55, -3.30, 1.06, 2.595
shell = Builder()
shell.quad([(X0, Y0, 0), (X1, Y0, 0), (X1, Y1, 0), (X0, Y1, 0)], [(0, 0)] * 4)
floor = shell.build('shell_floor', M['floor'], SHELL)
walls = Builder()
walls.quad([(X1, Y0, 0), (X1, Y0, ZC), (X1, Y1, ZC), (X1, Y1, 0)], [(0, 0)] * 4)  # right, faces -X
walls.quad([(X0, Y1, 0), (X0, Y1, ZC), (X0, Y0, ZC), (X0, Y0, 0)], [(0, 0)] * 4)  # left
walls.quad([(X1, Y1, 0), (X1, Y1, ZC), (X0, Y1, ZC), (X0, Y1, 0)], [(0, 0)] * 4)  # back
walls.quad([(X0, Y0, 0), (X0, Y0, ZC), (X1, Y0, ZC), (X1, Y0, 0)], [(0, 0)] * 4)  # front
walls.build('shell_walls', M['plaster'], SHELL)
top = Builder()
top.quad([(X0, Y0, ZC), (X0, Y1, ZC), (X1, Y1, ZC), (X1, Y0, ZC)], [(0, 0)] * 4)
top.build('shell_ceiling', M['ceiling'], SHELL)
beams = Builder()
for y in (0.45, -0.55, -1.55, -2.55):
    beams.box((X0, y - 0.06, ZC - 0.11), (X1, y + 0.06, ZC), grain='x')
beams.build('shell_beams', M['dark_oak'], SHELL, bevel=0.004)
trim = Builder()
trim.box((X1 - 0.025, Y0, 0), (X1, -2.26, 0.11), grain='y')      # skirting stops at the door frame
trim.box((X1 - 0.025, -1.44, 0), (X1, Y1, 0.11), grain='y')
trim.box((X0, Y1 - 0.025, 0), (X1, Y1, 0.11), grain='x')
trim.box((X0, Y0, 0), (X0 + 0.025, Y1, 0.11), grain='y')
trim.build('shell_skirting', M['skirting'], SHELL, bevel=0.003)
cornice = Builder()
cornice.box((X1 - 0.04, Y0, ZC - 0.06), (X1, Y1, ZC), grain='y')
cornice.box((X0, Y1 - 0.04, ZC - 0.06), (X1, Y1, ZC), grain='x')
cornice.build('shell_cornice', M['ceiling'], SHELL)

# Context only: the dusk window between lamp and door, at its prototype position.
WY, WZ = -0.75, 1.445
frame = Builder()
for z in (WZ - 0.52, WZ + 0.52):
    frame.box((X1 - 0.05, WY - 0.545, z - 0.0225), (X1, WY + 0.545, z + 0.0225), grain='y')
for y in (WY - 0.52, WY + 0.52):
    frame.box((X1 - 0.05, y - 0.0225, WZ - 0.5), (X1, y + 0.0225, WZ + 0.5), grain='z')
frame.box((X1 - 0.035, WY - 0.0125, WZ - 0.5), (X1, WY + 0.0125, WZ + 0.5), grain='z')
frame.box((X1 - 0.12, WY - 0.575, WZ - 0.57), (X1, WY + 0.575, WZ - 0.545), grain='y')
frame.build('context_window_frame', M['dark_oak'], CONTEXT, bevel=0.003)
pane = Builder()
pane.quad([(X1 - 0.008, WY - 0.5, WZ - 0.5), (X1 - 0.008, WY - 0.5, WZ + 0.5), (X1 - 0.008, WY + 0.5, WZ + 0.5), (X1 - 0.008, WY + 0.5, WZ - 0.5)], [(0, 0)] * 4)
pane.build('context_window_dusk', M['dusk'], CONTEXT)
blind = Builder()
for slat in range(9):
    z = WZ + 0.435 - slat * 0.0425
    blind.box((X1 - 0.055, WY - 0.495, z - 0.003), (X1 - 0.02, WY + 0.495, z + 0.003), grain='y')
blind.box((X1 - 0.06, WY - 0.505, WZ + 0.46), (X1 - 0.015, WY + 0.505, WZ + 0.495), grain='y')
blind.build('context_window_blind', M['ivory'], CONTEXT)

# ---- Pilot asset 1: frame-and-panel door, leaf 0.70 x 2.04 m, room face at X1 - 0.04.
DY, DW, DH = -1.85, 0.70, 2.05
FACE = X1 - 0.040      # stiles and rails
RECESS = X1 - 0.026    # panel field sits 14 mm back
LEFT, RIGHT = DY - DW / 2, DY + DW / 2
door = Builder()
door.box((FACE, LEFT, 0.008), (X1, LEFT + 0.10, DH), grain='z', offset=0.13)
door.box((FACE, RIGHT - 0.10, 0.008), (X1, RIGHT, DH), grain='z', offset=0.41)
RAILS = ((0.008, 0.21, 0.07), (0.91, 1.05, 0.29), (1.94, DH, 0.63))
for z0, z1, offset in RAILS:
    door.box((FACE, LEFT + 0.10, z0), (X1, RIGHT - 0.10, z1), grain='y', offset=offset)
OPENINGS = ((0.21, 0.91), (1.05, 1.94))
for index, (z0, z1) in enumerate(OPENINGS):
    # Raised field with a stepped margin, then a bolection strip around the opening.
    door.box((RECESS, LEFT + 0.10, z0), (X1, RIGHT - 0.10, z1), grain='z', offset=0.2 + index * 0.37)
    door.box((RECESS - 0.007, LEFT + 0.155, z0 + 0.055), (X1, RIGHT - 0.155, z1 - 0.055), grain='z', offset=0.55 + index * 0.21)
    m = 0.02
    door.box((FACE - 0.004, LEFT + 0.10, z0), (X1, LEFT + 0.10 + m, z1), grain='z', offset=0.8)
    door.box((FACE - 0.004, RIGHT - 0.10 - m, z0), (X1, RIGHT - 0.10, z1), grain='z', offset=0.9)
    door.box((FACE - 0.004, LEFT + 0.10 + m, z0), (X1, RIGHT - 0.10 - m, z0 + m), grain='y', offset=0.3)
    door.box((FACE - 0.004, LEFT + 0.10 + m, z1 - m), (X1, RIGHT - 0.10 - m, z1), grain='y', offset=0.6)
door_obj = door.build('pilot_door_leaf', M['oak'], PILOT, bevel=0.0035)
architrave = Builder()
A = 0.07
architrave.box((X1 - 0.055, LEFT - A, 0), (X1, LEFT - 0.004, DH + 0.004 + A), grain='z')
architrave.box((X1 - 0.055, RIGHT + 0.004, 0), (X1, RIGHT + A, DH + 0.004 + A), grain='z')
architrave.box((X1 - 0.055, LEFT - 0.004, DH + 0.004), (X1, RIGHT + 0.004, DH + 0.004 + A), grain='y')
architrave.box((X1 - 0.062, LEFT - A - 0.012, DH + 0.004 + A), (X1, RIGHT + A + 0.012, DH + 0.026 + A), grain='y')
arch_obj = architrave.build('pilot_door_architrave', M['dark_oak'], PILOT, bevel=0.004)
knob = Builder()
KY, KZ = RIGHT - 0.05, 1.0
knob.tube((KY, KZ), 0.03, 0.03, FACE - 0.006, FACE, axis='x', segments=24)
knob.tube((KY, KZ), 0.011, 0.011, FACE - 0.04, FACE - 0.006, axis='x', segments=16)
knob.sphere((FACE - 0.058, KY, KZ), 0.029, squash=1.0)
knob.tube((KY, KZ - 0.085), 0.012, 0.012, FACE - 0.004, FACE, axis='x', segments=16)  # keyhole escutcheon
knob_obj = knob.build('pilot_door_hardware', M['brass'], PILOT)

# ---- Pilot asset 2: floor lamp, base on the floor at the prototype position.
LX, LY = 2.36, 0.01
stand = Builder()
stand.tube((LX, LY), 0.125, 0.118, 0.0, 0.022, segments=40)
stand.tube((LX, LY), 0.03, 0.016, 0.022, 0.05, segments=24, caps=False)
stand_obj = stand.build('pilot_lamp_base', M['black'], PILOT)
pole = Builder()
pole.tube((LX, LY), 0.011, 0.011, 0.05, 1.86, segments=16)
pole_obj = pole.build('pilot_lamp_pole', M['metal'], PILOT)
fittings = Builder()
fittings.tube((LX, LY), 0.019, 0.019, 1.555, 1.6, segments=20)
fittings.sphere((LX, LY, 1.875), 0.017)
for spoke in range(3):  # spider holding the shade's top ring
    angle = spoke * 2 * math.pi / 3 + 0.4
    for step in range(6):
        r0, r1 = 0.132 * step / 6, 0.132 * (step + 1) / 6
        fittings.box((LX + math.cos(angle) * r0 - 0.003, LY + math.sin(angle) * r0 - 0.003, 1.838),
                     (LX + math.cos(angle) * r1 + 0.003, LY + math.sin(angle) * r1 + 0.003, 1.844))
fit_obj = fittings.build('pilot_lamp_fittings', M['brass'], PILOT)
S0, S1, R0, R1 = 1.60, 1.845, 0.168, 0.136
shade = Builder()
shade.tube((LX, LY), R0, R1, S0, S1, segments=48, caps=False)
shade_obj = shade.build('pilot_lamp_shade', M['linen'], PILOT, solidify=0.003)
bands = Builder()
bands.tube((LX, LY), R0 + 0.0025, R0 + 0.0015, S0 - 0.002, S0 + 0.014, segments=48, caps=False)
bands.tube((LX, LY), R1 + 0.0025, R1 + 0.0025, S1 - 0.013, S1 + 0.002, segments=48, caps=False)
seam_angle = math.atan2(-1.71, -2.71) + 0.6  # turned toward the seat, off centre
bands.tube((LX, LY), R0 + 0.0026, R1 + 0.0026, S0 + 0.014, S1 - 0.013, segments=2, caps=False,
           arc=(seam_angle - 0.03, seam_angle + 0.03))  # slim vertical seam following the taper
bands_obj = bands.build('pilot_lamp_shade_trim', M['trim'], PILOT, solidify=0.002)
bulb = Builder()
bulb.sphere((LX, LY, 1.7), 0.034, squash=1.25)
bulb_obj = bulb.build('pilot_lamp_bulb', M['bulb'], PILOT)
for obj in (shade_obj, bands_obj, bulb_obj):
    obj.visible_shadow = False  # the practical inside must reach the wall and door
    obj['nocast'] = True
for obj in PILOT.objects:
    obj['pilot'] = 'right-limit'
    obj['occluder'] = True  # every pilot mesh is opaque, the emissive bulb included

# ---------------------------------------------------------------- light
def light(name, kind, location, energy, colour, **settings):
    data = bpy.data.lights.new(name, kind)
    data.energy, data.color = energy, colour
    for key, value in settings.items():
        setattr(data, key, value)
    obj = bpy.data.objects.new(name, data)
    obj.location = location
    LIGHTS.objects.link(obj)
    return obj

light('practical_floor_lamp', 'POINT', (LX, LY, 1.7), 80, (1.0, 0.76, 0.50), shadow_soft_size=0.06)
window_light = light('window_dusk', 'AREA', (X1 - 0.08, WY, WZ - 0.1), 9, (0.55, 0.68, 0.9), size=0.9)
window_light.rotation_euler = (0, math.radians(-90), 0)
window_light.visible_camera = False  # context stand-in, never a visible card
# The prototype's single key: from behind the seat's right shoulder toward the back-left.
key = light('key_ceiling_wash', 'SUN', (1.2, -3.2, 3.745), 1.1, (1.0, 0.85, 0.66), angle=math.radians(12))
key.rotation_euler = Vector((-3.0, 6.9, -6.4)).to_track_quat('-Z', 'Y').to_euler()
# Stand-ins for fixtures outside this pilot, so the room is not judged in isolation.
light('standin_pendant', 'POINT', (-0.8, -0.15, 1.87), 45, (1.0, 0.82, 0.62), shadow_soft_size=0.3)
light('standin_wall_triangles', 'POINT', (0.275, 0.725, 1.845), 22, (1.0, 0.70, 0.36), shadow_soft_size=0.2)
world = bpy.data.worlds.new('pilot_world')
world.use_nodes = True
background = next(node for node in world.node_tree.nodes if node.type == 'BACKGROUND')
background.inputs['Color'].default_value = (0.86, 0.85, 0.80, 1)
background.inputs['Strength'].default_value = 0.09
scene.world = world

# ---------------------------------------------------------------- cameras (copied from view-config.ts)
EYE = (-0.35, -1.70, 1.345)

def camera(name, yaw, pitch, fov):
    data = bpy.data.cameras.new(name)
    data.sensor_fit = 'VERTICAL'
    data.lens_unit = 'FOV'
    data.angle = math.radians(fov)
    data.clip_start, data.clip_end = 0.05, 15
    obj = bpy.data.objects.new(name, data)
    y, p = math.radians(yaw), math.radians(pitch)
    forward = Vector((math.sin(y) * math.cos(p), math.cos(y) * math.cos(p), math.sin(p)))
    obj.location = EYE
    obj.rotation_euler = forward.to_track_quat('-Z', 'Y').to_euler()
    obj['yaw_deg'], obj['pitch_deg'], obj['fov_deg'] = yaw, pitch, fov
    CAMERAS.objects.link(obj)
    return obj

POSES = {
    'right-up': camera('cam_right_up', 58, 12, 58),
    'right-down': camera('cam_right_down', 58, -16, 58),
    'music': camera('cam_music', 44, -8, 58),
}

# ---------------------------------------------------------------- render
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 6
scene.render.threads_mode = 'FIXED'
scene.render.threads = 8
scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = WIDTH, HEIGHT, 100
scene.render.image_settings.file_format = 'PNG'
scene.view_settings.view_transform = 'AgX' if 'AgX' in [item.identifier for item in type(scene.view_settings).bl_rna.properties['view_transform'].enum_items] else scene.view_settings.view_transform
print('PILOT view transform', scene.view_settings.view_transform, 'look', scene.view_settings.look, 'exposure', scene.view_settings.exposure)

def render(name, cam):
    scene.camera = cam
    scene.render.filepath = fresh(os.path.join(RENDERS, f'{TAG}-{name}.png'))
    bpy.ops.render.render(write_still=True)
    print('PILOT rendered', scene.render.filepath)

for name, cam in POSES.items():
    # 'norender' builds, saves and exports only: no Cycles session, small memory footprint.
    if 'norender' in FLAGS or ('only-up' in FLAGS and name != 'right-up'):
        continue
    render(name, cam)

if 'iso' in FLAGS:
    # Isolated object views on neutral grey: room hidden, soft even light.
    for col in (SHELL, CONTEXT):
        col.hide_render = True
    for obj in LIGHTS.objects:
        obj.hide_render = obj.name != 'practical_floor_lamp'
    background.inputs['Strength'].default_value = 0.55
    background.inputs['Color'].default_value = (0.5, 0.5, 0.5, 1)
    backdrop = Builder()
    backdrop.quad([(-3, -6, 0), (X1 + 0.002, -6, 0), (X1 + 0.002, 4, 0), (-3, 4, 0)], [(0, 0)] * 4)
    backdrop.quad([(X1 + 0.002, -6, 0), (X1 + 0.002, -6, 4), (X1 + 0.002, 4, 4), (X1 + 0.002, 4, 0)], [(0, 0)] * 4)
    ISO = collection('ISO_BACKDROP')
    backdrop.build('iso_backdrop', material('iso_grey', (0.35, 0.35, 0.35, 1), 0.9), ISO)
    fill = light('iso_fill', 'AREA', (0.6, -2.6, 2.2), 260, (1, 1, 1), size=2.5)
    fill.rotation_euler = (Vector((0.6, -2.6, 2.2)) - Vector((2.4, -1.0, 1.0))).to_track_quat('Z', 'Y').to_euler()
    scene.render.resolution_x, scene.render.resolution_y = 600, 800
    def iso_camera(name, location, target, fov):
        data = bpy.data.cameras.new(name)
        data.sensor_fit, data.lens_unit, data.angle = 'VERTICAL', 'FOV', math.radians(fov)
        obj = bpy.data.objects.new(name, data)
        obj.location = location
        obj.rotation_euler = (Vector(target) - Vector(location)).to_track_quat('-Z', 'Y').to_euler()
        CAMERAS.objects.link(obj)
        return obj
    render('iso-door', iso_camera('cam_iso_door', (0.25, -2.75, 1.25), (X1, DY, 1.05), 52))
    render('iso-door-detail', iso_camera('cam_iso_door_detail', (1.75, -2.2, 1.15), (X1, DY + 0.2, 1.0), 40))
    render('iso-lamp', iso_camera('cam_iso_lamp', (0.9, -1.1, 1.35), (LX, LY, 0.98), 62))
    render('iso-lamp-shade', iso_camera('cam_iso_lamp_shade', (1.75, -0.45, 1.5), (LX, LY, 1.72), 34))
    for col in (SHELL, CONTEXT):
        col.hide_render = False
    ISO.hide_render = True
    for obj in LIGHTS.objects:
        obj.hide_render = obj.name == 'iso_fill'
    background.inputs['Strength'].default_value = 0.09
    background.inputs['Color'].default_value = (0.86, 0.85, 0.80, 1)
    scene.render.resolution_x, scene.render.resolution_y = WIDTH, HEIGHT
    scene.camera = POSES['right-up']

# ---------------------------------------------------------------- inventory, blend, GLB
print('PILOT inventory')
depsgraph = bpy.context.evaluated_depsgraph_get()
for obj in PILOT.objects:
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    lo = [min(v.co[i] for v in mesh.vertices) for i in range(3)]
    hi = [max(v.co[i] for v in mesh.vertices) for i in range(3)]
    print(f'  {obj.name}: tris={len(mesh.loop_triangles)} material={obj.material_slots[0].material.name} '
          f'bounds=({lo[0]:.3f},{lo[1]:.3f},{lo[2]:.3f})..({hi[0]:.3f},{hi[1]:.3f},{hi[2]:.3f})')
    evaluated.to_mesh_clear()

if 'blend' in FLAGS:
    path = fresh(os.path.join(HERE, f'pilot-right-limit-{TAG}.blend'))
    bpy.ops.wm.save_as_mainfile(filepath=path, check_existing=False, copy=True)
    print('PILOT saved', path)

if 'glb' in FLAGS:
    path = fresh(os.path.join(EXPORTS, f'pilot-right-limit-{TAG}.glb'))
    props = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
    for obj in bpy.data.objects:
        obj.select_set(obj.name in PILOT.objects)
    wanted = dict(filepath=path, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
                  export_cameras=False, export_lights=False, export_extras=True, export_animations=False,
                  export_draco_mesh_compression_enable=False, export_image_format='AUTO')
    bpy.ops.export_scene.gltf(**{k: v for k, v in wanted.items() if k == 'filepath' or k in props})
    print('PILOT exported', path, 'skipped options', sorted(k for k in wanted if k != 'filepath' and k not in props))
print('PILOT done', TAG)
