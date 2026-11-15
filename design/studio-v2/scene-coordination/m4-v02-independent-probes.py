"""Independent actual M4 restoration review; all negative mutations stay in memory."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import struct
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
KIT = HERE.parent/'asset-pipeline/full-kit'
sha = lambda b: hashlib.sha256(b).hexdigest()
pins = {
    HERE/'m4-v02-restore.py':'9f5cb2f5ec5ab2395d254bf32e828a9a89a6473a244284871f931046373fc12b',
    KIT/'exports/studio-full-kit-m3-proposal-v03.glb':'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf',
    KIT/'exports/studio-full-kit-m4-proposal-v01.raw-export.glb':'c10e6453b6bee5c1cf09b3d1c905151a4567e5360116a0495bc1398eb20f5906',
    KIT/'exports/studio-full-kit-m4-proposal-v02.glb':'baa1a43bd343359edb217fa077bde0678a931cc3ed3991d5ee059e04813ed32f',
    KIT/'manifests/studio-full-kit-m4-proposal-v02.manifest.json':'42597f1b859fdae354063e09ee925d4d2dc9be8ae0ac8556663e391db6906b82',
    KIT/'manifests/m4-v02-restoration-receipt.json':'29194ca093280a5113f3aaa91e30d2594b9be7d651bba10a03825520886895a1',
}
def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module
assert sha((HERE/'m4-v02-restore.py').read_bytes()) == pins[HERE/'m4-v02-restore.py']
restorer=load_module('reviewed_m4_restorer',HERE/'m4-v02-restore.py')
pins.update(restorer.PROVENANCE)
for name in ['m4-v01-raw-word-audit.json','m4-v01-raw-transition-audit.json','m4-v02-transition-audit.json',
             'm4-v02-restore-tests.json','m4-v02-restore-tests.py','m4-v02-profile-check.json',
             'm4-transition-guard-independent-review.md','m4-transition-guard-focused-rereview.md',
             'm4-independent-review-first-attempt.json']:
    path=HERE/name;pins[path]=sha(path.read_bytes())
before={str(p):sha(p.read_bytes()) for p in pins}
assert before=={str(p):h for p,h in pins.items()}
parent=restorer.PARENT.read_bytes();raw=restorer.RAW.read_bytes();actual=restorer.OUTPUT.read_bytes()

def parse(data):
    magic,version,total=struct.unpack_from('<4sII',data)
    assert (magic,version,total)==(b'glTF',2,len(data))
    length,kind=struct.unpack_from('<I4s',data,12);assert kind==b'JSON' and length%4==0
    binary_length,binary_kind=struct.unpack_from('<I4s',data,20+length)
    start=28+length
    assert binary_kind==b'BIN\0' and start+binary_length==len(data)
    return json.loads(data[20:20+length]),start

p,ps=parse(parent);r,rs=parse(raw);c,cs=parse(actual)
assert (ps,rs,cs)==(76148,82684,82684)
assert len(actual)==len(raw)==2206200
changes=[i for i in range(len(raw)) if raw[i]!=actual[i]]
assert changes==[662880,663352,663484]
assert actual[:cs]==raw[:rs] and c==r
approved=json.loads((HERE/'m4-scene-provenance-amendment-v01.json').read_bytes())['after']
assert c['scenes'][0]['extras']==approved

def accessor(doc,data,bin_start,ai):
    a=doc['accessors'][ai];v=doc['bufferViews'][a['bufferView']]
    size={5121:1,5123:2,5125:4,5126:4}[a['componentType']]
    width={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
    stride=v.get('byteStride',size*width)
    start=bin_start+v.get('byteOffset',0)+a.get('byteOffset',0)
    assert 'sparse' not in a and v['buffer']==0
    assert a.get('byteOffset',0)+(a['count']-1)*stride+size*width<=v['byteLength']
    body=b''.join(data[start+i*stride:start+i*stride+size*width] for i in range(a['count']))
    return body,start,stride,size,width

pn={n['name']:n for n in p['nodes']};rn={n['name']:n for n in r['nodes']};cn={n['name']:n for n in c['nodes']}
assert len(pn)==len(p['nodes']) and len(rn)==len(r['nodes']) and len(cn)==len(c['nodes'])
contract=json.loads((HERE/'m4-model-contract.json').read_bytes())
assert set(pn)-set(cn)=={n['name'] for n in contract['retiredParentLeaves']}
assert set(cn)-set(pn)=={row['leaf'] for row in contract['addedRows']}
leaves=comparisons=0;raw_words=[]
for name in sorted(pn.keys() & cn.keys()):
    if 'mesh' not in pn[name]:continue
    leaves+=1
    pm=p['meshes'][pn[name]['mesh']];cm=c['meshes'][cn[name]['mesh']]
    assert pm['name']==cm['name'] and len(pm['primitives'])==len(cm['primitives'])==1
    pp=pm['primitives'][0];cp=cm['primitives'][0]
    assert pp['attributes'].keys()==cp['attributes'].keys()
    for semantic in [*pp['attributes'],'indices']:
        pi=pp['indices'] if semantic=='indices' else pp['attributes'][semantic]
        ci=cp['indices'] if semantic=='indices' else cp['attributes'][semantic]
        pa=p['accessors'][pi];ca=c['accessors'][ci]
        assert {k:v for k,v in pa.items() if k not in ('bufferView','byteOffset')}=={k:v for k,v in ca.items() if k not in ('bufferView','byteOffset')}
        pb,po,pt,size,width=accessor(p,parent,ps,pi)
        cb,co,ct,csize,cwidth=accessor(c,actual,cs,ci)
        rb,ro,rt,rsize,rwidth=accessor(r,raw,rs,ci)
        assert (size,width)==(csize,cwidth)==(rsize,rwidth) and len(pb)==len(cb)==len(rb)
        assert pb==cb,(name,semantic)
        comparisons+=1
        for offset in range(0,len(pb),size):
            original,exported=pb[offset:offset+size],rb[offset:offset+size]
            if original==exported:continue
            vertex,component=divmod(offset//size,width)
            pf=po+vertex*pt+component*size;rf=ro+vertex*rt+component*size
            raw_words.append({'node':name,'mesh':cm['name'],'semantic':semantic,'vertex':vertex,'component':component,
              'parentAccessor':pi,'rawAccessor':ci,'parentView':pa['bufferView'],'rawView':ca['bufferView'],
              'parentBinOffset':pf-ps,'parentFileOffset':pf,'rawBinOffset':rf-rs,'rawFileOffset':rf,
              'rawHex':exported.hex(),'outputHex':original.hex(),
              'ulpDistance':abs(struct.unpack('<I',original)[0]-struct.unpack('<I',exported)[0])})
assert leaves==92 and comparisons==368
assert [(w['vertex'],w['component'],w['rawHex'],w['outputHex'],w['rawFileOffset']) for w in raw_words]==[
 (199,0,'5d8f72bf','5b8f72bf',662880),(258,0,'21858b3e','20858b3e',663352),(274,1,'3789213f','3689213f',663484)]
assert all(w['node']=='desk_top__top' and w['mesh']=='desk_top__top_mesh.002' and w['semantic']=='TEXCOORD_0'
           and (w['parentAccessor'],w['rawAccessor'],w['parentView'],w['rawView'])==(64,75,67,78) for w in raw_words)
assert [w['ulpDistance'] for w in raw_words]==[2,1,1]
rebuilt,_,rebuilt_changes=restorer.restore(parent,raw)
assert rebuilt==actual and rebuilt_changes==changes
guard=load_module('approved_m4_actual_guard',HERE/'m4-transition-guard.py')
transition=guard.audit_m4_transition(parent,actual)
assert transition['valid'] and not transition['errors']
assert transition['metrics']['retainedLeaves']==leaves and transition['metrics']['retainedAccessorComparisons']==comparisons
assert transition['metrics']['retainedComponentDifferences']==0
writer_receipt=json.loads(restorer.RECEIPT.read_bytes())
assert writer_receipt['changedFileByteOffsets']==changes and writer_receipt['output']['sha256']==sha(actual)
for derived,written in zip(raw_words,writer_receipt['restoredWordSlots']):
    for key in ['vertex','component','parentAccessor','rawAccessor','parentBinOffset','parentFileOffset','rawBinOffset','rawFileOffset','rawHex','outputHex']:
        assert derived[key]==written[key]

tests=[]
def reject(name,action,message,exc=ValueError):
    try:action()
    except exc as error:
        assert message in str(error),(name,str(error))
        tests.append({'name':name,'passed':True,'rejection':str(error)})
    else:raise AssertionError('unexpected pass: '+name)
reject('wrong raw full hash',lambda:restorer.restore(parent,raw[:-1]+bytes([raw[-1]^1])),'complete input hashes')
reject('wrong parent full hash',lambda:restorer.restore(parent[:-1]+bytes([parent[-1]^1]),raw),'complete input hashes')
reject('corrected candidate cannot masquerade as raw',lambda:restorer.restore(parent,actual),'complete input hashes')
mesh_index=next(i for i,m in enumerate(r['meshes']) if m['name']=='desk_top__top_mesh.002')
def bad_layout(name,mutate,message):
    d=copy.deepcopy(r);mutate(d)
    reject(name,lambda:restorer.layout(d,75,78,578604),message)
bad_layout('duplicate semantic mesh identity',lambda d:d['meshes'].append(copy.deepcopy(d['meshes'][mesh_index])),'unique named desk mesh')
bad_layout('UV accessor shared by another attribute',lambda d:d['meshes'][mesh_index]['primitives'][0]['attributes'].update(TEXCOORD_1=75),'unique accessor owner')
bad_layout('UV bufferView shared with another accessor',lambda d:d['accessors'][74].update(bufferView=78),'unique UV bufferView owner')
bad_layout('wrong accessor count',lambda d:d['accessors'][75].update(count=291),'exact float32 VEC2 accessor layout')
bad_layout('explicit interleaved layout rejected',lambda d:d['bufferViews'][78].update(byteStride=12),'exact packed UV view layout')
for field,label in [(2,'derived parent BIN offset'),(4,'derived raw BIN offset'),(5,'derived file offsets'),(6,'exact word input/output bytes'),(7,'exact word input/output bytes')]:
    words=[list(w) for w in restorer.WORDS]
    words[0][field]=words[0][field]+4 if field<6 else '00000000'
    with patch.object(restorer,'WORDS',words):
        reject('wrong authorized slot field '+str(field),lambda:restorer.restore(parent,raw),label)
for target,offset in [('raw',662880),('parent',487544)]:
    bad=bytearray(raw if target=='raw' else parent);bad[offset]^=1
    # Test-local hash mock reaches the deeper exact-word check; never writes a file.
    with patch.object(restorer,'sha',side_effect=[restorer.PARENT_SHA,restorer.RAW_SHA]):
        reject('wrong actual '+target+' word after hash precondition',
               lambda:restorer.restore(bytes(bad) if target=='parent' else parent, bytes(bad) if target=='raw' else raw),
               'exact word input/output bytes')
class NoWritePath:
    def __init__(self,existing=False):self.existing=existing;self.opens=[];self.content=b'untouched'
    def exists(self):return self.existing
    def open(self,mode):self.opens.append(mode);raise AssertionError('unexpected write attempt')
    def __str__(self):return 'in-memory-exclusive-path'
for which in ['output','receipt']:
    out,receipt=NoWritePath(which=='output'),NoWritePath(which=='receipt')
    reject('preexisting '+which+' prevents both opens',lambda:restorer.write_fresh(out,receipt,b'candidate',b'receipt'),'Refusing overwrite')
    assert not out.opens and not receipt.opens and out.content==receipt.content==b'untouched'
assert len(tests)==17
after={str(p):sha(p.read_bytes()) for p in pins}
assert after==before
report={'scope':'Independent exact restoration/actual output review only, no stage budget or art acceptance',
 'protectedHashesBefore':before,'protectedHashesAfter':after,'bytes':len(actual),'actuallyChangedByteOffsets':changes,
 'wordSlots':raw_words,'headerAndJsonByteIdentical':True,'allOtherRawBytesIdentical':True,
 'retainedLeaves':leaves,'retainedAccessorComparisons':comparisons,'retainedAccessorDifferences':0,
 'pureRestorerReproducesActualOutput':True,'approvedTransitionGuardPass':True,'honestEmbeddedTags':c['scenes'][0]['extras'],
 'negativeTests':tests,'passedNegativeTests':len(tests),'totalNegativeTests':len(tests),
 'limits':['No renderer/visual/performance/whole-room forecast evaluation','Writer exclusive-I/O receipt race may leave an empty fresh output; no overwrite or retry']} 
with (HERE/'m4-v02-independent-probes.json').open('x',encoding='utf-8') as f:json.dump(report,f,indent=2);f.write('\n')
print(json.dumps({'retainedLeaves':leaves,'retainedAccessors':comparisons,'changedBytes':len(changes),'negativeChecks':len(tests),'transitionPass':True}))
