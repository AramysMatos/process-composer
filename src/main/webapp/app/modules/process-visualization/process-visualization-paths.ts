import { LibraryEntityType } from 'app/modules/library/library.config';

export type VisualizationCatalogSlug = LibraryEntityType | 'activities' | 'canvas';

export const VISUALIZATION_CATALOG_SLUGS: VisualizationCatalogSlug[] = [
  'activities',
  'roles',
  'tools',
  'guidelines',
  'artifacts',
  'templates',
  'canvas',
];

export const isVisualizationCatalogSlug = (value: string | undefined): value is VisualizationCatalogSlug =>
  value !== undefined && (VISUALIZATION_CATALOG_SLUGS as string[]).includes(value);

export const YAML_VISUALIZATION_BASE_PATH = '/visualizar-yaml';

export const processVisualizationBasePath = (processId: number): string => `/processos/${processId}/visualizar`;

export const processVisualizationOverviewPath = (basePath: string): string => basePath;

export const processVisualizationActivitiesPath = (basePath: string): string => `${basePath}/activities`;

export const processVisualizationActivityPath = (basePath: string, activityRef: string): string =>
  `${processVisualizationActivitiesPath(basePath)}/${encodeURIComponent(activityRef)}`;

export const processVisualizationCanvasPath = (basePath: string): string => `${basePath}/canvas`;

export const processVisualizationCatalogPath = (basePath: string, catalog: VisualizationCatalogSlug): string => `${basePath}/${catalog}`;

export const processVisualizationEntityPath = (basePath: string, catalog: LibraryEntityType, entityRef: string): string =>
  `${processVisualizationCatalogPath(basePath, catalog)}/${encodeURIComponent(entityRef)}`;

export const processEditorPath = (processId: number): string => `/processos/${processId}`;
