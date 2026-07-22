# "Latent" Darkroom Design Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Rebuild the microsite's presentation layer to match the "Latent" darkroom Claude Design export pixel-for-pixel, and re-wire the existing lottie-web + GSAP/ScrollTrigger behavior onto the new markup — the page "develops" (a print resolving under a safelight) as you scroll.

**Architecture:** Keep the Vite `vanilla-ts` project and `lib/motion.ts` (GSAP/ScrollTrigger) + `lib/lottie.ts` (graceful loader). Replace `index.html` with the ported static Latent markup, replace the stylesheet layer with darkroom tokens + component CSS (exact values from the export, colors tokenized), and re-wire the section modules to new `data-*` hooks: a fixed **sprocket rail** (document-scroll frame counter + fill), an **ambient hero Lottie** (light-leak fallback), the pinned **develop** frame-scrub (Lottie + big counter + 3 caption cross-fades + receding safelight bloom), **contact-sheet** reveals, and a play-once **outro** Lottie.

**Tech Stack:** Vite, TypeScript (strict, no `any`), `lottie-web`, `gsap`/`ScrollTrigger`, plain CSS custom properties. Fonts: Space Grotesk, Inter, IBM Plex Mono. Deploy: GitHub Pages via Actions (unchanged).

## Global Constraints

Every task's requirements implicitly include this section.

