import { defineConfig } from 'vite';

// GitHub Pages serves this repo at https://<user>.github.io/scroll-microsite/,
// so assets must be requested from the repo-name sub-path.
// For a custom domain (e.g. scroll.kevinciang.com) change base to '/'.
export default defineConfig({
  base: '/scroll-microsite/',
  // This is a single static page, not a client-routed SPA. MPA mode makes the
  // dev/preview server return real 404s for missing files (e.g. absent Lottie
  // JSON) instead of the SPA index.html fallback — so lottie-web's data_failed
  // path fires and the graceful `.lottie-fallback` degrades correctly, matching
  // GitHub Pages behavior.
  appType: 'mpa',
});
