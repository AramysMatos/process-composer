export const STATIC_SITE_CSS = `
:root {
  --site-bg: #f0f2f5;
  --site-card: #fff;
  --site-border: rgba(0, 0, 0, 0.08);
  --site-primary: #0d6efd;
  --site-muted: #6c757d;
  --site-text: #212529;
  --site-radius: 0.5rem;
  --site-nav-width: 220px;
  --site-max: 1200px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  color: var(--site-text);
  background: var(--site-bg);
}

a { color: var(--site-primary); text-decoration: none; }
a:hover { text-decoration: underline; }

.site-shell { min-height: 100vh; display: flex; flex-direction: column; }

.site-header {
  background: var(--site-card);
  border-bottom: 1px solid var(--site-border);
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.site-header__brand { font-weight: 600; color: inherit; }
.site-header__brand:hover { text-decoration: none; color: inherit; }
.site-header__process { font-size: 0.95rem; color: var(--site-muted); font-weight: 500; max-width: 36rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.site-body {
  flex: 1;
  display: flex;
  gap: 1.25rem;
  max-width: var(--site-max);
  width: 100%;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
  align-items: flex-start;
}

.site-nav {
  flex: 0 0 var(--site-nav-width);
  background: var(--site-card);
  border-radius: var(--site-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 1rem 0;
  position: sticky;
  top: 1rem;
}

.site-nav__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--site-muted);
  padding: 0 1rem 0.35rem;
  font-weight: 600;
}

.site-nav__link {
  display: block;
  padding: 0.45rem 1rem;
  margin: 0 0.5rem;
  border-radius: 0.375rem;
  color: var(--site-text);
  font-size: 0.9rem;
}

.site-nav__link:hover { background: #f8f9fa; text-decoration: none; }
.site-nav__link.active { background: rgba(13, 110, 253, 0.1); color: var(--site-primary); font-weight: 600; }

.site-main {
  flex: 1;
  min-width: 0;
  background: var(--site-card);
  border-radius: var(--site-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  padding: 1.75rem 2rem;
}

.site-main h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 0.5rem; }
.site-main h2 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; }
.site-main h3 { font-size: 1.05rem; margin: 0 0 0.5rem; }

.muted { color: var(--site-muted); }

.hero__description { color: var(--site-muted); max-width: 48rem; line-height: 1.6; white-space: pre-wrap; }

.stat-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.25rem 0; }
.stat-chip {
  background: #f8f9fa;
  border-radius: 2rem;
  padding: 0.35rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.phase-block { margin: 1rem 0; padding-bottom: 1rem; border-bottom: 1px solid #dee2e6; }
.phase-badge {
  display: inline-block;
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.6rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.catalog-list { list-style: none; padding: 0; margin: 0; }
.catalog-list li { padding: 0.5rem 0; border-bottom: 1px solid #f1f3f5; }
.catalog-list li:last-child { border-bottom: none; }

.breadcrumb { font-size: 0.875rem; color: var(--site-muted); margin-bottom: 1rem; }

.doc-block { margin-bottom: 1.25rem; }
.doc-block__label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--site-muted);
  margin-bottom: 0.35rem;
}
.doc-block__body {
  background: #f8f9fa;
  border-left: 3px solid var(--site-primary);
  border-radius: 0 0.375rem 0.375rem 0;
  padding: 0.85rem 1rem;
  line-height: 1.55;
  white-space: pre-wrap;
}
.doc-block__body--empty { color: var(--site-muted); font-style: italic; }

.relation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}
.relation-grid__cell { min-width: 0; }
.relation-grid__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--site-muted);
  margin-bottom: 0.35rem;
}
.relation-grid__list { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; }
.relation-grid__list li { padding: 0.15rem 0; }

.deps-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.phase-badge-header {
  display: inline-block;
  color: #fff;
  padding: 0.25rem 0.65rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.badge-optional {
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
  background: #e9ecef;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  margin-left: 0.35rem;
}

.ref-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-top: 0.5rem; }
.ref-table th, .ref-table td { border: 1px solid #dee2e6; padding: 0.35rem 0.5rem; text-align: left; }
.ref-table th { background: #f1f3f5; }

@media (max-width: 768px) {
  .site-body { flex-direction: column; }
  .site-nav { flex: none; width: 100%; position: static; }
  .relation-grid { grid-template-columns: 1fr 1fr; }
}
`;
