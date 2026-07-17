import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

import { IRootState } from 'app/config/store';
import { getEntity } from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { IProject } from 'app/shared/model/project.model';
import { IEntityComboboxItem } from 'app/shared-ui/entity-combobox-creatable';

type ActivityResolverDispatch = ThunkDispatch<IRootState, unknown, AnyAction>;

/**
 * Activities nested in Task responses omit relationship arrays (see Task.java @JsonIgnoreProperties).
 * A fully hydrated activity exposes roles, tools, artifacts, etc.
 *
 * Note: activities from GET /activities (without eagerload) may include empty relationship
 * arrays without actually loading them — never treat list cache as hydrated.
 */
export function isActivityFullyHydrated(activity: IActivity): boolean {
  return (
    activity.requiredArtifacts !== undefined &&
    activity.producedArtifacts !== undefined &&
    activity.responsibleRoles !== undefined &&
    activity.participantRoles !== undefined &&
    activity.tools !== undefined &&
    activity.guidelines !== undefined &&
    activity.templates !== undefined
  );
}

export async function resolveActivity(
  activityRef: IActivity,
  dispatch: ActivityResolverDispatch,
  getState: () => IRootState
): Promise<IActivity> {
  if (activityRef.id == null) {
    return activityRef;
  }

  const loadedEntity = getState().activity.entity;
  if (loadedEntity?.id === activityRef.id && isActivityFullyHydrated(loadedEntity)) {
    return loadedEntity;
  }

  const result = await dispatch(getEntity(activityRef.id));
  if (getEntity.fulfilled.match(result)) {
    return result.payload.data;
  }

  throw result.payload ?? new Error(`Falha ao carregar atividade ${activityRef.id}`);
}

export const isGitHubConnected = (project: Pick<IProject, 'gitHubRepository' | 'gitHubTokenConfigured'>): boolean =>
  Boolean(project.gitHubRepository?.trim()) && Boolean(project.gitHubTokenConfigured);

export const filterActivitiesByProcess = (processId: number | undefined, phases: IPhase[], activities: IActivity[]): IActivity[] => {
  if (!processId) {
    return [];
  }

  const phaseIds = new Set(
    phases.filter(phase => phase.process?.id === processId && phase.id !== undefined).map(phase => phase.id as number)
  );

  return activities.filter(
    activity => activity.id !== undefined && activity.phase?.id !== undefined && phaseIds.has(activity.phase.id as number)
  );
};

export const getActivityOptionsForProcess = (
  processId: number | undefined,
  phases: IPhase[],
  activities: IActivity[]
): IEntityComboboxItem[] => {
  return filterActivitiesByProcess(processId, phases, activities)
    .map(activity => ({
      id: activity.id as number,
      name: activity.name ?? `Activity ${activity.id}`,
    }))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }));
};
