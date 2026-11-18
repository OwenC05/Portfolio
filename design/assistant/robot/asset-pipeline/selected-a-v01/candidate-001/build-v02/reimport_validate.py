import bpy, bmesh, json, hashlib, math
from pathlib import Path
from mathutils import Vector, Quaternion, Matrix
from mathutils.bvhtree import BVHTree
BASE=Path(__file__).resolve().parent
assert BASE.name=='build-v02' and bpy.app.background
ASSET=BASE/'selected-a.glb'; PROFILE=json.loads((BASE/'profile.json').read_text()); POSES=json.loads((BASE/'poses.json').read_text())
before=hashlib.sha256(ASSET.read_bytes()).hexdigest()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ASSET))
objects={o.name:o for o in bpy.context.scene.objects}
expected={b['name'] for b in PROFILE['bindings']}
assert set(objects)==expected,(set(objects)-expected,expected-set(objects))
tolerance=2e-6; max_error=0; records=[]; unique_materials=set()
for binding in PROFILE['bindings']:
    ob=objects[binding['name']]
    assert (ob.parent.name if ob.parent else None)==binding['parent']
    error=max(abs(a-b) for a,b in zip(ob.location,binding['neutralTranslationBlenderMetres']))
    max_error=max(max_error,error); assert error<tolerance,(ob.name,error)
    q=ob.rotation_quaternion if ob.rotation_mode=='QUATERNION' else ob.rotation_euler.to_quaternion()
    expected_q=Quaternion((binding['neutralRotationXyzw'][3],*binding['neutralRotationXyzw'][:3]))
    assert abs(q.dot(expected_q))>1-tolerance
    assert all(abs(s-1)<tolerance for s in ob.scale)
    rec={'name':ob.name,'parent':binding['parent'],'localTranslationBlenderMetres':list(ob.location),'localQuaternionWxyz':list(q),'type':ob.type}
    if ob.type=='MESH':
        ob.data.calc_loop_triangles()
        bm=bmesh.new();bm.from_mesh(ob.data)
        # GLB intentionally splits normal/UV seams; weld a temporary diagnostic copy.
        bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7)
        rec.update({'vertices':len(ob.data.vertices),'triangles':len(ob.data.loop_triangles),
                    'boundaryEdgesAfterDiagnosticWeld':sum(e.is_boundary for e in bm.edges),
                    'nonManifoldEdgesAfterDiagnosticWeld':sum(not e.is_manifold for e in bm.edges),
                    'materials':[m.name for m in ob.data.materials]})
        bm.free(); unique_materials.update(rec['materials'])
    records.append(rec)
assert len(unique_materials)==7
assert not any(o.type in {'CAMERA','LIGHT','ARMATURE'} for o in objects.values())
pts=[o.matrix_world@v.co for o in objects.values() if o.type=='MESH' for v in o.data.vertices]
box={'min':[min(p[i] for p in pts) for i in range(3)],'max':[max(p[i] for p in pts) for i in range(3)]}
source_box=json.loads((BASE/'build-summary.json').read_text())['neutralBoundsBlenderMetres']
assert all(abs(box[k][i]-source_box[k][i])<tolerance for k in ['min','max'] for i in range(3))
def set_pose(a,b,t):
    for name,ob in objects.items():
        aa=a['localBlenderTRS'][name];bb=b['localBlenderTRS'][name]
        ob.location=Vector(aa['translation']).lerp(Vector(bb['translation']),t)
        qa=Quaternion((aa['rotationXyzw'][3],*aa['rotationXyzw'][:3]));qb=Quaternion((bb['rotationXyzw'][3],*bb['rotationXyzw'][:3]))
        ob.rotation_mode='QUATERNION'; ob.rotation_quaternion=qa.slerp(qb,t)
    bpy.context.view_layer.update()
head_names=[b['name'] for b in PROFILE['bindings'] if b['name'].startswith(('APA_head','APA_face','APA_eye','APA_pupil','APA_highlight','APA_lid','APA_seam','APA_bookmark'))]
groups={'head':head_names,'body':['APA_body','APA_collar','APA_body_cap'],'mittenL':['APA_mitten_L'],'mittenR':['APA_mitten_R'],'tray':['APA_tray','APA_tray_glow']}
def group_bvh(names):
    verts=[];faces=[]
    for name in names:
        ob=objects[name]; offset=len(verts); verts.extend(ob.matrix_world@v.co for v in ob.data.vertices)
        faces.extend(tuple(offset+i for i in p.vertices) for p in ob.data.polygons)
    return BVHTree.FromPolygons(verts,faces,all_triangles=True)
collisions=[]; samples=0
for ai,a in enumerate(POSES['poses']):
    for bi,b in enumerate(POSES['poses'][ai:],ai):
        for t in ([0] if ai==bi else [.2,.4,.6,.8]):
            set_pose(a,b,t); samples+=1
            trees={k:group_bvh(v) for k,v in groups.items()}
            keys=list(trees)
            for i,key in enumerate(keys):
                for other in keys[i+1:]:
                    hits=trees[key].overlap(trees[other])
                    if hits: collisions.append({'from':a['name'],'to':b['name'],'t':t,'parts':[key,other],'trianglePairs':len(hits)})
