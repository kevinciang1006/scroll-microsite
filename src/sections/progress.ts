import { gsap, prefersReducedMotion } from '../lib/motion';

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
