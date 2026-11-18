"""Reproducible local cleanup/export. No network, shared scene, or application writes."""
import bpy, bmesh, json, math, hashlib, argparse, sys, copy
from pathlib import Path
from mathutils import Vector, Matrix, Quaternion
from mathutils.bvhtree import BVHTree
from math import sin, cos, pi, sqrt, radians
BASE = Path(__file__).resolve().parent
EXPECTED = Path('C:/Users/Owenc/orca/Portfolio-assistant/design/assistant/robot/asset-pipeline/selected-a-v01/candidate-001/build-v02').resolve()
assert BASE == EXPECTED and bpy.app.background
parser = argparse.ArgumentParser()
parser.add_argument('--renders', choices=['preview','final','none'], default='preview')
args = parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
CAND = BASE.parent; LANE = CAND.parent; ROBOT = LANE.parents[1]
RAW = CAND/'raw/model.glb'
RAW_HASH = '412c0c213e0c6adc6baa80fa0686b6cbd9a1d259348bb96c571ef28b2f59bec7'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(RAW) == RAW_HASH
PROFILE = json.loads((LANE/'profile.example.json').read_text())
COMP = json.loads((BASE/'raw-components.json').read_text())['components']
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(RAW))
source = next(o for o in bpy.context.scene.objects if o.type=='MESH')
source_vertices = [source.matrix_world @ v.co for v in source.data.vertices]
source_faces = [list(p.vertices) for p in source.data.polygons]
retention = []
objects = {}
origins = {}
materials = {}
def mesh(name, verts, faces, role=None):
    data = bpy.data.meshes.new(name+'_mesh'); data.from_pydata(verts, [], faces); data.update()
    obj = bpy.data.objects.new(name, data); bpy.context.scene.collection.objects.link(obj)
    for polygon in data.polygons: polygon.use_smooth=True
    if role: data.materials.append(materials[role])
    objects[name]=obj
    return obj
def fix_normals(obj):
    bm=bmesh.new(); bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces)); bm.to_mesh(obj.data); bm.free()
def apply(obj, modifier):
    bpy.context.view_layer.objects.active=obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
def smooth(obj, iterations=4, factor=0.25):
    mod=obj.modifiers.new('Local surface smoothing','SMOOTH'); mod.iterations=iterations; mod.factor=factor; apply(obj,mod)
def extract(cid,name):
    rec=COMP[cid]; index={v:i for i,v in enumerate(rec['vertexIndices'])}
    obj=mesh(name,[source_vertices[v] for v in rec['vertexIndices']],
             [[index[v] for v in source_faces[f]] for f in rec['faceIndices']], 'porcelain')
    obj['sourceComponent']=cid; obj['sourceRawSha256']=RAW_HASH
    retention.append({'node':name,'componentId':cid,'sourceVertices':rec['vertices'],'sourceTriangles':rec['faces']})
    return obj
def linear(hexcode):
    rgb=[int(hexcode[i:i+2],16)/255 for i in (0,2,4)]
    return tuple(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb)
def material(role,color,metal=0,rough=.4,emission=0):
    mat=bpy.data.materials.new(PROFILE['materials']['roles'][role]['binding']); mat.use_nodes=True
    p=mat.node_tree.nodes.get('Principled BSDF'); rgba=(*linear(color),1)
    p.inputs['Base Color'].default_value=rgba; p.inputs['Metallic'].default_value=metal
    p.inputs['Roughness'].default_value=rough
    p.inputs['Emission Color'].default_value=rgba; p.inputs['Emission Strength'].default_value=emission
    mat.diffuse_color=rgba; mat.use_backface_culling=True; materials[role]=mat
for vals in [('porcelain','E8DFCF',0,.37,0),('brass','C69C50',.78,.3,0),('ink','29241F',0,.58,0),
             ('eyeGlow','FFF0CB',0,.4,4.0),('highlight','FFF7E6',0,.28,.25),
             ('redRibbon','A32C27',0,.58,0),('trayGlow','C69C50',.78,.65,.10)]:
    material(*vals)
head=extract(0,'APA_head'); body=extract(1,'APA_body')
hand_l=extract(3,'APA_mitten_L'); hand_r=extract(4,'APA_mitten_R')
for ob in [head,body,hand_l,hand_r]: smooth(ob)
# Keep Meshy shell topology and volume, remove only the projected face opening.
cx=-.001953125; cy=.01220703125; cz=.14990234375
RX=.232177734375; RY=.211669921875; RZ=.209228515625
FACE_Z=.116; FACE_RX=.196; FACE_RZ=.151
def face_y(x,z):
    return cy-RY*sqrt(max(.02,1-((x-cx)/RX)**2-((z-cz)/RZ)**2))+.004
