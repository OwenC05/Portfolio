# Corrected PC v05 bounded technical check

15 November 2026. **PASS for the exact authorized PC delta.** The preserved v04 failed candidate and its [rejection](scene-m2-v04-delta-check.md) remain unchanged; no tolerance was added. Appearance is pending root capture and independent Claude review.

Command: `node design/studio-v2/scene-coordination/m2-v05-delta-check.mjs`, exit0. The [machine receipt](scene-coordination/m2-v05-delta-check.json), SHA256 `681BF10B3742FF2AFC65EBBA3149A6045B97AB77814899533335A008EC15DDC7`, records the byte locations, exact input identities, changed vertices, bounds and unchanged structural validation.

| Artifact | SHA256 |
| --- | --- |
| v05 GLB | `4b2f7b8f44e13ef2a23e6d3420f1098147702aba72a365e6a942dec7e7ccc735` |
| v05 manifest | `aaa0c2628810152c165f7e2564c0524394057241ce1f43ec6c94042c5f3ba5e7` |
| v05 restoration source | `27a6112aca02015e5b1ee4a83193521d46378b0cf39e4b8a5148bb0f4e9fd888` |

The author restored exactly the four rejected BIN float words from pinned v03 at offsets411436,411448,412052 and1074960. Header and raw JSON remain verbatim v04; the embedded provenance label still says v04, accurately identifying the Blender build. v05 is that editable v04 source/blend plus the hash-pinned, reproducible byte-restoration step. No new Blender run or invented v05 editable change is claimed.

Against accepted v03, the complete BIN has exactly76 changed float words: four PCfront V coordinates from0.0625 to0.3125 and72 PCglow position components. No unrelated UV, normal, index, image or other byte differs. The four UV vertices60/63/66/69 lie on a coplanar front-facing panel; palette pixels remain identical. The glow is a pure translation to float32 precision, with unchanged normals and indices. JSON differs only in its glow-position accessor min/max and two build provenance labels; all node transforms, flags, materials, assignments, bindings and counts remain identical. The paired manifest differs only by GLB hash and passes the existing validator.

Independent exported-coordinate checks put every glow vertex strictly inside the case bounding volume. glTF bounds are `[0.106300,0.140300,-0.158700]` to `[0.345300,0.143800,-0.153700]`; translation is approximately `[-0.011700,0.000300,-0.516700]`. Case geometry is byte-identical, preserving its previous top-hidden shape and dimensions. These checks do not independently establish the author's detailed interior-clearance/intersection or visibility-ray claims; real captures remain necessary for restrained visible glow, white-PC readability and C2 appearance.

Counts remain117 primitive instances,48 casters,22658 unique/24722 placed/12680 shadow triangles,11 materials and5 images. `lib_glow` and all embedded images are unchanged from v03, so the earlier pendant evidence may carry only while builder lighting and relevant runtime inputs remain unchanged. Candidate bytes are1228192 raw,586955 gzip and483317 Brotli; these estimates are not final combined transfer measurements.

The owner was asked to hold candidate/source identity and Blender/export during root's capture while continuing CPU M3 preparation. Root owns the five-view capture and static UI comparisons; independent Fable owns the visual verdict. M3 assembled export waits for that reviewed parent. No broad test suite or new runtime/resource exercise was repeated for this bounded asset delta.
