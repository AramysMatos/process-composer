import { IActivity } from 'app/shared/model/activity.model';
import { IPhase } from 'app/shared/model/phase.model';

export const countPhasesForProcess = (processId: number | undefined, phases: IPhase[]): number => {
  if (!processId) {
    return 0;
  }
  return phases.filter(phase => phase.process?.id === processId).length;
};

export const countActivitiesForProcess = (processId: number | undefined, phases: IPhase[], activities: IActivity[]): number => {
  if (!processId) {
    return 0;
  }

  const phaseIds = new Set(
    phases.filter(phase => phase.process?.id === processId && phase.id !== undefined).map(phase => phase.id as number)
  );

  return activities.filter(activity => activity.phase?.id !== undefined && phaseIds.has(activity.phase.id)).length;
};

export const countRoles = (activity: IActivity): number => {
  const roleIds = new Set<number>();
  activity.participantRoles?.forEach(role => {
    if (role.id !== undefined) {
      roleIds.add(role.id);
    }
  });
  activity.responsibleRoles?.forEach(role => {
    if (role.id !== undefined) {
      roleIds.add(role.id);
    }
  });
  return roleIds.size;
};

export const countArtifacts = (activity: IActivity): number => {
  const artifactIds = new Set<number>();
  activity.requiredArtifacts?.forEach(artifact => {
    if (artifact.id !== undefined) {
      artifactIds.add(artifact.id);
    }
  });
  activity.producedArtifacts?.forEach(artifact => {
    if (artifact.id !== undefined) {
      artifactIds.add(artifact.id);
    }
  });
  return artifactIds.size;
};
