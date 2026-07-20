import { AppDispatch } from 'app/config/store';
import { getEntity as getActivity } from 'app/entities/activity/activity.reducer';
import { cloneActivity } from 'app/modules/process-design/clone-activity';

export async function duplicateActivity(dispatch: AppDispatch, activityId: number): Promise<number> {
  const { data: source } = await dispatch(getActivity(activityId)).unwrap();

  return cloneActivity(dispatch, {
    sourceActivityId: activityId,
    targetPhaseId: source.phase?.id ?? null,
    copyDependencies: true,
  });
}
