import axios from 'axios';

import { AppDispatch } from 'app/config/store';
import { createEntitySilent as createPhase } from 'app/entities/phase/phase.reducer';
import { createEntity as createProcess, getEntity as getProcess } from 'app/entities/process/process.reducer';
import {
  applyClonedActivityDependencies,
  cloneActivitiesForPhase,
  ClonedActivityContext,
} from 'app/modules/process-design/clone-activities-for-phase';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';

export async function duplicateProcess(dispatch: AppDispatch, processId: number): Promise<number> {
  const { data: sourceProcess } = await dispatch(getProcess(processId)).unwrap();

  const copySuffix = ' (cópia)';
  const baseName = sourceProcess.processName ?? 'Processo';
  const processPayload = {
    processName: `${baseName}${copySuffix}`,
    processDescription: sourceProcess.processDescription ?? null,
  };

  const { data: newProcess } = await dispatch(createProcess(processPayload)).unwrap();
  const newProcessId = newProcess.id;
  if (!newProcessId) {
    throw new Error('Failed to create process copy');
  }

  const phasesResponse = await axios.get<IPhase[]>(`api/phases?processId=${processId}`);
  const sourcePhases = phasesResponse.data.sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

  const phaseIdMap = new Map<number, number>();
  for (const phase of sourcePhases) {
    const { data: newPhase } = await dispatch(
      createPhase({
        name: phase.name,
        description: phase.description,
        process: { id: newProcessId, processName: processPayload.processName },
      })
    ).unwrap();

    if (phase.id && newPhase.id) {
      phaseIdMap.set(phase.id, newPhase.id);
    }
  }

  const activitiesResponse = await axios.get<IActivity[]>('api/activities?eagerload=true');
  const activityIdMap = new Map<number, number>();
  const clonedActivities: ClonedActivityContext[] = [];

  for (const sourcePhase of sourcePhases) {
    if (!sourcePhase.id) {
      continue;
    }

    const newPhaseId = phaseIdMap.get(sourcePhase.id);
    if (!newPhaseId) {
      continue;
    }

    const sourceActivities = activitiesResponse.data.filter(activity => activity.phase?.id === sourcePhase.id);
    await cloneActivitiesForPhase(dispatch, sourceActivities, newPhaseId, {
      activityIdMap,
      skipDependencyUpdate: true,
    });

    sourceActivities.forEach(sourceActivity => {
      clonedActivities.push({ sourceActivity, targetPhaseId: newPhaseId });
    });
  }

  await applyClonedActivityDependencies(dispatch, clonedActivities, activityIdMap);

  return newProcessId;
}
