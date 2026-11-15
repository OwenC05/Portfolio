"""Focused implementer tests, synthetic M4 geometry only; never art approval."""
import argparse
import copy
import importlib.util
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
HELPER = HERE / 'm4-transition-guard.py'
spec = importlib.util.spec_from_file_location('m4_guard', HELPER)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
PARENT = (guard.KIT / guard.CONTRACT['parent']['glb']).read_bytes()
PARENT_DOC, PARENT_BIN = guard.parse_glb(PARENT)


def encode(doc, binary):
    doc = copy.deepcopy(doc)
    doc['buffers'][0]['byteLength'] = len(binary)
    payload = json.dumps(doc, separators=(',', ':'), allow_nan=False).encode()
    payload += b' ' * (-len(payload) % 4)
    binary = bytes(binary) + b'\0' * (-len(binary) % 4)
    return struct.pack('<III',0x46546c67,2,28+len(payload)+len(binary))+struct.pack('<I4s',len(payload),b'JSON')+payload+struct.pack('<I4s',len(binary),b'BIN\0')+binary


def synthetic():
    """Exact 23-to-18 substitution with copied proxy geometry, not M4 artwork."""
    doc = copy.deepcopy(PARENT_DOC)
    binary = bytearray(PARENT[PARENT_BIN:PARENT_BIN+doc['buffers'][0]['byteLength']])
    retired = {r['name'] for r in guard.CONTRACT['retiredParentLeaves']}
    template = copy.deepcopy(next(n for n in doc['nodes'] if n['name']=='ctl_body__proxy_body'))
    mesh_template = copy.deepcopy(doc['meshes'][template['mesh']])
    kept = [n for n in doc['nodes'] if n['name'] not in retired]
    old_names = [n['name'] for n in doc['nodes']]
    new_indices = {n['name']: i for i,n in enumerate(kept)}
    for node in kept:
        if 'children' in node:
            node['children']=[new_indices[old_names[i]] for i in node['children'] if old_names[i] not in retired]
    for scene in doc['scenes']:
        scene['nodes']=[new_indices[old_names[i]] for i in scene['nodes']]
    doc['nodes']=kept
    root=next(n for n in kept if n['name']=='studio_full_kit')
    materials={m['name']: i for i,m in enumerate(doc['materials'])}
    for row in guard.CONTRACT['addedRows']:
        mesh=copy.deepcopy(mesh_template)
        mesh['name']=row['leaf']+'_synthetic_mesh'
        mesh['primitives'][0]['material']=materials[row['material']]
        mesh_index=len(doc['meshes']);doc['meshes'].append(mesh)
        node={'name':row['leaf'],'mesh':mesh_index,
              'extras':{'assetId':row['assetId'],'role':row['role'],'occluder':True,'transparent':False,
                        'nocast':not row['castShadow'],'receiveShadow':row['receiveShadow']}}
        root['children'].append(len(doc['nodes']));doc['nodes'].append(node)
    used=sorted({n['mesh'] for n in doc['nodes'] if 'mesh' in n});remap={old:new for new,old in enumerate(used)}
    doc['meshes']=[doc['meshes'][i] for i in used]
    for node in doc['nodes']:
        if 'mesh' in node:node['mesh']=remap[node['mesh']]
    return doc,binary


def node(doc,name):
    return next(n for n in doc['nodes'] if n['name']==name)


def primitive(doc,name):
    return doc['meshes'][node(doc,name)['mesh']]['primitives'][0]


