import { dump } from 'js-yaml';

import { IActivity } from 'app/shared/model/activity.model';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { IGuidelines } from 'app/shared/model/guidelines.model';
import { IPhase } from 'app/shared/model/phase.model';
import { IProcess } from 'app/shared/model/process.model';
import { IRoles } from 'app/shared/model/roles.model';
import { ITemplates } from 'app/shared/model/templates.model';
import { ITools } from 'app/shared/model/tools.model';

type NamedEntity = { id?: number; name?: string | null; description?: string | null };

const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

class YamlKeyRegistry {
  private readonly usedKeys = new Set<string>();

  phaseKey(phase: IPhase): string {
    return this.reserve(`phase_${phase.id ?? 0}`);
  }

  entityKey(entity: NamedEntity, fallbackPrefix: string): string {
    const base = slugify(entity.name ?? '') || `${fallbackPrefix}_${entity.id ?? 0}`;
    return this.reserve(base, entity.id);
  }

  private reserve(base: string, id?: number): string {
    if (!this.usedKeys.has(base)) {
      this.usedKeys.add(base);
      return base;
    }

    if (id !== undefined) {
      const withId = `${base}_${id}`;
      if (!this.usedKeys.has(withId)) {
        this.usedKeys.add(withId);
        return withId;
      }
    }

    let counter = 2;
    let candidate = `${base}_${counter}`;
    while (this.usedKeys.has(candidate)) {
      counter += 1;
      candidate = `${base}_${counter}`;
    }

    this.usedKeys.add(candidate);
    return candidate;
  }
}

const sortById = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

const uniqueById = <T extends { id?: number }>(items: T[]): T[] => {
  const seen = new Map<number, T>();

  items.forEach(item => {
    if (item.id !== undefined) {
      seen.set(item.id, item);
    }
  });

  return sortById([...seen.values()]);
};

const mapEntityKeys = <T extends NamedEntity>(
  items: T[] | null | undefined,
  registry: YamlKeyRegistry,
  fallbackPrefix: string,
  keyMap: Map<number, string>
): string[] =>
  (items ?? []).map(item => (item.id !== undefined ? keyMap.get(item.id) : undefined) ?? registry.entityKey(item, fallbackPrefix));

const buildCatalogSection = <T extends NamedEntity>(
  items: T[],
  registry: YamlKeyRegistry,
  fallbackPrefix: string,
  keyMap: Map<number, string>,
  extraFields?: (item: T) => Record<string, unknown>
): Record<string, Record<string, unknown>> => {
  const section: Record<string, Record<string, unknown>> = {};

  sortById(items).forEach(item => {
    if (item.id === undefined) {
      return;
    }

    const key = registry.entityKey(item, fallbackPrefix);
    keyMap.set(item.id, key);
    section[key] = {
      name: item.name ?? '',
      description: item.description ?? '',
      ...(extraFields?.(item) ?? {}),
    };
  });

  return section;
};

