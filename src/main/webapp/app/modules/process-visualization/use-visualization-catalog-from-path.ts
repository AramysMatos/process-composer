import { useLocation, useParams } from 'react-router-dom';

import { LibraryEntityType, isLibraryEntityType } from 'app/modules/library/library.config';

const CATALOG_PATH = /\/(?:processos\/\d+\/visualizar|visualizar-yaml)\/(roles|tools|guidelines|artifacts|templates)(?:\/([^/]+))?/;

export function useVisualizationCatalogFromPath(): LibraryEntityType | undefined {
  const { pathname } = useLocation();
  const match = pathname.match(CATALOG_PATH);
  const slug = match?.[1];
  return isLibraryEntityType(slug) ? slug : undefined;
}

export function useVisualizationEntityRefParam(): string | undefined {
  const { entityRef } = useParams<'entityRef'>();
  const { pathname } = useLocation();
  const match = pathname.match(CATALOG_PATH);
  const encoded = match?.[2] ?? entityRef;
  if (!encoded) {
    return undefined;
  }
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

export function useVisualizationActivityRefParam(): string | undefined {
  const { activityRef } = useParams<'activityRef'>();
  if (!activityRef) {
    return undefined;
  }
  try {
    return decodeURIComponent(activityRef);
  } catch {
    return activityRef;
  }
}
