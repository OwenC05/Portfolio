"""Independent isolated Blender inspection. Never saves into the candidate."""
import bpy, bmesh, json, hashlib, math
from pathlib import Path
from mathutils import Vector, Quaternion
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[5]
BASE = ROOT/'design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/build-v01'
assert OUT.name == 'technical' and bpy.app.background
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files=[BASE/'selected-a.blend',BASE/'selected-a.glb',BASE.parent/'raw/model.glb',BASE.parent/'cleanup-v01/selected-a-cleanup-start.blend']
before={str(p):sha(p) for p in files}
profile=json.loads((BASE/'profile.json').read_text())
poses=json.loads((BASE/'poses.json').read_text())

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(files[2]))
source=next(o for o in bpy.context.scene.objects if o.type=='MESH')
verts=[source.matrix_world@v.co for v in source.data.vertices]
faces=[list(p.vertices) for p in source.data.polygons]
parent=list(range(len(verts)))
def find(i):
    while parent[i]!=i:
        parent[i]=parent[parent[i]];i=parent[i]
    return i
for face in faces:
    for v in face[1:]:parent[find(v)]=find(face[0])
islands={}
for i in range(len(verts)):islands.setdefault(find(i),[]).append(i)
raw_sets=sorted([sorted(values) for values in islands.values()],key=lambda a:a[0])
author_components=json.loads((BASE/'raw-components.json').read_text())['components']
assert sorted([sorted(c['vertexIndices']) for c in author_components],key=lambda a:a[0])==raw_sets
raw_counts=[]
smoothed={}
for c in author_components:
    ids=c['vertexIndices']; mapping={v:i for i,v in enumerate(ids)}
    face_ids=[i for i,f in enumerate(faces) if f[0] in mapping]
    assert face_ids==c['faceIndices']
    raw_counts.append({'id':c.get('id',c.get('index')),'vertices':len(ids),'faces':len(face_ids)})
for component,name in [(0,'APA_head'),(1,'APA_body'),(3,'APA_mitten_L'),(4,'APA_mitten_R')]:
    c=author_components[component];ids=c['vertexIndices'];mapping={v:i for i,v in enumerate(ids)}
    mesh=bpy.data.meshes.new('ReviewSource');mesh.from_pydata([verts[i] for i in ids],[],[[mapping[i] for i in faces[f]] for f in c['faceIndices']])
    ob=bpy.data.objects.new('ReviewSource',mesh);bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active=ob
    mod=ob.modifiers.new('Review documented smoothing','SMOOTH');mod.iterations=4;mod.factor=.25
    bpy.ops.object.modifier_apply(modifier=mod.name)
    smoothed[name]=[v.co.copy() for v in ob.data.vertices]

bpy.ops.wm.open_mainfile(filepath=str(files[0]),load_ui=False,use_scripts=False)
objects={o.name:o for o in bpy.context.scene.objects}
assert set(objects)=={b['name'] for b in profile['bindings']}
blend_records=[]
for binding in profile['bindings']:
    ob=objects[binding['name']]
    assert (ob.parent.name if ob.parent else None)==binding['parent']
    q=ob.rotation_quaternion
    assert max(abs(a-b) for a,b in zip(ob.location,binding['neutralTranslationBlenderMetres']))<2e-6
    assert abs(sum(v*v for v in q)-1)<1e-6 and abs(q.w-1)<1e-6
    assert all(abs(v-1)<1e-6 for v in ob.scale)
    assert not ob.constraints and not ob.modifiers and not ob.animation_data
    blend_records.append({'name':ob.name,'type':ob.type,'location':list(ob.location),'quaternionWxyz':list(q),'scale':list(ob.scale),'sourceComponent':ob.get('sourceComponent'),'sourceRawSha256':ob.get('sourceRawSha256'),'vertices':len(ob.data.vertices) if ob.type=='MESH' else None})
assert not bpy.data.actions
scale=profile['physicalScale']['metresPerRawUnit'];root_raw=Vector(profile['physicalScale']['rootRaw'])
retained=[]
for name,points in smoothed.items():
    actual=[(objects[name].matrix_world@v.co)/scale+root_raw for v in objects[name].data.vertices]
    tree=KDTree(len(actual))
    for i,p in enumerate(actual):tree.insert(p,i)
    tree.balance()
    if name=='APA_head':
        center=Vector((-.001953125,.01220703125,.14990234375));radii=(.232177734375,.211669921875,.209228515625)
        fitted=[]
        for p in points:
            if p.y>=-.06:
                d=p-center;r=math.sqrt(sum((d[i]/radii[i])**2 for i in range(3)));p=center+d*(.99/r)
            if p.y>=-.06:fitted.append(p)
        points=fitted
    elif name=='APA_body':points=[p for p in points if p.z<-.118-1e-6]
    distances=[tree.find(p)[2] for p in points]
    retained.append({'name':name,'sourceSamplesCompared':len(points),'matchedWithin1eMinus6Raw':sum(d<1e-6 for d in distances),'maxNearestErrorRaw':max(distances),'maxNearestErrorMetres':max(distances)*scale})

