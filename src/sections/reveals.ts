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
