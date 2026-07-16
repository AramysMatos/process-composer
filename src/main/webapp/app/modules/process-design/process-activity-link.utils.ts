import { IActivity } from 'app/shared/model/activity.model';

export const PROCESS_ACTIVITY_QUERY_PARAM = 'activityId';

export function buildProcessActivityLink(processId: number, activityId: number): string {
  return `/processos/${processId}?${PROCESS_ACTIVITY_QUERY_PARAM}=${activityId}`;
}

export function parseProcessActivityId(search: string): number | undefined {
  const params = new URLSearchParams(search);
  const raw = params.get(PROCESS_ACTIVITY_QUERY_PARAM);
  if (!raw) {
    return undefined;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function findActivityPhaseId(activityId: number, activities: IActivity[], phaseIds: ReadonlySet<number>): number | undefined {
  const activity = activities.find(item => item.id === activityId);
  const phaseId = activity?.phase?.id;
  if (!phaseId || !phaseIds.has(phaseId)) {
    return undefined;
  }

  return phaseId;
}
