"""Studio v2 full kit, stage M2, material repair v03 (non-expanding).

Run (one hidden process, never interactive):
  blender --background --factory-startup --disable-autoexec --python-exit-code 1 \
      --python build_fullkit_m2_material_v03.py -- [blend] [glb]

What it does
  1. Runs the unchanged M2 builder (build_fullkit_m2.py, sha256 pinned below) in its dry mode, which itself runs the
     unchanged M1 builder. Nothing is written by either; the result is the same in-memory editable M2 state that
     produced v02, including the author measurements dictionary.
  2. Changes one library material response, lib_glow, and nothing else:
       v02: base colour #ffdb9e, roughness 0.6, metallic 0, emission #ffc27a x 1.1 (dielectric, lit by every light)
       v03: base colour black, roughness 1.0, metallic 1, emission #ffd29a x 1.2 (emissive-only)
     A black metal base has no diffuse term and a zero specular F0, so the pendant practical that sits 0.125 world
     units under the lens, the hemisphere and the key light add (almost) nothing to it. The lens shows its own
     emission, which tone-maps under the runtime's ACES / exposure 1.2 to about sRGB (237, 225, 201): warm white,
     below the 250 clip line on every channel, brighter than the ~225 ends the critique asked to keep luminous.
     The hue is matched to the pendant practical (#ffd2a0) instead of the amber of v02.
     Shared consumers (disclosed in m2-material-repair-report.md): fix_pendant__lens, fix_floor_lamp__bulb,
     pc_tower__glow and the five M5 fix_wall_triangles proxies. No leaf, mesh, UV, vertex, index, image, texture,
     sidedness, alpha mode, render order, shadow flag, light or material count changes. The only other JSON change is
     the scene's provenance extras (fk_tag 'm2base-v03', fk_m2_tag 'v03-material').
  3. Saves the editable state as fk-20-workstation-material-v03.blend, then bakes and exports with the same export
     code path as v02 (copied from build_fullkit_m2.py so v02 deliverable names are never touched).
  4. Writes manifests/m2-material-v03-author-measurements.json with the M2 measurements, the before/after material
     values and an export readback that compares every v03 bufferView/accessor with v02 byte for byte.
"""
import bpy, sys, os, json, runpy, hashlib, struct, math

ARGS = sys.argv[sys.argv.index('--') + 1:]
FLAGS = set(ARGS)
HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.dirname(HERE)
EXPORTS, MANIFESTS = os.path.join(KIT, 'exports'), os.path.join(KIT, 'manifests')
M2_SCRIPT = os.path.join(HERE, 'build_fullkit_m2.py')
M2_SHA = '63b10ad1d4099933b56066a381ec5fb57eb3b5ef9335ecbad8bc4e33a6da1743'
V02_GLB = os.path.join(EXPORTS, 'studio-full-kit-m2-proposal-v02.glb')
V02_GLB_SHA = '2089a4f0b955c2730d167a8ee4258f7939b29f51057d9944678b44b4f2555411'
BLEND_OUT = os.path.join(HERE, 'fk-20-workstation-material-v03.blend')
GLB_OUT = os.path.join(EXPORTS, 'studio-full-kit-m2-proposal-v03.glb')
MEAS_OUT = os.path.join(MANIFESTS, 'm2-material-v03-author-measurements.json')
PROBE = os.environ.get('FK_V03_PROBE_GLB')  # optional scratch export path outside the repo; nothing in the kit is written
if PROBE:
    FLAGS = {'glb'}
    GLB_OUT = PROBE
    if os.path.exists(PROBE):
        os.remove(PROBE)


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def fresh(path):
    if os.path.exists(path):
        raise RuntimeError('Refusing to overwrite existing deliverable: ' + path)
    return path


assert sha(M2_SCRIPT) == M2_SHA, 'M2 base script differs from the recorded v02 version'
assert sha(V02_GLB) == V02_GLB_SHA, 'v02 GLB differs from the recorded candidate'
if 'blend' in FLAGS:
    fresh(BLEND_OUT)
if 'glb' in FLAGS and not PROBE:
    fresh(GLB_OUT)
if FLAGS & {'blend', 'glb'} and not PROBE:
    fresh(MEAS_OUT)

# ------------------------------------------------------------------ 1. unchanged M2 build, dry (writes nothing)
_argv = sys.argv
sys.argv = [_argv[0], '--', 'v03dry']
G = runpy.run_path(M2_SCRIPT, run_name='fk_m2_base')
sys.argv = _argv
MAT, SW, ROOT, OBJ, CABLES, grommet, leaf, meas = (G[k] for k in ('MAT', 'SW', 'ROOT', 'OBJ', 'CABLES', 'grommet', 'leaf', 'meas'))
srgb = G['G']['srgb']
G['scene']['fk_tag'], G['scene']['fk_m2_tag'] = 'm2base-v03', 'v03-material'

