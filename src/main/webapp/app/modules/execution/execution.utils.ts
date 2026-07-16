import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { IProject } from 'app/shared/model/project.model';
import { IEntityComboboxItem } from 'app/shared-ui/entity-combobox-creatable';

export const isGitHubConnected = (project: Pick<IProject, 'gitHubRepository' | 'gitHubTokenConfigured'>): boolean =>
  Boolean(project.gitHubRepository?.trim()) && Boolean(project.gitHubTokenConfigured);

export const getActivityOptionsForProcess = (
  processId: number | undefined,
  phases: IPhase[],
  activities: IActivity[]
): IEntityComboboxItem[] => {
  if (!processId) {
    return [];
  }

  const phaseIds = new Set(
    phases.filter(phase => phase.process?.id === processId && phase.id !== undefined).map(phase => phase.id as number)
  );

  return activities
    .filter(activity => activity.id !== undefined && activity.phase?.id !== undefined && phaseIds.has(activity.phase.id as number))
    .map(activity => ({
      id: activity.id as number,
      name: activity.name ?? `Activity ${activity.id}`,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }));
};
