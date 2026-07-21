import './styles/base.css';
import './styles/layout.css';

import { initProgress } from './sections/progress';
import { initHero } from './sections/hero';
import { initScrollStory } from './sections/scrollStory';
import { initReveals } from './sections/reveals';
import { initOutro } from './sections/outro';

/** Boots the microsite and wires every section in document order. */
function boot(): void {
  initProgress();
  initHero();
  initScrollStory();
  initReveals();
  initOutro();
}

boot();
