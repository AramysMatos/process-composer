import { AppDispatch } from 'app/config/store';
import { getEntity as getActivity } from 'app/entities/activity/activity.reducer';
import { getEntity as getPhase } from 'app/entities/phase/phase.reducer';
import { cloneActivity } from 'app/modules/process-design/clone-activity';
import { clonePhase } from 'app/modules/process-design/clone-phase';

export async function saveActivityToLibrary(dispatch: AppDispatch, sourceActivityId: number): Promise<number> {
  const { data: source } = await dispatch(getActivity(sourceActivityId)).unwrap();

  return cloneActivity(dispatch, {
    sourceActivityId,
    targetPhaseId: null,
    name: source.name ?? undefined,
  });
}

export async function savePhaseToLibrary(dispatch: AppDispatch, sourcePhaseId: number): Promise<number> {
  const { data: source } = await dispatch(getPhase(sourcePhaseId)).unwrap();

  return clonePhase(dispatch, {
    sourcePhaseId,
    targetProcessId: null,
    name: source.name ?? undefined,
    copyActivities: true,
  });
}
