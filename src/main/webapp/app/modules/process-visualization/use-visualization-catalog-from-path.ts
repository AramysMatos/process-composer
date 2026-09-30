import { useLocation, useParams } from 'react-router-dom';

import { LibraryEntityType, isLibraryEntityType } from 'app/modules/library/library.config';

const CATALOG_PATH = /\/visualizar\/(roles|tools|guidelines|artifacts|templates)(?:\/(\d+))?/;

export function useVisualizationCatalogFromPath(): LibraryEntityType | undefined {
  const { pathname } = useLocation();
  const match = pathname.match(CATALOG_PATH);
  const slug = match?.[1];
  return isLibraryEntityType(slug) ? slug : undefined;
}

export function useVisualizationEntityIdParam(): number | undefined {
  const { entityId } = useParams<'entityId'>();
  const numeric = Number(entityId);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}
