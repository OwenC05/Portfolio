"""M4 v01 G4 (G2-G5 family) Blender evidence: isolated grey turnarounds and a grey contact still from the FROZEN v01 blend.

Root-authorized bounded evidence (msg_18416833135e / msg_d3da2a888957). One mode = one camera = one hidden process:

  blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
      source/fk-40-music-proposal-v01.blend --python source/render_m4_v01_evidence.py -- <mode> <out.png>

  modes: turn-controller | turn-drums | contact

It never saves a .blend, never exports, and refuses to overwrite <out.png>. Every change (hiding, linked copies, the
imported M1 baseline proxies, rules, labels, camera, Workbench settings) lives only in this process's memory.

Units: Blender metres = glTF metres (+Z up here, +Y up in glTF); runtime world units are x2 with +0.11 Y offset. Workbench
grey with studio light, cavity and outline: a shape/scale/contact check only, not material, light or runtime appearance.
Prototype counterpart: the same-asset proxies of exports/studio-full-kit-m1-baseline-v02.glb (prototype sizes),
imported read-only, shown at the same orthographic scale.
"""
import bpy, sys, os, math, hashlib, json
from mathutils import Matrix, Vector

FK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLEND_SHA = '0ae40460b9a2cb578fc35a96497a9016e5f116a1efe98cac4809568fd68c4665'
BASELINE = os.path.join(FK, 'exports', 'studio-full-kit-m1-baseline-v02.glb')
BASELINE_SHA = None                                   # recorded, not pinned: the file is a frozen M1 output

mode, out = sys.argv[sys.argv.index('--') + 1:][:2]
out = os.path.abspath(out)
if os.path.exists(out):
    raise RuntimeError('Refusing to overwrite ' + out)


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


assert sha(bpy.data.filepath) == BLEND_SHA, 'not the frozen v01 blend'
scene = bpy.context.scene

CONTROLLER = ['ctl_body__shell', 'ctl_body__indicators', 'ctl_keys__keys', 'ctl_stand__frame', 'ctl_sustain_pedal__pedal',
              'stool_keys__stool']
DRUMS = ['drum_rack__rack', 'drum_pads__shells', 'drum_pads__heads', 'drum_cymbals__cymbals', 'drum_kick__tower',
         'drum_hihat_pedal__pedal', 'drum_module__body', 'drum_module__display', 'drum_sticks__pair', 'drum_throne__throne']
ALL_M4 = CONTROLLER + DRUMS + ['rug__rug', 'music_cables__runs']
for n in ALL_M4:
    assert n in bpy.data.objects and bpy.data.objects[n].type == 'MESH', n
PROTO = {'turn-controller': ('ctl_body', 'ctl_keys', 'ctl_stand', 'ctl_sustain_pedal', 'stool_keys'),
         'turn-drums': ('drum_rack', 'drum_pads', 'drum_cymbals', 'drum_kick', 'drum_hihat_pedal', 'drum_module', 'drum_sticks',
                        'drum_throne')}
CTL_YAW = -0.6                                        # helper CTL['yaw'] (rad); turnaround 0 deg = controller front to -Y

for o in scene.objects:
    o.hide_render = True
EVID = bpy.data.collections.new('M4_EVIDENCE_MEMORY_ONLY')
scene.collection.children.link(EVID)


def world_bbox(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return lo, hi


def place(objs, base_rot, angle_deg, at):
    """Linked copies rotated about the group's floor centre, then moved so that centre sits at `at` (x, y, z)."""
    lo, hi = world_bbox(objs)
    c = Matrix.Translation(Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, 0.0)))
    M = Matrix.Translation(Vector((at[0], at[1], at[2]))) @ Matrix.Rotation(base_rot + math.radians(angle_deg), 4, 'Z') @ c.inverted()
    copies = []
    for o in objs:
        k = o.copy()                                  # shares mesh data; nothing written back
        k.parent = None
        k.matrix_world = M @ o.matrix_world
        k.hide_render = False
        EVID.objects.link(k)
        copies.append(k)
    return copies


def label(text, at, size=0.07):
    cu = bpy.data.curves.new('lbl', 'FONT')
    cu.body, cu.size, cu.align_x = text, size, 'CENTER'
    ob = bpy.data.objects.new('lbl', cu)
    ob.location = at
    ob.rotation_euler = (math.radians(90), 0, 0)      # upright, facing -Y
    EVID.objects.link(ob)
    return ob


def rule(at, length=1.0):
    """1 m rule along X at floor level in front of a cell, decimetre ticks."""
    me = bpy.data.meshes.new('rule')
    import bmesh
    bm = bmesh.new()

    def box(x0, x1, z0, z1):
        bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation(((x0 + x1) / 2, 0, (z0 + z1) / 2)) @
                              Matrix.Diagonal((x1 - x0, 0.012, z1 - z0, 1)))
    box(0, length, 0, 0.012)
    for i in range(11):
        box(i * 0.1 - 0.003, i * 0.1 + 0.003, 0.012, 0.012 + (0.05 if i in (0, 5, 10) else 0.025))
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new('rule_1m', me)
    ob.location = (at[0] - length / 2, at[1], at[2])
    EVID.objects.link(ob)
    label('1 m', (at[0], at[1], at[2] - 0.10), 0.06)
    return ob


def import_prototypes(prefixes):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=BASELINE)
    new = [o for o in bpy.data.objects if o not in before]
    keep = [o for o in new if o.type == 'MESH' and '__proxy' in o.name and o.name.split('__')[0] in prefixes]
    for o in new:
        if o not in keep:
            bpy.data.objects.remove(o, do_unlink=True)
    for o in keep:
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
        for c in list(o.users_collection):
            c.objects.unlink(o)
        EVID.objects.link(o)
        o.hide_render = True
    return keep


