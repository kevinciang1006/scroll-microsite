# CLAUDE.md — scroll-microsite standards ("Latent" darkroom)

- Design direction: **"Latent" darkroom** — warm near-black base, warm ivory
  text, amber `--safelight` used as glow/bloom only (never a flat fill), cool
  `--fixer` silver-blue for mono meta/hairlines, ~3% film grain.
- TypeScript **strict**; never use `any`. `verbatimModuleSyntax` and
  `noUnusedLocals`/`noUnusedParameters` are on — import only what you use.
- Small, single-purpose modules. No unused code, no dead exports.
- All colors come from CSS custom properties in `src/styles/base.css`
  (`--ink`, `--ink-raise`, `--ink-deep`, `--paper`, `--safelight`, `--fixer`).
  Component styles live in `src/styles/latent.css` with the export's exact values.
- Every scroll/entrance animation is guarded by `prefers-reduced-motion`:
  reduced motion renders developed end-states, no pin, no scrubbing.
- Keep the **develop scroll-scrub isolated in `src/sections/scrollStory.ts`**.
  It scrubs a CSS `filter` (blur/contrast/brightness) over the print image;
  counter, caption cross-fades, and safelight bloom are driven from the same
  scroll progress there. The sprocket rail (`rail.ts`) is the scroll-progress
  indicator.
- Photography is hotlinked from the Unsplash CDN with sizing/crop/`sat=-100` in
  the query string; the warm tint is a CSS `filter` in `latent.css`. Don't
  change the develop image's `crop=focalpoint&fp-y=0.32` — a 4:3 centre or
  `crop=faces` crop of that vertical portrait cuts the eyes off.
- Lottie loading goes through `createLottie` (graceful fallback; pass
  `fallback:false` where a bespoke visual sits underneath, as the hero
  light-leak and the outro print photo do). Local asset URLs go through
  `assetUrl` so they respect the Vite `base` — remote absolute URLs must not.
- `base` defaults to `/` (`vite.config.ts`) because both live targets serve from
  a domain root: GitHub Pages via the `public/CNAME` custom domain, and Vercel.
  A project-path deploy needs `BASE_PATH=/scroll-microsite/`. Never hard-code
  the sub-path anywhere else — a wrong `base` 404s every CSS/JS asset and the
  page renders unstyled while remote images keep loading.
- Reference material and specs live in `docs/`; the repo root stays limited to
  build config, `README.md`, and this file.
- `npm run build` (`tsc && vite build`) must be clean before every commit.
