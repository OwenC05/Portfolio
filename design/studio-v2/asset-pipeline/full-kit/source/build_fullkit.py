"""Studio v2 full kit: M0 library and M1 enclosure + labelled gear proxies.

Run (one hidden process, never interactive):
  blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
      --python build_fullkit.py -- <variant: baseline|proposal> <tag> [library] [blend] [glb]

Builds, saves and exports only. Rendering is a separate process (render_cam.py) on the saved file.
Authoring units: Blender metres, Z up. Prototype world (x, y, z) -> Blender (x/2, -z/2, (y-0.11)/2).
Profile: studio-full-kit-v1. M1 gear is PROXY geometry (part names start with "proxy"); not finished assets.
"""
import bpy, bmesh, sys, os, math, json, struct, hashlib
import numpy as np
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
VARIANT, TAG, FLAGS = ARGS[0], ARGS[1], set(ARGS[2:])
assert VARIANT in ('baseline', 'proposal')
P = VARIANT == 'proposal'
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
TEXTURES, EXPORTS, MANIFESTS = os.path.join(HERE, 'textures'), os.path.join(KIT, 'exports'), os.path.join(KIT, 'manifests')
PILOT_BLEND = os.path.join(os.path.dirname(KIT), 'pilot-right-limit', 'pilot-right-limit-v03.blend')
INVENTORY = os.path.join(KIT, 'asset-inventory.json')
for folder in (TEXTURES, EXPORTS, MANIFESTS):
    os.makedirs(folder, exist_ok=True)


def fresh(path):
    if os.path.exists(path):
        raise RuntimeError('Refusing to overwrite existing deliverable: ' + path)
    return path


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def srgb(hex_colour):
    def channel(v):
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return (channel(hex_colour >> 16 & 255), channel(hex_colour >> 8 & 255), channel(hex_colour & 255))


def B(world):
    """Prototype world point -> Blender metres."""
    return Vector((world[0] / 2, -world[2] / 2, (world[1] - 0.11) / 2))


# ------------------------------------------------------------------ scene reset
scene = bpy.context.scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)


def collection(name):
    result = bpy.data.collections.new(name)
    scene.collection.children.link(result)
    return result


COL = {n: collection(n) for n in ('FK_ARCH', 'FK_WORKSTATION', 'FK_TARGETS', 'FK_NEARFIELD', 'FK_MUSIC', 'FK_WALLS',
                                  'FK_CONTACT', 'FK_CAMERAS', 'FK_LIGHT_REFERENCE')}
ROOT = bpy.data.objects.new('studio_full_kit', None)
scene.collection.objects.link(ROOT)

# ------------------------------------------------------------------ M0 library: palette atlas + materials
# name: (sRGB hex, roughness, metalness). Metals stay at or under 0.6: the runtime has no environment map.
SWATCHES = [
    ('ivory', 0xe3e1d2, 0.37, 0), ('cream', 0xf0e5cc, 0.55, 0), ('black', 0x202725, 0.54, 0), ('rubber', 0x151a19, 0.98, 0),
    ('metal', 0x969a91, 0.34, 0.6), ('brass', 0xb69b68, 0.38, 0.6), ('black_metal', 0x23282a, 0.45, 0.5), ('white_pc', 0xf2f0e8, 0.4, 0),
    ('pink', 0xd2a69e, 0.62, 0), ('sage', 0x9eaf99, 0.62, 0), ('blue', 0x9eafb8, 0.62, 0), ('yellow', 0xd8bd83, 0.62, 0),
    ('leaf', 0x5d7758, 0.8, 0), ('coffee', 0x382117, 0.25, 0), ('linen_trim', 0x8a7458, 0.9, 0), ('fabric', 0x454b47, 0.98, 0),
    ('proxy_grey', 0x8b8b85, 0.8, 0), ('proxy_dark', 0x4c4e4b, 0.8, 0), ('paper', 0xe9e4d6, 0.9, 0),
]
GRID, CELL = 8, 16
SWATCH_UV = {}


def write_png(name, pixels, colourspace):
    height, width = pixels.shape[:2]
    rgba = np.ones((height, width, 4), dtype=np.float32)
    rgba[..., :3] = pixels
    image = bpy.data.images.new(name, width, height, alpha=False)
    image.colorspace_settings.name = colourspace
    image.pixels.foreach_set(rgba[::-1].ravel())
    path = os.path.join(TEXTURES, name + '.png')
    image.filepath_raw, image.file_format = path, 'PNG'
    if not os.path.exists(path):
        image.save()
    image.pack()
    return image


colour_px = np.zeros((GRID * CELL, GRID * CELL, 3), dtype=np.float32)
orm_px = np.ones((GRID * CELL, GRID * CELL, 3), dtype=np.float32)
for index, (name, colour, rough, metal) in enumerate(SWATCHES):
    row, col = divmod(index, GRID)
    lin = srgb(colour)
    # The image buffer is written as display sRGB values, so convert the linear colour back.
    disp = [c * 12.92 if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055 for c in lin]
    colour_px[row * CELL:(row + 1) * CELL, col * CELL:(col + 1) * CELL] = disp
    orm_px[row * CELL:(row + 1) * CELL, col * CELL:(col + 1) * CELL] = (1.0, rough, metal)
    SWATCH_UV[name] = ((col + 0.5) / GRID, 1 - (row + 0.5) / GRID)
IMG_PALETTE = write_png('fk_palette_colour', colour_px, 'sRGB')
IMG_ORM = write_png('fk_palette_orm', orm_px, 'Non-Color')


