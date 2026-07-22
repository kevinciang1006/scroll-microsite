import './styles/base.css';
import './styles/latent.css';

import { initRail } from './sections/rail';
import { initHero } from './sections/hero';
import { initScrollStory } from './sections/scrollStory';
import { initReveals } from './sections/reveals';
import { initOutro } from './sections/outro';

/** Boots the microsite and wires every section in document order. */
function boot(): void {
  initRail();
  initHero();
  initScrollStory();
  initReveals();
  initOutro();
}

boot();
