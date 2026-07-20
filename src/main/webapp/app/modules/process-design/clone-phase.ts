import axios from 'axios';

import { AppDispatch } from 'app/config/store';
import { createEntitySilent as createPhase, getEntity as getPhase } from 'app/entities/phase/phase.reducer';
import { cloneActivitiesForPhase } from 'app/modules/process-design/clone-activities-for-phase';
import { IActivity } from 'app/shared/model/activity.model';

export interface ClonePhaseOptions {
  sourcePhaseId: number;
  targetProcessId?: number | null;
  name?: string;
  copyActivities?: boolean;
  activityIdsToClone?: number[];
  activityIdMap?: Map<number, number>;
  skipDependencyUpdate?: boolean;
}

export async function clonePhase(dispatch: AppDispatch, options: ClonePhaseOptions): Promise<number> {
  const { sourcePhaseId, targetProcessId, name, copyActivities = true, activityIdsToClone, activityIdMap, skipDependencyUpdate } = options;
  const { data: source } = await dispatch(getPhase(sourcePhaseId)).unwrap();

  const copySuffix = ' (cópia)';
  const baseName = source.name ?? 'Fase';
  const resolvedName = name?.trim() || `${baseName}${copySuffix}`;

  const { data: newPhase } = await dispatch(
    createPhase({
      name: resolvedName,
      description: source.description,
      process: targetProcessId ? { id: targetProcessId } : undefined,
    })
  ).unwrap();

  if (!newPhase.id) {
    throw new Error('Failed to create phase copy');
  }

  if (copyActivities) {
    const activitiesResponse = await axios.get<IActivity[]>(`api/activities?phaseId=${sourcePhaseId}&eagerload=true`);
    const activitiesToClone =
      activityIdsToClone !== undefined
        ? activitiesResponse.data.filter(activity => activity.id !== undefined && activityIdsToClone.includes(activity.id))
        : activitiesResponse.data;

    if (activityIdsToClone === undefined || activitiesToClone.length > 0) {
      await cloneActivitiesForPhase(dispatch, activitiesToClone, newPhase.id, {
        activityIdMap,
        skipDependencyUpdate,
      });
    }
  }

  return newPhase.id;
}