def material(name, colour=(0.5, 0.5, 0.5), roughness=0.7, metallic=0.0, alpha=1.0, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    shader = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = (*colour, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    if alpha < 1:
        shader.inputs['Alpha'].default_value = alpha
        mat.surface_render_method = 'BLENDED'
    if emission:
        shader.inputs['Emission Color'].default_value = (*emission, 1)
        shader.inputs['Emission Strength'].default_value = strength
    return mat, shader


MAT = {}
# Door and lamp materials come from the accepted pilot file (read-only append), then join the library.
with bpy.data.libraries.load(PILOT_BLEND, link=False) as (src, dst):
    dst.objects = [n for n in src.objects if n.startswith('pilot_')]
PILOT_OBJECTS = {o.name: o for o in dst.objects}
for name in ('lib_oak', 'lib_dark_oak', 'lib_linen_shade'):
    MAT[name] = bpy.data.materials[name]
# Fold the accepted runtime override back into the source: the architrave twice as light as exported.
next(n for n in MAT['lib_dark_oak'].node_tree.nodes if n.type == 'BSDF_PRINCIPLED').inputs['Base Color'].default_value = (0.2045, 0.1225, 0.0687, 1)
for image in bpy.data.images:
    if image.filepath and not image.packed_file and image.source == 'FILE':
        image.pack()

MAT['lib_plaster'] = material('lib_plaster', srgb(0x454a40), 0.96)[0]
MAT['lib_floor'] = material('lib_floor', srgb(0x4b3b2d), 0.72)[0]
MAT['lib_weave'] = material('lib_weave', srgb(0x525850), 1.0)[0]
MAT['lib_glow'] = material('lib_glow', srgb(0xffdb9e), 0.6, emission=srgb(0xffc27a), strength=1.1)[0]
MAT['lib_frost'] = material('lib_frost', srgb(0xe4ede3), 0.9, alpha=0.42)[0]
MAT['lib_glass'] = material('lib_glass', srgb(0xb1bbb2), 0.53, alpha=0.23)[0]
MAT['lib_contact'] = material('lib_contact', srgb(0x100d0a), 1.0, alpha=0.5)[0]
MAT['rt_placeholder'] = material('rt_placeholder', srgb(0x1a2a33), 0.6, emission=srgb(0x1a2a33), strength=0.6)[0]
pal, shader = material('lib_palette')
nodes, links = pal.node_tree.nodes, pal.node_tree.links
tex = nodes.new('ShaderNodeTexImage'); tex.image = IMG_PALETTE; tex.interpolation = 'Closest'
links.new(tex.outputs['Color'], shader.inputs['Base Color'])
orm = nodes.new('ShaderNodeTexImage'); orm.image = IMG_ORM; orm.interpolation = 'Closest'
sep = nodes.new('ShaderNodeSeparateColor')
links.new(orm.outputs['Color'], sep.inputs['Color'])
links.new(sep.outputs['Green'], shader.inputs['Roughness'])
links.new(sep.outputs['Blue'], shader.inputs['Metallic'])
MAT['lib_palette'] = pal

# ------------------------------------------------------------------ geometry helpers
MESHES = {}


def paint(mesh, swatch):
    if swatch:
        u, v = SWATCH_UV[swatch]
        for loop in mesh.uv_layers.active.data:
            loop.uv = (u, v)


def prim(kind, mat, swatch):
    """Unit box or 16-sided unit cylinder, shared by every object that uses the same material and swatch."""
    key = (kind, mat, swatch)
    if key not in MESHES:
        bm = bmesh.new()
        bm.loops.layers.uv.new('UVMap')
        if kind == 'box':
            bmesh.ops.create_cube(bm, size=1, calc_uvs=True)
        else:
            bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.5, radius2=0.5, depth=1, calc_uvs=True)
        mesh = bpy.data.meshes.new(f'fk_{kind}_{mat}_{swatch or "uv"}')
        bm.to_mesh(mesh); bm.free()
        mesh.materials.append(MAT[mat])
        paint(mesh, swatch)
        MESHES[key] = mesh
    return MESHES[key]


def leaf(name, mesh, coll, asset, role='opaque', casts=True, occluder=None, receive=True):
    obj = bpy.data.objects.new(name, mesh)
    COL[coll].objects.link(obj)
    obj.parent = ROOT
    transparent = role == 'transparent'
    obj['assetId'], obj['role'] = asset, role
    obj['occluder'] = bool(role in ('opaque', 'decorative-screen', 'runtime-dusk')) if occluder is None else bool(occluder)
    obj['transparent'] = bool(transparent)
    obj['nocast'] = bool(not casts)
    obj['receiveShadow'] = bool(receive)
    return obj


def box(asset, part, coll, centre, size, mat='lib_palette', swatch='proxy_grey', yaw=0.0, kind='box', **flags):
    """centre and size in prototype world units; yaw is rotation about world +Y in radians."""
    obj = leaf(f'{asset}__{part}', prim(kind, mat, swatch if mat == 'lib_palette' else None), coll, asset, **flags)
    obj.location = B(centre)
    obj.scale = (size[0] / 2, size[2] / 2, size[1] / 2)
    obj.rotation_euler = (0, 0, yaw)
    return obj


def cyl(asset, part, coll, centre, radius, height, **kw):
    return box(asset, part, coll, centre, (radius * 2, height, radius * 2), kind='cyl', **kw)


def local(group, yaw, offset):
    """Three.js child offset under a group rotated about Y."""
    c, s = math.cos(yaw), math.sin(yaw)
    return (group[0] + offset[0] * c + offset[2] * s, group[1] + offset[1], group[2] - offset[0] * s + offset[2] * c)


def quad(name, coll, asset, role, centre_world, width, height, yaw, mat='rt_placeholder', casts=False, receive=False, occluder=None):
    """Exact rectangle: 4 vertices, 2 triangles, local front = Blender -Y (glTF +Z), CCW, upright UV. Unit scale."""
    w, h = width / 4, height / 4  # world units -> half extents in metres
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([(-w, 0, -h), (w, 0, -h), (w, 0, h), (-w, 0, h)], [], [(0, 1, 2, 3)])
    uv = mesh.uv_layers.new(name='UVMap')
    # v02: V is authored flipped so the exporter's V flip leaves raw glTF UV (0,0) at bottom-left,
    # matching three.js PlaneGeometry with flipY canvas textures (Codex preflight msg_97de996b863e).
    for loop, coords in zip(uv.data, [(0, 1), (1, 1), (1, 0), (0, 0)]):
        loop.uv = coords
    mesh.materials.append(MAT[mat])
    obj = leaf(name, mesh, coll, asset, role=role, casts=casts, receive=receive, occluder=occluder)
    obj.location = B(centre_world)
    obj.rotation_euler = (0, 0, yaw)
    return obj


# ------------------------------------------------------------------ M1 architecture
X0, X1, Y0, Y1, Z1 = -2.25, 2.55, -3.30, 1.06, 2.595


def inward_mesh(name, faces, mat):
    verts, polys, uvs = [], [], []
    centre = Vector(((X0 + X1) / 2, (Y0 + Y1) / 2, Z1 / 2))
    for corners, uv in faces:
        pts = [Vector(c) for c in corners]
        if (pts[1] - pts[0]).cross(pts[3] - pts[0]).dot(centre - (pts[0] + pts[2]) / 2) < 0:
            pts.reverse(); uv = list(reversed(uv))
        polys.append(tuple(range(len(verts), len(verts) + 4)))
        verts += pts; uvs += uv
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], polys)
    layer = mesh.uv_layers.new(name='UVMap')
    for loop, coords in zip(layer.data, uvs):
        loop.uv = coords
    mesh.materials.append(MAT[mat])
    return mesh


