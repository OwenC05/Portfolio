import bpy,json,hashlib
from pathlib import Path
B=Path(__file__).resolve().parent
assert B.name=='build-v03' and bpy.app.background
bpy.ops.wm.open_mainfile(filepath=str(B/'selected-a.blend'),use_scripts=False)
assert len(bpy.context.scene.objects)==22
assert not any(o.type in {'LIGHT','CAMERA','ARMATURE'} or o.animation_data or len(o.constraints) or len(o.modifiers) for o in bpy.context.scene.objects)
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active=bpy.data.objects['APA_root']
bpy.ops.export_scene.gltf(filepath=str(B/'editable-reexport.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_skins=False,export_morph=False,export_cameras=False,export_lights=False,export_extras=True,export_normals=True,export_texcoords=False)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
report={'sourceBlendSha256':sha(B/'selected-a.blend'),'candidateSha256':sha(B/'selected-a.glb'),'reexportSha256':sha(B/'editable-reexport.glb'),'exactBytesEqual':(B/'selected-a.glb').read_bytes()==(B/'editable-reexport.glb').read_bytes(),'objects':22,'blenderVersion':bpy.app.version_string,'blenderBuildHash':bpy.app.build_hash.decode()}
(B/'editable-validation.json').write_text(json.dumps(report,indent=2))
assert report['exactBytesEqual'],report
print('EDITABLE_PARITY',json.dumps(report))
