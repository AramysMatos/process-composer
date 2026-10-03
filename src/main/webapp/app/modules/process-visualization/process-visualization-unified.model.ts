import { LibraryEntityType } from 'app/modules/library/library.config';
import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';
import { IProcess } from 'app/shared/model/process.model';
import { ActivityEntityRelationKind } from 'app/modules/process-visualization/process-visualization-indexes';
import { ProcessSnapshot, SnapshotCatalogItem } from 'app/modules/process-visualization/process-snapshot.model';
import {
  filterActivitiesForPhases,
  filterPhasesForProcess,
  groupActivitiesByPhaseId,
  hydrateActivitiesWithArtifacts,
} from 'app/modules/process-visualization/process-visualization-data.utils';
import { sortSnapshotPhasesByActivityFlow, sortUnifiedActivitiesByFlow } from 'app/shared/util/sort-activities-by-flow.utils';
import { IArtifacts } from 'app/shared/model/artifacts.model';

export type VisualizationSource = 'api' | 'yaml';

export interface UnifiedCatalogEntity {
  ref: string;
  name: string;
  description: string;
  optional?: boolean;
}

export interface UnifiedActivity {
  ref: string;
  name: string;
  description: string;
  inputCriterion: string;
  phaseRef?: string;
  phaseName?: string;
  participantRoles: UnifiedCatalogEntity[];
  responsibleRoles: UnifiedCatalogEntity[];
  tools: UnifiedCatalogEntity[];
  guidelines: UnifiedCatalogEntity[];
  templates: UnifiedCatalogEntity[];
  requiredArtifacts: UnifiedCatalogEntity[];
  producedArtifacts: UnifiedCatalogEntity[];
  subActivities: { ref: string; name: string }[];
  predecessorActivities: { ref: string; name: string }[];
}

export interface UnifiedPhase {
  ref: string;
  name: string;
  description: string;
}

export interface UnifiedActivityUsageRef {
  activityRef: string;
  activityName: string;
  relationKind: ActivityEntityRelationKind;
}

export interface UnifiedIndexedEntity {
  entity: UnifiedCatalogEntity;
  refs: UnifiedActivityUsageRef[];
}

export type UnifiedVisualizationIndexes = Record<LibraryEntityType, Map<string, UnifiedIndexedEntity>>;

export interface ProcessVisualizationUnifiedData {
  source: VisualizationSource;
  processId?: number;
  basePath: string;
  processName: string;
  processDescription: string;
  phases: UnifiedPhase[];
  activities: UnifiedActivity[];
  activitiesByPhaseRef: Map<string, UnifiedActivity[]>;
  activityByRef: Map<string, UnifiedActivity>;
  indexes: UnifiedVisualizationIndexes;
  /** For ActivityCanvas */
  canvasActivities?: IActivity[];
  canvasPhases?: IPhase[];
  canvasPhaseRefs?: string[];
  canvasActivityRefBySyntheticId?: Map<number, string>;
  loading: boolean;
  processMatches: boolean;
  artifactsError: boolean;
  error: boolean;
}

const emptyIndexes = (): UnifiedVisualizationIndexes => ({
  roles: new Map(),
  tools: new Map(),
  guidelines: new Map(),
  templates: new Map(),
  artifacts: new Map(),
});

const upsertUnifiedRef = (map: Map<string, UnifiedIndexedEntity>, entity: UnifiedCatalogEntity, usage: UnifiedActivityUsageRef) => {
  const existing = map.get(entity.ref);
  if (existing) {
    const duplicate = existing.refs.some(item => item.activityRef === usage.activityRef && item.relationKind === usage.relationKind);
    if (!duplicate) {
      existing.refs.push(usage);
    }
    return;
  }
  map.set(entity.ref, { entity, refs: [usage] });
};

