import { assetUrl, createLottie } from '../lib/lottie';
import { gsap, prefersReducedMotion, refresh, ScrollTrigger } from '../lib/motion';

/**
 * The critical section: a tall wrapper (300vh) pins a viewport-height stage
 * while a Lottie animation is scrubbed frame-by-frame to scroll progress.
 * Three captions cross-fade across the scroll. Reduced motion / missing asset
 * fall back to the final frame + last caption with no pin.
 */
export function initScrollStory(): void {
  const wrapper = document.querySelector<HTMLElement>('[data-scrollstory]');
  const stage = document.querySelector<HTMLElement>('[data-scrollstory-stage]');
  const art = document.querySelector<HTMLElement>('[data-scrollstory-art]');
  const captions = Array.from(
    document.querySelectorAll<HTMLElement>('[data-caption]'),
  );
  if (!wrapper || !stage || !art || captions.length === 0) return;

  const showFinalState = (): void => {
    captions.forEach((caption, i) => {
      gsap.set(caption, { opacity: i === captions.length - 1 ? 1 : 0 });
    });
  };

  // Collapse the tall scroll runway when there is nothing to scrub.
  const collapse = (): void => {
    wrapper.style.minHeight = '100vh';
  };

  const anim = createLottie(art, assetUrl('lottie/scroll-story.json'), {
    loop: false,
    autoplay: false,
  });

  if (!anim) {
    collapse();
    showFinalState();
    return;
  }

  anim.addEventListener('data_failed', () => {
    collapse();
    showFinalState();
  });

  if (prefersReducedMotion) {
    anim.addEventListener('DOMLoaded', () => {
      anim.goToAndStop(anim.totalFrames - 1, true);
      showFinalState();
      refresh();
    });
    return;
  }

  anim.addEventListener('DOMLoaded', () => {
    // Scrub the animation frames to scroll progress across the pinned stage.
    const proxy = { frame: 0 };
    gsap.to(proxy, {
      frame: anim.totalFrames - 1,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        pin: stage,
        anticipatePin: 1,
      },
      onUpdate: () => anim.goToAndStop(Math.round(proxy.frame), true),
    });

    // Cross-fade the three captions across scroll progress (~0.1 / 0.5 / 0.9).
    gsap.set(captions, { opacity: 0 });
    ScrollTrigger.create({
      trigger: wrapper,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const active = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
        captions.forEach((caption, i) => {
          gsap.to(caption, {
            opacity: i === active ? 1 : 0,
            duration: 0.3,
            overwrite: true,
          });
        });
      },
    });

    refresh();
  });
}
