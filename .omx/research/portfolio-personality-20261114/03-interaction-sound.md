# Interaction and sound: a table worth exploring

Research/discussion only · 14 November 2026 · Lens: tactile interaction, listening, music production and accessibility.

Recommend a focused interactive tabletop with complete, ordinary page navigation and a small optional sound vocabulary. Its personality should come from Owen's actual objects, musical decisions and stories. Sound can reinforce an intentional action; it cannot supply the missing personal material. This is a proposal, not an approved direction.

## Evidence and interpretation

**Local observation:** `concept/the-working-table.html` has a TypeForge case-toggle, pressed state, focus styling and reduced-motion rules; `concept/brand-spec.md` identifies the key image as an illustration, not Owen's hardware. My inference: another decorative effect would not resolve the concern about generic execution. Paths are relative to `.omx/artifacts/visual-ralph/portfolio-studio-v3/`.

Five primary references were retrieved:

1. **Ableton Learning Music:** its introductory instructions connect clicking small musical patterns with hearing combinations; the curriculum then progresses to making patterns. **Transfer:** a compact action can teach something about making music. **Limit:** this is a music-learning product, so its audio-centric purpose does not justify making portfolio navigation audible. [Creator's introduction](https://learningmusic.ableton.com/).
2. **Bruno Simon:** the creator's page invites driving around and documents audio toggling, mute, mobile gestures, quality and recovery controls. It credits music composed for the portfolio. **Transfer:** coherent interaction, controls and authored sound form one experience. **Inference:** adopting comparable immersion also creates navigation, device and recovery work; it is not simply a 3D hero treatment. Playback and usability were not tested. [Creator's portfolio](https://bruno-simon.com/?lang=en).
3. **MDN:** Web Audio guidance places context creation/resumption inside a user gesture and recommends play/stop, mute, volume and labelled controls. **Confirmed browser constraint:** audio may need activation; do not equate a stored preference with a running audio context. Exact device behaviour remains untested. [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).
4. **W3C:** WCAG 2.2 addresses keyboard operation and focus, alternatives to dragging, and equivalent information for prerecorded audio. Automatically playing audio exceeding three seconds needs independent control; that threshold is not a design recommendation. Disabling nonessential interaction animation is criterion 2.3.3, **AAA**, not an AA requirement. My proposal adopts it anyway. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
5. **Creative Commons:** CC BY 4.0 permits adaptation and commercial use subject to its terms, including attribution, a licence link and modification notices; the deed also identifies possible other rights. A download being free does not establish those rights. [Official licence deed](https://creativecommons.org/licenses/by/4.0/).

## Proposed sound and motion identity

Use two dry, short cues: a soft mechanical press and a softer settling sound. Start around 80–180 ms, without bright tones, long reverb or bass impacts. These are creative values, not accessibility thresholds. Reserve cues for object activation or completion. Hover, scrolling, focus and ordinary typing stay silent. Music requires explicit playback; no ambient soundtrack.

Visible states should read **Sound off**, **Enable sound**, **Sound on**, and **Sound unavailable** where appropriate. Sound starts off on every full page load. The enable button grants permission for subsequent cues but plays no surprise demonstration; a separately labelled preview can audition them. Muting stops all site audio immediately. Each music excerpt also has play/stop controls. Never display “playing” merely because a button was pressed if playback failed.

Propose an initially low site volume, approximately 20% of the authored maximum, with a labelled 0–100 control and value. This is not a guaranteed physical loudness: devices and source levels differ. Match cue levels, avoid stacking repeated triggers, and interrupt a previous cue instead of accumulating noise. Keep enabled state only during the current page session; initially persist nothing across reloads. If persistence is later wanted, remember volume and a preference to stay muted, while requiring fresh deliberate activation for sound.

On mobile, use explicit taps and ordinary page scrolling, with generous 44 CSS-pixel control targets as a design choice. Load optional audio after intent. Stop playback when the page becomes hidden; require play again on return. Treat this as our proposed policy, not a claim about browser defaults. Test Safari/iOS and Chrome/Android interruption and mute behaviour before release.

Motion should express pressure and placement: a brief key depression or small planar movement, followed by a firm rest. Honour `prefers-reduced-motion` with immediate state changes, fixed images and text; remove parallax, camera travel, spring overshoot and animated playheads. Sound and motion settings remain independent. Keep summaries, captions, project links and contact visible; interaction highlights or enlarges material rather than unlocking it.

## Five meaningful interactions

All are proposals. Effort is relative: low = ordinary component; medium = state, content and device testing; high = authored media plus playback qualification.

| Interaction and trigger | Feedback and purpose | Silent/reduced-motion equivalent | Effort; distraction risk |
| --- | --- | --- | --- |
| **Keyboard / TypeForge:** choose “Try a line”, then type into a clearly focused field. | A small key responds visually; one optional settling cue at completion. Experience typing locally, with a direct link to the product and benchmark evidence. No sound per keystroke or global keyboard capture. | Plain text input, visible progress and a written completion state; no travel. The demo claims no learning or speed gains. | Medium; medium if it steals focus. Make entry explicit and exit ordinary. |
| **Listening + making:** explicitly play an eight-second, owner-approved musical phrase, then choose A/B versions. | Compare one documented mix decision at matched levels. Pair “what I listen for” with “what I changed”: attentive listening and production both become legible. This is not a headphone-quality test. | Both versions' production notes and listening observations remain readable; static arrangement illustration. Text communicates intent, not an equivalent auditory sensation. | High; highest distraction and asset dependency. One excerpt at a time, no loop or autoplay. |
| **Coffee:** select a detail in an owner-supplied coffee photograph or routine card. | Enlarge the relevant detail and emphasise the corresponding personal note; optional soft settling cue. Offer an ordinary human habit without forcing an engineering analogy. | Full photograph and all notes remain visible in reading order. | Low once content exists; low. Avoid an invented recipe, brewing simulator or animated steam. |
| **Snowboarding:** use Previous/Next to select among a few owner-approved photos and notes. | Selected print moves slightly forward; sound stays off for this interaction. Convey a real memory rather than a generic mountain aesthetic. | Stationary image list with every caption; buttons are optional conveniences. No drag requirement. | Low–medium; low unless made into a scroll-driven downhill ride. Locations remain unspecified until confirmed. |
| **Project evidence:** select an already-visible dissertation artifact or Copilot stage. | Highlight its relationship to the adjacent explanation; optional press cue. Distinguish recorded evidence, interpretation and an open limitation. | Same evidence list and descriptions without animation; no information conveyed only through sound. | Medium; low. Never simulate live inference, successful recovery or completed work. |

## Ranked direction and opposing view

1. **Focused tabletop:** strongest fit for software/applied-AI evidence and the existing concept. Begin with project evidence and one personal interaction; five proposals are a menu, not a feature checklist.
2. **Tabletop plus optional spatial vignette:** gives a stronger sense of place while preserving a direct work index. Offer exploration as a separate choice. The supplied Jesse reference makes this worth discussing, but a literal room is not approved.
3. **Full spatial portfolio:** potentially most memorable, particularly if environmental craft itself becomes a project. It carries the highest navigation, mobile and content-authoring cost.

**Opposing view:** restraint can become another polished but forgettable portfolio. My lens favours quick access; it may undervalue the delight that drew Owen to the references. Resolve that tension through discussion of one distinctive, genuinely personal interaction, not through assuming visitors dislike play.

For sound sources, prefer Owen's own approved recording/composition or purpose-made cues with documented reuse rights. Licensed alternatives need an asset record: creator, source URL, licence, edits and credit. Do not lift commercial tracks, DAW demo material or another portfolio's cues. No audio was generated or played during this research.

**Questions for coordinator:** Does Owen want to share music publicly, and which listening/making detail feels personal? Are genuine photographs and coffee/snowboarding stories available? Should exploration itself be a portfolio project? Equipment, genres, DAW and experience remain unknown.

**Handoff:** discuss before design work. Later validation should prove work/contact remain readable with JavaScript/audio disabled, keyboard operation, reduced motion, and no surprise playback after return/reload. Verified now: five primary sources and local interaction source, not runtime accessibility, auditory quality or device behaviour. No on-disk AGENTS.md was found in the workspace/ancestor search; supplied instructions and version-matched `orca skills get orchestration` were followed. Only this report was written; no implementation, browser control or other reports were used.
