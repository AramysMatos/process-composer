import { AppDispatch } from 'app/config/store';
import {
  createEntitySilent as createActivity,
  getEntity as getActivity,
  updateEntitySilent as updateActivity,
} from 'app/entities/activity/activity.reducer';
import { IActivity } from 'app/shared/model/activity.model';
import { mapIdList } from 'app/shared/util/entity-utils';

const mapRelationIds = (items?: Array<{ id?: number }> | null) =>
  mapIdList(items?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []);

export interface CloneActivityOptions {
  sourceActivityId: number;
  targetPhaseId?: number | null;
  name?: string;
  copyDependencies?: boolean;
}

export async function cloneActivity(dispatch: AppDispatch, options: CloneActivityOptions): Promise<number> {
  const { sourceActivityId, targetPhaseId, name, copyDependencies = false } = options;
  const { data: source } = await dispatch(getActivity(sourceActivityId)).unwrap();

  const copySuffix = ' (cópia)';
  const baseName = source.name ?? 'Atividade';
  const resolvedName = name?.trim() || `${baseName}${copySuffix}`;

  const createPayload: IActivity = {
    name: resolvedName,
    description: source.description,
    inputCriterion: source.inputCriterion,
    phase: targetPhaseId ? { id: targetPhaseId } : undefined,
    templates: mapRelationIds(source.templates),
    guidelines: mapRelationIds(source.guidelines),
    participantRoles: mapRelationIds(source.participantRoles),
    responsibleRoles: mapRelationIds(source.responsibleRoles),
    tools: mapRelationIds(source.tools),
    requiredArtifacts: mapRelationIds(source.requiredArtifacts),
    producedArtifacts: mapRelationIds(source.producedArtifacts),
  };

  const { data: newActivity } = await dispatch(createActivity(createPayload)).unwrap();
  if (!newActivity.id) {
    throw new Error('Failed to create activity copy');
  }

  if (copyDependencies) {
    const predecessorIds = mapRelationIds(source.predecessorActivities);
    const subActivityIds = mapRelationIds(source.subActivities);

    if (predecessorIds.length > 0 || subActivityIds.length > 0) {
      await dispatch(
        updateActivity({
          id: newActivity.id,
          name: createPayload.name,
          description: createPayload.description,
          inputCriterion: createPayload.inputCriterion,
          phase: createPayload.phase,
          templates: createPayload.templates,
          guidelines: createPayload.guidelines,
          participantRoles: createPayload.participantRoles,
          responsibleRoles: createPayload.responsibleRoles,
          tools: createPayload.tools,
          requiredArtifacts: createPayload.requiredArtifacts,
          producedArtifacts: createPayload.producedArtifacts,
          predecessorActivities: predecessorIds,
          subActivities: subActivityIds,
        })
      ).unwrap();
    }
  }

  return newActivity.id;
}
