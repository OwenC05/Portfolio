"""Emission-only derivative of the frozen, editable v02; no mesh regeneration."""
import bpy,hashlib,json
from pathlib import Path
B=Path(__file__).resolve().parent; V=B.parent/'build-v02'
assert B.name=='build-v03' and bpy.app.background
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(V/'selected-a.blend')=='80704c8f2989683dffa59f9616b1ef146eab944f7d05ae0e0bf55e1964bc508e'
strength=json.loads((B/'viewer/comparison.json').read_text())['selectedStrength'];assert strength==1.0
bpy.ops.wm.open_mainfile(filepath=str(V/'selected-a.blend'),use_scripts=False)
eye=bpy.data.materials['MAT_APA_eye_emit'].node_tree.nodes['Principled BSDF']
before=float(eye.inputs['Emission Strength'].default_value);assert before==4
eye.inputs['Emission Strength'].default_value=strength
# The single authored change above; retain all object, mesh, pose and other material data.
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=bpy.data.objects['APA_root']
bpy.ops.export_scene.gltf(filepath=str(B/'selected-a.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_skins=False,export_morph=False,export_cameras=False,export_lights=False,export_extras=True,export_normals=True,export_texcoords=False)
bpy.ops.wm.save_as_mainfile(filepath=str(B/'selected-a.blend'))
profile=json.loads((V/'profile.json').read_text());profile['profileId']='selected-a-v01-candidate-001-build-v03';profile['revision']=3
profile['status']='eye-emission-only-candidate-awaiting-Claude-recheck';profile['productionReady']=False
profile['materials']['finalPbrValues']['eyeGlow']['emissionStrength']=strength
(B/'profile.json').write_text(json.dumps(profile,indent=2))
assert (B/'poses.json').read_bytes()==(V/'poses.json').read_bytes()
(B/'build-receipt.json').write_text(json.dumps({'sourceBlendPath':'../build-v02/selected-a.blend','sourceBlendSha256':sha(V/'selected-a.blend'),'sourceGlbSha256':sha(V/'selected-a.glb'),'exportSha256':sha(B/'selected-a.glb'),'blendSha256':sha(B/'selected-a.blend'),'changedMaterial':'MAT_APA_eye_emit','changedInput':'Emission Strength','before':before,'after':strength,'blenderVersion':bpy.app.version_string,'blenderBuildHash':bpy.app.build_hash.decode()},indent=2))
print('EMISSION_ONLY_EXPORT',sha(B/'selected-a.glb'))
