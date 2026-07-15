import { ITask } from 'app/shared/model/task.model';
import { IProcess } from 'app/shared/model/process.model';

export interface IProject {
  id?: number;
  name?: string | null;
  description?: string | null;
  gitHubToken?: string | null;
  gitHubRepository?: string | null;
  gitHubNodeId?: string | null;
  tasks?: ITask[] | null;
  process?: IProcess | null;
}

export const defaultValue: Readonly<IProject> = {};
