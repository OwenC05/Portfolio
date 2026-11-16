"""V04 source-to-rows preparation, never independent candidate verification.

No author module is loaded at import. The orchestration caller must supply exact
author-ready byte pins before calling load_pinned_helper. Semantic rows are
author-owned; this producer copies their identities, never invents classes or
support intent. Invocation and complete input bytes accompany each product.
"""
import copy
import hashlib
import json
import math
import re
import types
from pathlib import Path


class PreparationError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise PreparationError(message)


def canonical_bytes(value):
    """Same finite Python JSON encoding as interface 3; no rounding/filtering."""
    def check(item):
        kind = type(item)
        if item is None or kind in (str, bool, int):
            return
        if kind is float:
            require(math.isfinite(item), 'nonfinite JSON component')
        elif kind is list:
            for child in item:
                check(child)
        elif kind is dict:
            for key, child in item.items():
                require(type(key) is str, 'non-string JSON key')
                check(child)
        else:
            raise PreparationError('not a JSON-native value')
    try:
        check(value)
        return json.dumps(value, sort_keys=True, separators=(',', ':'),
                          ensure_ascii=False, allow_nan=False).encode('utf-8')
    except (RecursionError, UnicodeError) as error:
        raise PreparationError('unencodable JSON payload') from error


def sha_bytes(raw):
    require(type(raw) is bytes, 'source must be actual bytes')
    return hashlib.sha256(raw).hexdigest()


def payload_sha256(value):
    return sha_bytes(canonical_bytes(value))


def check_source_pin(raw, expected):
    require(type(expected) is str and re.fullmatch('[0-9a-f]{64}', expected),
            'missing independently supplied author-ready source pin')
    require(sha_bytes(raw) == expected, 'author-ready source pin mismatch')


def load_pinned_helper(raw, expected_sha256, filename):
    """Execute the already captured, hash-checked helper bytes, not a reread."""
    check_source_pin(raw, expected_sha256)
    module = types.ModuleType('pinned_m4_v04_geometry')
    module.__file__ = str(filename)
    exec(compile(raw, str(filename), 'exec'), module.__dict__)
    return module


def parse_pinned_author(raw, expected_sha256):
    check_source_pin(raw, expected_sha256)
    def pairs(items):
        result = {}
        for key, value in items:
            require(key not in result, 'duplicate author JSON key: ' + key)
            result[key] = value
        return result
    result = json.loads(raw, object_pairs_hook=pairs)
    canonical_bytes(result)
    return result


def validate_pose(pose):
    require(type(pose) is dict and set(pose) == {'cx', 'cy', 'yaw'}, 'pose needs exactly cx/cy/yaw')
    require(all(type(x) in (int, float) and math.isfinite(x) for x in pose.values()), 'invalid pose number')
    require(1.325 <= pose['cx'] <= 1.40 and pose['cy'] in (-.825, -.80)
            and -.95 <= pose['yaw'] <= -.85, 'pose outside root released range')
    return copy.deepcopy(pose)


def validate_pose_options(options):
    require(type(options) is list and 1 <= len(options) <= 24, 'expected 1..24 explicit author poses')
    poses = [validate_pose(p) for p in options]
    require(len({payload_sha256(p) for p in poses}) == len(poses), 'duplicate explicit pose')
    require({'cx': 1.325, 'cy': -.825, 'yaw': -.85} in poses, 'old pose reference missing')
    require(len({p['cx'] for p in poses}) <= 4 and len({p['yaw'] for p in poses}) <= 3,
            'more than four x or three yaw samples')
    return poses  # Never expand, rank, optimize or select this table.


def unique_records(records, description):
    require(type(records) is list, description + ' must be a list')
    out = {}
    for record in records:
        require(type(record) is dict and type(record.get('id')) is str and record['id'].strip(),
                'missing ' + description + ' identity')
        require(record['id'] not in out, 'duplicate ' + description + ' identity')
        out[record['id']] = record
    return out


