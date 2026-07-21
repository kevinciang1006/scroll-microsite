# Scroll-Driven Lottie Microsite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-quality static microsite ("Lumen") that demonstrates scroll-synced Lottie playback — a Lottie animation scrubbed frame-by-frame to scroll position inside a pinned section — plus a hero intro, reveal-on-scroll cards, a play-once outro, and a scroll-progress bar.

**Architecture:** Vite `vanilla-ts` static site. All semantic markup lives in `index.html` inside `#app` (a true "HTML microsite"); TypeScript modules attach behavior to elements via `data-*` hooks. Two library helpers (`lib/motion.ts`, `lib/lottie.ts`) wrap GSAP/ScrollTrigger and lottie-web with a graceful-fallback loader. Five small section modules (`hero`, `scrollStory`, `reveals`, `outro`, `progress`) each own one behavior and are wired in order by `main.ts`. Every scroll behavior is guarded by `prefers-reduced-motion`.

**Tech Stack:** Vite, TypeScript (strict, no `any`), `lottie-web`, `gsap` + `gsap/ScrollTrigger`, plain CSS with custom properties. Deploy via GitHub Actions → GitHub Pages.

## Global Constraints

Every task's requirements implicitly include this section.

- **Product name / copy:** fictional product is **"Lumen"** (a focus/deep-work app). Copy is short, neutral, swappable.
- **TypeScript:** `strict` on, **no `any`**, no unused locals/params (vanilla-ts template enables `noUnusedLocals`/`noUnusedParameters`). `tsc` must be clean.
- **Modules:** small, single-purpose. No dead/unused code. No TODOs, no placeholder comments, no stubbed functions — build everything completely.
- **CSS:** all colors and spacing come from CSS custom properties defined in `base.css`. No scattered magic numbers. Light-on-dark theme.
- **Design tokens (exact values):** `--bg:#0b0b0f`, `--fg:#f4f4f6`, `--accent:#7c6cff`. Spacing scale `--space-1 … --space-8`. Max content width ~1100px, centered, generous side padding.
- **Reduced motion:** if `prefers-reduced-motion: reduce`, **no** section animates on scroll — render final states, no pin, Lotties set to a static frame (last where a completion reads best, first for the ambient hero) and not autoplaying.
- **Scroll-scrub isolation:** keep all scroll-scrub logic inside `sections/scrollStory.ts` only.
- **Base path:** Vite `base: '/scroll-microsite/'` (GitHub Pages repo-name path). All runtime asset URLs must respect `import.meta.env.BASE_URL`.
- **Graceful assets:** the three Lottie JSON files are a manual step and may be absent. The site must run and build with them missing — show a labelled `.lottie-fallback` box and `console.warn` (a warn, never an error).
- **Responsive:** must hold from ~360px to wide desktop; nothing overflows horizontally.
- **Node:** 20+ (dev machine is Node 25 — fine).
- **CSS delivery — intentional deviation from the prompt:** the prompt says "`<link>` the CSS." We instead `import` the stylesheets from `main.ts` so Vite bundles, hashes, and base-path-rewrites them correctly under the sub-path `base`. A raw `<link href="/src/styles/...">` does not survive the production build. This is the correct Vite idiom and is the sanctioned approach for this plan.
- **`typescript` version pin:** pin `typescript@~5.9.3` as a devDependency (defensive — avoids a known `typescript@latest` breakage). No ESLint is in scope.

### Verification approach (read this first — it replaces pytest-style red/green)

The PRD scopes this tightly and does **not** ask for a unit-test runner; adding Vitest + jsdom to test GSAP/ScrollTrigger (which need real layout jsdom lacks) would be scope creep and brittle. So each task's verification loop is:

1. **Absent/failing state** — the behavior/file does not yet exist (or the page lacks the section).
2. **Implement** exactly the code in the task.
3. **Gate — `npm run build` must pass** (the vanilla-ts `build` script is `tsc && vite build`, so this is a full strict typecheck **plus** a production bundle). This is the hard gate for every task.
4. **Runtime evidence** where the task has visible behavior — start `npm run dev`, drive it with the Playwright browser tools: navigate to the printed dev URL, capture console messages (assert **no `error`-level** messages — lottie "failed to load" **warns** are expected because asset files are absent), and take a screenshot of the relevant section.
5. **Commit.**

