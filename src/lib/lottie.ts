import lottie, { type AnimationItem } from 'lottie-web';

interface LottieOptions {
  loop: boolean;
  autoplay: boolean;
  /** When false, do not render the labelled placeholder on failure (caller keeps its own visual). Default true. */
  fallback?: boolean;
}

/** Prefix a public-folder relative path with Vite's configured base so
 *  assets resolve under the GitHub Pages sub-path. */
export function assetUrl(rel: string): string {
  return `${import.meta.env.BASE_URL}${rel}`;
}

/**
 * Load a Lottie animation into `container`. On failure (missing file, parse
 * error) render a labelled placeholder, warn (never error), and return the
 * item (or null on a synchronous throw) so the page still runs before the
 * JSON assets are added.
 */
export function createLottie(
  container: HTMLElement,
  path: string,
  opts: LottieOptions,
): AnimationItem | null {
  try {
    const anim = lottie.loadAnimation({
      container,
      renderer: 'svg',
      path,
      loop: opts.loop,
      autoplay: opts.autoplay,
    });

    anim.addEventListener('data_failed', () => {
      if (opts.fallback !== false) renderFallback(container, path);
      console.warn(`Lottie failed to load: ${path}`);
    });

    return anim;
  } catch (err) {
    if (opts.fallback !== false) renderFallback(container, path);
    console.warn(`Lottie threw while loading: ${path}`, err);
    return null;
  }
}

function renderFallback(container: HTMLElement, path: string): void {
  const filename = path.split('/').pop() ?? path;
  container.textContent = '';
  const box = document.createElement('div');
  box.className = 'lottie-fallback';
  box.textContent = `Lottie: ${filename}`;
  container.appendChild(box);
}
