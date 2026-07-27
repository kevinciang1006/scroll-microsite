import { defineConfig } from 'vite';

// The one setting that differs between hosts is `base` — the path prefix every
// built asset URL is written with.
//
// Both live targets serve this site from a domain ROOT, so '/' is the default:
//   GitHub Pages — custom domain scroll-microsite.kevinciang.com (public/CNAME)
//   Vercel       — the project domain
//
// Only a project-path deploy needs a prefix. Without a custom domain GitHub
// Pages serves at https://<user>.github.io/scroll-microsite/, and assets must
// carry the repo name or every CSS/JS request 404s and the page renders
// unstyled. For that case build with:
//   BASE_PATH=/scroll-microsite/ npm run build
//
// Everything that resolves a runtime asset goes through `assetUrl()`
// (src/lib/lottie.ts), which reads import.meta.env.BASE_URL — so this single
// value retargets the whole site.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  // This is a single static page, not a client-routed SPA. MPA mode makes the
  // dev/preview server return real 404s for missing files (e.g. absent Lottie
  // JSON) instead of the SPA index.html fallback — so lottie-web's data_failed
  // path fires and the graceful `.lottie-fallback` degrades correctly, matching
  // GitHub Pages behavior.
  appType: 'mpa',
});