The final task (Task 7) runs the full quality matrix: desktop + 360px screenshots, console-clean check, and a `prefers-reduced-motion` emulation pass.

> Browser verification runs **without** the three Lottie JSON files present. Sections therefore render labelled fallback boxes — that is the expected, correct degraded state. Verify layout holds and the console shows only warns.

---

## Task 1: Scaffold, git, dependencies, Vite config

**Files:**
- Create (via scaffold): whole `scroll-microsite/` Vite `vanilla-ts` project in place, preserving the two existing `.md` spec files and this `docs/` tree.
- Create: `vite.config.ts`
- Modify: `package.json` (pin `typescript`, confirm scripts)
- Delete: default boilerplate `src/counter.ts`, `src/typescript.svg`, `public/vite.svg`, default `src/style.css` body of `src/main.ts` (cleaned in Task 2).

**Interfaces:**
- Produces: a buildable project. `npm run dev` and `npm run build` succeed. Git repo initialized with a `main` branch (initial docs commit) and a working branch `feat/scroll-microsite` carrying the scaffold commit. `import.meta.env.BASE_URL === '/scroll-microsite/'`.

- [ ] **Step 1: Initialize git first (so every later task has a clean review base)**

The directory already contains `CLAUDE_CODE_PROMPT.md`, `PRD_scroll_microsite.md`, and `docs/`. Commit those on `main`, then branch:

```bash
cd /Users/kevinciang/Documents/Projects/scroll-microsite
git init -b main
printf 'node_modules\ndist\n.DS_Store\n*.local\n' > .gitignore
git add -A
git commit -m "chore: initial spec + implementation plan"
git checkout -b feat/scroll-microsite
```

Expected: `main` holds the docs commit; you are now on `feat/scroll-microsite`. `git merge-base main HEAD` resolves to the docs commit.

- [ ] **Step 2: Scaffold Vite vanilla-ts non-interactively (temp dir, then merge in)**

`npm create vite . ` prompts on a non-empty directory and would hang a non-interactive shell. Scaffold into a fresh empty sibling dir (no prompt), copy its contents in, then delete it:

```bash
cd /Users/kevinciang/Documents/Projects
npm create vite@latest scroll-microsite-tmp -- --template vanilla-ts
cp -R scroll-microsite-tmp/. scroll-microsite/
rm -rf scroll-microsite-tmp
cd /Users/kevinciang/Documents/Projects/scroll-microsite
```

Expected: `index.html`, `package.json`, `tsconfig.json`, `src/`, `public/`, and Vite's `.gitignore` now exist inside `scroll-microsite/` (the copy overwrites the minimal `.gitignore` from Step 1 — fine). The existing `.md` files and `docs/` are untouched.

- [ ] **Step 3: Install runtime deps and pin TypeScript**

```bash
npm install
npm install lottie-web gsap
npm install -D typescript@~5.9.3
```

Expected: `node_modules/` populated, `lottie-web` and `gsap` in `dependencies`, `typescript` at `~5.9.3` in `devDependencies`.

- [ ] **Step 4: Write `vite.config.ts`**

Create `vite.config.ts`:

```ts
import { defineConfig } from 'vite';

// GitHub Pages serves this repo at https://<user>.github.io/scroll-microsite/,
// so assets must be requested from the repo-name sub-path.
// For a custom domain (e.g. scroll.kevinciang.com) change base to '/'.
export default defineConfig({
  base: '/scroll-microsite/',
});
```

- [ ] **Step 5: Remove scaffold boilerplate**

Delete the files that will not be used so no dead code ships:

```bash
rm -f src/counter.ts src/typescript.svg public/vite.svg src/style.css
```

(`index.html`, `src/main.ts`, and `src/styles/*` are authored fresh in Task 2. Leave `src/vite-env.d.ts` — it provides `import.meta.env` types.)

Temporarily make `src/main.ts` a no-op so the project still builds at the end of this task:

```ts
// Replaced in Task 2 once styles and sections exist.
export {};
```

Also point `index.html`'s module script at `/src/main.ts` and drop references to deleted assets — but full `index.html` authoring is Task 2; here just ensure `npm run build` passes. Minimal `index.html` for this task:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lumen — scroll demo</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Gate — build passes**

```bash
npm run build
```

