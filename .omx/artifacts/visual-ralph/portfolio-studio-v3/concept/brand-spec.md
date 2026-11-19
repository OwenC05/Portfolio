# The working table

A tactile editorial portfolio: oversized Bodoni Moda identity, precise Manrope text, stone and chalk surfaces, and one substantial graphite research spread.

## Proposed palette

Values are converted from the supplied brand colors, not a preset.

```css
:root {
  --bg: oklch(0.921755 0.012482 91.5239); /* #E8E5DC */
  --surface: oklch(0.972755 0.009502 93.5679); /* #F8F6EF */
  --fg: oklch(0.270290 0.013905 131.7219); /* #242821 */
  --muted: oklch(0.46 0.014 131.7219);
  --border: oklch(0.72 0.014 91.5239);
  --accent: oklch(0.572354 0.167303 33.6844); /* #C7482D */
  --font-display: 'Bodoni Moda', 'Bodoni MT', 'Didot', Georgia, serif;
  --font-body: 'Manrope', 'Segoe UI', sans-serif;
  --font-mono: 'Manrope', 'Segoe UI', sans-serif;
}
```

Mono roles use tabular figures within the body family rather than adding a third font. Local variable fonts, SIL Open Font License copies in assets.

## Visual rules

1. Identity is the primary graphic: a two-line name, deliberately offset, with no overlap against the adjacent mechanical material crop.
2. Compact navigation and a three-row work index precede the project studies. On mobile, the work index precedes the image.
3. Each project has a different composition: graphite experiment spread, chalk inspection sheet, oversized typographic product study.
4. Orange identifies the role and a small number of tactile details. Lines organize actual relationships or content. No decorative grids, generic cards, gradients or status dots.
5. Sharp sheet edges; the single interactive key has a 6px corner radius because it represents a tactile key. All content is visible without animation or JavaScript.

## Direction settings

- DESIGN_VARIANCE: 8, expressed through typography, asymmetry and distinct project compositions.
- MOTION_INTENSITY: 2, limited to short keypress feedback and link states.
- VISUAL_DENSITY: 4, editorial breathing room with a compact first-screen index.
- New review concept, not a redesign of production files.
- The user selected an expressive engineering studio with custom diagrams, tactile details and restrained motion. The palette, serif identity, graphite spread and mechanical-key study are proposed design choices developed from that direction. This reference has not yet been approved for production implementation.

## Image provenance

- `assets/mechanical-key-study.png`: exact copy of the Higgsfield illustration commissioned during this session, 2048 x 1360 pixels. The quoted image-generation cost was 2.75 credits.
- Source: `C:/Users/Owenc/orca/Portfolio/.omx/artifacts/visual-ralph/portfolio-studio-v3/mechanical-key-study.png`.
- Not a photograph of Owen's hardware. The homepage caption identifies it as an illustration and credits Higgsfield. The first-screen crop is intentional; it links to the full-frame local image.
- Local Codex reused this existing asset without requesting additional image generation. The reference uses local image and font files.

## Review adjustments

After generation: substantive project paragraphs increased to 16px, navigation targets enlarged to at least 44px, tablet diagrams switched to the legible vertical composition below 1200px, heading text spacing repaired, and illustration credit shortened. The generated key-focus correction was retained. These are reference refinements, not production changes.

## Font sources

- [Bodoni Moda, Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/bodonimoda)
- [Manrope, Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/manrope)
