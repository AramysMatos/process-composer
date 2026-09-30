import React from 'react';
import { Link } from 'react-router-dom';
import { Translate } from 'react-jhipster';

import { LibraryEntityType } from 'app/modules/library/library.config';
import { useProcessVisualization } from 'app/modules/process-visualization/process-visualization-context';
import { catalogTypeToIndexKey, sortedIndexedEntities } from 'app/modules/process-visualization/process-visualization-indexes';
import { processVisualizationEntityPath } from 'app/modules/process-visualization/process-visualization-paths';
import { useVisualizationCatalogFromPath } from 'app/modules/process-visualization/use-visualization-catalog-from-path';

const CATALOG_TITLE_KEYS: Record<LibraryEntityType, string> = {
  roles: 'processComposerApp.processDesign.visualization.nav.roles',
  tools: 'processComposerApp.processDesign.visualization.nav.tools',
  guidelines: 'processComposerApp.processDesign.visualization.nav.guidelines',
  artifacts: 'processComposerApp.processDesign.visualization.nav.artifacts',
  templates: 'processComposerApp.processDesign.visualization.nav.templates',
};

export const CatalogListPage = () => {
  const catalog = useVisualizationCatalogFromPath();
  const { processId, indexes } = useProcessVisualization();

  if (!catalog) {
    return null;
  }

  const indexKey = catalogTypeToIndexKey(catalog);
  const entries = sortedIndexedEntities(indexes[indexKey]);

  return (
    <div className="process-visualization-page" data-cy={`visualization-catalog-${catalog}`}>
      <h1 className="h4 mb-3">
        <Translate contentKey={CATALOG_TITLE_KEYS[catalog]}>{catalog}</Translate>
      </h1>
      {entries.length === 0 ? (
        <p className="text-muted">
          <Translate contentKey="processComposerApp.processDesign.visualization.catalogEmpty">No items used in this process.</Translate>
        </p>
      ) : (
        <ul className="process-visualization-catalog-list">
          {entries.map(entry => (
            <li key={entry.entity.id} className="process-visualization-catalog-list__item">
              <Link
                to={processVisualizationEntityPath(processId, catalog, entry.entity.id as number)}
                className="process-visualization-catalog-list__link"
              >
                {entry.entity.name}
              </Link>
              <span className="text-muted small ms-2">
                <Translate
                  contentKey="processComposerApp.processDesign.visualization.usedInActivities"
                  interpolate={{ count: String(entry.refs.length) }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CatalogListPage;