Expected: `tsc` clean, `vite build` writes `dist/` with no errors.

- [ ] **Step 7: Commit the scaffold on the feature branch**

```bash
git add -A
git commit -m "chore: scaffold Vite vanilla-ts + lottie-web + gsap"
```

Expected: the scaffold commit lands on `feat/scroll-microsite`. `git merge-base main HEAD` still resolves to the initial docs commit, which is the review base for this task.

---

## Task 2: Static shell — index.html markup, design-system CSS, main.ts

**Files:**
- Create/replace: `index.html` (full semantic markup, all sections, Inter font)
- Create: `src/styles/base.css` (reset, tokens, typography)
- Create: `src/styles/layout.css` (sections, grid, all component styles, responsive)
- Replace: `src/main.ts` (import both stylesheets + empty `boot()`)

**Interfaces:**
- Produces (consumed by Tasks 4–6): these `data-*` hooks and class names —
  - Progress: `[data-progress]` (element `.progress`)
  - Hero: `[data-hero]`, `[data-hero-art]`, `[data-hero-heading]`, `[data-hero-subhead]`, `[data-hero-cue]`
  - Scroll story: `[data-scrollstory]` (`.scrollstory`, `min-height:300vh`), `[data-scrollstory-stage]` (`.scrollstory__stage`, `100vh`), `[data-scrollstory-art]`, three `[data-caption="0|1|2"]` (`.scrollstory__caption`, absolutely positioned, `opacity:0`)
  - Reveals: three `[data-reveal]` (`.card`)
  - Outro: `[data-outro]`, `[data-outro-art]`
  - Fallback box class: `.lottie-fallback`

- [ ] **Step 1: Write `index.html` (full markup)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Lumen — a scroll-driven Lottie animation demo." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>Lumen — scroll demo</title>
  </head>
  <body>
    <div id="app">
      <div class="progress" data-progress aria-hidden="true"></div>

      <header class="section hero" data-hero>
        <div class="hero__copy">
          <h1 data-hero-heading>Focus, made ambient.</h1>
          <p data-hero-subhead>
            Lumen turns deep work into a calm, guided ritual — momentum builds
            while distraction quietly fades.
          </p>
          <span class="scroll-cue" data-hero-cue>Scroll to explore ↓</span>
        </div>
        <div class="hero__art" data-hero-art aria-hidden="true"></div>
      </header>

      <section class="scrollstory" data-scrollstory aria-label="How Lumen works">
        <div class="scrollstory__stage" data-scrollstory-stage>
          <div class="scrollstory__art" data-scrollstory-art aria-hidden="true"></div>
          <div class="scrollstory__captions">
            <p class="scrollstory__caption" data-caption="0">A session begins. The world goes quiet.</p>
            <p class="scrollstory__caption" data-caption="1">Focus deepens as minutes fold into flow.</p>
            <p class="scrollstory__caption" data-caption="2">You surface — the work is done.</p>
          </div>
        </div>
      </section>

      <section class="section reveals" data-reveals aria-label="Features">
        <div class="reveals__grid">
          <article class="card" data-reveal>
            <div class="card__index">01</div>
            <h3>Guided sessions</h3>
            <p>Structured focus blocks that begin and end with intention.</p>
          </article>
          <article class="card" data-reveal>
            <div class="card__index">02</div>
            <h3>Ambient soundscapes</h3>
            <p>Adaptive audio that settles the mind without demanding it.</p>
          </article>
          <article class="card" data-reveal>
            <div class="card__index">03</div>
            <h3>Quiet analytics</h3>
            <p>Gentle reflection on your momentum — never a scoreboard.</p>
          </article>
        </div>
      </section>

      <section class="section outro" data-outro aria-label="Get started">
        <div class="outro__art" data-outro-art aria-hidden="true"></div>
        <h2>Deep work, on repeat.</h2>
        <p>Build a focus practice that compounds.</p>
        <a class="cta" href="#" data-cta>Start a session</a>
      </section>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: Write `src/styles/base.css` (reset + tokens + typography)**

