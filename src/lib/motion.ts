import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** True when the visitor asked the OS to minimize motion. */
export const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches;

/** Recompute pin/scrub geometry — call after Lottie SVGs mount so pin
 *  distances account for their real size. */
export function refresh(): void {
  ScrollTrigger.refresh();
}
