import { assetUrl, createLottie } from '../lib/lottie';
import { prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/** Play the outro print Lottie once when it scrolls into view. On failure it
 *  keeps the print photograph underneath (fallback box suppressed). */
export function initOutro(): void {
  const art = document.querySelector<HTMLElement>('[data-outro-art]');
  if (!art) return;

  const anim = createLottie(art, assetUrl('lottie/outro.json'), {
    loop: false,
    autoplay: false,
    fallback: false,
  });
  if (!anim) return;

  if (prefersReducedMotion) {
    anim.addEventListener('DOMLoaded', () => anim.goToAndStop(anim.totalFrames - 1, true));
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