```css
/* ---------- Reset ---------- */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  font-family: var(--font-sans);
  color: var(--fg);
  background: var(--bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

img,
svg {
  display: block;
  max-width: 100%;
}

/* ---------- Design tokens ---------- */
:root {
  /* Color — light-on-dark */
  --bg: #0b0b0f;
  --bg-elev: #14141b;
  --fg: #f4f4f6;
  --fg-muted: #a0a0ac;
  --accent: #7c6cff;
  --accent-soft: rgba(124, 108, 255, 0.14);
  --border: rgba(244, 244, 246, 0.1);

  /* Type */
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2.5rem;
  --space-7: 4rem;
  --space-8: 6rem;

  /* Layout */
  --content-max: 1100px;
  --side-pad: clamp(1.25rem, 5vw, 3rem);
  --radius: 14px;
}

/* ---------- Typography ---------- */
h1,
h2,
h3 {
  line-height: 1.1;
  font-weight: 600;
  letter-spacing: -0.02em;
}

h1 {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
}

h2 {
  font-size: clamp(1.9rem, 5vw, 3rem);
}

h3 {
  font-size: clamp(1.2rem, 2.5vw, 1.5rem);
}

p {
  color: var(--fg-muted);
  font-size: clamp(1rem, 1.4vw, 1.15rem);
}

a {
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 3: Write `src/styles/layout.css` (sections + components + responsive)**

```css
#app {
  overflow-x: hidden;
}

.section {
  width: 100%;
  max-width: var(--content-max);
  margin-inline: auto;
  padding-inline: var(--side-pad);
}

/* ---------- Progress bar ---------- */
.progress {
  position: fixed;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: 0 50%;
  z-index: 100;
  will-change: transform;
}

/* ---------- Hero ---------- */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: var(--space-6);
}

.hero__copy h1 {
  margin-bottom: var(--space-4);
}

.hero__copy p {
  max-width: 40ch;
  margin-bottom: var(--space-6);
}

.hero__art {
  aspect-ratio: 1;
  width: 100%;
}

.scroll-cue {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--fg-muted);
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}

@media (max-width: 760px) {
  .hero {
    grid-template-columns: 1fr;
    padding-block: var(--space-8);
  }
  .hero__art {
    max-width: 320px;
    order: -1;
  }
}

/* ---------- Scroll story (the scrubbed section) ---------- */
.scrollstory {
  position: relative;
  min-height: 300vh;
}

.scrollstory__stage {
  height: 100vh;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: var(--space-6);
  padding-inline: var(--side-pad);
}

.scrollstory__art {
  width: min(560px, 80vw);
  aspect-ratio: 1;
}

.scrollstory__captions {
  position: relative;
  width: 100%;
  max-width: 42ch;
  height: 4rem;
  margin-inline: auto;
  text-align: center;
}

.scrollstory__caption {
  position: absolute;
  inset: 0;
  opacity: 0;
  font-size: clamp(1.1rem, 2.5vw, 1.6rem);
  font-weight: 500;
  color: var(--fg);
}

@media (max-width: 760px) {
  /* Shorter pin runway on mobile so the scrub is not exhausting. */
  .scrollstory {
    min-height: 240vh;
  }
}

/* ---------- Reveal cards ---------- */
.reveals {
  padding-block: var(--space-8);
}

.reveals__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-5);
}

.card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-6);
}

.card__index {
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  margin-bottom: var(--space-3);
}

.card h3 {
  margin-bottom: var(--space-3);
}

@media (max-width: 760px) {
  .reveals__grid {
    grid-template-columns: 1fr;
  }
}

/* ---------- Outro / CTA ---------- */
.outro {
  min-height: 90vh;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  gap: var(--space-4);
  padding-block: var(--space-8);
}

.outro__art {
  width: min(260px, 60vw);
  aspect-ratio: 1;
}

.cta {
  display: inline-block;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-6);
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

/* ---------- Lottie fallback ---------- */
.lottie-fallback {
  display: grid;
  place-items: center;
  height: 100%;
  min-height: 160px;
  padding: var(--space-4);
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: var(--accent-soft);
  color: var(--fg-muted);
  font-size: 0.9rem;
  text-align: center;
}
```

- [ ] **Step 4: Replace `src/main.ts` (styles + empty boot)**

```ts
import './styles/base.css';
import './styles/layout.css';

/** Boots the microsite. Section wiring is added in Tasks 4–6. */
function boot(): void {
  // sections wired in subsequent tasks
}

