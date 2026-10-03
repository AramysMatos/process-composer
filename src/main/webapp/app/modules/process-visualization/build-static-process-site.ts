import { LibraryEntityType } from 'app/modules/library/library.config';
import { ActivityEntityRelationKind } from 'app/modules/process-visualization/process-visualization-indexes';
import { ProcessSnapshot } from 'app/modules/process-visualization/process-snapshot.model';
import { renderStaticPage, StaticPageNavContext } from 'app/modules/process-visualization/static-site-layout';
import {
  buildSlugRegistry,
  relativeHref,
  staticSiteActivityPath,
  staticSiteActivitiesListPath,
  staticSiteCatalogItemPath,
  staticSiteCatalogListPath,
  staticSiteOverviewPath,
} from 'app/modules/process-visualization/static-site-paths';
import { STATIC_SITE_CSS } from 'app/modules/process-visualization/static-site-styles';
import {
  buildUnifiedFromSnapshot,
  sortedUnifiedIndexedEntities,
  UnifiedActivity,
  UnifiedCatalogEntity,
  UnifiedIndexedEntity,
} from 'app/modules/process-visualization/process-visualization-unified.model';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const RELATION_LABELS: Record<ActivityEntityRelationKind, string> = {
  participantRole: 'Participante',
  responsibleRole: 'Responsável',
  tool: 'Ferramenta',
  guideline: 'Diretriz',
  template: 'Modelo',
  requiredArtifact: 'Artefato obrigatório',
  producedArtifact: 'Artefato produzido',
};

const CATALOG_TITLES: Record<LibraryEntityType, string> = {
  roles: 'Papéis',
  tools: 'Ferramentas',
  guidelines: 'Diretrizes',
  artifacts: 'Artefatos',
  templates: 'Modelos',
};

const PHASE_COLORS = ['#0d6efd', '#198754', '#fd7e14', '#6f42c1', '#dc3545', '#20c997', '#0dcaf0', '#d63384'];

export interface StaticSiteBuildContext {
  unified: ReturnType<typeof buildUnifiedFromSnapshot>;
  activitySlugs: Map<string, string>;
  catalogSlugs: Record<LibraryEntityType, Map<string, string>>;
  visibleCatalogs: LibraryEntityType[];
}

const buildContext = (snapshot: ProcessSnapshot): StaticSiteBuildContext => {
  const unified = buildUnifiedFromSnapshot(snapshot, '');
  const activitySlugs = buildSlugRegistry(snapshot.activities.map(a => a.key));

  const catalogSlugs = {
    roles: buildSlugRegistry([...unified.indexes.roles.keys()]),
    tools: buildSlugRegistry([...unified.indexes.tools.keys()]),
    guidelines: buildSlugRegistry([...unified.indexes.guidelines.keys()]),
    artifacts: buildSlugRegistry([...unified.indexes.artifacts.keys()]),
    templates: buildSlugRegistry([...unified.indexes.templates.keys()]),
  };

  const visibleCatalogs = (Object.keys(CATALOG_TITLES) as LibraryEntityType[]).filter(catalog => unified.indexes[catalog].size > 0);

  return { unified, activitySlugs, catalogSlugs, visibleCatalogs };
};

const navCtx = (
  ctx: StaticSiteBuildContext,
  currentPagePath: string,
  activeNav: StaticPageNavContext['activeNav']
): StaticPageNavContext => ({
  currentPagePath,
  activeNav,
  visibleCatalogs: ctx.visibleCatalogs,
});

const docBlock = (label: string, value: string | undefined): string => {
  const body = value?.trim()
    ? `<div class="doc-block__body">${escapeHtml(value)}</div>`
    : `<div class="doc-block__body doc-block__body--empty">—</div>`;
  return `<div class="doc-block"><div class="doc-block__label">${escapeHtml(label)}</div>${body}</div>`;
};

const relationCell = (title: string, links: string[]): string => {
  const list =
    links.length > 0
      ? `<ul class="relation-grid__list">${links.map(l => `<li>${l}</li>`).join('')}</ul>`
      : `<div class="doc-block__body--empty">—</div>`;
  return `<div class="relation-grid__cell"><div class="relation-grid__title">${escapeHtml(title)}</div>${list}</div>`;
};

const catalogHref = (ctx: StaticSiteBuildContext, fromPagePath: string, catalog: LibraryEntityType, entity: UnifiedCatalogEntity): string =>
  relativeHref(fromPagePath, staticSiteCatalogItemPath(catalog, ctx.catalogSlugs[catalog].get(entity.ref) ?? entity.ref));

const activityHref = (ctx: StaticSiteBuildContext, fromPagePath: string, ref: string, name: string): string =>
  `<a href="${relativeHref(fromPagePath, staticSiteActivityPath(ctx.activitySlugs.get(ref) ?? ref))}">${escapeHtml(name)}</a>`;

