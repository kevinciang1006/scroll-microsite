# Lumen — scroll-driven Lottie microsite

A single-page static microsite demonstrating scroll-synced Lottie playback: a
Lottie animation scrubbed frame-by-frame to scroll position inside a pinned
section, plus a hero intro, reveal-on-scroll cards, a play-once outro, and a
scroll-progress bar. Built with Vite (`vanilla-ts`), TypeScript (strict),
`lottie-web`, and `gsap` + `ScrollTrigger`.

## Run

```bash
npm i
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Add the Lottie assets

Drop three free JSON files from https://lottiefiles.com/free-animations into
`public/lottie/`: `hero.json` (ambient loop), `scroll-story.json` (a clear
start→end sequence — the scrubbed one), and `outro.json` (a short success clip).
The site runs and builds without them (labelled placeholders + `console.warn`).

## How the scroll-sync works

`lottie-web` loads `scroll-story.json` with **autoplay off**. After the SVG
mounts (`DOMLoaded`) we read `totalFrames`, then a GSAP `ScrollTrigger` with
`scrub: true` pins the stage and maps scroll progress across the tall (300vh)
section onto the animation's frame range. On every tick we call
`goToAndStop(frame, true)` to set the exact frame — so the animation tracks the
scrollbar instead of playing on its own. `prefers-reduced-motion` skips the pin
entirely and shows the final frame with the last caption.

## Deployment

GitHub Actions builds `dist/` and publishes it to GitHub Pages on push to
`main` (`.github/workflows/deploy.yml`). Vite `base` is set to
`'/scroll-microsite/'` so asset paths are correct under the repo-name path;
change it to `'/'` in `vite.config.ts` for a custom domain.
