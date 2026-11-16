# M4 v03 payload-binding repair: writer change receipt

Writer implementation complete for independent root review; **no implementation, candidate or visual approval**. Only the five assigned v3 successor files were written. Candidate producer integration remains explicitly unsatisfied.

Task `task_89c4c2160e32`, current dispatch `ctx_724054c5b1e7`; ACK `msg_7a3a133a1151`, configuration/concurrency ACK `msg_25b0b7be75ff`. Read root's binding disposition, exclusive task and independent contract review before implementation. Continued in this actual-Codex session with no helper, provider change or restart. Coordinator message `msg_6cde38be0e44` reports selected Codex `gpt-6-astra/high`; the inspected local config reads `gpt-6-astra/xhigh`. These are different observable inputs, not proof of server-effective model or effort.

## Exact successor interface

```python
audit_m4_v3(rows, declaration, *, expected_declaration_sha256, source_bytes)
```

Declaration schema is `m4-source-declaration/3`; interface schema is `m4-verifier-declaration-interface/3`. Required `declaration.rowsSha256` is frozen inside the externally pinned declaration. The caller supplies the separately frozen expected declaration digest and actual source bytes. The pure verifier computes actual digests only; it never updates expected values or writes files.

The complete rows object is encoded using CPython 3.11 `json.dumps(rows, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)` and strict UTF-8 after recursive finite JSON-native validation. Exact built-in dicts with string keys, lists, strings, booleans, integers, finite floats and null are allowed. Every field is bound, including vertices, polygon indices/order, all group metadata, classes, normals and additional fields. Array order and encoder number spellings remain significant; object insertion order does not. Unsupported types, cycles, nonfinite components and invalid UTF-8 strings reject. This Python-specific encoding is explicitly not a claim of RFC 8785 interoperability.

Validation checks declaration/source pins, then payload identity, then the inherited coverage/support/normal predicates. Missing/invalid rows pins, invalid encoding and mismatched payloads reject respectively with `missingOrInvalidRowsPin`, `invalidRowsEncoding`, or `rowsPinMismatch` in `coverage`; support and normal checks remain `not_run`. Existing separate result categories and `candidateAcceptance: false` remain.

## Focused writer evidence

- Final command: `python -B design/studio-v2/scene-coordination/m4-v03-verifier-v3-tests.py --write`.
- Result: **58/58 passing, exit 0**, approximately 0.984 seconds; receipt written exclusively, without overwrite.
- Earlier ordinary run: 58/58 passing, exit 0, approximately 1.015 seconds. No failing verifier-validation run occurred.
- The test file contains 47 literal frozen fixture identity records, plus the standalone missing-rows-pin declaration digest. A separate one-time capture prepared those constants with audit/coverage execution disabled, using the standard-library JSON encoder and SHA256; it performed no verification and wrote no receipt. The committed test caller never derives an expected digest from live rows/declarations. Deliberately invalid finite fixtures have their own frozen payload/declaration expectations, not automatic repinning during verification. This writer fixture freeze is not independent implementation approval or a candidate declaration.
- Tests import the same frozen lightweight geometry helper for one cheap fixture snapshot build per run; no source was modified, no measurement script or placement search was executed, and no export was attempted. Full placement-search runs: **0**.
- Static AST comparison: all 15 inherited helper/class/predicate definitions match v2 exactly; the audit entrypoint matches except its v3 name. Coverage matches exactly after removing the four new payload-binding statements. Both Python files parse; interface and receipt parse as JSON, and receipt implementation/interface/test hashes match current bytes.

