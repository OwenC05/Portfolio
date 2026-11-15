# Root disposition: M2 v03 material repair

15 November 2026. Adopt the bounded independent actual-Claude Fable review from task `task_76847bdd1353` / dispatch `ctx_a9e053890019`. The reviewer is separate from the actual-Claude Opus author. Root verified the final report identity and checked the recorded image hashes against the local capture files.

| Evidence | SHA256 |
| --- | --- |
| `scene-m2-v03-visual-critique.md` | `8c739f973d342939e000bb6be72ca4d2b2e613e17c74df0f50745f5c818229a7` |
| `m2-v03-visual-review-measurements.json` | `0c5c2928fa40ae402cf8957d13593fb3a65a81bdeacd46eee8cc8871588e133b` |
| `m2-v03-visual-review-measure.py` | `0ec06ca5245cf905b03b2eb5e68e807b6d369cde27b9cae6c448de96dd9706e8` |
| `m2-v03-visual-review-crops.png` | `35eb9d8b323bc804e22477c4d4da5e6d90bf3319d00799fa8d85f5dcd77bfd7e` |

## Accepted result

The v03 pendant material repair is accepted. All 18 reviewed images match the capture record: 13 actual scene renders and five static UI composites. The eight compared pendant crops measure 0.00-0.28% clipped, below the existing under-2% gate, versus 22.3-26.7% in v02. The reviewer locates the remaining clipped pixels on an unchanged adjacent fixture surface; no lens-material pixel clips. The ends remain luminous, the body/lens edge remains readable, and the flat diffuser is acceptable at actual size. No D2 ramp is requested or released by this decision.

This closes the pendant blocker recorded in `m2-root-visual-disposition.md`; that earlier report and its measurements remain preserved. The separate Codex v03 delta check establishes unchanged geometry, UVs, embedded images and render counts. This is an asset-stage decision, not full-room or production acceptance.

## Carry-forward conditions

- Preserve v03 `lib_glow` and the builder lights in PC v04. The pendant verdict carries only while those inputs remain unchanged. Re-measure the lens and neighboring bright fixture line when M6 changes the practical light.
- The floor-lamp bulb and PC glow were unobservable at the captured poses. Neither receives appearance approval. A subsequently exposed bulb needs a capture; the relocated PC strip has its own v04 capture and independent review.
- M5 must resolve the final wall-light form and material; the current shared-material proxies read flatter after this repair. Proxy appearance is not final asset acceptance.
- The five UI composites show image/DOM overlap only. They do not establish integrated picking, focus, input, higher-DPR rendering or physical-device behavior. The recorded favicon warning and pilot-fetch abort remain disclosed in the capture handoff.

## Next authorized work

Proceed with the existing narrow PC scope in `m2-pc-repair-scope.md` and the adopted budget in `full-kit-ledger-v01-root-disposition.md`. Actual-Claude Opus task `task_d31f70e55a5d` / dispatch `ctx_5abdce20e965` owns v04 and M3 source preparation under `m2-v04-and-m3-preparation-task.md`.

V04 still requires independent Codex delta validation, root runtime captures and independent actual-Claude visual review. M3 source preparation may continue; its assembled export waits for the reviewed v04 parent. No new production integration, budget waiver, dependency, paid generation or broad geometry change follows from this verdict.