export const buildUnifiedIndexes = (activities: UnifiedActivity[]): UnifiedVisualizationIndexes => {
  const indexes = emptyIndexes();

  activities.forEach(activity => {
    const usageBase = { activityRef: activity.ref, activityName: activity.name };

    activity.participantRoles.forEach(entity => {
      upsertUnifiedRef(indexes.roles, entity, { ...usageBase, relationKind: 'participantRole' });
    });
    activity.responsibleRoles.forEach(entity => {
      upsertUnifiedRef(indexes.roles, entity, { ...usageBase, relationKind: 'responsibleRole' });
    });
    activity.tools.forEach(entity => {
      upsertUnifiedRef(indexes.tools, entity, { ...usageBase, relationKind: 'tool' });
    });
    activity.guidelines.forEach(entity => {
      upsertUnifiedRef(indexes.guidelines, entity, { ...usageBase, relationKind: 'guideline' });
    });
    activity.templates.forEach(entity => {
      upsertUnifiedRef(indexes.templates, entity, { ...usageBase, relationKind: 'template' });
    });
    activity.requiredArtifacts.forEach(entity => {
      upsertUnifiedRef(indexes.artifacts, entity, { ...usageBase, relationKind: 'requiredArtifact' });
    });
    activity.producedArtifacts.forEach(entity => {
      upsertUnifiedRef(indexes.artifacts, entity, { ...usageBase, relationKind: 'producedArtifact' });
    });
  });

  return indexes;
};

const catalogFromSnapshot = (items: Record<string, SnapshotCatalogItem>, keys: string[]): UnifiedCatalogEntity[] =>
  keys
    .map(key => items[key])
    .filter((item): item is SnapshotCatalogItem => item !== undefined)
    .map(item => ({
      ref: item.key,
      name: item.name,
      description: item.description,
      optional: item.optional,
    }));

const activityLinks = (snapshot: ProcessSnapshot, keys: string[]): { ref: string; name: string }[] =>
  keys.map(key => ({
    ref: key,
    name: snapshot.activities.find(a => a.key === key)?.name ?? key,
  }));

export const buildUnifiedFromSnapshot = (snapshot: ProcessSnapshot, basePath: string): ProcessVisualizationUnifiedData => {
  const phaseByKey = new Map(snapshot.phases.map(phase => [phase.key, phase]));
  const activities: UnifiedActivity[] = snapshot.activities.map(activity => {
    const phase = activity.phaseKey ? phaseByKey.get(activity.phaseKey) : undefined;
    return {
      ref: activity.key,
      name: activity.name,
      description: activity.description,
      inputCriterion: activity.inputCriterion,
      phaseRef: activity.phaseKey,
      phaseName: phase?.name,
      participantRoles: catalogFromSnapshot(snapshot.roles, activity.participantRoleKeys),
      responsibleRoles: catalogFromSnapshot(snapshot.roles, activity.responsibleRoleKeys),
      tools: catalogFromSnapshot(snapshot.tools, activity.toolKeys),
      guidelines: catalogFromSnapshot(snapshot.guidelines, activity.guidelineKeys),
      templates: catalogFromSnapshot(snapshot.templates, activity.templateKeys),
      requiredArtifacts: catalogFromSnapshot(snapshot.artifacts, activity.requiredArtifactKeys),
      producedArtifacts: catalogFromSnapshot(snapshot.artifacts, activity.producedArtifactKeys),
      subActivities: activityLinks(snapshot, activity.subActivityKeys),
      predecessorActivities: activityLinks(snapshot, activity.predecessorKeys),
    };
  });

  const orderedSnapshotPhases = sortSnapshotPhasesByActivityFlow(snapshot.phases, snapshot.activities);

  const phases: UnifiedPhase[] = orderedSnapshotPhases.map(phase => ({
    ref: phase.key,
    name: phase.name,
    description: phase.description,
  }));

  const activitiesByPhaseRef = new Map<string, UnifiedActivity[]>();
  orderedSnapshotPhases.forEach(phase => {
    const list = phase.activityKeys.map(key => activities.find(a => a.ref === key)).filter((a): a is UnifiedActivity => a !== undefined);
    activitiesByPhaseRef.set(phase.key, sortUnifiedActivitiesByFlow(list));
  });

  const activityByRef = new Map(activities.map(a => [a.ref, a]));

  const canvasActivities = snapshotActivitiesToCanvasModel(snapshot, activities);
  const canvasPhases = orderedSnapshotPhases.map(phase => ({
    id: syntheticIdFromRef(phase.key),
    name: phase.name,
    description: phase.description,
    process: { id: 0 },
  }));
  const canvasActivityRefBySyntheticId = new Map(snapshot.activities.map(activity => [syntheticIdFromRef(activity.key), activity.key]));

  return {
    source: 'yaml',
    basePath,
    processName: snapshot.processName,
    processDescription: snapshot.processDescription,
    phases,
    activities,
    activitiesByPhaseRef,
    activityByRef,
    indexes: buildUnifiedIndexes(activities),
    canvasActivities,
    canvasPhases,
    canvasPhaseRefs: orderedSnapshotPhases.map(p => p.key),
    canvasActivityRefBySyntheticId,
    loading: false,
    processMatches: true,
    artifactsError: false,
    error: false,
  };
};