# ------------------------------------------------------------------ 2. lib_glow response: emissive-only
glow = MAT['lib_glow']
shader = next(n for n in glow.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def snapshot():
    i = shader.inputs
    return {'baseColorLinear': [round(v, 6) for v in i['Base Color'].default_value[:3]], 'roughness': round(i['Roughness'].default_value, 6),
            'metallic': round(i['Metallic'].default_value, 6), 'emissionLinear': [round(v, 6) for v in i['Emission Color'].default_value[:3]],
            'emissionStrength': round(i['Emission Strength'].default_value, 6),
            'linkedInputs': sorted(s.name for s in i if s.is_linked)}


before = snapshot()
assert before['linkedInputs'] == [] and abs(before['emissionStrength'] - 1.1) < 1e-6 and before['metallic'] == 0, before
shader.inputs['Base Color'].default_value = (0.0, 0.0, 0.0, 1.0)
shader.inputs['Roughness'].default_value = 1.0
shader.inputs['Metallic'].default_value = 1.0
shader.inputs['Emission Color'].default_value = (*srgb(0xffd29a), 1.0)
shader.inputs['Emission Strength'].default_value = 1.2
after = snapshot()
consumers = sorted(o.name for o in bpy.data.objects if o.type == 'MESH' and any(s.material == glow for s in o.material_slots))
print('FK v03 lib_glow consumers', consumers)
meas['materialRepairV03'] = {
    'statement': 'Only lib_glow response values changed. Geometry, UVs, images, leaves, flags, lights and material count unchanged.',
    'material': 'lib_glow', 'before': before, 'after': after, 'sharedConsumers': consumers,
    'runtimeExpectation': 'emissive-only; three r187 ACES filmic, exposure 1.2, sRGB output: about (237, 225, 201) wherever the lens is unoccluded',
}

# ------------------------------------------------------------------ 3. save editable, then bake and export (same path as v02)
if 'blend' in FLAGS:
    bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT, check_existing=False, copy=True)
    meas['sourceBlend'] = os.path.relpath(BLEND_OUT, KIT).replace('\\', '/')
    meas['sourceBlendSha256'] = sha(BLEND_OUT)
    print('FK saved', BLEND_OUT)
meas['sourceScript'] = 'source/build_fullkit_m2_material_v03.py'
meas['sourceScriptSha256'] = sha(os.path.abspath(__file__))
meas['baseScript'] = 'source/build_fullkit_m2.py'
meas['baseScriptSha256'] = M2_SHA


def chunks(raw):
    jlen = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20 + jlen])
    blen = struct.unpack_from('<I', raw, 20 + jlen)[0]
    return doc, raw[28 + jlen:28 + jlen + blen]


