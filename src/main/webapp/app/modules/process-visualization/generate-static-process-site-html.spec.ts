import { buildStaticProcessSiteHtml } from './generate-static-process-site-html';
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

describe('generate-static-process-site-html', () => {
  it('includes catalog descriptions and activity relation links', () => {
    const html = buildStaticProcessSiteHtml(minimalSnapshot);

    expect(html).toContain('Papel de desenvolvimento');
    expect(html).toContain('Controle de versão');
    expect(html).toContain('Doc de especificação');
    expect(html).toContain('Ferramentas');
    expect(html).toContain('href="#catalog-tools-tool_git"');
    expect(html).toContain('Usado nas atividades');
    expect(html).toContain('Participante');
  });
});
