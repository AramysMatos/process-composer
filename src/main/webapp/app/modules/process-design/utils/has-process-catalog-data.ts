import { IPhase } from 'app/shared/model/phase.model';

/**
 * True when Redux already has list data for this process (phases loaded for processId).
 * Activities may still be empty (new phase); activity list is loaded together when refetch runs.
 */
export function hasProcessCatalogData(processId: number, phaseEntities: ReadonlyArray<IPhase>): boolean {
  return phaseEntities.some(phase => phase.process?.id === processId);
}