export const buildProcessYaml = (process: IProcess, phases: IPhase[], activities: IActivity[]): string => {
  const sortedPhases = sortById(phases.filter(phase => phase.process?.id === process.id));
  const phaseIds = new Set(sortedPhases.map(phase => phase.id).filter((id): id is number => id !== undefined));
  const processActivities = sortById(activities.filter(activity => activity.phase?.id !== undefined && phaseIds.has(activity.phase.id)));

  const registry = new YamlKeyRegistry();
  const phaseKeys = new Map<number, string>();
  const activityKeys = new Map<number, string>();
  const toolKeys = new Map<number, string>();
  const roleKeys = new Map<number, string>();
  const guidelineKeys = new Map<number, string>();
  const templateKeys = new Map<number, string>();
  const artifactKeys = new Map<number, string>();

  sortedPhases.forEach(phase => {
    if (phase.id !== undefined) {
      phaseKeys.set(phase.id, registry.phaseKey(phase));
    }
  });

  processActivities.forEach(activity => {
    if (activity.id !== undefined) {
      activityKeys.set(activity.id, registry.entityKey(activity, 'activity'));
    }
  });

  const tools = uniqueById(processActivities.flatMap(activity => activity.tools ?? []));
  const roles = uniqueById([
    ...processActivities.flatMap(activity => activity.participantRoles ?? []),
    ...processActivities.flatMap(activity => activity.responsibleRoles ?? []),
  ]);
  const guidelines = uniqueById(processActivities.flatMap(activity => activity.guidelines ?? []));
  const templates = uniqueById([
    ...processActivities.flatMap(activity => activity.templates ?? []),
    ...uniqueById(
      processActivities.flatMap(activity => [...(activity.requiredArtifacts ?? []), ...(activity.producedArtifacts ?? [])])
    ).flatMap(artifact => artifact.templates ?? []),
  ]);
  const artifacts = uniqueById([
    ...processActivities.flatMap(activity => activity.requiredArtifacts ?? []),
    ...processActivities.flatMap(activity => activity.producedArtifacts ?? []),
  ]);

  const toolsSection = buildCatalogSection(tools, registry, 'tool', toolKeys);
  const rolesSection = buildCatalogSection(roles, registry, 'role', roleKeys);
  const guidelinesSection = buildCatalogSection(guidelines, registry, 'guideline', guidelineKeys);
  const templatesSection = buildCatalogSection(templates, registry, 'template', templateKeys);
  const artifactsSection = buildCatalogSection(artifacts, registry, 'artifact', artifactKeys, artifact => ({
    optional: artifact.optional ?? false,
    templates: mapEntityKeys(artifact.templates, registry, 'template', templateKeys),
  }));

  const activitiesSection: Record<string, Record<string, unknown>> = {};
  processActivities.forEach(activity => {
    if (activity.id === undefined) {
      return;
    }

    const key = activityKeys.get(activity.id);
    if (!key) {
      return;
    }
    const predecessors = mapEntityKeys(
      (activity.predecessorActivities ?? []).filter(predecessor => predecessor.id !== undefined && activityKeys.has(predecessor.id)),
      registry,
      'activity',
      activityKeys
    );
    const subActivities = mapEntityKeys(
      (activity.subActivities ?? []).filter(subActivity => subActivity.id !== undefined && activityKeys.has(subActivity.id)),
      registry,
      'activity',
      activityKeys
    );

    activitiesSection[key] = {
      name: activity.name ?? '',
      description: activity.description ?? '',
      input_criterion: activity.inputCriterion ?? '',
      tools: mapEntityKeys(activity.tools, registry, 'tool', toolKeys),
      required_artifacts: mapEntityKeys(activity.requiredArtifacts, registry, 'artifact', artifactKeys),
      produced_artifacts: mapEntityKeys(activity.producedArtifacts, registry, 'artifact', artifactKeys),
      templates: mapEntityKeys(activity.templates, registry, 'template', templateKeys),
      guidelines: mapEntityKeys(activity.guidelines, registry, 'guideline', guidelineKeys),
      participant_roles: mapEntityKeys(activity.participantRoles, registry, 'role', roleKeys),
      responsible_roles: mapEntityKeys(activity.responsibleRoles, registry, 'role', roleKeys),
      sub_activities: subActivities,
      ...(predecessors.length === 1 ? { predecessor: predecessors[0] } : predecessors.length > 1 ? { predecessor: predecessors } : {}),
    };
  });

  const phasesSection: Record<string, Record<string, unknown>> = {};
  sortedPhases.forEach(phase => {
    if (phase.id === undefined) {
      return;
    }

    const key = phaseKeys.get(phase.id);
    if (!key) {
      return;
    }

    const phaseActivityKeys = processActivities
      .filter(activity => activity.phase?.id === phase.id && activity.id !== undefined)
      .map(activity => activityKeys.get(activity.id))
      .filter((activityKey): activityKey is string => activityKey !== undefined);

    phasesSection[key] = {
      name: phase.name ?? '',
      description: phase.description ?? '',
      activities: phaseActivityKeys,
    };
  });

  const document = {
    process_name: process.processName ?? '',
    process_description: process.processDescription ?? '',
    phases: phasesSection,
    activities: activitiesSection,
    artifacts: artifactsSection,
    tools: toolsSection,
    guidelines: guidelinesSection,
    roles: rolesSection,
    templates: templatesSection,
  };

  return dump(document, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
};
