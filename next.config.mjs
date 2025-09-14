
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // Enable async WebAssembly so libraries like @react-three/rapier
  // can load their WASM modules correctly in the browser.
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    return config
  },
}

export default nextConfig
