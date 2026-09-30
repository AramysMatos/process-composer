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

export const processVisualizationBasePath = (processId: number): string => `/processos/${processId}/visualizar`;

export const processVisualizationOverviewPath = (processId: number): string => processVisualizationBasePath(processId);

export const processVisualizationActivitiesPath = (processId: number): string => `${processVisualizationBasePath(processId)}/activities`;

export const processVisualizationActivityPath = (processId: number, activityId: number): string =>
  `${processVisualizationActivitiesPath(processId)}/${activityId}`;

export const processVisualizationCanvasPath = (processId: number): string => `${processVisualizationBasePath(processId)}/canvas`;

export const processVisualizationCatalogPath = (processId: number, catalog: VisualizationCatalogSlug): string =>
  `${processVisualizationBasePath(processId)}/${catalog}`;

export const processVisualizationEntityPath = (processId: number, catalog: LibraryEntityType, entityId: number): string =>
  `${processVisualizationCatalogPath(processId, catalog)}/${entityId}`;

export const processEditorPath = (processId: number): string => `/processos/${processId}`;