| Focused control | Observed predicate/result |
| --- | --- |
| Same-topology vertex translation with unchanged source bytes and both frozen pins | `coverage.rowsPinMismatch`; support/normal not run |
| Same-topology corner-normal substitution, still within angular tolerance, with unchanged source bytes and both frozen pins | `coverage.rowsPinMismatch`; support/normal not run |
| Complete actual 25-support fixture | Coverage passes; exactly `drum_kick__tower/support/2` and `/3` reject as `liftedSupport`, each **+5.025064731369289 mm** |
| Separate actual 23 ordinary-contact fixture | Passes; does not exempt either spur from the complete negative fixture |
| Independently frozen rack foot +5 mm / -1 mm | Coverage passes; `supportGeometry.liftedSupport` / `penetratingSupport` |
| Independently frozen 3-degree/reversed corner normals; degenerate triangle; nonunit/zero/missing normals | Coverage passes; intended `normalValidity` code explicitly asserted |
| Actual authored slab; 1.99-degree tilt; long smooth bevel | Named positive controls pass |
| Forced-planar long strip and tiny planar triangle | Coverage passes; `normalValidity.planarCornerAngle` |
| Missing/null/unknown/reclassified classes; group identities/ranges/counts; malformed arrays | Separate frozen payloads reach and assert their original coverage errors, not hash mismatches |
| Nonhorizontal/crossed receiver | Frozen payloads reach `nonHorizontalReceivingBoundary` / `nonConvexOrCrossedBoundary` |
| Rounded-corner, bare-floor edge crossing/enclosure and positive full footprint | Original focused clearance controls retained |
| Finite component values causing derived overflow | Coverage passes; JSON-safe `supportGeometry.nonFiniteDerivedMeasurement` |
| Nonfinite corner normal | Whole API rejects `invalidRowsEncoding`; a separate direct normal-predicate test still asserts `invalidCornerNormal`, because a nonfinite payload cannot receive a finite-encoding fixture pin |
| Complete finite encoding | All fields covered; key-order stability, integer/float and signed-zero distinctions, Unicode, invalid types and cycles checked |

The substitution evidence records the unchanged expected declaration/rows/source hashes and the actual substituted payload hashes. Both binding controls use exactly the same literal expectations as the named slab positive. Fixture scope stays explicit; no artistic support inventory or complete N1 candidate classification was invented.

## Protected files and concurrent ownership

The receipt's immutable `hashesBefore` and `hashesAfter` match for **38 files**: 30 of the prior 32 protected paths, all five completed v2 files, and the binding task/disposition/independent contract review. This includes all five artist inputs, prior probe/report/receipt, guards, mapping/profile/ledger, protected asset artifacts, interrupted partial report/evidence and snapshot manifest. The four v2 hashes published in the prior writer report were also rechecked against those exact published values; the fifth v2 report is covered by its captured before/after hash.

The two remaining prior protected paths are the live Claude review report/evidence pair. Root explicitly resumed that separate owner in `msg_6cde38be0e44`; this worker did not modify either. The receipt separately records their observed before/after hashes instead of falsely requiring the active report to remain frozen. The live report changed from `5ecdaf4626973483272b354f3712691a35c91410d826301d9c6c8c2d7731ec42` to `8938a00c8d564152e5472f8643701d20fc4ada18130056a6f288cbffb49a8381` during the final run; the live evidence stayed `8322d1cd0b11cd27af16ac9dfc990b6e279639469f263fb15cc4de98451bf307`. The immutable interrupted snapshot hashes match their historical pins.

No Blender, browser, rendering, build/server, Git, dependency installation, process intervention, Claude wake, public schema or runtime change was performed. No v2 or other owner's file was edited. Existing historical failed-attempt evidence remains untouched.

## Exact hashes

| Successor file, relative to design/studio-v2 | SHA256 |
| --- | --- |
| `scene-coordination/m4-v03-verifier-v3.py` | `0abeb41ea77153ab5bcc442771fff9828edd7220a416ec28f8d10bc7290669dc` |
| `scene-coordination/m4-v03-verifier-v3-tests.py` | `d638fba2f657df9b88a6d4f85ce2906481c642ea54e5784f03a1b26022257659` |
| `scene-coordination/m4-v03-verifier-v3-tests.json` | `eac31cf2e41c24b20de348672b0e74111d11d447bf1e504977a7dce6d1143533` |
| `scene-coordination/m4-v03-verifier-declaration-contract-v3.json` | `5632ca4a42214edc89776c05f6b8f80835c22ddc8fcbeb0429ea3c39f2670e97` |

This report is the fifth successor and the short change receipt. Its own final hash is supplied in the exact completion message to avoid self-reference.

## Explicit remaining integration prerequisite

A matching rows digest proves evidence identity, **not derivation from source**. After actual-Claude complete semantic declarations and root-authorized integration, an independently reviewed producer receipt must identify the hash-pinned producing source files, named producer entrypoint and invocation/snapshot procedure, and demonstrate reproduction of exactly the frozen complete rows payload. This remains **UNSATISFIED for the candidate**. The real v03 still has the two spur errors and lacks a complete approved candidate declaration; fixture success does not change that.

Root's retained independent critic owns implementation review. Author geometry repair, semantic completeness, final export triangle/group correspondence and POSITION/NORMAL/index checks, visual acceptance and runtime acceptance remain with their released owners and later gates. No placement search, art integration or self-approval is implied.

Worker communication used the [Orca orchestration skill](C:/Users/Owenc/.agents/skills/orchestration/SKILL.md).
