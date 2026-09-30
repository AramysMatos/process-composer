import { load } from 'js-yaml';

import { ProcessSnapshot, SnapshotActivity, SnapshotCatalogItem, SnapshotPhase } from './process-snapshot.model';

type YamlRecord = Record<string, unknown>;

const asRecord = (value: unknown): YamlRecord | undefined =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as YamlRecord) : undefined;

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const asStringArray = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

const parseCatalog = (section: unknown): Record<string, SnapshotCatalogItem> => {
  const record = asRecord(section) ?? {};
  const result: Record<string, SnapshotCatalogItem> = {};
  Object.entries(record).forEach(([key, raw]) => {
    const item = asRecord(raw);
    if (!item) {
      return;
    }
    result[key] = {
      key,
      name: asString(item.name),
      description: asString(item.description),
      optional: item.optional === true,
    };
  });
  return result;
};

const parseActivities = (section: unknown, phaseKeyByActivityKey: Map<string, string>): SnapshotActivity[] => {
  const record = asRecord(section) ?? {};
  return Object.entries(record).map(([key, raw]) => {
    const item = asRecord(raw) ?? {};
    const predecessor = item.predecessor;
    const predecessorKeys = predecessor !== undefined ? asStringArray(predecessor) : [];
    return {
      key,
      name: asString(item.name),
      description: asString(item.description),
      inputCriterion: asString(item.input_criterion),
      phaseKey: phaseKeyByActivityKey.get(key),
      toolKeys: asStringArray(item.tools),
      guidelineKeys: asStringArray(item.guidelines),
      templateKeys: asStringArray(item.templates),
      requiredArtifactKeys: asStringArray(item.required_artifacts),
      producedArtifactKeys: asStringArray(item.produced_artifacts),
      participantRoleKeys: asStringArray(item.participant_roles),
      responsibleRoleKeys: asStringArray(item.responsible_roles),
      subActivityKeys: asStringArray(item.sub_activities),
      predecessorKeys,
    };
  });
};

const parsePhases = (section: unknown): SnapshotPhase[] => {
  const record = asRecord(section) ?? {};
  return Object.entries(record).map(([key, raw]) => {
    const item = asRecord(raw) ?? {};
    return {
      key,
      name: asString(item.name),
      description: asString(item.description),
      activityKeys: asStringArray(item.activities),
    };
  });
};

export class ProcessYamlParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcessYamlParseError';
  }
}

export const parseProcessYaml = (yamlContent: string): ProcessSnapshot => {
  let document: unknown;
  try {
    document = load(yamlContent);
  } catch {
    throw new ProcessYamlParseError('Invalid YAML syntax.');
  }

  const root = asRecord(document);
  if (!root) {
    throw new ProcessYamlParseError('YAML root must be an object.');
  }

  const phases = parsePhases(root.phases);
  const phaseKeyByActivityKey = new Map<string, string>();
  phases.forEach(phase => {
    phase.activityKeys.forEach(activityKey => {
      phaseKeyByActivityKey.set(activityKey, phase.key);
    });
  });

  const activities = parseActivities(root.activities, phaseKeyByActivityKey);

  return {
    processName: asString(root.process_name),
    processDescription: asString(root.process_description),
    phases,
    activities,
    roles: parseCatalog(root.roles),
    tools: parseCatalog(root.tools),
    guidelines: parseCatalog(root.guidelines),
    templates: parseCatalog(root.templates),
    artifacts: parseCatalog(root.artifacts),
  };
};

export const serializeProcessSnapshot = (snapshot: ProcessSnapshot): string => JSON.stringify(snapshot);

export const deserializeProcessSnapshot = (json: string): ProcessSnapshot => JSON.parse(json) as ProcessSnapshot;
