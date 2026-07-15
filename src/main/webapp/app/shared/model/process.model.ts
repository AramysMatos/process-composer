import { IPhase } from 'app/shared/model/phase.model';
import { IProject } from 'app/shared/model/project.model';

export interface IProcess {
  id?: number;
  processName?: string | null;
  processDescription?: string | null;
  phases?: IPhase[] | null;
  projects?: IProject[] | null;
}

export const defaultValue: Readonly<IProcess> = {};