const toCatalogEntity = (
  ref: string,
  name?: string | null,
  description?: string | null,
  optional?: boolean | null
): UnifiedCatalogEntity => ({
  ref,
  name: name ?? '',
  description: description ?? '',
  optional: optional ?? undefined,
});

export const buildUnifiedFromApi = (params: {
  processId: number;
  process: IProcess;
  phases: IPhase[];
  activities: IActivity[];
  activitiesByPhaseId: Map<number, IActivity[]>;
  loading: boolean;
  processMatches: boolean;
  artifactsError: boolean;
  error: boolean;
}): ProcessVisualizationUnifiedData => {
  const basePath = `/processos/${params.processId}/visualizar`;
  const ref = (id: number) => String(id);

  const phases: UnifiedPhase[] = params.phases
    .filter((phase): phase is IPhase & { id: number } => phase.id !== undefined)
    .map(phase => ({
      ref: ref(phase.id),
      name: phase.name ?? '',
      description: phase.description ?? '',
    }));

  const activities: UnifiedActivity[] = params.activities
    .filter((activity): activity is IActivity & { id: number } => activity.id !== undefined)
    .map(activity => ({
      ref: ref(activity.id),
      name: activity.name ?? '',
      description: activity.description ?? '',
      inputCriterion: activity.inputCriterion ?? '',
      phaseRef: activity.phase?.id !== undefined ? ref(activity.phase.id) : undefined,
      phaseName: activity.phase?.name ?? undefined,
      participantRoles: (activity.participantRoles ?? [])
        .filter((r): r is typeof r & { id: number } => r.id !== undefined)
        .map(r => toCatalogEntity(ref(r.id), r.name, r.description)),
      responsibleRoles: (activity.responsibleRoles ?? [])
        .filter((r): r is typeof r & { id: number } => r.id !== undefined)
        .map(r => toCatalogEntity(ref(r.id), r.name, r.description)),
      tools: (activity.tools ?? [])
        .filter((t): t is typeof t & { id: number } => t.id !== undefined)
        .map(t => toCatalogEntity(ref(t.id), t.name, t.description)),
      guidelines: (activity.guidelines ?? [])
        .filter((g): g is typeof g & { id: number } => g.id !== undefined)
        .map(g => toCatalogEntity(ref(g.id), g.name, g.description)),
      templates: (activity.templates ?? [])
        .filter((t): t is typeof t & { id: number } => t.id !== undefined)
        .map(t => toCatalogEntity(ref(t.id), t.name, t.description)),
      requiredArtifacts: (activity.requiredArtifacts ?? [])
        .filter((a): a is typeof a & { id: number } => a.id !== undefined)
        .map(a => toCatalogEntity(ref(a.id), a.name, a.description, a.optional)),
      producedArtifacts: (activity.producedArtifacts ?? [])
        .filter((a): a is typeof a & { id: number } => a.id !== undefined)
        .map(a => toCatalogEntity(ref(a.id), a.name, a.description, a.optional)),
      subActivities: (activity.subActivities ?? [])
        .filter((a): a is typeof a & { id: number } => a.id !== undefined)
        .map(a => ({ ref: ref(a.id), name: a.name ?? '' })),
      predecessorActivities: (activity.predecessorActivities ?? [])
        .filter((a): a is typeof a & { id: number } => a.id !== undefined)
        .map(a => ({ ref: ref(a.id), name: a.name ?? '' })),
    }));

  const activitiesByPhaseRef = new Map<string, UnifiedActivity[]>();
  params.phases.forEach(phase => {
    if (phase.id === undefined) {
      return;
    }
    const list = (params.activitiesByPhaseId.get(phase.id) ?? [])
      .filter((a): a is IActivity & { id: number } => a.id !== undefined)
      .map(a => activities.find(u => u.ref === ref(a.id)))
      .filter((a): a is UnifiedActivity => a !== undefined);
    activitiesByPhaseRef.set(ref(phase.id), list);
  });

  return {
    source: 'api',
    processId: params.processId,
    basePath,
    processName: params.process.processName ?? '',
    processDescription: params.process.processDescription ?? '',
    phases,
    activities,
    activitiesByPhaseRef,
    activityByRef: new Map(activities.map(a => [a.ref, a])),
    indexes: buildUnifiedIndexes(activities),
    canvasActivities: params.activities,
    canvasPhaseRefs: phases.map(p => p.ref),
    canvasActivityRefBySyntheticId: undefined,
    loading: params.loading,
    processMatches: params.processMatches,
    artifactsError: params.artifactsError,
    error: params.error,
  };
};

