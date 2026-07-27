# Claude Code Prompt — Integrate the "Latent" design into the working microsite

> Paste into Claude Code, run in the repo that already contains both the existing microsite and the extracted Claude Design export. **Start in plan mode.**

---

You are finishing a scroll-driven Lottie microsite. Two things already exist in this repo:

1. A working static microsite (Vite `vanilla-ts`, TypeScript, `lottie-web`, `gsap`/`ScrollTrigger`) with the scroll logic and a GitHub Pages deploy workflow. This is the **functional architecture** — keep it.
2. An extracted **Claude Design export** (the "Latent" darkroom direction). This is the **visual source of truth** — colors, type, spacing, layout, and the composition of each section.

Your job is to merge them: rebuild the presentation layer of the microsite to match the design exactly, and re-wire the existing scroll behavior onto the new markup. Build everything completely — no TODOs, no placeholders.

### Step 0 — inspect before you touch anything (plan mode)
- Locate the Claude Design export folder in this repo (search for the exported files — likely a `design/`, `export/`, or similarly named folder containing HTML/CSS or React/JSX plus assets). List what's there and its format.
- Read the existing microsite (`index.html`, `src/`, `vite.config.ts`, the deploy workflow).
- Present a plan: which design tokens/fonts/layout you'll adopt, how you'll map each design section onto the existing section modules, and what markup you'll replace. Wait for approval.

### Hard constraint — stay a static HTML microsite
The deliverable stays a **static HTML microsite** (Vite `vanilla-ts`, no framework runtime). If the design export is React/Tailwind, **do not** add React to the project. Extract its visual language (tokens, type, spacing, component structure, exact CSS values) and reimplement it in the vanilla-TS project. If it's static HTML/CSS, port the markup and styles directly. Either way, match the design pixel-for-pixel.

### Adopt from the design (visual truth)
- Pull the color tokens into CSS custom properties. Target palette: warm near-black base, warm ivory text, an amber "safelight" used only as glow/bloom (never flat fills), a cool silver-blue for captions/hairlines, plus a ~3% film-grain overlay. Use the exact hex values from the export if they differ.
- Fonts: Space Grotesk (display + big frame counter), Inter (body), IBM Plex Mono (frame counters, EXIF-style meta, kickers, captions). Load via `<link>`.
- Layout: the fixed left **film-sprocket rail** with a live mono frame number; asymmetric editorial hero; the pinned **develop frame**; the **contact-sheet** reveal grid; the outro print. Match spacing, type scale, and composition to the export.

### Re-wire the functional layer onto the new markup (behavior truth)
Preserve / reconnect all of this to the redesigned sections:

- **Hero** — ambient `hero.json` Lottie loop; headline + EXIF meta line settle in on load (GSAP timeline).
- **Develop (signature)** — pinned section; load `scroll-story.json` with `autoplay:false, loop:false`; drive frames from scroll with a `ScrollTrigger` (`scrub:true`, `pin`), calling `anim.goToAndStop(frame, true)` each tick. Tie the big IBM Plex Mono **frame counter** and 3 caption cross-fades (~10/50/90%) to the same progress. Interpolate the amber safelight bloom so it recedes as progress → 1 ("fixing → fixed").
- **Sprocket rail** — live frame number in mono updates with page scroll.
- **Contact sheet** — grid cells fade + lift in on enter, staggered, `once:true`.
- **Progress** — the film-strip / sprocket progress indicator scales with document scroll.
- **Outro** — `outro.json` plays once on enter; glow eases to rest.

### Guards (build in, don't announce)
- `prefers-reduced-motion: reduce` → all sections show developed end-states; no pin, no scrub, no autoplay (Lotties set to final frame).
- Responsive to ~360px. On mobile the develop frame stays the hero — shorten the pin distance rather than dropping the effect. Sprocket rail may collapse to a slimmer marker on small screens.
- Visible keyboard focus on the CTA/links.

### Assets
`public/lottie/`: `hero.json` (ambient loop), `scroll-story.json` (**the one that gets scrubbed — must read as a clear start→end transformation, e.g. an image resolving / a mechanism assembling**), `outro.json` (short play-once). Keep the graceful fallback (labelled box + `console.warn`) so the dev server runs even if a file is absent. Call `ScrollTrigger.refresh()` after the develop Lottie loads so pin distances are correct.

### Keep
- Vite `base` set to the repo name for GitHub Pages (comment showing how to switch to `'/'` for a custom domain).
- The GitHub Actions Pages deploy workflow.
- Update `CLAUDE.md` and `README.md`: note the design direction, and keep the short "how the scroll-sync works" paragraph accurate to the final markup.

### Quality bar
- `tsc` clean, no `any`, no console errors at runtime.
- Matches the design export — same tokens, type, spacing, composition.
- 60fps scroll, no layout shift on pin (`anticipatePin`, explicit stage height).
- Lighthouse Performance ≥ 90.

When done: print the run commands and a short checklist of what to verify in the browser (develop scrub tracks scroll both directions, counter ticks, safelight recedes, reveals fire once, reduced-motion path, mobile at 360px).
