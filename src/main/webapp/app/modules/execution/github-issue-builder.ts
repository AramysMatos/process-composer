import type { IActivity } from 'app/shared/model/activity.model';
import type { ITask } from 'app/shared/model/task.model';

export function buildIssueBody(task: ITask, hydratedActivities: IActivity[]): string {
  if (hydratedActivities.length === 0) {
    return task.description ?? '_tarefa sem atividade de processo vinculada_';
  }
  const requiredArtifacts = hydratedActivities.flatMap(a => a.requiredArtifacts ?? []).map(a => a.name);
  const producedArtifacts = hydratedActivities.flatMap(a => a.producedArtifacts ?? []).map(a => a.name);
  const responsibleRoles = hydratedActivities.flatMap(a => a.responsibleRoles ?? []).map(r => r.name);
  const participantRoles = hydratedActivities.flatMap(a => a.participantRoles ?? []).map(r => r.name);

  return [
    task.description ?? '',
    '',
    `**atividades relacionadas:** ${hydratedActivities.map(a => a.name).join(', ')}`,
    `**artefatos necessários:** ${requiredArtifacts.join(', ') || 'nenhum'}`,
    `**artefatos produzidos:** ${producedArtifacts.join(', ') || 'nenhum'}`,
    `**responsável:** ${responsibleRoles.join(', ') || 'não definido'} · **participantes:** ${participantRoles.join(', ') || 'nenhum'}`,
  ].join('\n');
}
