import { assetUrl, createLottie } from '../lib/lottie';
import { FRAME_COUNT, prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/**
 * The signature "develop" section. A tall wrapper (340vh; 240vh mobile) pins
 * the stage while scroll progress scrubs the Lottie frames and drives the big
 * mono counter, three caption cross-fades, and the receding safelight bloom —
 * a latent print resolving to full contrast. Missing-asset / reduced-motion
 * fall back to the fully-developed end state with no pin.
 */
export function initScrollStory(): void {
  const section = document.querySelector<HTMLElement>('[data-develop]');
  const stage = document.querySelector<HTMLElement>('[data-develop-stage]');
  const art = document.querySelector<HTMLElement>('[data-develop-art]');
  const bloom = document.querySelector<HTMLElement>('[data-develop-bloom]');
  const counter = document.querySelector<HTMLElement>('[data-develop-counter]');
  const captions = Array.from(document.querySelectorAll<HTMLElement>('[data-caption]'));
  if (!section || !stage || !art) return;

  const capCenters = [0.16, 0.5, 0.84];

  const applyDevelop = (p: number): void => {
    if (counter) counter.textContent = String(Math.round(p * FRAME_COUNT)).padStart(3, '0');
    if (bloom) bloom.style.opacity = Math.max(0.12, 0.95 - p * 0.82).toFixed(3);
    captions.forEach((cap, i) => {
      // The terminal caption ("Fixed.") is the developed end state, so once its
      // center is reached it holds at full rather than easing back out — this is
      // what the missing-asset / reduced-motion static card must clearly show.
      const signed = p - capCenters[i];
      const held = i === captions.length - 1 && signed >= 0;
      cap.style.opacity = (held ? 1 : Math.max(0, 1 - Math.abs(signed) / 0.24)).toFixed(3);
    });
  };

  const collapse = (): void => {
    section.style.height = '100vh';
  };

  const anim = createLottie(art, assetUrl('lottie/scroll-story.json'), {
    loop: false,
    autoplay: false,
  });

  if (!anim) {
    collapse();
    applyDevelop(1);
    refresh();
    return;
  }

  anim.addEventListener('data_failed', () => {
    collapse();
    applyDevelop(1);
    refresh();
  });

  if (prefersReducedMotion) {
    anim.addEventListener('DOMLoaded', () => {
      anim.goToAndStop(anim.totalFrames - 1, true);
      collapse();
      applyDevelop(1);
      refresh();
    });
    return;
  }

  anim.addEventListener('DOMLoaded', () => {
    const last = anim.totalFrames - 1;
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      pin: stage,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        anim.goToAndStop(Math.round(p * last), true);
        applyDevelop(p);
      },
    });
    applyDevelop(0);
    refresh();
  });
}
