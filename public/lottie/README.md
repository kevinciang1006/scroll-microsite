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
