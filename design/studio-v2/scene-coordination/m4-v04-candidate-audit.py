"""One root-authorized v04 source audit; never run a producer or export.

Refuses an existing receipt or report. Pins originate in the externally hashed
root freeze. All source aliases are actual captured bytes, not hash strings.
"""
import ctypes
import hashlib
import json
import platform
from pathlib import Path
import sys
import time
import traceback
import types
from datetime import datetime, timezone

HERE = Path(__file__).resolve().parent
STUDIO = HERE.parent
FREEZE = HERE / 'm4-v04-root-expected-pins.json'
FREEZE_SHA = '48d7925416bd1ffab4ddfed0935f18ef074522d23c6a678af150fa3d6351ef72'
RECEIPT = HERE / 'm4-v04-candidate-audit.json'
REPORT = HERE / 'm4-v04-candidate-audit.md'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def canonical(value):
    return json.dumps(value,sort_keys=True,separators=(',', ':'),ensure_ascii=False,allow_nan=False).encode('utf-8')


def ram():
    class Memory(ctypes.Structure):
        _fields_=[('length',ctypes.c_ulong),('load',ctypes.c_ulong),
                  ('totalPhysical',ctypes.c_ulonglong),('availablePhysical',ctypes.c_ulonglong),
                  ('totalPage',ctypes.c_ulonglong),('availablePage',ctypes.c_ulonglong),
                  ('totalVirtual',ctypes.c_ulonglong),('availableVirtual',ctypes.c_ulonglong),
                  ('availableExtendedVirtual',ctypes.c_ulonglong)]
    status=Memory();status.length=ctypes.sizeof(status)
    if not ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status)):
        raise OSError('GlobalMemoryStatusEx failed')
    return {'availablePhysicalBytes':status.availablePhysical,'totalPhysicalBytes':status.totalPhysical}