def wall(a, b):
    length = (Vector(b) - Vector(a)).length
    return ([(a[0], a[1], 0), (b[0], b[1], 0), (b[0], b[1], Z1), (a[0], a[1], Z1)], [(0, 0), (length, 0), (length, Z1), (0, Z1)])


shell = inward_mesh('arch_shell_mesh', [
    wall((X0, Y1), (X1, Y1)), wall((X1, Y1), (X1, Y0)), wall((X1, Y0), (X0, Y0)), wall((X0, Y0), (X0, Y1)),
    ([(X0, Y0, Z1), (X1, Y0, Z1), (X1, Y1, Z1), (X0, Y1, Z1)], [(0, 0), (4.8, 0), (4.8, 4.36), (0, 4.36)]),
], 'lib_plaster')
leaf('arch_shell__walls_ceiling', shell, 'FK_ARCH', 'arch_shell', casts=False)
floor = inward_mesh('arch_floor_mesh', [([(X0, Y0, 0), (X1, Y0, 0), (X1, Y1, 0), (X0, Y1, 0)], [(0, 0), (4.8, 0), (4.8, 4.36), (0, 4.36)])], 'lib_floor')
leaf('arch_floor__boards', floor, 'FK_ARCH', 'arch_floor', casts=False)

A = dict(coll='FK_ARCH', casts=False)
for i, (y, height, depth, asset, mat) in enumerate([(0.22, 0.22, 0.05, 'arch_skirting', 'lib_dark_oak'), (5.24, 0.12, 0.08, 'arch_cornice', 'lib_plaster')]):
    box(asset, 'back', centre=(0.3, y, -2.12 + depth / 2), size=(9.6, height, depth), mat=mat, **A)
    box(asset, 'front', centre=(0.3, y, 6.6 - depth / 2), size=(9.6, height, depth), mat=mat, **A)
    box(asset, 'left', centre=(-4.5 + depth / 2, y, 2.24), size=(depth, height, 8.72), mat=mat, **A)
    box(asset, 'right', centre=(5.1 - depth / 2, y, 2.24), size=(depth, height, 8.72), mat=mat, **A)
for i, z in enumerate([-0.9, 1.1, 3.1, 5.1]):
    box('arch_beams', f'beam_{i + 1}', centre=(0.3, 5.19, z), size=(9.6, 0.22, 0.24), mat='lib_dark_oak', **A)
# Window on the right wall (group at world 5.1, 3, 1.5): frame, mullion, sill, blind, runtime dusk pane.
for part, c, s in [('head', (5.05, 4.04, 1.5), (0.1, 0.09, 2.17)), ('foot', (5.05, 1.96, 1.5), (0.1, 0.09, 2.17)),
                   ('jamb_a', (5.05, 3, 0.46), (0.1, 2.17, 0.09)), ('jamb_b', (5.05, 3, 2.54), (0.1, 2.17, 0.09)),
                   ('mullion', (5.065, 3, 1.5), (0.05, 2, 0.05)), ('sill', (4.98, 1.89, 1.5), (0.24, 0.05, 2.3))]:
    box('arch_window', part, centre=c, size=s, mat='lib_dark_oak', **A)
quad('rt_window_dusk', 'FK_ARCH', 'rt_window_dusk', 'runtime-dusk', (5.085, 3, 1.5), 2, 2, -math.pi / 2)
box('arch_blind', 'head_rail', centre=(5.02, 3.96, 1.5), size=(0.09, 0.07, 2.02), swatch='ivory', **A)
for slat in range(9):
    box('arch_blind', f'slat_{slat + 1}', centre=(5.025, 3.87 - slat * 0.085, 1.5), size=(0.07, 0.012, 1.98), swatch='ivory', **A)
box('arch_switches', 'proxy_switch_door', centre=(5.085, 2.5, 2.75), size=(0.03, 0.17, 0.17), swatch='ivory', **A)

# Door and floor lamp: accepted pilot v03 geometry, live modifiers kept, re-pointed to the shared library.
PILOT_MAP = {
    'pilot_door_leaf': ('arch_door__leaf', 'arch_door', 'lib_oak', None, False),
    'pilot_door_architrave': ('arch_door__architrave', 'arch_door', 'lib_dark_oak', None, False),
    'pilot_door_hardware': ('arch_door__hardware', 'arch_door', 'lib_palette', 'brass', False),
    'pilot_lamp_base': ('fix_floor_lamp__base', 'fix_floor_lamp', 'lib_palette', 'black_metal', True),
    'pilot_lamp_pole': ('fix_floor_lamp__pole', 'fix_floor_lamp', 'lib_palette', 'metal', True),
    'pilot_lamp_fittings': ('fix_floor_lamp__fittings', 'fix_floor_lamp', 'lib_palette', 'brass', True),
    'pilot_lamp_shade': ('fix_floor_lamp__shade', 'fix_floor_lamp', 'lib_linen_shade', None, False),
    'pilot_lamp_shade_trim': ('fix_floor_lamp__shade_trim', 'fix_floor_lamp', 'lib_palette', 'linen_trim', False),
    'pilot_lamp_bulb': ('fix_floor_lamp__bulb', 'fix_floor_lamp', 'lib_glow', None, False),
}
for old, (new, asset, mat, swatch, casts) in PILOT_MAP.items():
    obj = PILOT_OBJECTS[old]
    obj.name = new
    obj.data.name = new + '_mesh'
    COL['FK_ARCH'].objects.link(obj)
    obj.parent = ROOT
    obj.data.materials.clear(); obj.data.materials.append(MAT[mat])
    paint(obj.data, swatch)
    for key in list(obj.keys()):
        del obj[key]
    obj['assetId'], obj['role'], obj['occluder'], obj['transparent'], obj['nocast'], obj['receiveShadow'] = asset, 'opaque', True, False, bool(not casts), True
