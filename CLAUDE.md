# CLAUDE.md — scroll-microsite standards

- TypeScript **strict**; never use `any`.
- Small, single-purpose modules. No unused code, no dead exports.
- All colors and spacing come from CSS custom properties (`src/styles/base.css`).
  No magic numbers scattered in component CSS.
- Every scroll/entrance animation is guarded by `prefers-reduced-motion`:
  reduced motion renders final states, no pin, no scrubbing.
- Keep **all** scroll-scrub logic isolated in `src/sections/scrollStory.ts`.
- Lottie loading goes through `createLottie` (graceful fallback). Asset URLs go
  through `assetUrl` so they respect the Vite `base`.
- `npm run build` (`tsc && vite build`) must be clean before every commit.
