import { defineConfig } from 'vite';

// The one setting that differs between hosts is `base`:
//
//   GitHub Pages — served from https://<user>.github.io/scroll-microsite/, so
//     assets must be requested from the repo-name sub-path. This is the default.
//   Vercel — serves from the domain root. Vercel sets VERCEL=1 in the build
//     environment, so this is detected automatically with no dashboard config.
//   Custom domain / anything else — set BASE_PATH explicitly, e.g.
//     BASE_PATH=/ npm run build
//
// Everything that resolves a runtime asset goes through `assetUrl()`
// (src/lib/lottie.ts), which reads import.meta.env.BASE_URL — so this single
// value retargets the whole site.
const base = process.env.BASE_PATH ?? (process.env.VERCEL ? '/' : '/scroll-microsite/');

export default defineConfig({
  base,
  // This is a single static page, not a client-routed SPA. MPA mode makes the
  // dev/preview server return real 404s for missing files (e.g. absent Lottie
  // JSON) instead of the SPA index.html fallback — so lottie-web's data_failed
  // path fires and the graceful `.lottie-fallback` degrades correctly, matching
  // GitHub Pages behavior.
  appType: 'mpa',
});
