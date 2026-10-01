import { LibraryEntityType } from 'app/modules/library/library.config';
import {
  relativeHref,
  StaticSiteNavId,
  staticSiteActivitiesListPath,
  staticSiteCatalogListPath,
  staticSiteCssPath,
  staticSiteOverviewPath,
} from 'app/modules/process-visualization/static-site-paths';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CATALOG_NAV: { id: LibraryEntityType; label: string }[] = [
  { id: 'roles', label: 'Papéis' },
  { id: 'tools', label: 'Ferramentas' },
  { id: 'guidelines', label: 'Diretrizes' },
  { id: 'artifacts', label: 'Artefatos' },
  { id: 'templates', label: 'Modelos' },
];

export interface StaticPageNavContext {
  currentPagePath: string;
  activeNav: StaticSiteNavId;
  visibleCatalogs: LibraryEntityType[];
}

export interface RenderStaticPageParams {
  pageTitle: string;
  processName: string;
  processDescription: string;
  mainHtml: string;
  nav: StaticPageNavContext;
}

const navLink = (fromPath: string, toPath: string, label: string, active: boolean): string =>
  `<a class="site-nav__link${active ? ' active' : ''}" href="${relativeHref(fromPath, toPath)}">${escapeHtml(label)}</a>`;

export const renderStaticSiteNav = (nav: StaticPageNavContext): string => {
  const { currentPagePath, activeNav, visibleCatalogs } = nav;
  const mainLinks = [
    navLink(currentPagePath, staticSiteOverviewPath(), 'Visão geral', activeNav === 'overview'),
    navLink(currentPagePath, staticSiteActivitiesListPath(), 'Atividades', activeNav === 'activities'),
  ].join('');

  const catalogLinks = CATALOG_NAV.filter(item => visibleCatalogs.includes(item.id))
    .map(item => navLink(currentPagePath, staticSiteCatalogListPath(item.id), item.label, activeNav === item.id))
    .join('');

  return `
    <nav class="site-nav" aria-label="Navegação">
      <div class="site-nav__label">Principal</div>
      ${mainLinks}
      ${catalogLinks ? `<div class="site-nav__label" style="margin-top:0.75rem">Catálogos</div>${catalogLinks}` : ''}
    </nav>
  `;
};

export const renderStaticPage = (params: RenderStaticPageParams): string => {
  const { pageTitle, processName, mainHtml, nav } = params;
  const cssHref = relativeHref(nav.currentPagePath, staticSiteCssPath());
  const navHtml = renderStaticSiteNav(nav);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)} — ${escapeHtml(processName)} · ModusComposer</title>
  <link rel="stylesheet" href="${cssHref}" />
</head>
<body>
  <div class="site-shell">
    <header class="site-header">
      <a class="site-header__brand" href="${relativeHref(nav.currentPagePath, staticSiteOverviewPath())}">ModusComposer</a>
      <span class="site-header__process">${escapeHtml(processName)}</span>
    </header>
    <div class="site-body">
      ${navHtml}
      <main class="site-main">
        ${mainHtml}
      </main>
    </div>
  </div>
</body>
</html>`;
};