LIBRARY = set(MAT.values())
for stale in [m for m in bpy.data.materials if m.users == 0 and m not in LIBRARY]:
    bpy.data.materials.remove(stale)

# ------------------------------------------------------------------ M1 workstation and the seven binding planes
W = dict(coll='FK_WORKSTATION')
box('desk_top', 'proxy_slab', centre=(-1.35, 1.54 if P else 1.5, 0.25), size=(4.9, 0.08 if P else 0.16, 1.75), mat='lib_oak', **W)
for i, (x, z) in enumerate([(-3.51, -0.35), (0.81, -0.35), (-3.51, 0.85), (0.81, 0.85)]):
    box('desk_frame', f'proxy_leg_{i + 1}', centre=(x, 0.78, z), size=(0.1, 1.34, 0.1), swatch='black_metal', **W)
box('desk_mat', 'proxy_mat', centre=(-1.5 if P else -1.6, 1.589, 0.62 if P else 0.6), size=(1.8, 0.018, 0.8) if P else (2.6, 0.018, 0.92), mat='lib_weave', casts=False, **W)

# id: (group position, face width, face height, yaw); exact values from build-studio.ts e23588e2.
SCREENS = {'dissertation': ((-1.61, 2.38, -0.27), 1.88, 1.06, 0.0), 'copilot': ((-3.11, 2.44, -0.13), 0.8, 1.34, 0.3),
           'typeforge': ((-0.11, 2.44, -0.13), 0.8, 1.34, -0.3), 'studio': ((-1.61, 3.52, -0.64), 1.29, 0.73, 0.0)}
FACE_Z = 0.054
BORDER_Z = FACE_Z - 0.008 if P else 0.049          # proposal 4 mm real behind the face; baseline 2.5 mm
BORDER_GROW = 0.04 if P else 0.055                 # proposal 10 mm real overhang per side; baseline 13.75 mm
BEZEL = 0.035 if P else 0.065                      # per side, world units
MONITOR_OUTER = {}
for pid, (group, w, h, yaw) in SCREENS.items():
    if P and pid == 'dissertation':
        group = (group[0], group[1], -0.39)        # proposed 60 mm setback
    asset = {'dissertation': 'mon_central', 'studio': 'mon_top'}.get(pid, 'mon_side')
    tag = pid
    if pid == 'studio':
        quad('display_studio', 'FK_TARGETS', 'display_studio', 'decorative-screen', local(group, yaw, (0, 0, FACE_Z)), w, h, yaw)
    else:
        quad(f'target_{pid}', 'FK_TARGETS', 'target_faces', 'target', local(group, yaw, (0, 0, FACE_Z)), w, h, yaw, occluder=False)
        quad(f'border_{pid}', 'FK_TARGETS', 'target_borders', 'border', local(group, yaw, (0, 0, BORDER_Z)), w + BORDER_GROW, h + BORDER_GROW, yaw, occluder=False)
    ow, oh = w + 2 * BEZEL, h + 2 * BEZEL
    if P:
        floor_z = BORDER_Z - 0.008                 # recess floor 4 mm real behind the border
        box(asset, f'proxy_{tag}_shell', centre=local(group, yaw, (0, 0, floor_z - 0.045)), size=(ow, oh, 0.09), swatch='black', yaw=yaw, **W)
        lip = (ow - (w + BORDER_GROW)) / 2          # lip surrounds the border, flush with the face plane
        depth = FACE_Z - floor_z
        for part, off, size in [('lip_l', (-(ow - lip) / 2, 0), (lip, oh)), ('lip_r', ((ow - lip) / 2, 0), (lip, oh)),
                                ('lip_t', (0, (oh - lip) / 2), (ow, lip)), ('lip_b', (0, -(oh - lip) / 2), (ow, lip))]:
            box(asset, f'proxy_{tag}_{part}', centre=local(group, yaw, (off[0], off[1], floor_z + depth / 2)), size=(size[0], size[1], depth), swatch='black', yaw=yaw, **W)
    else:
        box(asset, f'proxy_{tag}_shell', centre=local(group, yaw, (0, 0, -0.005)), size=(ow, oh, 0.1), swatch='black', yaw=yaw, **W)
    MONITOR_OUTER[pid] = [B(local(group, yaw, (sx * ow / 2, sy * oh / 2, FACE_Z))) for sx in (-1, 1) for sy in (-1, 1)]
    post_bottom = 1.6 - group[1]
    box(asset, f'proxy_{tag}_post', centre=local(group, yaw, (0, (post_bottom - 0.08) / 2, -0.075)), size=(0.07, -post_bottom - 0.08 + 0.16, 0.07), swatch='metal', yaw=yaw, **W)
    if pid != 'studio':
        box(asset, f'proxy_{tag}_foot', centre=local(group, yaw, (0, post_bottom, 0)), size=(0.53, 0.035, 0.37), swatch='black', yaw=yaw, **W)

box('pc_tower', 'proxy_case', centre=(0.5, 0.70, 0.62) if P else (0.42, 0.78, 0.38), size=(0.55, 1.18, 1.12) if P else (0.77, 1.24, 1.09), swatch='white_pc', **W)
box('sub_woofer', 'proxy_cabinet', centre=(-2.7, 0.54, -0.05), size=(0.74, 0.78, 0.72), swatch='black', **W)
box('fix_pendant', 'proxy_body', centre=(-1.6, 4.02, 0.3), size=(1.9, 0.08, 0.17), swatch='black', casts=False, **W)
box('fix_pendant', 'proxy_lens', centre=(-1.6, 3.975, 0.3), size=(1.78, 0.02, 0.1), mat='lib_glow', casts=False, **W)

