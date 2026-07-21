import { defineConfig } from 'vite';

// GitHub Pages serves this repo at https://<user>.github.io/scroll-microsite/,
// so assets must be requested from the repo-name sub-path.
// For a custom domain (e.g. scroll.kevinciang.com) change base to '/'.
export default defineConfig({
  base: '/scroll-microsite/',
});