- **Design is the visual source of truth.** Preserve the export's look exactly. Do not redesign, do not add elements beyond what this plan specifies. Use the exact values below.
- **Named color tokens (exact hex):** `--ink #141210` (base), `--ink-raise #1E1A16` (panels), `--ink-deep #0F0D0B` (frame interior), `--paper #ECE6D9` (text/developed), `--safelight #F2792B` (amber — **glow only**, never a flat fill/solid button), `--fixer #93A7AE` (cool silver-blue: mono meta, captions, hairlines). Film grain ~3% (`opacity:0.03`).
- **Fonts (via `<link>`):** Space Grotesk (500/700 — display + big counters), Inter (400/500 — body), IBM Plex Mono (400/500 — counters, EXIF meta, kickers, captions). Exact Google Fonts URL is in the Task 1 `index.html`.
- **Copy (verbatim):** kicker `DEVELOPING`; hero H1 "Every frame starts in the dark." (accent word "dark."); meta `ISO 400 · f/2.8 · 1/125`; develop captions "Latent." / "Fixing." / "Fixed."; develop recipe `D-76 · 20°C · 8 MIN`; contact kicker `CONTACT SHEET` + "The exposures that made the cut."; outro `EDITION OF 12 · GELATIN SILVER`, H2 "We shoot on film so the moment has to be true.", CTA "BOOK A SITTING →", footer "LATENT STUDIO · SINCE 2011 · SHOT ON 35MM".
- **Sequence length:** `FRAME_COUNT = 120` drives both the rail counter and the develop counter (design default). Rail counter = whole-document scroll progress; develop counter = develop-section progress.
- **Develop behavior parity (from the export's DCLogic):** caption cross-fade centers `[0.16, 0.5, 0.84]`, opacity `max(0, 1 - |p - center| / 0.24)`; safelight bloom opacity `max(0.12, 0.95 - p*0.82)`.
- **Contact cells:** styled dark placeholder panels (no real images) — the design's empty-slot look.
- **Hero ambient Lottie:** mount `hero.json` in the right-bleed slot with `fallback:false` so a missing asset leaves the CSS light-leak (no labelled box).
- **TypeScript:** strict, **no `any`**, `verbatimModuleSyntax` (type-only imports use the `type` modifier), `noUnusedLocals`/`noUnusedParameters` (import only what a file references as a symbol). `npm run build` (`tsc && vite build`) must be clean.
- **Reduced motion:** `prefers-reduced-motion: reduce` → developed end-states, no pin, no scrub, Lotties on final frame; captions show "Fixed.", counters at 120, rail full, bloom at rest, reveals visible. The export's `<style>` already resets `[data-anim]`/`[data-leak]`/`[data-grain]` via a media query — keep that.
- **Responsive to ~360px:** develop frame stays the hero on mobile; shorten the pin runway (`.develop` height 240vh on mobile) rather than dropping the effect. Nothing overflows horizontally.
- **Keep deployable:** `vite.config.ts` `base: '/scroll-microsite/'` and the Pages workflow unchanged. Asset URLs go through `assetUrl` (respects `base`).
- **Verification (no unit-test runner in scope):** each task gates on `npm run build` clean; visual/behavior tasks add a Playwright pass (navigate `http://localhost:<port>/scroll-microsite/`, `browser_console_messages` shows no app `console.error`/uncaught JS exception — the three absent Lottie JSONs produce expected `Lottie failed to load` **warns** + network 404s only). `npm run dev` may need sandbox-disabled on an EPERM port-listen (expected harness quirk).

---

## Task 1: Global chrome — index.html markup, tokens, grain, sprocket rail

**Files:**
- Replace: `index.html`
- Replace: `src/styles/base.css`
- Create: `src/styles/latent.css`
- Replace: `src/main.ts`
- Add export: `src/lib/motion.ts` (append `FRAME_COUNT`)

**Interfaces — `data-*` hooks produced (consumed by Tasks 4–6):** `[data-grain]`, `[data-rail-num]`, `[data-rail-fill]`, `[data-leak]`, `[data-hero-art]`, hero `[data-anim]` (×4), `[data-develop]`, `[data-develop-stage]`, `[data-develop-art]`, `[data-develop-bloom]`, `[data-develop-counter]`, `[data-develop-denom]`, `[data-caption="0|1|2"]`, `[data-exp]` (contact head + 6 figures + 4 outro items), `[data-outro-art]`. Classes: `.reveal`/`.is-in`, `.lottie-fallback`.

- [ ] **Step 1: Append `FRAME_COUNT` to `src/lib/motion.ts`**

Add after the existing exports:

```ts
/** Sequence length for the darkroom frame counters (rail + develop). */
export const FRAME_COUNT = 120;
```

- [ ] **Step 2: Write `index.html` (full static Latent markup)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Latent — a scroll-driven darkroom microsite where the image develops as you scroll." />
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23141210'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%23F2792B'/%3E%3C/svg%3E" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <title>Latent — scroll demo</title>
  </head>
  <body>
    <div id="app" class="latent-root">
      <div class="grain" data-grain aria-hidden="true"></div>

      <div class="rail" aria-hidden="true">
        <div class="rail__perf rail__perf--l"></div>
        <div class="rail__perf rail__perf--r"></div>
        <div class="rail__fill" data-rail-fill></div>
        <div class="rail__badge">
          <span class="rail__label">FRM</span>
          <span class="rail__num" data-rail-num>000</span>
        </div>
      </div>

      <main class="latent-main">
        <!-- HERO -->
        <section class="hero">
          <div class="hero__leak" data-leak aria-hidden="true"></div>
          <div class="hero__art" data-hero-art aria-hidden="true"></div>
          <div class="hero__glow-cool" aria-hidden="true"></div>
          <div class="hero__inner">
            <div class="hero__kicker" data-anim>
              <span class="hero__dot"></span>
              <span class="hero__kicker-text">DEVELOPING</span>
            </div>
            <h1 class="hero__title" data-anim>Every&nbsp;frame<br />starts in<br />the <span class="hero__title-accent">dark.</span></h1>
            <div class="hero__meta" data-anim>
              <span class="hero__meta-text">ISO 400 · f/2.8 · 1/125</span>
              <span class="hero__rule"></span>
            </div>
            <div class="hero__cue" data-anim>
              <span class="hero__cue-text">SCROLL TO DEVELOP</span>
              <span class="hero__cue-arrow">↓</span>
            </div>
          </div>
        </section>

        <!-- DEVELOP (signature) -->
        <section class="develop" data-develop aria-label="Develop">
          <div class="develop__stage" data-develop-stage>
            <div class="develop__grid">
              <div class="develop__frame">
                <div class="develop__window">
                  <div class="develop__art" data-develop-art></div>
                  <div class="develop__bloom" data-develop-bloom aria-hidden="true"></div>
                  <div class="develop__vignette" aria-hidden="true"></div>
                </div>
                <div class="develop__frame-label">FRAME</div>
              </div>
              <div class="develop__meta">
                <div class="develop__counter">
                  <span class="develop__counter-num" data-develop-counter>000</span>
                  <span class="develop__counter-denom">/ <span data-develop-denom>120</span></span>
                </div>
                <div class="develop__captions">
                  <span class="develop__caption" data-caption="0">Latent.</span>
                  <span class="develop__caption develop__caption--fixing" data-caption="1">Fixing.</span>
                  <span class="develop__caption" data-caption="2">Fixed.</span>
                </div>
                <p class="develop__desc">Nothing is on the paper yet. Then it is. The image was always there — waiting under the safelight for the chemistry to catch up.</p>
                <div class="develop__recipe">D-76 · 20°C · 8 MIN</div>
              </div>
            </div>
          </div>
        </section>

        <!-- CONTACT SHEET -->
        <section class="contact" aria-label="Contact sheet">
          <div class="contact__inner">
            <div class="contact__head reveal" data-exp>
              <span class="contact__kicker">CONTACT SHEET</span>
              <span class="contact__title">The exposures that made the cut.</span>
            </div>
            <div class="contact__grid">
              <figure class="exposure reveal" data-exp>
                <div class="exposure__frame"><div class="exposure__window"></div><span class="exposure__no">01</span></div>
                <figcaption class="exposure__exif">f/4 · 1/60 · ISO 200</figcaption>
              </figure>
              <figure class="exposure reveal" data-exp>
                <div class="exposure__frame"><div class="exposure__window"></div><span class="exposure__no">02</span></div>
                <figcaption class="exposure__exif">f/2 · 1/250 · ISO 400</figcaption>
              </figure>
              <figure class="exposure reveal" data-exp>
                <div class="exposure__frame"><div class="exposure__window"></div><span class="exposure__no">03</span></div>
                <figcaption class="exposure__exif">f/5.6 · 1/125 · ISO 100</figcaption>
              </figure>
              <figure class="exposure reveal" data-exp>
                <div class="exposure__frame"><div class="exposure__window"></div><span class="exposure__no">04</span></div>
                <figcaption class="exposure__exif">f/1.8 · 1/500 · ISO 800</figcaption>
              </figure>
              <figure class="exposure reveal" data-exp>
                <div class="exposure__frame"><div class="exposure__window"></div><span class="exposure__no">05</span></div>
                <figcaption class="exposure__exif">f/8 · 1/30 · ISO 200</figcaption>
              </figure>
              <figure class="exposure reveal" data-exp>
                <div class="exposure__frame"><div class="exposure__window"></div><span class="exposure__no">06</span></div>
                <figcaption class="exposure__exif">f/2.8 · 1/1000 · ISO 400</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <!-- OUTRO -->
        <section class="outro" aria-label="Outro">
          <div class="outro__glow" aria-hidden="true"></div>
          <div class="outro__print reveal" data-exp>
            <div class="outro__print-window"><div class="outro__art" data-outro-art></div></div>
          </div>
          <span class="outro__edition reveal" data-exp style="transition-delay:.15s">EDITION OF 12 · GELATIN SILVER</span>
          <h2 class="outro__title reveal" data-exp style="transition-delay:.25s">We shoot on film so the moment has to be true.</h2>
          <a class="outro__cta reveal" data-exp style="transition-delay:.35s" href="#">BOOK A SITTING <span aria-hidden="true">→</span></a>
          <span class="outro__footer">LATENT STUDIO · SINCE 2011 · SHOT ON 35MM</span>
        </section>
      </main>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Write `src/styles/base.css` (tokens, reset, keyframes, reduced-motion)**

```css
:root {
  --ink: #141210;
  --ink-raise: #1e1a16;
  --ink-deep: #0f0d0b;
  --paper: #ece6d9;
  --safelight: #f2792b;
  --fixer: #93a7ae;

  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

  --content-max: 1100px;
  --rail-w: 60px;
  --pad-left: clamp(84px, 10vw, 150px);
  --pad-x: clamp(28px, 6vw, 90px);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-body);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

img,
svg {
  display: block;
  max-width: 100%;
}

a {
  color: var(--paper);
  text-decoration: none;
}
a:hover {
  color: var(--safelight);
}

::selection {
  background: rgba(242, 121, 43, 0.3);
  color: var(--paper);
}

:focus-visible {
  outline: 2px solid var(--safelight);
  outline-offset: 3px;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes rule-in {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes leak {
  0% { transform: translate3d(-6%, -4%, 0) scale(1.05); opacity: 0.55; }
  50% { transform: translate3d(5%, 3%, 0) scale(1.15); opacity: 0.8; }
  100% { transform: translate3d(-6%, -4%, 0) scale(1.05); opacity: 0.55; }
}
@keyframes drift {
  0% { background-position: 0 0; }
  100% { background-position: 120px 90px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  [data-anim] { animation: none !important; opacity: 1 !important; transform: none !important; }
  [data-leak] { animation: none !important; }
  [data-grain] { animation: none !important; }
  .hero__cue-arrow { animation: none !important; }
}
```

- [ ] **Step 4: Write `src/styles/latent.css` (grain + sprocket rail only for this task)**

```css
.latent-root {
  position: relative;
  background: var(--ink);
}

/* ---- Film grain ---- */
.grain {
  position: fixed;
  inset: 0;
  z-index: 90;
  pointer-events: none;
  mix-blend-mode: soft-light;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: drift 5s steps(4) infinite;
}

/* ---- Sprocket rail ---- */
.rail {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--rail-w);
  z-index: 80;
  background: var(--ink-raise);
  border-right: 1px solid rgba(147, 167, 174, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.rail__perf {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0 12px,
    rgba(147, 167, 174, 0.14) 12px 26px,
    transparent 26px 30px
  );
  border-radius: 2px;
}
.rail__perf--l { left: 14px; }
.rail__perf--r { right: 14px; }
.rail__fill {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 0%;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, rgba(242, 121, 43, 0.9), rgba(242, 121, 43, 0.15));
  box-shadow: 0 0 10px 1px rgba(242, 121, 43, 0.5);
}
.rail__badge {
  position: relative;
  z-index: 2;
  background: var(--ink);
  border: 1px solid rgba(147, 167, 174, 0.25);
  border-radius: 4px;
  padding: 9px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  box-shadow: 0 0 18px rgba(20, 18, 16, 0.9);
}
.rail__label {
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 1.5px;
  color: var(--fixer);
}
.rail__num {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 500;
  color: var(--paper);
}

/* ---- Reveal primitive (used by contact + outro; styled here, wired in Task 6) ---- */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s cubic-bezier(0.2, 0.7, 0.2, 1),
    transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.reveal.is-in {
  opacity: 1;
  transform: none;
}

/* ---- Lottie fallback (fits the darkroom frame look) ---- */
.lottie-fallback {
  display: grid;
  place-items: center;
  height: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px dashed rgba(147, 167, 174, 0.3);
  background: var(--ink-raise);
  color: var(--fixer);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 1px;
  text-align: center;
}

.latent-main {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 5: Write `src/main.ts` (CSS imports + empty boot; section wiring added Tasks 4–6)**

```ts
import './styles/base.css';
import './styles/latent.css';

/** Boots the microsite. Section wiring is added in Tasks 4–6. */
function boot(): void {
  // sections wired in subsequent tasks
}

boot();
```

- [ ] **Step 6: Gate — build clean**

Run: `npm run build`
Expected: `tsc && vite build` exit 0.

- [ ] **Step 7: Runtime evidence**

`npm run dev`; `browser_navigate` to `http://localhost:<port>/scroll-microsite/`; `browser_console_messages` — no app `error`; `browser_take_screenshot` — confirm: warm near-black background, the fixed sprocket rail on the left (FRM / 000), the film-grain overlay, and the three fonts loaded. Section content is present but not yet fully component-styled (Tasks 2–3). Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(latent): darkroom tokens, grain, sprocket rail + full markup skeleton"
```

---

## Task 2: Hero + Develop component styles

**Files:**
- Modify: `src/styles/latent.css` (append hero + develop rules)

**Interfaces:** Consumes the markup/classes from Task 1. Produces no JS interface — pure CSS.

- [ ] **Step 1: Append hero styles to `src/styles/latent.css`**

```css
/* ---- Hero ---- */
.hero {
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 var(--pad-x) 0 var(--pad-left);
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero__leak {
  position: absolute;
  top: -10%;
  right: -14%;
  width: 70vw;
  height: 80vh;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(closest-side, rgba(242, 121, 43, 0.42), rgba(242, 121, 43, 0.1) 55%, transparent 72%);
  filter: blur(8px);
  animation: leak 14s ease-in-out infinite;
}
.hero__art {
  position: absolute;
  top: -10%;
  right: -14%;
  width: 70vw;
  height: 80vh;
  z-index: 1;
  pointer-events: none;
}
.hero__glow-cool {
  position: absolute;
  bottom: -20%;
  left: 0;
  width: 50vw;
  height: 55vh;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(closest-side, rgba(147, 167, 174, 0.1), transparent 70%);
}
.hero__inner {
  position: relative;
  z-index: 2;
  max-width: var(--content-max);
  width: 100%;
  margin: 0 auto;
}
.hero__kicker {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: clamp(26px, 5vh, 52px);
  opacity: 0;
  animation: rise 0.8s 0.05s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.hero__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--safelight);
  box-shadow: 0 0 12px 2px rgba(242, 121, 43, 0.8);
}
.hero__kicker-text {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 5px;
  color: var(--fixer);
}
.hero__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(52px, 10.5vw, 148px);
  line-height: 0.95;
  letter-spacing: -0.03em;
  margin: 0;
  max-width: 15ch;
  text-wrap: balance;
  opacity: 0;
  animation: rise 0.9s 0.18s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.hero__title-accent {
  color: var(--safelight);
  text-shadow: 0 0 44px rgba(242, 121, 43, 0.75), 0 0 12px rgba(242, 121, 43, 0.5);
}
.hero__meta {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: clamp(30px, 5vh, 58px);
  flex-wrap: wrap;
  opacity: 0;
  animation: rise 0.9s 0.42s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.hero__meta-text {
  font-family: var(--font-mono);
  font-size: clamp(12px, 1.4vw, 15px);
  letter-spacing: 2px;
  color: var(--fixer);
  white-space: nowrap;
}
.hero__rule {
  height: 1px;
  flex: 1;
  min-width: 60px;
  background: linear-gradient(to right, rgba(147, 167, 174, 0.5), transparent);
  transform-origin: left;
  animation: rule-in 1s 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.hero__cue {
  margin-top: clamp(70px, 14vh, 150px);
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--fixer);
  opacity: 0;
  animation: rise 1s 1s cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.hero__cue-text {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 3px;
}
.hero__cue-arrow {
  display: inline-block;
  font-size: 14px;
  animation: rise 1.6s 1.4s ease-in-out infinite alternate;
}

@media (max-width: 760px) {
  .hero__leak,
  .hero__art {
    width: 100vw;
    right: -30%;
  }
}
```

- [ ] **Step 2: Append develop styles to `src/styles/latent.css`**

```css
/* ---- Develop (signature) ---- */
.develop {
  position: relative;
  height: 340vh;
}
.develop__stage {
  height: 100vh;
  box-sizing: border-box;
  padding: clamp(24px, 5vh, 60px) clamp(24px, 5vw, 80px) clamp(24px, 5vh, 60px) var(--pad-left);
  display: flex;
  align-items: center;
  overflow: hidden;
}
.develop__grid {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(200px, 0.9fr);
  gap: clamp(24px, 4vw, 64px);
  align-items: center;
}
.develop__frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 1px solid rgba(147, 167, 174, 0.3);
  background: var(--ink-deep);
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.6);
  padding: 10px;
  box-sizing: border-box;
}
.develop__window {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--ink);
}
.develop__art {
  position: absolute;
  inset: 0;
}
.develop__bloom {
  position: absolute;
  inset: -20%;
  pointer-events: none;
  mix-blend-mode: screen;
  opacity: 0.95;
  background: radial-gradient(closest-side at 62% 38%, rgba(242, 121, 43, 0.7), rgba(242, 121, 43, 0.18) 45%, transparent 70%);
}
.develop__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.55);
}
.develop__frame-label {
  position: absolute;
  left: 12px;
  top: -10px;
  background: var(--ink);
  padding: 0 8px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 3px;
  color: var(--fixer);
}
.develop__meta {
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 4vh, 40px);
}
.develop__counter {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-family: var(--font-mono);
  letter-spacing: 1px;
}
.develop__counter-num {
  font-size: clamp(56px, 7vw, 104px);
  font-weight: 500;
  line-height: 0.85;
  color: var(--paper);
  font-variant-numeric: tabular-nums;
}
.develop__counter-denom {
  font-size: clamp(18px, 2vw, 26px);
  color: var(--fixer);
}
.develop__captions {
  position: relative;
  height: 1.4em;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(24px, 3vw, 40px);
  letter-spacing: -0.01em;
}
.develop__caption {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
}
.develop__caption--fixing {
  color: var(--safelight);
  text-shadow: 0 0 28px rgba(242, 121, 43, 0.5);
}
.develop__desc {
  margin: 0;
  max-width: 34ch;
  color: rgba(236, 230, 217, 0.66);
  font-size: clamp(14px, 1.5vw, 16px);
  line-height: 1.6;
}
.develop__recipe {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--fixer);
  padding-top: 6px;
  border-top: 1px solid rgba(147, 167, 174, 0.18);
}

