"""Receipt-only M3-to-M4 transition audit; standard library, no Blender imports.

Import verifies frozen read-only dependencies and AST-extracts just the reviewed
hierarchy function. audit_m4_transition performs no I/O and never changes inputs.
This guard supplements, and does not replace, the frozen full-kit validator.
"""
import argparse
import ast
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import struct

HERE = Path(__file__).resolve().parent
KIT = HERE.parent / 'asset-pipeline' / 'full-kit'
MAPPING_SHA = '8f0474aad063a2517b0b399bb87728d823ddf5539ae12b67db60bdd7ae3f2d98'
AMENDMENT_SHA = '3b3a011d5d2f599dc63a4bf31aacd115513eb06c31267ddee0201209cebb2229'
SOURCE_SHA = 'dccfa2885919a84b03ff472cecbf76da35e0cd2a8b32baaca2dc8cb31929a209'
PROFILE_SHA = '7d2892ae7cb376b1b11942f956647e48284549e718f125b94bd57e5900d7a052'
PARENT_SHA = 'dc9c6a78a704880db92678908bf7171329f6a80c86b96e2143e44e85e3f36baf'
MANIFEST_SHA = '060bab9af5dd23b4258e03aef10de21faa7c32aa0a6010cd4e09b35089026405'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def pinned(path, expected):
    data = path.read_bytes()
    if sha(data) != expected:
        raise ValueError(f'frozen dependency hash mismatch: {path}')
    return data


CONTRACT = json.loads(pinned(HERE / 'm4-model-contract.json', MAPPING_SHA))
PROVENANCE = json.loads(pinned(HERE / 'm4-scene-provenance-amendment-v01.json', AMENDMENT_SHA))
if (PROVENANCE['mappingSha256'] != MAPPING_SHA or PROVENANCE['parentSha256'] != PARENT_SHA
        or PROVENANCE['parentManifestSha256'] != MANIFEST_SHA):
    raise ValueError('scene provenance amendment pins differ')
PROFILE = json.loads(pinned(KIT / 'full-kit-profile-v1.json', PROFILE_SHA))
INVENTORY = json.loads(pinned(KIT / 'asset-inventory.json', CONTRACT['inventorySha256']))
pinned(KIT / CONTRACT['parent']['manifest'], MANIFEST_SHA)
if CONTRACT['parent']['sha256'] != PARENT_SHA or CONTRACT['parent']['manifestSha256'] != MANIFEST_SHA:
    raise ValueError('mapping parent pins differ')
_source = pinned(KIT / 'source/build_fullkit_m3.py', SOURCE_SHA)
_defs = [n for n in ast.parse(_source).body if isinstance(n, ast.FunctionDef)
         and n.name == 'retained_hierarchy_problems']
if len(_defs) != 1:
    raise ValueError('reviewed hierarchy definition missing')
_scope = {}
exec(compile(ast.Module(body=_defs, type_ignores=[]), 'pinned-M3-hierarchy-only', 'exec'), _scope)
retained_hierarchy_problems = _scope['retained_hierarchy_problems']
del _source, _defs, _scope


class AuditError(ValueError):
    def __init__(self, code, **context):
        super().__init__(code)
        self.detail = {'code': code, **context}


def require(condition, code, **context):
    if not condition:
        raise AuditError(code, **context)


def integer(value, minimum=0):
    return type(value) is int and value >= minimum


def token(value):
    # Exact decoded JSON, with key order ignored and no numeric epsilon.
    return json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False)


def without(value, keys):
    return {k: v for k, v in value.items() if k not in keys}


def ref(items, index, label):
    require(integer(index) and index < len(items), 'invalidReference', kind=label, index=index)
    return items[index]


def unique_named(items, label):
    names = [item.get('name') for item in items]
    require(all(isinstance(n, str) and n for n in names) and len(set(names)) == len(names),
            'duplicateOrMissingName', kind=label)
    return dict(zip(names, items))


