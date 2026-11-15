# M4 v03 author clarifications during verification

15 November 2026. Source: actual-Claude author message `msg_b4e298729fac`, responding to S's message-only request. These clarify intent and proposed repairs; they change no source, geometry, validation rule or acceptance decision. All five reviewed v03 files remain at checkpoint906b7d61332379d7374b559be267a95742dc32bb. Numerical and focused art reviews are still active.

## Real geometry defect

The author explicitly declares both kick spurs **intended support contacts**, not decorative hardware. They are the anti-creep feet and should contact the rug. Source locator: v03 helper `kick()`, lines755-757, `kick.hardware`, comment `# spurs`, inherited from v01 line530. The author confirms the verifier's5.3251mm gap above the rug,5.0251mm above the intended0.3mm resting gap. No exemption or relabelling is requested.

Proposed author remedy, pending root release: lower the rod tip ends until their actual support minimum meets rug height plus the existing gap. The author predicts no triangle-count change (kick remains856/1500), but the revised geometry must be measured. Complete primitive-level support coverage should catch this defect.

## Verification coverage defects acknowledged by author

1. The current K1 selector uses vertices within0.5mm of a row minimum. Raising one support can remove it from the tested set while another support still passes. Proposed remedy: declare every support primitive and receiving surface in helper metadata, uniquely label them, and verify each independently, including negative raised/lowered fixtures. The author proposes naming stand ends, sustain base, four stool feet, rack tubes/rubber ends, kick base/spurs/pedal base, hi-hat base and throne feet. Exact schema and checks are not yet frozen.
2. Both helper and measurement script use rectangular rug classifiers. The authored rounded field removes area at corners; the earlier claim that rounding only adds clearance was false. Proposed remedy: signed distance to the actual authored inner-field polygon for rug supports and outer outline for floor supports. The author's scratch calculation indicates existing placements have at least49.9mm clearance, but it is not durable revised receipt evidence.
3. N1 class completeness is not enforced. The author proposes a declared scope with group identities/counts, full face-array length/valid-class checks, unique ranges and missing/duplicate/null/unknown-class negatives. No class may be inferred from the normals under test. Exact implementation remains for the bounded repair after reviews settle.

Root has reserved verification logic for actual Codex and geometry/semantic declarations for actual Claude. The author's suggested ownership of all five files is not an ownership transfer. S will assign one owner per file when root releases the repair; no overlapping edits or self-repair during active review.

## Report errata, old report preserved

- The support table's rack clearance0.124m came from a superseded dry run. The existing receipt states0.129m.
- The Assumptions sentence claiming rounded corners only add clearance is incorrect; it removes field area near the corners.

The author rehashed all reviewed files unchanged and returned intentionally idle. The verification reports must distinguish these real geometry and coverage defects from later export/visual gates. No Blender, render, export, source edit, memory exception or candidate acceptance follows.