@media (max-width: 760px) {
  .develop {
    height: 240vh;
  }
  .develop__stage {
    padding-right: var(--pad-x);
  }
  .develop__grid {
    grid-template-columns: 1fr;
    gap: clamp(20px, 5vh, 36px);
  }
}
```

- [ ] **Step 3: Gate — build clean** (`npm run build`, exit 0).

- [ ] **Step 4: Runtime evidence**

`npm run dev`; navigate; screenshot the hero and develop sections at desktop width and compare against `Latent darkroom scroll microsite/Latent.dc.html` (open the export or its `.thumbnail`): hero headline (oversized Space Grotesk, "dark." in amber with glow), kicker dot, EXIF meta + hairline rule, scroll cue; develop frame (4:3, hairline border, bloom, FRAME label) + meta column (big mono counter 000/120, "Latent." caption, description, recipe). Confirm no horizontal overflow. Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(latent): hero + develop component styles"
```

---

## Task 3: Contact sheet + Outro component styles

**Files:**
- Modify: `src/styles/latent.css` (append contact + outro rules)

- [ ] **Step 1: Append contact + outro styles to `src/styles/latent.css`**

```css
/* ---- Contact sheet ---- */
.contact {
  position: relative;
  box-sizing: border-box;
  padding: clamp(80px, 14vh, 160px) var(--pad-x) clamp(90px, 16vh, 180px) var(--pad-left);
}
.contact__inner {
  max-width: var(--content-max);
  margin: 0 auto;
}
.contact__head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: clamp(34px, 6vh, 58px);
  flex-wrap: wrap;
}
.contact__kicker {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--fixer);
}
.contact__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(22px, 3vw, 34px);
  letter-spacing: -0.01em;
  color: var(--paper);
}
.contact__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: clamp(14px, 2vw, 26px);
}
.exposure {
  margin: 0;
}
.exposure__frame {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--ink-raise);
  border: 1px solid rgba(147, 167, 174, 0.22);
  padding: 7px;
  box-sizing: border-box;
}
.exposure__window {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #1a1613;
}
.exposure__no {
  position: absolute;
  top: -9px;
  left: 10px;
  background: var(--ink);
  padding: 0 7px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--safelight);
}
.exposure__exif {
  margin-top: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--fixer);
}

/* ---- Outro ---- */
.outro {
  position: relative;
  min-height: 100vh;
  box-sizing: border-box;
  padding: clamp(70px, 12vh, 130px) var(--pad-x) clamp(70px, 12vh, 130px) var(--pad-left);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}
.outro__glow {
  position: absolute;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  width: min(70vw, 760px);
  height: min(70vw, 760px);
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(closest-side, rgba(242, 121, 43, 0.24), rgba(242, 121, 43, 0.06) 50%, transparent 72%);
  filter: blur(6px);
}
.outro__print {
  position: relative;
  z-index: 2;
  width: min(100%, 440px);
  aspect-ratio: 4 / 5;
  border: 1px solid rgba(147, 167, 174, 0.3);
  padding: 10px;
  box-sizing: border-box;
  background: var(--ink-deep);
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
}
.outro__print-window {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.outro__art {
  position: absolute;
  inset: 0;
}
.outro__edition {
  position: relative;
  z-index: 2;
  display: block;
  margin-top: clamp(36px, 6vh, 56px);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--fixer);
}
.outro__title {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(30px, 5vw, 60px);
  line-height: 1.02;
  letter-spacing: -0.025em;
  margin: clamp(16px, 3vh, 28px) 0 0;
  max-width: 16ch;
}
.outro__cta {
  position: relative;
  z-index: 2;
  margin-top: clamp(34px, 6vh, 52px);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--paper);
  padding: 15px 26px;
  border: 1px solid rgba(147, 167, 174, 0.35);
  border-radius: 2px;
  background: transparent;
  transition: border-color 0.3s, color 0.3s, box-shadow 0.3s;
}
.outro__cta:hover {
  border-color: rgba(242, 121, 43, 0.9);
  color: var(--safelight);
  box-shadow: 0 0 30px rgba(242, 121, 43, 0.28);
}
.outro__cta:focus-visible {
  outline: 2px solid var(--safelight);
  outline-offset: 3px;
  color: var(--safelight);
}
.outro__footer {
  position: relative;
  z-index: 2;
  margin-top: clamp(50px, 10vh, 90px);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(147, 167, 174, 0.55);
}
```

