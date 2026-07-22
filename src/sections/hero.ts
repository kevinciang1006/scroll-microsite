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
