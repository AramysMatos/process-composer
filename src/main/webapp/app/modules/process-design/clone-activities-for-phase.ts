import { AppDispatch } from 'app/config/store';
import { createEntitySilent as createActivity, updateEntitySilent as updateActivity } from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { mapIdList } from 'app/shared/util/entity-utils';

const mapRelationIds = (items?: Array<{ id?: number }> | null) =>
  mapIdList(items?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []);

export interface ClonedActivityContext {
  sourceActivity: IActivity;
  targetPhaseId: number;
}

export interface CloneActivitiesForPhaseOptions {
  activityIdMap?: Map<number, number>;
  skipDependencyUpdate?: boolean;
}

export async function applyClonedActivityDependencies(
  dispatch: AppDispatch,
  clonedActivities: ClonedActivityContext[],
  activityIdMap: Map<number, number>
): Promise<void> {
  for (const { sourceActivity, targetPhaseId } of clonedActivities) {
    if (!sourceActivity.id) {
      continue;
    }

    const newActivityId = activityIdMap.get(sourceActivity.id);
    if (!newActivityId) {
      continue;
    }

    const mappedPredecessors = (sourceActivity.predecessorActivities ?? [])
      .map(item => (item.id ? activityIdMap.get(item.id) : undefined))
      .filter((id): id is number => id !== undefined);

    const mappedSubActivities = (sourceActivity.subActivities ?? [])
      .map(item => (item.id ? activityIdMap.get(item.id) : undefined))
      .filter((id): id is number => id !== undefined);

    if (mappedPredecessors.length === 0 && mappedSubActivities.length === 0) {
      continue;
    }

    await dispatch(
      updateActivity({
        id: newActivityId,
        name: sourceActivity.name,
        description: sourceActivity.description,
        inputCriterion: sourceActivity.inputCriterion,
        phase: { id: targetPhaseId },
        templates: mapRelationIds(sourceActivity.templates),
        guidelines: mapRelationIds(sourceActivity.guidelines),
        participantRoles: mapRelationIds(sourceActivity.participantRoles),
        responsibleRoles: mapRelationIds(sourceActivity.responsibleRoles),
        tools: mapRelationIds(sourceActivity.tools),
        requiredArtifacts: mapRelationIds(sourceActivity.requiredArtifacts),
        producedArtifacts: mapRelationIds(sourceActivity.producedArtifacts),
        predecessorActivities: mapIdList(mappedPredecessors),
        subActivities: mapIdList(mappedSubActivities),
      })
    ).unwrap();
  }
}

export async function cloneActivitiesForPhase(
  dispatch: AppDispatch,
  sourceActivities: IActivity[],
  targetPhaseId: number,
  options?: CloneActivitiesForPhaseOptions
): Promise<Map<number, number>> {
  const activityIdMap = options?.activityIdMap ?? new Map<number, number>();

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

  if (!options?.skipDependencyUpdate) {
    await applyClonedActivityDependencies(
      dispatch,
      sourceActivities.map(sourceActivity => ({ sourceActivity, targetPhaseId })),
      activityIdMap
    );
  }

  return activityIdMap;
}