def workbench(shadows=False):
    scene.render.engine = 'BLENDER_WORKBENCH'
    sh = scene.display.shading
    sh.light, sh.color_type, sh.single_color = 'STUDIO', 'SINGLE', (0.62, 0.62, 0.60)
    sh.show_cavity, sh.cavity_type = True, 'BOTH'
    sh.show_object_outline, sh.object_outline_color = True, (0.08, 0.08, 0.08)
    sh.show_shadows = shadows
    sh.background_type = 'VIEWPORT'
    sh.background_color = (0.93, 0.93, 0.91)
    scene.display.render_aa = '16'
    scene.view_settings.view_transform = 'Standard'
    scene.render.film_transparent = False


def ortho_camera(lo, hi, pitch_deg, rx, ry, margin=1.06):
    cam = bpy.data.objects.new('m4_evidence_cam', bpy.data.cameras.new('m4_evidence_cam'))
    EVID.objects.link(cam)
    cam.data.type = 'ORTHO'
    centre = (lo + hi) / 2
    p = math.radians(pitch_deg)
    cam.rotation_euler = (math.radians(90) - p, 0, 0)                          # look toward +Y, tilted down by p
    fwd = Vector((0, math.cos(p), -math.sin(p)))
    cam.location = centre - fwd * 20.0
    w, d, h = hi.x - lo.x, hi.y - lo.y, hi.z - lo.z
    vis_h = h * math.cos(p) + d * math.sin(p)
    cam.data.ortho_scale = max(w, vis_h * rx / ry) * margin
    cam.data.clip_end = 60.0
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = rx, ry, 100
    return cam


record = dict(mode=mode, out=os.path.relpath(out, FK).replace('\\', '/'), blendSha256=BLEND_SHA,
              blender=bpy.app.version_string, engine='BLENDER_WORKBENCH')
if mode in ('turn-controller', 'turn-drums'):
    names = CONTROLLER if mode == 'turn-controller' else DRUMS
    objs = [bpy.data.objects[n] for n in names]
    base = -CTL_YAW if mode == 'turn-controller' else 0.0
    lo, hi = world_bbox(objs)
    span = max(hi.x - lo.x, hi.y - lo.y) * 1.08 + 0.25                       # column pitch (any rotation fits)
    rowh = (hi.z - lo.z) + 0.45                                              # row pitch: rows are stacked in Z, no floor
    front = -span / 2                                                        # labels and rules in front of each cell
    pos = [(c * span, 0.0, r * rowh) for r, c in ((1, 0), (1, 1), (1, 2), (0, 0), (0, 1), (0, 2))]
    for (x, y, z), ang in zip(pos[:4], (0, 90, 180, 270)):
        place(objs, base, ang, (x, y, z))
        label('%d deg' % ang, (x, front, z - 0.20))
        rule((x, front, z - 0.03))
    protos = import_prototypes(PROTO[mode])
    for o in protos:
        o.hide_render = False
    plo, phi = world_bbox(protos)
    shift = Vector((pos[4][0] - (plo.x + phi.x) / 2, pos[4][1] - (plo.y + phi.y) / 2, pos[4][2] - plo.z))
    for o in protos:
        o.matrix_world = Matrix.Translation(shift) @ o.matrix_world
    label('M1 baseline v02 proxies (prototype size)', (pos[4][0], front, pos[4][2] - 0.20), 0.05)
    rule((pos[4][0], front, pos[4][2] - 0.03))
    label('M4 v01 frozen blend 0ae40460', (pos[5][0], front, pos[5][2] + 0.45), 0.06)
    label('grey Workbench, orthographic, one scale', (pos[5][0], front, pos[5][2] + 0.33), 0.05)
    rule((pos[5][0], front, pos[5][2] + 0.15))
    vis = [o for o in EVID.objects if o.type in ('MESH', 'FONT')]
    lo, hi = world_bbox(vis)
    workbench(False)
    ortho_camera(lo, hi, 18.0, 1440, 900)
    record.update(families=names, turnaroundDeg=[0, 90, 180, 270], controllerBaseRotRad=base, cellSpanM=round(span, 4), rowPitchM=round(rowh, 4),
                  prototypes=sorted(o.name for o in protos), cameraPitchDeg=18.0, orthoScaleM=round(scene.camera.data.ortho_scale, 4))
elif mode == 'contact':
    names = ALL_M4 + ['arch_floor__boards']
    assert 'arch_floor__boards' in bpy.data.objects
    for n in names:
        bpy.data.objects[n].hide_render = False
    workbench(True)
    scene.display.light_direction = (0.35, -0.45, 0.82)
    scene.display.shadow_shift, scene.display.shadow_focus = 0.02, 0.9
    cam = bpy.data.objects.new('m4_contact_cam', bpy.data.cameras.new('m4_contact_cam'))
    EVID.objects.link(cam)
    cam.data.lens_unit, cam.data.angle = 'FOV', math.radians(55)
    cam.data.sensor_fit = 'HORIZONTAL'
    cam.location = Vector((2.95, -2.05, 0.42))
    look = Vector((1.25, -0.05, 0.10))
    cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler()
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = 1440, 900, 100
    record.update(objects=names, cameraLocation=list(cam.location), lookAt=list(look), fovDeg=55, isolated=True,
                  note='Grey isolated low camera: feet, pedals, stand, stool, throne and rack feet on the rug; not a runtime pose')
else:
    raise ValueError(mode)

scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
assert os.path.exists(out)
record['pngSha256'] = sha(out)
record['baselineGlbSha256'] = sha(BASELINE) if mode != 'contact' else None
print('FK_M4_EVIDENCE ' + json.dumps(record))
