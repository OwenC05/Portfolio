## Editorial/Cinematic Refresh

Added
- Framer Motion (animation): scroll reveals, spotlight opacity transitions, magnetic wrapper respects reduced‑motion.
- UI utilities: `components/ui/Reveal.tsx`, `Magnet.tsx`, `Spotlight.tsx`, `CustomCursor.tsx`.
- Tokens: appended CSS variables in `app/globals.css` for dark editorial theme.
- Fonts: `next/font` Inter (text) + Fraunces (display) in `app/layout.tsx` with `display: 'swap'` to avoid CLS.
- Optional grain overlay: `styles/grain.css` (mount by adding `<div class="grain-overlay" />`).

Changed
- Landing (`app/page.tsx`) and About (`app/about/page.tsx`) to an editorial layout with big type, airy spacing, quiet cards, and subtle motion. `/projects` unchanged.

Disable motion/cursor
- Motion: `prefers-reduced-motion` is respected automatically; set your OS/browser setting to reduce motion to disable reveals, spotlight movement, and magnetic tilt.
- Cursor: Do not mount `CustomCursor` or remove it from layout. System cursor returns automatically. The cursor also disables on touch devices and under reduced‑motion.

