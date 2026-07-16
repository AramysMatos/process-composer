import { useCallback, useState } from 'react';

import { useAppDispatch } from 'app/config/store';
import { deleteEntity as deleteActivity, getEntities as getActivityEntities } from 'app/entities/activity/activity.reducer';
import { deleteEntity as deletePhase, getEntities as getPhaseEntities } from 'app/entities/phase/phase.reducer';

export type ProcessDeleteTarget =
  | { type: 'phase'; id: number; name: string; activityCount?: number }
  | { type: 'activity'; id: number; name: string };

interface UseProcessEntityDeleteOptions {
  onActivityDeleted?: (activityId: number) => void;
  onPhaseDeleted?: (phaseId: number) => void;
}

export function useProcessEntityDelete({ onActivityDeleted, onPhaseDeleted }: UseProcessEntityDeleteOptions = {}) {
  const dispatch = useAppDispatch();
  const [deleteTarget, setDeleteTarget] = useState<ProcessDeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const requestDelete = useCallback((target: ProcessDeleteTarget) => {
    setDeleteTarget(target);
  }, []);

  const cancelDelete = useCallback(() => {
    if (!deleting) {
      setDeleteTarget(null);
    }
  }, [deleting]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      if (deleteTarget.type === 'phase') {
        await dispatch(deletePhase(deleteTarget.id)).unwrap();
        dispatch(getPhaseEntities({}));
        onPhaseDeleted?.(deleteTarget.id);
      } else {
        await dispatch(deleteActivity(deleteTarget.id)).unwrap();
        dispatch(getActivityEntities({ eagerload: true }));
        onActivityDeleted?.(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch {
      // Modal stays open so the user can retry or cancel.
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, dispatch, onActivityDeleted, onPhaseDeleted]);

  return { deleteTarget, requestDelete, cancelDelete, confirmDelete, deleting };
}
