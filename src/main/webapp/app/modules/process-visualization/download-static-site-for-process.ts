import axios from 'axios';

import { buildProcessYaml } from 'app/modules/process-export/build-process-yaml';
import { downloadProcessSiteZip } from 'app/modules/process-visualization/generate-process-site-zip';
import { dumpProcessSnapshotYaml, parseProcessYaml } from 'app/modules/process-visualization/parse-process-yaml';
import { ProcessSnapshot } from 'app/modules/process-visualization/process-snapshot.model';
import { IActivity } from 'app/shared/model/activity.model';
import { IArtifacts } from 'app/shared/model/artifacts.model';
import { IPhase } from 'app/shared/model/phase.model';
import { IProcess } from 'app/shared/model/process.model';

const sortById = <T extends { id?: number }>(items: T[]): T[] => [...items].sort((left, right) => (left.id ?? 0) - (right.id ?? 0));

const hydrateActivitiesWithArtifacts = (activities: IActivity[], artifacts: IArtifacts[]): IActivity[] => {
  const artifactById = new Map(artifacts.flatMap(artifact => (artifact.id !== undefined ? [[artifact.id, artifact] as const] : [])));

  const hydrateArtifactList = (items?: IArtifacts[] | null) =>
    (items ?? []).map(item => (item.id !== undefined ? artifactById.get(item.id) ?? item : item));

  return activities.map(activity => ({
    ...activity,
    requiredArtifacts: hydrateArtifactList(activity.requiredArtifacts),
    producedArtifacts: hydrateArtifactList(activity.producedArtifacts),
  }));
};

export const downloadStaticSiteForProcessId = async (processId: number): Promise<void> => {
  const cacheBuster = Date.now();
  const [processResponse, phasesResponse, activitiesResponse, artifactsResponse] = await Promise.all([
    axios.get<IProcess>(`api/processes/${processId}`),
    axios.get<IPhase[]>(`api/phases?cacheBuster=${cacheBuster}`),
    axios.get<IActivity[]>(`api/activities?eagerload=true&cacheBuster=${cacheBuster}`),
    axios.get<IArtifacts[]>(`api/artifacts?eagerload=true&cacheBuster=${cacheBuster}`),
  ]);

  const process = processResponse.data;
  const phases = sortById(phasesResponse.data.filter(phase => phase.process?.id === processId));
  const phaseIds = new Set(phases.map(phase => phase.id).filter((id): id is number => id !== undefined));
  const activities = hydrateActivitiesWithArtifacts(
    activitiesResponse.data.filter(activity => activity.phase?.id !== undefined && phaseIds.has(activity.phase.id)),
    artifactsResponse.data
  );

  const yamlContent = buildProcessYaml(process, phases, activities);
  const snapshot = parseProcessYaml(yamlContent);
  await downloadProcessSiteZip(yamlContent, snapshot);
};

export const downloadStaticSiteFromSnapshot = async (snapshot: ProcessSnapshot): Promise<void> => {
  const yamlContent = dumpProcessSnapshotYaml(snapshot);
  await downloadProcessSiteZip(yamlContent, snapshot);
};