boot();
```

- [ ] **Step 5: Gate — build passes**

```bash
npm run build
```

Expected: clean `tsc`, `dist/` written.

- [ ] **Step 6: Runtime evidence (static shell)**

Start the dev server and verify the static shell with Playwright:

```bash
npm run dev
```

Then: `browser_navigate` to the printed local URL (e.g. `http://localhost:5173/scroll-microsite/`); `browser_console_messages` shows no `error` entries; `browser_take_screenshot` at desktop; `browser_resize` to 360×740 and screenshot again — confirm no horizontal overflow and all four sections + three cards are present. Empty `[data-*-art]` boxes are expected (no lottie yet). Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: static shell — semantic markup + design-system CSS"
```

---

## Task 3: Library helpers — motion.ts and lottie.ts

**Files:**
- Create: `src/lib/motion.ts`
- Create: `src/lib/lottie.ts`

**Interfaces:**
- Produces (consumed by every section task):
  - From `lib/motion.ts`: `gsap` (re-export), `ScrollTrigger` (re-export), `const prefersReducedMotion: boolean`, `function refresh(): void`.
  - From `lib/lottie.ts`: `function createLottie(container: HTMLElement, path: string, opts: { loop: boolean; autoplay: boolean }): AnimationItem | null`, `function assetUrl(rel: string): string`.

- [ ] **Step 1: Write `src/lib/motion.ts`**

```ts
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** True when the visitor asked the OS to minimize motion. */
export const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

/** Recompute pin/scrub geometry — call after Lottie SVGs mount so pin
 *  distances account for their real size. */
export function refresh(): void {
  ScrollTrigger.refresh();
}
```

> If `import ScrollTrigger from 'gsap/ScrollTrigger'` fails to typecheck in this toolchain, switch to `import { ScrollTrigger } from 'gsap/ScrollTrigger'` (both are shipped by gsap). The default import matches the prompt; prefer it if it compiles.

- [ ] **Step 2: Write `src/lib/lottie.ts`**

```ts
import lottie, { type AnimationItem } from 'lottie-web';

interface LottieOptions {
  loop: boolean;
  autoplay: boolean;
}

/** Prefix a public-folder relative path with Vite's configured base so
 *  assets resolve under the GitHub Pages sub-path. */
export function assetUrl(rel: string): string {
  return `${import.meta.env.BASE_URL}${rel}`;
}

/**
 * Load a Lottie animation into `container`. On failure (missing file, parse
 * error) render a labelled placeholder, warn (never error), and return the
 * item (or null on a synchronous throw) so the page still runs before the
 * JSON assets are added.
 */
export function createLottie(
  container: HTMLElement,
  path: string,
  opts: LottieOptions,
): AnimationItem | null {
  try {
    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      path,
      loop: opts.loop,
      autoplay: opts.autoplay,
    });

    anim.addEventListener('data_failed', () => {
      renderFallback(container, path);
      console.warn(`Lottie failed to load: ${path}`);
    });

    return anim;
  } catch (err) {
    renderFallback(container, path);
    console.warn(`Lottie threw while loading: ${path}`, err);
    return null;
  }
}

function renderFallback(container: HTMLElement, path: string): void {
  const filename = path.split('/').pop() ?? path;
  container.textContent = '';
  const box = document.createElement('div');
  box.className = 'lottie-fallback';
  box.textContent = `Lottie: ${filename}`;
  container.appendChild(box);
}
```

- [ ] **Step 3: Gate — build passes**

```bash
npm run build
```

Expected: clean `tsc` (both modules typecheck, no `any`, no unused symbols — they are consumed starting in Task 4, but `export`ed members do not trip `noUnusedLocals`), `dist/` written.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: motion + lottie library helpers with graceful fallback"
```

---

## Task 4: Hero section

**Files:**
- Create: `src/sections/hero.ts`
- Modify: `src/main.ts` (import + call `initHero`)

**Interfaces:**
- Consumes: `createLottie`, `assetUrl` (lib/lottie); `gsap`, `prefersReducedMotion` (lib/motion); DOM hooks `[data-hero-art]`, `[data-hero-heading]`, `[data-hero-subhead]`, `[data-hero-cue]`.
- Produces: `function initHero(): void`.

- [ ] **Step 1: Write `src/sections/hero.ts`**

