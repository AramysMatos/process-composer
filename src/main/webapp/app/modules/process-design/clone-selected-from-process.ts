import axios from 'axios';

import { AppDispatch } from 'app/config/store';
import { createEntitySilent as createPhase, getEntity as getPhase } from 'app/entities/phase/phase.reducer';
import { createEntity as createProcess } from 'app/entities/process/process.reducer';
import {
  applyClonedActivityDependencies,
  cloneActivitiesForPhase,
  ClonedActivityContext,
} from 'app/modules/process-design/clone-activities-for-phase';
import { ActivitySelectionTreePhase } from 'app/modules/execution/components/activity-selection-tree.utils';
import { IActivity } from 'app/shared/model/activity.model';
import { IProcess } from 'app/shared/model/process.model';

export interface CloneSelectedFromProcessOptions {
  processName: string;
  processDescription?: string | null;
  sourceProcessId: number;
  selectedActivityIds: number[];
  selectedEmptyPhaseIds: number[];
  activityTree: ActivitySelectionTreePhase[];
}

export async function cloneSelectedFromProcess(dispatch: AppDispatch, options: CloneSelectedFromProcessOptions): Promise<number> {
  const { processName, processDescription, selectedActivityIds, selectedEmptyPhaseIds, activityTree } = options;

  const processPayload: IProcess = {
    processName,
    processDescription: processDescription || null,
  };

  const { data: newProcess } = await dispatch(createProcess(processPayload)).unwrap();
  const newProcessId = newProcess.id;

  if (!newProcessId) {
    throw new Error('Failed to create process');
  }

  const selectedActivityIdSet = new Set(selectedActivityIds);
  const selectedEmptyPhaseIdSet = new Set(selectedEmptyPhaseIds);
  const activitiesResponse = await axios.get<IActivity[]>('api/activities?eagerload=true');
  const activityIdMap = new Map<number, number>();
  const clonedActivities: ClonedActivityContext[] = [];

  for (const phase of activityTree) {
    const phaseSelectedActivityIds = phase.activities
      .map(activity => activity.id)
      .filter(activityId => selectedActivityIdSet.has(activityId));

    const shouldCloneEmptyPhase = phase.activities.length === 0 && selectedEmptyPhaseIdSet.has(phase.id);
    const shouldClonePhaseWithActivities = phaseSelectedActivityIds.length > 0;

    if (!shouldCloneEmptyPhase && !shouldClonePhaseWithActivities) {
      continue;
    }

    const { data: sourcePhase } = await dispatch(getPhase(phase.id)).unwrap();
    const { data: newPhase } = await dispatch(
      createPhase({
        name: phase.name,
        description: sourcePhase.description,
        process: { id: newProcessId },
      })
    ).unwrap();

    if (!newPhase.id) {
      throw new Error('Failed to create phase copy');
    }

    if (!shouldClonePhaseWithActivities) {
      continue;
    }

    const sourceActivities = activitiesResponse.data.filter(
      activity => activity.id !== undefined && phaseSelectedActivityIds.includes(activity.id)
    );

    await cloneActivitiesForPhase(dispatch, sourceActivities, newPhase.id, {
      activityIdMap,
      skipDependencyUpdate: true,
    });

    sourceActivities.forEach(sourceActivity => {
      clonedActivities.push({ sourceActivity, targetPhaseId: newPhase.id });
    });
  }

  await applyClonedActivityDependencies(dispatch, clonedActivities, activityIdMap);

  return newProcessId;
}