def snapshot_rows(parts, authored_rows, corner_normals):
    """Convert a Part snapshot using explicit authored identities and scope.

    Raw class nulls remain visible in rawFaceClasses; only an explicit authored
    out_of_scope class and reason may accompany them. No normal-derived labels.
    Raw primitive labels/ranges and UV rules are retained in the complete payload.
    """
    specs = unique_records(authored_rows, 'row')
    require(set(parts) == set(specs), 'author/helper row set mismatch')
    rows = {}
    allowed = {'planar', 'round', 'bevel:casing', 'bevel:white_key_lip', 'out_of_scope'}
    for name, part in parts.items():
        spec = specs[name]
        require(part.row == name, 'Part row identity mismatch')
        vertices = [[float(x) for x in vertex] for vertex in part.v]
        require(all(len(v) == 3 for v in vertices), 'non-XYZ vertex')
        faces = [list(face) for face, _ in part.f]
        require(spec.get('vertexCount') == len(vertices) and spec.get('faceCount') == len(faces),
                name + ': declared counts differ')
        require(all(type(v) is int and 0 <= v < len(vertices) for f in faces for v in f)
                and all(len(f) >= 3 for f in faces), name + ': invalid source face')
        classes = spec.get('faceClasses')
        require(type(classes) is list and len(classes) == len(faces) and len(part.cls) == len(faces),
                name + ': incomplete class coverage')
        require(all(type(c) is str and c in allowed for c in classes), name + ': unknown class')
        for raw, declared in zip(part.cls, classes):
            require(raw == declared or (raw is None and declared == 'out_of_scope'),
                    name + ': author/source class mismatch')
        groups = unique_records(spec.get('groups'), name + '/group')
        vc, fc = [0]*len(vertices), [0]*len(faces)
        raw_groups = [{'label': label, 'vertexRange': [v0, v1], 'faceRange': [f0, f1]}
                      for label, v0, v1, f0, f1 in part.groups]
        locators = [(tuple(g['vertexRange']), tuple(g['faceRange'])) for g in raw_groups]
        require(len(set(locators)) == len(locators) == len(groups), name + ': ambiguous primitive coverage')
        require(type(spec.get('normalsRequired')) is bool, name + ': missing normal scope')
        used = set()
        for group in groups.values():
            vr, fr = group.get('vertexRange'), group.get('faceRange')
            require(type(vr) is list and len(vr) == 2 and type(fr) is list and len(fr) == 2,
                    name + ': missing primitive ranges')
            require(all(type(x) is int for x in vr+fr), name + ': invalid primitive range index')
            locator = (tuple(vr), tuple(fr))
            require(locator in locators and locator not in used, name + ': changed/duplicate primitive locator')
            used.add(locator)
            require(0 <= vr[0] < vr[1] <= len(vertices) and 0 <= fr[0] < fr[1] <= len(faces),
                    name + ': range out of bounds')
            require(group.get('triangleCount') == sum(len(f)-2 for f in faces[fr[0]:fr[1]]),
                    name + ': triangle count mismatch')
            require(group.get('n1') in ('in_scope', 'out_of_scope') and
                    type(group.get('reason')) is str and group['reason'].strip(), name + ': missing semantic scope/reason')
            if group['n1'] == 'in_scope':
                require(spec['normalsRequired'], name + ': unverified normal scope')
            for vi in range(*vr):
                vc[vi] += 1
            for fi in range(*fr):
                fc[fi] += 1
                require(all(vr[0] <= v < vr[1] for v in faces[fi]), name + ': face crosses primitive vertices')
                require((classes[fi] != 'out_of_scope') == (group['n1'] == 'in_scope'),
                        name + ': class scope mismatch')
        require(all(n == 1 for n in vc+fc), name + ': incomplete/overlapping semantic coverage')
        normals = corner_normals(part)
        require(set(normals) == {(fi, v) for fi, face in enumerate(faces) for v in face},
                name + ': authored corner normal correspondence mismatch')
        row = {'vertices': vertices, 'faces': faces, 'groups': copy.deepcopy(spec['groups']),
               'faceClasses': list(classes), 'rawFaceClasses': list(part.cls), 'rawGroups': raw_groups,
               'uvRules': [rule for _, rule in part.f],
               'cornerNormals': [[[float(x) for x in normals[(fi, v)]] for v in face]
                                 for fi, face in enumerate(faces)],
               'asset': part.asset, 'material': part.mat, 'casts': part.casts, 'ceiling': part.ceiling}
        # v04 author additions are source identity, not inferred verifier classes.
        for attribute, key, length in (('ids','rawGroupIds',len(part.groups)),
                                       ('roles','rawFaceRoles',len(faces)),
                                       ('runs','rawRoundRuns',len(faces))):
            if hasattr(part, attribute):
                values = list(getattr(part, attribute))
                require(len(values) == length, name + ': incomplete ' + attribute)
                row[key] = values
        if hasattr(part, 'ids'):
            require(list(part.ids) == [g['id'] for g in spec['groups']], name + ': raw stable group identity mismatch')
            require([g['label'] for g in spec['groups']] == [g[0] for g in part.groups],
                    name + ': raw group label mismatch')
        require(all(len(n) == 3 for f in row['cornerNormals'] for n in f), name + ': invalid normal shape')
        canonical_bytes(row)
        rows[name] = row
    return rows


