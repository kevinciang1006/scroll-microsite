import './styles/base.css';
import './styles/layout.css';

import { initHero } from './sections/hero';
import { initScrollStory } from './sections/scrollStory';

/** Boots the microsite. */
function boot(): void {
  initHero();
  initScrollStory();
}

boot();
