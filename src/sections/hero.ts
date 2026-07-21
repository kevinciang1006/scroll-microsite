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
