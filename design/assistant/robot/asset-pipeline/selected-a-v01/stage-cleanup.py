"""Future isolated import/staging only; not an automated character rebuild or export.

Run with the documented factory-startup background command and a raw download hash.
All outputs are confined to a fresh candidate-001/cleanup-v01 directory.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import struct
import sys

BASE = Path('C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/asset-pipeline/selected-a-v01').resolve()
if Path(__file__).resolve().parent != BASE:
    raise RuntimeError('Template is scoped to the selected A directory')
parser = argparse.ArgumentParser()
parser.add_argument('--raw-sha256', required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
if not re.fullmatch(r'[0-9a-fA-F]{64}', args.raw_sha256):
    raise RuntimeError('Supply the hash from the downloaded task receipt')
raw = (BASE / 'candidate-001/raw/model.glb').resolve()
output = (BASE / 'candidate-001/cleanup-v01').resolve()
if not raw.is_relative_to(BASE) or not output.is_relative_to(BASE) or output.exists():
    raise RuntimeError('Scoped input and a fresh cleanup directory are required')
data = raw.read_bytes()
raw_sha = hashlib.sha256(data).hexdigest()
if raw_sha != args.raw_sha256.lower():
    raise RuntimeError('Raw GLB hash does not match the task receipt')
if len(data) < 20 or struct.unpack_from('<4sII', data) != (b'glTF', 2, len(data)):
    raise RuntimeError('Malformed GLB header')
json_length, chunk_type = struct.unpack_from('<II', data, 12)
if chunk_type != 0x4E4F534A or 20 + json_length > len(data):
    raise RuntimeError('Missing or truncated GLB JSON chunk')
doc = json.loads(data[20:20 + json_length])
if doc.get('asset', {}).get('version') != '2.0' or not doc.get('meshes'):
    raise RuntimeError('Expected a GLB 2 mesh')
if any(entry.get('uri') for key in ('buffers', 'images') for entry in doc.get(key, [])):
    raise RuntimeError('External or data URI dependencies are outside this raw handoff')
if any(doc.get(key) for key in ('animations', 'skins', 'cameras', 'textures', 'images')):
    raise RuntimeError('Unexpected textured, animated, skinned, or camera-bearing raw output')
if doc.get('extensionsRequired') or doc.get('extensions', {}).get('KHR_lights_punctual'):
    raise RuntimeError('Unexpected required extension or light; inspect before import')
if any(p.get('targets') for m in doc['meshes'] for p in m.get('primitives', [])):
    raise RuntimeError('Unexpected morph targets')

import bpy
from mathutils import Vector

if not bpy.app.background:
    raise RuntimeError('Use an independent background process, never the shared UI')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(raw))
meshes = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
if not meshes:
    raise RuntimeError('Import yielded no mesh objects')
inventory, corners = [], []
for obj in meshes:
    obj.data.calc_loop_triangles()
    points = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    if any(not math.isfinite(value) for point in points for value in point):
        raise RuntimeError('Nonfinite imported bounds')
    corners.extend(points)
    inventory.append({'name': obj.name, 'parent': obj.parent.name if obj.parent else None,
                      'vertices': len(obj.data.vertices), 'triangles': len(obj.data.loop_triangles),
                      'materialSlots': len(obj.material_slots)})
report = {'rawSha256': raw_sha, 'rawBytes': len(data), 'blenderVersion': bpy.app.version_string,
          'stage': 'raw-import-only-before-manual-cleanup', 'productionReady': False,
          'inventory': inventory, 'trianglesSummedAcrossObjects': sum(x['triangles'] for x in inventory),
          'importBoundsBlender': {'min': [min(p[i] for p in corners) for i in range(3)],
                                 'max': [max(p[i] for p in corners) for i in range(3)]},
          'providerUnitsAndFrontVerified': False, 'connectedComponentsVerified': False,
          'profileBindingsValidated': False, 'finalGlbExported': False}
output.mkdir(parents=True, exist_ok=False)
bpy.ops.wm.save_as_mainfile(filepath=str(output / 'selected-a-cleanup-start.blend'))
(output / 'raw-inspection.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'output': str(output), 'rawSha256': raw_sha, 'productionReady': False}))
