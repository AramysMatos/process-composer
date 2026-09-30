import React from 'react';
import { NavLink } from 'react-router-dom';
import { Translate } from 'react-jhipster';

import {
  processVisualizationActivitiesPath,
  processVisualizationCanvasPath,
  processVisualizationCatalogPath,
  processVisualizationOverviewPath,
} from 'app/modules/process-visualization/process-visualization-paths';

const CATALOG_LINKS = [
  { slug: 'roles' as const, key: 'processComposerApp.processDesign.visualization.nav.roles' },
  { slug: 'tools' as const, key: 'processComposerApp.processDesign.visualization.nav.tools' },
  { slug: 'guidelines' as const, key: 'processComposerApp.processDesign.visualization.nav.guidelines' },
  { slug: 'artifacts' as const, key: 'processComposerApp.processDesign.visualization.nav.artifacts' },
  { slug: 'templates' as const, key: 'processComposerApp.processDesign.visualization.nav.templates' },
];

export const ProcessVisualizationNav = ({ processId }: { processId: number }) => (
  <nav className="process-visualization-nav" aria-label="Process visualization">
    <div className="process-visualization-nav__section">
      <div className="process-visualization-nav__label">
        <Translate contentKey="processComposerApp.processDesign.visualization.nav.main">Main</Translate>
      </div>
      <NavLink
        end
        to={processVisualizationOverviewPath(processId)}
        className={({ isActive }) => `process-visualization-nav__link${isActive ? ' active' : ''}`}
      >
        <Translate contentKey="processComposerApp.processDesign.visualization.nav.overview">Overview</Translate>
      </NavLink>
      <NavLink
        to={processVisualizationActivitiesPath(processId)}
        className={({ isActive }) => `process-visualization-nav__link${isActive ? ' active' : ''}`}
      >
        <Translate contentKey="processComposerApp.processDesign.visualization.nav.activities">Activities</Translate>
      </NavLink>
      <NavLink
        to={processVisualizationCanvasPath(processId)}
        className={({ isActive }) => `process-visualization-nav__link${isActive ? ' active' : ''}`}
      >
        <Translate contentKey="processComposerApp.processDesign.visualization.nav.canvas">Canvas</Translate>
      </NavLink>
    </div>
    <div className="process-visualization-nav__section">
      <div className="process-visualization-nav__label">
        <Translate contentKey="processComposerApp.processDesign.visualization.nav.catalogs">Catalogs</Translate>
      </div>
      {CATALOG_LINKS.map(item => (
        <NavLink
          key={item.slug}
          to={processVisualizationCatalogPath(processId, item.slug)}
          className={({ isActive }) => `process-visualization-nav__link${isActive ? ' active' : ''}`}
        >
          <Translate contentKey={item.key}>{item.slug}</Translate>
        </NavLink>
      ))}
    </div>
  </nav>
);