- [ ] **Step 2: Gate — build clean** (`npm run build`, exit 0).

- [ ] **Step 3: Runtime evidence**

`npm run dev`; navigate; screenshot the contact-sheet and outro sections; compare against the export: contact head (mono kicker + Space Grotesk line), a responsive grid of 6 square hairline cells each with an amber frame number badge + mono EXIF caption; outro centered print (4:5 frame + amber glow), EDITION line, big H2, bordered "BOOK A SITTING →" CTA (transparent, amber on hover), footer. Note: the `.reveal` items start at `opacity:0` (they animate in once wired in Task 6) — to view them now, in the console run `document.querySelectorAll('[data-exp]').forEach(e=>e.classList.add('is-in'))` before screenshotting, or screenshot after scrolling; state this in the report. Confirm no horizontal overflow at 360px (`browser_resize` 360×740). Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(latent): contact sheet + outro component styles"
```

---

## Task 4: lib fallback flag + sprocket rail + ambient hero

**Files:**
- Modify: `src/lib/lottie.ts` (add `fallback?: boolean` to options)
- Create: `src/sections/rail.ts`
- Replace: `src/sections/hero.ts`
- Modify: `src/main.ts` (wire `initRail`, `initHero`)

**Interfaces:**
- `createLottie(container, path, { loop, autoplay, fallback? })` — `fallback` defaults `true`; `false` suppresses the labelled box on failure (warns only).
- Produces: `initRail(): void`, `initHero(): void`.

- [ ] **Step 1: Add the `fallback` option in `src/lib/lottie.ts`**

Change the options interface and the two failure paths so the fallback box is suppressed when `fallback === false`:

```ts
interface LottieOptions {
  loop: boolean;
  autoplay: boolean;
  /** When false, do not render the labelled placeholder on failure (caller keeps its own visual). Default true. */
  fallback?: boolean;
}
```

In `createLottie`, guard both `renderFallback` calls (the `data_failed` listener and the `catch`) with `if (opts.fallback !== false)`. Keep the `console.warn` in both cases regardless. The rest of the function is unchanged.

- [ ] **Step 2: Write `src/sections/rail.ts`**

```ts
import { FRAME_COUNT, prefersReducedMotion, ScrollTrigger } from '../lib/motion';

