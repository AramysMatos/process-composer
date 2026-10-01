import { LibraryEntityType } from 'app/modules/library/library.config';

export type StaticSiteNavId = 'overview' | 'activities' | LibraryEntityType;

const baseSlug = (ref: string): string =>
  ref
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';

const shortHash = (ref: string): string => {
  let hash = 0;
  for (let i = 0; i < ref.length; i += 1) {
    hash = (hash * 31 + ref.charCodeAt(i)) % 100000;
  }
  return String(hash).padStart(5, '0');
};

/** Maps entity ref → unique filename slug within a folder. */
export const buildSlugRegistry = (refs: string[]): Map<string, string> => {
  const registry = new Map<string, string>();
  const used = new Set<string>();

  refs.forEach(ref => {
    let slug = baseSlug(ref);
    if (used.has(slug)) {
      slug = `${slug}-${shortHash(ref)}`;
    }
    used.add(slug);
    registry.set(ref, slug);
  });

  return registry;
};

export const staticSiteCssPath = (): string => 'assets/site.css';

export const staticSiteOverviewPath = (): string => 'index.html';

export const staticSiteActivitiesListPath = (): string => 'activities/index.html';

export const staticSiteActivityPath = (slug: string): string => `activities/${slug}.html`;

export const staticSiteCatalogListPath = (catalog: LibraryEntityType): string => `${catalog}/index.html`;

export const staticSiteCatalogItemPath = (catalog: LibraryEntityType, slug: string): string => `${catalog}/${slug}.html`;

/** Relative href between two site-root paths (e.g. activities/a.html → ../assets/site.css). */
export const relativeHref = (fromSitePath: string, toSitePath: string): string => {
  const fromDirParts = fromSitePath.split('/').slice(0, -1);
  const toParts = toSitePath.split('/');

  let common = 0;
  while (common < fromDirParts.length && common < toParts.length - 1 && fromDirParts[common] === toParts[common]) {
    common += 1;
  }

  const upSteps = fromDirParts.length - common;
  const downParts = toParts.slice(common);
  return `${upSteps > 0 ? '../'.repeat(upSteps) : ''}${downParts.join('/')}`;
};
