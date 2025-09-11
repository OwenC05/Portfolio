Design Audit Summary (reference: itssharl.ee)

Note: This summarizes observable design patterns only. No text, images, or assets were copied. Color values are approximations derived from visual sampling and may differ from the original.

Palette (derived, roles)
- --bg: near‑black blue (#0B1220)
- --ink: soft off‑white (#E6EAF2)
- --muted: desaturated slate (#9AA4B2)
- --line: deep slate line (#1C2434)
- --card: inky panel (#0F172A)
- --chip: muted chip bg (#0E213B)
- --accent: sky blue accent (#7FB0FF)

Type scale (approximate clamps)
- Display‑1: clamp(44px, 8vw, 112px); tracking ≈ −0.01em; leading ≈ 1.02
- Display‑2: clamp(36px, 6.2vw, 80px); tracking ≈ −0.008em; leading ≈ 1.04
- Body: ~17–18px base; tracking ≈ −0.005em; relaxed leading 1.55–1.65
- Eyebrow: tiny caps with wide tracking (~0.18em), reduced opacity

Spacing rhythm
- Section paddings: ~80–120px vertical on desktop, scaled down on mobile
- Grid gutters: ~24–32px; asymmetric compositions favored; plenty of negative space

Cards
- Radius: large (≈ 24–28px → rounded‑3xl)
- Border: 1px hairline with low‑alpha slate
- Background: dark inky tint panels; subtle shadow on hover/focus
- Content: small chips above title; title high‑contrast, blurb muted

Micro‑interactions
- Cursor: dot + ring; multiply/difference blending on dark surfaces
- Spotlight hover: radial gradient mask following cursor; opacity fade in/out
- Magnetic hover: mild x/y drift with tiny 3D tilt
- Reveals: soft fade‑up on scroll; easeOut; durations ≈ 0.5–0.7s; staggered
- Link hover: tiny translate‑x micro‑motion for arrows
- Smooth scrolling: present via a scroll engine; disabled under reduced motion

Accessibility
- High contrast text (≥ 4.5:1) on dark panels
- Focus states visible; keyboard parity for cards/links
- Reduced motion respected; interactions gracefully disable

