import { ProcessSnapshot } from 'app/modules/process-visualization/process-snapshot.model';
import { deserializeProcessSnapshot, serializeProcessSnapshot } from 'app/modules/process-visualization/parse-process-yaml';

export const YAML_SNAPSHOT_SESSION_KEY = 'processComposerApp.processVisualization.yamlSnapshot';

export const saveYamlSnapshotToSession = (snapshot: ProcessSnapshot): void => {
  sessionStorage.setItem(YAML_SNAPSHOT_SESSION_KEY, serializeProcessSnapshot(snapshot));
};

export const loadYamlSnapshotFromSession = (): ProcessSnapshot | null => {
  const raw = sessionStorage.getItem(YAML_SNAPSHOT_SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return deserializeProcessSnapshot(raw);
  } catch {
    return null;
  }
};

export const clearYamlSnapshotSession = (): void => {
  sessionStorage.removeItem(YAML_SNAPSHOT_SESSION_KEY);
};