# The generated face/border has irregular overlapping ridges. Retain the rear shell,
# then loft a clean front band from its actual cut boundary to the opaque insert.
cut_y=-.06
rear_fairing=[]
for vertex in head.data.vertices:
    if vertex.co.y>=cut_y:
        delta=vertex.co-Vector((cx,cy,cz))
        radius=sqrt((delta.x/RX)**2+(delta.y/RY)**2+(delta.z/RZ)**2)
        corrected=Vector((cx,cy,cz))+delta*(.99/radius)
        rear_fairing.append((corrected-vertex.co).length); vertex.co=corrected
head_original_vertices_retained=sum(v.co.y>=cut_y for v in head.data.vertices)
head_original_faces_wholly_retained=sum(all(head.data.vertices[i].co.y>=cut_y for i in f.vertices) for f in head.data.polygons)
bm=bmesh.new(); bm.from_mesh(head.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=1e-7,
    plane_co=(0,cut_y,0),plane_no=(0,1,0),clear_inner=True,clear_outer=False)
# Retopologize the same fitted Meshy rear-shell samples to remove folded source
# seam faces. No new sphere primitive or substitute head point cloud is used.
rear_samples=[v.co.copy() for v in bm.verts]
bm.clear()
for point in rear_samples: bm.verts.new(point)
bmesh.ops.convex_hull(bm,input=list(bm.verts),use_existing_faces=False)
unused=[v for v in bm.verts if not v.link_faces]
if unused: bmesh.ops.delete(bm,geom=unused,context='VERTS')
cap_faces=[f for f in bm.faces if all(abs(v.co.y-cut_y)<1e-5 for v in f.verts)]
bmesh.ops.delete(bm,geom=cap_faces,context='FACES')
boundary=set(v for e in bm.edges if e.is_boundary for v in e.verts)
assert boundary and all(abs(v.co.y-cut_y)<1e-5 for v in boundary)
loop=sorted(boundary,key=lambda v:math.atan2((v.co.z-cz)/RZ,(v.co.x-cx)/RX))
outer=[v.co.copy() for v in loop]; angles=[math.atan2((v.co.z-cz)/RZ,(v.co.x-cx)/RX) for v in loop]
previous=loop
for ring in range(1,7):
    t=ring/6; current=[]
    for start,a in zip(outer,angles):
        end=Vector((cx+FACE_RX*cos(a),0,FACE_Z+FACE_RZ*sin(a)))
        x=start.x*(1-t)+end.x*t; z=start.z*(1-t)+end.z*t
        correction=cut_y-(face_y(start.x,start.z)-.004)
        y=face_y(x,z)-.004+correction*(1-t)
        current.append(bm.verts.new((x,y,z)))
    for i in range(len(loop)):
        j=(i+1)%len(loop); bm.faces.new((previous[i],previous[j],current[j],current[i]))
    previous=current
bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces)); bm.to_mesh(head.data); bm.free()
# One subdivision smooths the narrow front loft and retained shell together.
sub=head.modifiers.new('Front band shading continuity','SUBSURF'); sub.levels=1; sub.render_levels=1; apply(head,sub)
opening_adjustments=[]
# Remove the generated open-neck collar; native closed collar/cap replace this small region.
bm=bmesh.new(); bm.from_mesh(body.data)
bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=1e-7,
    plane_co=(0,0,-.118),plane_no=(0,0,1),clear_outer=True,clear_inner=False)
edges=[e for e in bm.edges if e.is_boundary]
bmesh.ops.holes_fill(bm,edges=edges,sides=0); bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
bm.to_mesh(body.data); bm.free()
for record in retention:
    ob=objects[record['node']]
    record['afterRepairVertices']=len(ob.data.vertices); ob.data.calc_loop_triangles()
    record['afterRepairTriangles']=len(ob.data.loop_triangles)
bpy.data.objects.remove(source,do_unlink=True)
# Elliptical curved, solid surface patches with front faces directed toward -Y.
def patch(name,x,z,rx,rz,offset,role,segments=64,rings=6,thickness=.002,bulge=0):
    v=[(x,face_y(x,z)+offset-bulge,z)]
    for ring in range(1,rings+1):
        for i in range(segments):
            a=2*pi*i/segments; px=x+rx*ring/rings*cos(a); pz=z+rz*ring/rings*sin(a)
            v.append((px,face_y(px,pz)+offset-bulge*sqrt(max(0,1-(ring/rings)**2)),pz))
    f=[(0,1+i,1+(i+1)%segments) for i in range(segments)]
    for ring in range(1,rings):
        prev=1+(ring-1)*segments; nxt=1+ring*segments
        for i in range(segments):
            j=(i+1)%segments; f.append((prev+i,nxt+i,nxt+j,prev+j))
    count=len(v); v += [(px,py+thickness,pz) for px,py,pz in v]
    f += [tuple(i+count for i in reversed(face)) for face in list(f)]
    start=1+(rings-1)*segments
    for i in range(segments):
        a=start+i; b=start+(i+1)%segments; f.append((a,b,b+count,a+count))
    return mesh(name,v,f,role)
