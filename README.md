# Latent — scroll-driven darkroom microsite

A single-page static microsite for a fictional analog-photography studio. The
organizing idea: **the page develops as you scroll** — a latent print resolving
under a safelight, grainy and dark at the top, fully fixed by the bottom. Built
with Vite (`vanilla-ts`), TypeScript (strict), `lottie-web`, and
`gsap` + `ScrollTrigger`. Visual direction ("Latent" darkroom) ported from a
Claude Design export.

## Run

```bash
npm i
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Add the Lottie assets

Drop three JSON files into `public/lottie/`: `hero.json` (ambient loop —
light-leak / drifting grain), `scroll-story.json` (**the scrubbed one — read as
a print resolving from grain to full contrast**), and `outro.json` (a short
play-once finish). The site runs and builds without them: the develop/outro
frames show a labelled placeholder + `console.warn`, and the hero keeps its CSS
light-leak.

## How the scroll-sync works

`lottie-web` loads `scroll-story.json` with **autoplay off**. On `DOMLoaded` we
read `totalFrames`, then a GSAP `ScrollTrigger` with `scrub: true` pins the
stage and maps scroll progress across the tall (340vh) develop section onto the
frame range — calling `goToAndStop(frame, true)` each tick so the print tracks
the scrollbar. The same progress drives the big IBM Plex Mono frame counter
(`000 → 120`), cross-fades the three captions ("Latent." → "Fixing." → "Fixed."
at 0.16 / 0.5 / 0.84), and recedes the amber safelight bloom as the print
"fixes." The fixed sprocket rail runs its own counter off whole-document scroll.
`prefers-reduced-motion` skips the pin and shows the fully-developed end state.

## Deployment

GitHub Actions builds `dist/` and publishes to GitHub Pages on push to `main`
(`.github/workflows/deploy.yml`). Vite `base` is `'/scroll-microsite/'` for the
repo-name path; change it to `'/'` in `vite.config.ts` for a custom domain.