def provisional_product(rows, semantic_declaration, source_bytes, invocation):
    """Create an identity-bound product, explicitly NOT an independent freeze."""
    require(type(source_bytes) is dict and {'helper', 'authorDeclarations', 'producer'} <= set(source_bytes),
            'helper, author declarations and actual producer bytes required')
    require(type(invocation) is dict and invocation.get('entrypoint') and 'pose' in invocation,
            'named producer entrypoint and exact pose invocation required')
    validate_pose(invocation['pose'])
    declaration = copy.deepcopy(semantic_declaration)
    require(declaration.get('schema') == 'm4-source-declaration/3', 'interface3 semantics required')
    require(declaration.get('scope') in ('fixture', 'candidate'), 'explicit scope required')
    for field in ('rows', 'supports', 'surfaces'):
        unique_records(declaration.get(field), field)
    declaration['sources'] = {name: sha_bytes(raw) for name, raw in source_bytes.items()}
    declaration['rowsSha256'] = payload_sha256(rows)
    declaration['producerInvocation'] = copy.deepcopy(invocation)
    return {'rows': rows, 'declaration': declaration,
            'provenance': {'sourceSha256': copy.deepcopy(declaration['sources']),
                           'rowsSha256': declaration['rowsSha256'],
                           'declarationSha256': payload_sha256(declaration),
                           'invocationSha256': payload_sha256(invocation),
                           'invocation': copy.deepcopy(invocation),
                           'independentExpectedDigestFreeze': False,
                           'candidateAcceptance': False,
                           'status': 'provisional producer identity; root freeze and independent review pending'}}


def check_helper_pose_table(helper, author):
    expected = [dict(id=pose_id, **pose) for pose_id,pose in zip(author['poseOptionIds'],author['poseOptions'])]
    require(helper.POSE_OPTIONS == expected and helper.SELECTED_POSE == author['selectedPose']
            and helper.SELECTED_POSE_STATUS == author['selectedPoseStatus'],
            'helper/declaration explicit pose interface differs')


def ready_author(helper_path, helper_pin, author_path, author_pin):
    """Capture and verify both ready inputs before any helper execution."""
    helper_bytes, author_bytes = Path(helper_path).read_bytes(), Path(author_path).read_bytes()
    check_source_pin(helper_bytes, helper_pin)
    author = parse_pinned_author(author_bytes, author_pin)
    require(author.get('schema') == 'm4-source-declaration/3' and author.get('scope') == 'candidate',
            'expected candidate author interface 3')
    require(author.get('sources') == {'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py':helper_pin},
            'author helper identity mismatch')
    poses = validate_pose_options(author.get('poseOptions'))
    ids = author.get('poseOptionIds')
    require(type(ids) is list and len(ids) == len(poses) and len(set(ids)) == len(ids)
            and all(type(i) is str and i for i in ids), 'explicit unique pose IDs required')
    validate_pose(author.get('selectedPose'))
    require(author['selectedPose'] in poses, 'selected pose absent from explicit author table')
    for field in ('rows','surfaces','supports','attachments','seatings','roundRuns','edgeSets'):
        unique_records(author.get(field), field)
    require(len(author['seatings']) == 4, 'four exact inlay declarations required')
    helper = load_pinned_helper(helper_bytes, helper_pin, helper_path)
    check_helper_pose_table(helper, author)
    return helper, author, {'helper':helper_bytes, 'authorDeclarations':author_bytes,
                           'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py':helper_bytes}


def produce_selected(helper_path, helper_pin, author_path, author_pin):
    """Named deterministic selected-pose producer; writes nothing and never audits."""
    helper, author, inputs = ready_author(helper_path, helper_pin, author_path, author_pin)
    require(type(author.get('selectedPoseStatus')) is str and
            not author['selectedPoseStatus'].lower().startswith('provisional'), 'selected pose still provisional')
    parts, meta = helper.build_all(author['selectedPose'])
    require(meta['pose'] == author['selectedPose'], 'built pose differs')
    rows = snapshot_rows(parts, author['rows'], helper.corner_normals)
    inputs['producer'] = Path(__file__).read_bytes()
    invocation = {'entrypoint':'produce_fullkit_m4_v04.produce_selected',
                  'helperPath':'asset-pipeline/full-kit/source/build_fullkit_m4_geometry_v04.py',
                  'helperSha256':helper_pin,
                  'authorPath':'asset-pipeline/full-kit/manifests/m4-v04-author-declarations.json',
                  'authorSha256':author_pin,'pose':author['selectedPose']}
    return provisional_product(rows, author, inputs, invocation)
