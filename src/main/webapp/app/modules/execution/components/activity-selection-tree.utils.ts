import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';

export interface ActivitySelectionTreePhase {
  id: number;
  name: string;
  activities: Array<{ id: number; name: string }>;
}

export const buildActivitySelectionTree = (
  processId: number | undefined,
  phases: IPhase[],
  activities: IActivity[]
): ActivitySelectionTreePhase[] => {
  if (!processId) {
    return [];
  }

  const processPhases = phases
    .filter(phase => phase.process?.id === processId && phase.id !== undefined)
    .sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

  return processPhases.map(phase => {
    const phaseActivities = activities
      .filter(activity => activity.id !== undefined && activity.phase?.id === phase.id)
      .sort((left, right) => {
        const nameCompare = (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' });
        if (nameCompare !== 0) {
          return nameCompare;
        }
        return (left.id ?? 0) - (right.id ?? 0);
      })
      .map(activity => ({
        id: activity.id as number,
        name: activity.name ?? `Activity ${activity.id}`,
      }));

    return {
      id: phase.id as number,
      name: phase.name ?? `Phase ${phase.id}`,
      activities: phaseActivities,
    };
  });
};

export const getAllActivityIdsFromTree = (tree: ActivitySelectionTreePhase[]): number[] =>
  tree.flatMap(phase => phase.activities.map(activity => activity.id));

export const getPhaseSelectionState = (
  phase: ActivitySelectionTreePhase,
  selectedActivityIds: Set<number>
): { checked: boolean; indeterminate: boolean } => {
  if (phase.activities.length === 0) {
    return { checked: false, indeterminate: false };
  }

  const selectedCount = phase.activities.filter(activity => selectedActivityIds.has(activity.id)).length;

  return {
    checked: selectedCount === phase.activities.length,
    indeterminate: selectedCount > 0 && selectedCount < phase.activities.length,
  };
};