# Re-export the actual saved source, not the author builder, to our own directory.
bpy.ops.object.select_all(action='SELECT')
roundtrip=OUT/'independent-export.glb'
bpy.ops.export_scene.gltf(filepath=str(roundtrip),export_format='GLB',use_selection=True,export_yup=True,export_animations=False,export_skins=False,export_morph=False,export_cameras=False,export_lights=False,export_extras=True,export_normals=True,export_texcoords=False)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(files[1]))
objects={o.name:o for o in bpy.context.scene.objects}
def apply_pose(a,b,t):
    for name,ob in objects.items():
        x=a['localBlenderTRS'][name];y=b['localBlenderTRS'][name]
        ob.location=Vector(x['translation']).lerp(Vector(y['translation']),t)
        ob.rotation_mode='QUATERNION'
        ob.rotation_quaternion=Quaternion((x['rotationXyzw'][3],*x['rotationXyzw'][:3])).slerp(Quaternion((y['rotationXyzw'][3],*y['rotationXyzw'][:3])),t)
    bpy.context.view_layer.update()
def group(name):
    p=profile['bindings'];anc=name
    while next(b for b in p if b['name']==anc)['parent'] not in (None,'APA_root'):
        anc=next(b for b in p if b['name']==anc)['parent']
    if name.startswith('APA_mitten'):return name
    return anc
groups={}
for name,ob in objects.items():
    if ob.type=='MESH':groups.setdefault(group(name),[]).append(ob)
# Mittens are independent of body for collision checks, despite their parent.
def tree(group_objects):
    points=[];triangles=[]
    for ob in group_objects:
        start=len(points);points.extend(ob.matrix_world@v.co for v in ob.data.vertices)
        ob.data.calc_loop_triangles();triangles.extend(tuple(start+i for i in t.vertices) for t in ob.data.loop_triangles)
    return BVHTree.FromPolygons(points,triangles,all_triangles=True)
collisions=[];samples=0;eye=[]
for ai,a in enumerate(poses['poses']):
    for bi in range(ai,len(poses['poses'])):
        b=poses['poses'][bi]
        for t in ([0] if ai==bi else [i/10 for i in range(1,10)]):
            apply_pose(a,b,t);samples+=1
            trees={name:tree(obs) for name,obs in groups.items()};names=list(trees)
            for i,name in enumerate(names):
                for other in names[i+1:]:
                    overlaps=trees[name].overlap(trees[other])
                    if overlaps:collisions.append({'from':a['name'],'to':b['name'],'t':t,'nodes':[name,other],'trianglePairs':len(overlaps)})
            if ai==bi:
                for side in ['L','R']:
                    e=objects['APA_eye_'+side];p=objects['APA_pupil_'+side];lid=objects['APA_lid_lower_'+side];h=objects['APA_highlight_'+side]
                    local=[e.matrix_world.inverted()@(p.matrix_world@v.co) for v in p.data.vertices]
                    max_ellipse=max((v.x/(.052*scale))**2+(v.z/(.059*scale))**2 for v in local)
                    inverse=objects['APA_head'].matrix_world.inverted()
                    pupil_bottom=min((inverse@(p.matrix_world@v.co)).z for v in p.data.vertices)
                    lid_top=max((inverse@(lid.matrix_world@v.co)).z for v in lid.data.vertices)
                    highlights=[p.matrix_world.inverted()@(h.matrix_world@v.co) for v in h.data.vertices]
                    max_radius=max(math.hypot(v.x,v.z) for v in highlights)
                    eye.append({'pose':a['name'],'side':side,'actualPupilEllipseMaximum':max_ellipse,'actualPupilLidVerticalGapMetres':pupil_bottom-lid_top,'highlightRadiusMetres':max_radius,'pupilRadiusMetres':.022*scale})
apply_pose(poses['poses'][0],poses['poses'][0],0)
report={'status':'completed-independent-source-export-and-reimport-inspection','blenderVersion':bpy.app.version_string,'blenderBuildHash':bpy.app.build_hash.decode(),'rawConnectedIslands':len(raw_sets),'rawComponentMembershipMatches':True,'rawCounts':raw_counts,'blendObjects':blend_records,'retentionGeometryChecks':retained,'independentExport':{'path':roundtrip.name,'bytes':roundtrip.stat().st_size,'sha256':sha(roundtrip)},'collisionSamples':samples,'collisionGroups':{k:[o.name for o in v] for k,v in groups.items()},'crossMassTriangleIntersections':collisions,'eyeEndpointGeometryChecks':eye,'limits':'Triangle intersections at 95 samples are not continuous collision certification; eye projections do not prove full 3D visible silhouette or runtime marker clearance.','inputHashes':before,'inputsUnchanged':all(sha(p)==before[str(p)] for p in files)}
assert report['inputsUnchanged']
(OUT/'blender-inspection.json').write_text(json.dumps(report,indent=2)+'\n')
print('REVIEW_RESULT',json.dumps({k:v for k,v in report.items() if k not in ['blendObjects','eyeEndpointGeometryChecks','inputHashes']}))