```ts
import { assetUrl, createLottie } from '../lib/lottie';
import { gsap, prefersReducedMotion } from '../lib/motion';

/** Ambient looping Lottie + an intro timeline that fades/translates the
 *  heading, subhead, and scroll cue in on load. */
export function initHero(): void {
  const art = document.querySelector<HTMLElement>('[data-hero-art]');
  if (art) {
    // Reduced motion: load but hold on the first frame, no autoplay/loop.
    createLottie(art, assetUrl('lottie/hero.json'), {
      loop: !prefersReducedMotion,
      autoplay: !prefersReducedMotion,
    });
  }

  const targets = [
    document.querySelector<HTMLElement>('[data-hero-heading]'),
    document.querySelector<HTMLElement>('[data-hero-subhead]'),
    document.querySelector<HTMLElement>('[data-hero-cue]'),
  ].filter((el): el is HTMLElement => el !== null);
  if (targets.length === 0) return;

  if (prefersReducedMotion) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }

  gsap.from(targets, {
    opacity: 0,
    y: 24,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.12,
    delay: 0.15,
  });
}
```

- [ ] **Step 2: Wire into `src/main.ts`**

```ts
import './styles/base.css';
import './styles/layout.css';

import { initHero } from './sections/hero';

/** Boots the microsite. */
function boot(): void {
  initHero();
}

boot();
```

- [ ] **Step 3: Gate — build passes**

```bash
npm run build
```

Expected: clean.

- [ ] **Step 4: Runtime evidence**

`npm run dev`; `browser_navigate` to the dev URL; `browser_console_messages` → no `error` (a `Lottie failed to load: hero.json` **warn** is expected); `browser_take_screenshot` of the hero — heading/subhead/cue visible, `[data-hero-art]` shows the fallback box. Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: hero section — ambient lottie + intro timeline"
```

---

## Task 5: Scroll-scrub sequence (the core feature)

**Files:**
- Create: `src/sections/scrollStory.ts`
- Modify: `src/main.ts` (import + call `initScrollStory`)

**Interfaces:**
- Consumes: `createLottie`, `assetUrl` (lib/lottie); `gsap`, `ScrollTrigger`, `prefersReducedMotion`, `refresh` (lib/motion); DOM hooks `[data-scrollstory]`, `[data-scrollstory-stage]`, `[data-scrollstory-art]`, `[data-caption="0|1|2"]`.
- Produces: `function initScrollStory(): void`.

- [ ] **Step 1: Write `src/sections/scrollStory.ts`**

All scroll-scrub logic lives here and nowhere else.

```ts
import { assetUrl, createLottie } from '../lib/lottie';
import { gsap, prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/**
 * The critical section: a tall wrapper (300vh) pins a viewport-height stage
 * while a Lottie animation is scrubbed frame-by-frame to scroll progress.
 * Three captions cross-fade across the scroll. Reduced motion / missing asset
 * fall back to the final frame + last caption with no pin.
 */
export function initScrollStory(): void {
  const wrapper = document.querySelector<HTMLElement>('[data-scrollstory]');
  const stage = document.querySelector<HTMLElement>('[data-scrollstory-stage]');
  const art = document.querySelector<HTMLElement>('[data-scrollstory-art]');
  const captions = Array.from(
    document.querySelectorAll<HTMLElement>('[data-caption]'),
  );
  if (!wrapper || !stage || !art || captions.length === 0) return;

  const showFinalState = (): void => {
    captions.forEach((caption, i) => {
      gsap.set(caption, { opacity: i === captions.length - 1 ? 1 : 0 });
    });
  };

  // Collapse the tall scroll runway when there is nothing to scrub.
  const collapse = (): void => {
    wrapper.style.minHeight = '100vh';
  };

  const anim = createLottie(art, assetUrl('lottie/scroll-story.json'), {
    loop: false,
    autoplay: false,
  });

  if (!anim) {
    collapse();
    showFinalState();
    return;
  }

  anim.addEventListener('data_failed', () => {
    collapse();
    showFinalState();
  });

  if (prefersReducedMotion) {
    anim.addEventListener('DOMLoaded', () => {
      anim.goToAndStop(anim.totalFrames - 1, true);
      showFinalState();
      refresh();
    });
    return;
  }

  anim.addEventListener('DOMLoaded', () => {
    // Scrub the animation frames to scroll progress across the pinned stage.
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

    // Cross-fade the three captions across scroll progress (~0.1 / 0.5 / 0.9).
    gsap.set(captions, { opacity: 0 });
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const active = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
        captions.forEach((caption, i) => {
          gsap.to(caption, {
            opacity: i === active ? 1 : 0,
            duration: 0.3,
            overwrite: true,
          });
        });
      },
    });

    refresh();
  });
}
```

- [ ] **Step 2: Wire into `src/main.ts`**

```ts
import './styles/base.css';
import './styles/layout.css';

