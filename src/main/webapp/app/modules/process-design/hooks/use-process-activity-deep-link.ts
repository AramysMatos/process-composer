import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { IActivity } from 'app/shared/model/activity.model';
import {
  findActivityPhaseId,
  parseProcessActivityId,
  PROCESS_ACTIVITY_QUERY_PARAM,
} from 'app/modules/process-design/process-activity-link.utils';

interface UseProcessActivityDeepLinkOptions {
  processId: number;
  loading: boolean;
  processMatches: boolean;
  activities: IActivity[];
  phaseIds: ReadonlySet<number>;
  onOpenActivity: (activityId: number, phaseId: number) => void;
}

export function useProcessActivityDeepLink({
  processId,
  loading,
  processMatches,
  activities,
  phaseIds,
  onOpenActivity,
}: UseProcessActivityDeepLinkOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedActivityIdRef = useRef<number | null>(null);

  const activityIdFromUrl = parseProcessActivityId(searchParams.toString());

  useEffect(() => {
    appliedActivityIdRef.current = null;
  }, [processId]);

  useEffect(() => {
    if (!activityIdFromUrl) {
      appliedActivityIdRef.current = null;
      return;
    }

    if (loading || !processMatches) {
      return;
    }

    if (appliedActivityIdRef.current === activityIdFromUrl) {
      return;
    }

    const phaseId = findActivityPhaseId(activityIdFromUrl, activities, phaseIds);
    if (!phaseId) {
      return;
    }

    appliedActivityIdRef.current = activityIdFromUrl;
    onOpenActivity(activityIdFromUrl, phaseId);
  }, [activities, activityIdFromUrl, loading, onOpenActivity, phaseIds, processMatches]);

  const clearActivityFromUrl = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete(PROCESS_ACTIVITY_QUERY_PARAM);
    setSearchParams(next, { replace: true });
    appliedActivityIdRef.current = null;
  }, [searchParams, setSearchParams]);

  return { activityIdFromUrl, clearActivityFromUrl };
}