const catalogLinkList = (
  ctx: StaticSiteBuildContext,
  fromPagePath: string,
  catalog: LibraryEntityType,
  items: UnifiedCatalogEntity[]
): string[] => items.map(item => `<a href="${catalogHref(ctx, fromPagePath, catalog, item)}">${escapeHtml(item.name)}</a>`);

const renderOverviewMain = (snapshot: ProcessSnapshot, ctx: StaticSiteBuildContext): string => {
  const { unified } = ctx;
  const roleCount = unified.indexes.roles.size;
  const toolCount = unified.indexes.tools.size;

  const phasesHtml = unified.phases
    .map(phase => {
      const activities = unified.activitiesByPhaseRef.get(phase.ref) ?? [];
      const links = activities.map(a => `<li>${activityHref(ctx, staticSiteOverviewPath(), a.ref, a.name)}</li>`).join('');
      return `
        <div class="phase-block">
          <span class="phase-badge">${escapeHtml(phase.name)}</span>
          ${phase.description ? `<p class="muted small">${escapeHtml(phase.description)}</p>` : ''}
          <ul>${links || '<li class="muted">Nenhuma atividade</li>'}</ul>
        </div>
      `;
    })
    .join('');

  return `
    <h1>${escapeHtml(snapshot.processName)}</h1>
    ${snapshot.processDescription ? `<p class="hero__description">${escapeHtml(snapshot.processDescription)}</p>` : ''}
    <div class="stat-chips">
      <span class="stat-chip">${snapshot.phases.length} fases</span>
      <span class="stat-chip">${unified.activities.length} atividades</span>
      <span class="stat-chip">${roleCount} papéis</span>
      <span class="stat-chip">${toolCount} ferramentas</span>
    </div>
    <h2>Fases e atividades</h2>
    ${phasesHtml}
  `;
};

const renderActivitiesListMain = (snapshot: ProcessSnapshot, ctx: StaticSiteBuildContext): string => {
  const { unified } = ctx;
  const sections = unified.phases
    .map(phase => {
      const list = unified.activitiesByPhaseRef.get(phase.ref) ?? [];
      if (list.length === 0) {
        return '';
      }
      const items = list.map(a => `<li><a href="${ctx.activitySlugs.get(a.ref)}.html">${escapeHtml(a.name)}</a></li>`).join('');
      return `<h2>${escapeHtml(phase.name)}</h2><ul class="catalog-list">${items}</ul>`;
    })
    .join('');

  return `<h1>Atividades</h1><p class="muted">Lista por fase</p>${sections}`;
};

const unifiedActivity = (ctx: StaticSiteBuildContext, key: string): UnifiedActivity | undefined => ctx.unified.activityByRef.get(key);

const renderActivityMain = (
  activity: UnifiedActivity,
  ctx: StaticSiteBuildContext,
  snapshot: ProcessSnapshot,
  currentPagePath: string
): string => {
  const phaseIndex = activity.phaseRef ? snapshot.phases.findIndex(p => p.key === activity.phaseRef) : 0;
  const phaseColor = PHASE_COLORS[(phaseIndex >= 0 ? phaseIndex : 0) % PHASE_COLORS.length];

  const grid = [
    relationCell('Artefatos obrigatórios', catalogLinkList(ctx, currentPagePath, 'artifacts', activity.requiredArtifacts)),
    relationCell('Artefatos produzidos', catalogLinkList(ctx, currentPagePath, 'artifacts', activity.producedArtifacts)),
    relationCell('Papéis participantes', catalogLinkList(ctx, currentPagePath, 'roles', activity.participantRoles)),
    relationCell('Papéis responsáveis', catalogLinkList(ctx, currentPagePath, 'roles', activity.responsibleRoles)),
    relationCell('Ferramentas', catalogLinkList(ctx, currentPagePath, 'tools', activity.tools)),
    relationCell('Diretrizes', catalogLinkList(ctx, currentPagePath, 'guidelines', activity.guidelines)),
    relationCell('Modelos', catalogLinkList(ctx, currentPagePath, 'templates', activity.templates)),
  ].join('');

  const deps: string[] = [];
  if (activity.predecessorActivities.length > 0) {
    deps.push(
      relationCell(
        'Atividades predecessoras',
        activity.predecessorActivities.map(a => activityHref(ctx, currentPagePath, a.ref, a.name))
      )
    );
  }
  if (activity.subActivities.length > 0) {
    deps.push(
      relationCell(
        'Atividades sucessoras',
        activity.subActivities.map(a => activityHref(ctx, currentPagePath, a.ref, a.name))
      )
    );
  }

  const breadcrumb = `
    <nav class="breadcrumb">
      <a href="${relativeHref(currentPagePath, staticSiteOverviewPath())}">${escapeHtml(snapshot.processName)}</a>
      › <a href="${relativeHref(currentPagePath, staticSiteActivitiesListPath())}">Atividades</a>
      ${activity.phaseName ? ` › <span>${escapeHtml(activity.phaseName)}</span>` : ''}
    </nav>
  `;

  return `
    ${breadcrumb}
    ${
      activity.phaseName ? `<span class="phase-badge-header" style="background:${phaseColor}">${escapeHtml(activity.phaseName)}</span>` : ''
    }
    <h1>${escapeHtml(activity.name)}</h1>
    ${docBlock('Descrição', activity.description)}
    ${docBlock('Critério de entrada', activity.inputCriterion)}
    <div class="relation-grid">${grid}</div>
    ${deps.length > 0 ? `<div class="deps-row">${deps.join('')}</div>` : ''}
  `;
};