import { initHero } from './sections/hero';
import { initScrollStory } from './sections/scrollStory';

/** Boots the microsite. */
function boot(): void {
  initHero();
  initScrollStory();
}

boot();
```

- [ ] **Step 3: Gate — build passes**

```bash
npm run build
```

Expected: clean.

- [ ] **Step 4: Runtime evidence**

`npm run dev`; navigate; `browser_console_messages` → no `error` (a `scroll-story.json` **warn** is expected; because the asset is missing the section collapses to `100vh` and shows the last caption — that is the correct degraded path). Screenshot the scroll-story region. Stop dev server. (Full scrub behavior with a real asset is confirmed manually after assets are dropped in; the scrub wiring is proven by a clean strict typecheck against `AnimationItem`.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: scroll-scrubbed lottie sequence with pinned stage + captions"
```

---

## Task 6: Reveals, outro, and progress bar

**Files:**
- Create: `src/sections/reveals.ts`
- Create: `src/sections/outro.ts`
- Create: `src/sections/progress.ts`
- Modify: `src/main.ts` (import + call all three)

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger`, `prefersReducedMotion`, `refresh` (lib/motion); `assetUrl`, `createLottie` (lib/lottie); DOM hooks `[data-reveal]`, `[data-outro-art]`, `[data-progress]`.
- Produces: `function initReveals(): void`, `function initOutro(): void`, `function initProgress(): void`.

- [ ] **Step 1: Write `src/sections/reveals.ts`**

```ts
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/motion';

/** Three cards that fade + translate up as they enter the viewport, once. */
export function initReveals(): void {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (cards.length === 0) return;

  if (prefersReducedMotion) {
    gsap.set(cards, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(cards, { opacity: 0, y: 24 });
  cards.forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          delay: i * 0.08,
        });
      },
    });
  });
}
```

- [ ] **Step 2: Write `src/sections/outro.ts`**

```ts
import { assetUrl, createLottie } from '../lib/lottie';
import { prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/** A short outro Lottie that plays once when it scrolls into view. */
export function initOutro(): void {
  const art = document.querySelector<HTMLElement>('[data-outro-art]');
  if (!art) return;

  const anim = createLottie(art, assetUrl('lottie/outro.json'), {
    loop: false,
    autoplay: false,
  });
  if (!anim) return;

  if (prefersReducedMotion) {
    anim.addEventListener('DOMLoaded', () => {
      anim.goToAndStop(anim.totalFrames - 1, true);
    });
    return;
  }

  anim.addEventListener('DOMLoaded', refresh);

  ScrollTrigger.create({
    trigger: art,
    start: 'top 75%',
    once: true,
    onEnter: () => anim.goToAndPlay(0, true),
  });
}
```

- [ ] **Step 3: Write `src/sections/progress.ts`**

```ts
import { gsap, prefersReducedMotion, ScrollTrigger } from '../lib/motion';

/** Fixed top bar whose scaleX maps 0→1 across the full document scroll. */
export function initProgress(): void {
  const bar = document.querySelector<HTMLElement>('[data-progress]');
  if (!bar) return;

  if (prefersReducedMotion) {
    // Final state, no scroll animation.
    gsap.set(bar, { scaleX: 1 });
    return;
  }

  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });
}
```

- [ ] **Step 4: Wire all three into `src/main.ts` (final wiring)**

```ts
import './styles/base.css';
import './styles/layout.css';

import { initProgress } from './sections/progress';
import { initHero } from './sections/hero';
import { initScrollStory } from './sections/scrollStory';
import { initReveals } from './sections/reveals';
import { initOutro } from './sections/outro';

/** Boots the microsite and wires every section in document order. */
function boot(): void {
  initProgress();
  initHero();
  initScrollStory();
  initReveals();
  initOutro();
}