set_pose(POSES['poses'][0],POSES['poses'][0],0)
report={'status':'PASS-reimport-structure' if not collisions else 'FAIL-cross-mass-overlap','sourceGlbSha256':before,
    'blenderVersion':bpy.app.version_string,'blenderBuildHash':bpy.app.build_hash.decode(),
    'nodeCount':len(objects),'materialCount':len(unique_materials),'maxLocalTranslationErrorMetres':max_error,
    'neutralBoundsBlenderMetres':box,'records':records,'crossMassOverlapSamples':samples,'crossMassOverlaps':collisions,
    'collisionLimit':'45 finite-path samples only; BVH triangle intersections, not a proof of arbitrary runtime motion clearance',
    'sourceBytesUnchanged':hashlib.sha256(ASSET.read_bytes()).hexdigest()==before}
(BASE/'reimport-validation.json').write_text(json.dumps(report,indent=2))
assert not collisions,collisions
# Independent front render from reimport, same studio lighting and camera as source evidence.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=640;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
world=bpy.data.worlds.new('ReimportEvidenceWorld');world.use_nodes=True;scene.world=world
world.node_tree.nodes['Background'].inputs['Color'].default_value=(.22,.24,.27,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45
for name,loc,energy,size in [('Key',(-1,-1.5,1.8),90,1.5),('Fill',(1.2,-.5,.6),45,1.2),('Rim',(.5,1,1),75,1)]:
    light=bpy.data.lights.new(name,'AREA');light.energy=energy;light.shape='DISK';light.size=size
    ob=bpy.data.objects.new(name,light);scene.collection.objects.link(ob);ob.location=loc;ob.rotation_euler=(Vector((0,0,.06))-ob.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('ReimportCamera');cam=bpy.data.objects.new('ReimportCamera',data);scene.collection.objects.link(cam);scene.camera=cam
data.type='ORTHO';data.ortho_scale=.67;cam.location=(0,-2,.04);cam.rotation_euler=(Vector((0,0,.04))-cam.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(BASE/'renders/reimport-front.png');bpy.ops.render.render(write_still=True)
baseline=BASE.parents[3]/'integration/baseline-2026-11-16/source-receipt.json'
if baseline.exists():
    receipt=json.loads(baseline.read_text()); fov=receipt['camera']['verticalFovDegrees']['mobile']
    data.type='PERSP';data.sensor_fit='VERTICAL';data.sensor_height=32;data.lens=32/(2*math.tan(math.radians(fov)/2))
    camera_contract=receipt['camera']; eye=camera_contract['eyeWorldUnits']
    cam.location=(eye[0]/2,-eye[2]/2,eye[1]/2)
    yaw=math.radians(camera_contract['homeDegrees']['mobile']['yaw']);pitch=math.radians(camera_contract['homeDegrees']['mobile']['pitch'])
    forward=Vector((math.sin(yaw)*math.cos(pitch),math.cos(yaw)*math.cos(pitch),math.sin(pitch)))
    cam.rotation_euler=forward.to_track_quat('-Z','Y').to_euler()
    data.clip_start=camera_contract['nearWorldUnits']/2;data.clip_end=camera_contract['farWorldUnits']/2
    facing=Matrix.Rotation(-yaw,3,'Z'); centre=Vector([(box['min'][i]+box['max'][i])/2 for i in range(3)])
    anchor=cam.location+forward*2-facing@centre
    objects['APA_root'].location=anchor;objects['APA_root'].rotation_quaternion=facing.to_quaternion()
    for ob in scene.objects:
        if ob.type=='LIGHT':
            ob.location=anchor+facing@ob.location
            ob.rotation_euler=(anchor+facing@Vector((0,0,.06))-ob.location).to_track_quat('-Z','Y').to_euler()
    scene.render.resolution_x=320;scene.render.resolution_y=568
    scene.render.filepath=str(BASE/'renders/isolated-mobile-fov64-at-2m.png');bpy.ops.render.render(write_still=True)
    calibration={'baselineReceiptPath':str(baseline),'baselineSha256':hashlib.sha256(baseline.read_bytes()).hexdigest(),
        'baselineObservedAt':receipt['observedAtUtc'],'baselineCamera':receipt['camera'],'baselineRoomCandidate':receipt['currentRoom']['candidateId'],
        'projection':'isolated sensitivity image at actual fixed eye, mobile home yaw/pitch and FOV; assumed asset centre two metres along home ray; studio lighting, no room',
        'viewport':[320,568],'verticalFovDegrees':fov,'assumedDistanceMetres':2,'externalRoomScaleLater':2,
        'evidenceOnlyRootAnchorBlenderMetres':list(anchor),'actualEyeBlenderMetres':list(cam.location),'cssPixelScale':1,
        'actualRoomPlacement':None,'actualRoomOcclusionTested':False,'mobileAcceptance':False,
        'pixelEstimatesAtImageCentre':{'assetHeight':(box['max'][2]-box['min'][2])*568/(4*math.tan(math.radians(fov)/2)),
                                     'pupilDiameter':.050*POSES['physicalScale']*568/(4*math.tan(math.radians(fov)/2)),
                                     'highlightDiameter':.014*POSES['physicalScale']*568/(4*math.tan(math.radians(fov)/2))}}
    (BASE/'projection-calibration.json').write_text(json.dumps(calibration,indent=2))
print('REIMPORT_CHECK',json.dumps({k:v for k,v in report.items() if k!='records'}))
