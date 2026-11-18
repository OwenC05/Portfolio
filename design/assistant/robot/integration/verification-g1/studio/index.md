# Current Studio capture index

Build `O1RTOH0qRVqxRHQExjvm4`; production `http://127.0.0.1:4193/studio`; source identity in [source-before.json](../source-before.json) and [build-receipt.json](../build-receipt.json). These are actual pilot-room renders with no robot. Fixed eye `[-0.7,2.8,3.4]`, 58-degree desktop / 64-degree phone FOV.

All four viewport sizes have home and Projects-open captures at input DPR 1 and 3; DPR 1 additionally covers four look-limit corners and a project dialog. DPR 3 produces native 3x screenshot pixels while the canvas buffer is capped at 2 desktop / 1.5 small. Read the per-shot camera, canvas/host dimensions and actual DPR in [capture-index.json](capture-index.json); PNG hashes/dimensions are in [capture-files.json](../capture-files.json).

| CSS viewport | Input DPR | Home | Projects open | Other captures |
| --- | --- | --- | --- | --- |
| 1440 x 900 | 1 | [home](1440x900-dpr1-home.png) | [Projects](1440x900-dpr1-projects-open.png) | [left-up](1440x900-dpr1-left-up.png), [left-down](1440x900-dpr1-left-down.png), [right-down](1440x900-dpr1-right-down.png), [right-up](1440x900-dpr1-right-up.png), [project-dialog](1440x900-dpr1-project-dialog.png) |
| 390 x 844 | 1 | [home](390x844-dpr1-home.png) | [Projects](390x844-dpr1-projects-open.png) | [left-up](390x844-dpr1-left-up.png), [left-down](390x844-dpr1-left-down.png), [right-down](390x844-dpr1-right-down.png), [right-up](390x844-dpr1-right-up.png), [project-dialog](390x844-dpr1-project-dialog.png) |
| 320 x 844 | 1 | [home](320x844-dpr1-home.png) | [Projects](320x844-dpr1-projects-open.png) | [left-up](320x844-dpr1-left-up.png), [left-down](320x844-dpr1-left-down.png), [right-down](320x844-dpr1-right-down.png), [right-up](320x844-dpr1-right-up.png), [project-dialog](320x844-dpr1-project-dialog.png) |
| 320 x 568 | 1 | [home](320x568-dpr1-home.png) | [Projects](320x568-dpr1-projects-open.png) | [left-up](320x568-dpr1-left-up.png), [left-down](320x568-dpr1-left-down.png), [right-down](320x568-dpr1-right-down.png), [right-up](320x568-dpr1-right-up.png), [project-dialog](320x568-dpr1-project-dialog.png) |
| 1440 x 900 | 3 | [home](1440x900-dpr3-home.png) | [Projects](1440x900-dpr3-projects-open.png) |  |
| 390 x 844 | 3 | [home](390x844-dpr3-home.png) | [Projects](390x844-dpr3-projects-open.png) |  |
| 320 x 844 | 3 | [home](320x844-dpr3-home.png) | [Projects](320x844-dpr3-projects-open.png) |  |
| 320 x 568 | 3 | [home](320x568-dpr3-home.png) | [Projects](320x568-dpr3-projects-open.png) |  |

All 91 capture/interaction checks passed: ready canvas, source camera and DPR, no horizontal overflow, named project links, heading/return focus and desktop trusted canvas activation of all three project screens. Screenshots do not establish robot clearance or freeze a visual placement. The Projects disclosure obscures part of the scene on short phones; use both open and closed views when composing.

Representative desktop home, short-phone Projects and 390px assistant citation images were visually inspected for successful rendering and readable content; this is not independent artistic approval.
