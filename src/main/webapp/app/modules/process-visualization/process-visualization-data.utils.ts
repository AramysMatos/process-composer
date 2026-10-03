import { IActivity } from 'app/shared/model/activity.model';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { IPhase } from 'app/shared/model/phase.model';
import { sortActivitiesByFlow, sortPhasesByActivityFlow } from 'app/shared/util/sort-activities-by-flow.utils';

export const sortById = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

export const sortActivitiesByName = (activities: IActivity[]): IActivity[] =>
  [...activities].sort((left, right) => {
    const nameCompare = (left.name ?? '').localeCompare(right.name ?? '', undefined, { sensitivity: 'base' });
    if (nameCompare !== 0) {
      return nameCompare;
    }
    return (left.id ?? 0) - (right.id ?? 0);
  });

export const filterPhasesForProcess = (processId: number, phaseEntities: IPhase[], activityEntities: IActivity[]): IPhase[] => {
  const processPhases = phaseEntities.filter(phase => phase.process?.id === processId);
  const phaseIds = new Set(processPhases.flatMap(phase => (phase.id !== undefined ? [phase.id] : [])));
  const processActivities = activityEntities.filter(activity => activity.phase?.id !== undefined && phaseIds.has(activity.phase.id));
  return sortPhasesByActivityFlow(processPhases, processActivities);
};

export const filterActivitiesForPhases = (phases: IPhase[], activityEntities: IActivity[]): IActivity[] => {
  const grouped = groupActivitiesByPhaseId(phases, activityEntities);
  return phases.flatMap(phase => (phase.id !== undefined ? grouped.get(phase.id) ?? [] : []));
};

export const hydrateActivitiesWithArtifacts = (activities: IActivity[], artifacts: IArtifacts[]): IActivity[] => {
  const artifactById = new Map(artifacts.flatMap(artifact => (artifact.id !== undefined ? [[artifact.id, artifact] as const] : [])));

  const hydrateArtifactList = (items?: IArtifacts[] | null) =>
    (items ?? []).map(item => (item.id !== undefined ? artifactById.get(item.id) ?? item : item));

  return activities.map(activity => ({
    ...activity,
    requiredArtifacts: hydrateArtifactList(activity.requiredArtifacts),
    producedArtifacts: hydrateArtifactList(activity.producedArtifacts),
  }));
};

export const groupActivitiesByPhaseId = (phases: IPhase[], activities: IActivity[]): Map<number, IActivity[]> => {
  const grouped = new Map<number, IActivity[]>();
  phases.forEach(phase => {
    if (phase.id !== undefined) {
      grouped.set(phase.id, []);
    }
  });
  activities.forEach(activity => {
    const phaseId = activity.phase?.id;
    if (phaseId !== undefined && grouped.has(phaseId)) {
      grouped.get(phaseId)?.push(activity);
    }
  });
  grouped.forEach((list, phaseId) => {
    grouped.set(phaseId, sortActivitiesByFlow(list));
  });
  return grouped;
};
