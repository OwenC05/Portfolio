"""Writer-separated actual-byte and bounded CPU restoration audit; no Blender."""
import ast
import copy
import hashlib
import json
import struct
import subprocess
import tempfile
import zlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
KIT = HERE.parent / 'asset-pipeline/full-kit'
hashof = lambda data: hashlib.sha256(data).hexdigest()
paths = {
    'parent': KIT / 'exports/studio-full-kit-m2-proposal-v05.glb',
    'raw': KIT / 'exports/studio-full-kit-m3-proposal-v02.raw-export.glb',
    'candidate': KIT / 'exports/studio-full-kit-m3-proposal-v03.glb',
    'manifest': KIT / 'manifests/studio-full-kit-m3-proposal-v03.manifest.json',
    'receipt': KIT / 'manifests/m3-v03-restoration-receipt.json',
    'source': KIT / 'source/build_fullkit_m3.py',
    'blend': KIT / 'source/fk-30-nearfield-proposal-v02.blend',
    'authorMeasurements': KIT / 'manifests/m3-v02-author-measurements.json',
    'rawAudit': HERE / 'm3-v02-raw-audit.json',
    'restorer': HERE / 'm3-v03-restore.py',
}
blobs = {name: p.read_bytes() for name, p in paths.items()}
hashes = {name: hashof(data) for name, data in blobs.items()}
pins = {
    'parent': '4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735',
    'raw': '71b39b5c242278408092d3ee95ab4e996df47014eb30ef57383b88f3e526fd18',
    'candidate': 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf',
    'manifest': '060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405',
    'source': 'dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209',
    'blend': '46c52922f77ca1b78546450b5ef43ec3fdcc2ee6e67082070ccd48b63c25d4cd',
    'rawAudit': '29995ecaa2404e1a8ece12521de930c984278a78ec1fa9e6241597b1adadb52c',
}
assert all(hashes[k] == v for k, v in pins.items())

def glb(blob):
    magic, version, length = struct.unpack_from('<4sII', blob)
    assert (magic, version, length) == (b'glTF', 2, len(blob))
    jlen, jtype = struct.unpack_from('<I4s', blob, 12)
    blen, btype = struct.unpack_from('<I4s', blob, 20 + jlen)
    assert jtype == b'JSON' and btype == b'BIN\0' and 28 + jlen + blen == len(blob)
    return json.loads(blob[20:20+jlen]), 28+jlen

parent, po = glb(blobs['parent'])
raw, ro = glb(blobs['raw'])
candidate, co = glb(blobs['candidate'])
assert len(blobs['raw']) == len(blobs['candidate'])
changed = [i for i in range(len(blobs['raw'])) if blobs['raw'][i] != blobs['candidate'][i]]
assert changed == [487532, 487544, 488016, 488148]
assert co == ro and blobs['raw'][:ro] == blobs['candidate'][:co] and raw == candidate
authorized = [(197, 1, 411436, 411384, 487532, 'dec4203f', 'ddc4203f'),
              (199, 0, 411448, 411396, 487544, '5d8f72bf', '5b8f72bf'),
              (258, 0, 411920, 411868, 488016, '21858b3e', '20858b3e'),
              (274, 1, 412052, 412000, 488148, '3789213f', '3689213f')]

def attribute(doc, blob, start, index):
    a = doc['accessors'][index]; v = doc['bufferViews'][a['bufferView']]
    size = {5121: 1, 5123: 2, 5125: 4, 5126: 4}[a['componentType']]
    width = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    stride = v.get('byteStride', size * width)
    offset = start + v.get('byteOffset', 0) + a.get('byteOffset', 0)
    return b''.join(blob[offset+i*stride:offset+i*stride+size*width] for i in range(a['count'])), offset, stride, size

slot_evidence = []
for vertex, component, pb, rb, rf, before, after in authorized:
    _, parent_offset, parent_stride, size = attribute(parent, blobs['parent'], po, 64)
    _, raw_offset, raw_stride, _ = attribute(raw, blobs['raw'], ro, 64)
    assert parent_offset-po+vertex*parent_stride+component*size == pb
    assert raw_offset-ro+vertex*raw_stride+component*size == rb and ro+rb == rf
    assert blobs['raw'][rf:rf+4].hex() == before
    assert blobs['parent'][po+pb:po+pb+4].hex() == after == blobs['candidate'][rf:rf+4].hex()
    slot_evidence.append({'vertex': vertex, 'component': component, 'parentBin': pb, 'rawBin': rb, 'file': rf, 'raw': before, 'output': after})