# ------------------------------------------------------------------ M1 nearfield proxies (baseline = prototype sizes; proposal = tier D 1.6)
N = dict(coll='FK_NEARFIELD')
box('kb_case', 'proxy_case', centre=(-1.65, 1.64, 0.66 if P else 0.62), size=(1.04, 0.085, 0.36) if P else (1.63, 0.085, 0.63), swatch='sage', **N)
box('kb_keycaps', 'proxy_cap_field', centre=(-1.65, 1.71, 0.66 if P else 0.62), size=(0.96, 0.06, 0.30) if P else (1.5, 0.06, 0.5), swatch='cream', **N)
box('kb_keycaps', 'proxy_accent_caps', centre=(-1.25 if P else -1.02, 1.715, 0.72 if P else 0.72), size=(0.12, 0.062, 0.12) if P else (0.2, 0.062, 0.2), swatch='pink', **N)
box('mouse_native', 'proxy_body', centre=(-0.85, 1.637, 0.68) if P else (-0.55, 1.65, 0.66), size=(0.2, 0.115, 0.38) if P else (0.19, 0.1, 0.3), swatch='ivory', **N)
cyl('mug_coaster', 'proxy_mug', centre=(-0.42, 1.73, 0.74) if P else (0.62, 1.705, 0.6), radius=0.131 if P else 0.115, height=0.30 if P else 0.25, swatch='cream', **N)
box('notebook_pen', 'proxy_notebook', centre=(0.2, 1.595, 0.72) if P else (0.07, 1.595, 0.78), size=(0.48, 0.03, 0.67) if P else (0.4, 0.03, 0.54), swatch='sage', **N)
box('speaker_nearfield', 'proxy_cabinet', centre=(0.78, 2.035, -0.25) if P else (0.72, 1.94, -0.2), size=(0.59, 0.91, 0.67) if P else (0.44, 0.64, 0.42), swatch='black', **N)
if P:
    box('headphones', 'proxy_on_stand', centre=(0.22, 1.9, -0.22), size=(0.56, 0.64, 0.26), swatch='proxy_dark', **N)
else:
    box('headphones', 'proxy_flat', centre=(-3.0, 1.64, 0.82), size=(0.5, 0.12, 0.5), swatch='proxy_dark', **N)
box('mic_boom', 'proxy_clamp', centre=(-3.58, 1.545, 0.51), size=(0.12, 0.24, 0.2), swatch='black', **N)
box('mic_boom', 'proxy_arm', centre=(-3.56, 2.04, 0.47), size=(0.06, 0.9, 0.06), swatch='black', **N)
box('mic_boom', 'proxy_capsule', centre=(-3.2, 2.3, 0.72) if P else (-3.08, 2.0, 0.96), size=(0.16, 0.54, 0.16) if P else (0.14, 0.3, 0.14), swatch='proxy_dark', **N)

# ------------------------------------------------------------------ M1 music proxies
M = dict(coll='FK_MUSIC')
CTL, CTL_YAW = ((2.0, 1.35, 1.35), -0.35) if P else ((2.7, 1.35, 0.83), 0.0)
box('ctl_body', 'proxy_body', centre=CTL, size=(1.98, 0.19, 0.64) if P else (2.97, 0.16, 0.9), swatch='white_pc', yaw=CTL_YAW, **M)
box('ctl_keys', 'proxy_key_bed', centre=local(CTL, CTL_YAW, (0, 0.11, 0.1 if P else 0.15)), size=(1.74, 0.04, 0.36) if P else (2.6, 0.04, 0.52), swatch='cream', yaw=CTL_YAW, **M)
for i, x in enumerate((-0.7, 0.7) if P else (-1.03, 1.03)):
    box('ctl_stand', f'proxy_leg_{i + 1}', centre=local(CTL, CTL_YAW, (x, -0.68, 0)), size=(0.08, 1.2, 0.6), swatch='black', yaw=CTL_YAW, **M)
box('ctl_sustain_pedal', 'proxy_pedal', centre=local(CTL, CTL_YAW, (0.2, -1.19, 0.55)), size=(0.2, 0.08, 0.52), swatch='black', yaw=CTL_YAW, **M)
STOOL = (2.35, 2.25) if P else (3.1, 2.05)
cyl('stool_keys', 'proxy_seat', centre=(STOOL[0], 1.08, STOOL[1]), radius=0.31, height=0.14, swatch='fabric', **M)
box('stool_keys', 'proxy_post', centre=(STOOL[0], 0.56, STOOL[1]), size=(0.08, 0.9, 0.08), swatch='metal', **M)
D = (2.8, 0, -1.12)
box('drum_rack', 'proxy_crossbar', centre=(D[0], 1.43, D[2]), size=(2.4, 0.07, 0.07), swatch='metal', **M)
for i, x in enumerate((-1.16, 1.16)):
    box('drum_rack', f'proxy_upright_{i + 1}', centre=(D[0] + x, 0.86, D[2]), size=(0.07, 1.5, 0.07), swatch='metal', **M)
for i, (x, y, z, r) in enumerate([(-0.56, 1.7, 0, 0.29), (0.24, 1.73, 0, 0.3), (-0.7, 1.2, 0.66, 0.34), (0.84, 1.26, 0.59, 0.34)]):
    cyl('drum_pads', f'proxy_pad_{i + 1}', centre=(D[0] + x, y, D[2] + z), radius=r, height=0.1, swatch='proxy_dark', **M)
for i, (x, y, z, r) in enumerate([(-1.06, 2.15, -0.18, 0.4), (0.56, 2.23, -0.22, 0.44), (1.16, 1.98, 0.23, 0.37)]):
    cyl('drum_cymbals', f'proxy_cymbal_{i + 1}', centre=(D[0] + x, y, D[2] + z), radius=r, height=0.03, swatch='rubber', **M)
box('drum_kick', 'proxy_tower_pedal', centre=(D[0] + 0.03, 0.46, D[2] + 0.6), size=(0.44, 0.6, 0.45), swatch='black', **M)
box('drum_hihat_pedal', 'proxy_pedal', centre=(D[0] - 1.05, 0.16, D[2] + 0.75), size=(0.26, 0.08, 0.66), swatch='black', **M)
box('drum_module', 'proxy_module', centre=(D[0] - 1.29, 1.54, D[2] + 0.3), size=(0.24, 0.07, 0.32), swatch='black', **M)
box('drum_sticks', 'proxy_pair', centre=(D[0] - 0.65, 1.3, D[2] + 0.64), size=(0.5, 0.02, 0.06), mat='lib_oak', **M)
cyl('drum_throne', 'proxy_seat', centre=(2.85, 1.0, 0), radius=0.31, height=0.14, swatch='fabric', **M)
box('rug', 'proxy_rug', centre=(2.75, 0.13, 0.3), size=(3.7, 0.035, 4.5), mat='lib_weave', casts=False, **M)

