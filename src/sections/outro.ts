import { assetUrl, createLottie } from '../lib/lottie';
import { prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/** A short outro Lottie that plays once when it scrolls into view. */
export function initOutro(): void {
  const art = document.querySelector<HTMLElement>('[data-outro-art]');
  if (!art) return;

  const anim = createLottie(art, assetUrl('lottie/outro.json'), {
    loop: false,
    autoplay: false,
  });
  if (!anim) return;

  if (prefersReducedMotion) {
    anim.addEventListener('DOMLoaded', () => {
      anim.goToAndStop(anim.totalFrames - 1, true);
    });
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
