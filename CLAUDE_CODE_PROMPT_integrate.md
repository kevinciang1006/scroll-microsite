# Claude Code Prompt — Integrate Claude Design export with the Lottie scroll motion

> Paste into Claude Code from inside the project folder. **Start in plan mode.** Let it inventory the folder and present the merge plan before touching anything.

---

You're integrating a high-fidelity static design export (from Claude Design) with an existing working scroll-microsite. The design export is the **visual source of truth** — its look must be preserved exactly. The existing build has the **working behavior** (lottie-web + GSAP ScrollTrigger scroll-scrub). Your job is to graft the behavior onto the design, not to redesign anything.

Do not invent a new visual style. Do not "improve" the design. Preserve it pixel-for-pixel and only add motion + the minimal structure needed to support it.

## Step 1 — Plan mode: inventory
Before changing anything, list what's in the project and report back:
- Find the **Claude Design export**: an `index.html` plus CSS (linked or inline), fonts, and an assets/images folder. It may be in a subfolder (e.g. `design/`, `export/`, `claude-design/`) or dropped at the root.
- Find the **existing Vite/TS build** with the working scroll logic (`src/lib/lottie.ts`, `src/lib/motion.ts`, `src/sections/*`, `vite.config.ts`, the Pages workflow).
- Identify, in the design markup, the elements that map to each behavior:
  - the **hero** animation slot (ambient Lottie),
  - the **develop frame** (the static placeholder that must become the scroll-scrubbed Lottie),
  - the **frame counter** element,
  - the **develop captions**,
  - the **contact-sheet cells** (reveal-on-scroll),
  - the **outro** print (play-once),
  - the **sprocket rail / progress** indicator.

Present the file tree, the mapping above, and the merge plan. If you can't locate the design export, stop and ask for its path. Wait for approval.

## Step 2 — Merge (design = source of truth)
- Make the design export's markup the project's `index.html` (adapt only what Vite needs: a single `<div id="app">` or equivalent root, the module `<script>`, correct asset paths). Keep its DOM structure and class names.
- Move the design's CSS into the project's styles layer intact. Keep its tokens, type scale, spacing, and every visual rule. Do not restyle. Wire the fonts it uses (Space Grotesk, Inter, IBM Plex Mono).
- Move the design's images/SVGs/fonts into `public/` (or `src/assets/`) and fix paths.
- Keep TypeScript strict, no `any`, and reuse the existing `lib/` and `sections/` modules where they fit; adapt their selectors to the design's actual class names/IDs.

## Step 3 — Graft the behavior onto the design's elements

### Develop frame (the signature — must work)
- Replace the static placeholder inside the design's develop frame with a lottie-web container, keeping the frame's exact styling/box.
- Wrap it in a tall section + pinned stage as needed for scrubbing, without altering the visual composition.
- Load `scroll-story.json` (`autoplay:false, loop:false`). Drive frames from scroll via a GSAP ScrollTrigger with `scrub:true` and `pin` on the stage, using `goToAndStop(Math.round(frame), true)` on update. Call `ScrollTrigger.refresh()` after load.
- Bind the design's **frame counter** element to the same scroll progress (mono, `000 → NNN`).
- Cross-fade the design's three **captions** ("Latent." / "Fixing." / "Fixed.") at ~10 / 50 / 90% progress.
- If the design animates the safelight glow, tie its intensity to the same progress; otherwise leave the design's glow as-is.

### Other motion
- **Hero**: ambient `hero.json` (`loop:true, autoplay:true`) in the hero slot; run the design's intro reveal (or a subtle GSAP fade/translate for the headline + meta on load) without changing layout.
- **Contact sheet**: reveal each cell on enter (`start: 'top 80%'`, `once:true`, opacity + small y), staggered.
- **Outro**: `outro.json` (`autoplay:false`) plays once when its section enters.
- **Sprocket rail / progress**: bind the design's progress element to document scroll (scaleX or the live frame number).

## Step 4 — Quality floor (don't regress the design)
- `prefers-reduced-motion: reduce` → render developed end-states, no scrub, no pin, Lotties on final frame.
- Responsive to ~360px; on mobile keep the develop frame as the hero and shorten pin distance rather than dropping the effect. Match whatever responsive rules the design already defines.
- Visible keyboard focus on CTA/links.
- Graceful Lottie fallback if a JSON file is missing (labelled box + `console.warn`) so dev always runs.

## Step 5 — Keep it deployable
- Preserve `vite.config.ts` `base` (repo name for GitHub Pages) and the GitHub Actions Pages workflow. Confirm asset paths resolve under the base path.

## Verify and report
- `tsc` clean, no `any`, no console errors.
- Scrubbing the develop section up and down moves the Lottie forward/back in lockstep; counter and captions track it.
- Side-by-side the running page against the design export — flag any visual difference you introduced and fix it.
- Print run commands and the URL to check.

Build everything completely — no TODOs, no placeholders except the (already-handled) Lottie JSON fallback.