source_tree = ast.parse(blobs['source'])
baseline = subprocess.run(['git', 'show', '416af31:design/studio-v2/asset-pipeline/full-kit/source/build_fullkit_m3.py'], check=True, capture_output=True, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0)).stdout
assert hashof(baseline) == '8829c741ee25bbb32da8328e4d56eb43fcd40ad9eac931a49bc0bb7192d22954'
base_tree = ast.parse(baseline)
names = {'retained_hierarchy_problems', 'retained_texture_problems', 'palette_pixel_problems', 'png_rgba'}
definitions = [n for n in source_tree.body if isinstance(n, ast.FunctionDef) and n.name in names]
old_definitions = [n for n in base_tree.body if isinstance(n, ast.FunctionDef) and n.name in names]
assert [ast.dump(n) for n in definitions] == [ast.dump(n) for n in old_definitions]
def literal(tree, name):
    return ast.literal_eval(next(n.value for n in ast.walk(tree) if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == name for t in n.targets)))
for name in ('NOISE', 'ROWS', 'T2', 'FROST_RENDER_ORDER'):
    assert literal(source_tree, name) == literal(base_tree, name)
scope = {'struct': struct, 'zlib': zlib}
exec(compile(ast.Module(body=definitions, type_ignores=[]), str(paths['source']), 'exec'), scope)
pn = {n['name']: n for n in parent['nodes']}; cn = {n['name']: n for n in candidate['nodes']}
rows = literal(source_tree, 'ROWS')
removed = {name for name, n in pn.items() if '__proxy' in name and n.get('extras', {}).get('assetId') in {v[0] for v in rows.values()}}
assert len(removed) == 11 and set(pn)-set(cn) == removed and set(cn)-set(pn) == set(rows)
assert not scope['retained_hierarchy_problems'](parent, candidate, removed, set(rows))
assert not scope['retained_texture_problems'](parent, candidate, blobs['parent'], blobs['candidate'], po, co)

retained = []
attribute_comparisons = 0
for name in sorted(set(pn) & set(cn)):
    if 'mesh' not in pn[name]: continue
    pm = parent['meshes'][pn[name]['mesh']]; cm = candidate['meshes'][cn[name]['mesh']]
    assert {k:v for k,v in pm.items() if k!='primitives'} == {k:v for k,v in cm.items() if k!='primitives'}
    assert len(pm['primitives']) == len(cm['primitives']) == 1
    p, c = pm['primitives'][0], cm['primitives'][0]
    assert parent['materials'][p['material']] == candidate['materials'][c['material']]
    assert {k:v for k,v in p.items() if k not in ('attributes','indices','material')} == {k:v for k,v in c.items() if k not in ('attributes','indices','material')}
    assert set(p['attributes']) == set(c['attributes'])
    for semantic in list(p['attributes']) + ['indices']:
        pi, ci = (p['indices'],c['indices']) if semantic=='indices' else (p['attributes'][semantic], c['attributes'][semantic])
        assert {k:v for k,v in parent['accessors'][pi].items() if k not in ('bufferView','byteOffset')} == {k:v for k,v in candidate['accessors'][ci].items() if k not in ('bufferView','byteOffset')}
        assert attribute(parent, blobs['parent'], po, pi)[0] == attribute(candidate, blobs['candidate'], co, ci)[0], (name, semantic)
        attribute_comparisons += 1
    retained.append(name)

cells = {name:{'index': i, 'srgb':'#%06x'%colour,'roughness':rough,'metallic':metal} for i,(name,colour,rough,metal) in enumerate(literal(source_tree,'T2'),19)}
def image_bytes(doc, blob, bo, name):
    im=next(i for i in doc['images'] if i['name']==name);v=doc['bufferViews'][im['bufferView']];offset=bo+v.get('byteOffset',0)
    return blob[offset:offset+v['byteLength']]
for name in ('fk_palette_colour','fk_palette_orm'):
    assert not scope['palette_pixel_problems'](scope['png_rgba'](image_bytes(parent,blobs['parent'],po,name)),scope['png_rgba'](image_bytes(candidate,blobs['candidate'],co,name)),name,cells,8,16)
frost=cn['kb_case__frost_shell']; fm=candidate['materials'][candidate['meshes'][frost['mesh']]['primitives'][0]['material']]
assert fm['name']=='lib_frost' and fm['alphaMode']=='BLEND' and not fm.get('doubleSided',False)
assert all(frost['extras'][k]==v for k,v in {'assetId':'kb_case','role':'transparent','transparent':True,'occluder':False,'nocast':True,'receiveShadow':False,'renderOrder':1.5}.items())
assert {m['name'] for m in candidate['materials']}-{m['name'] for m in parent['materials']}=={'lib_frost'}

