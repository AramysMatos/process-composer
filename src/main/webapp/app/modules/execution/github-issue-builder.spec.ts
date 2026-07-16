import { buildIssueBody } from './github-issue-builder';
import { IActivity } from 'app/shared/model/activity.model';
import { ITask } from 'app/shared/model/task.model';

const taskUrl = 'http://localhost:8080/projetos/1/tarefas?task=5';

describe('buildIssueBody', () => {
  it('should return fallback body with task link when there are no activities', () => {
    const task: ITask = {
      id: 5,
      description: 'Descrição da tarefa',
    };

    const body = buildIssueBody(task, [], taskUrl);

    expect(body).toContain('## Descrição da tarefa');
    expect(body).toContain('Descrição da tarefa');
    expect(body).toContain(`[Abrir no Process Composer](${taskUrl})`);
    expect(body).not.toContain('## Atividades relacionadas');
  });

  it('should format a single activity with artifacts, roles, tools, guidelines and templates', () => {
    const task: ITask = {
      id: 5,
      description: 'Implementar autenticação',
    };

    const activity: IActivity = {
      id: 10,
      name: 'Planejar sprint',
      description: 'Definir escopo da sprint',
      requiredArtifacts: [{ name: 'Backlog', description: 'Lista priorizada' }],
      producedArtifacts: [{ name: 'Plano de sprint', description: 'Objetivos da sprint' }],
      responsibleRoles: [{ name: 'Gerente de Projeto' }],
      participantRoles: [{ name: 'Arquiteto de Software' }, { name: 'Tech Lead' }],
      tools: [{ name: 'Jira', description: 'Gestão de backlog' }],
      guidelines: [{ name: 'Definition of Ready', description: 'Critérios de entrada' }],
      templates: [{ name: 'Modelo de sprint', description: 'Template padrão' }],
    };

    const body = buildIssueBody(task, [activity], taskUrl);

    expect(body).toContain('## Atividades relacionadas');
    expect(body).toContain('### Atividade 1: Planejar sprint');
    expect(body).toContain('Definir escopo da sprint');
    expect(body).toContain('- **Backlog**: Lista priorizada');
    expect(body).toContain('- **Plano de sprint**: Objetivos da sprint');
    expect(body).toContain('**Responsável:** Gerente de Projeto · **Participantes:** Arquiteto de Software, Tech Lead');
    expect(body).toContain('#### Ferramentas');
    expect(body).toContain('- **Jira**: Gestão de backlog');
    expect(body).toContain('#### Orientações');
    expect(body).toContain('- **Definition of Ready**: Critérios de entrada');
    expect(body).toContain('#### Templates');
    expect(body).toContain('- **Modelo de sprint**: Template padrão');
    expect(body).toContain(`[Abrir no Process Composer](${taskUrl})`);
  });

  it('should number multiple activities and omit empty optional sections', () => {
    const task: ITask = {
      id: 5,
      description: 'Tarefa composta',
    };

    const activities: IActivity[] = [
      {
        id: 1,
        name: 'Atividade A',
        requiredArtifacts: [],
        producedArtifacts: [],
        responsibleRoles: [],
        participantRoles: [],
        tools: [],
        guidelines: [],
        templates: [],
      },
      {
        id: 2,
        name: 'Atividade B',
        description: 'Segunda etapa',
        requiredArtifacts: [{ name: 'Input' }],
        producedArtifacts: [{ name: 'Output' }],
        responsibleRoles: [{ name: 'Dev' }],
        participantRoles: [],
        tools: [],
        guidelines: [],
        templates: [],
      },
    ];

    const body = buildIssueBody(task, activities, taskUrl);

    expect(body).toContain('### Atividade 1: Atividade A');
    expect(body).toContain('### Atividade 2: Atividade B');
    expect(body).toContain('Segunda etapa');
    expect(body).not.toContain('#### Ferramentas');
    expect(body).not.toContain('#### Orientações');
    expect(body).not.toContain('#### Templates');
  });
});
