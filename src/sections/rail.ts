import { FRAME_COUNT, prefersReducedMotion, ScrollTrigger } from '../lib/motion';

/** Fixed sprocket rail: live mono frame number (000→FRAME_COUNT) and fill
 *  height, both bound to whole-document scroll progress. */
export function initRail(): void {
  const num = document.querySelector<HTMLElement>('[data-rail-num]');
  const fill = document.querySelector<HTMLElement>('[data-rail-fill]');
  if (!num && !fill) return;

  const render = (gp: number): void => {
    if (num) num.textContent = String(Math.round(gp * FRAME_COUNT)).padStart(3, '0');
    if (fill) fill.style.height = (gp * 100).toFixed(2) + '%';
  };

  if (prefersReducedMotion) {
    render(1);
    return;
  }

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => render(self.progress),
  });
}