face=patch('APA_face',cx,FACE_Z,FACE_RX-.001,FACE_RZ-.001,0,'ink',128,16,.004)
def tube(name,points,radius,role,sides=8):
    v=[]; f=[]; n=len(points)
    for i,p in enumerate(points):
        tangent=(Vector(points[(i+1)%n])-Vector(points[(i-1)%n])).normalized()
        radial=tangent.cross(Vector((0,1,0))).normalized()
        if radial.length<.1: radial=tangent.cross(Vector((0,0,1))).normalized()
        normal=tangent.cross(radial).normalized()
        for j in range(sides):
            v.append(Vector(p)+radius*(cos(2*pi*j/sides)*radial+sin(2*pi*j/sides)*normal))
    for i in range(n):
        for j in range(sides): f.append((i*sides+j,((i+1)%n)*sides+j,((i+1)%n)*sides+(j+1)%sides,i*sides+(j+1)%sides))
    obj=mesh(name,v,f,role); fix_normals(obj); return obj
points=[]
for i in range(96):
    a=2*pi*i/96; x=cx+FACE_RX*cos(a); z=FACE_Z+FACE_RZ*sin(a)
    points.append((x,face_y(x,z)-.002,z))
tube('APA_face_rim',points,.004,'brass',6)
# Coronal ring sits behind the face; it cannot become an equatorial back seam.
seam_y=-.09
q=sqrt(1-((seam_y-cy)/RY)**2)
bpy.context.view_layer.update()
shell_bvh=BVHTree.FromObject(head,bpy.context.evaluated_depsgraph_get())
seam_points=[]
for i in range(96):
    radial=Vector((cos(2*pi*i/96),0,sin(2*pi*i/96))); centre=Vector((cx,seam_y,cz))
    hit,normal,index,distance=shell_bvh.ray_cast(centre+radial, -radial,2)
    assert hit is not None, 'Coronal seam must meet the retained shell'
    seam_points.append(hit)
