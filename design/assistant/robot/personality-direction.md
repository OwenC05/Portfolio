# Studio robot: personality direction (proposal)

15 November 2026, Claude design lane, task_32890c9c55bb. Everything here is a proposal; nothing is approved, named or coloured.

## What the reference gives us

I viewed `reference/robot-inspiration.png`. Four visible features can carry character:

- **Two ring eyes on a dark visor.** Rings can change shape and slide inside the visor.
- **A head that floats apart from the body.** The head can turn or tilt first and the body can follow.
- **Two small side fins.** They are too small to be arms, but they can open, point and tuck.
- **A glowing ring underneath.** It gives this character a useful visual prop and a signature gesture.

The wireframe and stock text are not carried over; thin blue lines would vanish at phone size.

## Recommended: the eager apprentice

A junior archivist who fetches things and hands them over. It is keen and careful, and it never explains or vouches for what it found.

**Signature detail: the ring is its tray.** It carries the ring below itself, and whatever the search really returned is laid on it as one to four marks. An empty tray is the honest picture of "nothing found".

| Moment | Eyes | Head and fins | Ring |
| --- | --- | --- | --- |
| Idle | Rings with the top flattened, looking at Owen's screens | Still. Head turned slightly toward the desk, fins tucked | Dim, empty |
| Visitor hovers or focuses | Open to full rings and slide toward the visitor | Head tilts about 10 degrees; body follows a beat later; fins open slightly | Brightens a little |
| Sources arrive | Glance down at the ring, then back to the visitor | One fin angles down at the tray | One mark per real hit, in rank order, top hit largest |
| No evidence | Glance down at the empty ring, then back; rings stay round | Small head tilt, both fins turn outward once, then one fin points toward the contact link in the panel | Stays empty |
| Dismissed | Return to flattened rings | One short nod, then head turns back to the desk | Marks clear |

**Timing.** Each change is one beat of about 0.3 to 0.5 seconds, then stillness. That suits the Studio's renderer, which draws only when something changes. With reduced motion the same poses swap instantly.

## Alternative: the quiet bandmate

A laid-back regular of the music corner. Eyes are low half-rings. It greets with a single chin lift, slides sources onto the tray without looking down, and answers "nothing found" with one slow head shake. Signature detail: one ear nub shaped like the headphone cup on the desk beside it.

Trade-off: more attitude and more tied to Owen's room, but half-closed eyes are harder to read at small size and can look indifferent to a visitor asking a real question.

## Alternative: the precise instrument

Closest to the reference's technical mood. The eyes never change shape; only gaze, exact quarter-turn head movements and the ring speak. The ring is a dial with four fixed positions that light for real hits.

Trade-off: the least risk of overclaiming and the easiest to build, but the least warm. It reads as a device more than a character.

## Playful body, plain claims

These hold in all three directions:

- **Gestures show what it did, not what it knows.** It fetches, presents and comes back empty-handed. It never nods "correct" or looks pleased with a result, because matching passages are not a confirmed answer.
- **No thinking act.** No upward pondering look, spinning ring or pulsing eyes. Search takes about 9 ms and generation is off.
- **The ring never shows more or fewer marks than real hits.**
- **It is silent.** No voice or speech bubble is assumed. The panel text stays plain, such as "4 passages matched", and says "search", not "know".

**Legibility.** The eyes need to be larger than in the reference and the head-to-body gap must stay visible. Recheck size at production's 64-degree phone lens; my earlier estimate used 74-degree staged captures.

## Next question

Which temperament feels right: eager apprentice (recommended), quiet bandmate, or precise instrument? A mix is fine.
