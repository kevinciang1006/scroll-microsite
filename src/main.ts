import './styles/base.css';
import './styles/layout.css';

import { initHero } from './sections/hero';

/** Boots the microsite. */
function boot(): void {
  initHero();
}

boot();