def parse_glb(raw):
    require(isinstance(raw, bytes), 'bytesRequired')
    require(28 <= len(raw) <= PROFILE['guards']['maxRawGlbBytes'], 'rawSize')
    require(struct.unpack_from('<III', raw) == (0x46546c67, 2, len(raw)), 'glbHeader')
    jlen, jtype = struct.unpack_from('<I4s', raw, 12)
    require(jtype == b'JSON' and jlen % 4 == 0 and 28 + jlen <= len(raw), 'jsonChunk')
    blen, btype = struct.unpack_from('<I4s', raw, 20 + jlen)
    require(btype == b'BIN\0' and blen % 4 == 0 and 28 + jlen + blen == len(raw), 'binChunk')
    def pairs(items):
        result = {}
        for key, value in items:
            require(key not in result, 'duplicateJsonKey', key=key)
            result[key] = value
        return result
    def nonfinite(value):
        raise AuditError('nonfiniteJson', value=value)
    doc = json.loads(raw[20:20+jlen], object_pairs_hook=pairs, parse_constant=nonfinite)
    require(len(doc['buffers']) == 1, 'oneEmbeddedBufferRequired')
    buffer = doc['buffers'][0]
    require(set(buffer) == {'byteLength'} and integer(buffer['byteLength'])
            and buffer['byteLength'] <= blen <= buffer['byteLength'] + 3, 'embeddedBufferLength')
    return doc, 28 + jlen


def view(doc, raw, start, index):
    v = ref(doc['bufferViews'], index, 'bufferView')
    offset, length = v.get('byteOffset', 0), v['byteLength']
    require(v.get('buffer') == 0 and type(v.get('buffer')) is int and integer(offset)
            and integer(length) and offset + length <= doc['buffers'][0]['byteLength'],
            'bufferViewBounds', view=index)
    return v, start + offset, raw[start+offset:start+offset+length]


def accessor(doc, raw, start, index):
    a = ref(doc['accessors'], index, 'accessor')
    require('sparse' not in a, 'sparseAccessorUnsupported', accessor=index)
    v, begin, _ = view(doc, raw, start, a['bufferView'])
    sizes, widths = {5121: 1, 5123: 2, 5125: 4, 5126: 4}, {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}
    require(a.get('componentType') in sizes and a.get('type') in widths, 'accessorLayout', accessor=index)
    size, width = sizes[a['componentType']], widths[a['type']]
    count, offset = a['count'], a.get('byteOffset', 0)
    stride = v.get('byteStride', size * width)
    require(integer(count, 1) and integer(offset) and integer(stride, size*width)
            and stride % size == 0 and offset % size == 0
            and offset + (count-1)*stride + size*width <= v['byteLength'], 'accessorBounds', accessor=index)
    origin = begin + offset
    payload = b''.join(raw[origin+i*stride:origin+i*stride+size*width] for i in range(count))
    return {'meta': without(a, {'bufferView', 'byteOffset'}),
            'viewMeta': without(v, {'buffer', 'byteOffset', 'byteLength', 'byteStride'}),
            'data': payload, 'origin': origin, 'stride': stride, 'size': size, 'width': width, 'count': count}


def texture_graph(doc, raw, start):
    images = unique_named(doc.get('images', []), 'image')
    values = {}
    for name, image in images.items():
        require('uri' not in image, 'externalImage', image=name)
        v, origin, payload = view(doc, raw, start, image['bufferView'])
        values[name] = {'meta': without(image, {'bufferView'}), 'data': payload, 'origin': origin,
                        'viewMeta': without(v, {'buffer', 'byteOffset', 'byteLength'})}
    textures = []
    for texture in doc.get('textures', []):
        normalized = without(texture, {'source', 'sampler'})
        normalized['sourceName'] = ref(doc['images'], texture['source'], 'image')['name']
        normalized['samplerDefinition'] = ref(doc['samplers'], texture['sampler'], 'sampler') if 'sampler' in texture else None
        textures.append(normalized)
    return values, textures


def material_definition(material, textures):
    def visit(value, key=''):
        if isinstance(value, list):
            return [visit(v) for v in value]
        if not isinstance(value, dict):
            return value
        result = {k: visit(v, k) for k, v in value.items()}
        if key.endswith('Texture') and 'index' in value:
            result['index'] = ref(textures, value['index'], 'texture')
        return result
    return visit(material)