# Extract the technical restorer's functions/constants, never invoke its top-level main guard.
rest_tree=ast.parse(blobs['restorer'])
function_defs=[n for n in rest_tree.body if isinstance(n,ast.FunctionDef)]
env={'hashlib':hashlib,'json':json,'struct':struct,'Path':Path,'__file__':str(paths['restorer'])}
for name in ('PARENT_SHA','RAW_SHA','WORDS'):env[name]=literal(rest_tree,name)
assert env['WORDS']==tuple(authorized)
exec(compile(ast.Module(body=function_defs,type_ignores=[]),str(paths['restorer']),'exec'),env)
restored,rest_rows,rest_changes=env['restore'](blobs['parent'],blobs['raw'])
assert restored==blobs['candidate'] and rest_changes==changed
tests=[]
def reject(name, operation):
    try: operation()
    except (ValueError,FileExistsError): tests.append({'name':name,'passed':True})
    else: tests.append({'name':name,'passed':False})
bad=bytearray(blobs['raw']);bad[488016]^=1
reject('modified authorized raw word rejected by complete hash',lambda:env['restore'](blobs['parent'],bytes(bad)))
bad_other=bytearray(blobs['raw']);bad_other[-1]^=1
reject('unrelated raw byte mutation rejected',lambda:env['restore'](blobs['parent'],bytes(bad_other)))
bad_parent=bytearray(blobs['parent']);bad_parent[-1]^=1
reject('modified parent rejected',lambda:env['restore'](bytes(bad_parent),blobs['raw']))
reject('already corrected candidate rejected as raw',lambda:env['restore'](blobs['parent'],blobs['candidate']))
for label,mutate in [
    ('duplicate mesh identity',lambda d:d['meshes'].append(copy.deepcopy(next(m for m in d['meshes'] if m['name']=='desk_top__top_mesh.002')))),
    ('duplicate node consumer',lambda d:d['nodes'].append(copy.deepcopy(next(n for n in d['nodes'] if n['name']=='desk_top__top')))),
    ('wrong accessor count',lambda d:d['accessors'][64].update(count=291)),
    ('unexpected accessor stride',lambda d:d['bufferViews'][67].update(byteStride=12)),
    ('wrong view origin',lambda d:d['bufferViews'][67].update(byteOffset=409800)),
]:
    doc=copy.deepcopy(raw);mutate(doc)
    reject(label+' rejected',lambda doc=doc:env['layout'](doc,409804))
saved=env['WORDS']
for label,index,value in [('wrong offset',4,487533),('wrong raw value',5,'dfc4203f'),('wrong replacement value',6,'dcc4203f')]:
    modified=list(saved[0]);modified[index]=value;env['WORDS']=(tuple(modified),)+saved[1:]
    reject(label+' rejected with exact inputs',lambda:env['restore'](blobs['parent'],blobs['raw']))
env['WORDS']=saved
temp=Path(tempfile.mkdtemp(prefix='m3-v03-review-isolated-',dir=HERE))
env['OUTPUT']=temp/'candidate.glb';env['RECEIPT']=temp/'receipt.json'
env['OUTPUT'].write_bytes(b'preserve-output')
reject('existing output refusal before any writes',env['main'])
assert env['OUTPUT'].read_bytes()==b'preserve-output' and not env['RECEIPT'].exists()
env['OUTPUT']=temp/'absent.glb';env['RECEIPT'].write_bytes(b'preserve-receipt')
reject('existing receipt refusal before any writes',env['main'])
assert not env['OUTPUT'].exists() and env['RECEIPT'].read_bytes()==b'preserve-receipt'

assert all(t['passed'] for t in tests)
receipt=json.loads(blobs['receipt'])
assert receipt['restorerSha256']==hashes['restorer'] and receipt['output']['sha256']==hashes['candidate']
assert receipt['changedFileByteOffsets']==changed and receipt['actuallyChangedByteCount']==4
assert all(hashof(p.read_bytes())==hashes[name] for name,p in paths.items())
report={'scope':'Independent actual-byte restoration/retained-parent review; no visual, forecast or final-budget acceptance.',
        'hashes':hashes,'exactChangedIndividualBytes':changed,'wordSlots':slot_evidence,'headerJsonAndEveryOtherRawByteUnchanged':True,
        'embeddedSceneTags':candidate['scenes'],'retainedMeshNames':retained,'retainedAccessorComparisons':attribute_comparisons,
        'retainedAccessorDifferences':[],'reviewedGuardFunctionsUnchanged':True,'sourceNoiseRowsT2FrostUnchanged':True,
        'hierarchyTextureRgbaAndFrostChecks':'passed against actual parent/candidate','negativeTests':tests,'negativePassed':len(tests),
        'isolatedMarkerDirectory':str(temp.relative_to(HERE)),'frozenInputsOutputsAndReceiptsUnchanged':True}
with (HERE/'m3-v03-review-probes.json').open('x',encoding='utf-8') as f:json.dump(report,f,indent=2);f.write('\n')
print(json.dumps({'changedBytes':changed,'retainedMeshes':len(retained),'accessorComparisons':attribute_comparisons,'negativePassed':len(tests),'allProtectedHashesUnchanged':True}))
