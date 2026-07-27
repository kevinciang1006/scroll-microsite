# PRD — Scroll-Driven Lottie Microsite (Portfolio Demo)

## One-liner
A single-page scrollytelling microsite that proves scroll-synced Lottie playback, pinned scroll sequences, and reveal-on-scroll — built to match the requirements of an Upwork "Frontend Developer HTML" job (HTML microsite, no CMS, Lottie scrolling JSON a must).

## Why
The target job lists "Lottie files, Lottie scrolling JSON experience is a must." This demo exists to show that exact technique on a live URL, so the proposal points to proof instead of a claim. Scope is deliberately tiny.

## Scope

### In
- One page, static, no CMS.
- Three animation beats:
  1. **Hero** — an ambient looping Lottie + fade/slide intro.
  2. **Scroll-scrub sequence** — a pinned section where a Lottie animation is scrubbed frame-by-frame by scroll position (the core "Lottie scrolling JSON" skill).
  3. **Reveal sections** — content blocks that fade/translate in on scroll, plus a small outro Lottie.
- Sticky scroll-progress bar.
- Fully responsive (desktop → mobile), design-accurate spacing/type.
- `prefers-reduced-motion` respected (animations fall back to static end-states).
- 60fps target; no jank on scroll.

### Out
- No backend, no CMS, no forms, no auth.
- No routing / multiple pages.
- No custom Lottie authoring — Lottie JSON files are sourced (see Assets).

## Stack
- Vite (vanilla-ts template) → outputs a static site.
- TypeScript (strict, no `any`).
- `lottie-web` for rendering + frame control.
- `gsap` + `ScrollTrigger` for pin + scrub + reveals.
- Plain CSS (custom properties, no framework) — keeps it a true "HTML microsite."
- Deploy: GitHub Pages via GitHub Actions.

## Sections (spec)

1. **Hero**
   - Full-viewport. Product name + one-line subhead + scroll cue.
   - Ambient Lottie loop behind/beside the text (autoplay, loop).
   - Text animates in on load (GSAP timeline).

2. **Scroll-scrub sequence (the money shot)**
   - Section is pinned while a Lottie plays through its frames mapped to scroll progress.
   - Uses `lottie.loadAnimation({ autoplay:false, loop:false })` then drives `goToAndStop(frame, true)` from a `ScrollTrigger` with `scrub: true`.
   - Short captions cross-fade at scroll milestones (e.g. 0%, 50%, 100%).
   - End of section unpins and continues normally.

3. **Reveal band**
   - 3 feature cards / statements that fade + translate up as they enter the viewport (ScrollTrigger, `once: true`).

4. **Outro / CTA**
   - Small success/outro Lottie (plays once on enter).
   - Static CTA button (no action needed — it's a demo).

5. **Progress bar**
   - Fixed top bar scaling 0→100% with page scroll.

## Assets (one manual step, ~2 min)
Grab **3 free Lottie JSON files** from lottiefiles.com/free-animations with clear motion, and drop them in `public/lottie/`:
- `hero.json` — an ambient loop (abstract shapes / gradient blob / orbit).
- `scroll-story.json` — something with a clear start→end sequence (rocket launch, chart drawing, character walk, assembly). This is the one that gets scrubbed.
- `outro.json` — a short success/checkmark or celebratory loop.

Code must degrade gracefully if a file is missing (show a labelled placeholder box, console.warn) so the dev server always runs.

## Deployment
- GitHub Actions workflow builds and publishes `dist/` to GitHub Pages on push to `main`.
- Vite `base` set to the repo name for Pages path correctness.
- Custom domain optional (can map to `scroll.kevinciang.com` later).

## Acceptance criteria
- Scroll-scrub section: scrubbing up/down moves the Lottie forward/back in lockstep with scroll — no autoplay, no lag.
- All scroll animations smooth at 60fps on desktop and mobile.
- Layout holds from ~360px to wide desktop; nothing overflows.
- `prefers-reduced-motion: reduce` → animations show final state, no motion.
- Lighthouse: Performance ≥ 90, no console errors.
- Live on GitHub Pages, README explains the scroll-sync approach in a short paragraph.

## Effort
Half a day to 1 day. Do not expand scope beyond the four sections above.