def _audit(parent_bytes, candidate_bytes, report):
    errors = report['errors']
    def same(a, b, code, **context):
        if token(a) != token(b):
            errors.append({'code': code, **context, 'parent': a, 'candidate': b})

    require(report['parentSha256'] == PARENT_SHA, 'parentHashMismatch', expected=PARENT_SHA)
    p, po = parse_glb(parent_bytes)
    c, co = parse_glb(candidate_bytes)
    removed = {n['name'] for n in CONTRACT['retiredParentLeaves']}
    rows = {r['leaf']: r for r in CONTRACT['addedRows']}
    hierarchy = retained_hierarchy_problems(p, c, removed, set(rows))
    if hierarchy:
        errors.extend({'code': 'hierarchy', 'detail': list(problem)} for problem in hierarchy)
        return
    pn, cn = unique_named(p['nodes'], 'node'), unique_named(c['nodes'], 'node')
    for entry in CONTRACT['retiredParentLeaves']:
        same(pn[entry['name']].get('extras'), entry['extras'], 'pinnedRetirementMetadata', node=entry['name'])
    # Only the pinned first-M4-v01 extras transition is authorized. Compare the
    # complete before/after objects and preserve every other scene/document field.
    collections = {'nodes', 'meshes', 'accessors', 'bufferViews', 'buffers', 'images',
                   'materials', 'textures', 'samplers', 'scenes'}
    same(without(p, collections), without(c, collections), 'documentMetadata')
    def scenes(doc):
        return [{**without(s, {'nodes'}), 'nodes': [ref(doc['nodes'], i, 'scene node')['name']
                 for i in s.get('nodes', [])]} for s in doc['scenes']]
    parent_scenes, candidate_scenes = scenes(p), scenes(c)
    require(len(parent_scenes) == len(candidate_scenes) == PROVENANCE['sceneCount'], 'sceneCount')
    same(PROVENANCE['before'], parent_scenes[0].get('extras'), 'parentSceneProvenance')
    same(PROVENANCE['sceneName'], parent_scenes[0].get('name'), 'parentSceneName')
    same(PROVENANCE['sceneRootNames'], parent_scenes[0].get('nodes'), 'parentSceneRoots')
    same(PROVENANCE['assetMetadata'], p.get('asset'), 'parentAssetMetadata')
    expected_scenes = [{**parent_scenes[0], 'extras': PROVENANCE['after']}]
    same(expected_scenes, candidate_scenes, 'sceneMetadata')
    for name in sorted(set(pn) & set(cn)):
        same(without(pn[name], {'mesh', 'children'}), without(cn[name], {'mesh', 'children'}), 'retainedNode', node=name)

    pi, pt = texture_graph(p, parent_bytes, po)
    ci, ct = texture_graph(c, candidate_bytes, co)
    same(sorted(pi), sorted(ci), 'imageIdentities')
    same(sorted(map(token, p.get('samplers', []))), sorted(map(token, c.get('samplers', []))), 'samplerDefinitions')
    same(sorted(map(token, pt)), sorted(map(token, ct)), 'textureWiring')
    for name in sorted(pi.keys() & ci.keys()):
        a, b = pi[name], ci[name]
        same(a['meta'], b['meta'], 'imageMetadata', image=name)
        same(a['viewMeta'], b['viewMeta'], 'imageViewMetadata', image=name)
        if a['data'] != b['data']:
            first = next((i for i, (x, y) in enumerate(zip(a['data'], b['data'])) if x != y), min(len(a['data']), len(b['data'])))
            errors.append({'code': 'imageBytes', 'image': name, 'byte': first,
                           'parentBinOffset': a['origin']-po+first, 'candidateBinOffset': b['origin']-co+first,
                           'parentFileOffset': a['origin']+first, 'candidateFileOffset': b['origin']+first,
                           'parentHex': a['data'][first:first+1].hex(), 'candidateHex': b['data'][first:first+1].hex(),
                           'parentEncodedSha256': sha(a['data']), 'candidateEncodedSha256': sha(b['data'])})
    pm, cm = unique_named(p['materials'], 'material'), unique_named(c['materials'], 'material')
    same(sorted(pm), sorted(cm), 'materialIdentities')
    for name in sorted(pm.keys() & cm.keys()):
        same(material_definition(pm[name], pt), material_definition(cm[name], ct), 'materialDefinition', material=name)

    mesh_forward, mesh_reverse, acc_forward, acc_reverse = {}, {}, {}, {}
    def bind_reference(a, b, forward, reverse, kind, name):
        if (a in forward and forward[a] != b) or (b in reverse and reverse[b] != a):
            errors.append({'code': 'retainedSharingChanged', 'kind': kind, 'node': name, 'parentIndex': a, 'candidateIndex': b})
        forward[a], reverse[b] = b, a

    comparisons, differences = 0, 0
    for name in sorted(set(pn) & set(cn)):
        if 'mesh' not in pn[name]:
            continue
        pmi, cmi = pn[name]['mesh'], cn[name]['mesh']
        bind_reference(pmi, cmi, mesh_forward, mesh_reverse, 'mesh', name)
        a, b = ref(p['meshes'], pmi, 'mesh'), ref(c['meshes'], cmi, 'mesh')
        same(without(a, {'primitives'}), without(b, {'primitives'}), 'retainedMesh', node=name)
        if len(a['primitives']) != len(b['primitives']):
            errors.append({'code': 'retainedPrimitiveCount', 'node': name})
            continue
        for number, (ap, bp) in enumerate(zip(a['primitives'], b['primitives'])):
            same(without(ap, {'attributes', 'indices', 'material'}), without(bp, {'attributes', 'indices', 'material'}),
                 'retainedPrimitive', node=name, primitive=number)
            same(ref(p['materials'], ap['material'], 'material')['name'], ref(c['materials'], bp['material'], 'material')['name'],
                 'materialAssignment', node=name, primitive=number)
            same(sorted(ap['attributes']), sorted(bp['attributes']), 'attributeSet', node=name, primitive=number)
            same('indices' in ap, 'indices' in bp, 'indexPresence', node=name, primitive=number)
            pairs = [(key, ap['attributes'][key], bp['attributes'][key]) for key in sorted(ap['attributes'].keys() & bp['attributes'].keys())]
            if 'indices' in ap and 'indices' in bp:
                pairs.append(('indices', ap['indices'], bp['indices']))
            for semantic, ai, bi in pairs:
                bind_reference(ai, bi, acc_forward, acc_reverse, 'accessor', name)
                av, bv = accessor(p, parent_bytes, po, ai), accessor(c, candidate_bytes, co, bi)
                context = {'node': name, 'mesh': a.get('name'), 'primitive': number, 'semantic': semantic,
                           'parentAccessor': ai, 'candidateAccessor': bi}
                same(av['meta'], bv['meta'], 'accessorMetadata', **context)
                same(av['viewMeta'], bv['viewMeta'], 'accessorViewMetadata', **context)
                comparisons += 1
                if av['data'] == bv['data']:
                    continue
                if (av['size'], av['width'], av['count']) != (bv['size'], bv['width'], bv['count']):
                    errors.append({'code': 'accessorPayloadLayoutChanged', **context})
                    continue
                for offset in range(0, len(av['data']), av['size']):
                    ah, bh = av['data'][offset:offset+av['size']], bv['data'][offset:offset+bv['size']]
                    if ah == bh:
                        continue
                    vertex, component = divmod(offset // av['size'], av['width'])
                    differences += 1
                    if differences <= 128:
                        pf = av['origin'] + vertex*av['stride'] + component*av['size']
                        cf = bv['origin'] + vertex*bv['stride'] + component*bv['size']
                        errors.append({'code': 'retainedAccessorBytes', **context, 'vertex': vertex, 'component': component,
                                       'parentBinOffset': pf-po, 'candidateBinOffset': cf-co,
                                       'parentFileOffset': pf, 'candidateFileOffset': cf,
                                       'parentHex': ah.hex(), 'candidateHex': bh.hex()})
    if differences > 128:
        errors.append({'code': 'additionalRetainedByteDifferences', 'omitted': differences-128})

    def primitive_triangles(node, label):
        mesh = ref(c['meshes'], node['mesh'], 'mesh')
        require(len(mesh['primitives']) == 1, 'onePrimitivePerLeaf', node=label)
        primitive = mesh['primitives'][0]
        require(set(primitive) <= {'attributes', 'indices', 'material', 'mode'} and primitive.get('mode', 4) == 4,
                'newPrimitiveDefinition', node=label)
        attrs = primitive['attributes']
        require({'POSITION', 'NORMAL', 'TEXCOORD_0'} <= set(attrs) <= {'POSITION', 'NORMAL', 'TEXCOORD_0', 'COLOR_0'},
                'newAttributeSet', node=label)
        position = accessor(c, candidate_bytes, co, attrs['POSITION'])
        for semantic, ai in attrs.items():
            item = accessor(c, candidate_bytes, co, ai)
            require(item['count'] == position['count'], 'attributeCount', node=label, semantic=semantic)
        if 'indices' in primitive:
            item = accessor(c, candidate_bytes, co, primitive['indices'])
            require(item['meta']['type'] == 'SCALAR' and item['meta']['componentType'] in (5121,5123,5125)
                    and not item['meta'].get('normalized', False), 'indexLayout', node=label)
            fmt = {1: 'B', 2: 'H', 4: 'I'}[item['size']]
            require(max(v[0] for v in struct.iter_unpack('<'+fmt, item['data'])) < position['count'], 'indexRange', node=label)
            count = item['count']
        else:
            count = position['count']
        require(count > 0 and count % 3 == 0, 'triangleCount', node=label)
        return count // 3, primitive

    stage_rows, stage_main, stage_shadow, stage_placed = [], 0, 0, 0
    for name, row in rows.items():
        node = cn[name]
        require(set(node) <= {'name','mesh','extras','matrix','translation','rotation','scale'}, 'newNodeData', node=name)
        require('matrix' not in node or not set(node) & {'translation','rotation','scale'}, 'newNodeTransform', node=name)
        for key, count in [('matrix',16),('translation',3),('rotation',4),('scale',3)]:
            if key in node:
                require(isinstance(node[key], list) and len(node[key]) == count
                        and all(type(v) in (int,float) and math.isfinite(v) for v in node[key]), 'newNodeTransform', node=name, field=key)
        expected = {'assetId': row['assetId'], 'role': row['role'], 'occluder': True, 'transparent': False,
                    'nocast': not row['castShadow'], 'receiveShadow': row['receiveShadow']}
        same(expected, node.get('extras'), 'newRowFlags', node=name)
        mesh = ref(c['meshes'], node['mesh'], 'mesh')
        require(set(mesh) <= {'name','primitives'}, 'newMeshData', node=name)
        triangles, primitive = primitive_triangles(node, name)
        material = ref(c['materials'], primitive['material'], 'material')
        same(row['material'], material['name'], 'newRowMaterial', node=name)
        same(row['alphaMode'], material.get('alphaMode','OPAQUE'), 'newRowAlpha', node=name)
        same(row['doubleSided'], material.get('doubleSided',False), 'newRowSidedness', node=name)
        require(triangles <= row['uniqueTriangles'] and triangles <= row['placedTriangles'], 'rowTriangleCeiling', node=name,
                triangles=triangles, uniqueCeiling=row['uniqueTriangles'], placedCeiling=row['placedTriangles'])
        main, shadow = 1, int(row['castShadow'])
        require(main <= row['mainCalls'] and shadow <= row['shadowCalls'] and main+shadow <= row['refreshCalls'], 'rowCallCeiling', node=name)
        require(triangles <= row['mainTriangles'] and triangles*shadow <= row['shadowTriangles']
                and triangles*(main+shadow) <= row['refreshTriangles'], 'rowTrianglePassCeiling', node=name)
        stage_main += main; stage_shadow += shadow; stage_placed += triangles
        stage_rows.append({'node': name, 'triangles': triangles, 'main': main, 'shadow': shadow})
    ceilings = CONTRACT['stageCeilings']
    require(stage_main <= ceilings['main'] and stage_main+stage_shadow <= ceilings['refresh']
            and stage_placed <= ceilings['placed'], 'stageCeiling')
    leaves = [n for n in c['nodes'] if 'mesh' in n]
    require(len(leaves) == CONTRACT['counts']['resultLeaves'], 'resultLeafCount')
    require({n['mesh'] for n in leaves} == set(range(len(c['meshes']))), 'unreferencedMesh')
    ids = {n.get('extras', {}).get('assetId') for n in leaves}
    expected_ids = {a['id'] for a in INVENTORY['assets']} - {CONTRACT['counts']['remainingMissingId']}
    require(ids == expected_ids and len(ids) == CONTRACT['counts']['resultCurrentAssetIds'], 'resultAssetIds')
    proxies = [n['name'] for n in leaves if n.get('extras', {}).get('proxy') or '__proxy' in n['name']]
    contacts = [n['name'] for n in leaves if n.get('extras', {}).get('assetId') == 'contact_decals']
    require(len(proxies) == CONTRACT['counts']['remainingProxyLeaves'] and len(contacts) == CONTRACT['counts']['provisionalContactLeaves'], 'remainingProxyOrContactCount')
    total_triangles = sum(primitive_triangles(n, n['name'])[0] for n in leaves)
    require(total_triangles <= PROFILE['guards']['maxPlacedTriangles'] and len(leaves) <= PROFILE['guards']['maxPrimitiveInstances'], 'globalProfileGuard')
    report['metrics'] = {'retainedLeaves': len(leaves)-len(rows), 'retainedAccessorComparisons': comparisons,
                         'retainedComponentDifferences': differences, 'leaves':len(leaves), 'assetIds':len(ids),
                         'remainingProxies':len(proxies), 'provisionalContacts':len(contacts), 'placedTriangles':total_triangles,
                         'stageMainCallsEstimate':stage_main, 'stageShadowCallsEstimate':stage_shadow,
                         'stageRefreshCallsEstimate':stage_main+stage_shadow, 'stagePlacedTriangles':stage_placed,
                         'rows':stage_rows, 'rendererDrawMeasurements':False}


def audit_m4_transition(parent_bytes: bytes, candidate_bytes: bytes) -> dict:
    """Return JSON-safe evidence; no filesystem access, mutations or restoration."""
    report = {'valid': False, 'parentSha256': sha(parent_bytes), 'candidateSha256': sha(candidate_bytes),
              'errors': [], 'mappingSha256': MAPPING_SHA, 'sceneProvenanceAmendmentSha256': AMENDMENT_SHA,
              'hierarchySourceSha256': SOURCE_SHA,
              'profileSha256': PROFILE_SHA, 'scope': 'transition only; full structural validator and independent review still required'}
    try:
        _audit(parent_bytes, candidate_bytes, report)
    except AuditError as error:
        report['errors'].append(error.detail)
    except (KeyError, IndexError, TypeError, AttributeError, ValueError, OverflowError, struct.error) as error:
        report['errors'].append({'code':'malformedInput', 'message':str(error)})
    report['valid'] = not report['errors']
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidate', type=Path)
    parser.add_argument('--report', required=True, type=Path)
    args = parser.parse_args(argv)
    if args.report.exists():
        parser.exit(2, 'receipt already exists; nothing overwritten\n')
    parent = pinned(KIT / CONTRACT['parent']['glb'], PARENT_SHA)
    result = audit_m4_transition(parent, args.candidate.read_bytes())
    result['helperSha256'] = sha(Path(__file__).read_bytes())
    result['parentManifestSha256'] = MANIFEST_SHA
    result['candidatePath'] = str(args.candidate)
    with args.report.open('x', encoding='utf-8') as output:
        json.dump(result, output, indent=2, allow_nan=False)
        output.write('\n')
    print(json.dumps({'valid':result['valid'], 'errors':len(result['errors']), 'report':str(args.report)}))
    return 0 if result['valid'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
