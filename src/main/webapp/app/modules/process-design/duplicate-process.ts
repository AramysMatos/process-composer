import axios from 'axios';

import { AppDispatch } from 'app/config/store';
import { createEntitySilent as createActivity, updateEntitySilent as updateActivity } from 'app/entities/activity/activity.reducer';
import { createEntitySilent as createPhase } from 'app/entities/phase/phase.reducer';
import { createEntity as createProcess, getEntity as getProcess } from 'app/entities/process/process.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { mapIdList } from 'app/shared/util/entity-utils';

const mapRelationIds = (items?: Array<{ id?: number }> | null) =>
  mapIdList(items?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []);

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

  const phasesResponse = await axios.get<IPhase[]>('api/phases');
  const sourcePhases = phasesResponse.data
    .filter(phase => phase.process?.id === processId)
    .sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

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
  const sourcePhaseIds = new Set(sourcePhases.map(phase => phase.id).filter((id): id is number => id !== undefined));
  const sourceActivities = activitiesResponse.data.filter(activity => activity.phase?.id && sourcePhaseIds.has(activity.phase.id));

  const activityIdMap = new Map<number, number>();

  for (const activity of sourceActivities) {
    const sourcePhaseId = activity.phase?.id;
    const newPhaseId = sourcePhaseId ? phaseIdMap.get(sourcePhaseId) : undefined;
    if (!newPhaseId) {
      continue;
    }

    const createPayload: IActivity = {
      name: activity.name,
      description: activity.description,
      inputCriterion: activity.inputCriterion,
      phase: { id: newPhaseId },
      templates: mapRelationIds(activity.templates),
      guidelines: mapRelationIds(activity.guidelines),
      participantRoles: mapRelationIds(activity.participantRoles),
      responsibleRoles: mapRelationIds(activity.responsibleRoles),
      tools: mapRelationIds(activity.tools),
      requiredArtifacts: mapRelationIds(activity.requiredArtifacts),
      producedArtifacts: mapRelationIds(activity.producedArtifacts),
    };

    const { data: newActivity } = await dispatch(createActivity(createPayload)).unwrap();
    if (activity.id && newActivity.id) {
      activityIdMap.set(activity.id, newActivity.id);
    }
  }

  for (const activity of sourceActivities) {
    if (!activity.id) {
      continue;
    }

    const newActivityId = activityIdMap.get(activity.id);
    if (!newActivityId) {
      continue;
    }

    const mappedPredecessors = (activity.predecessorActivities ?? [])
      .map(item => (item.id ? activityIdMap.get(item.id) : undefined))
      .filter((id): id is number => id !== undefined);

    const mappedSubActivities = (activity.subActivities ?? [])
      .map(item => (item.id ? activityIdMap.get(item.id) : undefined))
      .filter((id): id is number => id !== undefined);

    if (mappedPredecessors.length === 0 && mappedSubActivities.length === 0) {
      continue;
    }

    const sourcePhaseId = activity.phase?.id;
    const newPhaseId = sourcePhaseId ? phaseIdMap.get(sourcePhaseId) : undefined;

    await dispatch(
      updateActivity({
        id: newActivityId,
        name: activity.name,
        description: activity.description,
        inputCriterion: activity.inputCriterion,
        phase: newPhaseId ? { id: newPhaseId } : undefined,
        templates: mapRelationIds(activity.templates),
        guidelines: mapRelationIds(activity.guidelines),
        participantRoles: mapRelationIds(activity.participantRoles),
        responsibleRoles: mapRelationIds(activity.responsibleRoles),
        tools: mapRelationIds(activity.tools),
        requiredArtifacts: mapRelationIds(activity.requiredArtifacts),
        producedArtifacts: mapRelationIds(activity.producedArtifacts),
        predecessorActivities: mapIdList(mappedPredecessors),
        subActivities: mapIdList(mappedSubActivities),
      })
    ).unwrap();
  }

  return newProcessId;
}