# ------------------------------------------------------------------ M1 walls proxies
L = dict(coll='FK_WALLS', casts=False)
SHELF_Y = 3.61 if P else 3.1
box('wall_shelf', 'proxy_board', centre=(-4.29, SHELF_Y, 0.1), size=(0.42, 0.06, 2.3), mat='lib_oak', **L)
box('shelf_books', 'proxy_row', centre=(-4.3, SHELF_Y + 0.24, -0.5), size=(0.28, 0.42, 1.0), swatch='sage', **L)
box('shelf_plant', 'proxy_plant', centre=(-4.29, SHELF_Y + 0.28, 0.52), size=(0.3, 0.5, 0.3), swatch='leaf', **L)
box('shelf_speaker', 'proxy_cabinet', centre=(-4.3, SHELF_Y + 0.22, 0.98), size=(0.28, 0.38, 0.26), swatch='black', **L)
box('wall_print', 'proxy_frame', centre=(-4.47, 3.05, 2.25 if P else 2.0), size=(0.05, 1.24, 0.92), swatch='black', **L)
BOARD = ((-4.38, 1.61, 0.3), (0.075, 3.0, 0.5)) if P else ((-4.3, 1.27, 0.95), (0.075, 2.4, 0.36))
box('snowboard_deck', 'proxy_deck', centre=BOARD[0], size=BOARD[1], swatch='ivory', coll='FK_WALLS')
for i, dy in enumerate((-0.4, 0.4)):
    box('snowboard_bindings', f'proxy_binding_{i + 1}', centre=(BOARD[0][0] + 0.1, BOARD[0][1] + dy, BOARD[0][2]), size=(0.14, 0.22, 0.3), swatch='black', coll='FK_WALLS')
for i, x in enumerate([1.8, 2.92, 4.04]):
    box('acoustic_panels', f'proxy_panel_{i + 1}', centre=(x, 2.85, -2.07), size=(0.87, 1.78, 0.09), mat='lib_weave', **L)
for i in range(5):
    box('fix_wall_triangles', f'proxy_light_{i + 1}', centre=(-0.15 + i * 0.34, 3.85 + (i % 2) * 0.26, -2.06), size=(0.3, 0.26, 0.07), mat='lib_glow', **L)

# Imported contact planes (lib_contact, BLEND): flat quads lying on the support surface.
for name, centre, w, d in [('desk_gear', (-1.5, 1.582, 0.6), 2.4, 1.0), ('music_corner', (2.75, 0.152, 0.2), 3.4, 3.6), ('under_desk', (-1.2, 0.114, 0.3), 4.6, 1.6)]:
    obj = box('contact_decals', name, 'FK_CONTACT', centre, (w, 0.002, d), mat='lib_contact', role='transparent', casts=False, receive=False)

# ------------------------------------------------------------------ cameras and reference lights (never exported)
EYE = Vector((-0.35, -1.70, 1.345))


def camera(name, yaw, pitch, fov, rx, ry):
    data = bpy.data.cameras.new(name)
    data.sensor_fit, data.lens_unit, data.angle = 'VERTICAL', 'FOV', math.radians(fov)
    data.clip_start, data.clip_end = 0.05, 15
    obj = bpy.data.objects.new(name, data)
    y, p = math.radians(yaw), math.radians(pitch)
    obj.location = EYE
    obj.rotation_euler = Vector((math.sin(y) * math.cos(p), math.cos(y) * math.cos(p), math.sin(p))).to_track_quat('-Z', 'Y').to_euler()
    obj['yaw_deg'], obj['pitch_deg'], obj['fov_deg'], obj['res_x'], obj['res_y'] = yaw, pitch, fov, rx, ry
    COL['FK_CAMERAS'].objects.link(obj)
    return obj


CAMS = [camera('home-1440', -4, -6, 58, 1440, 900), camera('home-1024', -4, -6, 58, 1024, 768), camera('music-1440', 44, -8, 58, 1440, 900),
        camera('left-up', -38, 12, 58, 1440, 900), camera('left-down', -38, -16, 58, 1440, 900),
        camera('right-up', 58, 12, 58, 1440, 900), camera('right-down', 58, -16, 58, 1440, 900),
        camera('home-390-f64', -13, -8, 64, 390, 844), camera('home-320-f64', -13, -8, 64, 320, 844),
        camera('home-320-f70', -14, -7, 70, 320, 844), camera('home-320-f74', -14, -7, 74, 320, 844), camera('home-320-f76', -14, -7, 76, 320, 844),
        camera('home-390-f74', -14, -7, 74, 390, 844), camera('home-320x568-f74', -14, -7, 74, 320, 568),
        camera('music-320-f64', 44, -8, 64, 320, 844), camera('music-320-f74', 44, -8, 74, 320, 844)]
pano = camera('pano-eye', 0, 0, 58, 1024, 512)
pano.data.type = 'PANO'
scene.render.engine = 'CYCLES'
pano.data.panorama_type = 'EQUIRECTANGULAR'
scene.camera = CAMS[0]

for name, world, watts, colour in [('ref_pendant', (-1.6, 3.85, 0.3), 45, 0xffd2a0), ('ref_wall_triangles', (0.55, 3.8, -1.45), 28, 0xffb15c),
                                   ('ref_floor_lamp', (4.56, 3.5, -0.02), 32, 0xffdeb2), ('ref_window_cool', (4.35, 3, 1.5), 14, 0x9db4cc),
                                   ('ref_door_fill', (3.3, 3.3, 3.2), 11, 0xffdeb2)]:
    data = bpy.data.lights.new(name, 'POINT')
    data.energy, data.color, data.shadow_soft_size = watts, srgb(colour), 0.08
    obj = bpy.data.objects.new(name, data)
    obj.location = B(world)
    obj['runtime_world'] = list(world)
    COL['FK_LIGHT_REFERENCE'].objects.link(obj)
world = bpy.data.worlds.new('fk_preview_ambient')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.86, 0.85, 0.80, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.22
scene.world = world
scene['fk_variant'], scene['fk_tag'], scene['fk_profile'] = VARIANT, TAG, 'studio-full-kit-v1'

bpy.context.view_layer.update()

