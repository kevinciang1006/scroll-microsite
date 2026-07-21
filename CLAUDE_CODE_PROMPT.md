# Claude Code Prompt — Scroll-Driven Lottie Microsite

> Paste everything below into Claude Code. **Start in plan mode**, let it produce the plan, review, then approve the build.

---

You are building a small, production-quality static microsite that demonstrates scroll-driven Lottie animation. This is a portfolio demo for a frontend job whose hard requirement is "Lottie scrolling JSON" — Lottie frames scrubbed to scroll position. Build the whole thing completely: no TODOs, no placeholder comments, no stubbed functions.

Enter plan mode first. Present the file tree and approach, wait for approval, then implement everything.

## Project
- Name: `scroll-microsite`
- Type: static HTML microsite (no CMS, no backend, no router).
- Tooling: **Vite** (`vanilla-ts`), **TypeScript strict**, plain CSS with custom properties.
- Libraries: `lottie-web`, `gsap` (use the free `ScrollTrigger` plugin from the `gsap` package).
- Fictional product name for content: **"Lumen"** (a focus/deep-work app). Keep copy short and neutral; this is swappable.

## Setup
1. Scaffold: `npm create vite@latest scroll-microsite -- --template vanilla-ts`.
2. Install: `npm i lottie-web gsap`.
3. Node 20+, ESM.

## Folder structure
```
scroll-microsite/
  public/
    lottie/                 # hero.json, scroll-story.json, outro.json (see Assets)
  src/
    main.ts                 # entry: boots the app, wires sections
    styles/
      base.css              # reset, tokens, typography
      layout.css            # sections, grid, responsive
    lib/
      lottie.ts             # createLottie() helper (load, graceful fallback)
      motion.ts             # gsap setup, ScrollTrigger registration, reduced-motion guard
    sections/
      hero.ts               # ambient loop + intro timeline
      scrollStory.ts        # THE scroll-scrubbed Lottie (pinned)
      reveals.ts            # fade/translate-in cards
      outro.ts              # play-once outro Lottie
      progress.ts           # scroll progress bar
  index.html
  CLAUDE.md
  README.md
  .github/workflows/deploy.yml
  vite.config.ts
```

## Design system (keep it clean and intentional)
- Colors via CSS custom properties: near-black background `--bg`, off-white text `--fg`, one accent `--accent` (a calm blue-violet, e.g. `#7c6cff`). Define a light-on-dark theme.
- Type: system stack or a single Google font (Inter) via `<link>`; large generous headings, comfortable line-height, real vertical rhythm.
- Spacing scale in CSS vars (`--space-1..8`). No magic numbers scattered around.
- Max content width ~1100px, centered, generous side padding.
- Everything must look deliberate — this is judged on polish, not just that it works.

## Core behavior — implement exactly

### lib/motion.ts
- `import gsap from 'gsap'; import ScrollTrigger from 'gsap/ScrollTrigger'; gsap.registerPlugin(ScrollTrigger);`
- Export `const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;`
- Export a `refresh()` that calls `ScrollTrigger.refresh()` (call after Lottie loads so pin distances are correct).

### lib/lottie.ts
- `createLottie(container: HTMLElement, path: string, opts: { loop: boolean; autoplay: boolean }): AnimationItem | null`
- Loads with `lottie.loadAnimation({ container, renderer: 'svg', path, loop, autoplay })`.
- On load failure / missing file: render a labelled placeholder (`<div class="lottie-fallback">Lottie: {filename}</div>`), `console.warn`, return `null`. The site must run even before assets are added.
- Return the `AnimationItem` so callers can control frames.

### sections/scrollStory.ts (the critical one)
- Section markup: a tall wrapper (`min-height: 300vh`) containing a pinned, viewport-height stage with the Lottie container and a caption element.
- Load `scroll-story.json` with `autoplay:false, loop:false`.
- After `DOMLoaded`, read `totalFrames`, then:
```ts
const proxy = { frame: 0 };
gsap.to(proxy, {
  frame: anim.totalFrames - 1,
  ease: 'none',
  scrollTrigger: {
    trigger: wrapper,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    pin: stage,
    anticipatePin: 1,
  },
  onUpdate: () => anim.goToAndStop(Math.round(proxy.frame), true),
});
```
- Cross-fade 3 captions at scroll progress ~0.1 / 0.5 / 0.9 using additional ScrollTriggers or a timeline.
- Reduced motion: skip pinning, set the Lottie to its final frame, show the last caption.
- Call `refresh()` once the animation is loaded.

### sections/hero.ts
- Ambient `hero.json` (`loop:true, autoplay:true`).
- Intro: GSAP timeline fading/translating the heading, subhead, scroll cue on load.

### sections/reveals.ts
- 3 cards; each a ScrollTrigger with `start: 'top 80%'`, `once: true`, animating opacity 0→1 and y 24→0. Stagger.

### sections/outro.ts
- `outro.json` (`loop:false, autoplay:false`); play once when its ScrollTrigger enters.

### sections/progress.ts
- Fixed top bar; scaleX 0→1 mapped to full document scroll via a single ScrollTrigger with `scrub:true`.

### Reduced motion (global)
- If `prefersReducedMotion`, no section should animate on scroll: render final states, no pin, Lotties set to last frame (or first, whichever reads best) and not autoplaying.

## Assets
Create `public/lottie/` and add a short README note there: the user must drop three free Lottie JSON files from lottiefiles.com/free-animations:
- `hero.json` (ambient loop), `scroll-story.json` (clear start→end sequence — this one gets scrubbed), `outro.json` (short success/celebration).
The code already degrades gracefully if these are absent.

## index.html
- Semantic structure, one root `<div id="app">`, meta viewport, title "Lumen — scroll demo", `<link>` to Inter, link the CSS, `<script type="module" src="/src/main.ts">`.

## vite.config.ts
- `base: '/scroll-microsite/'` (repo-name path for GitHub Pages). Add a comment showing how to switch to `'/'` for a custom domain.

## .github/workflows/deploy.yml
- Trigger on push to `main`.
- Steps: checkout → setup-node 20 → `npm ci` → `npm run build` → upload `dist/` artifact → deploy to GitHub Pages using the official `actions/deploy-pages` flow. Include the required `permissions` (`pages: write`, `id-token: write`) and `environment: github-pages`.

## CLAUDE.md
Short standards file: TypeScript strict, no `any`, small single-purpose modules, no unused code, CSS custom properties for all colors/spacing, all scroll behavior guarded by `prefers-reduced-motion`, keep the scroll-scrub logic isolated in `scrollStory.ts`.

## README.md
- What it is (one paragraph).
- Run: `npm i && npm run dev`. Build: `npm run build`.
- How to add Lottie assets (the three files).
- **A short "How the scroll-sync works" paragraph**: lottie-web loads the JSON with autoplay off; a GSAP ScrollTrigger with `scrub` maps scroll progress across the pinned section to the animation's frame range, and `goToAndStop` sets the exact frame each tick — so the animation tracks scroll instead of playing on its own.
- Deployment note (GitHub Pages via Actions, set `base`).

## Quality bar
- `tsc` clean, no `any`, no console errors at runtime.
- 60fps scroll, no layout shift on pin (use `anticipatePin`, set explicit stage height).
- Responsive 360px → wide; nothing overflows; scroll-scrub section works on mobile (reduce pin length if needed).
- Lighthouse Performance ≥ 90.

Build all files completely. When done, print the run commands and a one-line summary of what to verify in the browser.
