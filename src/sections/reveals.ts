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