def main():
    if len(sys.argv)!=1:
        raise ValueError('No arguments or repeat mode supported')
    if RECEIPT.exists() or REPORT.exists():
        raise FileExistsError('Audit evidence already exists; no implicit repeat or overwrite')
    freeze_raw=FREEZE.read_bytes()
    assert sha(freeze_raw)==FREEZE_SHA,'external root freeze identity mismatch'
    freeze=json.loads(freeze_raw)
    assert freeze['authoritativeFreeze'] is True and freeze['candidateAcceptance'] is False
    paths={};captured={};pins={}
    def capture(relative,expected):
        path=STUDIO/relative
        raw=path.read_bytes()
        assert sha(raw)==expected,'file pin mismatch: '+relative
        paths[relative]=path;captured[relative]=raw;pins[relative]=expected
        return raw
    capture('scene-coordination/m4-v04-root-expected-pins.json',FREEZE_SHA)
    for field in ('technicalReview','sourceIntentReview','verifier'):
        record=freeze[field];capture(record['path'],record['sha256'])
    capture('scene-coordination/m4-v04-independent-expected-pins-proposal.json',freeze['proposalSha256'])
    for path,pin in freeze['artifactBytePins'].items():capture(path,pin)
    capture('asset-pipeline/full-kit/source/build_fullkit_m4_v04.py',freeze['provenanceNotes']['heldBuilderSha256'])
    capture('scene-m4-v04-preparation-report.md',freeze['provenanceNotes']['proseOnlyAuthorReportSuccessorSha256'])
    assert set(freeze['sources'])==set(freeze['sourcePaths'])
    source_bytes={alias:capture(freeze['sourcePaths'][alias],pin) for alias,pin in freeze['sources'].items()}
    rows=json.loads(captured['asset-pipeline/full-kit/manifests/m4-v04-rows.json'])
    declaration=json.loads(captured['asset-pipeline/full-kit/manifests/m4-v04-verifier-declaration.json'])
    observed={'rowsSha256':sha(canonical(rows)),'declarationSha256':sha(canonical(declaration)),
              'invocationSha256':sha(canonical(declaration['producerInvocation']))}
    assert all(observed[k]==freeze[k] for k in observed),'canonical input identity mismatch'
    assert declaration['rowsSha256']==freeze['rowsSha256']
    assert declaration['sources']==freeze['sources']
    assert declaration['producerInvocation']==freeze['producerInvocation']
    verifier=types.ModuleType('independent_root_pinned_m4_v3r1')
    verifier.__file__=str(STUDIO/freeze['verifier']['path'])
    exec(compile(captured[freeze['verifier']['path']],verifier.__file__,'exec'),verifier.__dict__)
    assert freeze['verifier']['entrypoint']=='audit_m4_v3'
    resources=ram()
    assert resources['availablePhysicalBytes']>=512*1024**2,'insufficient free physical RAM for bounded source audit'
    receipt={'schema':'m4-v04-root-pinned-candidate-source-audit/1','startedAt':datetime.now(timezone.utc).isoformat(),
             'status':'running; do not repeat automatically','auditInvocations':0,'candidateAcceptance':False,
             'rootFreezeSha256':FREEZE_SHA,'fileBytePins':pins,'canonicalInputPins':observed,
             'sourceAliases':{alias:{'path':freeze['sourcePaths'][alias],'sha256':sha(raw),'byteLength':len(raw)} for alias,raw in source_bytes.items()},
             'invocation':{'entrypoint':'audit_m4_v3','verifierPath':freeze['verifier']['path'],
                           'verifierSha256':freeze['verifier']['sha256'],
                           'expected_declaration_sha256':freeze['declarationSha256'],
                           'expectedValueOrigin':'independently hash-checked root-owned freeze, not the declaration being audited',
                           'source_bytes':'actual captured bytes for the exact four declared aliases'},
             'resourceBefore':resources,'runtime':{'python':platform.python_version(),'numpy':verifier.np.__version__},
             'runnerSha256':sha(Path(__file__).read_bytes()),'verifierResult':None,'exception':None,
             'limits':['Source audit only; no export, GLB correspondence, visual or product acceptance.',
                       'This API checks identity/coverage, support geometry and normal validity; attachments, inlays, edges and budgets retain separate reviewed evidence.',
                       'Author report successor is authorized prose-only provenance; the original measured report is not a source_bytes alias.']}
    # Reserve the new receipt exclusively before the sole audit call.
    with RECEIPT.open('x',encoding='utf-8',newline='\n') as stream:
        json.dump(receipt,stream,indent=2,allow_nan=False);stream.write('\n')
    start=time.perf_counter()
    try:
        receipt['auditInvocations']=1
        result=verifier.audit_m4_v3(rows,declaration,
            expected_declaration_sha256=freeze['declarationSha256'],source_bytes=source_bytes)
        json.dumps(result,allow_nan=False)
        receipt['verifierResult']=result
        assert result['candidateAcceptance'] is False
        receipt['status']='PASS' if result['valid'] else 'FAIL'
    except Exception as error:
        receipt['status']='EXCEPTION'
        receipt['exception']={'type':type(error).__name__,'message':str(error),'traceback':traceback.format_exc()}
    finally:
        receipt['elapsedSeconds']=time.perf_counter()-start
        receipt['canonicalInputsUnchanged']=(sha(canonical(rows))==freeze['rowsSha256'] and
                                               sha(canonical(declaration))==freeze['declarationSha256'])
        receipt['sourceBytesUnchanged']=all(sha(raw)==freeze['sources'][alias] for alias,raw in source_bytes.items())
        receipt['filePinsUnchanged']={path:sha(paths[path].read_bytes())==pin for path,pin in pins.items()}
        receipt['resourceAfter']=ram()
        if not (receipt['canonicalInputsUnchanged'] and receipt['sourceBytesUnchanged'] and all(receipt['filePinsUnchanged'].values())):
            receipt['status']='INPUT_DRIFT'
        with RECEIPT.open('w',encoding='utf-8',newline='\n') as stream:
            json.dump(receipt,stream,indent=2,allow_nan=False);stream.write('\n')
    result=receipt['verifierResult'] or {}
    supports=result.get('supportGeometry',{}).get('supports',{})
    normals=result.get('normalValidity',{}).get('rows',{})
    summary={'coverageValid':result.get('coverage',{}).get('valid'),
             'supportGeometryValid':result.get('supportGeometry',{}).get('valid'),'supportCount':len(supports),
             'normalValidityValid':result.get('normalValidity',{}).get('valid'),
             'checkedNormalRows':sum(r.get('status')=='checked' for r in normals.values()),
             'explicitlyOutOfScopeNormalRows':sum(r.get('status')=='explicitly_out_of_scope' for r in normals.values()),
             'planarTriangles':sum(r.get('planarTriangles',0) for r in normals.values()),
             'maxPlanarCornerDegrees':max((r.get('maxPlanarCornerDegrees',0) for r in normals.values()),default=None),
             'errors':{section:result.get(section,{}).get('errors',[]) for section in ('coverage','supportGeometry','normalValidity')}}
    receipt_sha=sha(RECEIPT.read_bytes())
    report=f'''# M4 v04 root-pinned candidate source audit

**{receipt['status']} — one authorized `audit_m4_v3` invocation.** `candidateAcceptance` remains **false** by verifier design. This is source-binding, complete declared coverage, support-geometry and normal-validity evidence; it does not release export or accept images/product behavior.

Root freeze: `m4-v04-root-expected-pins.json`, SHA256 `{FREEZE_SHA}`. The external expected declaration digest was read only after verifying that freeze; it was not derived from the candidate in the same assertion. All frozen artifact/source byte pins, canonical rows/declaration/invocation hashes and verifier bytes passed before execution. The exact four source aliases were supplied as captured bytes. The held builder was read only for hashing.

Verifier: `{freeze['verifier']['path']}`, SHA256 `{freeze['verifier']['sha256']}`. Expected declaration: `{freeze['declarationSha256']}`. Rows canonical digest: `{freeze['rowsSha256']}`. Invocation canonical digest: `{freeze['invocationSha256']}`.

```json
{json.dumps(summary,indent=2,allow_nan=False)}
```

Fresh available physical RAM immediately before the audit: {resources['availablePhysicalBytes']} bytes. Audit duration: {receipt['elapsedSeconds']:.6f} seconds. Canonical inputs, source bytes and every captured file remained unchanged: {receipt['canonicalInputsUnchanged'] and receipt['sourceBytesUnchanged'] and all(receipt['filePinsUnchanged'].values())}.

The authorized prose-only author report successor `{freeze['provenanceNotes']['proseOnlyAuthorReportSuccessorSha256']}` matched. The historical measured report is not a source alias and was not mistaken for source drift. No producer, writer/verifier suite, contact/ray sweep, full measurement, pose search, Blender or Git operation ran.

The JSON receipt preserves **every verifier claim and structured error**, exact source aliases, all input hashes, the invocation, resource observations and immutability checks. Attachments/inlays/edges/budgets remain covered by the separate approved technical handoff; this API does not re-audit them. Phone framing, surface-contact interpretation, exported-normal correspondence and all image requirements retain their prior limits.

Receipt: [m4-v04-candidate-audit.json](m4-v04-candidate-audit.json), SHA256 `{receipt_sha}`.
Runner: [m4-v04-candidate-audit.py](m4-v04-candidate-audit.py), SHA256 `{receipt['runnerSha256']}`.
'''
    with REPORT.open('x',encoding='utf-8',newline='\n') as stream:stream.write(report)
    print(json.dumps({'status':receipt['status'],'summary':summary,'receiptSha256':receipt_sha,
                      'reportSha256':sha(REPORT.read_bytes()),'runnerSha256':receipt['runnerSha256']},indent=2))
    return 0 if receipt['status']=='PASS' else 1


if __name__=='__main__':
    raise SystemExit(main())
