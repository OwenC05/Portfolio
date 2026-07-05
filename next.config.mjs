
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true, // stable / top-level in Next 16
  transpilePackages: ['three'], // three.js interop under Turbopack
  turbopack: { root }, // pin workspace root (a stray ~/pnpm-lock.yaml confuses inference)
}

export default nextConfig