if 'glb' in FLAGS:
    dg = bpy.context.evaluated_depsgraph_get()

    def bake(obj, shared=None):
        me = shared or bpy.data.meshes.new_from_object(obj.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
        old = obj.data
        obj.data = me
        obj.modifiers.clear()
        return me, old

    side_mesh, side_old = bake(OBJ['mon_side__copilot'])
    side_mesh.name = 'mon_side_mesh'
    bake(OBJ['mon_side__typeforge'], side_mesh)
    for name in ('desk_top__top', 'desk_frame__steel', 'desk_mat__felt', 'mon_central__body', 'mon_top__body', 'pc_tower__case',
                 'sub_woofer__cabinet', 'sub_woofer__grille', 'fix_pendant__body'):
        bake(OBJ[name])

    def join(name, asset, parts):
        verts, polys, uvs = [], [], []
        for obj, swatch in parts:
            me = bpy.data.meshes.new_from_object(obj.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
            base = len(verts)
            verts += [obj.matrix_world @ v.co for v in me.vertices]
            layer = me.uv_layers.active
            for p in me.polygons:
                polys.append([base + me.loops[i].vertex_index for i in p.loop_indices])
                uvs += [SW[swatch] if swatch else tuple(layer.data[i].uv) for i in p.loop_indices]
            bpy.data.meshes.remove(me)
        out = bpy.data.meshes.new(name + '_mesh')
        out.from_pydata([tuple(v) for v in verts], [], polys)
        layer = out.uv_layers.new(name='UVMap')
        for loop, uv in zip(layer.data, uvs):
            loop.uv = uv
        for p in out.polygons:
            p.use_smooth = True
        out.set_sharp_from_angle(angle=math.radians(40))
        out.materials.append(MAT['lib_palette'])
        for obj, _ in parts:
            bpy.data.objects.remove(obj, do_unlink=True)
        return leaf(name, out, 'FK_WORKSTATION', asset, casts=False)

    mon_parts = [(o, 'black') for o in CABLES if o.get('assetId') == 'mon_cables'] + [(grommet, None)]
    power_parts = [(o, 'black') for o in CABLES if o.get('assetId') == 'under_desk_power'] + [(OBJ['under_desk_power__strip'], None)]
    join('mon_cables__runs', 'mon_cables', mon_parts)
    join('under_desk_power__strip_loom', 'under_desk_power', power_parts)
    for obj in bpy.data.objects:
        if obj.parent == ROOT:
            assert obj.type == 'MESH', obj.name
    exported = {ROOT} | {o for o in bpy.data.objects if o.parent == ROOT}
    for obj in bpy.data.objects:
        obj.select_set(obj in exported)
    props = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
    wanted = dict(filepath=GLB_OUT, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
                  export_cameras=False, export_lights=False, export_extras=True, export_animations=False,
                  export_draco_mesh_compression_enable=False, export_image_format='AUTO', export_tangents=False,
                  export_vertex_color='NONE', export_skins=False, export_morph=False)
    bpy.ops.export_scene.gltf(**{k: v for k, v in wanted.items() if k == 'filepath' or k in props})

    # ---------------------------------------------------------------- 4. readback and paired comparison with v02
    raw3, raw2 = open(GLB_OUT, 'rb').read(), open(V02_GLB, 'rb').read()
    d3, bin3 = chunks(raw3)
    d2, bin2 = chunks(raw2)
    same = {k: d3.get(k) == d2.get(k) for k in ('nodes', 'meshes', 'accessors', 'bufferViews', 'images', 'textures', 'samplers', 'extensionsUsed')}
    same['scenesExceptTagExtras'] = [dict(s, extras=None) for s in d3['scenes']] == [dict(s, extras=None) for s in d2['scenes']]
    mat_diff = [m3['name'] for m3, m2 in zip(d3['materials'], d2['materials']) if m3 != m2]
    # Word-level BIN comparison: every differing 4-byte word, mapped to its accessor and attribute.
    attr_of = {}
    for m in d2['meshes']:
        for p in m['primitives']:
            for key, acc in list(p['attributes'].items()) + [('indices', p.get('indices'))]:
                if acc is not None:
                    attr_of[acc] = (m['name'], key)
    view_acc = {}
    for i, a in enumerate(d2['accessors']):
        view_acc.setdefault(a.get('bufferView'), []).append(i)
    word_diffs = []
    for vi, view in enumerate(d2['bufferViews']):
        o, n = view.get('byteOffset', 0), view['byteLength']
        if bin3[o:o + n] == bin2[o:o + n]:
            continue
        accs = view_acc.get(vi, [])
        for j in range(0, n - n % 4, 4):
            if bin3[o + j:o + j + 4] != bin2[o + j:o + j + 4]:
                mesh, key = attr_of.get(accs[0], ('image-or-unknown', '?')) if len(accs) == 1 else ('shared-view', '?')
                v2_, v3_ = struct.unpack('<f', bin2[o + j:o + j + 4])[0], struct.unpack('<f', bin3[o + j:o + j + 4])[0]
                word_diffs.append({'bufferView': vi, 'byteOffsetInView': j, 'mesh': mesh, 'attribute': key, 'v02': v2_, 'v03': v3_, 'absDelta': abs(v3_ - v2_)})
    bin_ok = len(bin3) == len(bin2) and all(w['attribute'] == 'TEXCOORD_0' and w['absDelta'] <= 2 ** -20 for w in word_diffs)
    meas['exportReadback'] = {
        'glb': os.path.relpath(GLB_OUT, KIT).replace('\\', '/'), 'glbBytes': len(raw3), 'glbSha256': hashlib.sha256(raw3).hexdigest(),
        'pairedWith': {'glb': 'exports/studio-full-kit-m2-proposal-v02.glb', 'glbBytes': len(raw2), 'glbSha256': V02_GLB_SHA},
        'binChunkIdentical': bin3 == bin2, 'binChunkBytes': [len(bin3), len(bin2)], 'jsonSectionsIdentical': same,
        'binWordDifferences': word_diffs,
        'binDifferenceNote': 'Unchanged builder re-run; any differing words must be TEXCOORD_0 floats within 2^-20 (float32 evaluation noise), '
                             'positions, normals, indices and images byte-identical, or the export is rejected.',
        'materialCount': [len(d3['materials']), len(d2['materials'])], 'materialOrderIdentical': [m['name'] for m in d3['materials']] == [m['name'] for m in d2['materials']],
        'materialsChanged': mat_diff,
        'libGlowV03': next(m for m in d3['materials'] if m['name'] == 'lib_glow'),
        'libGlowV02': next(m for m in d2['materials'] if m['name'] == 'lib_glow'),
    }
    print('FK v03 exported', GLB_OUT, len(raw3), json.dumps({k: v for k, v in meas['exportReadback'].items() if not k.startswith('libGlow')}))
    assert bin_ok and all(same.values()) and mat_diff == ['lib_glow'], 'v03 differs from v02 beyond lib_glow'

if FLAGS & {'blend', 'glb'} and not PROBE:
    json.dump(meas, open(MEAS_OUT, 'w', encoding='utf-8'), indent=1, default=str)
    print('FK v03 measurements written', MEAS_OUT)
print('FK v03 done')