/** Fixed sprocket rail: live mono frame number (000→FRAME_COUNT) and fill
 *  height, both bound to whole-document scroll progress. */
export function initRail(): void {
  const num = document.querySelector<HTMLElement>('[data-rail-num]');
  const fill = document.querySelector<HTMLElement>('[data-rail-fill]');
  if (!num && !fill) return;

  const render = (gp: number): void => {
    if (num) num.textContent = String(Math.round(gp * FRAME_COUNT)).padStart(3, '0');
    if (fill) fill.style.height = (gp * 100).toFixed(2) + '%';
  };

  if (prefersReducedMotion) {
    render(1);
    return;
  }

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => render(self.progress),
  });
}
```

- [ ] **Step 3: Write `src/sections/hero.ts`**

```ts
import { assetUrl, createLottie } from '../lib/lottie';
import { prefersReducedMotion } from '../lib/motion';

/** Ambient hero Lottie in the right-bleed slot. On failure it keeps the
 *  design's CSS light-leak (fallback box suppressed). The headline/EXIF
 *  intro is the design's own CSS `rise` animation. */
export function initHero(): void {
  const art = document.querySelector<HTMLElement>('[data-hero-art]');
  if (!art) return;
  createLottie(art, assetUrl('lottie/hero.json'), {
    loop: !prefersReducedMotion,
    autoplay: !prefersReducedMotion,
    fallback: false,
  });
}
```

- [ ] **Step 4: Wire into `src/main.ts`**

```ts
import './styles/base.css';
import './styles/latent.css';