# Smooth a coronal radial profile, keeping one plane and clearing every shell sample.
radii=[(p-Vector((cx,seam_y,cz))).length for p in seam_points]
filtered=[sum(radii)/96+sum(2/96*sum(radii[j]*cos(k*2*pi*j/96) for j in range(96))*cos(k*2*pi*i/96)+2/96*sum(radii[j]*sin(k*2*pi*j/96) for j in range(96))*sin(k*2*pi*i/96) for k in range(1,6)) for i in range(96)]
clearance=max(radii[i]-filtered[i] for i in range(96))+.0015
seam_points=[Vector((cx,seam_y,cz))+Vector((cos(2*pi*i/96),0,sin(2*pi*i/96)))*(filtered[i]+clearance) for i in range(96)]
tube('APA_seam',seam_points,.0048,'brass',8)
EYE_Z=.135; EYE_X=.084; ERX=.052; ERZ=.059; PUPIL_R=.025; PUPIL_UP=.009
eye_parameters={}
for side,sign in [('L',1),('R',-1)]:
    x=cx+sign*EYE_X
    patch('APA_eye_'+side,x,EYE_Z,ERX,ERZ,-.0007,'eyeGlow',64,8,.001)
    patch('APA_pupil_'+side,x,EYE_Z+PUPIL_UP,PUPIL_R,PUPIL_R,-.002,'ink',40,4,.001)
    patch('APA_highlight_'+side,x+.007,EYE_Z+PUPIL_UP+.010,.007,.007,-.0035,'highlight',24,3,.001)
    # A shallow solid apron: only its rounded upper edge is exposed.
    # Sides/bottom intersect below the opaque face; no floating closed pill outline.
    lip_z=EYE_Z-ERZ*.6
    vs=[]; fs=[]; nx=48; nz=12
    for row in range(nz+1):
        t=row/nz
        for col in range(nx+1):
            u=2*col/nx-1; px=x+ERX*u
            top=lip_z-.024*u*u
            pz=top*(1-t)+.012*t
            # Small projection where it covers the eye, fully buried at side/bottom.
            # Remain in front of the entire eye down to its lowest point in
            # every allowed raised-lid pose, then join the face tangentially.
            offset=-.0014 if pz>=.060 else -.0014*((pz-.035)/.025)**3
            if abs(u)>.82:
                offset+=.0014-.0014*(1-(abs(u)-.82)/.08)**3
            vs.append((px,face_y(px,pz)+offset,pz))
    for row in range(nz):
        for col in range(nx):
            a=row*(nx+1)+col; fs.append((a,a+1,a+nx+2,a+nx+1))
    count=len(vs); vs += [(px,py+.003,pz) for px,py,pz in vs]
    fs += [tuple(i+count for i in reversed(f)) for f in list(fs)]
    boundary=list(range(nx+1))+[r*(nx+1)+nx for r in range(1,nz+1)]+list(range(nz*(nx+1)+nx-1,nz*(nx+1)-1,-1))+[r*(nx+1) for r in range(nz-1,0,-1)]
    for i,a in enumerate(boundary):
        b=boundary[(i+1)%len(boundary)]; fs.append((a,b,b+count,a+count))
    lid=mesh('APA_lid_lower_'+side,vs,fs,'ink'); fix_normals(lid)
    origins['APA_eye_'+side]=(x,face_y(x,EYE_Z)-.0007,EYE_Z)
    origins['APA_pupil_'+side]=(x,face_y(x,EYE_Z+PUPIL_UP)-.002,EYE_Z+PUPIL_UP)
    origins['APA_highlight_'+side]=(x+.007,face_y(x+.007,EYE_Z+PUPIL_UP+.010)-.0035,EYE_Z+PUPIL_UP+.010)
    origins['APA_lid_lower_'+side]=(x,cy+.004,cz)
    eye_parameters[side]={'centreRaw':[x,EYE_Z],'radiiRaw':[ERX,ERZ],'pupilRadiusRaw':PUPIL_R,'pupilRestOffsetRaw':[0,PUPIL_UP],'lidTopRaw':lip_z,'lidNeutralCentreOcclusionFraction':.2,'lidMaximumCentreOcclusionFraction':(.2+.0158/(2*ERZ))}
def lathe(name,profile,role,centre=(0,0),segments=64):
    v=[]; f=[]
    for r,z in profile:
        for i in range(segments):
            a=2*pi*i/segments; v.append((centre[0]+r*cos(a),centre[1]+r*sin(a),z))
    for j in range(len(profile)-1):
        for i in range(segments): f.append((j*segments+i,j*segments+(i+1)%segments,(j+1)*segments+(i+1)%segments,(j+1)*segments+i))
    ob=mesh(name,v,f,role); fix_normals(ob); return ob
lathe('APA_collar',[(.063,-.127),(.070,-.121),(.067,-.104),(.060,-.100),(.052,-.103),(.055,-.123),(.063,-.127)],'brass',(.003,-.006))
lathe('APA_body_cap',[(0,-.108),(.056,-.108),(.056,-.103),(.047,-.095),(.027,-.089),(0,-.087)],'brass',(.003,-.006))
tray_r=RX*.9; tray_z=-.449
lathe('APA_tray',[(0,tray_z-.014),(tray_r-.008,tray_z-.014),(tray_r,tray_z-.009),(tray_r+.002,tray_z+.013),
                  (tray_r-.004,tray_z+.017),(tray_r-.010,tray_z+.013),(tray_r-.014,tray_z-.008),(0,tray_z-.008)],'brass',(cx,0))
