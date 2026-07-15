import { IActivity } from 'app/shared/model/activity.model';
import { mapIdList } from 'app/shared/util/entity-utils';
import { IEntityComboboxItem } from 'app/shared-ui/entity-combobox-creatable';

export const toComboboxItems = (items: Array<{ id?: number; name?: string | null }> | null | undefined): IEntityComboboxItem[] =>
  (items ?? [])
    .filter(item => item.id !== undefined)
    .map(item => ({
      id: item.id as number,
      name: item.name ?? '',
    }));

export const cloneActivityDraft = (activity: IActivity): IActivity => ({
  ...activity,
  subActivities: activity.subActivities ? [...activity.subActivities] : [],
  predecessorActivities: activity.predecessorActivities ? [...activity.predecessorActivities] : [],
  templates: activity.templates ? [...activity.templates] : [],
  guidelines: activity.guidelines ? [...activity.guidelines] : [],
  participantRoles: activity.participantRoles ? [...activity.participantRoles] : [],
  responsibleRoles: activity.responsibleRoles ? [...activity.responsibleRoles] : [],
  tools: activity.tools ? [...activity.tools] : [],
  requiredArtifacts: activity.requiredArtifacts ? [...activity.requiredArtifacts] : [],
  producedArtifacts: activity.producedArtifacts ? [...activity.producedArtifacts] : [],
  phase: activity.phase ? { ...activity.phase } : activity.phase,
});

export const toActivityUpdatePayload = (activity: IActivity): IActivity => ({
  ...activity,
  subActivities: mapIdList(activity.subActivities?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  predecessorActivities: mapIdList(
    activity.predecessorActivities?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []
  ),
  templates: mapIdList(activity.templates?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  guidelines: mapIdList(activity.guidelines?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  participantRoles: mapIdList(activity.participantRoles?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  responsibleRoles: mapIdList(activity.responsibleRoles?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  tools: mapIdList(activity.tools?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  requiredArtifacts: mapIdList(activity.requiredArtifacts?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  producedArtifacts: mapIdList(activity.producedArtifacts?.map(item => item.id).filter((id): id is number => id !== undefined) ?? []),
  phase: activity.phase?.id ? { id: activity.phase.id, name: activity.phase.name } : activity.phase,
});
