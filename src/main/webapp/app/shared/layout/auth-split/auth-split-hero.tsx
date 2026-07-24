import React from 'react';
import { Translate } from 'react-jhipster';

import ProcessComposerLogoIcon from 'app/shared/icons/process-composer-logo-icon';

export const AuthSplitHero = () => (
  <div className="auth-split__hero">
    <svg className="auth-split__flow-bg" viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle className="auth-split__flow-node" cx="80" cy="120" r="5" />
      <rect className="auth-split__flow-node" x="470" y="90" width="10" height="10" />
      <circle className="auth-split__flow-node" cx="520" cy="260" r="5" />
      <rect className="auth-split__flow-node" x="60" y="330" width="10" height="10" />
      <circle className="auth-split__flow-node" cx="150" cy="560" r="5" />
      <rect className="auth-split__flow-node" x="480" y="600" width="10" height="10" />
      <circle className="auth-split__flow-node" cx="380" cy="480" r="5" />

      <path className="auth-split__flow-link" d="M85 120 L475 95" />
      <path className="auth-split__flow-link" d="M475 100 L520 260" />
      <path className="auth-split__flow-link" d="M65 335 L150 560" />
      <path className="auth-split__flow-link" d="M150 560 L480 605" />
      <path className="auth-split__flow-link" d="M65 335 L380 480" />

      <g transform="translate(140, 300)">
        <path className="auth-split__flow-hero-path" pathLength={1} d="M0 60 V10 L45 45 L90 10 V60" />
        <rect className="auth-split__flow-hero-shape" x="-6" y="72" width="26" height="26" rx="3" />
        <line className="auth-split__flow-hero-shape" x1="24" y1="85" x2="70" y2="85" />
        <path className="auth-split__flow-hero-shape" d="M62 76 L74 85 L62 94" />
        <circle className="auth-split__flow-hero-shape" cx="96" cy="85" r="15" />
        <circle className="auth-split__flow-dot" cx="-6" cy="85" r="3.5" />
      </g>
    </svg>

    <div className="auth-split__hero-brand">
      <ProcessComposerLogoIcon variant="onDark" width={30} height={30} className="auth-split__hero-logo" />
      <span>
        <Translate contentKey="auth.brand">ModusComposer</Translate>
      </span>
    </div>

    <div className="auth-split__hero-copy">
      <h1>
        <Translate contentKey="auth.hero.title">Especifique processos. Instancie projetos.</Translate>
      </h1>
      <p>
        <Translate contentKey="auth.hero.subtitle">
          Detalhe as atividades de um processo de software e gere, a partir dele, as tarefas do seu projeto.
        </Translate>
      </p>
    </div>
  </div>
);

export default AuthSplitHero;