/** Stable numeric id from activity ref for React Flow when source is YAML. */
export const snapshotPhasesToCanvasModel = (snapshot: ProcessSnapshot): IPhase[] =>
  snapshot.phases.map(phase => ({
    id: syntheticIdFromRef(phase.key),
    name: phase.name,
    description: phase.description,
    process: { id: 0 },
  }));

export const syntheticIdFromRef = (ref: string): number => {
  let hash = 5381;
  for (let i = 0; i < ref.length; i += 1) {
    hash = (hash * 33 + ref.charCodeAt(i)) % 2147483647;
  }
  return hash || 1;
};

export const snapshotActivitiesToCanvasModel = (snapshot: ProcessSnapshot, unified: UnifiedActivity[]): IActivity[] => {
  const byKey = new Map(unified.map(a => [a.ref, a]));
  const link = (keys: string[]) =>
    keys.map(key => {
      const activity = byKey.get(key);
      return {
        id: syntheticIdFromRef(key),
        name: activity?.name ?? key,
      };
    });

  return snapshot.activities.map(activity => {
    const id = syntheticIdFromRef(activity.key);
    const phaseId = activity.phaseKey ? syntheticIdFromRef(activity.phaseKey) : undefined;
    const phase = activity.phaseKey ? snapshot.phases.find(p => p.key === activity.phaseKey) : undefined;
    return {
      id,
      name: activity.name,
      description: activity.description,
      inputCriterion: activity.inputCriterion,
      phase: phaseId !== undefined ? { id: phaseId, name: phase?.name } : null,
      subActivities: link(activity.subActivityKeys),
      predecessorActivities: link(activity.predecessorKeys),
      participantRoles: catalogFromSnapshot(snapshot.roles, activity.participantRoleKeys).map(r => ({
        id: syntheticIdFromRef(r.ref),
        name: r.name,
      })),
      responsibleRoles: catalogFromSnapshot(snapshot.roles, activity.responsibleRoleKeys).map(r => ({
        id: syntheticIdFromRef(r.ref),
        name: r.name,
      })),
      tools: catalogFromSnapshot(snapshot.tools, activity.toolKeys).map(t => ({ id: syntheticIdFromRef(t.ref), name: t.name })),
      guidelines: catalogFromSnapshot(snapshot.guidelines, activity.guidelineKeys).map(g => ({
        id: syntheticIdFromRef(g.ref),
        name: g.name,
      })),
      templates: catalogFromSnapshot(snapshot.templates, activity.templateKeys).map(t => ({
        id: syntheticIdFromRef(t.ref),
        name: t.name,
      })),
      requiredArtifacts: catalogFromSnapshot(snapshot.artifacts, activity.requiredArtifactKeys).map(a => ({
        id: syntheticIdFromRef(a.ref),
        name: a.name,
        optional: a.optional,
      })),
      producedArtifacts: catalogFromSnapshot(snapshot.artifacts, activity.producedArtifactKeys).map(a => ({
        id: syntheticIdFromRef(a.ref),
        name: a.name,
        optional: a.optional,
      })),
    };
  });
};

export const buildUnifiedFromApiStores = (
  processId: number,
  process: IProcess,
  phaseEntities: IPhase[],
  activityEntities: IActivity[],
  artifacts: IArtifacts[],
  loading: boolean,
  processMatches: boolean,
  artifactsError: boolean,
  error: boolean
): ProcessVisualizationUnifiedData => {
  const phases = filterPhasesForProcess(processId, phaseEntities, activityEntities);
  const activities = hydrateActivitiesWithArtifacts(filterActivitiesForPhases(phases, activityEntities), artifacts);
  const activitiesByPhaseId = groupActivitiesByPhaseId(phases, activities);
  return buildUnifiedFromApi({
    processId,
    process,
    phases,
    activities,
    activitiesByPhaseId,
    loading,
    processMatches,
    artifactsError,
    error,
  });
};

export const sortedUnifiedIndexedEntities = (map: Map<string, UnifiedIndexedEntity>): UnifiedIndexedEntity[] =>
  [...map.values()].sort((left, right) => left.entity.name.localeCompare(right.entity.name, undefined, { sensitivity: 'base' }));
