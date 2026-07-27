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

## Images

The photography is hotlinked from the Unsplash CDN — nothing is committed to the
repo. Sizing, cropping and desaturation (`sat=-100`) ride in the query string,
and the warm gelatin-silver tint is a CSS `filter` in `src/styles/latent.css`.
Photo IDs are listed in a comment at the top of `<main>` in `index.html`.

Two crops are deliberate and worth leaving alone:

- **develop** uses `crop=focalpoint&fp-y=0.32`. That portrait is shot vertical;
  a 4:3 centre crop *or* `crop=faces` slices the eyes off.
- **contact cells** are pulled down with `brightness(.74)` so the two high-key
  frames (the camera and the negative strips) don't glare against the near-black
  page.

To make the site fully self-contained instead, download the nine files into
`public/img/` and swap the `src` values for `assetUrl('img/…')`
(`src/lib/lottie.ts`), which respects the configured base.

## Add the Lottie assets (optional)

Two slots still support Lottie: drop `hero.json` (ambient loop — light-leak /
drifting grain) and `outro.json` (a short play-once finish) into
`public/lottie/`. The site runs and builds without them — it just logs a
`console.warn`, the hero keeps its CSS light-leak, and the outro keeps its print
photograph (both pass `fallback: false`, so no placeholder box is drawn).

The develop section no longer uses Lottie; `scroll-story.json` is not read.

## How the scroll-sync works

A GSAP `ScrollTrigger` with `scrub: true` pins the stage and maps scroll
progress across the tall (340vh) develop section onto a CSS `filter` over the
print — `blur` 18px → 0, `contrast` 0.5 → 1.22, `brightness` 0.4 → 1.0 — so the
image resolves out of the grain as you scroll. The same progress drives the big
IBM Plex Mono frame counter
(`000 → 120`), cross-fades the three captions ("Latent." → "Fixing." → "Fixed."
at 0.16 / 0.5 / 0.84), and recedes the amber safelight bloom as the print
"fixes." The fixed sprocket rail runs its own counter off whole-document scroll.
`prefers-reduced-motion` skips the pin and shows the fully-developed end state.

## Deployment

The site deploys to **either GitHub Pages or Vercel with no code change**. The
only host-specific setting is Vite's `base`, resolved in `vite.config.ts`:

| Target | `base` | How it's chosen |
| --- | --- | --- |
| GitHub Pages (custom domain) | `/` | default — served from the domain root |
| Vercel | `/` | default |
| GitHub Pages (no custom domain) | `/scroll-microsite/` | `BASE_PATH=/scroll-microsite/ npm run build` |

The custom domain is `scroll-microsite.kevinciang.com`, pinned by `public/CNAME`
so it survives every deploy (Vite copies `public/` into `dist/`).

> **If you ever remove the custom domain**, Pages reverts to serving at
> `https://<user>.github.io/scroll-microsite/` and you must set
> `BASE_PATH=/scroll-microsite/` in the workflow. Otherwise every CSS and JS
> request 404s and the page renders as unstyled HTML — images keep working,
> because they're absolute Unsplash URLs that don't depend on `base`.

Everything that resolves a runtime asset goes through `assetUrl()`
(`src/lib/lottie.ts`), which reads `import.meta.env.BASE_URL` — so that one
value retargets the whole site.

**GitHub Pages.** `.github/workflows/deploy.yml` builds `dist/` and publishes on
push to `main`. Pages must be set to *Settings → Pages → Source: **GitHub
Actions***; on the legacy "deploy from a branch" setting it publishes the
repository root instead of the build, which serves the raw source `index.html` —
no styles at all, and a 404 for `/src/main.ts`.

**Vercel.** Import the repo; `vercel.json` pins the framework preset, build
command and `dist` output. No dashboard configuration or env vars needed.

Verify locally before shipping:

```bash
npm run build && npx serve dist   # root-served (custom domain / Vercel)
BASE_PATH=/scroll-microsite/ npm run build   # project-path build
```