# ------------------------------------------------------------------ framing arithmetic from the real cameras (exact projection, includes pitch)
framing = {}
for cam in CAMS:
    rx, ry = cam['res_x'], cam['res_y']
    scene.render.resolution_x, scene.render.resolution_y = rx, ry
    bpy.context.view_layer.update()
    entry = {'yaw': cam['yaw_deg'], 'pitch': cam['pitch_deg'], 'fov': cam['fov_deg'], 'size': [rx, ry]}
    for pid in ('dissertation', 'copilot', 'typeforge'):
        xs = [world_to_camera_view(scene, cam, p) for p in MONITOR_OUTER[pid]]
        if min(p.z for p in xs) <= 0:
            entry[pid] = 'behind camera'
            continue
        px = [p.x * rx for p in xs]
        entry[pid] = {'outerLeftPx': round(min(px), 1), 'outerRightPx': round(max(px), 1),
                      'marginLeftPx': round(min(px), 1), 'marginRightPx': round(rx - max(px), 1), 'outerWidthPx': round(max(px) - min(px), 1)}
    framing[cam.name] = entry

# ------------------------------------------------------------------ save editable sources first, then export
if 'library' in FLAGS:
    lib_path = fresh(os.path.join(HERE, f'fk-00-library-{TAG}.blend'))
    keep = set(MAT.values()) | {IMG_PALETTE, IMG_ORM} | {c.data for c in CAMS} | set(MESHES.values())
    for mat in MAT.values():
        mat.use_fake_user = True
    bpy.data.libraries.write(lib_path, set(MAT.values()) | {IMG_PALETTE, IMG_ORM}, fake_user=True)
    print('FK library saved', lib_path)

blend_path = os.path.join(HERE, f'fk-10-arch-blockout-{VARIANT}-{TAG}.blend')
if 'blend' in FLAGS:
    bpy.ops.wm.save_as_mainfile(filepath=fresh(blend_path), check_existing=False, copy=True)
    print('FK saved', blend_path)

