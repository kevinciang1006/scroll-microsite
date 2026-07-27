import { FRAME_COUNT, prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/**
 * The signature "develop" section. A tall wrapper (340vh; 240vh mobile) pins
 * the stage while scroll progress scrubs a CSS filter over the print — blur and
 * contrast resolving a latent image to full tone — alongside the big mono
 * counter, three caption cross-fades, and the receding safelight bloom.
 * Reduced motion renders the developed end state with no pin and no scrubbing.
 */
export function initScrollStory(): void {
  const section = document.querySelector<HTMLElement>('[data-develop]');
  const stage = document.querySelector<HTMLElement>('[data-develop-stage]');
  const img = document.querySelector<HTMLImageElement>('[data-develop-img]');
  const bloom = document.querySelector<HTMLElement>('[data-develop-bloom]');
  const counter = document.querySelector<HTMLElement>('[data-develop-counter]');
  const captions = Array.from(document.querySelectorAll<HTMLElement>('[data-caption]'));
  if (!section || !stage || !img) return;

  const capCenters = [0.16, 0.5, 0.84];

  const applyDevelop = (p: number): void => {
    // The print itself: latent (blurred, flat, dark) resolving to fixed. The
    // source is already desaturated at the CDN, so the constant sepia is what
    // carries the warm gelatin-silver tone rather than a scrubbed saturate().
    const blur = ((1 - p) * 18).toFixed(2);
    const contrast = (0.5 + p * 0.72).toFixed(3);
    const brightness = (0.4 + p * 0.6).toFixed(3);
    img.style.filter = `sepia(.18) blur(${blur}px) contrast(${contrast}) brightness(${brightness})`;

    if (counter) counter.textContent = String(Math.round(p * FRAME_COUNT)).padStart(3, '0');
    if (bloom) bloom.style.opacity = Math.max(0.12, 0.95 - p * 0.82).toFixed(3);
    captions.forEach((cap, i) => {
      // The terminal caption ("Fixed.") is the developed end state, so once its
      // center is reached it holds at full rather than easing back out — this is
      // what the reduced-motion static card must clearly show.
      const signed = p - capCenters[i];
      const held = i === captions.length - 1 && signed >= 0;
      cap.style.opacity = (held ? 1 : Math.max(0, 1 - Math.abs(signed) / 0.24)).toFixed(3);
    });
  };

  if (prefersReducedMotion) {
    section.style.height = '100vh';
    applyDevelop(1);
    refresh();
    return;
  }

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    pin: stage,
    anticipatePin: 1,
    onUpdate: (self) => applyDevelop(self.progress),
  });

  applyDevelop(0);
  refresh();
}
