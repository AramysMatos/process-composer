import { IProcess } from 'app/shared/model/process.model';
import { IPhase } from 'app/shared/model/phase.model';
import { countPhasesForProcess } from 'app/shared/util/process-stats.utils';

export type ProcessSortOption = 'recent' | 'name' | 'phases';

export const applySectionProcessing = (
  processes: IProcess[],
  trimmedSearch: string,
  sortOption: ProcessSortOption,
  phases: IPhase[],
  paginateClientSide: boolean,
  activePage: number,
  itemsPerPage: number
): { displayed: IProcess[]; totalItems: number } => {
  let result = processes;

  if (trimmedSearch.length > 0) {
    const normalizedQuery = trimmedSearch.toLowerCase();
    result = result.filter(process => process.processName?.toLowerCase().includes(normalizedQuery));
  }

  if (sortOption === 'phases') {
    result = [...result].sort((left, right) => countPhasesForProcess(right.id, phases) - countPhasesForProcess(left.id, phases));
  }

  const totalItems = result.length;

  if (paginateClientSide) {
    const start = (activePage - 1) * itemsPerPage;
    return { displayed: result.slice(start, start + itemsPerPage), totalItems };
  }

  return { displayed: result, totalItems };
};