# Closed brass floor, recessed into dish: flat caps avoid a triangulated shading streak.
n=96; rr=tray_r-.014
vs=[(cx+rr*cos(2*pi*i/n),rr*sin(2*pi*i/n),z) for z in [tray_z-.004,tray_z-.007] for i in range(n)]
fs=[tuple(range(n)),tuple(reversed(range(n,2*n)))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
floor=mesh('APA_tray_glow',vs,fs,'trayGlow'); fix_normals(floor)
# Post is a closed turned brass profile, rigidly attached at the left crown.
post=lathe('APA_bookmark_post',[(0,0),(.023,0),(.025,.006),(.019,.012),(.012,.016),(.011,.137),(.018,.142),(.021,.15),(.019,.160),(.012,.168),(0,.171)],'brass',segments=40)
post_base=Vector((.085,-.022,.335)); post_rot=Matrix.Rotation(radians(13),4,'Y')
for v in post.data.vertices: v.co=post_rot.to_3x3()@v.co+post_base
# Positive X is character left. One solid, notched hanging ribbon, no cloth.
outline=[(.130,.493),(.173,.483),(.181,.334),(.158,.352),(.142,.334)]
v=[(x,y,z) for y in [-.022,-.018] for x,z in outline]; n=len(outline)
f=[tuple(reversed(range(n))),tuple(range(n,2*n))]
for i in range(n): f.append((i,(i+1)%n,(i+1)%n+n,i+n))
ribbon=mesh('APA_bookmark_ribbon',v,f,'redRibbon'); fix_normals(ribbon)
bevel=ribbon.modifiers.new('Soft bookmark edges','BEVEL'); bevel.width=.0015; bevel.segments=2; apply(ribbon,bevel)
# Source-space construction ends here. One provisional uniform scale to metres.
for ob in objects.values():
    if ob.type=='MESH':
        bm=bmesh.new(); bm.from_mesh(ob.data)
        bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=1e-7)
        bmesh.ops.dissolve_degenerate(bm,edges=list(bm.edges),dist=1e-8)
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces)); bm.to_mesh(ob.data); bm.free()
        for poly in ob.data.polygons: poly.use_smooth=(ob.name!='APA_tray_glow' or len(poly.vertices)==4)
        ob.data.normals_split_custom_set([(0.0,0.0,0.0)]*len(ob.data.loops))
SCALE=.28/(COMP[0]['max'][0]-COMP[0]['min'][0])
head_bottom=min(head.data.vertices,key=lambda v:v.co.z).co.copy()
body_top=max(objects['APA_body_cap'].data.vertices,key=lambda v:v.co.z).co.copy()
ROOT_RAW=(head_bottom+body_top)/2
origins.update({'APA_root':ROOT_RAW,'APA_head':(cx,cy,cz),'APA_body':(.003,-.006,-.087),
                'APA_mitten_L':(.135,-.005,-.163),'APA_mitten_R':(-.124,-.005,-.163),
                'APA_tray':(cx,0,tray_z),'APA_bookmark_post':tuple(post_base)})
root=bpy.data.objects.new('APA_root',None); bpy.context.scene.collection.objects.link(root); objects['APA_root']=root
for binding in PROFILE['bindings']:
    name=binding['name']; ob=objects[name]
    origin=Vector(origins.get(name,origins.get(binding['parent'],(cx,cy,cz))))
    origins[name]=origin
    if ob.type=='MESH':
        for v in ob.data.vertices: v.co=(v.co-origin)*SCALE
    ob.location=(origin-ROOT_RAW)*SCALE
    ob.rotation_mode='QUATERNION'; ob.rotation_quaternion=(1,0,0,0); ob.scale=(1,1,1)
    ob['semanticBinding']=name; ob['movingBinding']=binding['moving']
    ob['geometryOrigin']=binding['geometryOrigin']; ob['castShadow']=False
    ob['receiveShadow']=False; ob['opaquePickingBlocker']=(ob.type=='MESH')
bpy.context.view_layer.update()
for binding in PROFILE['bindings']:
    if binding['parent']:
        ob=objects[binding['name']]; world=ob.matrix_world.copy(); ob.parent=objects[binding['parent']]
        ob.matrix_world=world
bpy.context.view_layer.update()
neutral={name:{'translation':list(ob.location),'rotationXyzw':[ob.rotation_quaternion.x,ob.rotation_quaternion.y,ob.rotation_quaternion.z,ob.rotation_quaternion.w],'scale':list(ob.scale)} for name,ob in objects.items()}
# Pose offsets are finite draft authoring values; all values are explicitly recorded.
C=Matrix(((1,0,0),(0,0,1),(0,-1,0)))
def converted(trs):
    q=Quaternion((trs['rotationXyzw'][3],*trs['rotationXyzw'][:3]))
    gq=(C@q.to_matrix()@C.inverted()).to_quaternion()
    return {'translation':list(C@Vector(trs['translation'])),'rotationXyzw':[gq.x,gq.y,gq.z,gq.w],'scale':[trs['scale'][0],trs['scale'][2],trs['scale'][1]]}
