import bpy, json, hashlib
from pathlib import Path
from mathutils import Vector

BASE = Path(__file__).resolve().parent
assert BASE.name == 'build-v01' and BASE.parent.name == 'candidate-001'
RAW = BASE.parent / 'raw/model.glb'
assert hashlib.sha256(RAW.read_bytes()).hexdigest() == '412c0c213e0c6adc6baa80fa0686b6cbd9a1d259348bb96c571ef28b2f59bec7'
assert bpy.app.background
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(RAW))
obj = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
mesh = obj.data
adj = [set() for v in mesh.vertices]
for edge in mesh.edges:
    a,b = edge.vertices
    adj[a].add(b); adj[b].add(a)
remaining = set(range(len(adj))); components = []
while remaining:
    seed = min(remaining); remaining.remove(seed); found = {seed}; todo = [seed]
    while todo:
        for n in adj[todo.pop()]:
            if n in remaining:
                remaining.remove(n); found.add(n); todo.append(n)
    components.append(found)
components.sort(key=lambda c: (-len(c), min(c)))
records = []
for i, comp in enumerate(components):
    points = [obj.matrix_world @ mesh.vertices[j].co for j in comp]
    lo = [min(p[k] for p in points) for k in range(3)]
    hi = [max(p[k] for p in points) for k in range(3)]
    faces = [p.index for p in mesh.polygons if p.vertices[0] in comp]
    records.append({'id': i, 'vertices': len(comp), 'faces': len(faces), 'min': lo, 'max': hi,
                    'centroid': [sum(p[k] for p in points)/len(points) for k in range(3)],
                    'vertexIndices': sorted(comp), 'faceIndices': faces})
(BASE / 'raw-components.json').write_text(json.dumps({'rawSha256': hashlib.sha256(RAW.read_bytes()).hexdigest(),
    'blenderVersion': bpy.app.version_string, 'matrixWorld': [list(row) for row in obj.matrix_world],
    'componentDefinition': 'vertex/edge-connected islands, not semantic articulation', 'components': records}, indent=2))
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = 560; scene.render.resolution_y = 700; scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world = bpy.data.worlds.new('EvidenceWorld')
sh = scene.display.shading
sh.light = 'STUDIO'; sh.studiolight_rotate_z = 0.4
sh.color_type = 'SINGLE'; sh.single_color = (0.65,0.65,0.65)
sh.show_shadows = True; sh.show_cavity = True; sh.cavity_type = 'BOTH'
sh.background_type = 'WORLD'; sh.background_color = (0.12,0.12,0.12)
scene.world.color = (0.12,0.12,0.12)
scene.view_settings.view_transform = 'Standard'
cam_data = bpy.data.cameras.new('EvidenceCamera'); cam = bpy.data.objects.new('EvidenceCamera', cam_data)
scene.collection.objects.link(cam); scene.camera = cam; cam_data.type = 'ORTHO'; cam_data.ortho_scale = 1.12
folder = BASE / 'raw-renders'; folder.mkdir(exist_ok=True)
for name, position in [('front',(0,-3,0)),('three-quarter',(2,-3,0.65)),('side',(3,0,0)),('back',(0,3,0))]:
    cam.location = position; cam.rotation_euler = (Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath = str(folder / (name+'.png')); bpy.ops.render.render(write_still=True)
print('RAW_COMPONENT_SUMMARY', json.dumps([{k:v for k,v in r.items() if k not in ('vertexIndices','faceIndices')} for r in records]))
