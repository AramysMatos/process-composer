import { LibraryEntityType } from 'app/modules/library/library.config';
import { IActivity } from 'app/shared/model/activity.model';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { IGuidelines } from 'app/shared/model/guidelines.model';
import { IRoles } from 'app/shared/model/roles.model';
import { ITemplates } from 'app/shared/model/templates.model';
import { ITools } from 'app/shared/model/tools.model';

export type ActivityEntityRelationKind =
  | 'participantRole'
  | 'responsibleRole'
  | 'tool'
  | 'guideline'
  | 'template'
  | 'requiredArtifact'
  | 'producedArtifact';

export interface ActivityEntityRef {
  activityId: number;
  activityName: string;
  relationKind: ActivityEntityRelationKind;
}

export interface IndexedEntity<T extends { id?: number; name?: string | null }> {
  entity: T;
  refs: ActivityEntityRef[];
}

export type ProcessVisualizationIndexes = {
  roles: Map<number, IndexedEntity<IRoles>>;
  tools: Map<number, IndexedEntity<ITools>>;
  guidelines: Map<number, IndexedEntity<IGuidelines>>;
  templates: Map<number, IndexedEntity<ITemplates>>;
  artifacts: Map<number, IndexedEntity<IArtifacts>>;
};

const upsertRef = <T extends { id?: number; name?: string | null }>(
  map: Map<number, IndexedEntity<T>>,
  entity: T,
  ref: ActivityEntityRef
) => {
  if (entity.id === undefined) {
    return;
  }
  const existing = map.get(entity.id);
  if (existing) {
    const already = existing.refs.some(item => item.activityId === ref.activityId && item.relationKind === ref.relationKind);
    if (!already) {
      existing.refs.push(ref);
    }
    return;
  }
  map.set(entity.id, { entity, refs: [ref] });
};

const activityRef = (activity: IActivity, relationKind: ActivityEntityRelationKind): ActivityEntityRef | null => {
  if (activity.id === undefined) {
    return null;
  }
  return {
    activityId: activity.id,
    activityName: activity.name ?? '',
    relationKind,
  };
};

export const buildProcessVisualizationIndexes = (activities: IActivity[]): ProcessVisualizationIndexes => {
  const roles = new Map<number, IndexedEntity<IRoles>>();
  const tools = new Map<number, IndexedEntity<ITools>>();
  const guidelines = new Map<number, IndexedEntity<IGuidelines>>();
  const templates = new Map<number, IndexedEntity<ITemplates>>();
  const artifacts = new Map<number, IndexedEntity<IArtifacts>>();

  activities.forEach(activity => {
    activity.participantRoles?.forEach(role => {
      const ref = activityRef(activity, 'participantRole');
      if (ref) {
        upsertRef(roles, role, ref);
      }
    });
    activity.responsibleRoles?.forEach(role => {
      const ref = activityRef(activity, 'responsibleRole');
      if (ref) {
        upsertRef(roles, role, ref);
      }
    });
    activity.tools?.forEach(tool => {
      const ref = activityRef(activity, 'tool');
      if (ref) {
        upsertRef(tools, tool, ref);
      }
    });
    activity.guidelines?.forEach(item => {
      const ref = activityRef(activity, 'guideline');
      if (ref) {
        upsertRef(guidelines, item, ref);
      }
    });
    activity.templates?.forEach(item => {
      const ref = activityRef(activity, 'template');
      if (ref) {
        upsertRef(templates, item, ref);
      }
    });
    activity.requiredArtifacts?.forEach(item => {
      const ref = activityRef(activity, 'requiredArtifact');
      if (ref) {
        upsertRef(artifacts, item, ref);
      }
    });
    activity.producedArtifacts?.forEach(item => {
      const ref = activityRef(activity, 'producedArtifact');
      if (ref) {
        upsertRef(artifacts, item, ref);
      }
    });
  });

  return { roles, tools, guidelines, templates, artifacts };
};

export const sortedIndexedEntities = <T extends { id?: number; name?: string | null }>(
  map: Map<number, IndexedEntity<T>>
): IndexedEntity<T>[] =>
  [...map.values()].sort((left, right) =>
    (left.entity.name ?? '').localeCompare(right.entity.name ?? '', undefined, { sensitivity: 'base' })
  );

export const catalogTypeToIndexKey = (catalog: LibraryEntityType): keyof ProcessVisualizationIndexes => catalog;
