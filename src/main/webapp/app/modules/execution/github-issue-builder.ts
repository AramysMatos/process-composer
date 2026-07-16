import type { IActivity } from 'app/shared/model/activity.model';
import type { ITask } from 'app/shared/model/task.model';

interface NamedItem {
  name?: string | null;
  description?: string | null;
}

function normalizeInlineText(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '';
  }
  return value.replace(/\r\n/g, '\n').replace(/\n+/g, ' ').trim();
}

function formatNamedItems(items: NamedItem[] | null | undefined, emptyLabel: string): string[] {
  const named = (items ?? []).filter(item => item.name?.trim());
  if (named.length === 0) {
    return [`- _${emptyLabel}_`];
  }
  return named.map(item => {
    const name = normalizeInlineText(item.name);
    const description = normalizeInlineText(item.description);
    return description ? `- **${name}**: ${description}` : `- **${name}**`;
  });
}

function formatRoles(roles: NamedItem[] | null | undefined, emptyLabel: string): string {
  const names = (roles ?? []).map(r => r.name?.trim()).filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(', ') : emptyLabel;
}

function formatOptionalSection(title: string, items: NamedItem[] | null | undefined): string[] {
  const named = (items ?? []).filter(item => item.name?.trim());
  if (named.length === 0) {
    return [];
  }
  return [`#### ${title}`, ...formatNamedItems(named, 'nenhum'), ''];
}

function formatActivitySection(activity: IActivity, index: number): string[] {
  const lines: string[] = [`### Atividade ${index + 1}: ${activity.name ?? 'sem nome'}`, ''];

  const description = activity.description?.trim();
  if (description) {
    lines.push(description, '');
  }

  lines.push('#### Artefatos necessários', ...formatNamedItems(activity.requiredArtifacts, 'nenhum'), '');
  lines.push('#### Artefatos produzidos', ...formatNamedItems(activity.producedArtifacts, 'nenhum'), '');
  lines.push(
    `**Responsável:** ${formatRoles(activity.responsibleRoles, 'não definido')} · **Participantes:** ${formatRoles(
      activity.participantRoles,
      'nenhum'
    )}`,
    ''
  );

  lines.push(...formatOptionalSection('Ferramentas', activity.tools));
  lines.push(...formatOptionalSection('Orientações', activity.guidelines));
  lines.push(...formatOptionalSection('Templates', activity.templates));

  return lines;
}

export function buildIssueBody(task: ITask, hydratedActivities: IActivity[], taskUrl: string): string {
  if (hydratedActivities.length === 0) {
    const fallback = task.description?.trim() || '_tarefa sem atividade de processo vinculada_';
    return ['## Descrição da tarefa', '', fallback, '', '---', '', `**Link para a tarefa:** [Abrir no Process Composer](${taskUrl})`].join(
      '\n'
    );
  }

  const sections: string[] = [
    '## Descrição da tarefa',
    '',
    task.description?.trim() || '_sem descrição_',
    '',
    '---',
    '',
    '## Atividades relacionadas',
    '',
  ];

  hydratedActivities.forEach((activity, index) => {
    sections.push(...formatActivitySection(activity, index));
  });

  sections.push('---', '', `**Link para a tarefa:** [Abrir no Process Composer](${taskUrl})`);

  return sections
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
