# Owen Cheung — Alpenglow Portfolio

An interactive portfolio where the landing page is a playable 3D snowboard descent. Gates on
the run open case studies; the same server-rendered trail map doubles as the static `/projects`
index and the reduced-motion / no-WebGL fallback.

## Stack

| Layer | Package | Version |
|---|---|---|
| Framework | Next.js (App Router, typedRoutes, Turbopack) | 16.2.9 |
| UI runtime | React | 19.2 |
| 3D | react-three-fiber / three / drei / @react-three/postprocessing | 9 / 0.184 / 10 / 3 |
| Styling | Tailwind v4 (CSS-first `@theme` in `app/globals.css`) | 4 |
| State | zustand | 5 |
| Animation | framer-motion | 12 |
| Language | TypeScript (strict) | 5 |
| Tests | Vitest | 3 |

## Architecture

### 3D run (`components/run/`)

`RunExperience` is the capability gate: on mount it checks `prefers-reduced-motion` and
`hasWebGL()`. When either fails it renders `TrailMap` (server-safe, hook-free). Otherwise
it dynamically imports `RunCanvas` (SSR disabled) which mounts the R3F renderer hosting
`RunScene`.

The scene is split between `RunScene.tsx` (R3F root, camera, post-processing) and the
`scene/` subdirectory — `Player`, `Terrain`, `Stations`, `SkyDome`, `Snow`, `CarveTrail`
— which own the per-frame game loop via `useFrame`.

UI overlays (`overlay/`) sit above the canvas as fixed DOM: `HudOverlay` (telemetry
readout), `ProjectPanel` (case-study gate), and `RunStage` (intro / finish screens).

### Pure math modules (`lib/`)

- `lib/steering.ts` — frame-rate-independent steering integration; zero allocations, no
  three or React imports; unit-tested.
- `lib/descent.ts` — maps distance to progress, altitude, ground height, and named zone;
  purely functional; unit-tested.
- `lib/runStore.ts` — zustand 5 telemetry store; hot per-frame values stay in scene refs,
  only throttled (~10 Hz) state commits here.

### Fallback and content

`components/run/fallback/TrailMap.tsx` is a server component (no client hooks) that renders
the full project index as a trail map. It is simultaneously the reduced-motion / no-WebGL
fallback and the static `/projects` route.

Content is single-sourced:

- `lib/content.ts` — site metadata, contact links, bio copy
- `lib/projects.ts` — project cards, slope geometry
- `lib/theme.ts` — Alpenglow colour palette, zone definitions

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build (TypeScript-gated) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Run Vitest suite once |
| `npm run test:watch` | Vitest in watch mode |

## Deployment

The project is Vercel-ready. For production, set one environment variable:

```
NEXT_PUBLIC_SITE_URL=https://<your-domain>
```

This drives `metadataBase`, the generated `sitemap.xml`, and `robots.txt`. Without it,
metadata resolves against `http://localhost:3000` in development and the Vercel deployment
URL in preview builds.