def pose(name,head=(0,0,0),root_z=0,tray=(0,0,0,0),hands=0,gaze=(0,0),lid=0,glow=.10):
    states=copy.deepcopy(neutral)
    states['APA_root']['translation'][2]+=root_z
    q=__import__('mathutils').Euler(tuple(radians(x) for x in head),'XYZ').to_quaternion()
    states['APA_head']['rotationXyzw']=[q.x,q.y,q.z,q.w]
    states['APA_tray']['translation']=[a+b for a,b in zip(states['APA_tray']['translation'],tray[:3])]
    q=Quaternion((1,0,0),radians(tray[3])); states['APA_tray']['rotationXyzw']=[q.x,q.y,q.z,q.w]
    for side,sign in [('L',1),('R',-1)]:
        amount=hands if isinstance(hands,(int,float)) else hands[0 if side=='L' else 1]
        q=Quaternion((0,1,0),radians(-sign*amount)); states['APA_mitten_'+side]['rotationXyzw']=[q.x,q.y,q.z,q.w]
        px,pz=eye_parameters[side]['centreRaw']; pz+=PUPIL_UP
        delta=(gaze[0]*SCALE,(face_y(px+gaze[0],pz+gaze[1])-face_y(px,pz))*SCALE,gaze[1]*SCALE)
        states['APA_pupil_'+side]['translation']=[a+b for a,b in zip(states['APA_pupil_'+side]['translation'],delta)]
        # Curvature-following hinge, not translation: the entire apron follows
        # the almost circular YZ face section and cannot expose an eye sliver.
        top=eye_parameters[side]['lidTopRaw']; yy=face_y(px,top)-.0014-(cy+.004); zz=top-cz
        lo=-.25; hi=.25
        for unused in range(40):
            angle=(lo+hi)/2
            if yy*sin(angle)+zz*cos(angle)>zz+lid: lo=angle
            else: hi=angle
        q=Quaternion((1,0,0),(lo+hi)/2);states['APA_lid_lower_'+side]['rotationXyzw']=[q.x,q.y,q.z,q.w]
    return {'name':name,'localBlenderTRS':states,'localGltfTRS':{k:converted(v) for k,v in states.items()},'trayEmissionStrength':glow}
poses=[pose('neutral'),pose('attention',(-7,0,11),.009,hands=24,gaze=(.003,.006),lid=-.003),
       pose('sources',(-3,0,0),.003,(0,-.028,-.014,14),15,(0,.004),.005),
       pose('no-match',(6,0,-8),0,(0,-.026,-.012,10),(2,32),(0,-.003),0),
       pose('dismissal',(2,0,-12),-.004,hands=17,gaze=(-.003,.006),lid=.0158)]
def apply_pose(p):
    for name,trs in p['localBlenderTRS'].items():
        ob=objects[name]; ob.location=trs['translation']; q=trs['rotationXyzw']; ob.rotation_quaternion=(q[3],*q[:3]); ob.scale=trs['scale']
    materials['trayGlow'].node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value=p['trayEmissionStrength']
    bpy.context.view_layer.update()
def bounds():
    pts=[ob.matrix_world@v.co for ob in objects.values() if ob.type=='MESH' for v in ob.data.vertices]
    return {'min':[min(p[k] for p in pts) for k in range(3)],'max':[max(p[k] for p in pts) for k in range(3)]}
pose_bounds=[]
for p in poses:
    apply_pose(p); pose_bounds.append({'pose':p['name'],'boundsBlenderMetres':bounds()})
# Interpolate every ordered pose pair. 41 samples, plus conservative error bound below.
swept_min=[float('inf')]*3; swept_max=[float('-inf')]*3
for a in poses:
    for b in poses:
        for i in range(41):
            t=i/40
            for name in objects:
                aa=a['localBlenderTRS'][name]; bb=b['localBlenderTRS'][name]; ob=objects[name]
                ob.location=Vector(aa['translation']).lerp(Vector(bb['translation']),t)
                qa=Quaternion((aa['rotationXyzw'][3],*aa['rotationXyzw'][:3])); qb=Quaternion((bb['rotationXyzw'][3],*bb['rotationXyzw'][:3]))
                ob.rotation_quaternion=qa.slerp(qb,t)
            bpy.context.view_layer.update(); box=bounds()
            for k in range(3): swept_min[k]=min(swept_min[k],box['min'][k]); swept_max[k]=max(swept_max[k],box['max'][k])
apply_pose(poses[0])
for b in PROFILE['bindings']:
    if b['name'].startswith('APA_lid_lower_'):
        b['pivotDefinition']='eye X section at face ellipsoid YZ centre; local X curvature-following hinge, bounded by poseContract.lidLimits'
    b['neutralTranslationBlenderMetres']=neutral[b['name']]['translation']; b['neutralRotationXyzw']=neutral[b['name']]['rotationXyzw']
    b['neutralScale']=neutral[b['name']]['scale']; b['neutralGltfTRS']=converted(neutral[b['name']])
    b['localPivotBlenderMetres']=[0,0,0]
