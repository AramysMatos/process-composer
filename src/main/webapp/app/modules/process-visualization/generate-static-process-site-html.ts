import { LibraryEntityType } from 'app/modules/library/library.config';
import { ActivityEntityRelationKind } from 'app/modules/process-visualization/process-visualization-indexes';
import { ProcessSnapshot } from 'app/modules/process-visualization/process-snapshot.model';
import {
  buildUnifiedFromSnapshot,
  sortedUnifiedIndexedEntities,
  UnifiedActivity,
  UnifiedCatalogEntity,
  UnifiedIndexedEntity,
} from 'app/modules/process-visualization/process-visualization-unified.model';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const anchorId = (prefix: string, ref: string): string => `${prefix}-${ref.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

const section = (title: string, body: string): string =>
  body.trim() ? `<section class="block"><h3>${escapeHtml(title)}</h3><div class="body">${body}</div></section>` : '';

const listItems = (items: string[]): string =>
  items.length > 0 ? `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>` : '<p class="muted">—</p>';

const catalogLink = (catalog: LibraryEntityType, entity: UnifiedCatalogEntity): string =>
  `<a href="#${anchorId(`catalog-${catalog}`, entity.ref)}">${escapeHtml(entity.name)}</a>`;

const catalogLinkList = (catalog: LibraryEntityType, items: UnifiedCatalogEntity[]): string =>
  listItems(items.map(item => catalogLink(catalog, item)));

const activityNameLink = (activity: { ref: string; name: string }): string =>
  `<a href="#${anchorId('activity', activity.ref)}">${escapeHtml(activity.name)}</a>`;

const activityNameLinks = (items: { ref: string; name: string }[]): string => listItems(items.map(activityNameLink));

const RELATION_LABELS: Record<ActivityEntityRelationKind, string> = {
  participantRole: 'Participante',
  responsibleRole: 'Responsável',
  tool: 'Ferramenta',
  guideline: 'Diretriz',
  template: 'Modelo',
  requiredArtifact: 'Artefato obrigatório',
  producedArtifact: 'Artefato produzido',
};

const CATALOG_GROUPS: { catalog: LibraryEntityType; title: string }[] = [
  { catalog: 'roles', title: 'Papéis' },
  { catalog: 'tools', title: 'Ferramentas' },
  { catalog: 'guidelines', title: 'Diretrizes' },
  { catalog: 'artifacts', title: 'Artefatos' },
  { catalog: 'templates', title: 'Modelos' },
];

const catalogEntitySection = (catalog: LibraryEntityType, entry: UnifiedIndexedEntity): string => {
  const { entity, refs } = entry;
  const optionalBadge = entity.optional ? ' <span class="badge">Opcional</span>' : '';
  const usageRows = refs
    .map(
      ref =>
        `<tr><td><a href="#${anchorId('activity', ref.activityRef)}">${escapeHtml(ref.activityName)}</a></td>` +
        `<td>${escapeHtml(RELATION_LABELS[ref.relationKind])}</td></tr>`
    )
    .join('');

  return `
    <article class="catalog-item" id="${anchorId(`catalog-${catalog}`, entity.ref)}">
      <h3>${escapeHtml(entity.name)}${optionalBadge}</h3>
      ${section('Descrição', entity.description ? `<p>${escapeHtml(entity.description)}</p>` : '<p class="muted">—</p>')}
      ${section(
        'Usado nas atividades',
        refs.length > 0
          ? `<table class="ref-table"><thead><tr><th>Atividade</th><th>Relação</th></tr></thead><tbody>${usageRows}</tbody></table>`
          : '<p class="muted">—</p>'
      )}
    </article>
  `;
};

const activitySection = (activity: UnifiedActivity): string =>
  `
    <article class="activity" id="${anchorId('activity', activity.ref)}">
      <h2>${escapeHtml(activity.name)}</h2>
      ${activity.phaseName ? `<p class="muted">Fase: ${escapeHtml(activity.phaseName)}</p>` : ''}
      ${section('Descrição', activity.description ? `<p>${escapeHtml(activity.description)}</p>` : '<p class="muted">—</p>')}
      ${section(
        'Critério de entrada',
        activity.inputCriterion ? `<p>${escapeHtml(activity.inputCriterion)}</p>` : '<p class="muted">—</p>'
      )}
      ${section('Artefatos obrigatórios', catalogLinkList('artifacts', activity.requiredArtifacts))}
      ${section('Artefatos produzidos', catalogLinkList('artifacts', activity.producedArtifacts))}
      ${section('Papéis participantes', catalogLinkList('roles', activity.participantRoles))}
      ${section('Papéis responsáveis', catalogLinkList('roles', activity.responsibleRoles))}
      ${section('Ferramentas', catalogLinkList('tools', activity.tools))}
      ${section('Diretrizes', catalogLinkList('guidelines', activity.guidelines))}
      ${section('Modelos', catalogLinkList('templates', activity.templates))}
      ${section('Atividades sucessoras', activityNameLinks(activity.subActivities))}
      ${section('Atividades predecessoras', activityNameLinks(activity.predecessorActivities))}
    </article>
  `;

const catalogGroupsHtml = (snapshot: ProcessSnapshot): string => {
  const unified = buildUnifiedFromSnapshot(snapshot, '');
  return CATALOG_GROUPS.map(({ catalog, title }) => {
    const entries = sortedUnifiedIndexedEntities(unified.indexes[catalog]);
    if (entries.length === 0) {
      return '';
    }
    const items = entries.map(entry => catalogEntitySection(catalog, entry)).join('');
    return `
      <section class="catalog-group">
        <h2 id="${anchorId('section', catalog)}">${escapeHtml(title)}</h2>
        ${items}
      </section>
    `;
  }).join('');
};

export const buildStaticProcessSiteHtml = (snapshot: ProcessSnapshot): string => {
  const unified = buildUnifiedFromSnapshot(snapshot, '');

  const navLinks = [
    '<a href="#section-phases">Fases</a>',
    '<a href="#section-activities">Atividades</a>',
    ...CATALOG_GROUPS.filter(({ catalog }) => sortedUnifiedIndexedEntities(unified.indexes[catalog]).length > 0).map(
      ({ catalog, title }) => `<a href="#${anchorId('section', catalog)}">${escapeHtml(title)}</a>`
    ),
  ].join(' · ');

  const phasesHtml = snapshot.phases
    .map(phase => {
      const links = phase.activityKeys
        .map(key => {
          const name = snapshot.activities.find(a => a.key === key)?.name ?? key;
          return `<li><a href="#${anchorId('activity', key)}">${escapeHtml(name)}</a></li>`;
        })
        .join('');
      return `
        <section class="phase">
          <h3>${escapeHtml(phase.name)}</h3>
          ${phase.description ? `<p class="muted">${escapeHtml(phase.description)}</p>` : ''}
          <ul>${links}</ul>
        </section>
      `;
    })
    .join('');

  const activitiesHtml = unified.activities.map(activitySection).join('');
  const catalogsHtml = catalogGroupsHtml(snapshot);

  const embedded = JSON.stringify(snapshot).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(snapshot.processName)} — ModusComposer</title>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 960px; margin: 0 auto; padding: 1.5rem; color: #212529; }
    h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.35rem; margin-top: 2rem; }
    .muted { color: #6c757d; }
    .site-nav { font-size: 0.9rem; margin: 1rem 0 2rem; }
    .phase { margin: 1rem 0; padding-bottom: 1rem; border-bottom: 1px solid #dee2e6; }
    .activity { margin: 2rem 0; padding-top: 1rem; border-top: 2px solid #0d6efd; }
    .catalog-group { margin: 2.5rem 0; padding-top: 1rem; border-top: 2px solid #6c757d; }
    .catalog-item { margin: 1.5rem 0; padding: 1rem; background: #f8f9fa; border-radius: 0.375rem; }
    .catalog-item h3 { margin-top: 0; font-size: 1.1rem; }
    .badge { font-size: 0.75rem; font-weight: 600; color: #495057; background: #e9ecef; padding: 0.15rem 0.4rem; border-radius: 0.25rem; }
    .block { margin: 1rem 0; }
    .block h3, .block h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; color: #495057; }
    ul { padding-left: 1.25rem; }
    a { color: #0d6efd; }
    header { margin-bottom: 1rem; }
    .ref-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .ref-table th, .ref-table td { border: 1px solid #dee2e6; padding: 0.35rem 0.5rem; text-align: left; }
    .ref-table th { background: #f1f3f5; }
  </style>
</head>
<body>
  <header>
    <p class="muted">ModusComposer · site estático</p>
    <h1>${escapeHtml(snapshot.processName)}</h1>
    ${snapshot.processDescription ? `<p>${escapeHtml(snapshot.processDescription)}</p>` : ''}
    <nav class="site-nav" aria-label="Índice">${navLinks}</nav>
  </header>
  <main>
    <section id="section-phases">
      <h2>Fases e atividades</h2>
      ${phasesHtml}
    </section>
    <section id="section-activities">
      <h2>Fichas de atividade</h2>
      ${activitiesHtml}
    </section>
    <section id="section-catalogs">
      <h2>Catálogos</h2>
      ${catalogsHtml || '<p class="muted">Nenhum item de catálogo referenciado neste processo.</p>'}
    </section>
  </main>
  <script type="application/json" id="process-snapshot">${embedded}</script>
</body>
</html>`;
};
