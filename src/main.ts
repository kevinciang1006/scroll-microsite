import './styles/base.css';
import './styles/latent.css';

import { initRail } from './sections/rail';
import { initHero } from './sections/hero';

/** Boots the microsite. */
function boot(): void {
  initRail();
  initHero();
}

boot();