def flip(doc,binary,name,semantic,vertex=0,component=0):
    p=primitive(doc,name);index=p['indices'] if semantic=='indices' else p['attributes'][semantic]
    # Same addressing arithmetic exposed by the receipt, independently computed.
    a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']]
    size={5121:1,5123:2,5125:4,5126:4}[a['componentType']]
    width={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
    offset=v.get('byteOffset',0)+a.get('byteOffset',0)+vertex*v.get('byteStride',size*width)+component*size
    binary[offset]^=1
    return index,offset,size


def reorder(doc,binary):
    """Relocate all relevant storage indices and BIN origins without semantic edits."""
    def reverse(key):
        values=doc[key];mapping={old:len(values)-1-old for old in range(len(values))};doc[key]=values[::-1];return mapping
    nm=reverse('nodes')
    for n in doc['nodes']:
        if 'children' in n:n['children']=[nm[i] for i in reversed(n['children'])]
    for s in doc['scenes']:s['nodes']=[nm[i] for i in s['nodes']]
    mm=reverse('meshes')
    for n in doc['nodes']:
        if 'mesh' in n:n['mesh']=mm[n['mesh']]
    am=reverse('accessors')
    for m in doc['meshes']:
        for p in m['primitives']:
            p['attributes']={k:am[i] for k,i in p['attributes'].items()}
            if 'indices' in p:p['indices']=am[p['indices']]
    vm=reverse('bufferViews')
    for a in doc['accessors']:a['bufferView']=vm[a['bufferView']]
    for i in doc['images']:i['bufferView']=vm[i['bufferView']]
    im=reverse('images')
    for t in doc['textures']:t['source']=im[t['source']]
    sm=reverse('samplers')
    for t in doc['textures']:
        if 'sampler' in t:t['sampler']=sm[t['sampler']]
    tm=reverse('textures')
    def material_refs(value,key=''):
        if isinstance(value,list):
            for v in value:material_refs(v)
        if isinstance(value,dict):
            if key.endswith('Texture') and 'index' in value:value['index']=tm[value['index']]
            for k,v in value.items():material_refs(v,k)
    for m in doc['materials']:material_refs(m)
    mats=reverse('materials')
    for m in doc['meshes']:
        for p in m['primitives']:p['material']=mats[p['material']]
    for v in doc['bufferViews']:v['byteOffset']=v.get('byteOffset',0)+16
    binary[:0]=b'\0'*16


def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--report',required=True,type=Path);args=parser.parse_args()
    if args.report.exists():raise FileExistsError(args.report)
    paths=[HELPER,Path(__file__),HERE/'m4-model-contract.json',guard.KIT/'source/build_fullkit_m3.py',
           guard.KIT/guard.CONTRACT['parent']['glb'],guard.KIT/guard.CONTRACT['parent']['manifest'],
           guard.KIT/'full-kit-profile-v1.json',guard.KIT/'asset-inventory.json']
    before={str(p):guard.sha(p.read_bytes()) for p in paths};results=[]
    def check(name,operation):
        try:result=operation();results.append({'name':name,'passed':True,'evidence':result})
        except Exception as error:results.append({'name':name,'passed':False,'error':repr(error)})
    def positive(mutate=None):
        d,b=synthetic()
        if mutate:mutate(d,b)
        r=guard.audit_m4_transition(PARENT,encode(d,b));assert r['valid'],r['errors'];return r
    def negative(name,mutate,code):
        def run():
            d,b=synthetic();mutate(d,b);r=guard.audit_m4_transition(PARENT,encode(d,b))
            assert not r['valid'];assert any(e['code']==code for e in r['errors']),r['errors']
            return {'codes':sorted({e['code'] for e in r['errors']})}
        check(name,run)
    check('synthetic 23-to-18 positive with actual pinned parent',positive)
    check('semantic node/mesh/accessor/view/material/image/texture/sampler index and BIN relocation',lambda:positive(reorder))
    check('pure import does not load bpy or bmesh',lambda: {'bpyLoaded':False} if 'bpy' not in sys.modules and 'bmesh' not in sys.modules else (_ for _ in ()).throw(AssertionError('Blender imported')))
    negative('wrong added name',lambda d,b:node(d,'music_cables__runs').update(name='music_cables__extra'),'hierarchy')
    negative('wrong retirement keeping one old proxy',lambda d,b:node(d,'music_cables__runs').update(name='ctl_body__proxy_body'),'hierarchy')
    def reparent(d,b):
        target=d['nodes'].index(node(d,'target_dissertation'));root=node(d,'studio_full_kit');root['children'].remove(target)
        node(d,'ctl_body__shell')['children']=[target]
    negative('retained target reparenting',reparent,'hierarchy')
    negative('root transform',lambda d,b:node(d,'studio_full_kit').update(translation=[0,0.001,0]),'hierarchy')
    negative('retained translation',lambda d,b:node(d,'desk_top__top').update(translation=[0,0,0]),'hierarchy')
    negative('retained flags',lambda d,b:node(d,'mon_cables__runs')['extras'].update(occluder=False),'hierarchy')
    negative('cycle',lambda d,b:node(d,'studio_full_kit')['children'].append(d['nodes'].index(node(d,'studio_full_kit'))),'hierarchy')
    negative('duplicate child',lambda d,b:node(d,'studio_full_kit')['children'].append(node(d,'studio_full_kit')['children'][0]),'hierarchy')
    negative('default scene',lambda d,b:d.update(scene=1),'hierarchy')
    negative('scene extra changed without permission',lambda d,b:d['scenes'][0]['extras'].update(fk_stage='M4'),'sceneMetadata')
    negative('scene camera data',lambda d,b:d.update(cameras=[{'type':'perspective'}]),'documentMetadata')
    negative('new row camera object',lambda d,b:node(d,'ctl_body__shell').update(camera=0),'newNodeData')
    negative('new row unexpected extras',lambda d,b:node(d,'ctl_body__shell')['extras'].update(unknown='x'),'newRowFlags')
    negative('retained target position word',lambda d,b:flip(d,b,'target_dissertation','POSITION'),'retainedAccessorBytes')
    negative('retained target UV word',lambda d,b:flip(d,b,'border_copilot','TEXCOORD_0'),'retainedAccessorBytes')
    negative('retained index word',lambda d,b:flip(d,b,'desk_top__top','indices'),'retainedAccessorBytes')
    negative('prior noise word has no exception',lambda d,b:flip(d,b,'desk_top__top','TEXCOORD_0',258,0),'retainedAccessorBytes')
    def metadata(d,b):
        a=d['accessors'][primitive(d,'desk_top__top')['attributes']['TEXCOORD_0']];a['normalized']=True
    negative('normalized accessor metadata',metadata,'accessorMetadata')
    negative('retained mesh metadata',lambda d,b:d['meshes'][node(d,'desk_top__top')['mesh']].update(extras={'change':1}),'retainedMesh')
    negative('retained primitive mode',lambda d,b:primitive(d,'desk_top__top').update(mode=5),'retainedPrimitive')
    negative('retained extra attribute',lambda d,b:primitive(d,'desk_top__top')['attributes'].update(TANGENT=primitive(d,'desk_top__top')['attributes']['NORMAL']),'attributeSet')
    negative('retained material assignment',lambda d,b:primitive(d,'desk_top__top').update(material=0),'materialAssignment')
    negative('existing material roughness',lambda d,b:d['materials'][0]['pbrMetallicRoughness'].update(roughnessFactor=0.123),'materialDefinition')
    def image_flip(name):
        def run(d,b):
            image=next(i for i in d['images'] if i['name']==name);v=d['bufferViews'][image['bufferView']];b[v.get('byteOffset',0)+20]^=1
        return run
    for name in ['fk_palette_colour','fk_palette_orm','pilot_timber_albedo']:
        negative('encoded image unchanged '+name,image_flip(name),'imageBytes')
    negative('image metadata',lambda d,b:d['images'][0].update(mimeType='image/jpeg'),'imageMetadata')
    negative('image relationship',lambda d,b:d['textures'][0].update(source=1 if d['textures'][0]['source']!=1 else 0),'textureWiring')
    negative('sampler definition',lambda d,b:d['samplers'][0].update(wrapS=33071),'samplerDefinitions')
    def sampler_wire(d,b):
        d['samplers'].append({'wrapS':33071});d['textures'][0]['sampler']=len(d['samplers'])-1
    negative('sampler wiring',sampler_wire,'textureWiring')
    negative('opaque nocast must still occlude',lambda d,b:node(d,'music_cables__runs')['extras'].update(occluder=False),'newRowFlags')
    negative('wrong new cast flag',lambda d,b:node(d,'ctl_body__shell')['extras'].update(nocast=True),'newRowFlags')
    negative('numeric value cannot stand in for boolean',lambda d,b:node(d,'ctl_body__shell')['extras'].update(occluder=1),'newRowFlags')
    negative('new receive flag',lambda d,b:node(d,'ctl_body__shell')['extras'].update(receiveShadow=False),'newRowFlags')
    negative('wrong row material',lambda d,b:primitive(d,'drum_sticks__pair').update(material=0),'newRowMaterial')
    negative('split new primitive',lambda d,b:d['meshes'][node(d,'ctl_body__shell')['mesh']]['primitives'].append(copy.deepcopy(primitive(d,'ctl_body__shell'))),'onePrimitivePerLeaf')
    def duplicate_leaf(d,b):
        n=copy.deepcopy(node(d,'music_cables__runs'));n['name']='music_cables__extra';node(d,'studio_full_kit')['children'].append(len(d['nodes']));d['nodes'].append(n)
    negative('nineteenth row is forbidden',duplicate_leaf,'hierarchy')
    def triangle_limit(d,b):
        p=primitive(d,'ctl_body__indicators');count=(60+1)*3;offset=len(b);b.extend(struct.pack('<'+'H'*count,*([0,1,2]*61)))
        d['bufferViews'].append({'buffer':0,'byteOffset':offset,'byteLength':count*2,'target':34963})
        d['accessors'].append({'bufferView':len(d['bufferViews'])-1,'componentType':5123,'count':count,'type':'SCALAR'})
        p['indices']=len(d['accessors'])-1
    negative('per-row ceiling binds before 22500 stage ceiling',triangle_limit,'rowTriangleCeiling')
    for field,value in [('alphaMode','BLEND'),('doubleSided',False)]:
        def mutation(d,b,field=field,value=value):
            d['materials'][primitive(d,'ctl_body__shell')['material']][field]=value
        negative('wrong new row '+field,mutation,'newRowAlpha' if field=='alphaMode' else 'newRowSidedness')
    def private_sharing(d,b):
        n=node(d,'mon_side__copilot');m=copy.deepcopy(d['meshes'][n['mesh']]);n['mesh']=len(d['meshes']);d['meshes'].append(m)
    negative('retained shared geometry identity',private_sharing,'retainedSharingChanged')

    def diagnostic():
        d,b=synthetic();ai,offset,size=flip(d,b,'desk_top__top','TEXCOORD_0',258,0);raw=encode(d,b)
        r=guard.audit_m4_transition(PARENT,raw);e=next(e for e in r['errors'] if e['code']=='retainedAccessorBytes' and e['node']=='desk_top__top')
        _,bin_start=guard.parse_glb(raw)
        assert (e['semantic'],e['vertex'],e['component'],e['candidateAccessor'],e['candidateBinOffset'])==('TEXCOORD_0',258,0,ai,offset)
        assert e['candidateFileOffset']==bin_start+offset
        assert bytes.fromhex(e['candidateHex'])==raw[e['candidateFileOffset']:e['candidateFileOffset']+size]
        assert bytes.fromhex(e['parentHex'])==PARENT[e['parentFileOffset']:e['parentFileOffset']+size]
        assert e['parentHex']!=e['candidateHex'];return e
    check('diagnostics identify exact word, both indices and both offset spaces',diagnostic)
    def wrong_parent():
        d,b=synthetic();bad=PARENT[:-1]+bytes([PARENT[-1]^1]);r=guard.audit_m4_transition(bad,encode(d,b))
        assert r['errors'][0]['code']=='parentHashMismatch';return {'code':r['errors'][0]['code']}
    check('wrong parent complete byte hash',wrong_parent)
    def dependency_immutability():
        d,b=synthetic();parent=bytes(PARENT);candidate=encode(d,b);guard.audit_m4_transition(parent,candidate)
        assert parent==PARENT and candidate==encode(d,b);return {'inputsUnchanged':True}
    check('pure API input immutability',dependency_immutability)
    for key in ['main','refresh','placed']:
        def cap_probe(key=key):
            old=guard.CONTRACT['stageCeilings'][key]
            try:
                guard.CONTRACT['stageCeilings'][key]=0
                d,b=synthetic();r=guard.audit_m4_transition(PARENT,encode(d,b));assert any(e['code']=='stageCeiling' for e in r['errors'])
            finally:guard.CONTRACT['stageCeilings'][key]=old
            return {'testOnlyInMemoryCap':0,'frozenFileUntouched':True}
        check('outer '+key+' cap wired (test-only cap override)',cap_probe)
    def cli():
        temp=tempfile.TemporaryDirectory(prefix='m4-transition-guard-test-',dir=HERE)
        directory=Path(temp.name).resolve();assert directory.parent==HERE.resolve()
        try:
            raw=directory/'synthetic.glb';receipt=directory/'receipt.json';invalid=directory/'invalid.glb';bad_receipt=directory/'bad.json'
            d,b=synthetic();raw.write_bytes(encode(d,b));bad=copy.deepcopy(d);node(bad,'music_cables__runs')['extras']['occluder']=False;invalid.write_bytes(encode(bad,b))
            original=raw.read_bytes();invalid_original=invalid.read_bytes()
            def run(path,report):return subprocess.run([sys.executable,'-B',str(HELPER),str(path),'--report',str(report)],capture_output=True,text=True,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
            good=run(raw,receipt);assert good.returncode==0,(good.stdout,good.stderr);assert json.loads(receipt.read_text())['valid']
            prior=receipt.read_bytes();duplicate=run(raw,receipt);assert duplicate.returncode!=0;assert receipt.read_bytes()==prior
            rejected=run(invalid,bad_receipt);assert rejected.returncode==1;assert not json.loads(bad_receipt.read_text())['valid']
            own_glb=run(raw,raw);assert own_glb.returncode!=0;assert raw.read_bytes()==original and invalid.read_bytes()==invalid_original
            return {'validExit':good.returncode,'invalidExit':rejected.returncode,'existingReceiptExit':duplicate.returncode,'candidateAsReceiptExit':own_glb.returncode,'candidateBytesUnchanged':True}
        finally:
            assert directory.parent==HERE.resolve() and directory.name.startswith('m4-transition-guard-test-')
            temp.cleanup()
    check('receipt-only CLI and exclusive existing-path refusal',cli)
    after={str(p):guard.sha(p.read_bytes()) for p in paths};assert before==after
    output={'scope':'implementer synthetic CPU tests, not independent approval or real M4 art',
            'helperSha256':before[str(HELPER)],'testSha256':before[str(Path(__file__))],
            'protectedHashesBefore':before,'protectedHashesAfter':after,'results':results,
            'passed':sum(r['passed'] for r in results),'total':len(results)}
    with args.report.open('x',encoding='utf-8') as out:json.dump(output,out,indent=2);out.write('\n')
    print(json.dumps({'passed':output['passed'],'total':output['total'],'failures':[r for r in results if not r['passed']]}))
    return 0 if output['passed']==output['total'] else 1


if __name__=='__main__':raise SystemExit(main())