PROFILE['profileId']='selected-a-v01-candidate-001-build-v02'
PROFILE['status']='built-candidate-awaiting-independent-visual-and-technical-review'; PROFILE['productionReady']=False
PROFILE['revision']=2
PROFILE['runtimePolicy']={'opaquePickingBlocker':True,'castShadow':False,'receiveShadow':False,'privateImportOwnership':'dispose each unique geometry/material once; 21 geometries, 7 shared-by-role materials, no textures; runtime marks have a separate owner','emissionMapping':'preserve imported emission product; for authored target use base emission color times authored strength, or imported intensity times target/neutral strength; never assign sub-one authored strength blindly to imported intensity','trayAuthoredNeutralStrength':.10,'trayDynamicStrength':False,'noMatchDirection':'character RIGHT mitten toward visitor LEFT desktop sheet, per P2 coordinator decisions'}
PROFILE['runtime']['trayStates']['glowValues']={'neutral':.10,'attention':.10,'sources':.10,'no-match':.10,'dismissal':.10}
for key,relative in [('v01VisualRepairReview','review/build-v01/visual/review.md'),('v01TechnicalReview','review/build-v01/technical/review.md'),('placementPrototypeDecisions','placement-selected-a/coordinator-decisions.md')]:
    source=ROBOT/relative; PROFILE['sourcePins'][key]={'path':'design/assistant/robot/'+relative,'sha256':sha(source),'bytes':source.stat().st_size}
PROFILE['physicalScale']={'status':'provisional-uniform-authoring-scale-not-room-allocation','metresPerRawUnit':SCALE,'targetRawHeadWidthMetres':.28,'rootRaw':list(ROOT_RAW),'gapEndpointsRaw':{'headBottom':list(head_bottom),'bodyCapTop':list(body_top)},'rootDefinition':'midpoint of final head bottom and closed body-cap top','extraFloorOffset':False}
PROFILE['materials']['finalPbrValues']={role:{'baseColorLinear':list(m.diffuse_color),'metallic':m.node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value,'roughness':m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value,'emissionStrength':m.node_tree.nodes.get('Principled BSDF').inputs['Emission Strength'].default_value} for role,m in materials.items()}
PROFILE['poseContract'].update({'metadataPath':'poses.json','finitePoses':[p['name'] for p in poses],
    'gazeLimits':{'horizontalMetres':[-.003*SCALE,.003*SCALE],'verticalMetres':[-.003*SCALE,.006*SCALE]},
    'lidLimits':{'rotationAxisBlender':[1,0,0],'angleRadians':[min(2*math.atan2(p['localBlenderTRS']['APA_lid_lower_L']['rotationXyzw'][0],p['localBlenderTRS']['APA_lid_lower_L']['rotationXyzw'][3]) for p in poses),max(2*math.atan2(p['localBlenderTRS']['APA_lid_lower_L']['rotationXyzw'][0],p['localBlenderTRS']['APA_lid_lower_L']['rotationXyzw'][3]) for p in poses)],'neutralCentreOcclusionFraction':.2,'dismissalCentreOcclusionFraction':.2+.0158/(2*ERZ),'motionRestriction':'coupled finite-pose TRS only; local X hinge follows face curvature; no independent rectangular gaze/lid combination'},'trayPresentedTRS':poses[2]['localBlenderTRS']['APA_tray'],'trayEmissionPolicy':'constant decorative 0.10 across all five poses; live source counts carry result evidence'})
pose_metadata={'status':'candidate-values-for-review','basis':'Blender metres, +Z up, -Y forward; local TRS, parent-before-child',
    'poses':poses,'interpolation':'finite translation lerp and quaternion slerp; no scale interpolation or overshoot; all 25 ordered pairs sampled',
    'idleLoops':False,'sourceMarkersExported':False,'countHandling':'Immediate 0..4 from shared snapshot, independent of pose progress; no-match requires validated abstained zero-hit completion',
    'dismissal':'transient close target then settle neutral; reduced motion closes directly to neutral','reducedMotion':'snap latest settled target; no replay on OFF',
    'eyeConstraints':eye_parameters,'physicalScale':SCALE,'poseBounds':pose_bounds,
    'sampledSweptBoundsBlenderMetres':{'min':swept_min,'max':swept_max},'sweepSamples':25*41,
    'sweepScope':'five endpoints with common-parameter nonovershooting pairwise lerp/shortest-slerp only; excludes interrupted intermediate-to-third transitions, independent node clocks, extra gaze/lid offsets, scale changes and runtime marks'}