if 'glb' in FLAGS:
    glb_path = fresh(os.path.join(EXPORTS, f'studio-full-kit-m1-{VARIANT}-{TAG}.glb'))
    exported = {ROOT} | {o for o in bpy.data.objects if o.parent == ROOT}
    for obj in bpy.data.objects:
        obj.select_set(obj in exported)
    props = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
    wanted = dict(filepath=glb_path, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
                  export_cameras=False, export_lights=False, export_extras=True, export_animations=False,
                  export_draco_mesh_compression_enable=False, export_image_format='AUTO', export_tangents=False,
                  export_vertex_color='NONE', export_skins=False, export_morph=False)
    bpy.ops.export_scene.gltf(**{k: v for k, v in wanted.items() if k == 'filepath' or k in props})
    print('FK exported', glb_path, 'skipped options', sorted(k for k in wanted if k != 'filepath' and k not in props))

    # ---------------- manifest, read back from the exported bytes (not from the Blender scene)
    raw = open(glb_path, 'rb').read()
    jlen = struct.unpack_from('<I', raw, 12)[0]
    gltf = json.loads(raw[20:20 + jlen])
    bin_start = 20 + jlen + 8
    COMP = {5120: ('b', 1), 5121: ('B', 1), 5122: ('h', 2), 5123: ('H', 2), 5125: ('I', 4), 5126: ('f', 4)}
    NUM = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}

    def read(index):
        acc = gltf['accessors'][index]
        view = gltf['bufferViews'][acc['bufferView']]
        fmt, size = COMP[acc['componentType']]
        n = NUM[acc['type']]
        stride = view.get('byteStride', size * n)
        base = bin_start + view.get('byteOffset', 0) + acc.get('byteOffset', 0)
        return [struct.unpack_from('<' + fmt * n, raw, base + i * stride) for i in range(acc['count'])]

    def node_matrix(node):
        if 'matrix' in node:
            return Matrix([node['matrix'][i::4] for i in range(4)])
        t = Matrix.Translation(node.get('translation', (0, 0, 0)))
        q = node.get('rotation', (0, 0, 0, 1))
        from mathutils import Quaternion
        r = Quaternion((q[3], q[0], q[1], q[2])).to_matrix().to_4x4()
        s = Matrix.Diagonal((*node.get('scale', (1, 1, 1)), 1))
        return t @ r @ s

    parents = {}
    for index, node in enumerate(gltf['nodes']):
        for child in node.get('children', []):
            parents[child] = index

    def world_matrix(index):
        m = node_matrix(gltf['nodes'][index])
        while index in parents:
            index = parents[index]
            m = node_matrix(gltf['nodes'][index]) @ m
        return m

    def runtime(p):
        return [round(2 * p[0], 6), round(2 * p[1] + 0.11, 6), round(2 * p[2], 6)]

    nodes_out, lo, hi, placed, corners = [], [1e9] * 3, [-1e9] * 3, 0, {}
    mesh_use = {}
    for index, node in enumerate(gltf['nodes']):
        entry = {'name': node['name'], 'parent': gltf['nodes'][parents[index]]['name'] if index in parents else None}
        if 'mesh' in node:
            mesh = gltf['meshes'][node['mesh']]
            assert len(mesh['primitives']) == 1, node['name']
            prim_ = mesh['primitives'][0]
            acc = gltf['accessors'][prim_['attributes']['POSITION']]
            tris = (gltf['accessors'][prim_['indices']]['count'] if 'indices' in prim_ else acc['count']) // 3
            wm = world_matrix(index)
            pts = [wm @ Vector((x, y, z)) for x in (acc['min'][0], acc['max'][0]) for y in (acc['min'][1], acc['max'][1]) for z in (acc['min'][2], acc['max'][2])]
            nlo = [round(min(p[i] for p in pts), 6) for i in range(3)]
            nhi = [round(max(p[i] for p in pts), 6) for i in range(3)]
            lo = [min(a, b) for a, b in zip(lo, nlo)]; hi = [max(a, b) for a, b in zip(hi, nhi)]
            placed += tris
            mesh_use.setdefault(node['mesh'], []).append(node['name'])
            extras = node.get('extras', {})
            entry.update(assetId=extras.get('assetId'), role=extras.get('role'), meshIndex=node['mesh'], materialIndex=prim_['material'],
                         material=gltf['materials'][prim_['material']]['name'], attributes=sorted(prim_['attributes']),
                         flags={k: extras.get(k) for k in ('occluder', 'transparent', 'nocast', 'receiveShadow')},
                         proxy='__proxy' in node['name'], triangles=tris, boundsGltfMetres=[nlo, nhi],
                         transform={k: node[k] for k in ('translation', 'rotation', 'scale', 'matrix') if k in node})
            if extras.get('role') in ('target', 'border', 'decorative-screen', 'runtime-dusk'):
                positions = [wm @ Vector(p) for p in read(prim_['attributes']['POSITION'])]
                uvs = read(prim_['attributes']['TEXCOORD_0'])
                normal = (wm.to_3x3() @ Vector(read(prim_['attributes']['NORMAL'])[0])).normalized()
                corners[node['name']] = {'vertexCount': len(positions), 'triangles': tris,
                                         'cornersGltfMetres': [[round(c, 6) for c in p] for p in positions],
                                         'cornersRuntimeWorld': [runtime(p) for p in positions],
                                         'uv': [[round(c, 4) for c in uv] for uv in uvs],
                                         'frontNormalGltf': [round(c, 6) for c in normal]}
        nodes_out.append(entry)

    inventory = json.load(open(INVENTORY, encoding='utf-8'))
    inventory_ids = {a['id'] for a in inventory['assets']}
    used_ids = {n['assetId'] for n in nodes_out if n.get('assetId')}
    images = []
    for i, image in enumerate(gltf.get('images', [])):
        view = gltf['bufferViews'][image['bufferView']]
        data = raw[bin_start + view.get('byteOffset', 0): bin_start + view.get('byteOffset', 0) + view['byteLength']]
        w, h = struct.unpack_from('>II', data, 16) if data[:4] == b'\x89PNG' else (None, None)
        images.append({'index': i, 'name': image.get('name'), 'mimeType': image.get('mimeType'), 'bytes': view['byteLength'], 'px': [w, h], 'sha256': hashlib.sha256(data).hexdigest()})
    mats = []
    for i, mat in enumerate(gltf['materials']):
        pbr = mat.get('pbrMetallicRoughness', {})
        slots = {k: gltf['textures'][v['index']]['source'] for k, v in [('baseColor', pbr.get('baseColorTexture')), ('metallicRoughness', pbr.get('metallicRoughnessTexture')),
                                                                      ('emissive', mat.get('emissiveTexture')), ('normal', mat.get('normalTexture'))] if v}
        mats.append({'index': i, 'name': mat['name'], 'alphaMode': mat.get('alphaMode', 'OPAQUE'), 'textureSlotsToImageIndex': slots, 'extensions': sorted(mat.get('extensions', {}))})
    manifest = {
        'profileId': 'studio-full-kit-v1', 'variant': VARIANT, 'stage': 'M1', 'tag': TAG,
        'statement': 'Blockout. Architecture plus pilot door and lamp are modelled; every node whose name contains __proxy is a grey stand-in, not a finished asset.',
        'glb': os.path.relpath(glb_path, KIT).replace('\\', '/'), 'glbBytes': len(raw), 'glbSha256': hashlib.sha256(raw).hexdigest(),
        'artInventorySha256': sha(INVENTORY), 'sourceScript': 'source/build_fullkit.py', 'sourceScriptSha256': sha(os.path.abspath(__file__)),
        'sourceBlend': os.path.relpath(blend_path, KIT).replace('\\', '/'), 'sourceBlendSha256': sha(blend_path) if os.path.exists(blend_path) else None,
        'blender': bpy.app.version_string, 'generator': gltf['asset'].get('generator'),
        'extensionsUsed': gltf.get('extensionsUsed', []), 'sceneCount': len(gltf['scenes']),
        'boundsGltfMetres': [[round(v, 6) for v in lo], [round(v, 6) for v in hi]],
        'counts': {'nodes': len(gltf['nodes']), 'meshLeaves': sum(1 for n in nodes_out if 'meshIndex' in n), 'uniqueMeshes': len(gltf['meshes']),
                   'sharedMeshes': sum(1 for v in mesh_use.values() if len(v) > 1), 'placedTriangles': placed,
                   'shadowCastingTriangles': sum(n['triangles'] for n in nodes_out if 'meshIndex' in n and n['flags']['nocast'] is False),
                   'proxyLeaves': sum(1 for n in nodes_out if n.get('proxy')), 'materials': len(gltf['materials']), 'images': len(images),
                   'inventoryAssetsRepresented': len(used_ids), 'inventoryAssetsTotal': len(inventory_ids)},
        'assetIdsNotInInventory': sorted(used_ids - inventory_ids),
        'inventoryAssetsNotYetRepresented': sorted(inventory_ids - used_ids),
        'bindingVariant': {'borderSeparationMetres': round((FACE_Z - BORDER_Z) / 2, 6), 'borderOverhangPerSideMetres': round(BORDER_GROW / 4, 6),
                           'centralMonitorGroupZWorld': -0.39 if P else -0.27, 'bezelPerSideWorld': BEZEL},
        'cameraCandidates_notProduction': framing,
        'materials': mats, 'textures': images, 'targetWorldCorners': corners, 'nodes': nodes_out,
    }
    # From v02 the candidate manifest comes from technical/export-manifest.mjs; this is the author's own readback.
    manifest_path = fresh(os.path.join(MANIFESTS, f'studio-full-kit-m1-{VARIANT}-{TAG}.author-readback.json'))
    json.dump(manifest, open(manifest_path, 'w', encoding='utf-8'), indent=1)
    print('FK manifest', manifest_path)
    print('FK counts', json.dumps(manifest['counts']))
    print('FK not-in-inventory', manifest['assetIdsNotInInventory'], 'extensions', manifest['extensionsUsed'])
    print('FK materials', [(m['name'], m['alphaMode']) for m in mats])
    bad = [n['name'] for n in nodes_out if 'meshIndex' in n and (None in n['flags'].values() or not {'POSITION', 'NORMAL', 'TEXCOORD_0'} <= set(n['attributes']) or set(n['attributes']) - {'POSITION', 'NORMAL', 'TEXCOORD_0'})]
    print('FK leaves with missing metadata or wrong attributes', bad)
print('FK framing', json.dumps({k: v.get('dissertation') for k, v in framing.items() if k.startswith('home-3')}))
print('FK done', VARIANT, TAG)