const renderCatalogListMain = (catalog: LibraryEntityType, ctx: StaticSiteBuildContext): string => {
  const entries = sortedUnifiedIndexedEntities(ctx.unified.indexes[catalog]);
  const items = entries
    .map(entry => {
      const slug = ctx.catalogSlugs[catalog].get(entry.entity.ref) ?? entry.entity.ref;
      return `<li><a href="${slug}.html">${escapeHtml(entry.entity.name)}</a> <span class="muted small">(${
        entry.refs.length
      } atividades)</span></li>`;
    })
    .join('');

  return `<h1>${escapeHtml(CATALOG_TITLES[catalog])}</h1><ul class="catalog-list">${items}</ul>`;
};

const renderCatalogItemMain = (
  catalog: LibraryEntityType,
  entry: UnifiedIndexedEntity,
  ctx: StaticSiteBuildContext,
  snapshot: ProcessSnapshot,
  currentPagePath: string
): string => {
  const optional = entry.entity.optional ? '<span class="badge-optional">Opcional</span>' : '';
  const rows = entry.refs
    .map(
      ref =>
        `<tr><td>${activityHref(ctx, currentPagePath, ref.activityRef, ref.activityName)}</td><td>${escapeHtml(
          RELATION_LABELS[ref.relationKind]
        )}</td></tr>`
    )
    .join('');

  return `
    <nav class="breadcrumb">
      <a href="${relativeHref(currentPagePath, staticSiteOverviewPath())}">${escapeHtml(snapshot.processName)}</a>
      › <a href="${relativeHref(currentPagePath, staticSiteCatalogListPath(catalog))}">${escapeHtml(CATALOG_TITLES[catalog])}</a>
      › <span>${escapeHtml(entry.entity.name)}</span>
    </nav>
    <h1>${escapeHtml(entry.entity.name)}${optional}</h1>
    ${docBlock('Descrição', entry.entity.description)}
    <h2>Usado nas atividades</h2>
    <table class="ref-table">
      <thead><tr><th>Atividade</th><th>Relação</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

export const buildStaticProcessSiteFiles = (snapshot: ProcessSnapshot): Map<string, string> => {
  const files = new Map<string, string>();
  const ctx = buildContext(snapshot);
  const { processName, processDescription } = snapshot;
  const desc = processDescription ?? '';

  files.set('assets/site.css', STATIC_SITE_CSS);

  files.set(
    'index.html',
    renderStaticPage({
      pageTitle: 'Visão geral',
      processName,
      processDescription: desc,
      mainHtml: renderOverviewMain(snapshot, ctx),
      nav: navCtx(ctx, staticSiteOverviewPath(), 'overview'),
    })
  );

  files.set(
    'activities/index.html',
    renderStaticPage({
      pageTitle: 'Atividades',
      processName,
      processDescription: desc,
      mainHtml: renderActivitiesListMain(snapshot, ctx),
      nav: navCtx(ctx, staticSiteActivitiesListPath(), 'activities'),
    })
  );

  ctx.unified.activities.forEach(activity => {
    const slug = ctx.activitySlugs.get(activity.ref) ?? activity.ref;
    const pagePath = staticSiteActivityPath(slug);
    files.set(
      pagePath,
      renderStaticPage({
        pageTitle: activity.name,
        processName,
        processDescription: desc,
        mainHtml: renderActivityMain(activity, ctx, snapshot, pagePath),
        nav: navCtx(ctx, pagePath, 'activities'),
      })
    );
  });

  ctx.visibleCatalogs.forEach(catalog => {
    const listPath = staticSiteCatalogListPath(catalog);
    files.set(
      listPath,
      renderStaticPage({
        pageTitle: CATALOG_TITLES[catalog],
        processName,
        processDescription: desc,
        mainHtml: renderCatalogListMain(catalog, ctx),
        nav: navCtx(ctx, listPath, catalog),
      })
    );

    sortedUnifiedIndexedEntities(ctx.unified.indexes[catalog]).forEach(entry => {
      const slug = ctx.catalogSlugs[catalog].get(entry.entity.ref) ?? entry.entity.ref;
      const pagePath = staticSiteCatalogItemPath(catalog, slug);
      files.set(
        pagePath,
        renderStaticPage({
          pageTitle: entry.entity.name,
          processName,
          processDescription: desc,
          mainHtml: renderCatalogItemMain(catalog, entry, ctx, snapshot, pagePath),
          nav: navCtx(ctx, pagePath, catalog),
        })
      );
    });
  });

  return files;
};
