import { AppDispatch } from 'app/config/store';
import { createEntitySilent as createActivity, updateEntitySilent as updateActivity } from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { mapIdList } from 'app/shared/util/entity-utils';

const mapRelationIds = (items?: Array<{ id?: number }> | null) =>
  mapIdList(items?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []);

export async function cloneActivitiesForPhase(
  dispatch: AppDispatch,
  sourceActivities: IActivity[],
  targetPhaseId: number
): Promise<Map<number, number>> {
  const activityIdMap = new Map<number, number>();

  for (const activity of sourceActivities) {
    const createPayload: IActivity = {
      name: activity.name,
      description: activity.description,
      inputCriterion: activity.inputCriterion,
      phase: { id: targetPhaseId },
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

    await dispatch(
      updateActivity({
        id: newActivityId,
        name: activity.name,
        description: activity.description,
        inputCriterion: activity.inputCriterion,
        phase: { id: targetPhaseId },
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

  return activityIdMap;
}
