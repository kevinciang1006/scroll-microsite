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
- Keep the **develop Lottie frame-scrub isolated in `src/sections/scrollStory.ts`**
  (counter, caption cross-fades, and safelight bloom are driven from the same
  scroll progress there). The sprocket rail (`rail.ts`) is the scroll-progress
  indicator.
- Lottie loading goes through `createLottie` (graceful fallback; pass
  `fallback:false` to keep a bespoke backdrop like the hero light-leak). Asset
  URLs go through `assetUrl` so they respect the Vite `base`.
- `npm run build` (`tsc && vite build`) must be clean before every commit.