import { initRail } from './sections/rail';
import { initHero } from './sections/hero';

/** Boots the microsite. */
function boot(): void {
  initRail();
  initHero();
}

boot();
```

- [ ] **Step 5: Gate — build clean** (`npm run build`, exit 0).

- [ ] **Step 6: Runtime evidence**

`npm run dev`; navigate; `browser_console_messages` — a `Lottie failed to load: …hero.json` **warn** but **no** `.lottie-fallback` box in the hero (confirm `document.querySelector('[data-hero-art] .lottie-fallback')` is `null` and the light-leak is visible). Scroll down and confirm the rail number advances from `000` and `[data-rail-fill]` height grows (e.g. reaches ~`100%`/`120` at the bottom). No app console error. Stop dev server.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(latent): sprocket rail + ambient hero (light-leak fallback)"
```

---

## Task 5: Develop scroll-scrub (the signature)

**Files:**
- Replace: `src/sections/scrollStory.ts`
- Modify: `src/main.ts` (wire `initScrollStory`)

**Interfaces:** Consumes `assetUrl`, `createLottie`, `FRAME_COUNT`, `prefersReducedMotion`, `refresh`, `ScrollTrigger`; DOM hooks `[data-develop]`, `[data-develop-stage]`, `[data-develop-art]`, `[data-develop-bloom]`, `[data-develop-counter]`, `[data-caption="0|1|2"]`. Produces `initScrollStory(): void`. All Lottie frame-scrub logic lives only here.

