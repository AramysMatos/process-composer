export interface SnapshotCatalogItem {
  key: string;
  name: string;
  description: string;
  optional?: boolean;
}

export interface SnapshotActivity {
  key: string;
  name: string;
  description: string;
  inputCriterion: string;
  phaseKey?: string;
  toolKeys: string[];
  guidelineKeys: string[];
  templateKeys: string[];
  requiredArtifactKeys: string[];
  producedArtifactKeys: string[];
  participantRoleKeys: string[];
  responsibleRoleKeys: string[];
  subActivityKeys: string[];
  predecessorKeys: string[];
}

export interface SnapshotPhase {
  key: string;
  name: string;
  description: string;
  activityKeys: string[];
}

export interface ProcessSnapshot {
  processName: string;
  processDescription: string;
  phases: SnapshotPhase[];
  activities: SnapshotActivity[];
  roles: Record<string, SnapshotCatalogItem>;
  tools: Record<string, SnapshotCatalogItem>;
  guidelines: Record<string, SnapshotCatalogItem>;
  templates: Record<string, SnapshotCatalogItem>;
  artifacts: Record<string, SnapshotCatalogItem>;
}
