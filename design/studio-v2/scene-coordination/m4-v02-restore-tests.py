"""Focused writer checks: pinned inputs, reachable structural/word guards, exclusive output.

No Blender, asset writes, temporary files, or source mutations. Hash bypasses
below exist only in test-local mocks so deeper preconditions are exercised.
"""
import copy
import importlib.util
import io
import json
from unittest.mock import patch
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('m4_restorer', HERE / 'm4-v02-restore.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
parent, raw = mod.PARENT.read_bytes(), mod.RAW.read_bytes()
pd, _ = mod.split(parent)
rd, _ = mod.split(raw)
passed = []


def reject(name, action, expected):
    try:
        action()
    except ValueError as error:
        assert expected in str(error), (name, str(error), expected)
        passed.append(name)
    else:
        raise AssertionError('Negative control unexpectedly passed: ' + name)


out, rows, changes = mod.restore(parent, raw)
assert len(out) == len(raw) == 2206200
assert changes == [662880, 663352, 663484] and len(rows) == 3
assert out[:82684] == raw[:82684]
assert bytes(b for i, b in enumerate(out) if i not in changes) == bytes(b for i, b in enumerate(raw) if i not in changes)
passed.append('real pinned pair changes exactly three bytes; header/JSON/all other bytes preserved')
reject('wrong parent hash', lambda: mod.restore(parent[:-1] + bytes([parent[-1] ^ 1]), raw), 'complete input hashes')
reject('wrong raw hash', lambda: mod.restore(parent, raw[:-1] + bytes([raw[-1] ^ 1])), 'complete input hashes')
reject('swapped pair', lambda: mod.restore(raw, parent), 'complete input hashes')
mod.layout(pd, 64, 67, 409804)
mod.layout(rd, 75, 78, 578604)
passed.append('real parent and raw semantic layout controls pass')


def bad_layout(name, mutation, expected):
    doc = copy.deepcopy(rd)
    mutation(doc)
    reject(name, lambda: mod.layout(doc, 75, 78, 578604), expected)


mesh_index = next(i for i, m in enumerate(rd['meshes']) if m['name'] == 'desk_top__top_mesh.002')
node_index = next(i for i, n in enumerate(rd['nodes']) if n['name'] == 'desk_top__top')
bad_layout('duplicate named desk mesh', lambda d: d['meshes'].append(copy.deepcopy(d['meshes'][mesh_index])), 'unique named desk mesh')
bad_layout('wrong desk node name', lambda d: d['nodes'][node_index].update(name='wrong'), 'unique desk node identity')
bad_layout('duplicate desk mesh user', lambda d: d['nodes'].append(copy.deepcopy(d['nodes'][node_index])), 'unique desk node identity')
bad_layout('wrong UV accessor identity', lambda d: d['meshes'][mesh_index]['primitives'][0]['attributes'].update(TEXCOORD_0=74), 'desk UV accessor identity')
bad_layout('shared UV accessor', lambda d: d['meshes'][0]['primitives'][0]['attributes'].update(TEXCOORD_1=75), 'unique accessor owner')
bad_layout('UV used as index accessor', lambda d: d['meshes'][0]['primitives'][0].update(indices=75), 'not an index accessor')
bad_layout('wrong UV component type', lambda d: d['accessors'][75].update(componentType=5125), 'exact float32 VEC2 accessor layout')
bad_layout('wrong UV count', lambda d: d['accessors'][75].update(count=291), 'exact float32 VEC2 accessor layout')
bad_layout('shared UV buffer view', lambda d: d['accessors'][74].update(bufferView=78), 'unique UV bufferView owner')
bad_layout('shifted UV view', lambda d: d['bufferViews'][78].update(byteOffset=578608), 'exact packed UV view layout')
bad_layout('interleaved UV view', lambda d: d['bufferViews'][78].update(byteStride=12), 'exact packed UV view layout')

for input_name, input_bytes, offset in [('raw', raw, 662880), ('parent', parent, 487544)]:
    altered = bytearray(input_bytes)
    altered[offset] ^= 1
    # Bypass only the complete-file hash check; exercise the actual word guard.
    with patch.object(mod, 'sha', side_effect=[mod.PARENT_SHA, mod.RAW_SHA]):
        reject('wrong ' + input_name + ' word after hash precondition',
               lambda: mod.restore(bytes(altered) if input_name == 'parent' else parent,
                                   bytes(altered) if input_name == 'raw' else raw), 'exact word input/output bytes')
for slot, expected in [(2, 'derived parent BIN offset'), (4, 'derived raw BIN offset'), (5, 'derived file offsets')]:
    changed_words = [list(row) for row in mod.WORDS]
    changed_words[0][slot] += 4
    with patch.object(mod, 'WORDS', changed_words):
        reject('incorrect expected offset field ' + str(slot), lambda: mod.restore(parent, raw), expected)


class MemoryPath:
    """Tests the exclusive writer without creating/deleting filesystem artifacts."""
    def __init__(self, existing=False, race=False):
        self.existing, self.race, self.opened = existing, race, False
        self.data = b'sentinel' if existing else None

    def exists(self):
        return self.existing

    def open(self, mode):
        assert mode == 'xb'
        self.opened = True
        if self.existing or self.race:
            raise FileExistsError('exclusive creation')
        owner = self

        class Stream(io.BytesIO):
            def close(self):
                owner.data = self.getvalue()
                super().close()
        return Stream()


for which in ('output', 'receipt'):
    a, b = MemoryPath(which == 'output'), MemoryPath(which == 'receipt')
    reject('existing ' + which + ' refuses both writes', lambda: mod.write_fresh(a, b, b'glb', b'json'), 'Refusing overwrite')
    assert not a.opened and not b.opened
    assert (a if which == 'output' else b).data == b'sentinel'
a, b = MemoryPath(), MemoryPath()
mod.write_fresh(a, b, b'glb', b'json')
assert a.data == b'glb' and b.data == b'json'
passed.append('fresh exclusive paired output succeeds')
for which in ('output', 'receipt'):
    a, b = MemoryPath(race=which == 'output'), MemoryPath(race=which == 'receipt')
    try:
        mod.write_fresh(a, b, b'glb', b'json')
    except FileExistsError:
        assert a.data in (None, b'') and b.data is None
        passed.append(which + ' creation race cannot overwrite or write asset content')
    else:
        raise AssertionError('Race unexpectedly accepted')

report = {'scope': 'Writer-focused checks, not independent review. All mutations are in memory.',
          'restorerSha256': mod.sha((HERE / 'm4-v02-restore.py').read_bytes()),
          'testSha256': mod.sha(Path(__file__).read_bytes()),
          'passedCount': len(passed), 'passed': passed,
          'knownIoLimit': 'A receipt creation race may leave an empty newly created output; no automatic rollback or retry.'}
with (HERE / 'm4-v02-restore-tests.json').open('x', encoding='utf-8', newline='\n') as target:
    target.write(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