- [ ] **Step 1: Write `src/sections/scrollStory.ts`**

```ts
import { assetUrl, createLottie } from '../lib/lottie';
import { FRAME_COUNT, prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/**
 * The signature "develop" section. A tall wrapper (340vh; 240vh mobile) pins
 * the stage while scroll progress scrubs the Lottie frames and drives the big
 * mono counter, three caption cross-fades, and the receding safelight bloom —
 * a latent print resolving to full contrast. Missing-asset / reduced-motion
 * fall back to the fully-developed end state with no pin.
 */
export function initScrollStory(): void {
  const section = document.querySelector<HTMLElement>('[data-develop]');
  const stage = document.querySelector<HTMLElement>('[data-develop-stage]');
  const art = document.querySelector<HTMLElement>('[data-develop-art]');
  const bloom = document.querySelector<HTMLElement>('[data-develop-bloom]');
  const counter = document.querySelector<HTMLElement>('[data-develop-counter]');
  const captions = Array.from(document.querySelectorAll<HTMLElement>('[data-caption]'));
  if (!section || !stage || !art) return;

  const capCenters = [0.16, 0.5, 0.84];

  const applyDevelop = (p: number): void => {
    if (counter) counter.textContent = String(Math.round(p * FRAME_COUNT)).padStart(3, '0');
    if (bloom) bloom.style.opacity = Math.max(0.12, 0.95 - p * 0.82).toFixed(3);
    captions.forEach((cap, i) => {
      const d = Math.abs(p - capCenters[i]);
      cap.style.opacity = Math.max(0, 1 - d / 0.24).toFixed(3);
    });
  };

  const collapse = (): void => {
    section.style.height = '100vh';
  };

  const anim = createLottie(art, assetUrl('lottie/scroll-story.json'), {
    loop: false,
    autoplay: false,
  });

  if (!anim) {
    collapse();
    applyDevelop(1);
    refresh();
    return;
  }

  anim.addEventListener('data_failed', () => {
    collapse();
    applyDevelop(1);
    refresh();
  });

  if (prefersReducedMotion) {
    anim.addEventListener('DOMLoaded', () => {
      anim.goToAndStop(anim.totalFrames - 1, true);
      collapse();
      applyDevelop(1);
      refresh();
    });
    return;
  }

  anim.addEventListener('DOMLoaded', () => {
    const last = anim.totalFrames - 1;
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      pin: stage,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        anim.goToAndStop(Math.round(p * last), true);
        applyDevelop(p);
      },
    });
    applyDevelop(0);
    refresh();
  });
}
```

- [ ] **Step 2: Wire into `src/main.ts`**

Add the import and call (after `initHero()`):

```ts
import { initScrollStory } from './sections/scrollStory';
// ...inside boot(), after initHero():
initScrollStory();
```

- [ ] **Step 3: Gate — build clean** (`npm run build`, exit 0).

- [ ] **Step 4: Runtime evidence**

`npm run dev`; navigate. Because `scroll-story.json` is absent, `data_failed` fires: confirm via `browser_evaluate` that the develop section collapsed (`getComputedStyle(document.querySelector('[data-develop]')).height` ≈ `window.innerHeight`), the counter reads `120`, the bloom opacity is `~0.13`, and caption `[data-caption="2"]` ("Fixed.") is the visible one (opacity 1). `browser_console_messages` shows the `scroll-story.json` warn, no app error. Then verify the wiring types by confirming the clean strict build (Step 3). Also run one reduced-motion check via `emulateMedia({reducedMotion:'reduce'})` + reload: develop shows the "Fixed." end state, no pin. Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(latent): develop scroll-scrub — lottie + counter + captions + safelight bloom"
```

---

## Task 6: Contact/outro reveals + play-once outro + finalize wiring

**Files:**
- Replace: `src/sections/reveals.ts`
- Replace: `src/sections/outro.ts`
- Modify: `src/main.ts` (wire `initReveals`, `initOutro`)
- Delete: `src/sections/progress.ts`

**Interfaces:** `initReveals(): void` (adds `.is-in` to `[data-exp]` on enter), `initOutro(): void` (plays `outro.json` once on enter).

- [ ] **Step 1: Write `src/sections/reveals.ts`**

```ts
import { prefersReducedMotion, ScrollTrigger } from '../lib/motion';

/** Reveal `[data-exp]` items (contact head, exposures, outro items) on enter,
 *  once, staggered — the CSS `.reveal`→`.is-in` transition carries the motion. */
