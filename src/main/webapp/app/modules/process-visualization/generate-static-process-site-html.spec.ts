import { buildStaticProcessSiteFiles } from './build-static-process-site';
import { buildStaticProcessSiteHtml } from './generate-static-process-site-html';
import { buildSlugRegistry } from './static-site-paths';
import { ProcessSnapshot } from './process-snapshot.model';

const minimalSnapshot: ProcessSnapshot = {
  processName: 'Processo teste',
  processDescription: 'Descrição do processo',
  phases: [{ key: 'phase_1', name: 'Fase 1', description: '', activityKeys: ['act_1'] }],
  activities: [
    {
      key: 'act_1',
      name: 'Atividade 1',
      description: 'Desc atividade',
      inputCriterion: 'Critério',
      phaseKey: 'phase_1',
      toolKeys: ['tool_git'],
      guidelineKeys: [],
      templateKeys: [],
      requiredArtifactKeys: ['art_req'],
      producedArtifactKeys: [],
      participantRoleKeys: ['role_dev'],
      responsibleRoleKeys: [],
      subActivityKeys: [],
      predecessorKeys: [],
    },
  ],
  roles: {
    role_dev: { key: 'role_dev', name: 'Desenvolvedor', description: 'Papel de desenvolvimento' },
  },
  tools: {
    tool_git: { key: 'tool_git', name: 'Git', description: 'Controle de versão' },
  },
  guidelines: {},
  templates: {},
  artifacts: {
    art_req: { key: 'art_req', name: 'Especificação', description: 'Doc de especificação', optional: false },
  },
};

describe('build-static-process-site', () => {
  it('generates multipage site with shared css', () => {
    const files = buildStaticProcessSiteFiles(minimalSnapshot);

    expect(files.has('index.html')).toBe(true);
    expect(files.has('assets/site.css')).toBe(true);
    expect(files.has('activities/index.html')).toBe(true);
    expect(files.has('activities/act-1.html')).toBe(true);
    expect(files.has('roles/index.html')).toBe(true);
    expect(files.has('roles/role-dev.html')).toBe(true);
    expect(files.has('tools/tool-git.html')).toBe(true);

    const activityPage = files.get('activities/act-1.html') ?? '';
    expect(activityPage).toContain('href="../roles/role-dev.html"');
    expect(activityPage).toContain('href="../tools/tool-git.html"');
    expect(activityPage).toContain('href="../assets/site.css"');
    expect(activityPage).toContain('relation-grid');

    const rolePage = files.get('roles/role-dev.html') ?? '';
    expect(rolePage).toContain('href="../assets/site.css"');
    expect(rolePage).toContain('Papel de desenvolvimento');
    expect(rolePage).toContain('Usado nas atividades');
    expect(rolePage).toContain('Participante');
  });

  it('buildStaticProcessSiteHtml returns overview page only', () => {
    const html = buildStaticProcessSiteHtml(minimalSnapshot);
    expect(html).toContain('Processo teste');
    expect(html).not.toContain('href="#catalog');
  });

  it('resolves slug collisions with hash suffix', () => {
    const registry = buildSlugRegistry(['foo bar', 'foo-bar']);
    expect(registry.get('foo bar')).not.toBe(registry.get('foo-bar'));
  });
});