(BASE/'profile.json').write_text(json.dumps(PROFILE,indent=2))
(BASE/'poses.json').write_text(json.dumps(pose_metadata,indent=2))
(BASE/'retained-mesh.json').write_text(json.dumps({'rawSha256':RAW_HASH,'retained':retention,'discardedComponents':[2,5,6],
    'headOriginalVerticesRetainedBeforeLoft':head_original_vertices_retained,'headOriginalFacesSurvivingCutBeforeRetopology':head_original_faces_wholly_retained,
    'headCutBoundaryVertices':len(loop),'headLoftRings':6,'headSubdivisionLevels':1,
    'rearFairingVertices':len(rear_fairing),'maxRearFairingDisplacementRaw':max(rear_fairing,default=0),
    'repairs':['4 iterations Laplacian smoothing factor .25','radial fairing of retained Meshy rear-shell vertices to fitted stretched-ball envelope, preserving angular positions','convex retopology of those same rear-shell samples removes folded source seam faces','loft actual cut boundary into clean front band','body collar bisect and hole cap','one subdivision smooths front band and retained rear shell','reset imported custom normals to automatic after geometry edits'],
    'nativeNodes':[b['name'] for b in PROFILE['bindings'] if b['name'] not in [r['node'] for r in retention]]},indent=2))
# Export selected robot only, neutral, no cameras/lights/animations/skins/morphs/textures.
bpy.ops.object.select_all(action='DESELECT')
for ob in objects.values(): ob.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.context.scene.unit_settings.system='METRIC'; bpy.context.scene.unit_settings.scale_length=1
bpy.ops.export_scene.gltf(filepath=str(BASE/'selected-a.glb'),export_format='GLB',use_selection=True,
    export_yup=True,export_animations=False,export_skins=False,export_morph=False,export_cameras=False,export_lights=False,
    export_extras=True,export_normals=True,export_texcoords=False)
# The editable blend retains only the robot; evidence scene is constructed after saving.
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'selected-a.blend'))
summary={'neutralBoundsBlenderMetres':bounds(),'nodes':len(objects),'meshes':sum(ob.type=='MESH' for ob in objects.values()),
    'materials':len(materials),'blenderVersion':bpy.app.version_string,'blenderBuildHash':bpy.app.build_hash.decode(),
    'gltfSha256':sha(BASE/'selected-a.glb'),'blendSha256':sha(BASE/'selected-a.blend'),'rawSha256':RAW_HASH}
(BASE/'build-summary.json').write_text(json.dumps(summary,indent=2))
if args.renders!='none':
    scene=bpy.context.scene; scene.render.engine='CYCLES'; scene.cycles.device='CPU'; scene.cycles.samples=32
    scene.cycles.use_denoising=True
    scene.render.resolution_x=640; scene.render.resolution_y=800; scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'; scene.view_settings.view_transform='AgX'
    world=bpy.data.worlds.new('EvidenceWorld'); world.use_nodes=True; scene.world=world
    world.node_tree.nodes['Background'].inputs['Color'].default_value=(.22,.24,.27,1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45
    for name,loc,energy,size in [('Key',(-1,-1.5,1.8),90,1.5),('Fill',(1.2,-.5,.6),45,1.2),('Rim',(.5,1,1),75,1)]:
        light=bpy.data.lights.new('Evidence'+name,'AREA'); light.energy=energy; light.shape='DISK'; light.size=size
        ob=bpy.data.objects.new('Evidence'+name,light); scene.collection.objects.link(ob); ob.location=loc
        ob.rotation_euler=(Vector((0,0,.06))-ob.location).to_track_quat('-Z','Y').to_euler()
    camdata=bpy.data.cameras.new('EvidenceCamera'); cam=bpy.data.objects.new('EvidenceCamera',camdata); scene.collection.objects.link(cam); scene.camera=cam
    camdata.type='ORTHO'; camdata.ortho_scale=.67
    folder=BASE/'renders'; folder.mkdir(exist_ok=True)
    def render(name,loc):
        cam.location=loc; cam.rotation_euler=(Vector((0,0,.04))-cam.location).to_track_quat('-Z','Y').to_euler()
        scene.render.filepath=str(folder/(name+'.png')); bpy.ops.render.render(write_still=True)
    render('neutral-front',(0,-2,.04))
    if args.renders=='preview': render('neutral-three-quarter',(1.2,-2,.45))
    if args.renders=='final':
        for name,loc in [('neutral-three-quarter',(1.2,-2,.45)),('neutral-side',(2,0,.04)),('neutral-back',(0,2,.04))]: render(name,loc)
        for p in poses:
            apply_pose(p); render('pose-'+p['name'],(.45,-2,.26))
    apply_pose(poses[0])
print('BUILD_DONE',json.dumps(summary))