export function initReveals(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-exp]'));
  if (items.length === 0) return;

  if (prefersReducedMotion) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  items.forEach((el, i) => {
    if (!el.style.transitionDelay) el.style.transitionDelay = (i % 6) * 80 + 'ms';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => el.classList.add('is-in'),
    });
  });
}
```

- [ ] **Step 2: Write `src/sections/outro.ts`**

```ts
import { assetUrl, createLottie } from '../lib/lottie';
import { prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/** Play the outro print Lottie once when it scrolls into view. */
export function initOutro(): void {
  const art = document.querySelector<HTMLElement>('[data-outro-art]');
  if (!art) return;

  const anim = createLottie(art, assetUrl('lottie/outro.json'), {
    loop: false,
    autoplay: false,
  });
  if (!anim) return;

  if (prefersReducedMotion) {
    anim.addEventListener('DOMLoaded', () => anim.goToAndStop(anim.totalFrames - 1, true));
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

- [ ] **Step 3: Delete the obsolete modules and stylesheet**

```bash
git rm src/sections/progress.ts src/styles/layout.css
```

(The sprocket rail from Task 4 replaces the old top progress bar; `layout.css` was the old light-on-dark stylesheet — `main.ts` now imports `base.css` + `latent.css`, so it is dead code.)

- [ ] **Step 4: Finalize `src/main.ts`**

```ts
import './styles/base.css';
import './styles/latent.css';

import { initRail } from './sections/rail';
import { initHero } from './sections/hero';
import { initScrollStory } from './sections/scrollStory';
import { initReveals } from './sections/reveals';
import { initOutro } from './sections/outro';

/** Boots the microsite and wires every section in document order. */
function boot(): void {
  initRail();
  initHero();
  initScrollStory();
  initReveals();
  initOutro();
}

boot();
```

- [ ] **Step 5: Gate — build clean** (`npm run build`, exit 0). Confirm no dangling import of the deleted `progress.ts`.

- [ ] **Step 6: Runtime evidence**

`npm run dev`; navigate; scroll to the contact sheet and confirm the head + all 6 exposures gain `.is-in` (computed `opacity:1`, staggered) and stay in (once). Continue to the outro: confirm `[data-outro-art] .lottie-fallback` text is `Lottie: outro.json` (asset absent) and the outro items reveal in. `browser_console_messages`: `outro.json` warn, no app error. Stop dev server.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(latent): contact/outro reveals + play-once outro; drop old progress bar"
```

---

## Task 7: Docs + full verification

**Files:**
- Modify: `CLAUDE.md`
- Rewrite: `README.md`
- Rewrite: `public/lottie/README.md`

- [ ] **Step 1: Update `CLAUDE.md`**

Replace the color/scroll-scrub lines to reflect the darkroom system and the new module names. Full file:

```markdown
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
```

- [ ] **Step 2: Rewrite `README.md`**

```markdown
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
```

- [ ] **Step 3: Rewrite `public/lottie/README.md`**

```markdown
# Lottie assets

Drop three JSON files here (exact filenames matter):

- `hero.json` — an ambient loop (light-leak / drifting grain) for the hero's
  right-bleed slot. If absent, the hero keeps its CSS light-leak (no box).
- `scroll-story.json` — **the scrubbed print.** It should read as a clear
  start→end transformation: a latent image resolving from grain to full
  contrast. This one is driven frame-by-frame by scroll.
- `outro.json` — a short play-once finish for the outro print.

The site runs and builds without these files — the develop and outro frames show
a labelled placeholder box and log a `console.warn`.
```

- [ ] **Step 4: Gate — build clean** (`npm run build`, exit 0).

- [ ] **Step 5: Full verification matrix**

`npm run dev`, then with Playwright (assets intentionally absent — fallbacks expected):
1. **Console:** navigate; `browser_console_messages` shows only the `hero.json`/`scroll-story.json`/`outro.json` warns + their 404s; **no** app `console.error`/uncaught exception, **no** `/favicon.ico` 404 (data-URI favicon).
2. **Desktop vs export:** full-page screenshot at desktop width; compare against `Latent darkroom scroll microsite/Latent.dc.html` — rail, hero, develop frame + meta, contact grid, outro all match tokens/type/spacing/composition. Flag and fix any visual difference introduced.
3. **Mobile:** `browser_resize` 360×740; confirm `document.documentElement.scrollWidth === clientWidth` (no horizontal overflow), develop grid single-column, rail present.
4. **Behavior on natural scroll (no synthetic resize):** rail counter advances `000→120` and fill grows; develop counter/captions/bloom track the pinned scrub; contact + outro reveals fire once.
5. **Reduced motion:** `emulateMedia({reducedMotion:'reduce'})` + reload — no pin/scrub, develop shows "Fixed."/counter 120/bloom rest, rail full, all reveals visible.
6. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "docs(latent): update CLAUDE.md, README, asset note for darkroom direction"
```

---

## Self-review (author checklist)

**Spec coverage:** tokens/fonts/grain (T1) ✓ · sprocket rail counter+fill (T1 markup, T4 behavior) ✓ · hero markup+CSS intro (T1/T2) + ambient hero.json w/ light-leak fallback (T4) ✓ · develop frame markup+CSS (T1/T2) + scrub Lottie/counter/captions/bloom (T5) ✓ · contact sheet 6 cells reveal (T1/T3/T6) ✓ · outro print + play-once (T1/T3/T6) ✓ · reduced-motion end-states every section (T1 CSS + module guards) ✓ · responsive 240vh mobile develop + no overflow (T2/T7) ✓ · keep vite base + Pages workflow (unchanged) ✓ · docs (T7) ✓.

**Type consistency:** `createLottie(container, path, {loop, autoplay, fallback?})` (T4) called consistently in hero/scrollStory/outro; `FRAME_COUNT` (T1) used in rail + scrollStory; `data-*` hooks in the T1 markup match every `querySelector` in T4–T6 modules; `.reveal`/`.is-in` (T1 CSS) toggled by reveals.ts (T6).

**Placeholder scan:** no TBD/TODO; every code step carries complete content ported from the export with exact values.