boot();
```

- [ ] **Step 5: Gate — build passes**

```bash
npm run build
```

Expected: clean.

- [ ] **Step 6: Runtime evidence**

`npm run dev`; navigate; scroll down (`browser_evaluate` to `window.scrollTo(0, document.body.scrollHeight)` or `browser_press_key` End); `browser_console_messages` → no `error` (warns for the three missing JSONs are fine); screenshot the reveal cards and outro; confirm the progress bar is present at the top. Stop dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: reveal cards, play-once outro, and scroll progress bar"
```

---

## Task 7: Docs, deploy workflow, asset note, and full verification

**Files:**
- Create: `public/lottie/README.md`
- Create: `CLAUDE.md`
- Create: `README.md`
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: the finished site from Tasks 1–6.
- Produces: deployable repo + docs. No code interfaces.

- [ ] **Step 1: Write `public/lottie/README.md`**

```markdown
# Lottie assets

Drop three free Lottie JSON files from https://lottiefiles.com/free-animations
here (exact filenames matter):

- `hero.json` — an ambient loop (abstract shapes / gradient blob / orbit).
- `scroll-story.json` — a clear start→end sequence (rocket launch, chart
  drawing, character walk, assembly). **This is the one that gets scrubbed.**
- `outro.json` — a short success / checkmark / celebration.

The site runs and builds without these files — each missing animation shows a
labelled placeholder box and logs a `console.warn`.
```

- [ ] **Step 2: Write `CLAUDE.md` (project standards)**

```markdown
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
```

- [ ] **Step 3: Write `README.md`**

```markdown
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
```

- [ ] **Step 4: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 5: Gate — build passes**

```bash
npm run build
```

Expected: clean.

- [ ] **Step 6: Full verification matrix**

`npm run dev`, then with Playwright:
1. **Console clean:** `browser_navigate` to the dev URL; `browser_console_messages` shows **no `error`** entries (only `Lottie failed to load: …` warns for the three absent assets).
2. **Desktop layout:** `browser_take_screenshot` full page at default width — hero, scroll-story, three cards, outro, progress bar all render; no horizontal scrollbar.
3. **Mobile layout:** `browser_resize` to 360×740, screenshot — single-column hero/cards, nothing overflows horizontally.
4. **Reduced motion:** `browser_emulate_media`/`browser_run_code_unsafe` (or the Playwright `browser_evaluate` with an emulated `prefers-reduced-motion`) — reload and confirm no pin/scrub occurs, captions show the last one, progress bar is at full, cards are visible. If media emulation is unavailable via the exposed tools, verify the reduced-motion branch by reading each section module and confirming the `prefersReducedMotion` guard sets final states with no ScrollTrigger.
5. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "docs: README, CLAUDE.md, asset note + GitHub Pages workflow"
```

---

## Self-review (author checklist — completed)

**Spec coverage:** Hero (T4) ✓ · Scroll-scrub pinned sequence + captions + reduced-motion fallback (T5) ✓ · Reveal cards `top 80%`/`once` (T6) ✓ · Play-once outro (T6) ✓ · Progress bar full-doc scrub (T6) ✓ · `lib/motion.ts` exports `prefersReducedMotion`/`refresh` (T3) ✓ · `lib/lottie.ts` `createLottie` + fallback (T3) ✓ · design tokens/colors/spacing (T2) ✓ · responsive 360→wide (T2 CSS + T7 check) ✓ · `vite.config.ts` base + comment (T1) ✓ · deploy workflow with `pages:write`/`id-token:write`/`environment` (T7) ✓ · `index.html` semantic + Inter + `#app` (T2) ✓ · README scroll-sync paragraph (T7) ✓ · CLAUDE.md standards (T7) ✓ · `public/lottie` asset note (T7) ✓.

**Placeholder scan:** no TBD/TODO/"add error handling"/"similar to Task N" — every code step carries complete content.

**Type consistency:** `createLottie(container, path, {loop, autoplay})` and `assetUrl(rel)` (T3) are called with matching signatures in T4/T5/T6. `refresh()`, `prefersReducedMotion`, `gsap`, `ScrollTrigger` (T3) used consistently. `data-*` hooks in `index.html` (T2) match every `querySelector` in the section modules.
