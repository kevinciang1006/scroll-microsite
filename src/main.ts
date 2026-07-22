import './styles/base.css';
import './styles/latent.css';

import { initRail } from './sections/rail';
import { initHero } from './sections/hero';
import { initScrollStory } from './sections/scrollStory';

/** Boots the microsite. */
function boot(): void {
  initRail();
  initHero();
  initScrollStory();
}

boot();
