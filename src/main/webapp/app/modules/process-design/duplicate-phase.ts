import { AppDispatch } from 'app/config/store';
import { getEntity as getPhase } from 'app/entities/phase/phase.reducer';
import { clonePhase } from 'app/modules/process-design/clone-phase';

export async function duplicatePhase(dispatch: AppDispatch, phaseId: number): Promise<number> {
  const { data: source } = await dispatch(getPhase(phaseId)).unwrap();

  return clonePhase(dispatch, {
    sourcePhaseId: phaseId,
    targetProcessId: source.process?.id ?? null,
    copyActivities: true,
  });
}
